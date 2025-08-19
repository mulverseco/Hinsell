import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign

# Monkey patch methods for should_index
def offer_is_indexable(self):
    return self.is_active
Offer.is_indexable = offer_is_indexable

def coupon_is_indexable(self):
    return self.is_active
Coupon.is_indexable = coupon_is_indexable

def campaign_is_indexable(self):
    return self.is_active
Campaign.is_indexable = campaign_is_indexable

def serialize_record(record):
    """Recursively convert UUIDs to strings and related objects to IDs."""
    if isinstance(record, dict):
        return {k: serialize_record(v) for k, v in record.items()}
    elif isinstance(record, list):
        return [serialize_record(v) for v in record]
    elif isinstance(record, uuid.UUID):
        return str(record)
    # Convert Django model instances to their primary key
    elif hasattr(record, "pk"):
        return serialize_record(record.pk)
    return record

@register(Offer)
class OfferIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'offer_type', 'target_type',
              'discount_percentage', 'discount_amount', 'start_date', 'end_date', 'is_active',
              'description', 'terms_conditions', 'max_uses', 'current_uses')

    should_index = 'is_indexable'

    settings = {
        'searchableAttributes': ['name', 'code', 'description', 'terms_conditions'],
        'attributesForFaceting': ['offer_type', 'target_type', 'is_active', 'filterOnly(discount_percentage)'],
        'ranking': ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }

    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        return serialize_record(record)

@register(Coupon)
class CouponIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'coupon_type', 'value', 'min_order_amount',
              'max_uses', 'current_uses', 'start_date', 'end_date', 'is_active',
              'description', 'terms_conditions')

    should_index = 'is_indexable'

    settings = {
        'searchableAttributes': ['name', 'code', 'description', 'terms_conditions'],
        'attributesForFaceting': ['coupon_type', 'is_active', 'filterOnly(value)'],
        'ranking': ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }

    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        return serialize_record(record)

@register(UserCoupon)
class UserCouponIndex(AlgoliaIndex):
    fields = ('id', 'user_id', 'coupon_id', 'branch_id', 'is_used', 'redemption_date')

    settings = {
        'searchableAttributes': [],
        'attributesForFaceting': ['user_id', 'coupon_id', 'is_used'],
        'ranking': ['desc(redemption_date)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }

    def order_id(self, obj):
        return obj.order.id if obj.order else None

    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        record['order_id'] = self.order_id(obj)
        return serialize_record(record)

@register(Campaign)
class CampaignIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'campaign_type', 'start_date', 'end_date',
              'is_active', 'impressions', 'clicks', 'conversions', 'conversion_rate',
              'offer_id', 'coupon_id', 'content', 'call_to_action')

    should_index = 'is_indexable'

    settings = {
        'searchableAttributes': ['name', 'code', 'content', 'call_to_action'],
        'attributesForFaceting': ['campaign_type', 'is_active', 'filterOnly(conversion_rate)'],
        'ranking': ['desc(conversion_rate)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }

    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        return serialize_record(record)