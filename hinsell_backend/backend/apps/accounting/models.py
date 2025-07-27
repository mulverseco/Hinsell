"""
Accounting management models including currencies, accounts, and transactions.
Handles all accounting data with proper validation and audit trails.
"""
import logging
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from apps.core_apps.general import AuditableModel
from apps.core_apps.validators import validate_positive_decimal, validate_percentage
from apps.organization.models import Branch
from apps.authentication.models import User

logger = logging.getLogger(__name__)

class Currency(AuditableModel):
    """
    Enhanced currency model with comprehensive validation and features.
    """
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='currencies',
        verbose_name=_("Branch"),
        help_text=_("Branch this currency belongs to")
    )
    
    currency_code = models.CharField(
        max_length=5,
        verbose_name=_("Currency Code"),
        help_text=_("ISO currency code (e.g., USD, EUR)")
    )
    
    currency_name = models.CharField(
        max_length=50,
        verbose_name=_("Currency Name"),
        help_text=_("Full currency name")
    )
    
    currency_symbol = models.CharField(
        max_length=5,
        blank=True,
        null=True,
        verbose_name=_("Currency Symbol"),
        help_text=_("Currency symbol (e.g., $, €)")
    )
    
    is_local = models.BooleanField(
        default=False,
        verbose_name=_("Local Currency"),
        help_text=_("Whether this is the local/base currency")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Default Currency"),
        help_text=_("Whether this is the default currency for the branch")
    )
    
    fraction_name = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Fraction Name"),
        help_text=_("Name of currency fraction (e.g., cents, pence)")
    )
    
    decimal_places = models.PositiveIntegerField(
        default=2,
        validators=[MinValueValidator(0), MaxValueValidator(6)],
        verbose_name=_("Decimal Places"),
        help_text=_("Number of decimal places for this currency")
    )
    
    exchange_rate = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[validate_positive_decimal],
        verbose_name=_("Exchange Rate"),
        help_text=_("Exchange rate relative to base currency")
    )
    
    exchange_rate_date = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Exchange Rate Date"),
        help_text=_("Date when exchange rate was last updated")
    )
    
    upper_limit = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Upper Limit"),
        help_text=_("Upper limit for exchange rate validation")
    )
    
    lower_limit = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Lower Limit"),
        help_text=_("Lower limit for exchange rate validation")
    )
    
    class Meta:
        verbose_name = _("Currency")
        verbose_name_plural = _("Currencies")
        unique_together = [
            ['branch', 'currency_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['currency_code']),
            models.Index(fields=['is_local']),
            models.Index(fields=['is_default']),
            models.Index(fields=['is_active']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(exchange_rate__gt=0),
                name='currency_positive_exchange_rate'
            ),
            models.CheckConstraint(
                check=models.Q(upper_limit__gte=0),
                name='currency_non_negative_upper_limit'
            ),
            models.CheckConstraint(
                check=models.Q(lower_limit__gte=0),
                name='currency_non_negative_lower_limit'
            )
        ]
    
    def clean(self):
        """Custom validation for currency."""
        super().clean()
        
        if not self.currency_code.strip():
            raise ValidationError({
                'currency_code': _('Currency code cannot be empty.')
            })
        
        if not self.currency_name.strip():
            raise ValidationError({
                'currency_name': _('Currency name cannot be empty.')
            })
        
        if self.upper_limit > 0 and self.lower_limit > 0:
            if self.lower_limit >= self.upper_limit:
                raise ValidationError({
                    'upper_limit': _('Upper limit must be greater than lower limit.')
                })
        
        if self.upper_limit > 0 and self.exchange_rate > self.upper_limit:
            raise ValidationError({
                'exchange_rate': _('Exchange rate exceeds upper limit.')
            })
        
        if self.lower_limit > 0 and self.exchange_rate < self.lower_limit:
            raise ValidationError({
                'exchange_rate': _('Exchange rate is below lower limit.')
            })
    
    def save(self, *args, **kwargs):
        """Override save to handle default currency logic."""
        if self.is_default:
            Currency.objects.filter(
                branch=self.branch,
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        
        if self.is_local:
            Currency.objects.filter(
                branch=self.branch,
                is_local=True
            ).exclude(id=self.id).update(is_local=False)
        
        super().save(*args, **kwargs)
    
    def update_exchange_rate(self, new_rate: Decimal, user=None):
        """Update exchange rate with validation and logging."""
        old_rate = self.exchange_rate
        self.exchange_rate = new_rate
        self.exchange_rate_date = timezone.now()
        
        if user:
            self.updated_by = user
        
        self.save(update_fields=['exchange_rate', 'exchange_rate_date', 'updated_by'])
        
        logger.info(f"Exchange rate updated for {self.currency_code}: {old_rate} -> {new_rate}")
        
        CurrencyHistory.objects.create(
            branch=self.branch,
            currency=self,
            old_exchange_rate=old_rate,
            new_exchange_rate=new_rate,
            changed_by=user
        )
    
    def format_amount(self, amount: Decimal) -> str:
        """Format amount according to currency settings."""
        if self.currency_symbol:
            return f"{self.currency_symbol}{amount:.{self.decimal_places}f}"
        else:
            return f"{amount:.{self.decimal_places}f} {self.currency_code}"
    
    def __str__(self):
        return f"{self.currency_code} - {self.currency_name}"


class CurrencyHistory(AuditableModel):
    """
    Track currency exchange rate changes for audit purposes.
    """
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='currency_history',
        verbose_name=_("Branch")
    )
    
    currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name=_("Currency")
    )
    
    old_exchange_rate = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        verbose_name=_("Old Exchange Rate")
    )
    
    new_exchange_rate = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        verbose_name=_("New Exchange Rate")
    )
    
    changed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Changed By")
    )
    
    reason = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Reason"),
        help_text=_("Reason for exchange rate change")
    )
    
    class Meta:
        verbose_name = _("Currency History")
        verbose_name_plural = _("Currency History")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['currency', 'created_at']),
            models.Index(fields=['branch', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.currency.currency_code} rate change on {self.created_at.date()}"


class AccountType(AuditableModel):
    """
    Chart of accounts types and categories.
    """
    
    class AccountCategory(models.TextChoices):
        ASSET = 'asset', _('Asset')
        LIABILITY = 'liability', _('Liability')
        EQUITY = 'equity', _('Equity')
        REVENUE = 'revenue', _('Revenue')
        EXPENSE = 'expense', _('Expense')
        COST_OF_GOODS_SOLD = 'cogs', _('Cost of Goods Sold')
    
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='account_types',
        verbose_name=_("Branch")
    )
    
    type_code = models.CharField(
        max_length=10,
        verbose_name=_("Type Code"),
        help_text=_("Unique code for this account type")
    )
    
    type_name = models.CharField(
        max_length=100,
        verbose_name=_("Type Name"),
        help_text=_("Display name for this account type")
    )
    
    category = models.CharField(
        max_length=20,
        choices=AccountCategory.choices,
        verbose_name=_("Category"),
        help_text=_("Financial statement category")
    )
    
    normal_balance = models.CharField(
        max_length=6,
        choices=[('debit', _('Debit')), ('credit', _('Credit'))],
        verbose_name=_("Normal Balance"),
        help_text=_("Normal balance side for this account type")
    )
    
    class Meta:
        verbose_name = _("Account Type")
        verbose_name_plural = _("Account Types")
        unique_together = [
            ['branch', 'type_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.type_code} - {self.type_name}"


class Account(AuditableModel):
    """
    Enhanced chart of accounts with comprehensive features and validation.
    """
    
    class AccountNature(models.TextChoices):
        CUSTOMER = 'customer', _('Customer')
        SUPPLIER = 'supplier', _('Supplier')
        BANK = 'bank', _('Bank')
        CASH = 'cash', _('Cash')
        INVENTORY = 'inventory', _('Inventory')
        FIXED_ASSET = 'fixed_asset', _('Fixed Asset')
        OTHER = 'other', _('Other')
    
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='accounts',
        verbose_name=_("Branch")
    )
    
    account_code = models.CharField(
        max_length=20,
        verbose_name=_("Account Code"),
        help_text=_("Unique account code")
    )
    
    account_name = models.CharField(
        max_length=250,
        verbose_name=_("Account Name"),
        help_text=_("Account display name")
    )
    
    account_name_english = models.CharField(
        max_length=250,
        blank=True,
        null=True,
        verbose_name=_("Account Name (English)"),
        help_text=_("Account name in English")
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_("Parent Account"),
        help_text=_("Parent account in hierarchy")
    )
    
    account_type = models.ForeignKey(
        AccountType,
        on_delete=models.PROTECT,
        related_name='accounts',
        verbose_name=_("Account Type"),
        help_text=_("Type/category of this account")
    )
    
    account_nature = models.CharField(
        max_length=20,
        choices=AccountNature.choices,
        default=AccountNature.OTHER,
        verbose_name=_("Account Nature"),
        help_text=_("Nature/purpose of this account")
    )

    is_header = models.BooleanField(
        default=False,
        verbose_name=_("Header Account"),
        help_text=_("Whether this is a header/summary account")
    )
    
    is_hidden = models.BooleanField(
        default=False,
        verbose_name=_("Hidden"),
        help_text=_("Hide this account from normal views")
    )
    
    is_system = models.BooleanField(
        default=False,
        verbose_name=_("System Account"),
        help_text=_("System-generated account (cannot be deleted)")
    )
    
    currency = models.ForeignKey(
        Currency,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accounts',
        verbose_name=_("Currency"),
        help_text=_("Default currency for this account")
    )
    
    is_taxable = models.BooleanField(
        default=False,
        verbose_name=_("Taxable"),
        help_text=_("Whether transactions on this account are taxable")
    )
    
    tax_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Tax Code"),
        help_text=_("Tax code for this account")
    )

    commission_ratio = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Commission Ratio"),
        help_text=_("Commission percentage for this account")
    )
    
    credit_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Credit Limit"),
        help_text=_("Maximum credit limit for this account")
    )
    
    debit_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Debit Limit"),
        help_text=_("Maximum debit limit for this account")
    )
    
    email = models.EmailField(
        blank=True,
        null=True,
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email Address"),
        help_text=_("Contact email address")
    )
    
    phone_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Phone Number"),
        help_text=_("Contact phone number")
    )
    
    mobile_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Mobile Number"),
        help_text=_("Contact mobile number")
    )
    
    fax_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Fax Number"),
        help_text=_("Contact fax number")
    )
    
    address = models.TextField(
        blank=True,
        verbose_name=_("Address"),
        help_text=_("Contact address")
    )
    
    tax_registration_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Tax Registration Number"),
        help_text=_("Tax registration number")
    )
    
    commercial_registration = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Commercial Registration"),
        help_text=_("Commercial registration number")
    )
    
    stop_sales = models.BooleanField(
        default=False,
        verbose_name=_("Stop Sales"),
        help_text=_("Prevent sales to this account")
    )
    
    current_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Current Balance"),
        help_text=_("Current account balance")
    )
    
    budget_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Budget Amount"),
        help_text=_("Budgeted amount for this account")
    )
    
    enable_email_notifications = models.BooleanField(
        default=True,
        verbose_name=_("Enable Email Notifications"),
        help_text=_("Enable system email notifications")
    )
    
    enable_sms_notifications = models.BooleanField(
        default=False,
        verbose_name=_("Enable SMS Notifications"),
        help_text=_("Enable system SMS notifications")
    )
    
    enable_whatsapp_notifications = models.BooleanField(
        default=False,
        verbose_name=_("Enable WhatsApp Notifications"),
        help_text=_("Enable system WhatsApp notifications")
    )
    
    class Meta:
        verbose_name = _("Account")
        verbose_name_plural = _("Accounts")
        unique_together = [
            ['branch', 'account_code']
        ]
        indexes = [
            models.Index(fields=['branch', 'parent']),
            models.Index(fields=['account_code']),
            models.Index(fields=['account_name']),
            models.Index(fields=['account_type']),
            models.Index(fields=['account_nature']),
            models.Index(fields=['is_header']),
            models.Index(fields=['is_active']),
            models.Index(fields=['stop_sales']),
            models.Index(fields=['current_balance']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(commission_ratio__gte=0) & models.Q(commission_ratio__lte=100),
                name='valid_commission_ratio'
            ),
            models.CheckConstraint(
                check=models.Q(credit_limit__gte=0),
                name='non_negative_credit_limit'
            ),
            models.CheckConstraint(
                check=models.Q(debit_limit__gte=0),
                name='non_negative_debit_limit'
            )
        ]
    
    def clean(self):
        """Custom validation for account."""
        super().clean()
        
        if not self.account_code.strip():
            raise ValidationError({
                'account_code': _('Account code cannot be empty.')
            })
        
        if not self.account_name.strip():
            raise ValidationError({
                'account_name': _('Account name cannot be empty.')
            })

        if self.parent:
            current = self.parent
            while current:
                if current == self:
                    raise ValidationError({
                        'parent': _('Circular parent relationship detected.')
                    })
                current = current.parent
        
        if self.is_header and hasattr(self, 'ledger_entries') and self.ledger_entries.exists():
            raise ValidationError({
                'is_header': _('Cannot make account a header account when it has transactions.')
            })
    
    def get_full_code(self) -> str:
        """Get full hierarchical account code."""
        if self.parent:
            return f"{self.parent.get_full_code()}.{self.account_code}"
        return self.account_code
    
    def get_level(self) -> int:
        """Get account level in hierarchy."""
        level = 0
        current = self.parent
        while current:
            level += 1
            current = current.parent
        return level
    
    def get_children_recursive(self):
        """Get all child accounts recursively."""
        children = list(self.children.all())
        for child in list(children):
            children.extend(child.get_children_recursive())
        return children
    
    def calculate_balance(self) -> Decimal:
        """Calculate current balance from ledger entries."""
        from apps.transactions.models import LedgerEntry
        
        entries = LedgerEntry.objects.filter(account=self, is_posted=True)
        
        total_debit = entries.aggregate(
            total=models.Sum('debit_amount')
        )['total'] or Decimal('0.00')
        
        total_credit = entries.aggregate(
            total=models.Sum('credit_amount')
        )['total'] or Decimal('0.00')
        
        # Balance depends on account type normal balance
        if self.account_type.normal_balance == 'debit':
            balance = total_debit - total_credit
        else:
            balance = total_credit - total_debit
        
        return balance
    
    def update_balance(self):
        """Update current balance field."""
        self.current_balance = self.calculate_balance()
        self.save(update_fields=['current_balance'])
    
    def can_receive_notifications(self, channel: str) -> bool:
        """Check if account can receive notifications via specific channel."""
        channel_map = {
            'email': self.wants_email_notifications and bool(self.email),
            'sms': self.wants_sms_notifications and bool(self.phone_number or self.mobile_number),
            'whatsapp': self.wants_whatsapp_notifications and bool(self.phone_number or self.mobile_number),
        }
        return channel_map.get(channel, False)
    
    def __str__(self):
        return f"{self.account_code} - {self.account_name}"


class CostCenter(AuditableModel):
    """
    Cost center management for financial reporting and analysis.
    """
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='cost_centers',
        verbose_name=_("Branch")
    )
    
    cost_center_code = models.CharField(
        max_length=20,
        verbose_name=_("Cost Center Code"),
        help_text=_("Unique cost center code")
    )
    
    cost_center_name = models.CharField(
        max_length=100,
        verbose_name=_("Cost Center Name"),
        help_text=_("Cost center display name")
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_("Parent Cost Center"),
        help_text=_("Parent cost center in hierarchy")
    )
    
    is_header = models.BooleanField(
        default=False,
        verbose_name=_("Header Cost Center"),
        help_text=_("Whether this is a header/summary cost center")
    )
    
    budget_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Budget Limit"),
        help_text=_("Budget limit for this cost center")
    )
    
    manager = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_cost_centers',
        verbose_name=_("Manager"),
        help_text=_("User responsible for this cost center")
    )
    
    class Meta:
        verbose_name = _("Cost Center")
        verbose_name_plural = _("Cost Centers")
        unique_together = [
            ['branch', 'cost_center_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['parent']),
            models.Index(fields=['is_header']),
            models.Index(fields=['is_active']),
        ]
    
    def clean(self):
        """Custom validation for cost center."""
        super().clean()
        
        if not self.cost_center_code.strip():
            raise ValidationError({
                'cost_center_code': _('Cost center code cannot be empty.')
            })
        
        if not self.cost_center_name.strip():
            raise ValidationError({
                'cost_center_name': _('Cost center name cannot be empty.')
            })
        
        # Prevent circular parent relationships
        if self.parent:
            current = self.parent
            while current:
                if current == self:
                    raise ValidationError({
                        'parent': _('Circular parent relationship detected.')
                    })
                current = current.parent
    
    def get_full_code(self) -> str:
        """Get full hierarchical cost center code."""
        if self.parent:
            return f"{self.parent.get_full_code()}.{self.cost_center_code}"
        return self.cost_center_code
    
    def __str__(self):
        return f"{self.cost_center_code} - {self.cost_center_name}"


class OpeningBalance(AuditableModel):
    """Opening balances for accounts and inventory at period start"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE, null=True, blank=True)
    fiscal_year = models.IntegerField()
    opening_date = models.DateField()
    debit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    quantity = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    unit_cost = models.DecimalField(max_digits=15, decimal_places=4, default=0)

    class Meta:
        verbose_name = _("Opening Balance")
        verbose_name_plural = _("Opening Balances")
        unique_together = [
            ['branch', 'account', 'item', 'fiscal_year']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['account']),
            models.Index(fields=['item']),
            models.Index(fields=['fiscal_year']),
        ]

    def clean(self):
        """Custom validation for opening balance."""
        super().clean()
        
        if not self.opening_date:
            raise ValidationError({
                'opening_date': _('Opening date cannot be empty.')
            })
        
        if self.debit_amount < 0 or self.credit_amount < 0:
            raise ValidationError({
                'debit_amount': _('Debit amount cannot be negative.'),
                'credit_amount': _('Credit amount cannot be negative.')
            })
        
        if self.quantity < 0 or self.unit_cost < 0:
            raise ValidationError({
                'quantity': _('Quantity cannot be negative.'),
                'unit_cost': _('Unit cost cannot be negative.')
            })
        
        if self.account and self.item:
            raise ValidationError({
                'account': _('Cannot set both account and item for opening balance.')
            })
        if not self.branch:
            raise ValidationError({
                'branch': _('Branch must be set for opening balance.')
            })
        if not self.fiscal_year:
            raise ValidationError({
                'fiscal_year': _('Fiscal year must be set for opening balance.')
            })
        if not self.opening_date:
            raise ValidationError({
                'opening_date': _('Opening date must be set for opening balance.')
            })

    def __str__(self):
        """String representation of OpeningBalance."""
        if self.account:
            return f"Opening Balance for {self.account.account_name} - {self.opening_date}"
        elif self.item:
            return f"Opening Balance for {self.item.item_name} - {self.opening_date}"
        return "Opening Balance"

class AccountingPeriod(AuditableModel):
    """Fiscal periods for financial reporting"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    period_code = models.CharField(max_length=10)
    period_name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    fiscal_year = models.IntegerField()
    is_closed = models.BooleanField(default=False)
    closed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Accounting Period")
        verbose_name_plural = _("Accounting Periods")
        unique_together = [
            ['branch', 'period_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['start_date']),
            models.Index(fields=['end_date']),
            models.Index(fields=['fiscal_year']),
        ]

    def clean(self):
        """Custom validation for accounting period."""
        super().clean()
        
        if not self.period_code.strip():
            raise ValidationError({
                'period_code': _('Period code cannot be empty.')
            })
        
        if not self.period_name.strip():
            raise ValidationError({
                'period_name': _('Period name cannot be empty.')
            })
        
        if self.start_date >= self.end_date:
            raise ValidationError({
                'start_date': _('Start date must be before end date.'),
                'end_date': _('End date must be after start date.')
            })
        
        if self.is_closed and not self.closed_by:
            raise ValidationError({
                'closed_by': _('Closed by user must be set when closing period.')
            })
        if self.is_closed and not self.closed_at:
            raise ValidationError({
                'closed_at': _('Closed at timestamp must be set when closing period.')
            })
        
        if self.is_closed and self.start_date > timezone.now().date():
            raise ValidationError({
                'start_date': _('Cannot close a period that has not started yet.')
            })
        if self.is_closed and self.end_date < timezone.now().date():
            raise ValidationError({
                'end_date': _('Cannot close a period that has already ended.')
            })
        
        def __str__(self):
            return f"Accounting Period: {self.period_name} ({self.start_date} - {self.end_date})"

class Budget(AuditableModel):
    """Budget planning and tracking"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    budget_code = models.CharField(max_length=20)
    budget_name = models.CharField(max_length=100)
    fiscal_year = models.IntegerField()
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    cost_center = models.ForeignKey(CostCenter, on_delete=models.CASCADE, null=True, blank=True)
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE, null=True, blank=True)
    budgeted_amount = models.DecimalField(max_digits=15, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    variance_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        verbose_name = _("Budget")
        verbose_name_plural = _("Budgets")
        unique_together = [
            ['branch', 'budget_code', 'fiscal_year']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['budget_code']),
            models.Index(fields=['fiscal_year']),
            models.Index(fields=['account']),
            models.Index(fields=['cost_center']),
            models.Index(fields=['item']),
        ]
        
    def __str__(self):
        return f"Budget: {self.budget_name} ({self.fiscal_year})"