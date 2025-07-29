import uuid
from typing import Optional
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.core_apps.utils import Logger, generate_unique_code
from apps.core_apps.general import AuditableModel
from phonenumber_field.modelfields import PhoneNumberField
from decimal import Decimal
from apps.core_apps.validators import validate_percentage
from apps.inventory.models import Media


def upload_avatar(instance, filename):
    """Generate unique avatar upload path."""
    random_uuid = uuid.uuid4().hex
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
    return f'avatars/{instance.user.username}/{random_uuid}.{extension}'

def generate_unique_username(email: str) -> str:
    """Generate a unique username from email address."""
    base_username = email.split('@')[0].replace('.', '').replace('_', '').lower()[:30]
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
        if len(username) > 50:
            username = f"{base_username[:45]}{counter}"
    return username

class UserManager(BaseUserManager):
    """Custom user manager with enhanced security and error handling."""
    def create_user(self, email, password=None, user_type='customer', **extra_fields):
        logger = Logger(__name__)
        try:
            if not email:
                raise ValueError(_("The Email field must be set"))
            email = self.normalize_email(email)
            self._validate_email(email)
            username = generate_unique_username(email)
            extra_fields.setdefault('is_active', True)
            extra_fields.setdefault('is_staff', user_type in ['manager', 'admin'])
            extra_fields.setdefault('is_superuser', user_type == 'admin')
            extra_fields.setdefault('user_type', user_type)
            
            user = self.model(username=username, email=email, **extra_fields)
            if password:
                user.set_password(password)
                user.password_changed_at = timezone.now()
            else:
                user.set_unusable_password()
            user.full_clean()
            user.save(using=self._db)
            logger.info(f"User created successfully: {username}", 
                       extra={'user_type': user_type, 'email': email})
            return user
        except Exception as e:
            logger.error(f"Error creating user with email {email}: {str(e)}", 
                        extra={'user_type': user_type}, exc_info=True)
            raise

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        logger = Logger(__name__)
        try:
            extra_fields.setdefault("is_staff", True)
            extra_fields.setdefault("is_superuser", True)
            extra_fields.setdefault("is_active", True)
            extra_fields.setdefault("use_control_panel", True)
            extra_fields.setdefault("user_type", 'admin')
            if not extra_fields.get("is_staff"):
                raise ValueError(_("Superuser must have is_staff=True."))
            if not extra_fields.get("is_superuser"):
                raise ValueError(_("Superuser must have is_superuser=True."))
            if not password:
                raise ValueError(_("Superuser must have a password."))
            user = self.create_user(email=email or f"{username}@example.com", 
                                  password=password, 
                                  username=username,
                                  **extra_fields)
            logger.info(f"Superuser created successfully: {username}", 
                       extra={'user_type': 'admin'})
            return user
        except Exception as e:
            logger.error(f"Error creating superuser {username}: {str(e)}", 
                        extra={'user_type': 'admin'}, exc_info=True)
            raise

    def _validate_email(self, email: str) -> bool:
        try:
            EmailValidator()(email)
            return True
        except ValidationError:
            raise ValueError(_("Invalid email address format"))

class User(AbstractBaseUser, PermissionsMixin, AuditableModel):
    """Custom user model with e-commerce and security features."""
    class UserType(models.TextChoices):
        CUSTOMER = 'customer', _('Customer')
        VIP = 'vip', _('VIP Customer')
        GUEST = 'guest', _('Guest')
        PARTNER = 'partner', _('Partner')
        EMPLOYEE = 'employee', _('Employee')
        MANAGER = 'manager', _('Manager')
        ADMIN = 'admin', _('Admin')

    username = models.CharField(
        unique=True,
        max_length=50,
        verbose_name=_("Username"),
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_-]+$',
                message=_('Username can only contain letters, numbers, underscores, and hyphens.')
            )
        ]
    )
    email = models.EmailField(
        unique=True,
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email Address")
    )
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.CUSTOMER,
        verbose_name=_("User Type"),
        help_text=_("Type of user account")
    )
    first_name = models.CharField(
        max_length=30,
        blank=True,
        verbose_name=_("First Name")
    )
    last_name = models.CharField(
        max_length=30,
        blank=True,
        verbose_name=_("Last Name")
    )
    code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True,
        verbose_name=_("Employee Code"),
        default=lambda: generate_unique_code('EMP')
    )
    is_two_factor_enabled = models.BooleanField(
        default=False,
        verbose_name=_("Two-Factor Authentication Enabled")
    )
    failed_login_attempts = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Failed Login Attempts")
    )
    account_locked_until = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Account Locked Until")
    )
    password_changed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Password Changed At")
    )
    last_login_device = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Last Login Device")
    )
    last_login_ip = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name=_("Last Login IP Address")
    )
    hide_cost = models.BooleanField(
        default=False,
        verbose_name=_("Hide Cost Information")
    )
    hide_comment = models.BooleanField(
        default=False,
        verbose_name=_("Hide Comments")
    )
    user_discount_ratio = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("User Discount Ratio")
    )
    loyalty_points = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Loyalty Points")
    )
    default_branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='default_users',
        verbose_name=_("Default Branch")
    )

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_type']

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        indexes = [
            models.Index(fields=['username', 'email']),
            models.Index(fields=['code']),
            models.Index(fields=['is_active', 'is_staff']),
            models.Index(fields=['failed_login_attempts', 'account_locked_until']),
            models.Index(fields=['user_type']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(user_discount_ratio__gte=0) & models.Q(user_discount_ratio__lte=100),
                name='valid_user_discount_ratio'
            )
        ]

    def clean(self):
        super().clean()
        if self.code and not self.code.strip():
            raise ValidationError({'code': _('Employee code cannot be empty if provided.')})
        if self.user_type in [self.UserType.EMPLOYEE, self.UserType.MANAGER, self.UserType.ADMIN] and not self.code:
            raise ValidationError({'code': _('Employee code is required for employee, manager, or admin users.')})
        if self.user_type == self.UserType.GUEST and (self.first_name or self.last_name):
            raise ValidationError({'first_name': _('Guest users should not have personal information.'),
                                 'last_name': _('Guest users should not have personal information.')})

    def get_full_name(self) -> str:
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.username

    def get_short_name(self) -> str:
        return self.first_name or self.username

    def is_account_locked(self) -> bool:
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False

    def lock_account(self, duration_minutes: int = 30):
        logger = Logger(__name__, user=self)
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=['account_locked_until'])
        logger.warning(f"Account locked for user: {self.username}", 
                      extra={'user_type': self.user_type})

    def unlock_account(self):
        logger = Logger(__name__, user=self)
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save(update_fields=['account_locked_until', 'failed_login_attempts'])
        logger.info(f"Account unlocked for user: {self.username}", 
                   extra={'user_type': self.user_type})

    def increment_failed_login(self):
        logger = Logger(__name__, user=self)
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.lock_account(30)
        self.save(update_fields=['failed_login_attempts'])
        logger.warning(f"Incremented failed login attempts for user: {self.username}", 
                      extra={'failed_attempts': self.failed_login_attempts, 'user_type': self.user_type})

    def reset_failed_login(self):
        logger = Logger(__name__, user=self)
        if self.failed_login_attempts > 0:
            self.failed_login_attempts = 0
            self.save(update_fields=['failed_login_attempts'])
            logger.info(f"Reset failed login attempts for user: {self.username}", 
                       extra={'user_type': self.user_type})

    def add_loyalty_points(self, points: int, reason: str = None):
        logger = Logger(__name__, user=self)
        if points < 0:
            raise ValidationError(_('Points to add cannot be negative.'))
        self.loyalty_points += points
        self.save(update_fields=['loyalty_points'])
        AuditLog.objects.create(
            branch=self.default_branch,
            user=self,
            action_type=AuditLog.ActionType.LOYALTY_POINTS_ADDED,
            username=self.username,
            details={'points': points, 'reason': reason or 'No reason provided', 'user_type': self.user_type}
        )
        logger.info(f"Added {points} loyalty points to user: {self.username}", 
                   extra={'points': points, 'reason': reason, 'user_type': self.user_type})

    def redeem_loyalty_points(self, points: int, coupon_id: Optional[int] = None):
        logger = Logger(__name__, user=self)
        if points < 0:
            raise ValidationError(_('Points to redeem cannot be negative.'))
        if points > self.loyalty_points:
            raise ValidationError(_('Insufficient loyalty points.'))
        self.loyalty_points -= points
        self.save(update_fields=['loyalty_points'])
        AuditLog.objects.create(
            branch=self.default_branch,
            user=self,
            action_type=AuditLog.ActionType.LOYALTY_POINTS_REDEEMED,
            username=self.username,
            details={'points': points, 'coupon_id': coupon_id, 'user_type': self.user_type}
        )
        logger.info(f"Redeemed {points} loyalty points from user: {self.username}", 
                   extra={'points': points, 'coupon_id': coupon_id, 'user_type': self.user_type})

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_user_type_display()})"

class UserProfile(AuditableModel):
    """User profile with e-commerce features, media integration, and compliance features."""
    class Gender(models.TextChoices):
        MALE = 'male', _('Male')
        FEMALE = 'female', _('Female')
        PREFER_NOT_TO_SAY = 'prefer_not_to_say', _('Prefer Not to Say')

    class ProfileVisibility(models.TextChoices):
        PUBLIC = 'public', _('Public')
        PRIVATE = 'private', _('Private')
        COLLEAGUES = 'colleagues', _('Colleagues Only')

    class PreferredPaymentMethod(models.TextChoices):
        CREDIT_CARD = 'credit_card', _('Credit Card')
        DEBIT_CARD = 'debit_card', _('Debit Card')
        PAYPAL = 'paypal', _('PayPal')
        CASH_ON_DELIVERY = 'cash_on_delivery', _('Cash on Delivery')

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_("User")
    )
    avatar = models.ForeignKey(
        Media,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profiles',
        verbose_name=_("Avatar"),
        limit_choices_to={'media_type': 'image'}
    )
    bio = models.TextField(
        blank=True,
        max_length=500,
        verbose_name=_("Biography")
    )
    email = models.EmailField(
        unique=True,
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
    nationality = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Nationality")
    )
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Date of Birth")
    )
    gender = models.CharField(
        max_length=20,
        choices=Gender.choices,
        default=Gender.PREFER_NOT_TO_SAY,
        verbose_name=_("Gender")
    )
    notifications = models.JSONField(
        default=lambda: {'email': False, 'sms': False, 'whatsapp': False, 'in_app': False, 'push': False},
        verbose_name=_("Notification Settings"),
        help_text=_("Channels for notifications: {'email': bool, 'sms': bool, 'whatsapp': bool, 'in_app': bool, 'push': bool}")
    )
    profile_visibility = models.CharField(
        max_length=20,
        choices=ProfileVisibility.choices,
        default=ProfileVisibility.PUBLIC,
        verbose_name=_("Profile Visibility")
    )
    preferred_payment_method = models.CharField(
        max_length=20,
        choices=PreferredPaymentMethod.choices,
        default=PreferredPaymentMethod.CREDIT_CARD,
        verbose_name=_("Preferred Payment Method")
    )
    marketing_opt_in = models.BooleanField(
        default=False,
        verbose_name=_("Marketing Opt-In")
    )
    terms_accepted = models.BooleanField(
        default=False,
        verbose_name=_("Terms and Conditions Accepted")
    )
    terms_accepted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Terms Accepted At")
    )
    terms_version = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Terms Version"),
        help_text=_("Version of the terms and conditions accepted by the user.")
    )
    data_consent = models.JSONField(
        default=lambda: {'data_processing': False, 'marketing': False, 'analytics': False, 'data_sharing': False},
        verbose_name=_("Data Consent Preferences"),
        help_text=_("User consent for data usage: {'data_processing': bool, 'marketing': bool, 'analytics': bool, 'data_sharing': bool}")
    )
    wishlist_items = models.ManyToManyField(
        'inventory.Item',
        blank=True,
        related_name='wishlisted_by',
        verbose_name=_("Wishlist Items")
    )

    class Meta:
        verbose_name = _("User Profile")
        verbose_name_plural = _("User Profiles")
        indexes = [
            models.Index(fields=['user', 'profile_visibility']),
            models.Index(fields=['email', 'phone_number']),
            models.Index(fields=['terms_accepted', 'terms_version']),
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
    def clean(self):
        super().clean()
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError({'date_of_birth': _('Date of birth cannot be in the future.')})
        if any(self.notifications.get(channel, False) for channel in ['email', 'sms', 'whatsapp', 'push']) and not (self.email or self.phone_number):
            raise ValidationError(_('At least one contact method (email or phone) must be provided if notifications are enabled.'))
        if self.avatar and self.avatar.media_type != 'image':
            raise ValidationError({'avatar': _('Avatar must be an image media type.')})
        if any(self.notifications.get(channel, False) for channel in self.notifications) and not self.terms_accepted:
            raise ValidationError(_('Terms and conditions must be accepted to enable notifications.'))
        if self.marketing_opt_in and not (self.terms_accepted and self.data_consent.get('marketing', False)):
            raise ValidationError(_('Marketing opt-in requires terms acceptance and marketing consent.'))
        if any(self.data_consent.get(key, False) for key in self.data_consent) and not self.terms_accepted:
            raise ValidationError(_('Data consent requires terms and conditions acceptance.'))
    def save(self, *args, **kwargs):
        logger = Logger(__name__, user=self.user)
        if not self.pk:
            self.marketing_opt_in = self.user.user_type in ['customer', 'vip']
            self.terms_accepted = self.user.user_type != 'guest'
            self.data_consent = {
                'data_processing': self.user.user_type != 'guest',
                'marketing': self.user.user_type in ['customer', 'vip'],
                'analytics': self.user.user_type != 'guest',
                'data_sharing': self.user.user_type == 'partner'
            }
        if self.avatar and not self.avatar.alt_text:
            self.avatar.alt_text = f"Profile picture of {self.user.get_full_name()}"
            self.avatar.save()
        if self.terms_accepted and not self.terms_accepted_at:
            self.terms_accepted_at = timezone.now()
            self.avatar.save()
        if self.terms_accepted and not self.terms_accepted_at:
            self.terms_accepted_at = timezone.now()
            AuditLog.objects.create(
                branch=self.user.default_branch,
                user=self.user,
                action_type=AuditLog.ActionType.TERMS_ACCEPTED,
                username=self.user.username,
                details={'terms_version': self.terms_version or '1.0', 'user_type': self.user.user_type}
            )
            logger.info(f"Terms accepted for user: {self.user.username}", 
                       extra={'terms_version': self.terms_version, 'user_type': self.user.user_type})
        if self.pk and self.data_consent != self.__class__.objects.get(pk=self.pk).data_consent:
            AuditLog.objects.create(
                branch=self.user.default_branch,
                user=self.user,
                action_type=AuditLog.ActionType.CONSENT_UPDATED,
                username=self.user.username,
                details={'data_consent': self.data_consent, 'user_type': self.user.user_type}
            )
            logger.info(f"Data consent updated for user: {self.user.username}", 
                       extra={'data_consent': self.data_consent, 'user_type': self.user.user_type})
        super().save(*args, **kwargs)
        logger.info(f"Profile saved for user: {self.user.username}", 
                   extra={'user_type': self.user.user_type})

    def has_complete_profile(self) -> bool:
        if self.user.user_type == 'guest':
            return True
        required_fields = [self.user.first_name, self.user.last_name, self.email or self.phone_number, self.address, self.terms_accepted]
        return all(field for field in required_fields)

    def get_age(self) -> Optional[int]:
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None

    def can_receive_notifications(self, channel: str) -> bool:
        return (
            self.terms_accepted and
            self.data_consent.get('data_processing', False) and
            self.notifications.get(channel, False) and (
                channel == 'email' and bool(self.email) or
                channel in ('sms', 'whatsapp') and bool(self.phone_number) or
                channel == 'push' and bool(self.push_token) or
                channel == 'in_app'
            )
        )

    def withdraw_consent(self, consent_type: str):
        """Withdraw specific data consent (e.g., marketing, analytics)."""
        logger = Logger(__name__, user=self.user)
        if consent_type in self.data_consent:
            self.data_consent[consent_type] = False
            if consent_type == 'marketing':
                self.marketing_opt_in = False
            if consent_type == 'data_processing':
                self.notifications = {channel: False for channel in self.notifications}
            self.save()
            AuditLog.objects.create(
                branch=self.user.default_branch,
                user=self.user,
                action_type=AuditLog.ActionType.CONSENT_UPDATED,
                username=self.user.username,
                details={'consent_type': consent_type, 'status': 'withdrawn', 'user_type': self.user.user_type}
            )
            logger.info(f"Withdrew {consent_type} consent for user: {self.user.username}", 
                       extra={'consent_type': consent_type, 'user_type': self.user.user_type})

    def delete_profile(self):
        """Soft delete profile data for GDPR/CCPA compliance."""
        logger = Logger(__name__, user=self.user)
        self.email = None
        self.phone_number = None
        self.address = None
        self.date_of_birth = None
        self.gender = self.Gender.PREFER_NOT_TO_SAY
        self.bio = ''
        self.avatar = None
        self.notifications = {channel: False for channel in self.notifications}
        self.data_consent = {key: False for key in self.data_consent}
        self.marketing_opt_in = False
        self.terms_accepted = False
        self.terms_accepted_at = None
        self.terms_version = None
        self.save()
        AuditLog.objects.create(
            branch=self.user.default_branch,
            user=self.user,
            action_type=AuditLog.ActionType.PROFILE_DELETION,
            username=self.user.username,
            details={'reason': 'User requested profile deletion', 'user_type': self.user.user_type}
        )
        logger.info(f"Profile data deleted for user: {self.user.username}", 
                   extra={'user_type': self.user.user_type})

    def __str__(self):
        return f"Profile of {self.user.get_full_name()} ({self.user.get_user_type_display()})"

class AuditLog(AuditableModel):
    """Audit log for security and compliance tracking."""
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
        LOYALTY_POINTS_ADDED = 'loyalty_points_added', _('Loyalty Points Added')
        LOYALTY_POINTS_REDEEMED = 'loyalty_points_redeemed', _('Loyalty Points Redeemed')
        TERMS_ACCEPTED = 'terms_accepted', _('Terms Accepted')
        CONSENT_UPDATED = 'consent_updated', _('Consent Updated')
        PROFILE_DELETION = 'profile_deletion', _('Profile Deletion')

    class LoginStatus(models.TextChoices):
        SUCCESS = 'success', _('Success')
        FAILED = 'failed', _('Failed')
        BLOCKED = 'blocked', _('Blocked')

    class RiskLevel(models.TextChoices):
        LOW = 'low', _('Low')
        MEDIUM = 'medium', _('Medium')
        HIGH = 'high', _('High')
        CRITICAL = 'critical', _('Critical')

    branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.CASCADE,
        verbose_name=_("Branch")
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="audit_logs",
        verbose_name=_("User")
    )
    action_type = models.CharField(
        max_length=20,
        choices=ActionType.choices,
        default=ActionType.LOGIN,
        verbose_name=_("Action Type")
    )
    username = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Username")
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("IP Address")
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name=_("User Agent")
    )
    device_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Device Type")
    )
    login_status = models.CharField(
        max_length=20,
        choices=LoginStatus.choices,
        default=LoginStatus.SUCCESS,
        verbose_name=_("Status")
    )
    session_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Session ID")
    )
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Country")
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("City")
    )
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Additional Details")
    )
    risk_score = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Risk Score")
    )
    risk_level = models.CharField(
        max_length=10,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW,
        verbose_name=_("Risk Level")
    )

    class Meta:
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action_type', 'created_at']),
            models.Index(fields=['ip_address', 'login_status']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(risk_score__gte=0) & models.Q(risk_score__lte=100),
                name='valid_risk_score'
            )
        ]

    def save(self, *args, **kwargs):
        logger = Logger(__name__, user=self.user)
        if not self.username and self.user:
            self.username = self.user.username
        if not self.device_type and self.user_agent:
            self.device_type = self._get_device_type(self.user_agent)
        self.risk_score = self._calculate_risk_score()
        self.risk_level = self._determine_risk_level(self.risk_score)
        super().save(*args, **kwargs)
        logger.info(f"Audit log saved for action: {self.get_action_type_display()}", 
                   extra={'user_type': self.user.user_type, 'action_type': self.action_type})

    def _get_device_type(self, user_agent: str) -> str:
        ua = user_agent.lower()
        if any(mobile in ua for mobile in ['mobile', 'android', 'iphone', 'ipod']):
            return 'Mobile Device'
        if any(tablet in ua for tablet in ['tablet', 'ipad']):
            return 'Tablet'
        if 'windows' in ua:
            return 'Windows Desktop'
        if any(mac in ua for mac in ['macintosh', 'mac os']):
            return 'Mac Desktop'
        if 'linux' in ua:
            return 'Linux Desktop'
        return 'Unknown Device'

    def _calculate_risk_score(self) -> int:
        score = 0
        if self.login_status in (self.LoginStatus.FAILED, self.LoginStatus.BLOCKED):
            score += 40
        if not self.country or not self.city:
            score += 20
        if self.action_type in (self.ActionType.PERMISSION_CHANGE, self.ActionType.ACCOUNT_LOCKED, 
                              self.ActionType.TERMS_ACCEPTED, self.ActionType.CONSENT_UPDATED):
            score += 20
        if self.action_type == self.ActionType.PROFILE_DELETION:
            score += 30
        if self.user.user_type in [User.UserType.GUEST, User.UserType.PARTNER]:
            score += 10 
        return min(score, 100)

    def _determine_risk_level(self, score: int) -> str:
        if score >= 80:
            return self.RiskLevel.CRITICAL
        if score >= 50:
            return self.RiskLevel.HIGH
        if score >= 20:
            return self.RiskLevel.MEDIUM
        return self.RiskLevel.LOW

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.user.get_user_type_display()}) - {self.get_action_type_display()} at {self.created_at}"