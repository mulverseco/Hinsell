from celery import shared_task
from django.utils import timezone
from django.core.cache import cache
from apps.hinsell.models import Offer, Campaign, UserCoupon,Coupon
from apps.core_apps.utils import Logger

logger = Logger(__name__)

@shared_task
def deactivate_expired_promotions():
    """Deactivate expired offers and campaigns."""
    now = timezone.now()
    expired_offers = Offer.objects.filter(end_date__lt=now, is_active=True)
    expired_campaigns = Campaign.objects.filter(end_date__lt=now, is_active=True)
    
    for offer in expired_offers:
        offer.is_active = False
        offer.save(update_fields=['is_active'])
        cache.delete(f"active_offers_{offer.branch.id}")
        logger.info(f"Deactivated expired offer {offer.code}", extra={'offer_id': offer.id})
    
    for campaign in expired_campaigns:
        campaign.is_active = False
        campaign.save(update_fields=['is_active'])
        logger.info(f"Deactivated expired campaign {campaign.code}", extra={'campaign_id': campaign.id})
    
    return f"Deactivated {expired_offers.count()} offers and {expired_campaigns.count()} campaigns"

@shared_task
def notify_upcoming_offers():
    """Notify users about offers starting within the next 24 hours."""
    now = timezone.now()
    upcoming_offers = Offer.objects.filter(
        start_date__gte=now,
        start_date__lte=now + timezone.timedelta(hours=24),
        is_active=True
    )
    for offer in upcoming_offers:
        offer.notify_users()
        logger.info(f"Notified users about upcoming offer {offer.code}", extra={'offer_id': offer.id})
    
    return f"Notified users about {upcoming_offers.count()} upcoming offers"

@shared_task
def clean_expired_user_coupons():
    """Remove unused user coupons for expired coupons."""
    now = timezone.now()
    expired_user_coupons = UserCoupon.objects.filter(
        coupon__end_date__lt=now,
        is_used=False
    )
    count = expired_user_coupons.count()
    expired_user_coupons.delete()
    logger.info(f"Cleaned {count} expired user coupons")
    return f"Cleaned {count} expired user coupons"

@receiver(post_save, sender=Offer)
def save_offer_index(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'Offer', str(instance.pk))


@receiver(pre_delete, sender=Offer)
def delete_offer_index(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'Offer', str(instance.pk))


@receiver(post_save, sender=Coupon)
def save_coupon_index(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'Coupon', str(instance.pk))


@receiver(pre_delete, sender=Coupon)
def delete_coupon_index(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'Coupon', str(instance.pk))


@receiver(post_save, sender=UserCoupon)
def save_user_coupon_index(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'UserCoupon', str(instance.pk))


@receiver(pre_delete, sender=UserCoupon)
def delete_user_coupon_index(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'UserCoupon', str(instance.pk))


@receiver(post_save, sender=Campaign)
def save_campaign_index(sender, instance, **kwargs):
    update_algolia_index.delay('hinsell', 'Campaign', str(instance.pk))


@receiver(pre_delete, sender=Campaign)
def delete_campaign_index(sender, instance, **kwargs):
    delete_algolia_index.delay('hinsell', 'Campaign', str(instance.pk))