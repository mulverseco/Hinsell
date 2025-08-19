import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register

from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign


@register(Offer)
class OfferIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'offer_type', 'target_type', 'discount_percentage', 'discount_amount', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        """Serialize the Offer model for Algolia indexing."""
        record = super().get_record(obj)
        # Convert UUIDs to strings
        if isinstance(obj.id, uuid.UUID):
            record['id'] = str(obj.id)
        return record


@register(Coupon)
class CouponIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'coupon_type', 'value', 'min_order_amount', 'max_uses', 'current_uses', 'start_date', 'end_date', 'is_active')

    def get_record(self, obj):
        record = super().get_record(obj)
        if isinstance(obj.id, uuid.UUID):
            record['id'] = str(obj.id)
        return record


@register(UserCoupon)
class UserCouponIndex(AlgoliaIndex):
    fields = ('id', 'user_id', 'coupon_id', 'branch_id', 'is_used', 'redemption_date')

    def get_record(self, obj):
        record = super().get_record(obj)
        # Convert foreign keys & UUIDs
        record['id'] = str(obj.id) if isinstance(obj.id, uuid.UUID) else obj.id
        record['user_id'] = str(obj.user_id) if isinstance(obj.user_id, uuid.UUID) else obj.user_id
        record['coupon_id'] = str(obj.coupon_id) if isinstance(obj.coupon_id, uuid.UUID) else obj.coupon_id
        record['branch_id'] = str(obj.branch_id) if isinstance(obj.branch_id, uuid.UUID) else obj.branch_id
        return record


@register(Campaign)
class CampaignIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'campaign_type', 'start_date', 'end_date', 'is_active', 'impressions', 'clicks', 'conversions', 'conversion_rate')

    def get_record(self, obj):
        record = super().get_record(obj)
        if isinstance(obj.id, uuid.UUID):
            record['id'] = str(obj.id)
        if obj.offer_id:
            record['offer_id'] = str(obj.offer_id) if isinstance(obj.offer_id, uuid.UUID) else obj.offer_id
        if obj.coupon_id:
            record['coupon_id'] = str(obj.coupon_id) if isinstance(obj.coupon_id, uuid.UUID) else obj.coupon_id
        return record
