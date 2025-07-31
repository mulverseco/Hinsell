from rest_framework import serializers
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign
from apps.inventory.models import Item, ItemGroup, StoreGroup
from apps.authentication.models import User
from apps.organization.models import Branch
from apps.shared.serializers import MediaSerializer

class OfferSerializer(serializers.ModelSerializer):
    target_users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )
    target_items = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), many=True, required=False
    )
    target_item_groups = serializers.PrimaryKeyRelatedField(
        queryset=ItemGroup.objects.all(), many=True, required=False
    )
    target_store_groups = serializers.PrimaryKeyRelatedField(
        queryset=StoreGroup.objects.all(), many=True, required=False
    )
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id', 'code', 'name', 'slug', 'offer_type', 'target_type', 'target_users',
            'target_countries', 'target_items', 'target_item_groups', 'target_store_groups',
            'discount_percentage', 'discount_amount', 'buy_quantity', 'get_quantity',
            'loyalty_points_earned', 'start_date', 'end_date', 'is_active', 'max_uses',
            'current_uses', 'media', 'description', 'terms_conditions', 'meta_title',
            'meta_description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['code', 'slug', 'current_uses', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        if data.get('offer_type') == Offer.OfferType.DISCOUNT:
            if data.get('discount_percentage', 0) == 0 and data.get('discount_amount', 0) == 0:
                raise serializers.ValidationError({
                    'discount_percentage': 'Discount percentage or amount must be provided for discount offers.'
                })
        return data

class CouponSerializer(serializers.ModelSerializer):
    target_users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )
    target_items = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), many=True, required=False
    )
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'coupon_type', 'value', 'min_order_amount', 'max_uses',
            'current_uses', 'start_date', 'end_date', 'is_active', 'target_users',
            'target_items', 'media', 'description', 'terms_conditions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['code', 'current_uses', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('coupon_type') == Coupon.CouponType.PERCENTAGE and data.get('value', 0) > 100:
            raise serializers.ValidationError({'value': 'Percentage value must be between 0 and 100.'})
        return data

class UserCouponSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    coupon = serializers.PrimaryKeyRelatedField(queryset=Coupon.objects.all())
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())

    class Meta:
        model = UserCoupon
        fields = [
            'id', 'user', 'coupon', 'branch', 'redemption_date', 'order', 'is_used',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['redemption_date', 'created_at', 'updated_at']

class CampaignSerializer(serializers.ModelSerializer):
    target_users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )
    offer = serializers.PrimaryKeyRelatedField(
        queryset=Offer.objects.all(), required=False, allow_null=True
    )
    coupon = serializers.PrimaryKeyRelatedField(
        queryset=Coupon.objects.all(), required=False, allow_null=True
    )
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Campaign
        fields = [
            'id', 'code', 'name', 'slug', 'campaign_type', 'offer', 'coupon', 'target_users',
            'target_countries', 'start_date', 'end_date', 'is_active', 'impressions', 'clicks',
            'conversions', 'conversion_rate', 'media', 'content', 'call_to_action',
            'analytics_data', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'code', 'slug', 'impressions', 'clicks', 'conversions', 'conversion_rate',
            'analytics_data', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        if not data.get('offer') and not data.get('coupon'):
            raise serializers.ValidationError({
                'offer': 'At least one of offer or coupon must be specified.',
                'coupon': 'At least one of offer or coupon must be specified.'
            })
        return data