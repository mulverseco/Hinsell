"""
Transaction management models for sales, purchases, payments, and ledger entries.
Handles all business transactions with comprehensive validation and audit trails.
"""
import logging
from decimal import Decimal
from django.db import models, transaction
from django.core.validators import MinValueValidator,MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.core_apps.general import AuditableModel
from apps.core_apps.validators import validate_positive_decimal

logger = logging.getLogger(__name__)


class TransactionType(AuditableModel):
    """
    Define different types of transactions in the system.
    """
    
    class TransactionCategory(models.TextChoices):
        SALES = 'sales', _('Sales')
        PURCHASE = 'purchase', _('Purchase')
        PAYMENT = 'payment', _('Payment')
        RECEIPT = 'receipt', _('Receipt')
        JOURNAL = 'journal', _('Journal Entry')
        ADJUSTMENT = 'adjustment', _('Inventory Adjustment')
        TRANSFER = 'transfer', _('Transfer')
    
    branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.CASCADE,
        related_name='transaction_types',
        verbose_name=_("Branch")
    )
    
    type_code = models.CharField(
        max_length=10,
        verbose_name=_("Type Code"),
        help_text=_("Unique transaction type code")
    )
    
    type_name = models.CharField(
        max_length=100,
        verbose_name=_("Type Name"),
        help_text=_("Transaction type display name")
    )
    
    category = models.CharField(
        max_length=20,
        choices=TransactionCategory.choices,
        verbose_name=_("Category"),
        help_text=_("Transaction category")
    )
    
    affects_inventory = models.BooleanField(
        default=True,
        verbose_name=_("Affects Inventory"),
        help_text=_("Whether this transaction type affects inventory")
    )
    
    affects_accounts = models.BooleanField(
        default=True,
        verbose_name=_("Affects Accounts"),
        help_text=_("Whether this transaction type affects account balances")
    )
    
    requires_approval = models.BooleanField(
        default=False,
        verbose_name=_("Requires Approval"),
        help_text=_("Whether transactions of this type require approval")
    )
    
    auto_post = models.BooleanField(
        default=True,
        verbose_name=_("Auto Post"),
        help_text=_("Whether to automatically post transactions of this type")
    )
    
    default_debit_account = models.ForeignKey(
        'accounting.Account',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='debit_transaction_types',
        verbose_name=_("Default Debit Account")
    )
    
    default_credit_account = models.ForeignKey(
        'accounting.Account',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='credit_transaction_types',
        verbose_name=_("Default Credit Account")
    )
    
    class Meta:
        verbose_name = _("Transaction Type")
        verbose_name_plural = _("Transaction Types")
        unique_together = [
            ['branch', 'type_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.type_code} - {self.type_name}"


class TransactionHeader(AuditableModel):
    """
    Header information for all transactions with comprehensive tracking.
    """
    
    class TransactionStatus(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PENDING = 'pending', _('Pending Approval')
        APPROVED = 'approved', _('Approved')
        POSTED = 'posted', _('Posted')
        CANCELLED = 'cancelled', _('Cancelled')
        REVERSED = 'reversed', _('Reversed')
    
    branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.CASCADE,
        related_name='transaction_headers',
        verbose_name=_("Branch")
    )
    
    transaction_type = models.ForeignKey(
        TransactionType,
        on_delete=models.PROTECT,
        related_name='transactions',
        verbose_name=_("Transaction Type")
    )
    
    transaction_number = models.CharField(
        max_length=50,
        verbose_name=_("Transaction Number"),
        help_text=_("Unique transaction number")
    )
    
    reference_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Reference Number"),
        help_text=_("External reference number")
    )
    
    transaction_date = models.DateField(
        default=timezone.now,
        verbose_name=_("Transaction Date"),
        help_text=_("Date of the transaction")
    )
    
    due_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Due Date"),
        help_text=_("Payment due date (for credit transactions)")
    )
    
    status = models.CharField(
        max_length=10,
        choices=TransactionStatus.choices,
        default=TransactionStatus.DRAFT,
        verbose_name=_("Status"),
        help_text=_("Current transaction status")
    )
    
    customer_account = models.ForeignKey(
        'accounting.Account',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='customer_transactions',
        verbose_name=_("Customer Account"),
        help_text=_("Customer account for sales transactions")
    )
    
    supplier_account = models.ForeignKey(
        'accounting.Account',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='supplier_transactions',
        verbose_name=_("Supplier Account"),
        help_text=_("Supplier account for purchase transactions")
    )
    
    currency = models.ForeignKey(
        'accounting.Currency',
        on_delete=models.PROTECT,
        related_name='transactions',
        verbose_name=_("Currency"),
        help_text=_("Transaction currency")
    )
    
    exchange_rate = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[validate_positive_decimal],
        verbose_name=_("Exchange Rate"),
        help_text=_("Exchange rate at time of transaction")
    )
    
    subtotal_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Subtotal Amount"),
        help_text=_("Subtotal before taxes and discounts")
    )
    
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Discount Amount"),
        help_text=_("Total discount amount")
    )
    
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Tax Amount"),
        help_text=_("Total tax amount")
    )
    
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Total Amount"),
        help_text=_("Final total amount")
    )
    
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Paid Amount"),
        help_text=_("Amount already paid")
    )
    
    payment_terms = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Payment Terms"),
        help_text=_("Payment terms description")
    )
    
    credit_days = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Credit Days"),
        help_text=_("Number of credit days allowed")
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes"),
        help_text=_("Additional notes or comments")
    )
    
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_("Internal Notes"),
        help_text=_("Internal notes (not visible to customers)")
    )
    

    approved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_transactions',
        verbose_name=_("Approved By"),
        help_text=_("User who approved this transaction")
    )
    
    approved_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Approved At"),
        help_text=_("Timestamp when transaction was approved")
    )
    
    posted_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_transactions',
        verbose_name=_("Posted By"),
        help_text=_("User who posted this transaction")
    )
    
    posted_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Posted At"),
        help_text=_("Timestamp when transaction was posted")
    )
    
    reversed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reversed_transactions',
        verbose_name=_("Reversed By"),
        help_text=_("User who reversed this transaction")
    )
    
    reversed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Reversed At"),
        help_text=_("Timestamp when transaction was reversed")
    )
    
    reversal_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Reversal Reason"),
        help_text=_("Reason for transaction reversal")
    )
    
    class Meta:
        verbose_name = _("Transaction Header")
        verbose_name_plural = _("Transaction Headers")
        unique_together = [
            ['branch', 'transaction_number']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['transaction_number']),
            models.Index(fields=['reference_number']),
            models.Index(fields=['transaction_date']),
            models.Index(fields=['due_date']),
            models.Index(fields=['status']),
            models.Index(fields=['customer_account']),
            models.Index(fields=['supplier_account']),
            models.Index(fields=['total_amount']),
            models.Index(fields=['posted_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(exchange_rate__gt=0),
                name='transaction_positive_exchange_rate'
            ),
            models.CheckConstraint(
                check=models.Q(paid_amount__lte=models.F('total_amount')),
                name='paid_not_exceeding_total'
            )
        ]
    
    def clean(self):
        """Custom validation for transaction header."""
        super().clean()
        
        if not self.transaction_number.strip():
            raise ValidationError({
                'transaction_number': _('Transaction number cannot be empty.')
            })
        
        if self.due_date and self.due_date < self.transaction_date:
            raise ValidationError({
                'due_date': _('Due date cannot be before transaction date.')
            })
        
        if self.paid_amount > self.total_amount:
            raise ValidationError({
                'paid_amount': _('Paid amount cannot exceed total amount.')
            })

        if self.pk:
            old_instance = TransactionHeader.objects.get(pk=self.pk)
            if not self._is_valid_status_transition(old_instance.status, self.status):
                raise ValidationError({
                    'status': _('Invalid status transition.')
                })
        else:
            if self.status != self.TransactionStatus.DRAFT:
                raise ValidationError({
                    'status': _('New transactions must start as DRAFT.')
                })
    
    def _is_valid_status_transition(self, old_status: str, new_status: str) -> bool:
        """Validate status transition rules."""
        valid_transitions = {
            self.TransactionStatus.DRAFT: [
                self.TransactionStatus.PENDING,
                self.TransactionStatus.APPROVED,
                self.TransactionStatus.CANCELLED
            ],
            self.TransactionStatus.PENDING: [
                self.TransactionStatus.APPROVED,
                self.TransactionStatus.CANCELLED,
                self.TransactionStatus.DRAFT
            ],
            self.TransactionStatus.APPROVED: [
                self.TransactionStatus.POSTED,
                self.TransactionStatus.CANCELLED
            ],
            self.TransactionStatus.POSTED: [
                self.TransactionStatus.REVERSED
            ],
            self.TransactionStatus.CANCELLED: [],
            self.TransactionStatus.REVERSED: []
        }
        
        return new_status in valid_transitions.get(old_status, [])
    
    def calculate_totals(self):
        """Calculate transaction totals from detail lines."""
        details = self.details.all()
        
        self.subtotal_amount = sum(
            detail.line_total for detail in details
        ) or Decimal('0.00')
        
        self.discount_amount = sum(
            detail.discount_amount for detail in details
        ) or Decimal('0.00')
        
        self.tax_amount = sum(
            detail.tax_amount for detail in details
        ) or Decimal('0.00')
        
        self.total_amount = self.subtotal_amount - self.discount_amount + self.tax_amount
    
    def get_balance_due(self) -> Decimal:
        """Get remaining balance due."""
        return self.total_amount - self.paid_amount
    
    def is_fully_paid(self) -> bool:
        """Check if transaction is fully paid."""
        return self.paid_amount >= self.total_amount
    
    def is_overdue(self) -> bool:
        """Check if transaction is overdue."""
        if self.due_date and not self.is_fully_paid():
            return timezone.now().date() > self.due_date
        return False
    
    def approve(self, user):
        """Approve the transaction."""
        if self.status != self.TransactionStatus.PENDING:
            raise ValidationError(_('Only pending transactions can be approved.'))
        
        self.status = self.TransactionStatus.APPROVED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save(update_fields=['status', 'approved_by', 'approved_at'])
        
        logger.info(f"Transaction {self.transaction_number} approved by {user}")
    
    def post(self, user):
        """Post the transaction to ledger."""
        if self.status != self.TransactionStatus.APPROVED:
            raise ValidationError(_('Only approved transactions can be posted.'))
        
        with transaction.atomic():
            # Create ledger entries
            self._create_ledger_entries()
            
            # Update inventory if applicable
            if self.transaction_type.affects_inventory:
                self._update_inventory()
            
            # Update status
            self.status = self.TransactionStatus.POSTED
            self.posted_by = user
            self.posted_at = timezone.now()
            self.save(update_fields=['status', 'posted_by', 'posted_at'])
        
        logger.info(f"Transaction {self.transaction_number} posted by {user}")
    
    def reverse(self, user, reason: str):
        """Reverse the transaction."""
        if self.status != self.TransactionStatus.POSTED:
            raise ValidationError(_('Only posted transactions can be reversed.'))
        
        with transaction.atomic():
            # Create reversal ledger entries
            self._create_reversal_entries()
            
            # Reverse inventory changes if applicable
            if self.transaction_type.affects_inventory:
                self._reverse_inventory()
            
            # Update status
            self.status = self.TransactionStatus.REVERSED
            self.reversed_by = user
            self.reversed_at = timezone.now()
            self.reversal_reason = reason
            self.save(update_fields=[
                'status', 'reversed_by', 'reversed_at', 'reversal_reason'
            ])
        
        logger.info(f"Transaction {self.transaction_number} reversed by {user}: {reason}")
    
    def _create_ledger_entries(self):
        """Create ledger entries for this transaction."""
        # Implementation depends on transaction type
        # This is a placeholder for the actual ledger entry creation logic
        pass
    
    def _update_inventory(self):
        """Update inventory balances for this transaction."""
        # Implementation depends on transaction type
        # This is a placeholder for the actual inventory update logic
        pass
    
    def _create_reversal_entries(self):
        """Create reversal ledger entries."""
        # Implementation for creating reversal entries
        pass
    
    def _reverse_inventory(self):
        """Reverse inventory changes."""
        # Implementation for reversing inventory changes
        pass
    
    def __str__(self):
        return f"{self.transaction_number} - {self.transaction_type.type_name}"


class TransactionDetail(AuditableModel):
    """
    Detail lines for transactions with comprehensive item and pricing information.
    """
    header = models.ForeignKey(
        TransactionHeader,
        on_delete=models.CASCADE,
        related_name='details',
        verbose_name=_("Transaction Header")
    )
    
    line_number = models.PositiveIntegerField(
        verbose_name=_("Line Number"),
        help_text=_("Line sequence number")
    )
    
    item = models.ForeignKey(
        'inventory.Item',
        on_delete=models.PROTECT,
        related_name='transaction_details',
        verbose_name=_("Item")
    )
    
    item_unit = models.ForeignKey(
        'inventory.ItemUnit',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='transaction_details',
        verbose_name=_("Item Unit"),
        help_text=_("Unit of measure for this line")
    )
    
    # Quantity information
    quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Quantity"),
        help_text=_("Quantity in the specified unit")
    )
    
    base_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Base Quantity"),
        help_text=_("Quantity in base units")
    )
    
    unit_size = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[MinValueValidator(Decimal('0.00000001'))],
        verbose_name=_("Unit Size"),
        help_text=_("Conversion factor to base units")
    )
    
    # Bonus quantities
    bonus_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Bonus Quantity"),
        help_text=_("Free/bonus quantity")
    )
    
    # Pricing information
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Price"),
        help_text=_("Price per unit")
    )
    
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Cost"),
        help_text=_("Cost per unit")
    )
    
    # Calculated amounts
    line_total = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Line Total"),
        help_text=_("Total amount for this line (quantity × unit price)")
    )
    
    # Discounts
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        verbose_name=_("Discount Percentage"),
        help_text=_("Discount percentage applied")
    )
    
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Discount Amount"),
        help_text=_("Total discount amount for this line")
    )
    
    # Tax information
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        verbose_name=_("Tax Percentage"),
        help_text=_("Tax percentage applied")
    )
    
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Tax Amount"),
        help_text=_("Total tax amount for this line")
    )
    
    # Batch and expiry tracking
    batch_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Batch Number"),
        help_text=_("Manufacturing batch number")
    )
    
    expiry_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Expiry Date"),
        help_text=_("Product expiration date")
    )
    
    # Additional information
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Additional description for this line")
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes"),
        help_text=_("Additional notes for this line")
    )
    
    class Meta:
        verbose_name = _("Transaction Detail")
        verbose_name_plural = _("Transaction Details")
        unique_together = [
            ['header', 'line_number']
        ]
        indexes = [
            models.Index(fields=['header']),
            models.Index(fields=['item']),
            models.Index(fields=['batch_number']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['line_number']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(quantity__gte=0),
                name='transaction_non_negative_quantity'
            ),
            models.CheckConstraint(
                check=models.Q(unit_size__gt=0),
                name='transaction_positive_unit_size'
            ),
            models.CheckConstraint(
                check=models.Q(discount_percentage__gte=0) & models.Q(discount_percentage__lte=100),
                name='transaction_valid_discount_percentage'
            ),
            models.CheckConstraint(
                check=models.Q(tax_percentage__gte=0) & models.Q(tax_percentage__lte=100),
                name='transaction_valid_tax_percentage'
            )
        ]
    
    def clean(self):
        """Custom validation for transaction detail."""
        super().clean()
        
        if self.item_unit and self.item_unit.item != self.item:
            raise ValidationError({
                'item_unit': _('Item unit must belong to the selected item.')
            })
        
        if self.item.track_batches and not self.batch_number:
            raise ValidationError({
                'batch_number': _('Batch number is required for this item.')
            })
        
        if self.item.track_expiry and not self.expiry_date:
            raise ValidationError({
                'expiry_date': _('Expiry date is required for this item.')
            })
    
        if self.expiry_date and self.expiry_date < timezone.now().date():
            raise ValidationError({
                'expiry_date': _('Cannot use expired products.')
            })
    
    def save(self, *args, **kwargs):
        """Override save to calculate amounts and base quantities."""
        if self.item_unit and not self.unit_size:
            self.unit_size = self.item_unit.conversion_factor

        self.base_quantity = self.quantity * self.unit_size
        
        self.line_total = self.quantity * self.unit_price

        if self.discount_percentage > 0:
            self.discount_amount = self.line_total * (self.discount_percentage / 100)
        
        taxable_amount = self.line_total - self.discount_amount
        if self.tax_percentage > 0:
            self.tax_amount = taxable_amount * (self.tax_percentage / 100)
        
        super().save(*args, **kwargs)
        
        self.header.calculate_totals()
        self.header.save(update_fields=[
            'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount'
        ])
    
    def get_net_amount(self) -> Decimal:
        """Get net amount after discount and tax."""
        return self.line_total - self.discount_amount + self.tax_amount
    
    def get_total_quantity(self) -> Decimal:
        """Get total quantity including bonus."""
        return self.quantity + self.bonus_quantity
    
    def __str__(self):
        return f"{self.header.transaction_number} - Line {self.line_number}: {self.item.item_name}"


class LedgerEntry(AuditableModel):
    """
    General ledger entries for all accounting transactions.
    """
    branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.CASCADE,
        related_name='ledger_entries',
        verbose_name=_("Branch")
    )
    
    transaction_header = models.ForeignKey(
        TransactionHeader,
        on_delete=models.CASCADE,
        related_name='ledger_entries',
        verbose_name=_("Transaction Header")
    )
    
    account = models.ForeignKey(
        'accounting.Account',
        on_delete=models.PROTECT,
        related_name='ledger_entries',
        verbose_name=_("Account")
    )
    
    cost_center = models.ForeignKey(
        'accounting.CostCenter',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_entries',
        verbose_name=_("Cost Center")
    )
    
    entry_date = models.DateField(
        verbose_name=_("Entry Date"),
        help_text=_("Date of the ledger entry")
    )
    
    debit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Debit Amount"),
        help_text=_("Debit amount in local currency")
    )
    
    credit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Credit Amount"),
        help_text=_("Credit amount in local currency")
    )
    
    foreign_debit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Foreign Debit Amount"),
        help_text=_("Debit amount in foreign currency")
    )
    
    foreign_credit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Foreign Credit Amount"),
        help_text=_("Credit amount in foreign currency")
    )
    
    currency = models.ForeignKey(
        'accounting.Currency',
        on_delete=models.PROTECT,
        related_name='ledger_entries',
        verbose_name=_("Currency")
    )
    
    exchange_rate = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[validate_positive_decimal],
        verbose_name=_("Exchange Rate")
    )
    
    is_posted = models.BooleanField(
        default=False,
        verbose_name=_("Posted"),
        help_text=_("Whether this entry has been posted")
    )
    
    is_reversed = models.BooleanField(
        default=False,
        verbose_name=_("Reversed"),
        help_text=_("Whether this entry has been reversed")
    )
    
    reversal_entry = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reversed_entries',
        verbose_name=_("Reversal Entry"),
        help_text=_("Entry that reverses this entry")
    )
    
    description = models.CharField(
        max_length=255,
        verbose_name=_("Description"),
        help_text=_("Entry description")
    )
    
    reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Reference"),
        help_text=_("Additional reference information")
    )
    
    class Meta:
        verbose_name = _("Ledger Entry")
        verbose_name_plural = _("Ledger Entries")
        indexes = [
            models.Index(fields=['branch', 'entry_date']),
            models.Index(fields=['account', 'entry_date']),
            models.Index(fields=['transaction_header']),
            models.Index(fields=['is_posted']),
            models.Index(fields=['is_reversed']),
            models.Index(fields=['cost_center']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(debit_amount__gte=0),
                name='non_negative_debit_amount'
            ),
            models.CheckConstraint(
                check=models.Q(credit_amount__gte=0),
                name='non_negative_credit_amount'
            ),
            models.CheckConstraint(
                check=~(models.Q(debit_amount__gt=0) & models.Q(credit_amount__gt=0)),
                name='not_both_debit_and_credit'
            ),
            models.CheckConstraint(
                check=models.Q(debit_amount__gt=0) | models.Q(credit_amount__gt=0),
                name='either_debit_or_credit'
            )
        ]
    
    def clean(self):
        """Custom validation for ledger entry."""
        super().clean()
        
        if self.debit_amount > 0 and self.credit_amount > 0:
            raise ValidationError(
                _('Entry cannot have both debit and credit amounts.')
            )
        
        if self.debit_amount == 0 and self.credit_amount == 0:
            raise ValidationError(
                _('Entry must have either debit or credit amount.')
            )
        
        if (self.branch.use_cost_center and 
            self.account.account_type.category in ['expense', 'revenue'] and 
            not self.cost_center):
            raise ValidationError({
                'cost_center': _('Cost center is required for this account type.')
            })
    
    def get_amount(self) -> Decimal:
        """Get the entry amount (debit or credit)."""
        return self.debit_amount if self.debit_amount > 0 else self.credit_amount
    
    def is_debit(self) -> bool:
        """Check if this is a debit entry."""
        return self.debit_amount > 0
    
    def is_credit(self) -> bool:
        """Check if this is a credit entry."""
        return self.credit_amount > 0
    
    def __str__(self):
        amount = self.get_amount()
        entry_type = "DR" if self.is_debit() else "CR"
        return f"{self.account.account_code} - {entry_type} {amount}"
