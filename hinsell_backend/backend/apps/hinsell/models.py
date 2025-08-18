import logging
from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core_apps.general import AuditableModel
from apps.core_apps.validators import validate_percentage
from apps.core_apps.utils import generate_unique_code, generate_unique_slug, Logger
from apps.authentication.models import User
from apps.organization.models import Branch
from apps.inventory.models import Item, ItemGroup, StoreGroup, Media
from apps.core_apps.services.messaging_service import MessagingService
from apps.transactions.models import TransactionHeader
from django.db.utils import IntegrityError

logger = logging.getLogger(__name__)

class Offer(AuditableModel):
    """Model for managing promotional offers with flexible targeting."""
    class OfferType(models.TextChoices):
        DISCOUNT = 'discount', _('Discount')
        BUY_X_GET_Y = 'buy_x_get_y', _('Buy X Get Y')
        BUNDLE = 'bundle', _('Bundle')
        LOYALTY_POINTS = 'loyalty_points', _('Loyalty Points')
        FREE_SHIPPING = 'free_shipping', _('Free Shipping')

    class TargetType(models.TextChoices):
        ALL = 'all', _('All')
        USER = 'user', _('Specific Users')
        COUNTRY = 'country', _('Specific Countries')
        ITEM = 'item', _('Specific Items')
        ITEM_GROUP = 'item_group', _('Item Groups')
        STORE_GROUP = 'store_group', _('Store Groups')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='offers',
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
    slug = models.SlugField(
        max_length=120,
        unique=True,
        verbose_name=_("Slug")
    )
    offer_type = models.CharField(
        max_length=20,
        choices=OfferType.choices,
        default=OfferType.DISCOUNT,
        verbose_name=_("Offer Type")
    )
    target_type = models.CharField(
        max_length=20,
        choices=TargetType.choices,
        default=TargetType.ALL,
        verbose_name=_("Target Type")
    )
    target_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='offers',
        verbose_name=_("Target Users")
    )
    target_countries = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Target Countries"),
        help_text=_("List of country codes (ISO 3166-1 alpha-2)")
    )
    target_items = models.ManyToManyField(
        Item,
        blank=True,
        related_name='offers',
        verbose_name=_("Target Items")
    )
    target_item_groups = models.ManyToManyField(
        ItemGroup,
        blank=True,
        related_name='offers',
        verbose_name=_("Target Item Groups")
    )
    target_store_groups = models.ManyToManyField(
        StoreGroup,
        blank=True,
        related_name='offers',
        verbose_name=_("Target Store Groups")
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Discount Percentage")
    )
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Discount Amount")
    )
    buy_quantity = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Buy Quantity"),
        help_text=_("Required quantity for Buy X Get Y offers")
    )
    get_quantity = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Get Quantity"),
        help_text=_("Free quantity for Buy X Get Y offers")
    )
    loyalty_points_earned = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Loyalty Points Earned")
    )
    start_date = models.DateTimeField(
        verbose_name=_("Start Date")
    )
    end_date = models.DateTimeField(
        verbose_name=_("End Date")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Active")
    )
    max_uses = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Max Uses"),
        help_text=_("Maximum number of uses (0 for unlimited)")
    )
    current_uses = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Current Uses")
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='offers',
        verbose_name=_("Media")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    terms_conditions = models.TextField(
        blank=True,
        verbose_name=_("Terms and Conditions")
    )
    meta_title = models.CharField(
        max_length=60,
        blank=True,
        verbose_name=_("Meta Title")
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        verbose_name=_("Meta Description")
    )

    class Meta:
        verbose_name = _("Offer")
        verbose_name_plural = _("Offers")
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['slug', 'is_active', 'start_date', 'end_date']),
            models.Index(fields=['offer_type', 'target_type']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(discount_percentage__gte=0) & models.Q(discount_percentage__lte=100),
                name='valid_offer_discount_percentage'
            ),
            models.CheckConstraint(
                check=models.Q(current_uses__lte=models.F('max_uses')) | models.Q(max_uses=0),
                name='valid_offer_uses'
            ),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.start_date >= self.end_date:
            raise ValidationError({'end_date': _('End date must be after start date.')})
        if self.offer_type == self.OfferType.BUY_X_GET_Y and (self.buy_quantity <= 0 or self.get_quantity <= 0):
            raise ValidationError({
                'buy_quantity': _('Buy quantity must be greater than 0 for Buy X Get Y offers.'),
                'get_quantity': _('Get quantity must be greater than 0 for Buy X Get Y offers.')
            })
        if self.offer_type == self.OfferType.DISCOUNT and self.discount_percentage == 0 and self.discount_amount == 0:
            raise ValidationError({
                'discount_percentage': _('Discount percentage or amount must be provided for discount offers.'),
                'discount_amount': _('Discount percentage or amount must be provided for discount offers.')
            })
        if self.target_type != self.TargetType.ALL and not any([
            self.target_users.exists(),
            self.target_countries,
            self.target_items.exists(),
            self.target_item_groups.exists(),
            self.target_store_groups.exists()
        ]):
            raise ValidationError({'target_type': _('At least one target must be specified for non-ALL target types.')})

    def is_valid(self, user: Optional[User] = None, country: Optional[str] = None, item: Optional[Item] = None) -> bool:
        """Check if the offer is valid for the given context."""
        now = timezone.now()
        if not self.is_active or now < self.start_date or now > self.end_date:
            return False
        if self.max_uses > 0 and self.current_uses >= self.max_uses:
            return False
        if self.target_type == self.TargetType.USER and user and not self.target_users.filter(id=user.id).exists():
            return False
        if self.target_type == self.TargetType.COUNTRY and country and country not in self.target_countries:
            return False
        if self.target_type == self.TargetType.ITEM and item and not self.target_items.filter(id=item.id).exists():
            return False
        if self.target_type == self.TargetType.ITEM_GROUP and item and not self.target_item_groups.filter(id=item.item_group.id).exists():
            return False
        if self.target_type == self.TargetType.STORE_GROUP and item and not self.target_store_groups.filter(id=item.item_group.store_group.id).exists():
            return False
        return True

    def apply(self, price: Decimal, quantity: int = 1, user: Optional[User] = None) -> Dict:
        """Apply the offer to a given price and return the result."""
        logger = Logger(__name__, user=user, branch_id=self.branch.id)
        result = {'original_price': price, 'discounted_price': price, 'points_earned': 0, 'free_items': 0}
        
        if not self.is_valid(user=user):
            logger.warning(f"Offer {self.code} is not valid for application", extra={'offer_id': self.id})
            return result

        if self.offer_type == self.OfferType.DISCOUNT:
            if self.discount_percentage > 0:
                discount = price * (self.discount_percentage / 100)
                result['discounted_price'] = max(price - discount, Decimal('0'))
            elif self.discount_amount > 0:
                result['discounted_price'] = max(price - self.discount_amount, Decimal('0'))
        elif self.offer_type == self.OfferType.BUY_X_GET_Y:
            if quantity >= self.buy_quantity:
                result['free_items'] = (quantity // self.buy_quantity) * self.get_quantity
        elif self.offer_type == self.OfferType.LOYALTY_POINTS:
            result['points_earned'] = self.loyalty_points_earned * quantity
        elif self.offer_type == self.OfferType.FREE_SHIPPING:
            result['discounted_price'] = price
        elif self.offer_type == self.OfferType.BUNDLE:
            result['discounted_price'] = price
        
        self.current_uses += 1
        self.save(update_fields=['current_uses'])
        logger.info(f"Applied offer {self.code} to price {price}", extra={'offer_id': self.id, 'result': result})
        return result

    def notify_users(self, users: Optional[List[User]] = None):
        """Notify targeted users about the offer."""
        service = MessagingService(self.branch)
        recipients = users or self.target_users.all() if self.target_type == self.TargetType.USER else User.objects.filter(default_branch=self.branch)
        for user in recipients:
            if user.profile and user.profile.can_receive_notifications('email'):
                try:
                    service.send_notification(
                        recipient=user,
                        notification_type='custom',
                        context_data={
                            'offer_name': self.name,
                            'offer_code': self.code,
                            'description': self.description,
                            'start_date': self.start_date.isoformat(),
                            'end_date': self.end_date.isoformat()
                        },
                        channel='email',
                        priority='normal'
                    )
                    logger.info(f"Notified user {user.username} about offer {self.code}", extra={'offer_id': self.id, 'user_id': user.id})
                except Exception as e:
                    logger.error(f"Error notifying user {user.username} about offer {self.code}: {str(e)}", extra={'offer_id': self.id, 'user_id': user.id}, exc_info=True)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.get_offer_type_display()})"

class Coupon(AuditableModel):
    """Model for managing coupons with user-specific redemption."""
    class CouponType(models.TextChoices):
        FIXED = 'fixed', _('Fixed Amount')
        PERCENTAGE = 'percentage', _('Percentage')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='coupons',
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
    coupon_type = models.CharField(
        max_length=20,
        choices=CouponType.choices,
        default=CouponType.PERCENTAGE,
        verbose_name=_("Coupon Type")
    )
    value = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Value")
    )
    min_order_amount = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Minimum Order Amount")
    )
    max_uses = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Max Uses"),
        help_text=_("Maximum number of uses (0 for unlimited)")
    )
    current_uses = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Current Uses")
    )
    start_date = models.DateTimeField(
        verbose_name=_("Start Date")
    )
    end_date = models.DateTimeField(
        verbose_name=_("End Date")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Active")
    )
    target_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='coupons',
        verbose_name=_("Target Users")
    )
    target_items = models.ManyToManyField(
        Item,
        blank=True,
        related_name='coupons',
        verbose_name=_("Target Items")
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='coupons',
        verbose_name=_("Media")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    terms_conditions = models.TextField(
        blank=True,
        verbose_name=_("Terms and Conditions")
    )

    class Meta:
        verbose_name = _("Coupon")
        verbose_name_plural = _("Coupons")
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['is_active', 'start_date', 'end_date']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(current_uses__lte=models.F('max_uses')) | models.Q(max_uses=0),
                name='valid_coupon_uses'
            ),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.start_date >= self.end_date:
            raise ValidationError({'end_date': _('End date must be after start date.')})
        if self.coupon_type == self.CouponType.PERCENTAGE and (self.value < 0 or self.value > 100):
            raise ValidationError({'value': _('Percentage value must be between 0 and 100.')})

    def is_valid(self, user: Optional[User] = None, order_amount: Decimal = Decimal('0')) -> bool:
        """Check if the coupon is valid for the given context."""
        now = timezone.now()
        if not self.is_active or now < self.start_date or now > self.end_date:
            return False
        if self.max_uses > 0 and self.current_uses >= self.max_uses:
            return False
        if self.min_order_amount > 0 and order_amount < self.min_order_amount:
            return False
        if self.target_users.exists() and user and not self.target_users.filter(id=user.id).exists():
            return False
        return True

    def apply(self, price: Decimal, user: Optional[User] = None) -> Decimal:
        """Apply the coupon to a given price."""
        logger = Logger(__name__, user=user, branch_id=self.branch.id)
        if not self.is_valid(user=user, order_amount=price):
            logger.warning(f"Coupon {self.code} is not valid for application", extra={'coupon_id': self.id})
            return price

        if self.coupon_type == self.CouponType.PERCENTAGE:
            discount = price * (self.value / 100)
            discounted_price = max(price - discount, Decimal('0'))
        else:
            discounted_price = max(price - self.value, Decimal('0'))

        self.current_uses += 1
        self.save(update_fields=['current_uses'])
        logger.info(f"Applied coupon {self.code} to price {price}", extra={'coupon_id': self.id, 'discounted_price': str(discounted_price)})
        return discounted_price

    def notify_users(self, users: Optional[List[User]] = None):
        """Notify targeted users about the coupon."""
        service = MessagingService(self.branch)
        recipients = users or self.target_users.all()
        for user in recipients:
            if user.profile and user.profile.can_receive_notifications('email'):
                try:
                    service.send_notification(
                        recipient=user,
                        notification_type='custom',
                        context_data={
                            'coupon_name': self.name,
                            'coupon_code': self.code,
                            'description': self.description,
                            'start_date': self.start_date.isoformat(),
                            'end_date': self.end_date.isoformat()
                        },
                        channel='email',
                        priority='normal'
                    )
                    logger.info(f"Notified user {user.username} about coupon {self.code}", extra={'coupon_id': self.id, 'user_id': user.id})
                except Exception as e:
                    logger.error(f"Error notifying user {user.username} about coupon {self.code}: {str(e)}", extra={'coupon_id': self.id, 'user_id': user.id}, exc_info=True)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.get_coupon_type_display()})"

class UserCoupon(AuditableModel):
    """Tracks coupon redemptions by users."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_coupons',
        verbose_name=_("User")
    )
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.CASCADE,
        related_name='user_coupons',
        verbose_name=_("Coupon")
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='user_coupons',
        verbose_name=_("Branch")
    )
    redemption_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Redemption Date")
    )
    order = models.ForeignKey(
        TransactionHeader,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_coupons',
        verbose_name=_("Transaction")
    )
    is_used = models.BooleanField(
        default=False,
        verbose_name=_("Used")
    )

    class Meta:
        verbose_name = _("User Coupon")
        verbose_name_plural = _("User Coupons")
        unique_together = [['user', 'coupon', 'order']]
        indexes = [
            models.Index(fields=['user', 'coupon']),
            models.Index(fields=['redemption_date', 'is_used']),
        ]

    def clean(self):
        super().clean()
        if self.is_used and not self.order:
            raise ValidationError({'order': _('Transaction must be specified for used coupons.')})

    def mark_as_used(self, transaction):
        """Mark coupon as used for a specific transaction."""
        logger = Logger(__name__, user=self.user, branch_id=self.branch.id)
        self.is_used = True
        self.order = transaction
        self.save(update_fields=['is_used', 'order'])
        logger.info(f"Coupon {self.coupon.code} marked as used by user {self.user.username} for transaction {transaction.code}", 
                   extra={'coupon_id': self.coupon.id, 'user_id': self.user.id, 'transaction_id': transaction.id})

    def __str__(self):
        return f"{self.coupon.code} - {self.user.get_full_name()}"

class Campaign(AuditableModel):
    """Model for managing promotional campaigns with analytics."""
    class CampaignType(models.TextChoices):
        EMAIL = 'email', _('Email Campaign')
        SOCIAL_MEDIA = 'social_media', _('Social Media')
        IN_APP = 'in_app', _('In-App Campaign')
        PUSH = 'push', _('Push Notification')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='campaigns',
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
    slug = models.SlugField(
        max_length=120,
        unique=True,
        verbose_name=_("Slug")
    )
    campaign_type = models.CharField(
        max_length=20,
        choices=CampaignType.choices,
        default=CampaignType.EMAIL,
        verbose_name=_("Campaign Type")
    )
    offer = models.ForeignKey(
        Offer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaigns',
        verbose_name=_("Offer")
    )
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaigns',
        verbose_name=_("Coupon")
    )
    target_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='campaigns',
        verbose_name=_("Target Users")
    )
    target_countries = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Target Countries"),
        help_text=_("List of country codes (ISO 3166-1 alpha-2)")
    )
    start_date = models.DateTimeField(
        verbose_name=_("Start Date")
    )
    end_date = models.DateTimeField(
        verbose_name=_("End Date")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Active")
    )
    impressions = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Impressions")
    )
    clicks = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Clicks")
    )
    conversions = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Conversions")
    )
    conversion_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        verbose_name=_("Conversion Rate")
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='campaigns',
        verbose_name=_("Media")
    )
    content = models.TextField(
        verbose_name=_("Content")
    )
    call_to_action = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Call to Action")
    )
    analytics_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Analytics Data")
    )

    class Meta:
        verbose_name = _("Campaign")
        verbose_name_plural = _("Campaigns")
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['slug', 'is_active', 'start_date', 'end_date']),
            models.Index(fields=['campaign_type']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(conversion_rate__gte=0) & models.Q(conversion_rate__lte=100),
                name='valid_conversion_rate'
            ),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if not self.content.strip():
            raise ValidationError({'content': _('Content cannot be empty.')})
        if self.start_date >= self.end_date:
            raise ValidationError({'end_date': _('End date must be after start date.')})
        if not self.offer and not self.coupon:
            raise ValidationError({'offer': _('At least one of offer or coupon must be specified.'), 'coupon': _('At least one of offer or coupon must be specified.')})

    def update_conversion_rate(self):
        """Update conversion rate based on impressions and conversions."""
        if self.impressions > 0:
            self.conversion_rate = (self.conversions / self.impressions) * 100
        else:
            self.conversion_rate = Decimal('0.00')

    def track_impression(self):
        """Track a campaign impression."""
        self.impressions += 1
        self.update_conversion_rate()
        self.save(update_fields=['impressions', 'conversion_rate'])
        logger.info(f"Tracked impression for campaign {self.code}", extra={'campaign_id': self.id, 'impressions': self.impressions})

    def track_click(self):
        """Track a campaign click."""
        self.clicks += 1
        self.save(update_fields=['clicks'])
        logger.info(f"Tracked click for campaign {self.code}", extra={'campaign_id': self.id, 'clicks': self.clicks})

    def track_conversion(self, user: Optional[User] = None):
        """Track a campaign conversion."""
        logger = Logger(__name__, user=user, branch_id=self.branch.id)
        self.conversions += 1
        self.update_conversion_rate()
        self.save(update_fields=['conversions', 'conversion_rate'])
        logger.info(f"Tracked conversion for campaign {self.code}", extra={'campaign_id': self.id, 'conversions': self.conversions, 'user_id': user.id if user else None})

    def launch(self, users: Optional[List[User]] = None):
        """Launch the campaign by notifying targeted users."""
        service = MessagingService(self.branch)
        recipients = users or self.target_users.all()
        for user in recipients:
            if user.profile and user.profile.can_receive_notifications(self.campaign_type):
                try:
                    context_data = {
                        'campaign_name': self.name,
                        'campaign_code': self.code,
                        'content': self.content,
                        'call_to_action': self.call_to_action,
                        'start_date': self.start_date.isoformat(),
                        'end_date': self.end_date.isoformat(),
                    }
                    if self.offer:
                        context_data['offer_code'] = self.offer.code
                    if self.coupon:
                        context_data['coupon_code'] = self.coupon.code
                    service.send_notification(
                        recipient=user,
                        notification_type='custom',
                        context_data=context_data,
                        channel=self.campaign_type,
                        priority='normal'
                    )
                    self.track_impression()
                    logger.info(f"Launched campaign {self.code} to user {user.username}", extra={'campaign_id': self.id, 'user_id': user.id})
                except Exception as e:
                    logger.error(f"Error launching campaign {self.code} to user {user.username}: {str(e)}", 
                                extra={'campaign_id': self.id, 'user_id': user.id}, exc_info=True)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.get_campaign_type_display()})"