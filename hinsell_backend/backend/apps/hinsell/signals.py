from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign
from apps.core_apps.utils import Logger

logger = Logger(__name__)

@receiver(post_save, sender=Offer)
def clear_offer_cache(sender, instance, **kwargs):
    """Clear offer cache on save."""
    cache.delete(f"active_offers_{instance.branch.id}")
    logger.info(f"Cleared offer cache for branch {instance.branch.id}", extra={'offer_id': instance.id})

@receiver(post_delete, sender=Offer)
def clear_offer_cache_on_delete(sender, instance, **kwargs):
    """Clear offer cache on delete."""
    cache.delete(f"active_offers_{instance.branch.id}")
    logger.info(f"Cleared offer cache on delete for branch {instance.branch.id}", extra={'offer_id': instance.id})

@receiver(post_save, sender=Coupon)
def notify_new_coupon(sender, instance, created, **kwargs):
    """Notify target users about new coupons."""
    if created and instance.target_users.exists():
        instance.notify_users()
        logger.info(f"Notified users about new coupon {instance.code}", extra={'coupon_id': instance.id})

@receiver(post_save, sender=UserCoupon)
def log_coupon_redemption(sender, instance, created, **kwargs):
    """Log coupon redemption."""
    if created and instance.is_used:
        logger.info(f"Coupon {instance.coupon.code} redeemed by user {instance.user.username}", 
                   extra={'coupon_id': instance.coupon.id, 'user_id': instance.user.id, 'order_id': instance.order.id if instance.order else None})

@receiver(post_save, sender=Campaign)
def launch_new_campaign(sender, instance, created, **kwargs):
    """Launch campaign if newly created and active."""
    if created and instance.is_active and instance.start_date <= timezone.now():
        instance.launch()
        logger.info(f"Launched new campaign {instance.code}", extra={'campaign_id': instance.id})