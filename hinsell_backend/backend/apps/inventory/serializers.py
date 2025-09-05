from rest_framework import serializers
from django.utils import timezone
from django.db.models import Avg, Count, Window, F, RowNumber
from django.db.models.functions import DenseRank
from apps.inventory.models import (
    StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit, ItemBarcode, ItemReview,
    InventoryBalance
)
from apps.shared.serializers import MediaSerializer

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

class ItemReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemReview
        fields = '__all__'

class SimilarItemResponseSerializer(serializers.ModelSerializer):
    similarity_score = serializers.FloatField(read_only=True)
    sales_price = serializers.DecimalField(source='variants__sales_price', read_only=True, max_digits=15, decimal_places=4)

    class Meta:
        model = Item
        fields = ('id', 'name', 'slug', 'sales_price', 'average_rating', 'similarity_score')

class ItemSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    variants = ItemVariantSerializer(many=True, read_only=True)
    reviews = ItemReviewSerializer(many=True, read_only=True)
    has_active_offers = serializers.SerializerMethodField()
    has_active_coupons = serializers.SerializerMethodField()
    is_popular = serializers.SerializerMethodField()
    is_best_selling = serializers.SerializerMethodField()  # Placeholder; assumes based on reviews since no sales data
    group_ranking = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()

    def get_has_active_offers(self, obj):
        now = timezone.now()
        return obj.offers.filter(is_active=True, start_date__lte=now, end_date__gte=now).exists()

    def get_has_active_coupons(self, obj):
        now = timezone.now()
        return obj.coupons.filter(is_active=True, start_date__lte=now, end_date__gte=now).exists()

    def get_is_popular(self, obj):
        # Arbitrary threshold; in production, compute via task and store in cache or field
        avg_reviews = Item.objects.aggregate(avg=Avg('review_count'))['avg'] or 0
        return obj.review_count > avg_reviews * 1.5

    def get_is_best_selling(self, obj):
        # Placeholder: top 10% by rating * reviews; for efficiency, precompute
        return obj.average_rating >= 4.0 and obj.review_count > 50  # Adjust based on data

    def get_group_ranking(self, obj):
        # Efficient ranking using window function
        ranked_items = Item.objects.filter(item_group=obj.item_group).annotate(
            rank=DenseRank().over(
                Window(
                    expression=RowNumber(),
                    order_by=F('average_rating').desc(nulls_last=True)
                )
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
        fields = '__all__'
        read_only_fields = ('slug', 'average_rating', 'review_count')