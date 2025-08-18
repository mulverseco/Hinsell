import uuid
from decimal import Decimal
from django.db import IntegrityError, models
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from apps.core_apps.general import AuditableModel
from apps.core_apps.validators import validate_positive_decimal, validate_percentage
from apps.organization.models import Branch
from apps.authentication.models import User
from apps.core_apps.utils import Logger, generate_unique_code, get_default_notifications

logger = Logger(__name__)


class Currency(AuditableModel):
    """Currency model with validation and exchange rate tracking."""
    branch = models.ForeignKey(
        "organization.Branch",
        on_delete=models.CASCADE,
        related_name='currencies',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=50,
        verbose_name=_("Name"),
        help_text=_("Full currency name")
    )
    symbol = models.CharField(
        max_length=5,
        blank=True,
        null=True,
        verbose_name=_("Symbol"),
        help_text=_("Currency symbol (e.g., $, €)")
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Default Currency"),
        help_text=_("Whether this is the default currency for the branch")
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
        verbose_name=_("Exchange Rate Date")
    )
    upper_limit = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Upper Limit")
    )
    lower_limit = models.DecimalField(
        max_digits=15,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Lower Limit")
    )

    class Meta:
        verbose_name = _("Currency")
        verbose_name_plural = _("Currencies")
        unique_together = [['branch', 'code']]
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['is_default']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(exchange_rate__gt=0),
                name='currency_positive_exchange_rate'
            )
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Currency name cannot be empty.')})
        if self.upper_limit > 0 and self.lower_limit > 0 and self.lower_limit >= self.upper_limit:
            raise ValidationError({'upper_limit': _('Upper limit must be greater than lower limit.')})
        if self.upper_limit > 0 and self.exchange_rate > self.upper_limit:
            raise ValidationError({'exchange_rate': _('Exchange rate exceeds upper limit.')})
        if self.lower_limit > 0 and self.exchange_rate < self.lower_limit:
            raise ValidationError({'exchange_rate': _('Exchange rate is below lower limit.')})

    def update_exchange_rate(self, new_rate: Decimal, user: User = None) -> None:
        old_rate = self.exchange_rate
        self.exchange_rate = new_rate
        self.exchange_rate_date = timezone.now()
        if user:
            self.updated_by = user
        self.save(update_fields=['exchange_rate', 'exchange_rate_date', 'updated_by'])
        logger.info(f"Exchange rate updated for {self.code}: {old_rate} -> {new_rate}")
        CurrencyHistory.objects.create(
            branch=self.branch,
            currency=self,
            old_exchange_rate=old_rate,
            new_exchange_rate=new_rate,
            changed_by=user
        )
    def get_code_prefix(self):
        return 'CUR'

    def format_amount(self, amount: Decimal) -> str:
        return f"{self.symbol or self.code}{amount:.{self.decimal_places}f}"

    def __str__(self):
        return f"{self.code} - {self.name}"

class CurrencyHistory(AuditableModel):
    """Track currency exchange rate changes for audit purposes."""
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
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Changed By")
    )
    reason = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Reason")
    )

    class Meta:
        verbose_name = _("Currency History")
        verbose_name_plural = _("Currency History")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['currency', 'created_at']),
        ]

    def __str__(self):
        return f"{self.currency.code} rate change on {self.created_at.date()}"

class AccountType(AuditableModel):
    """Chart of accounts types and categories."""
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
        choices=AccountCategory.choices,
        verbose_name=_("Category")
    )
    normal_balance = models.CharField(
        max_length=6,
        choices=[('debit', _('Debit')), ('credit', _('Credit'))],
        verbose_name=_("Normal Balance")
    )

    class Meta:
        verbose_name = _("Account Type")
        verbose_name_plural = _("Account Types")
        unique_together = [['branch', 'code']]
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['category']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})

    def get_code_prefix(self):
        return 'ACT'

    def __str__(self):
        return f"{self.code} - {self.name}"

class Account(AuditableModel):
    """Chart of accounts with comprehensive features."""
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
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=250,
        verbose_name=_("Name")
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_("Parent Account")
    )
    account_type = models.ForeignKey(
        AccountType,
        on_delete=models.PROTECT,
        related_name='accounts',
        verbose_name=_("Account Type")
    )
    account_nature = models.CharField(
        max_length=20,
        choices=AccountNature.choices,
        default=AccountNature.OTHER,
        verbose_name=_("Account Nature")
    )
    is_header = models.BooleanField(
        default=False,
        verbose_name=_("Header Account")
    )
    is_hidden = models.BooleanField(
        default=False,
        verbose_name=_("Hidden")
    )
    is_system = models.BooleanField(
        default=False,
        verbose_name=_("System Account")
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accounts',
        verbose_name=_("Currency")
    )
    is_taxable = models.BooleanField(
        default=False,
        verbose_name=_("Taxable")
    )
    tax_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Tax Code")
    )
    commission_ratio = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Commission Ratio")
    )
    credit_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Credit Limit")
    )
    debit_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Debit Limit")
    )
    email = models.EmailField(
        blank=True,
        null=True,
        validators=[EmailValidator()],
        verbose_name=_("Email")
    )
    phone_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Phone Number")
    )
    address = models.TextField(
        blank=True,
        verbose_name=_("Address")
    )
    tax_registration_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Tax Registration Number")
    )
    stop_sales = models.BooleanField(
        default=False,
        verbose_name=_("Stop Sales")
    )
    current_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Current Balance")
    )
    budget_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Budget Amount")
    )
    enable_notifications = models.JSONField(
        default=get_default_notifications,
        verbose_name=_("Notification Settings"),
        help_text=_("Channels for notifications: {'email': bool, 'sms': bool, 'whatsapp': bool, 'in_app': bool, 'push': bool}")
    )

    class Meta:
        verbose_name = _("Account")
        verbose_name_plural = _("Accounts")
        unique_together = [['branch', 'code']]
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['account_type', 'account_nature']),
            models.Index(fields=['is_header', 'is_hidden', 'stop_sales']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(commission_ratio__gte=0) & models.Q(commission_ratio__lte=100),
                name='valid_commission_ratio'
            )
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.parent:
            current = self.parent
            while current:
                if current == self:
                    raise ValidationError({'parent': _('Circular parent relationship detected.')})
                current = current.parent
        if self.is_header and hasattr(self, 'ledger_entries') and self.ledger_entries.exists():
            raise ValidationError({'is_header': _('Cannot make account a header account with transactions.')})
        if any(self.enable_notifications.get(channel, False) for channel in ['email', 'sms', 'whatsapp']) and not (self.email or self.phone_number):
            raise ValidationError(_('Account must have email or phone for enabled notifications.'))

    def get_code_prefix(self):
        return 'AC'

    def get_full_code(self) -> str:
        if self.parent:
            return f"{self.parent.get_full_code()}.{self.code}"
        return self.code

    def get_level(self) -> int:
        level = 0
        current = self.parent
        while current:
            level += 1
            current = current.parent
        return level

    def get_children_recursive(self):
        children = list(self.children.all())
        for child in list(children):
            children.extend(child.get_children_recursive())
        return children

    def calculate_balance(self) -> Decimal:
        from apps.transactions.models import LedgerEntry
        entries = LedgerEntry.objects.filter(account=self, is_posted=True)
        total_debit = entries.aggregate(total=models.Sum('debit_amount'))['total'] or Decimal('0.00')
        total_credit = entries.aggregate(total=models.Sum('credit_amount'))['total'] or Decimal('0.00')
        return total_debit - total_credit if self.account_type.normal_balance == 'debit' else total_credit - total_debit

    def update_balance(self, user: User = None):
        old_balance = self.current_balance
        new_balance = self.calculate_balance()
        self.current_balance = new_balance
        if user:
            self.updated_by = user
        self.save(update_fields=['current_balance', 'updated_by'])
        if (self.credit_limit > 0 and new_balance > self.credit_limit) or (self.debit_limit > 0 and new_balance < -self.debit_limit):
            self.notify_limit_violation(new_balance)

    def can_receive_notifications(self, channel: str) -> bool:
        return self.enable_notifications.get(channel, False) and (
            channel == 'email' and bool(self.email) or
            channel in ('sms', 'whatsapp') and bool(self.phone_number)
        )

    def notify_limit_violation(self, balance: Decimal):
        """Send notification for credit/debit limit violation."""
        from apps.core_apps.services.messaging_service import MessagingService
        try:
            if not self.can_receive_notifications('email'):
                logger.warning(f"Cannot send notification for account {self.code}: Email not configured")
                return
            violation_type = 'credit_limit' if balance > self.credit_limit else 'debit_limit'
            limit = self.credit_limit if violation_type == 'credit_limit' else self.debit_limit
            service = MessagingService(self.branch)
            service.send_notification(
                recipient=None,
                notification_type='account_limit_violation',
                context_data={
                    'account_code': self.code,
                    'account_name': self.name,
                    'violation_type': violation_type,
                    'current_balance': str(self.currency.format_amount(balance) if self.currency else balance),
                    'limit': str(self.currency.format_amount(limit) if self.currency else limit),
                    'email': self.email
                },
                channel='email',
                priority='urgent'
            )
            logger.info(f"Notification sent for {violation_type} violation on account {self.code}")
        except Exception as e:
            logger.error(f"Error sending notification for account {self.code}: {str(e)}", exc_info=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class CostCenter(AuditableModel):
    """Cost center management for financial reporting."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='cost_centers',
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
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_("Parent Cost Center")
    )
    is_header = models.BooleanField(
        default=False,
        verbose_name=_("Header Cost Center")
    )
    budget_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Budget Limit")
    )
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_cost_centers',
        verbose_name=_("Manager")
    )

    class Meta:
        verbose_name = _("Cost Center")
        verbose_name_plural = _("Cost Centers")
        unique_together = [['branch', 'code']]
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['parent', 'is_header']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.parent:
            current = self.parent
            while current:
                if current == self:
                    raise ValidationError({'parent': _('Circular parent relationship detected.')})
                current = current.parent

    def get_code_prefix(self):
        return 'COC'

    def get_full_code(self) -> str:
        if self.parent:
            return f"{self.parent.get_full_code()}.{self.code}"
        return self.code

    def __str__(self):
        return f"{self.code} - {self.name}"

class OpeningBalance(AuditableModel):
    """Opening balances for accounts and inventory at period start."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='opening_balances',
        verbose_name=_("Branch")
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='opening_balances',
        verbose_name=_("Account")
    )
    item = models.ForeignKey(
        'inventory.Item',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='opening_balances',
        verbose_name=_("Item")
    )
    fiscal_year = models.IntegerField(
        verbose_name=_("Fiscal Year")
    )
    opening_date = models.DateField(
        verbose_name=_("Opening Date")
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
    quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Quantity")
    )
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Cost")
    )

    class Meta:
        verbose_name = _("Opening Balance")
        verbose_name_plural = _("Opening Balances")
        unique_together = [['branch', 'account', 'item', 'fiscal_year']]
        indexes = [
            models.Index(fields=['branch', 'fiscal_year']),
            models.Index(fields=['account', 'item']),
        ]

    def clean(self):
        super().clean()
        if not self.opening_date:
            raise ValidationError({'opening_date': _('Opening date cannot be empty.')})
        if self.account and self.item:
            raise ValidationError({'account': _('Cannot set both account and item for opening balance.')})
        if not (self.account or self.item):
            raise ValidationError({'account': _('Either account or item must be set.')})

    def __str__(self):
        target = self.account or self.item
        return f"Opening Balance for {target} - {self.fiscal_year}"

class AccountingPeriod(AuditableModel):
    """Fiscal periods for financial reporting."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='accounting_periods',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=50,
        verbose_name=_("Name")
    )
    start_date = models.DateField(
        verbose_name=_("Start Date")
    )
    end_date = models.DateField(
        verbose_name=_("End Date")
    )
    fiscal_year = models.IntegerField(
        verbose_name=_("Fiscal Year")
    )
    is_closed = models.BooleanField(
        default=False,
        verbose_name=_("Is Closed")
    )
    closed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='closed_periods',
        verbose_name=_("Closed By")
    )
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Closed At")
    )

    class Meta:
        verbose_name = _("Accounting Period")
        verbose_name_plural = _("Accounting Periods")
        unique_together = [['branch', 'code']]
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['fiscal_year', 'start_date', 'end_date']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.start_date >= self.end_date:
            raise ValidationError({'end_date': _('End date must be after start date.')})
        if self.is_closed and not self.closed_by:
            raise ValidationError({'closed_by': _('Closed by user must be set when closing period.')})
        if self.is_closed and not self.closed_at:
            raise ValidationError({'closed_at': _('Closed at timestamp must be set when closing period.')})

    def get_code_prefix(self):
        return 'ACP'

    def __str__(self):
        return f"{self.code} - {self.name} ({self.fiscal_year})"

class Budget(AuditableModel):
    """Budget planning and tracking."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='budgets',
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
    fiscal_year = models.IntegerField(
        verbose_name=_("Fiscal Year")
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='budgets',
        verbose_name=_("Account")
    )
    cost_center = models.ForeignKey(
        CostCenter,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='budgets',
        verbose_name=_("Cost Center")
    )
    item = models.ForeignKey(
        'inventory.Item',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='budgets',
        verbose_name=_("Item")
    )
    budgeted_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Budgeted Amount")
    )
    actual_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Actual Amount")
    )

    class Meta:
        verbose_name = _("Budget")
        verbose_name_plural = _("Budgets")
        unique_together = [['branch', 'code', 'fiscal_year']]
        indexes = [
            models.Index(fields=['branch', 'code', 'fiscal_year']),
            models.Index(fields=['account', 'cost_center', 'item']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if not any([self.account, self.cost_center, self.item]):
            raise ValidationError({'account': _('At least one of account, cost center, or item must be set.')})

    def get_code_prefix(self):
        return 'BUG'

    def calculate_variance(self) -> Decimal:
        return self.budgeted_amount - self.actual_amount

    def update_actual_amount(self, amount: Decimal) -> None:
        self.actual_amount = amount
        self.save(update_fields=['actual_amount'])

    def __str__(self):
        return f"{self.code} - {self.name} ({self.fiscal_year})"