"""
Enhanced organization and branch management models with licensing system.
Handles organizational structure, settings, configuration, and licensing.
"""

import logging
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField

from apps.core_apps.general import AuditableModel
from apps.core_apps.encryption import EncryptedField

logger = logging.getLogger(__name__)

class LicenseType(AuditableModel):
    """
    License type definitions with feature restrictions.
    """
    
    LICENSE_CATEGORIES = [
        ('trial', _('Trial')),
        ('basic', _('Basic')),
        ('standard', _('Standard')),
        ('premium', _('Premium')),
        ('enterprise', _('Enterprise')),
        ('custom', _('Custom')),
    ]
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("License Type Name"),
        help_text=_("Name of the license type")
    )
    
    category = models.CharField(
        max_length=20,
        choices=LICENSE_CATEGORIES,
        default='basic',
        verbose_name=_("Category"),
        help_text=_("License category")
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Description of the license type")
    )
    
    # Usage limits
    max_users = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Maximum Users"),
        help_text=_("Maximum number of users allowed (null = unlimited)")
    )
    
    max_branches = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Maximum Branches"),
        help_text=_("Maximum number of branches allowed (null = unlimited)")
    )
    
    max_transactions_per_month = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Max Transactions/Month"),
        help_text=_("Maximum transactions per month (null = unlimited)")
    )
    
    max_storage_gb = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Max Storage (GB)"),
        help_text=_("Maximum storage in GB (null = unlimited)")
    )
    
    # Feature flags
    allow_multi_currency = models.BooleanField(
        default=False,
        verbose_name=_("Allow Multi-Currency"),
        help_text=_("Allow multi-currency functionality")
    )
    
    allow_advanced_reporting = models.BooleanField(
        default=False,
        verbose_name=_("Allow Advanced Reporting"),
        help_text=_("Allow advanced reporting features")
    )
    
    allow_api_access = models.BooleanField(
        default=False,
        verbose_name=_("Allow API Access"),
        help_text=_("Allow API access")
    )
    
    allow_integrations = models.BooleanField(
        default=False,
        verbose_name=_("Allow Integrations"),
        help_text=_("Allow third-party integrations")
    )
    
    allow_custom_fields = models.BooleanField(
        default=False,
        verbose_name=_("Allow Custom Fields"),
        help_text=_("Allow custom field creation")
    )
    
    allow_workflow_automation = models.BooleanField(
        default=False,
        verbose_name=_("Allow Workflow Automation"),
        help_text=_("Allow workflow automation features")
    )
    
    # Support level
    support_level = models.CharField(
        max_length=20,
        choices=[
            ('none', _('No Support')),
            ('email', _('Email Support')),
            ('priority', _('Priority Support')),
            ('dedicated', _('Dedicated Support')),
        ],
        default='email',
        verbose_name=_("Support Level"),
        help_text=_("Level of support provided")
    )
    
    monthly_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Monthly Price"),
        help_text=_("Monthly subscription price")
    )
    
    yearly_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Yearly Price"),
        help_text=_("Yearly subscription price")
    )
    
    is_available = models.BooleanField(
        default=True,
        verbose_name=_("Available"),
        help_text=_("Whether this license type is available for new subscriptions")
    )
    
    class Meta:
        verbose_name = _("License Type")
        verbose_name_plural = _("License Types")
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class License(AuditableModel):
    """
    Company license with comprehensive validation and control.
    """
    
    LICENSE_STATUS_CHOICES = [
        ('pending', _('Pending Activation')),
        ('active', _('Active')),
        ('expired', _('Expired')),
        ('suspended', _('Suspended')),
        ('revoked', _('Revoked')),
        ('trial', _('Trial')),
    ]
    
    # License identification
    license_key = models.CharField(
        max_length=255,
        unique=True,
        verbose_name=_("License Key"),
        help_text=_("Unique license key")
    )
    
    license_hash = models.CharField(
        max_length=64,
        unique=True,
        verbose_name=_("License Hash"),
        help_text=_("SHA-256 hash of license key for validation")
    )
    
    company = models.OneToOneField(
        'Company',
        on_delete=models.CASCADE,
        related_name='license',
        verbose_name=_("Company"),
        help_text=_("Company this license belongs to")
    )
    
    license_type = models.ForeignKey(
        LicenseType,
        on_delete=models.PROTECT,
        related_name='licenses',
        verbose_name=_("License Type"),
        help_text=_("Type of license")
    )
    
    # License validity
    status = models.CharField(
        max_length=20,
        choices=LICENSE_STATUS_CHOICES,
        default='pending',
        verbose_name=_("Status"),
        help_text=_("Current license status")
    )
    
    issued_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Issued Date"),
        help_text=_("Date when license was issued")
    )
    
    activation_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Activation Date"),
        help_text=_("Date when license was activated")
    )
    
    expiry_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Expiry Date"),
        help_text=_("Date when license expires (null = never expires)")
    )
    
    last_validated = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Validated"),
        help_text=_("Last time license was validated")
    )
    
    # Usage tracking
    current_users = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Current Users"),
        help_text=_("Current number of active users")
    )
    
    current_branches = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Current Branches"),
        help_text=_("Current number of branches")
    )
    
    monthly_transactions = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Monthly Transactions"),
        help_text=_("Transactions this month")
    )
    
    storage_used_gb = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name=_("Storage Used (GB)"),
        help_text=_("Storage currently used in GB")
    )
    
    # Hardware binding (optional)
    hardware_fingerprint = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Hardware Fingerprint"),
        help_text=_("Hardware fingerprint for license binding")
    )
    
    # License metadata
    license_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("License Data"),
        help_text=_("Additional license configuration data")
    )
    
    # Violation tracking
    violation_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Violation Count"),
        help_text=_("Number of license violations")
    )
    
    last_violation_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Violation Date"),
        help_text=_("Date of last license violation")
    )
    
    # Contact information
    licensee_name = models.CharField(
        max_length=200,
        verbose_name=_("Licensee Name"),
        help_text=_("Name of the license holder")
    )
    
    licensee_email = models.EmailField(
        verbose_name=_("Licensee Email"),
        help_text=_("Email of the license holder")
    )
    
    # Notes and comments
    notes = models.TextField(
        blank=True,
        verbose_name=_("Notes"),
        help_text=_("Internal notes about this license")
    )
    
    class Meta:
        verbose_name = _("License")
        verbose_name_plural = _("Licenses")
        indexes = [
            models.Index(fields=['license_key']),
            models.Index(fields=['license_hash']),
            models.Index(fields=['status']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['company']),
        ]
    
    def clean(self):
        """Custom validation for license."""
        super().clean()
        
        if not self.license_key.strip():
            raise ValidationError({
                'license_key': _('License key cannot be empty.')
            })
        
        if self.expiry_date and self.expiry_date <= timezone.now():
            if self.status == 'active':
                raise ValidationError({
                    'expiry_date': _('Cannot set expiry date in the past for active license.')
                })
    
    def save(self, *args, **kwargs):
        """Override save to generate license hash."""
        if not self.license_hash:
            self.license_hash = self.generate_license_hash(self.license_key)
        
        # Auto-activate trial licenses
        if self.license_type.category == 'trial' and self.status == 'pending':
            self.activate()
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_license_key() -> str:
        """Generate a new license key."""
        # Generate a UUID-based license key
        key_uuid = uuid.uuid4()
        timestamp = int(datetime.now().timestamp())
        
        # Create a formatted license key
        key_parts = [
            key_uuid.hex[:8].upper(),
            key_uuid.hex[8:16].upper(),
            key_uuid.hex[16:24].upper(),
            key_uuid.hex[24:32].upper(),
        ]
        
        return '-'.join(key_parts)
    
    @staticmethod
    def generate_license_hash(license_key: str) -> str:
        """Generate SHA-256 hash of license key."""
        return hashlib.sha256(license_key.encode()).hexdigest()
    
    def activate(self) -> bool:
        """Activate the license."""
        if self.status != 'pending':
            return False
        
        self.status = 'active'
        self.activation_date = timezone.now()
        
        # Set expiry date for trial licenses
        if self.license_type.category == 'trial' and not self.expiry_date:
            self.expiry_date = timezone.now() + timedelta(days=30)
        
        self.save()
        return True
    
    def suspend(self, reason: str = "") -> bool:
        """Suspend the license."""
        if self.status not in ['active', 'trial']:
            return False
        
        self.status = 'suspended'
        if reason:
            self.notes = f"{self.notes}\nSuspended: {reason}" if self.notes else f"Suspended: {reason}"
        self.save()
        return True
    
    def revoke(self, reason: str = "") -> bool:
        """Revoke the license."""
        self.status = 'revoked'
        if reason:
            self.notes = f"{self.notes}\nRevoked: {reason}" if self.notes else f"Revoked: {reason}"
        self.save()
        return True
    
    def is_valid(self) -> bool:
        """Check if license is currently valid."""
        if self.status not in ['active', 'trial']:
            return False
        
        if self.expiry_date and self.expiry_date <= timezone.now():
            # Auto-expire the license
            self.status = 'expired'
            self.save()
            return False
        
        return True
    
    def is_expired(self) -> bool:
        """Check if license is expired."""
        if not self.expiry_date:
            return False
        return self.expiry_date <= timezone.now()
    
    def days_until_expiry(self) -> Optional[int]:
        """Get number of days until license expires."""
        if not self.expiry_date:
            return None
        
        delta = self.expiry_date - timezone.now()
        return max(0, delta.days)
    
    def validate_usage_limits(self) -> Dict[str, bool]:
        """Validate current usage against license limits."""
        violations = {}
        
        # Check user limit
        if self.license_type.max_users:
            violations['users'] = self.current_users > self.license_type.max_users
        
        # Check branch limit
        if self.license_type.max_branches:
            violations['branches'] = self.current_branches > self.license_type.max_branches
        
        # Check transaction limit
        if self.license_type.max_transactions_per_month:
            violations['transactions'] = self.monthly_transactions > self.license_type.max_transactions_per_month
        
        # Check storage limit
        if self.license_type.max_storage_gb:
            violations['storage'] = float(self.storage_used_gb) > self.license_type.max_storage_gb
        
        return violations
    
    def has_feature(self, feature_name: str) -> bool:
        """Check if license allows a specific feature."""
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
        """Update current usage statistics."""
        from apps.authentication.models import User
        
        # Update user count - Fix the query to use default_branch instead of company
        self.current_users = User.objects.filter(
            default_branch__company=self.company,
            is_active=True
        ).count()
        
        # Update branch count
        self.current_branches = self.company.branches.filter(is_active=True).count()
        
        # Update monthly transactions (implement based on your transaction model)
        # Example implementation:
        # from django.utils import timezone
        # from apps.accounting.models import TransactionHeader
        # 
        # current_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # self.monthly_transactions = TransactionHeader.objects.filter(
        #     branch__company=self.company,
        #     created_at__gte=current_month_start
        # ).count()
        
        self.save()
    
    def record_violation(self, violation_type: str, details: str = ""):
        """Record a license violation."""
        self.violation_count += 1
        self.last_violation_date = timezone.now()
        
        violation_note = f"Violation #{self.violation_count}: {violation_type}"
        if details:
            violation_note += f" - {details}"
        
        self.notes = f"{self.notes}\n{violation_note}" if self.notes else violation_note
        self.save()
        
        # Log the violation
        logger.warning(
            f"License violation for company {self.company.company_name}: {violation_type}",
            extra={'company_id': self.company.id, 'license_key': self.license_key}
        )
    
    def validate_and_update(self) -> Dict[str, any]:
        """Comprehensive license validation and update."""
        self.last_validated = timezone.now()
        
        result = {
            'valid': True,
            'status': self.status,
            'violations': [],
            'warnings': [],
            'expires_in_days': self.days_until_expiry(),
        }
        
        # Check if license is valid
        if not self.is_valid():
            result['valid'] = False
            result['violations'].append(f"License status: {self.get_status_display()}")
        
        # Check usage limits
        usage_violations = self.validate_usage_limits()
        for limit_type, violated in usage_violations.items():
            if violated:
                result['violations'].append(f"Exceeded {limit_type} limit")
                self.record_violation(f"Exceeded {limit_type} limit")
        
        # Check for expiry warnings
        days_left = self.days_until_expiry()
        if days_left is not None:
            if days_left <= 7:
                result['warnings'].append(f"License expires in {days_left} days")
            elif days_left <= 30:
                result['warnings'].append(f"License expires in {days_left} days")
        
        self.save()
        return result
    
    def __str__(self):
        return f"{self.company.company_name} - {self.license_type.name} ({self.get_status_display()})"

class Company(AuditableModel):
    """
    Company master data with enhanced validation and features.
    """
    
    company_name = models.CharField(
        max_length=200,
        verbose_name=_("Company Name"),
        help_text=_("Official company name")
    )
    
    company_name_english = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Company Name (English)"),
        help_text=_("Company name in English")
    )
    
    registration_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        verbose_name=_("Registration Number"),
        help_text=_("Official company registration number")
    )
    
    tax_id = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        verbose_name=_("Tax ID"),
        help_text=_("Company tax identification number")
    )
    
    # Contact information
    email = models.EmailField(
        blank=True,
        null=True,
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email Address"),
        help_text=_("Primary company email address")
    )
    
    phone_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Phone Number"),
        help_text=_("Primary company phone number")
    )
    
    address = models.TextField(
        blank=True,
        verbose_name=_("Address"),
        help_text=_("Company headquarters address")
    )
    
    website = models.URLField(
        blank=True,
        null=True,
        verbose_name=_("Website"),
        help_text=_("Company website URL")
    )
    
    # Business information
    industry = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Industry"),
        help_text=_("Industry sector")
    )
    
    established_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Established Date"),
        help_text=_("Date when company was established")
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Company description")
    )
    
    logo = models.ImageField(
        upload_to='company_logos/',
        blank=True,
        null=True,
        verbose_name=_("Logo"),
        help_text=_("Company logo")
    )
    
    class Meta:
        verbose_name = _("Company")
        verbose_name_plural = _("Companies")
        indexes = [
            models.Index(fields=['company_name']),
            models.Index(fields=['registration_number']),
            models.Index(fields=['tax_id']),
        ]
    
    def clean(self):
        """Custom validation for company."""
        super().clean()
        
        if not self.company_name.strip():
            raise ValidationError({
                'company_name': _('Company name cannot be empty.')
            })
    
    def is_authorized(self) -> bool:
        """Check if company is authorized to use the system."""
        try:
            license = self.license
            return license.is_valid()
        except License.DoesNotExist:
            return False
    
    def get_license_status(self) -> Dict[str, any]:
        """Get comprehensive license status information."""
        try:
            license = self.license
            return license.validate_and_update()
        except License.DoesNotExist:
            return {
                'valid': False,
                'status': 'no_license',
                'violations': ['No license found'],
                'warnings': [],
                'expires_in_days': None,
            }
    
    def has_feature(self, feature_name: str) -> bool:
        """Check if company has access to a specific feature."""
        try:
            return self.license.has_feature(feature_name)
        except License.DoesNotExist:
            return False
    
    def __str__(self):
        return self.company_name

# Rest of your existing models (Branch, SystemSettings, etc.) remain the same...
# I'll include them for completeness but they don't need changes for licensing

class Branch(AuditableModel):
    """
    Enhanced branch information with comprehensive settings and validation.
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='branches',
        verbose_name=_("Company"),
        help_text=_("Parent company")
    )
    
    branch_code = models.CharField(
        max_length=20,
        verbose_name=_("Branch Code"),
        help_text=_("Unique branch identifier code")
    )
    
    branch_name = models.CharField(
        max_length=200,
        verbose_name=_("Branch Name"),
        help_text=_("Branch display name")
    )
    
    branch_name_english = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Branch Name (English)"),
        help_text=_("Branch name in English")
    )
    
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_("Primary Branch"),
        help_text=_("Whether this is the primary/main branch")
    )
    
    is_headquarters = models.BooleanField(
        default=False,
        verbose_name=_("Headquarters"),
        help_text=_("Whether this branch is the company headquarters")
    )
    
    fiscal_year_start_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        default=1,
        verbose_name=_("Fiscal Year Start Month"),
        help_text=_("Month when fiscal year begins (1-12)")
    )
    
    fiscal_year_end_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        default=12,
        verbose_name=_("Fiscal Year End Month"),
        help_text=_("Month when fiscal year ends (1-12)")
    )
    
    current_fiscal_year = models.IntegerField(
        verbose_name=_("Current Fiscal Year"),
        help_text=_("Current fiscal year")
    )
    
    use_cost_center = models.BooleanField(
        default=False,
        verbose_name=_("Use Cost Center"),
        help_text=_("Enable cost center functionality")
    )
    
    use_sales_tax = models.BooleanField(
        default=False,
        verbose_name=_("Use Sales Tax"),
        help_text=_("Enable sales tax calculations")
    )
    
    use_vat_tax = models.BooleanField(
        default=False,
        verbose_name=_("Use VAT Tax"),
        help_text=_("Enable VAT tax calculations")
    )
    
    use_carry_fee = models.BooleanField(
        default=False,
        verbose_name=_("Use Carry Fee"),
        help_text=_("Enable carry fee calculations")
    )
    
    use_expire_date = models.BooleanField(
        default=True,
        verbose_name=_("Use Expire Date"),
        help_text=_("Track product expiration dates")
    )
    
    use_batch_no = models.BooleanField(
        default=True,
        verbose_name=_("Use Batch Number"),
        help_text=_("Track product batch numbers")
    )
    
    use_barcode = models.BooleanField(
        default=True,
        verbose_name=_("Use Barcode"),
        help_text=_("Enable barcode functionality")
    )
    
    use_multi_currency = models.BooleanField(
        default=False,
        verbose_name=_("Use Multi-Currency"),
        help_text=_("Enable multiple currency support")
    )
    
    # Contact information
    email = models.EmailField(
        blank=True,
        null=True,
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email Address"),
        help_text=_("Branch email address")
    )
    
    phone_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Phone Number"),
        help_text=_("Branch phone number")
    )
    
    fax_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Fax Number"),
        help_text=_("Branch fax number")
    )
    
    address = models.TextField(
        blank=True,
        verbose_name=_("Address"),
        help_text=_("Branch physical address")
    )
    
    # Geographic information
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("City"),
        help_text=_("City where branch is located")
    )
    
    state_province = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("State/Province"),
        help_text=_("State or province where branch is located")
    )
    
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Country"),
        help_text=_("Country where branch is located")
    )
    
    postal_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Postal Code"),
        help_text=_("Postal/ZIP code")
    )
    
    # Business settings
    default_currency = models.ForeignKey(
        'accounting.Currency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='default_branches',
        verbose_name=_("Default Currency"),
        help_text=_("Default currency for this branch")
    )
    
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        verbose_name=_("Timezone"),
        help_text=_("Branch timezone")
    )
    
    manager = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_branches',
        verbose_name=_("Branch Manager"),
        help_text=_("User who manages this branch")
    )
    
    class Meta:
        verbose_name = _("Branch")
        verbose_name_plural = _("Branches")
        unique_together = [
            ['company', 'branch_code'],
            ['company', 'branch_name']
        ]
        indexes = [
            models.Index(fields=['company']),
            models.Index(fields=['branch_code']),
            models.Index(fields=['is_primary']),
            models.Index(fields=['is_active']),
            models.Index(fields=['city']),
            models.Index(fields=['country']),
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
            """Custom validation for branch."""
            super().clean()
            
            if not self.branch_name.strip():
                raise ValidationError({
                    'branch_name': _('Branch name cannot be empty.')
                })
            
            if not self.branch_code.strip():
                raise ValidationError({
                    'branch_code': _('Branch code cannot be empty.')
                })

            if self.fiscal_year_start_month == self.fiscal_year_end_month:
                raise ValidationError({
                    'fiscal_year_end_month': _('Fiscal year start and end months cannot be the same.')
                })
            
            if self.company_id:
                try:
                    license = self.company.license
                    if license.license_type.max_branches:
                        current_branches = self.company.branches.filter(is_active=True).count()
                        if self.pk is None:  # New branch
                            current_branches += 1
                        if current_branches > license.license_type.max_branches:
                            raise ValidationError({
                                '__all__': _(f'License allows maximum {license.license_type.max_branches} branches. Current: {current_branches}')
                            })
                except License.DoesNotExist:
                    raise ValidationError({
                        '__all__': _('Company must have a valid license to create branches.')
                    })
    
    def save(self, *args, **kwargs):
        """Override save to handle primary branch logic and license validation."""
        if not self.company.is_authorized():
            raise ValidationError(_('Company is not authorized to use the system.'))
        
        if self.is_primary:
            Branch.objects.filter(
                company=self.company,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        
        if self.is_headquarters:
            Branch.objects.filter(
                company=self.company,
                is_headquarters=True
            ).exclude(id=self.id).update(is_headquarters=False)
        
        if self.use_multi_currency and not self.company.has_feature('multi_currency'):
            raise ValidationError(_('Multi-currency feature not available in current license.'))
        
        super().save(*args, **kwargs)
        
        try:
            self.company.license.update_usage_stats()
        except License.DoesNotExist:
            pass
    
    def get_full_name(self) -> str:
        """Get full branch name including company."""
        return f"{self.company.company_name} - {self.branch_name}"
    
    def get_address_display(self) -> str:
        """Get formatted address string."""
        address_parts = [self.address, self.city, self.state_province, self.country, self.postal_code]
        return ', '.join(filter(None, address_parts))
    
    def __str__(self):
        return self.get_full_name()


class SystemSettings(AuditableModel):
    """
    System-wide configuration settings with enhanced security.
    """
    branch = models.OneToOneField(
        Branch,
        on_delete=models.CASCADE,
        related_name='system_settings',
        verbose_name=_("Branch"),
        help_text=_("Branch these settings apply to")
    )
    
    database_server = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Server"),
        help_text=_("Database server address")
    )
    
    database_name = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Name"),
        help_text=_("Database name")
    )
    
    database_username = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Username"),
        help_text=_("Database username")
    )
    
    database_password = EncryptedField(
        blank=True,
        null=True,
        verbose_name=_("Database Password"),
        help_text=_("Database password")
    )
    
    # System settings
    connection_timeout = models.PositiveIntegerField(
        default=30,
        verbose_name=_("Connection Timeout"),
        help_text=_("Database connection timeout in seconds")
    )
    
    session_timeout = models.PositiveIntegerField(
        default=1800,
        verbose_name=_("Session Timeout"),
        help_text=_("User session timeout in seconds")
    )
    
    max_login_attempts = models.PositiveIntegerField(
        default=5,
        verbose_name=_("Max Login Attempts"),
        help_text=_("Maximum failed login attempts before account lock")
    )
    
    account_lockout_duration = models.PositiveIntegerField(
        default=30,
        verbose_name=_("Account Lockout Duration"),
        help_text=_("Account lockout duration in minutes")
    )
    
    # Display settings
    show_warnings = models.BooleanField(
        default=True,
        verbose_name=_("Show Warnings"),
        help_text=_("Display system warnings to users")
    )
    
    check_sales_price = models.BooleanField(
        default=True,
        verbose_name=_("Check Sales Price"),
        help_text=_("Validate sales prices during transactions")
    )
    
    enable_photo_storage = models.BooleanField(
        default=True,
        verbose_name=_("Enable Photo Storage"),
        help_text=_("Allow photo uploads and storage")
    )
    
    # File paths
    reports_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Reports Path"),
        help_text=_("Path where reports are stored")
    )
    
    backup_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Backup Path"),
        help_text=_("Path where backups are stored")
    )
    
    # Notification settings
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
    
    enable_in_app_notifications = models.BooleanField(
        default=False,
        verbose_name=_("Enable In-App Notifications"),
        help_text=_("Enable system In-App notifications")
    )
    
    enable_push_notifications = models.BooleanField(
        default=False,
        verbose_name=_("Enable Push Notifications"),
        help_text=_("Enable system Push notifications")
    )
    
    # Security settings
    require_two_factor_auth = models.BooleanField(
        default=False,
        verbose_name=_("Require Two-Factor Authentication"),
        help_text=_("Require 2FA for all users")
    )
    
    password_expiry_days = models.PositiveIntegerField(
        default=90,
        verbose_name=_("Password Expiry Days"),
        help_text=_("Number of days before password expires")
    )
    
    minimum_password_length = models.PositiveIntegerField(
        default=8,
        validators=[MinValueValidator(6), MaxValueValidator(50)],
        verbose_name=_("Minimum Password Length"),
        help_text=_("Minimum required password length")
    )
    
    class Meta:
        verbose_name = _("System Settings")
        verbose_name_plural = _("System Settings")
        constraints = [
            models.CheckConstraint(
                check=models.Q(connection_timeout__gt=0),
                name='positive_connection_timeout'
            ),
            models.CheckConstraint(
                check=models.Q(session_timeout__gt=0),
                name='positive_session_timeout'
            ),
            models.CheckConstraint(
                check=models.Q(max_login_attempts__gt=0),
                name='positive_max_login_attempts'
            )
        ]
    
    def __str__(self):
        return f"Settings for {self.branch.branch_name}"

class SystemConfiguration(AuditableModel):
    """Extended system configuration beyond basic settings"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    config_key = models.CharField(max_length=100)
    config_value = models.TextField()
    config_type = models.CharField(max_length=20, choices=[
        ('string', 'String'),
        ('integer', 'Integer'),
        ('decimal', 'Decimal'),
        ('boolean', 'Boolean'),
        ('json', 'JSON')
    ])
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False)

    class Meta:
        unique_together = ('branch', 'config_key')
        verbose_name = "System Configuration"
        verbose_name_plural = "System Configurations"

    def __str__(self):
        return f"{self.config_key} ({self.branch.branch_name})"

class KeyboardShortcuts(AuditableModel):
    """
    Keyboard shortcuts configuration for system actions.
    Allows customization of keyboard shortcuts per branch.
    """
    
    CATEGORY_CHOICES = [
        ('general', _('General')),
        ('navigation', _('Navigation')),
        ('forms', _('Forms')),
        ('reports', _('Reports')),
        ('inventory', _('Inventory')),
        ('sales', _('Sales')),
        ('accounting', _('Accounting')),
        ('admin', _('Administration')),
        ('custom', _('Custom')),
    ]
    
    MODIFIER_CHOICES = [
        ('ctrl', _('Ctrl')),
        ('alt', _('Alt')),
        ('shift', _('Shift')),
        ('meta', _('Meta/Cmd')),
    ]
    
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='keyboard_shortcuts',
        verbose_name=_("Branch"),
        help_text=_("Branch these shortcuts apply to")
    )
    
    action_name = models.CharField(
        max_length=100,
        verbose_name=_("Action Name"),
        help_text=_("Internal name/identifier for the action")
    )
    
    display_name = models.CharField(
        max_length=150,
        verbose_name=_("Display Name"),
        help_text=_("Human-readable name for the action")
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Description of what this shortcut does")
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='general',
        verbose_name=_("Category"),
        help_text=_("Category to group related shortcuts")
    )
    
    # Keyboard combination fields
    key_combination = models.CharField(
        max_length=50,
        verbose_name=_("Key Combination"),
        help_text=_("Full keyboard combination (e.g., 'Ctrl+S', 'Alt+F4')")
    )
    
    primary_key = models.CharField(
        max_length=20,
        verbose_name=_("Primary Key"),
        help_text=_("Main key (e.g., 'S', 'F4', 'Enter')")
    )
    
    modifiers = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Modifiers"),
        help_text=_("Modifier keys separated by + (e.g., 'Ctrl+Alt')")
    )
    
    # Configuration options
    is_enabled = models.BooleanField(
        default=True,
        verbose_name=_("Enabled"),
        help_text=_("Whether this shortcut is active")
    )
    
    is_system_default = models.BooleanField(
        default=False,
        verbose_name=_("System Default"),
        help_text=_("Whether this is a system default shortcut")
    )
    
    is_customizable = models.BooleanField(
        default=True,
        verbose_name=_("Customizable"),
        help_text=_("Whether users can modify this shortcut")
    )
    
    is_global = models.BooleanField(
        default=False,
        verbose_name=_("Global Shortcut"),
        help_text=_("Whether this shortcut works globally in the application")
    )
    
    # Context and scope
    context = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Context"),
        help_text=_("Specific context where shortcut is active (e.g., 'form', 'grid', 'modal')")
    )
    
    page_url_pattern = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Page URL Pattern"),
        help_text=_("URL pattern where this shortcut is active (regex supported)")
    )
    
    # Priority and ordering
    priority = models.PositiveIntegerField(
        default=100,
        verbose_name=_("Priority"),
        help_text=_("Priority for shortcut resolution (lower = higher priority)")
    )
    
    sort_order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Sort Order"),
        help_text=_("Order for displaying shortcuts in lists")
    )
    
    # JavaScript function or action
    javascript_function = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("JavaScript Function"),
        help_text=_("JavaScript function to execute when shortcut is triggered")
    )
    
    # Alternative shortcuts
    alternative_combination = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Alternative Combination"),
        help_text=_("Alternative keyboard combination for the same action")
    )
    
    class Meta:
        verbose_name = _("Keyboard Shortcut")
        verbose_name_plural = _("Keyboard Shortcuts")
        unique_together = [
            ['branch', 'action_name'],
            ['branch', 'key_combination', 'context'],
        ]
        indexes = [
            models.Index(fields=['branch', 'category']),
            models.Index(fields=['branch', 'is_enabled']),
            models.Index(fields=['action_name']),
            models.Index(fields=['key_combination']),
            models.Index(fields=['context']),
            models.Index(fields=['priority']),
            models.Index(fields=['sort_order']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(priority__gt=0),
                name='positive_priority'
            ),
            models.CheckConstraint(
                check=models.Q(sort_order__gte=0),
                name='non_negative_sort_order'
            )
        ]
    
    def clean(self):
        """Custom validation for keyboard shortcuts."""
        super().clean()
        
        if not self.action_name.strip():
            raise ValidationError({
                'action_name': _('Action name cannot be empty.')
            })
        
        if not self.key_combination.strip():
            raise ValidationError({
                'key_combination': _('Key combination cannot be empty.')
            })
        
        if not self.primary_key.strip():
            raise ValidationError({
                'primary_key': _('Primary key cannot be empty.')
            })
        
        # Validate key combination format
        if not self._is_valid_key_combination(self.key_combination):
            raise ValidationError({
                'key_combination': _('Invalid key combination format. Use format like "Ctrl+S" or "Alt+F4".')
            })
    
    def _is_valid_key_combination(self, combination):
        """Validate key combination format."""
        if not combination:
            return False
        
        # Basic validation - should contain at least one key
        parts = combination.split('+')
        if len(parts) < 1:
            return False
        
        # Check for valid modifier keys
        valid_modifiers = ['ctrl', 'alt', 'shift', 'meta', 'cmd']
        for part in parts[:-1]:  # All parts except the last should be modifiers
            if part.lower() not in valid_modifiers:
                return False
        
        return True
    
    def get_formatted_combination(self):
        """Get formatted key combination for display."""
        return self.key_combination.replace('+', ' + ')
    
    def get_modifiers_list(self):
        """Get list of modifier keys."""
        if not self.modifiers:
            return []
        return [mod.strip() for mod in self.modifiers.split('+') if mod.strip()]
    
    def is_conflict_with(self, other_shortcut):
        """Check if this shortcut conflicts with another."""
        if not other_shortcut or not other_shortcut.is_enabled:
            return False
        
        # Same key combination in same context is a conflict
        if (self.key_combination.lower() == other_shortcut.key_combination.lower() and
            self.context == other_shortcut.context):
            return True
        
        # Check alternative combinations
        if (self.alternative_combination and 
            self.alternative_combination.lower() == other_shortcut.key_combination.lower()):
            return True
        
        if (other_shortcut.alternative_combination and 
            self.key_combination.lower() == other_shortcut.alternative_combination.lower()):
            return True
        
        return False
    
    def to_javascript_config(self):
        """Convert shortcut to JavaScript configuration object."""
        return {
            'action': self.action_name,
            'key': self.primary_key,
            'modifiers': self.get_modifiers_list(),
            'combination': self.key_combination,
            'context': self.context,
            'enabled': self.is_enabled,
            'global': self.is_global,
            'function': self.javascript_function,
            'priority': self.priority,
        }
    
    @classmethod
    def get_shortcuts_by_category(cls, branch, category=None):
        """Get shortcuts grouped by category for a branch."""
        queryset = cls.objects.filter(branch=branch, is_enabled=True)
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('category', 'sort_order', 'display_name')
    
    @classmethod
    def get_active_shortcuts_for_context(cls, branch, context=None):
        """Get active shortcuts for a specific context."""
        queryset = cls.objects.filter(
            branch=branch,
            is_enabled=True
        ).order_by('priority', 'sort_order')
        
        if context:
            queryset = queryset.filter(
                models.Q(context=context) | 
                models.Q(context__isnull=True) |
                models.Q(is_global=True)
            )
        
        return queryset
    
    def __str__(self):
        return f"{self.display_name} ({self.key_combination})"
