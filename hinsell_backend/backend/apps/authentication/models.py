"""
Authentication and user management models.
Handles user accounts, profiles, permissions, and audit logging.
"""
import uuid
import logging
from typing import Optional, Dict
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from apps.core_apps.general import  AuditableModel
from apps.core_apps.validators import  validate_percentage

logger = logging.getLogger(__name__)


def upload_avatar(instance, filename):
    """Generate unique avatar upload path."""
    random_uuid = uuid.uuid4().hex
    extension = filename.split('.')[-1] if '.' in filename else 'jpg'
    return f'avatars/{instance.user.username}/{random_uuid}.{extension}'


class UserManager(BaseUserManager):
    """
    Custom user manager with enhanced security and error handling.
    """
    
    def create_user(self, username, email=None, password=None, **extra_fields):
        """Create and return a regular user with enhanced validation."""
        try:
            if not username:
                raise ValueError(_("The Username field must be set"))
 
            if not username.replace('_', '').replace('-', '').isalnum():
                raise ValueError(_("Username can only contain letters, numbers, underscores, and hyphens"))
            
            if email:
                email = self.normalize_email(email)
                self._validate_email(email)
            
            extra_fields.setdefault('is_active', True)
            extra_fields.setdefault('is_staff', False)
            extra_fields.setdefault('is_superuser', False)
            
            user = self.model(username=username, **extra_fields)
            
            if password:
                user.set_password(password)
                user.password_changed_at = timezone.now()
            else:
                user.set_unusable_password()
            
            user.full_clean()
            user.save(using=self._db)
            
            logger.info(f"User created successfully: {username}")
            return user
            
        except Exception as e:
            logger.error(f"Error creating user {username}: {str(e)}", exc_info=True)
            raise
    
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """Create and return a superuser with enhanced validation."""
        try:
            extra_fields.setdefault("is_staff", True)
            extra_fields.setdefault("is_superuser", True)
            extra_fields.setdefault("is_active", True)
            extra_fields.setdefault("use_control_panel", True)
            
            if not extra_fields.get("is_staff"):
                raise ValueError(_("Superuser must have is_staff=True."))
            if not extra_fields.get("is_superuser"):
                raise ValueError(_("Superuser must have is_superuser=True."))
            if not password:
                raise ValueError(_("Superuser must have a password."))
            
            return self.create_user(username, email, password, **extra_fields)
            
        except Exception as e:
            logger.error(f"Error creating superuser {username}: {str(e)}", exc_info=True)
            raise
    
    def _validate_email(self, email: str) -> bool:
        """Validate email format."""
        try:
            EmailValidator()(email)
            return True
        except ValidationError:
            raise ValueError(_("Invalid email address format"))


class User(AbstractBaseUser, PermissionsMixin, AuditableModel):
    """
    Enhanced custom user model with comprehensive security features.
    """
    
    username = models.CharField(
        unique=True,
        max_length=50,
        verbose_name=_("Username"),
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_-]+$',
                message=_('Username can only contain letters, numbers, underscores, and hyphens.')
            )
        ],
        help_text=_("Required. 50 characters or fewer. Letters, digits, underscores, and hyphens only.")
    )
    
    first_name = models.CharField(
        max_length=30,
        blank=True,
        verbose_name=_("First Name"),
        help_text=_("User's first name")
    )
    
    last_name = models.CharField(
        max_length=30,
        blank=True,
        verbose_name=_("Last Name"),
        help_text=_("User's last name")
    )
    
    employee_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True,
        verbose_name=_("Employee ID"),
        help_text=_("Unique employee identifier")
    )
    
    is_staff = models.BooleanField(
        default=False,
        verbose_name=_("Staff Status"),
        help_text=_("Designates whether the user can log into the admin site.")
    )
    
    is_superuser = models.BooleanField(
        default=False,
        verbose_name=_("Superuser Status"),
        help_text=_("Designates that this user has all permissions without explicitly assigning them.")
    )
    
    is_two_factor_enabled = models.BooleanField(
        default=False,
        verbose_name=_("Two-Factor Authentication Enabled"),
        help_text=_("Whether two-factor authentication is enabled for this user")
    )
    
    failed_login_attempts = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of consecutive failed login attempts")
    )
    
    account_locked_until = models.DateTimeField(
        blank=True,
        null=True,
        help_text=_("Timestamp until which the account is locked")
    )
    
    password_changed_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Timestamp when password was last changed")
    )
    
    last_login_device = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Last Login Device"),
        help_text=_("Device information from last login")
    )
    
    last_login_ip = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name=_("Last Login IP Address"),
        help_text=_("IP address from last login")
    )
    
    use_control_panel = models.BooleanField(
        default=False,
        verbose_name=_("Control Panel Access"),
        help_text=_("Can access administrative control panel")
    )
    
    use_reports = models.BooleanField(
        default=False,
        verbose_name=_("Reports Access"),
        help_text=_("Can access and generate reports")
    )
    
    use_ledger_system = models.BooleanField(
        default=False,
        verbose_name=_("Ledger System Access"),
        help_text=_("Can access financial ledger system")
    )
    
    use_inventory_system = models.BooleanField(
        default=False,
        verbose_name=_("Inventory System Access"),
        help_text=_("Can access inventory management system")
    )
    
    use_purchase_system = models.BooleanField(
        default=False,
        verbose_name=_("Purchase System Access"),
        help_text=_("Can access purchase management system")
    )
    
    use_sales_system = models.BooleanField(
        default=False,
        verbose_name=_("Sales System Access"),
        help_text=_("Can access sales management system")
    )
    use_medical_management = models.BooleanField(
        default=False,
        verbose_name=_("Medical Management Access"),
        help_text=_("Can access medical management system")
    )
    hide_cost = models.BooleanField(
        default=False,
        verbose_name=_("Hide Cost Information"),
        help_text=_("Hide cost information in user interface")
    )
    
    hide_comment = models.BooleanField(
        default=False,
        verbose_name=_("Hide Comments"),
        help_text=_("Hide comments in user interface")
    )
    
    user_discount_ratio = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[validate_percentage],
        verbose_name=_("User Discount Ratio"),
        help_text=_("Maximum discount percentage this user can apply")
    )
    
    default_branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='default_users',
        verbose_name=_("Default Branch"),
        help_text=_("Default branch for this user")
    )
    
    objects = UserManager()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['employee_id']),
            models.Index(fields=['is_active', 'is_staff']),
            models.Index(fields=['last_login']),
            models.Index(fields=['failed_login_attempts']),
            models.Index(fields=['account_locked_until']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(user_discount_ratio__gte=0) & models.Q(user_discount_ratio__lte=100),
                name='valid_user_discount_ratio'
            ),
            models.CheckConstraint(
                check=models.Q(failed_login_attempts__gte=0),
                name='non_negative_failed_attempts'
            )
        ]
    
    def clean(self):
        """Custom validation for user model."""
        super().clean()
        
        if self.employee_id and not self.employee_id.strip():
            raise ValidationError({
                'employee_id': _('Employee ID cannot be empty if provided.')
            })
        
        if self.user_discount_ratio < 0 or self.user_discount_ratio > 100:
            raise ValidationError({
                'user_discount_ratio': _('Discount ratio must be between 0 and 100.')
            })
    
    def get_full_name(self) -> str:
        """Return the full name or username if names are not available."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.username
    
    def get_short_name(self) -> str:
        """Return the short name."""
        return self.first_name or self.username
    
    def is_account_locked(self) -> bool:
        """Check if account is currently locked."""
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False
    
    def lock_account(self, duration_minutes: int = 30):
        """Lock account for specified duration."""
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=['account_locked_until'])
        logger.warning(f"Account locked for user: {self.username}")
    
    def unlock_account(self):
        """Unlock account and reset failed attempts."""
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save(update_fields=['account_locked_until', 'failed_login_attempts'])
        logger.info(f"Account unlocked for user: {self.username}")
    
    def increment_failed_login(self):
        """Increment failed login attempts and lock if threshold reached."""
        self.failed_login_attempts += 1
        
        if self.failed_login_attempts >= 5:
            self.lock_account(30)
        
        self.save(update_fields=['failed_login_attempts'])
    
    def reset_failed_login(self):
        """Reset failed login attempts on successful login."""
        if self.failed_login_attempts > 0:
            self.failed_login_attempts = 0
            self.save(update_fields=['failed_login_attempts'])
    
    def has_contact_info(self) -> bool:
        """Check if user has any contact information."""
        if hasattr(self, 'profile'):
            return bool(self.profile.email or self.profile.phone_number)
        return False
    
    def get_notification_preferences(self) -> Dict[str, bool]:
        """Get user's notification preferences."""
        if hasattr(self, 'profile'):
            return {
                'email': self.profile.enable_email_notifications and bool(self.profile.email),
                'whatsapp': self.profile.enable_whatsapp_notifications and bool(self.profile.phone_number),
                'sms': self.profile.enable_sms_notifications and bool(self.profile.phone_number),
            }
        return {'email': False, 'whatsapp': False, 'sms': False}
    
    def __str__(self):
        return self.get_full_name()


class UserProfile(AuditableModel):
    """
    Enhanced user profile model with comprehensive validation and features.
    """
    
    class Gender(models.TextChoices):
        MALE = 'male', _('Male')
        FEMALE = 'female', _('Female')
        PREFER_NOT_TO_SAY = 'prefer_not_to_say', _('Prefer Not to Say')
        OTHER = 'other', _('Other')
    
    class ProfileVisibility(models.TextChoices):
        PUBLIC = 'public', _('Public')
        PRIVATE = 'private', _('Private')
        COLLEAGUES = 'colleagues', _('Colleagues Only')
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_("User"),
        help_text=_("Associated user account")
    )
    
    avatar = models.ImageField(
        upload_to=upload_avatar,
        null=True,
        blank=True,
        verbose_name=_("Avatar"),
        help_text=_("Profile picture")
    )
    
    bio = models.TextField(
        blank=True,
        max_length=500,
        verbose_name=_("Biography"),
        help_text=_("Brief description about the user")
    )
    
    email = models.EmailField(
        unique=True,
        blank=True,
        null=True,
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email Address"),
        help_text=_("Primary email address for notifications")
    )
    
    phone_number = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Phone Number"),
        help_text=_("Primary phone number for notifications")
    )
    
    address = models.TextField(
        blank=True,
        verbose_name=_("Address"),
        help_text=_("Physical address")
    )
    
    nationality = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Nationality"),
        help_text=_("User's nationality")
    )
    
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Date of Birth"),
        help_text=_("User's date of birth")
    )
    
    gender = models.CharField(
        max_length=20,
        choices=Gender.choices,
        default=Gender.PREFER_NOT_TO_SAY,
        blank=True,
        verbose_name=_("Gender"),
        help_text=_("User's gender")
    )

    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Emergency Contact Name"),
        help_text=_("Name of emergency contact person")
    )
    
    emergency_contact_phone = PhoneNumberField(
        blank=True,
        null=True,
        verbose_name=_("Emergency Contact Phone"),
        help_text=_("Phone number of emergency contact")
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
    
    profile_visibility = models.CharField(
        max_length=20,
        choices=ProfileVisibility.choices,
        default=ProfileVisibility.COLLEAGUES,
        verbose_name=_("Profile Visibility"),
        help_text=_("Who can view this profile")
    )
    
    class Meta:
        verbose_name = _("User Profile")
        verbose_name_plural = _("User Profiles")
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['email']),
            models.Index(fields=['profile_visibility']),
        ]
    
    def clean(self):
        """Custom validation for profile."""
        super().clean()
        
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError({
                'date_of_birth': _('Date of birth cannot be in the future.')
            })
        
        if (self.enable_email_notifications or 
            self.enable_whatsapp_notifications or 
            self.enable_sms_notifications):
            
            if not self.email and not self.phone_number:
                raise ValidationError(
                    _('At least one contact method (email or phone) must be provided if notifications are enabled.')
                )
    
    def has_complete_profile(self) -> bool:
        """Check if profile is complete."""
        required_fields = [
            self.user.first_name,
            self.user.last_name,
            self.email or self.phone_number,
        ]
        return all(field for field in required_fields)
    
    def get_age(self) -> Optional[int]:
        """Calculate age from date of birth."""
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None
    
    def can_receive_notifications(self, channel: str) -> bool:
        """Check if user can receive notifications via specific channel."""
        channel_map = {
            'email': self.wants_email_notifications and bool(self.email),
            'whatsapp': self.wants_push_whatsapp_notifications and bool(self.phone_number),
            'sms': self.wants_sms_notifications and bool(self.phone_number),
        }
        return channel_map.get(channel, False)
    
    def __str__(self):
        return f"Profile of {self.user.get_full_name()}"


class AuditLog(AuditableModel):
    """
    Comprehensive audit log for security and compliance tracking.
    """
    
    class ActionType(models.TextChoices):
        LOGIN = 'login', _('Login')
        LOGOUT = 'logout', _('Logout')
        LOGIN_FAILED = 'login_failed', _('Login Failed')
        PASSWORD_CHANGE = 'password_change', _('Password Change')
        PROFILE_UPDATE = 'profile_update', _('Profile Update')
        PERMISSION_CHANGE = 'permission_change', _('Permission Change')
        DATA_ACCESS = 'data_access', _('Data Access')
        DATA_MODIFICATION = 'data_modification', _('Data Modification')
        SYSTEM_ACCESS = 'system_access', _('System Access')
        ACCOUNT_LOCKED = 'account_locked', _('Account Locked')
        ACCOUNT_UNLOCKED = 'account_unlocked', _('Account Unlocked')
    
    class LoginStatus(models.TextChoices):
        SUCCESS = 'success', _('Success')
        FAILED = 'failed', _('Failed')
        BLOCKED = 'blocked', _('Blocked')
        SUSPICIOUS = 'suspicious', _('Suspicious')
    
    class RiskLevel(models.TextChoices):
        LOW = 'low', _('Low')
        MEDIUM = 'medium', _('Medium')
        HIGH = 'high', _('High')
        CRITICAL = 'critical', _('Critical')
    
    branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.CASCADE,
        verbose_name=_("Branch"),
        help_text=_("Branch where the action occurred")
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="audit_logs",
        verbose_name=_("User"),
        help_text=_("User who performed the action")
    )
    
    action_type = models.CharField(
        max_length=20,
        choices=ActionType.choices,
        default=ActionType.LOGIN,
        verbose_name=_("Action Type"),
        help_text=_("Type of action performed")
    )
    
    username = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Username"),
        help_text=_("Username at time of action")
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("IP Address"),
        help_text=_("IP address from which action was performed")
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name=_("User Agent"),
        help_text=_("Browser/client user agent string")
    )
    
    device_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Device Type"),
        help_text=_("Type of device used")
    )

    login_status = models.CharField(
        max_length=20,
        choices=LoginStatus.choices,
        default=LoginStatus.SUCCESS,
        verbose_name=_("Status"),
        help_text=_("Status of the action")
    )
    
    session_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Session ID"),
        help_text=_("Session identifier")
    )
    
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Country"),
        help_text=_("Country from which action was performed")
    )
    
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("City"),
        help_text=_("City from which action was performed")
    )
    
    computer_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Computer Name"),
        help_text=_("Name of the computer used")
    )
    
    screen_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Screen Name"),
        help_text=_("Screen or form accessed")
    )
    
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Additional Details"),
        help_text=_("Additional information about the action")
    )
    
    risk_score = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Risk Score"),
        help_text=_("Calculated risk score (0-100)")
    )
    
    risk_level = models.CharField(
        max_length=10,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW,
        verbose_name=_("Risk Level"),
        help_text=_("Assessed risk level")
    )
    
    is_suspicious = models.BooleanField(
        default=False,
        verbose_name=_("Suspicious Activity"),
        help_text=_("Whether this activity is flagged as suspicious")
    )
    
    class Meta:
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action_type']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['login_status']),
            models.Index(fields=['is_suspicious']),
            models.Index(fields=['risk_level']),
            models.Index(fields=['branch', 'created_at']),
            models.Index(fields=['risk_score']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(risk_score__gte=0) & models.Q(risk_score__lte=100),
                name='valid_risk_score'
            )
        ]
    
    def save(self, *args, **kwargs):
        """Enhanced save method with automatic field population."""
        if not self.username and self.user:
            self.username = self.user.username
        
        if not self.device_type and self.user_agent:
            self.device_type = self._get_device_type(self.user_agent)
    
        self.risk_score = self._calculate_risk_score()
        self.risk_level = self._determine_risk_level(self.risk_score)
        self.is_suspicious = self.risk_score > 70
        
        super().save(*args, **kwargs)
    
    def _get_device_type(self, user_agent: str) -> str:
        """Enhanced device type detection."""
        ua = user_agent.lower()
        
        if any(mobile in ua for mobile in ['mobile', 'android', 'iphone', 'ipod']):
            if 'iphone' in ua:
                return 'iPhone'
            elif 'android' in ua:
                return 'Android Phone'
            return 'Mobile Device'
        
        if any(tablet in ua for tablet in ['tablet', 'ipad']):
            if 'ipad' in ua:
                return 'iPad'
            return 'Tablet'
        
        if 'windows' in ua:
            return 'Windows Desktop'
        elif any(mac in ua for mac in ['macintosh', 'mac os']):
            return 'Mac Desktop'
        elif 'linux' in ua:
            return 'Linux Desktop'
        
        return 'Unknown Device'
    
    def _calculate_risk_score(self) -> int:
        """Calculate risk score based on various factors."""
        score = 0
        
        if self.login_status == self.LoginStatus.FAILED:
            score += 30
        elif self.login_status == self.LoginStatus.BLOCKED:
            score += 50
        
        if not self.country or not self.city:
            score += 20
        
        current_hour = timezone.now().hour
        if current_hour < 6 or current_hour > 22:
            score += 15
        
        if self.ip_address:
            recent_attempts = AuditLog.objects.filter(
                ip_address=self.ip_address,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=10)
            ).count()
            if recent_attempts > 5:
                score += 25
        
        if self.action_type in [self.ActionType.PERMISSION_CHANGE, self.ActionType.ACCOUNT_LOCKED]:
            score += 20
        
        return min(score, 100)
    
    def _determine_risk_level(self, score: int) -> str:
        """Determine risk level based on score."""
        if score >= 80:
            return self.RiskLevel.CRITICAL
        elif score >= 60:
            return self.RiskLevel.HIGH
        elif score >= 30:
            return self.RiskLevel.MEDIUM
        else:
            return self.RiskLevel.LOW
    
    def get_location_display(self) -> str:
        """Get formatted location string."""
        if self.city and self.country:
            return f"{self.city}, {self.country}"
        elif self.country:
            return self.country
        return _("Unknown Location")
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_action_type_display()} at {self.created_at}"
