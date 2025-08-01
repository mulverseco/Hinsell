import hashlib
from datetime import datetime, timedelta
from typing import Dict, Optional
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField

from apps.core_apps.general import AuditableModel
from apps.core_apps.encryption import EncryptedField
from apps.shared.models import Media
from apps.authentication.models import User
from apps.core_apps.utils import Logger, generate_unique_code, get_default_notifications

logger = Logger(__name__)

class LicenseType(AuditableModel):
    """License type definitions with feature restrictions."""
    class Category(models.TextChoices):
        TRIAL = 'trial', _('Trial')
        BASIC = 'basic', _('Basic')
        STANDARD = 'standard', _('Standard')
        PREMIUM = 'premium', _('Premium')
        ENTERPRISE = 'enterprise', _('Enterprise')
        CUSTOM = 'custom', _('Custom')

    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("Code"),
        default=generate_unique_code('LT')
    )
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Name")
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.BASIC,
        verbose_name=_("Category")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    max_users = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Maximum Users")
    )
    max_branches = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Maximum Branches")
    )
    max_transactions_per_month = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Max Transactions/Month")
    )
    max_storage_gb = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Max Storage (GB)")
    )
    allow_multi_currency = models.BooleanField(
        default=False,
        verbose_name=_("Allow Multi-Currency")
    )
    allow_advanced_reporting = models.BooleanField(
        default=False,
        verbose_name=_("Allow Advanced Reporting")
    )
    allow_api_access = models.BooleanField(
        default=False,
        verbose_name=_("Allow API Access")
    )
    allow_integrations = models.BooleanField(
        default=False,
        verbose_name=_("Allow Integrations")
    )
    allow_custom_fields = models.BooleanField(
        default=False,
        verbose_name=_("Allow Custom Fields")
    )
    allow_workflow_automation = models.BooleanField(
        default=False,
        verbose_name=_("Allow Workflow Automation")
    )
    support_level = models.CharField(
        max_length=20,
        choices=[
            ('none', _('No Support')),
            ('email', _('Email Support')),
            ('priority', _('Priority Support')),
            ('dedicated', _('Dedicated Support')),
        ],
        default='email',
        verbose_name=_("Support Level")
    )
    monthly_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Monthly Price")
    )
    yearly_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Yearly Price")
    )
    is_available = models.BooleanField(
        default=True,
        verbose_name=_("Available")
    )

    class Meta:
        verbose_name = _("License Type")
        verbose_name_plural = _("License Types")
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['code', 'category']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})

    def __str__(self):
        return f"{self.code} - {self.name} ({self.get_category_display()})"

class License(AuditableModel):
    """Company license with comprehensive validation and control."""
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending Activation')
        ACTIVE = 'active', _('Active')
        EXPIRED = 'expired', _('Expired')
        SUSPENDED = 'suspended', _('Suspended')
        REVOKED = 'revoked', _('Revoked')
        TRIAL = 'trial', _('Trial')

    license_key = models.CharField(
        max_length=255,
        unique=True,
        verbose_name=_("License Key")
    )
    license_code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("Code"),
        default=generate_unique_code('LIC')
    )
    license_hash = models.CharField(
        max_length=64,
        unique=True,
        verbose_name=_("License Hash")
    )
    company = models.OneToOneField(
        'Company',
        on_delete=models.CASCADE,
        related_name='license',
        verbose_name=_("Company")
    )
    license_type = models.ForeignKey(
        LicenseType,
        on_delete=models.PROTECT,
        related_name='licenses',
        verbose_name=_("License Type")
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name=_("Status")
    )
    issued_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Issued Date")
    )
    activation_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Activation Date")
    )
    expiry_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Expiry Date")
    )
    last_validated = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Validated")
    )
    current_users = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Current Users")
    )
    current_branches = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Current Branches")
    )
    monthly_transactions = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Monthly Transactions")
    )
    storage_used_gb = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name=_("Storage Used (GB)")
    )
    hardware_fingerprint = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Hardware Fingerprint")
    )
    license_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("License Data")
    )
    violation_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Violation Count")
    )
    last_violation_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Violation Date")
    )
    licensee_name = models.CharField(
        max_length=200,
        verbose_name=_("Licensee Name")
    )
    licensee_email = models.EmailField(
        verbose_name=_("Licensee Email")
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes")
    )

    class Meta:
        verbose_name = _("License")
        verbose_name_plural = _("Licenses")
        indexes = [
            models.Index(fields=['license_code', 'license_key', 'license_hash']),
            models.Index(fields=['status', 'company']),
        ]

    def clean(self):
        super().clean()
        if not self.license_key.strip():
            raise ValidationError({'license_key': _('License key cannot be empty.')})
        if self.expiry_date and self.expiry_date <= timezone.now() and self.status == self.Status.ACTIVE:
            raise ValidationError({'expiry_date': _('Cannot set expiry date in the past for active license.')})

    def save(self, *args, **kwargs):
        if not self.license_hash:
            self.license_hash = self.generate_license_hash(self.license_key)
        if self.license_type.category == self.license_type.Category.TRIAL and self.status == self.Status.PENDING:
            self.activate()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_license_key() -> str:
        key_uuid = uuid.uuid4()
        timestamp = int(datetime.now().timestamp())
        key_parts = [
            key_uuid.hex[:8].upper(),
            key_uuid.hex[8:16].upper(),
            key_uuid.hex[16:24].upper(),
            key_uuid.hex[24:32].upper(),
        ]
        return '-'.join(key_parts)

    @staticmethod
    def generate_license_hash(license_key: str) -> str:
        return hashlib.sha256(license_key.encode()).hexdigest()

    def activate(self) -> bool:
        if self.status != self.Status.PENDING:
            return False
        self.status = self.Status.ACTIVE if self.license_type.category != self.license_type.Category.TRIAL else self.Status.TRIAL
        self.activation_date = timezone.now()
        if self.license_type.category == self.license_type.Category.TRIAL and not self.expiry_date:
            self.expiry_date = timezone.now() + timedelta(days=30)
        self.save()
        return True

    def suspend(self, reason: str = "") -> bool:
        if self.status not in [self.Status.ACTIVE, self.Status.TRIAL]:
            return False
        self.status = self.Status.SUSPENDED
        if reason:
            self.notes = f"{self.notes}\nSuspended: {reason}" if self.notes else f"Suspended: {reason}"
        self.save()
        return True

    def revoke(self, reason: str = "") -> bool:
        self.status = self.Status.REVOKED
        if reason:
            self.notes = f"{self.notes}\nRevoked: {reason}" if self.notes else f"Revoked: {reason}"
        self.save()
        return True

    def is_valid(self) -> bool:
        if self.status not in [self.Status.ACTIVE, self.Status.TRIAL]:
            return False
        if self.expiry_date and self.expiry_date <= timezone.now():
            self.status = self.Status.EXPIRED
            self.save()
            return False
        return True

    def days_until_expiry(self) -> Optional[int]:
        if not self.expiry_date:
            return None
        delta = self.expiry_date - timezone.now()
        return max(0, delta.days)

    def validate_usage_limits(self) -> Dict[str, bool]:
        violations = {}
        if self.license_type.max_users:
            violations['users'] = self.current_users > self.license_type.max_users
        if self.license_type.max_branches:
            violations['branches'] = self.current_branches > self.license_type.max_branches
        if self.license_type.max_transactions_per_month:
            violations['transactions'] = self.monthly_transactions > self.license_type.max_transactions_per_month
        if self.license_type.max_storage_gb:
            violations['storage'] = float(self.storage_used_gb) > self.license_type.max_storage_gb
        return violations

    def has_feature(self, feature_name: str) -> bool:
        feature_map = {
            'multi_currency': self.license_type.allow_multi_currency,
            'advanced_reporting': self.license_type.allow_advanced_reporting,
            'api_access': self.license_type.allow_api_access,
            'integrations': self.license_type.allow_integrations,
            'custom_fields': self.license_type.allow_custom_fields,
            'workflow_automation': self.license_type.allow_workflow_automation,
        }
        return feature_map.get(feature_name, False)

    def update_usage_stats(self):
        from apps.authentication.models import User
        self.current_users = User.objects.filter(default_branch__company=self.company, is_active=True).count()
        self.current_branches = self.company.branches.filter(is_active=True).count()
        self.save()

    def record_violation(self, violation_type: str, details: str = ""):
        self.violation_count += 1
        self.last_violation_date = timezone.now()
        violation_note = f"Violation #{self.violation_count}: {violation_type}"
        if details:
            violation_note += f" - {details}"
        self.notes = f"{self.notes}\n{violation_note}" if self.notes else violation_note
        self.save()
        logger.warning(f"License violation for company {self.company.company_name}: {violation_type}")

    def validate_and_update(self) -> Dict[str, any]:
        from apps.core_apps.services.messaging_service import MessagingService
        self.last_validated = timezone.now()
        result = {
            'valid': True,
            'status': self.status,
            'violations': [],
            'warnings': [],
            'expires_in_days': self.days_until_expiry(),
        }
        if not self.is_valid():
            result['valid'] = False
            result['violations'].append(f"License status: {self.get_status_display()}")
        usage_violations = self.validate_usage_limits()
        for limit_type, violated in usage_violations.items():
            if violated:
                result['violations'].append(f"Exceeded {limit_type} limit")
                self.record_violation(f"Exceeded {limit_type} limit")
        days_left = self.days_until_expiry()
        if days_left is not None and days_left <= 7:
            result['warnings'].append(f"License expires in {days_left} days")
            try:
                primary_branch = self.company.branches.filter(is_primary=True).first()
                if primary_branch:
                    service = MessagingService(branch=primary_branch)
                    service.send_notification(
                        recipient=None,
                        notification_type='system_maintenance',
                        context_data={
                            'email': self.licensee_email,
                            'days_left': days_left,
                            'company_name': self.company.company_name
                        },
                        channel='email',
                        priority='urgent'
                    )
            except Exception as e:
                logger.error(f"Error sending license expiry notification for {self.company.company_name}: {str(e)}", exc_info=True)
        self.save()
        return result

    def __str__(self):
        return f"{self.license_code} - {self.company.company_name} ({self.get_status_display()})"

class Company(AuditableModel):
    """Company master data with enhanced validation and features."""
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("Code"),
        default=generate_unique_code('CMP')
    )
    company_name = models.CharField(
        max_length=200,
        verbose_name=_("Name")
    )
    company_name_english = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Name (English)")
    )
    registration_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        verbose_name=_("Registration Number")
    )
    tax_id = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        verbose_name=_("Tax ID")
    )
    email = models.EmailField(
        blank=True,
        null=True,
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email Address")
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
    website = models.URLField(
        blank=True,
        null=True,
        verbose_name=_("Website")
    )
    industry = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Industry")
    )
    established_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Established Date")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    logo = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='company_logos',
        verbose_name=_("Logo"),
        limit_choices_to={'media_type': 'image'}
    )

    class Meta:
        verbose_name = _("Company")
        verbose_name_plural = _("Companies")
        indexes = [
            models.Index(fields=['code', 'company_name']),
            models.Index(fields=['registration_number', 'tax_id']),
        ]

    def clean(self):
        super().clean()
        if not self.company_name.strip():
            raise ValidationError({'company_name': _('Name cannot be empty.')})
        if self.logo and self.logo.media_type != 'image':
            raise ValidationError({'logo': _('Logo must be an image media type.')})

    def save(self, *args, **kwargs):
        if self.logo and not self.logo.alt_text:
            self.logo.alt_text = f"Logo of {self.company_name}"
            self.logo.save()
        super().save(*args, **kwargs)

    def is_authorized(self) -> bool:
        try:
            return self.license.is_valid()
        except License.DoesNotExist:
            return False

    def get_license_status(self) -> Dict[str, any]:
        try:
            return self.license.validate_and_update()
        except License.DoesNotExist:
            return {
                'valid': False,
                'status': 'no_license',
                'violations': ['No license found'],
                'warnings': [],
                'expires_in_days': None,
            }

    def has_feature(self, feature_name: str) -> bool:
        try:
            return self.license.has_feature(feature_name)
        except License.DoesNotExist:
            return False

    def __str__(self):
        return f"{self.code} - {self.company_name}"

class Branch(AuditableModel):
    """Enhanced branch information with comprehensive settings and validation."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='branches',
        verbose_name=_("Company")
    )
    branch_code = models.CharField(
        max_length=20,
        verbose_name=_("Code"),
        default=generate_unique_code('BR')
    )
    branch_name = models.CharField(
        max_length=200,
        verbose_name=_("Name")
    )
    branch_name_english = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Name (English)")
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_("Primary Branch")
    )
    is_headquarters = models.BooleanField(
        default=False,
        verbose_name=_("Headquarters")
    )
    fiscal_year_start_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        default=1,
        verbose_name=_("Fiscal Year Start Month")
    )
    fiscal_year_end_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        default=12,
        verbose_name=_("Fiscal Year End Month")
    )
    current_fiscal_year = models.IntegerField(
        verbose_name=_("Current Fiscal Year")
    )
    use_cost_center = models.BooleanField(
        default=False,
        verbose_name=_("Use Cost Center")
    )
    use_sales_tax = models.BooleanField(
        default=False,
        verbose_name=_("Use Sales Tax")
    )
    use_vat_tax = models.BooleanField(
        default=False,
        verbose_name=_("Use VAT Tax")
    )
    use_carry_fee = models.BooleanField(
        default=False,
        verbose_name=_("Use Carry Fee")
    )
    use_expire_date = models.BooleanField(
        default=True,
        verbose_name=_("Use Expire Date")
    )
    use_batch_no = models.BooleanField(
        default=True,
        verbose_name=_("Use Batch Number")
    )
    use_barcode = models.BooleanField(
        default=True,
        verbose_name=_("Use Barcode")
    )
    use_multi_currency = models.BooleanField(
        default=False,
        verbose_name=_("Use Multi-Currency")
    )
    email = models.EmailField(
        blank=True,
        null=True,
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email Address")
    )
    phone_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Phone Number")
    )
    fax_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Fax Number")
    )
    address = models.TextField(
        blank=True,
        verbose_name=_("Address")
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("City")
    )
    state_province = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("State/Province")
    )
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Country")
    )
    postal_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Postal Code")
    )
    default_currency = models.ForeignKey(
        "accounting.Currency",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='default_branches',
        verbose_name=_("Default Currency")
    )
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        verbose_name=_("Timezone")
    )
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_branches',
        verbose_name=_("Branch Manager")
    )

    class Meta:
        verbose_name = _("Branch")
        verbose_name_plural = _("Branches")
        unique_together = [['company', 'branch_code'], ['company', 'branch_name']]
        indexes = [
            models.Index(fields=['company', 'branch_code']),
            models.Index(fields=['is_primary', 'is_headquarters']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(fiscal_year_start_month__gte=1) & models.Q(fiscal_year_start_month__lte=12),
                name='valid_fiscal_start_month'
            ),
            models.CheckConstraint(
                check=models.Q(fiscal_year_end_month__gte=1) & models.Q(fiscal_year_end_month__lte=12),
                name='valid_fiscal_end_month'
            )
        ]

    def clean(self):
        super().clean()
        if not self.branch_name.strip():
            raise ValidationError({'branch_name': _('Name cannot be empty.')})
        if not self.branch_code.strip():
            raise ValidationError({'branch_code': _('Code cannot be empty.')})
        if self.fiscal_year_start_month == self.fiscal_year_end_month:
            raise ValidationError({'fiscal_year_end_month': _('Fiscal year start and end months cannot be the same.')})
        if self.company_id:
            try:
                license = self.company.license
                if license.license_type.max_branches:
                    current_branches = self.company.branches.filter(is_active=True).count()
                    if self.pk is None:
                        current_branches += 1
                    if current_branches > license.license_type.max_branches:
                        raise ValidationError({
                            '__all__': _(f'License allows maximum {license.license_type.max_branches} branches.')
                        })
                if self.use_multi_currency and not license.has_feature('multi_currency'):
                    raise ValidationError({'use_multi_currency': _('Multi-currency feature not available in current license.')})
            except License.DoesNotExist:
                raise ValidationError({'__all__': _('Company must have a valid license to create branches.')})

    def save(self, *args, **kwargs):
        if not self.company.is_authorized():
            raise ValidationError(_('Company is not authorized to use the system.'))
        if self.is_primary:
            Branch.objects.filter(company=self.company, is_primary=True).exclude(id=self.id).update(is_primary=False)
        if self.is_headquarters:
            Branch.objects.filter(company=self.company, is_headquarters=True).exclude(id=self.id).update(is_headquarters=False)
        super().save(*args, **kwargs)
        try:
            self.company.license.update_usage_stats()
        except License.DoesNotExist:
            pass

    def get_full_name(self) -> str:
        return f"{self.company.company_name} - {self.branch_name}"

    def get_address_display(self) -> str:
        address_parts = [self.address, self.city, self.state_province, self.country, self.postal_code]
        return ', '.join(filter(None, address_parts))

    def __str__(self):
        return f"{self.branch_code} - {self.get_full_name()}"

class SystemSettings(AuditableModel):
    """System-wide configuration settings with enhanced security."""
    branch = models.OneToOneField(
        Branch,
        on_delete=models.CASCADE,
        related_name='system_settings',
        verbose_name=_("Branch")
    )
    database_server = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Server")
    )
    database_name = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Name")
    )
    database_username = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Username")
    )
    database_password = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Password")
    )
    connection_timeout = models.PositiveIntegerField(
        default=30,
        verbose_name=_("Connection Timeout")
    )
    session_timeout = models.PositiveIntegerField(
        default=1800,
        verbose_name=_("Session Timeout")
    )
    max_login_attempts = models.PositiveIntegerField(
        default=5,
        verbose_name=_("Max Login Attempts")
    )
    account_lockout_duration = models.PositiveIntegerField(
        default=30,
        verbose_name=_("Account Lockout Duration")
    )
    show_warnings = models.BooleanField(
        default=True,
        verbose_name=_("Show Warnings")
    )
    check_sales_price = models.BooleanField(
        default=True,
        verbose_name=_("Check Sales Price")
    )
    enable_photo_storage = models.BooleanField(
        default=True,
        verbose_name=_("Enable Photo Storage")
    )
    reports_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Reports Path")
    )
    backup_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Backup Path")
    )
    notifications = models.JSONField(
        default=get_default_notifications,
        verbose_name=_("Notification Settings"),
        help_text=_("Channels for system notifications: {'email': bool, 'sms': bool, 'whatsapp': bool, 'in_app': bool, 'push': bool}")
    )
    require_two_factor_auth = models.BooleanField(
        default=False,
        verbose_name=_("Require Two-Factor Authentication")
    )
    password_expiry_days = models.PositiveIntegerField(
        default=90,
        verbose_name=_("Password Expiry Days")
    )
    minimum_password_length = models.PositiveIntegerField(
        default=8,
        validators=[MinValueValidator(6), MaxValueValidator(50)],
        verbose_name=_("Minimum Password Length")
    )

    class Meta:
        verbose_name = _("System Settings")
        verbose_name_plural = _("System Settings")
        constraints = [
            models.CheckConstraint(check=models.Q(connection_timeout__gt=0), name='positive_connection_timeout'),
            models.CheckConstraint(check=models.Q(session_timeout__gt=0), name='positive_session_timeout'),
            models.CheckConstraint(check=models.Q(max_login_attempts__gt=0), name='positive_max_login_attempts')
        ]

    def clean(self):
        super().clean()
        if any(self.notifications.get(channel, False) for channel in ['email', 'sms', 'whatsapp']) and not (self.branch.email or self.branch.phone_number):
            raise ValidationError(_('Branch must have email or phone for enabled notifications.'))

    def __str__(self):
        return f"Settings for {self.branch.branch_name}"

class SystemConfiguration(AuditableModel):
    """Extended system configuration beyond basic settings."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='configurations',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("Code"),
        default=generate_unique_code('CFG')
    )
    config_key = models.CharField(
        max_length=100,
        verbose_name=_("Key")
    )
    config_value = models.TextField(
        verbose_name=_("Value")
    )
    config_type = models.CharField(
        max_length=20,
        choices=[
            ('string', 'String'),
            ('integer', 'Integer'),
            ('decimal', 'Decimal'),
            ('boolean', 'Boolean'),
            ('json', 'JSON')
        ],
        verbose_name=_("Type")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    is_system = models.BooleanField(
        default=False,
        verbose_name=_("System Configuration")
    )

    class Meta:
        verbose_name = _("System Configuration")
        verbose_name_plural = _("System Configurations")
        unique_together = [['branch', 'config_key']]
        indexes = [
            models.Index(fields=['branch', 'config_key']),
            models.Index(fields=['code']),
        ]

    def clean(self):
        super().clean()
        if not self.config_key.strip():
            raise ValidationError({'config_key': _('Key cannot be empty.')})
        if not self.config_value.strip():
            raise ValidationError({'config_value': _('Value cannot be empty.')})

    def __str__(self):
        return f"{self.code} - {self.config_key} ({self.branch.branch_name})"

class KeyboardShortcuts(AuditableModel):
    """Keyboard shortcuts configuration for system actions."""
    class Category(models.TextChoices):
        GENERAL = 'general', _('General')
        NAVIGATION = 'navigation', _('Navigation')
        FORMS = 'forms', _('Forms')
        REPORTS = 'reports', _('Reports')
        INVENTORY = 'inventory', _('Inventory')
        SALES = 'sales', _('Sales')
        ACCOUNTING = 'accounting', _('Accounting')
        ADMIN = 'admin', _('Administration')
        CUSTOM = 'custom', _('Custom')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='keyboard_shortcuts',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("Code"),
        default=generate_unique_code('KBD')
    )
    action_name = models.CharField(
        max_length=100,
        verbose_name=_("Action Name")
    )
    display_name = models.CharField(
        max_length=150,
        verbose_name=_("Display Name")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.GENERAL,
        verbose_name=_("Category")
    )
    key_combination = models.CharField(
        max_length=50,
        verbose_name=_("Key Combination")
    )
    primary_key = models.CharField(
        max_length=20,
        verbose_name=_("Primary Key")
    )
    modifiers = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Modifiers")
    )
    is_enabled = models.BooleanField(
        default=True,
        verbose_name=_("Enabled")
    )
    is_system_default = models.BooleanField(
        default=False,
        verbose_name=_("System Default")
    )
    is_customizable = models.BooleanField(
        default=True,
        verbose_name=_("Customizable")
    )
    is_global = models.BooleanField(
        default=False,
        verbose_name=_("Global Shortcut")
    )
    context = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Context")
    )
    page_url_pattern = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Page URL Pattern")
    )
    priority = models.PositiveIntegerField(
        default=100,
        verbose_name=_("Priority")
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Sort Order")
    )
    javascript_function = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("JavaScript Function")
    )
    alternative_combination = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Alternative Combination")
    )

    class Meta:
        verbose_name = _("Keyboard Shortcut")
        verbose_name_plural = _("Keyboard Shortcuts")
        unique_together = [['branch', 'action_name'], ['branch', 'key_combination', 'context']]
        indexes = [
            models.Index(fields=['branch', 'category', 'is_enabled']),
            models.Index(fields=['code', 'action_name']),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(priority__gt=0), name='positive_priority'),
            models.CheckConstraint(check=models.Q(sort_order__gte=0), name='non_negative_sort_order')
        ]

    def clean(self):
        super().clean()
        if not self.action_name.strip():
            raise ValidationError({'action_name': _('Action name cannot be empty.')})
        if not self.key_combination.strip():
            raise ValidationError({'key_combination': _('Key combination cannot be empty.')})
        if not self.primary_key.strip():
            raise ValidationError({'primary_key': _('Primary key cannot be empty.')})
        if not self._is_valid_key_combination(self.key_combination):
            raise ValidationError({'key_combination': _('Invalid key combination format.')})

    def _is_valid_key_combination(self, combination):
        if not combination:
            return False
        parts = combination.split('+')
        if len(parts) < 1:
            return False
        valid_modifiers = ['ctrl', 'alt', 'shift', 'meta', 'cmd']
        for part in parts[:-1]:
            if part.lower() not in valid_modifiers:
                return False
        return True

    def get_formatted_combination(self):
        return self.key_combination.replace('+', ' + ')

    def get_modifiers_list(self):
        return [mod.strip() for mod in self.modifiers.split('+') if mod.strip()] if self.modifiers else []

    def is_conflict_with(self, other_shortcut):
        if not other_shortcut or not other_shortcut.is_enabled:
            return False
        if (self.key_combination.lower() == other_shortcut.key_combination.lower() and
                self.context == other_shortcut.context):
            return True
        if (self.alternative_combination and
                self.alternative_combination.lower() == other_shortcut.key_combination.lower()):
            return True
        if (other_shortcut.alternative_combination and
                self.key_combination.lower() == other_shortcut.alternative_combination.lower()):
            return True
        return False

    def __str__(self):
        return f"{self.code} - {self.display_name} ({self.key_combination})"