from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.inventory.models import (
    StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance
)
from apps.organization.serializers import BranchSerializer
from apps.accounting.serializers import AccountSerializer
from apps.shared.serializers import MediaSerializer

class StoreGroupSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    stock_account = AccountSerializer(read_only=True)
    sales_account = AccountSerializer(read_only=True)
    cost_of_sales_account = AccountSerializer(read_only=True)

    class Meta:
        model = StoreGroup
        fields = '__all__'
        read_only_fields = ('slug', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(_('Name cannot be empty.'))
        return value

class ItemGroupSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    store_group = StoreGroupSerializer(read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=ItemGroup.objects.all(), allow_null=True)
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = ItemGroup
        fields = '__all__'
        read_only_fields = ('slug', 'created_by', 'updated_by', 'created_at', 'updated_at')

class ItemSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    item_group = ItemGroupSerializer(read_only=True)
    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ('slug', 'average_rating', 'review_count', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def validate(self, data):
        if data.get('minimum_price', 0) > 0 and data.get('maximum_price', 0) > 0 and data.get('minimum_price') >= data.get('maximum_price'):
            raise serializers.ValidationError({'maximum_price': _('Maximum price must be greater than minimum price.')})
        sales_price = data.get('sales_price', 0)
        if sales_price > 0:
            if data.get('minimum_price', 0) > 0 and sales_price < data.get('minimum_price'):
                raise serializers.ValidationError({'sales_price': _('Sales price cannot be less than minimum price.')})
            if data.get('maximum_price', 0) > 0 and sales_price > data.get('maximum_price'):
                raise serializers.ValidationError({'sales_price': _('Sales price cannot be greater than maximum price.')})
        if data.get('reorder_level', 0) > 0 and data.get('maximum_stock', 0) > 0 and data.get('reorder_level') >= data.get('maximum_stock'):
            raise serializers.ValidationError({'maximum_stock': _('Maximum stock must be greater than reorder level.')})
        return data

class ItemUnitSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = ItemUnit
        fields = '__all__'
        read_only_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

class ItemBarcodeSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    unit = ItemUnitSerializer(read_only=True)

    class Meta:
        model = ItemBarcode
        fields = '__all__'
        read_only_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')


class InventoryBalanceSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    item = ItemSerializer(read_only=True)

    class Meta:
        model = InventoryBalance
        fields = '__all__'
        read_only_fields = ('last_movement_date', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def validate(self, data):
        item = data.get('item')
        if item.track_expiry and not data.get('expiry_date'):
            raise serializers.ValidationError({'expiry_date': _('Expiry date is required for items that track expiry.')})
        if item.track_batches and not data.get('batch_number'):
            raise serializers.ValidationError({'batch_number': _('Batch number is required for items that track batches.')})
        return data