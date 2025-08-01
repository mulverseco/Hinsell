import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.core_apps.utils import generate_unique_code, get_default_data_consent, get_default_notifications
from apps.core_apps.general import AuditableModel
from phonenumber_field.modelfields import PhoneNumberField
from decimal import Decimal
from apps.core_apps.validators import validate_percentage
from django.db.utils import IntegrityError


def upload_avatar(instance, filename):
    random_uuid = uuid.uuid4().hex
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
    return f'avatars/{instance.user.username}/{random_uuid}.{extension}'

def generate_unique_username(email: str) -> str:
    base_username = email.split('@')[0].replace('.', '').replace('_', '').lower()[:30]
    username = base_username
    if not User.objects.filter(username=username).exists():
        return username
    while True:
        suffix = uuid.uuid4().hex[:8]
        username = f"{base_username}_{suffix}"[:50]
        if not User.objects.filter(username=username).exists():
            return username

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, user_type='customer', **extra_fields):
        from apps.core_apps.utils import Logger
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

    def create_superuser(self, username=None, email=None, password=None, **extra_fields):
        from apps.core_apps.utils import Logger
        logger = Logger(__name__)
        try:
            extra_fields.setdefault("is_staff", True)
            extra_fields.setdefault("is_superuser", True)
            extra_fields.setdefault("is_active", True)
            extra_fields.setdefault("user_type", 'admin')
            if not extra_fields.get("is_staff"):
                raise ValueError(_("Superuser must have is_staff=True."))
            if not extra_fields.get("is_superuser"):
                raise ValueError(_("Superuser must have is_superuser=True."))
            if not password:
                raise ValueError(_("Superuser must have a password."))
            user = self.create_user(
                email=email,
                password=password,
                **extra_fields
            )
            logger.info(f"Superuser created successfully: {user.username}", 
                       extra={'user_type': 'admin'})
            return user
        except Exception as e:
            logger.error(f"Error creating superuser with email {email}: {str(e)}", 
                        extra={'user_type': 'admin'}, exc_info=True)
            raise

    def _validate_email(self, email: str) -> bool:
        try:
            EmailValidator()(email)
            return True
        except ValidationError:
            raise ValueError(_("Invalid email address format"))

class User(AbstractBaseUser, PermissionsMixin, AuditableModel):
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
        verbose_name=_("Employee Code")
    )
    is_two_factor_enabled = models.BooleanField(
        default=False,
        verbose_name=_("Two-Factor Authentication Enabled")
    )
    is_staff = models.BooleanField(
        default=False,
        verbose_name=_("Staff Status"),
        help_text=_("Designates whether the user can log into the admin site.")
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
    last_activity = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Activity")
    )

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['']

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        indexes = [
            models.Index(fields=['username', 'email']),
            models.Index(fields=['code']),
            models.Index(fields=['is_active'], condition=models.Q(is_active=True), name='active_users_idx'),
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
        if self.user_type in [self.UserType.EMPLOYEE, self.UserType.MANAGER, self.UserType.ADMIN] and not self.code:
            self.code = generate_unique_code('EMP', length=12)
        if self.code and not self.code.strip():
            raise ValidationError({'code': _('Employee code cannot be empty if provided.')})
        if self.user_type in [self.UserType.EMPLOYEE, self.UserType.MANAGER, self.UserType.ADMIN] and not self.code:
            raise ValidationError({'code': _('Employee code is required for employee, manager, or admin users.')})
        if self.user_type == self.UserType.GUEST and (self.first_name or self.last_name):
            raise ValidationError({'first_name': _('Guest users should not have personal information.'),
                                 'last_name': _('Guest users should not have personal information.')})

    def save(self, *args, **kwargs):
        from apps.core_apps.utils import Logger
        logger = Logger(__name__)
        if self.user_type in [self.UserType.EMPLOYEE, self.UserType.MANAGER, self.UserType.ADMIN] and not self.code:
            self.code = generate_unique_code('EMP', length=12)
        retries = 3
        while retries > 0:
            try:
                super().save(*args, **kwargs)
                logger.info(f"User saved successfully: {self.username}", extra={'user_type': self.user_type})
                return
            except IntegrityError as e:
                if 'unique constraint' in str(e).lower() and 'code' in str(e).lower():
                    self.code = generate_unique_code('EMP', length=12)
                    retries -= 1
                else:
                    logger.error(f"Error saving user {self.username}: {str(e)}", exc_info=True)
                    raise
        raise ValidationError({'code': _('Unable to generate a unique employee code after retries.')})

    def get_full_name(self) -> str:
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.username

    def get_short_name(self) -> str:
        return self.first_name or self.username

    def is_account_locked(self) -> bool:
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_user_type_display()})"

class UserProfile(AuditableModel):
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
        "shared.Media",
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
    push_token = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Push Notification Token"),
        help_text=_("Device token for push notifications (e.g., FCM or APNs token)"),
        db_index=True
    )
    phone_number = models.PhoneNumberField(
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
        default=get_default_notifications,
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
        default=get_default_data_consent,
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
            models.Index(fields=['phone_number']),
            models.Index(fields=['terms_accepted', 'terms_version']),
            models.Index(fields=['push_token']),
        ]

    def clean(self):
        super().clean()
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError({'date_of_birth': _('Date of Birth cannot be in the future.')})
        if any(self.notifications.get(channel, False) for channel in ['email', 'sms', 'whatsapp', 'push']) and not (self.user.email or self.phone_number):
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
        from apps.core_apps.utils import Logger
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
            from apps.authentication.models import AuditLog
            AuditLog.objects.create(
                branch=self.user.default_branch,
                user=self.user,
                action_type=AuditLog.ActionType.TERMS_ACCEPTED,
                username=self.user.username,
                details={'terms_version': self.terms_version or '1.0', 'user_type': self.user.user_type}
            )
            logger.info(f"Terms accepted for user: {self.user.username}", 
                       extra={'terms_version': self.terms_version, 'user_type': self.user.user_type})
        super().save(*args, **kwargs)
        logger.info(f"Profile saved for user: {self.user.username}", 
                   extra={'user_type': self.user.user_type})

    def has_complete_profile(self) -> bool:
        if self.user.user_type == 'guest':
            return True
        required_fields = [self.user.first_name, self.user.last_name, self.user.email or self.phone_number, self.address, self.terms_accepted]
        return all(field for field in required_fields)

    def get_age(self) -> int:
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
                channel == 'email' and bool(self.user.email) or
                channel in ('sms', 'whatsapp') and bool(self.phone_number) or
                channel == 'push' and bool(self.push_token) or
                channel == 'in_app'
            )
        )

    def __str__(self):
        return f"Profile of {self.user.get_full_name()} ({self.user.get_user_type_display()})"

class AuditLog(AuditableModel):
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
        PUSH_TOKEN_UPDATED = 'push_token_updated', _('Push Token Updated')

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
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Branch")
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="audit_logs",
        verbose_name=_("User")
    )
    action_type = models.CharField(
        max_length=50,
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
        from apps.core_apps.utils import Logger
        logger = Logger(__name__, user=self.user)
        if not self.username and self.user:
            self.username = self.user.username
        super().save(*args, **kwargs)
        logger.info(f"Audit log saved for action: {self.get_action_type_display()}", 
                   extra={'user_type': self.user.user_type, 'action_type': self.action_type})

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.user.get_user_type_display()}) - {self.get_action_type_display()} at {self.created_at}"