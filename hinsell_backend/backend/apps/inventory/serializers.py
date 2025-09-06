from rest_framework import serializers
from django.utils import timezone
from django.db.models import Avg, Window, F
from django.db.models import Window
from django.db.models.functions import DenseRank
from apps.inventory.models import (
    StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit, ItemBarcode,
    InventoryBalance
)
from apps.shared.serializers import MediaSerializer
from apps.hinsell.serializers import CampaignSerializer, CouponSerializer, ItemReviewSerializer, OfferSerializer
from apps.hinsell.models import Campaign

class StoreGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreGroup
        fields = '__all__'
        read_only_fields = ('slug', 'code')

class ItemGroupSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = ItemGroup
        fields = '__all__'
        read_only_fields = ('slug', 'code')

class ItemVariantSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    class Meta:
        model = ItemVariant
        fields = '__all__'
        read_only_fields = ('code',)

class ItemUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemUnit
        fields = '__all__'
        read_only_fields = ('code',)

class ItemBarcodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemBarcode
        fields = '__all__'

class InventoryBalanceSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    is_near_expiry = serializers.SerializerMethodField()

    def get_is_expired(self, obj):
        return obj.is_expired()

    def get_is_near_expiry(self, obj):
        return obj.is_near_expiry()

    class Meta:
        model = InventoryBalance
        fields = '__all__'

class SimilarItemResponseSerializer(serializers.ModelSerializer):
    similarity_score = serializers.FloatField(read_only=True)
    sales_price = serializers.DecimalField(source='variants__sales_price', read_only=True, max_digits=15, decimal_places=4)

    class Meta:
        model = Item
        fields = ('id', 'name', 'slug', 'sales_price', 'average_rating', 'similarity_score')

class ItemSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    item_group_name = serializers.CharField(source='item_group.name', read_only=True)
    variants = ItemVariantSerializer(many=True, read_only=True)
    reviews = ItemReviewSerializer(many=True, read_only=True)
    active_offers = serializers.SerializerMethodField()
    active_coupons = serializers.SerializerMethodField()
    is_popular = serializers.SerializerMethodField()
    is_best_selling = serializers.SerializerMethodField()
    group_ranking = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()

    def get_active_offers(self, obj):
        """
        Return details of active offers and their associated campaigns, if any.
        """
        now = timezone.now()
        offers = obj.offers.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )
        offer_data = OfferSerializer(offers, many=True, context=self.context).data
        
        # Add associated campaign details for each offer
        for offer_dict in offer_data:
            offer_id = offer_dict['id']
            campaign = Campaign.objects.filter(offer__id=offer_id, is_active=True, start_date__lte=now, end_date__gte=now).first()
            if campaign:
                offer_dict['campaign'] = CampaignSerializer(campaign, context=self.context).data
            else:
                offer_dict['campaign'] = None
        
        return offer_data

    def get_active_coupons(self, obj):
        """
        Return details of active coupons and their associated campaigns, if any.
        """
        now = timezone.now()
        coupons = obj.coupons.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )
        coupon_data = CouponSerializer(coupons, many=True, context=self.context).data
        
        # Add associated campaign details for each coupon
        for coupon_dict in coupon_data:
            coupon_id = coupon_dict['id']
            campaign = Campaign.objects.filter(coupon__id=coupon_id, is_active=True, start_date__lte=now, end_date__gte=now).first()
            if campaign:
                coupon_dict['campaign'] = CampaignSerializer(campaign, context=self.context).data
            else:
                coupon_dict['campaign'] = None
        
        return coupon_data

    def get_is_popular(self, obj):
        avg_reviews = Item.objects.aggregate(avg=Avg('review_count'))['avg'] or 0
        return obj.review_count > avg_reviews * 1.5

    def get_is_best_selling(self, obj):
        return obj.average_rating >= 4.0 and obj.review_count > 50

    def get_group_ranking(self, obj):
        ranked_items = Item.objects.filter(item_group=obj.item_group).annotate(
            rank=Window(
                expression=DenseRank(),
                order_by=F('average_rating').desc(nulls_last=True)
            )
        ).values('id', 'rank')
        for item in ranked_items:
            if item['id'] == obj.id:
                return item['rank']
        return None

    def get_current_stock(self, obj):
        return obj.get_current_stock()

    def get_is_low_stock(self, obj):
        return obj.is_low_stock()

    class Meta:
        model = Item
        fields = (
            'id', 'branch', 'item_group', 'item_group_name', 'name', 'slug', 'item_type',
            'base_unit', 'manufacturer', 'brand', 'media', 'meta_title', 'meta_description',
            'tags', 'average_rating', 'review_count', 'is_featured', 'visibility',
            'track_expiry', 'track_batches', 'allow_discount', 'allow_bonus',
            'expiry_warning_days', 'description', 'short_description', 'internal_notes',
            'markup_percentage', 'discount_percentage', 'commission_percentage',
            'vat_percentage', 'handling_fee', 'variants', 'reviews', 'active_offers',
            'active_coupons', 'is_popular', 'is_best_selling', 'group_ranking',
            'current_stock', 'is_low_stock'
        )
        read_only_fields = ('slug', 'average_rating', 'review_count')