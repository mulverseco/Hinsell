import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign

def get_record_without_uuids(obj, exclude_fields=None):
    """
    Return a dict of object's fields for Algolia indexing, excluding UUIDs or specified fields.
    """
    if exclude_fields is None:
        exclude_fields = []

    record = {}
    for field in obj._meta.fields:
        name = field.name
        value = getattr(obj, name)

        if name in exclude_fields:
            continue
        if isinstance(value, (uuid.UUID, )):
            continue
        record[name] = value
    return record

@register(Offer)
class OfferIndex(AlgoliaIndex):
    fields = ('code', 'name', 'slug', 'offer_type', 'target_type', 'discount_percentage', 'discount_amount', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        return get_record_without_uuids(obj)


@register(Coupon)
class CouponIndex(AlgoliaIndex):
    fields = ('code', 'name', 'coupon_type', 'value', 'min_order_amount', 'max_uses', 'current_uses', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        return get_record_without_uuids(obj)


@register(UserCoupon)
class UserCouponIndex(AlgoliaIndex):
    fields = ('is_used', 'redemption_date')

    def get_record(self, obj):
        return get_record_without_uuids(obj)


@register(Campaign)
class CampaignIndex(AlgoliaIndex):
    fields = ('code', 'name', 'slug', 'campaign_type', 'start_date', 'end_date', 'is_active', 'impressions', 'clicks', 'conversions', 'conversion_rate')

    def get_record(self, obj):
        return get_record_without_uuids(obj)