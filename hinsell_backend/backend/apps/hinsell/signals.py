from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign
from apps.hinsell.tasks import update_algolia_index, delete_algolia_index
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign
from apps.transactions.models import TransactionHeader
from apps.notifications.models import Notification
from apps.core_apps.utils import Logger

logger = Logger(__name__)



@receiver(post_save, sender=TransactionHeader)
def transaction_status_updated(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'user_{instance.created_by_id}',
        {
            'type': 'transaction_update',
            'transaction_id': instance.id,
            'status': instance.status,
            'updated_at': instance.updated_at.isoformat(),
        }
    )
    async_to_sync(channel_layer.group_send)(
        f'branch_{instance.branch_id}',
        {
            'type': 'transaction_update',
            'transaction_id': instance.id,
            'status': instance.status,
            'updated_at': instance.updated_at.isoformat(),
        }
    )
    logger.info(f"Transaction {instance.transaction_number} status updated to {instance.status}")

@receiver(post_save, sender=Notification)
def notification_created(sender, instance, created, **kwargs):
    if created or instance.status in ['PENDING', 'SENT']:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{instance.recipient_id}',
            {
                'type': 'notification_update',
                'notification_id': instance.id,
                'message': instance.message,
                'status': instance.status,
                'created_at': instance.created_at.isoformat(),
            }
        )
        logger.info(f"Notification {instance.id} sent to user {instance.recipient_id}")

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

@receiver(post_save, sender=Offer)
def handle_offer_save(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'Offer', str(instance.pk))


@receiver(pre_delete, sender=Offer)
def handle_offer_delete(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'Offer', str(instance.pk))


@receiver(post_save, sender=Coupon)
def handle_coupon_save(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'Coupon', str(instance.pk))


@receiver(pre_delete, sender=Coupon)
def handle_coupon_delete(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'Coupon', str(instance.pk))


@receiver(post_save, sender=UserCoupon)
def handle_user_coupon_save(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'UserCoupon', str(instance.pk))


@receiver(pre_delete, sender=UserCoupon)
def handle_user_coupon_delete(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'UserCoupon', str(instance.pk))


@receiver(post_save, sender=Campaign)
def handle_campaign_save(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'Campaign', str(instance.pk))


@receiver(pre_delete, sender=Campaign)
def handle_campaign_delete(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'Campaign', str(instance.pk))