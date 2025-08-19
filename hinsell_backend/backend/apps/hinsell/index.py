import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign

def serialize_record(record):
    """Recursively convert UUIDs to strings in dicts, lists, or single values."""
    if isinstance(record, dict):
        return {k: serialize_record(v) for k, v in record.items()}
    elif isinstance(record, list):
        return [serialize_record(v) for v in record]
    elif isinstance(record, uuid.UUID):
        return str(record)
    return record

@register(Offer)
class OfferIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'offer_type', 'target_type',
              'discount_percentage', 'discount_amount', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)


@register(Coupon)
class CouponIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'coupon_type', 'value', 'min_order_amount',
              'max_uses', 'current_uses', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)


@register(UserCoupon)
class UserCouponIndex(AlgoliaIndex):
    fields = ('id', 'user_id', 'coupon_id', 'branch_id', 'is_used', 'redemption_date')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)


@register(Campaign)
class CampaignIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'campaign_type', 'start_date', 'end_date',
              'is_active', 'impressions', 'clicks', 'conversions', 'conversion_rate',
              'offer_id', 'coupon_id')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)