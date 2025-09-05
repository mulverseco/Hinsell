from rest_framework import serializers
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign
from apps.shared.serializers import MediaSerializer

class OfferSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Offer
        fields = '__all__'
        read_only_fields = ('slug', 'code', 'current_uses')

class CouponSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Coupon
        fields = '__all__'
        read_only_fields = ('code', 'current_uses')

class UserCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCoupon
        fields = '__all__'

class CampaignSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ('slug', 'code', 'impressions', 'clicks', 'conversions', 'conversion_rate')