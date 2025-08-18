import logging
from decimal import Decimal
from django.db import models, transaction
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db.utils import IntegrityError
from apps.core_apps.general import AuditableModel
from apps.core_apps.validators import validate_positive_decimal
from apps.inventory.models import Item, ItemUnit, Media
from apps.accounting.models import Account, Currency, CostCenter
from apps.authentication.models import User
from apps.organization.models import Branch
from apps.core_apps.services.messaging_service import MessagingService
from apps.core_apps.utils import generate_unique_code

logger = logging.getLogger(__name__)

class TransactionType(AuditableModel):
    """Define different types of transactions in the system."""
    class Category(models.TextChoices):
        SALES = 'sales', _('Sales')
        PURCHASE = 'purchase', _('Purchase')
        PAYMENT = 'payment', _('Payment')
        RECEIPT = 'receipt', _('Receipt')
        JOURNAL = 'journal', _('Journal Entry')
        ADJUSTMENT = 'adjustment', _('Inventory Adjustment')
        TRANSFER = 'transfer', _('Transfer')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='transaction_types',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name")
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        verbose_name=_("Category")
    )
    affects_inventory = models.BooleanField(
        default=True,
        verbose_name=_("Affects Inventory")
    )
    affects_accounts = models.BooleanField(
        default=True,
        verbose_name=_("Affects Accounts")
    )
    requires_approval = models.BooleanField(
        default=False,
        verbose_name=_("Requires Approval")
    )
    auto_post = models.BooleanField(
        default=True,
        verbose_name=_("Auto Post")
    )
    default_debit_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='debit_transaction_types',
        verbose_name=_("Default Debit Account")
    )
    default_credit_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='credit_transaction_types',
        verbose_name=_("Default Credit Account")
    )

    class Meta:
        verbose_name = _("Transaction Type")
        verbose_name_plural = _("Transaction Types")
        unique_together = [['branch', 'name']]
        indexes = [
            models.Index(fields=['branch', 'category']),
            models.Index(fields=['code']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.branch.company.has_feature('multi_currency') and self.category in [self.Category.SALES, self.Category.PURCHASE]:
            if not (self.default_debit_account and self.default_credit_account):
                raise ValidationError({'default_debit_account': _('Accounts are required for multi-currency transactions.')})

    def __str__(self):
        return f"{self.code} - {self.name} ({self.get_category_display()})"

class TransactionHeader(AuditableModel):
    """Header information for all transactions with comprehensive tracking."""
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PENDING = 'pending', _('Pending Approval')
        APPROVED = 'approved', _('Approved')
        POSTED = 'posted', _('Posted')
        CANCELLED = 'cancelled', _('Cancelled')
        REVERSED = 'reversed', _('Reversed')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='transaction_headers',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    transaction_type = models.ForeignKey(
        TransactionType,
        on_delete=models.PROTECT,
        related_name='transactions',
        verbose_name=_("Transaction Type")
    )
    transaction_number = models.CharField(
        max_length=50,
        verbose_name=_("Transaction Number")
    )
    reference_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Reference Number")
    )
    transaction_date = models.DateField(
        default=timezone.now,
        verbose_name=_("Transaction Date")
    )
    due_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Due Date")
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name=_("Status")
    )
    customer_account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='customer_transactions',
        verbose_name=_("Customer Account")
    )
    supplier_account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='supplier_transactions',
        verbose_name=_("Supplier Account")
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='transactions',
        verbose_name=_("Currency")
    )
    exchange_rate = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[validate_positive_decimal],
        verbose_name=_("Exchange Rate")
    )
    subtotal_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Subtotal Amount")
    )
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Discount Amount")
    )
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Tax Amount")
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Total Amount")
    )
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Paid Amount")
    )
    payment_terms = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Payment Terms")
    )
    credit_days = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Credit Days")
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes")
    )
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_("Internal Notes")
    )
    attachments = models.ManyToManyField(
        Media,
        blank=True,
        related_name='transactions',
        verbose_name=_("Attachments")
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_transactions',
        verbose_name=_("Approved By")
    )
    approved_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Approved At")
    )
    posted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_transactions',
        verbose_name=_("Posted By")
    )
    posted_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Posted At")
    )
    reversed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reversed_transactions',
        verbose_name=_("Reversed By")
    )
    reversed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Reversed At")
    )
    reversal_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Reversal Reason")
    )

    class Meta:
        verbose_name = _("Transaction Header")
        verbose_name_plural = _("Transaction Headers")
        unique_together = [['branch', 'transaction_number']]
        indexes = [
            models.Index(fields=['branch', 'code', 'transaction_number']),
            models.Index(fields=['transaction_type', 'status']),
            models.Index(fields=['transaction_date', 'due_date']),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(exchange_rate__gt=0), name='transaction_positive_exchange_rate'),
            models.CheckConstraint(check=models.Q(paid_amount__lte=models.F('total_amount')), name='paid_not_exceeding_total')
        ]

    def clean(self):
        super().clean()
        if not self.transaction_number.strip():
            raise ValidationError({'transaction_number': _('Transaction number cannot be empty.')})
        if self.due_date and self.due_date < self.transaction_date:
            raise ValidationError({'due_date': _('Due date cannot be before transaction date.')})
        if self.paid_amount > self.total_amount:
            raise ValidationError({'paid_amount': _('Paid amount cannot exceed total amount.')})
        if self.currency != self.branch.default_currency and not self.branch.company.has_feature('multi_currency'):
            raise ValidationError({'currency': _('Multi-currency not supported by license.')})
        if self.transaction_type.requires_approval and self.status == self.Status.APPROVED and not self.approved_by:
            raise ValidationError({'approved_by': _('Approver required for transactions requiring approval.')})
        if self.pk:
            old_instance = TransactionHeader.objects.get(pk=self.pk)
            if not self._is_valid_status_transition(old_instance.status, self.status):
                raise ValidationError({'status': _('Invalid status transition.')})
        else:
            if self.status != self.Status.DRAFT:
                raise ValidationError({'status': _('New transactions must start as DRAFT.')})

    def _is_valid_status_transition(self, old_status: str, new_status: str) -> bool:
        valid_transitions = {
            self.Status.DRAFT: [self.Status.PENDING, self.Status.APPROVED, self.Status.CANCELLED],
            self.Status.PENDING: [self.Status.APPROVED, self.Status.CANCELLED, self.Status.DRAFT],
            self.Status.APPROVED: [self.Status.POSTED, self.Status.CANCELLED],
            self.Status.POSTED: [self.Status.REVERSED],
            self.Status.CANCELLED: [],
            self.Status.REVERSED: []
        }
        return new_status in valid_transitions.get(old_status, [])

    def calculate_totals(self):
        details = self.details.all()
        self.subtotal_amount = sum(detail.line_total for detail in details) or Decimal('0.00')
        self.discount_amount = sum(detail.discount_amount for detail in details) or Decimal('0.00')
        self.tax_amount = sum(detail.tax_amount for detail in details) or Decimal('0.00')
        self.total_amount = self.subtotal_amount - self.discount_amount + self.tax_amount

    def get_balance_due(self) -> Decimal:
        return self.total_amount - self.paid_amount

    def is_fully_paid(self) -> bool:
        return self.paid_amount >= self.total_amount

    def is_overdue(self) -> bool:
        if self.due_date and not self.is_fully_paid() and timezone.now().date() > self.due_date:
            try:
                user = self.customer_account.related_user if self.customer_account else None
                if user and user.profile.can_receive_notifications('email'):
                    service = MessagingService(self.branch)
                    service.send_notification(
                        recipient=user,
                        notification_type='payment_overdue',
                        context_data={
                            'transaction_number': self.transaction_number,
                            'amount_due': str(self.get_balance_due()),
                            'due_date': self.due_date.strftime('%Y-%m-%d')
                        },
                        channel='email',
                        priority='urgent'
                    )
                return True
            except Exception as e:
                logger.error(f"Error sending overdue notification for transaction {self.code}: {str(e)}", exc_info=True)
        return False

    def approve(self, user):
        if self.status != self.Status.PENDING:
            raise ValidationError(_('Only pending transactions can be approved.'))
        self.status = self.Status.APPROVED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save(update_fields=['status', 'approved_by', 'approved_at'])
        try:
            user = self.customer_account.related_user if self.customer_account else None
            if user and user.profile.can_receive_notifications('email'):
                service = MessagingService(self.branch)
                service.send_notification(
                    recipient=user,
                    notification_type='transaction_approved',
                    context_data={'transaction_number': self.transaction_number},
                    channel='email',
                    priority='normal'
                )
        except Exception as e:
            logger.error(f"Error sending approval notification for transaction {self.code}: {str(e)}", exc_info=True)
        logger.info(f"Transaction {self.code} approved by {user}")

    def post(self, user):
        if self.status != self.Status.APPROVED:
            raise ValidationError(_('Only approved transactions can be posted.'))
        with transaction.atomic():
            self._create_ledger_entries()
            if self.transaction_type.affects_inventory:
                self._update_inventory()
            self.status = self.Status.POSTED
            self.posted_by = user
            self.posted_at = timezone.now()
            self.save(update_fields=['status', 'posted_by', 'posted_at'])
            try:
                user = self.customer_account.related_user if self.customer_account else None
                if user and user.profile.can_receive_notifications('email'):
                    service = MessagingService(self.branch)
                    service.send_notification(
                        recipient=user,
                        notification_type='transaction_posted',
                        context_data={'transaction_number': self.transaction_number},
                        channel='email',
                        priority='normal'
                    )
            except Exception as e:
                logger.error(f"Error sending posted notification for transaction {self.code}: {str(e)}", exc_info=True)
        logger.info(f"Transaction {self.code} posted by {user}")

    def reverse(self, user, reason: str):
        if self.status != self.Status.POSTED:
            raise ValidationError(_('Only posted transactions can be reversed.'))
        with transaction.atomic():
            self._create_reversal_entries()
            if self.transaction_type.affects_inventory:
                self._reverse_inventory()
            self.status = self.Status.REVERSED
            self.reversed_by = user
            self.reversed_at = timezone.now()
            self.reversal_reason = reason
            self.save(update_fields=['status', 'reversed_by', 'reversed_at', 'reversal_reason'])
            try:
                user = self.customer_account.related_user if self.customer_account else None
                if user and user.profile.can_receive_notifications('email'):
                    service = MessagingService(self.branch)
                    service.send_notification(
                        recipient=user,
                        notification_type='transaction_reversed',
                        context_data={
                            'transaction_number': self.transaction_number,
                            'reason': reason
                        },
                        channel='email',
                        priority='high'
                    )
            except Exception as e:
                logger.error(f"Error sending reversal notification for transaction {self.code}: {str(e)}", exc_info=True)
        logger.info(f"Transaction {self.code} reversed by {user}: {reason}")

    def _create_ledger_entries(self):
        from apps.accounting.models import LedgerEntry
        for detail in self.details.all():
            debit_account = self.transaction_type.default_debit_account or self.customer_account or self.supplier_account
            credit_account = self.transaction_type.default_credit_account or self.supplier_account or self.customer_account
            if debit_account and credit_account:
                LedgerEntry.objects.create(
                    branch=self.branch,
                    transaction_header=self,
                    account=debit_account,
                    cost_center=None,
                    entry_date=self.transaction_date,
                    debit_amount=detail.get_net_amount(),
                    credit_amount=Decimal('0.00'),
                    foreign_debit_amount=detail.get_net_amount() / self.exchange_rate if self.exchange_rate != 1 else Decimal('0.00'),
                    foreign_credit_amount=Decimal('0.00'),
                    currency=self.currency,
                    exchange_rate=self.exchange_rate,
                    is_posted=True,
                    description=f"{self.transaction_type.name} - {self.transaction_number} Line {detail.line_number}",
                    reference=self.reference_number
                )
                LedgerEntry.objects.create(
                    branch=self.branch,
                    transaction_header=self,
                    account=credit_account,
                    cost_center=None,
                    entry_date=self.transaction_date,
                    debit_amount=Decimal('0.00'),
                    credit_amount=detail.get_net_amount(),
                    foreign_debit_amount=Decimal('0.00'),
                    foreign_credit_amount=detail.get_net_amount() / self.exchange_rate if self.exchange_rate != 1 else Decimal('0.00'),
                    currency=self.currency,
                    exchange_rate=self.exchange_rate,
                    is_posted=True,
                    description=f"{self.transaction_type.name} - {self.transaction_number} Line {detail.line_number}",
                    reference=self.reference_number
                )

    def _update_inventory(self):
        for detail in self.details.all():
            if self.transaction_type.category == self.transaction_type.Category.SALES:
                detail.item.adjust_stock(-detail.base_quantity, self.branch)
            elif self.transaction_type.category == self.transaction_type.Category.PURCHASE:
                detail.item.adjust_stock(detail.base_quantity, self.branch)

    def _create_reversal_entries(self):
        from apps.accounting.models import LedgerEntry
        for entry in self.ledger_entries.filter(is_posted=True, is_reversed=False):
            LedgerEntry.objects.create(
                branch=self.branch,
                transaction_header=self,
                account=entry.account,
                cost_center=entry.cost_center,
                entry_date=timezone.now().date(),
                debit_amount=entry.credit_amount,
                credit_amount=entry.debit_amount,
                foreign_debit_amount=entry.foreign_credit_amount,
                foreign_credit_amount=entry.foreign_debit_amount,
                currency=entry.currency,
                exchange_rate=entry.exchange_rate,
                is_posted=True,
                is_reversed=True,
                reversal_entry=entry,
                description=f"Reversal of {entry.description}",
                reference=self.reference_number
            )
            entry.is_reversed = True
            entry.save(update_fields=['is_reversed'])

    def _reverse_inventory(self):
        for detail in self.details.all():
            if self.transaction_type.category == self.transaction_type.Category.SALES:
                detail.item.adjust_stock(detail.base_quantity, self.branch)
            elif self.transaction_type.category == self.transaction_type.Category.PURCHASE:
                detail.item.adjust_stock(-detail.base_quantity, self.branch)

    def __str__(self):
        return f"{self.code} - {self.transaction_number} ({self.get_status_display()})"

class TransactionDetail(AuditableModel):
    """Detail lines for transactions with comprehensive item and pricing information."""
    header = models.ForeignKey(
        TransactionHeader,
        on_delete=models.CASCADE,
        related_name='details',
        verbose_name=_("Transaction Header")
    )
    line_number = models.PositiveIntegerField(
        verbose_name=_("Line Number")
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name='transaction_details',
        verbose_name=_("Item")
    )
    item_unit = models.ForeignKey(
        ItemUnit,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='transaction_details',
        verbose_name=_("Item Unit")
    )
    quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Quantity")
    )
    base_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Base Quantity")
    )
    unit_size = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[MinValueValidator(Decimal('0.00000001'))],
        verbose_name=_("Unit Size")
    )
    bonus_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Bonus Quantity")
    )
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Price")
    )
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Cost")
    )
    line_total = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Line Total")
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        verbose_name=_("Discount Percentage")
    )
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Discount Amount")
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        verbose_name=_("Tax Percentage")
    )
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Tax Amount")
    )
    batch_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Batch Number")
    )
    expiry_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Expiry Date")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes")
    )

    class Meta:
        verbose_name = _("Transaction Detail")
        verbose_name_plural = _("Transaction Details")
        unique_together = [['header', 'line_number']]
        indexes = [
            models.Index(fields=['header', 'item']),
            models.Index(fields=['batch_number', 'expiry_date']),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gte=0), name='transaction_non_negative_quantity'),
            models.CheckConstraint(check=models.Q(unit_size__gt=0), name='transaction_positive_unit_size'),
            models.CheckConstraint(check=models.Q(discount_percentage__gte=0) & models.Q(discount_percentage__lte=100), name='transaction_valid_discount_percentage'),
            models.CheckConstraint(check=models.Q(tax_percentage__gte=0) & models.Q(tax_percentage__lte=100), name='transaction_valid_tax_percentage')
        ]

    def clean(self):
        super().clean()
        if self.item_unit and self.item_unit.item != self.item:
            raise ValidationError({'item_unit': _('Item unit must belong to the selected item.')})
        if self.header.branch.use_batch_no and self.item.track_batches and not self.batch_number:
            raise ValidationError({'batch_number': _('Batch number is required for this item.')})
        if self.header.branch.use_expire_date and self.item.track_expiry and not self.expiry_date:
            raise ValidationError({'expiry_date': _('Expiry date is required for this item.')})
        if self.expiry_date and self.expiry_date < timezone.now().date():
            raise ValidationError({'expiry_date': _('Cannot use expired products.')})

    def save(self, *args, **kwargs):
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
        self.header.save(update_fields=['subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount'])

    def get_net_amount(self) -> Decimal:
        return self.line_total - self.discount_amount + self.tax_amount

    def get_total_quantity(self) -> Decimal:
        return self.quantity + self.bonus_quantity

    def __str__(self):
        return f"{self.header.code} - Line {self.line_number}: {self.item.item_name}"

class LedgerEntry(AuditableModel):
    """General ledger entries for all accounting transactions."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='ledger_entries',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    transaction_header = models.ForeignKey(
        TransactionHeader,
        on_delete=models.CASCADE,
        related_name='ledger_entries',
        verbose_name=_("Transaction Header")
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='ledger_entries',
        verbose_name=_("Account")
    )
    cost_center = models.ForeignKey(
        CostCenter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_entries',
        verbose_name=_("Cost Center")
    )
    entry_date = models.DateField(
        verbose_name=_("Entry Date")
    )
    debit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Debit Amount")
    )
    credit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Credit Amount")
    )
    foreign_debit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Foreign Debit Amount")
    )
    foreign_credit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Foreign Credit Amount")
    )
    currency = models.ForeignKey(
        Currency,
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
        verbose_name=_("Posted")
    )
    is_reversed = models.BooleanField(
        default=False,
        verbose_name=_("Reversed")
    )
    reversal_entry = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reversed_entries',
        verbose_name=_("Reversal Entry")
    )
    description = models.CharField(
        max_length=255,
        verbose_name=_("Description")
    )
    reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Reference")
    )

    class Meta:
        verbose_name = _("Ledger Entry")
        verbose_name_plural = _("Ledger Entries")
        indexes = [
            models.Index(fields=['branch', 'code', 'entry_date']),
            models.Index(fields=['account', 'is_posted']),
            models.Index(fields=['transaction_header']),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(debit_amount__gte=0), name='non_negative_debit_amount'),
            models.CheckConstraint(check=models.Q(credit_amount__gte=0), name='non_negative_credit_amount'),
            models.CheckConstraint(check=~(models.Q(debit_amount__gt=0) & models.Q(credit_amount__gt=0)), name='not_both_debit_and_credit'),
            models.CheckConstraint(check=models.Q(debit_amount__gt=0) | models.Q(credit_amount__gt=0), name='either_debit_or_credit')
        ]

    def clean(self):
        super().clean()
        if self.debit_amount > 0 and self.credit_amount > 0:
            raise ValidationError(_('Entry cannot have both debit and credit amounts.'))
        if self.debit_amount == 0 and self.credit_amount == 0:
            raise ValidationError(_('Entry must have either debit or credit amount.'))
        if self.branch.use_cost_center and self.account.account_type.category in ['expense', 'revenue'] and not self.cost_center:
            raise ValidationError({'cost_center': _('Cost center is required for this account type.')})
        if self.currency != self.branch.default_currency and not self.branch.company.has_feature('multi_currency'):
            raise ValidationError({'currency': _('Multi-currency not supported by license.')})

    def get_amount(self) -> Decimal:
        return self.debit_amount if self.debit_amount > 0 else self.credit_amount

    def is_debit(self) -> bool:
        return self.debit_amount > 0

    def is_credit(self) -> bool:
        return self.credit_amount > 0

    def __str__(self):
        return f"{self.code} - {self.account.code} ({'DR' if self.is_debit() else 'CR'} {self.get_amount()})"