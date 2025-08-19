import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign

def uuid_to_str(value):
    return str(value) if isinstance(value, uuid.UUID) else value
    
@register(Offer)
class OfferIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'offer_type', 'target_type',
              'discount_percentage', 'discount_amount', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        return record


@register(Coupon)
class CouponIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'coupon_type', 'value', 'min_order_amount',
              'max_uses', 'current_uses', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        return record


@register(UserCoupon)
class UserCouponIndex(AlgoliaIndex):
    fields = ('id', 'user_id', 'coupon_id', 'branch_id', 'is_used', 'redemption_date')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        record['user_id'] = uuid_to_str(obj.user_id)
        record['coupon_id'] = uuid_to_str(obj.coupon_id)
        record['branch_id'] = uuid_to_str(obj.branch_id)
        return record


@register(Campaign)
class CampaignIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'campaign_type', 'start_date', 'end_date',
              'is_active', 'impressions', 'clicks', 'conversions', 'conversion_rate',
              'offer_id', 'coupon_id')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        record['offer_id'] = uuid_to_str(obj.offer_id) if obj.offer_id else None
        record['coupon_id'] = uuid_to_str(obj.coupon_id) if obj.coupon_id else None
        return record