from decimal import Decimal
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.organization.models import Branch
from apps.accounting.models import Account
from apps.organization.serializers import BranchSerializer
from apps.accounting.serializers import AccountSerializer
from apps.shared.serializers import MediaSerializer
from apps.inventory.models import StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance
from apps.core_apps.utils import generate_unique_slug


class StoreGroupSerializer(serializers.ModelSerializer):
    """Serializer for StoreGroup model."""
    branch = BranchSerializer(read_only=True)
    stock_account = AccountSerializer(read_only=True)
    sales_account = AccountSerializer(read_only=True)
    cost_of_sales_account = AccountSerializer(read_only=True)
    
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True
    )
    stock_account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),
        source='stock_account',
        write_only=True,
        allow_null=True
    )
    sales_account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),
        source='sales_account',
        write_only=True,
        allow_null=True
    )
    cost_of_sales_account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),
        source='cost_of_sales_account',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = StoreGroup
        fields = [
            'id', 'branch', 'branch_id', 'code', 'name', 'slug',
            'cost_method', 'stock_account', 'stock_account_id',
            'sales_account', 'sales_account_id', 'cost_of_sales_account',
            'cost_of_sales_account_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

class ItemGroupSerializer(serializers.ModelSerializer):
    """Serializer for ItemGroup model with hierarchical support."""
    branch = BranchSerializer(read_only=True)
    store_group = StoreGroupSerializer(read_only=True)
    parent = serializers.PrimaryKeyRelatedField(
        queryset=ItemGroup.objects.all(),
        allow_null=True,
        required=False
    )
    media = MediaSerializer(many=True, read_only=True)
    children = serializers.SerializerMethodField()
    
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True
    )
    store_group_id = serializers.PrimaryKeyRelatedField(
        queryset=StoreGroup.objects.all(),
        source='store_group',
        write_only=True
    )

    class Meta:
        model = ItemGroup
        fields = [
            'id', 'branch', 'branch_id', 'store_group', 'store_group_id',
            'code', 'name', 'slug', 'parent', 'group_type', 'media',
            'description', 'meta_title', 'meta_description', 'is_featured',
            'visibility', 'children', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_children(self, obj):
        """Recursively serialize child item groups."""
        children = ItemGroup.objects.filter(parent=obj)
        return ItemGroupSerializer(
            children,
            many=True,
            context=self.context
        ).data

    def to_representation(self, instance):
        """Include full_code and level in representation."""
        representation = super().to_representation(instance)
        representation['full_code'] = instance.get_full_code()
        representation['level'] = instance.get_level()
        return representation

class ItemUnitSerializer(serializers.ModelSerializer):
    """Serializer for ItemUnit model."""
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        source='item',
        write_only=True
    )

    class Meta:
        model = ItemUnit
        fields = [
            'id', 'item_id', 'code', 'name', 'conversion_factor',
            'unit_price', 'unit_cost', 'is_default', 'is_purchase_unit',
            'is_sales_unit', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ItemBarcodeSerializer(serializers.ModelSerializer):
    """Serializer for ItemBarcode model."""
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        source='item',
        write_only=True
    )
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=ItemUnit.objects.all(),
        source='unit',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = ItemBarcode
        fields = [
            'id', 'item_id', 'barcode', 'barcode_type', 'unit_id',
            'is_primary', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Validate barcode and unit-item relationship."""
        if not data.get('barcode', '').strip():
            raise serializers.ValidationError({'barcode': _('Barcode cannot be empty.')})
        unit = data.get('unit')
        item = data.get('item')
        if unit and unit.item != item:
            raise serializers.ValidationError(
                {'unit': _('Unit must belong to the same item.')}
            )
        return data

class InventoryBalanceSerializer(serializers.ModelSerializer):
    """Serializer for InventoryBalance model."""
    branch = BranchSerializer(read_only=True)
    item = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all()
    )
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True
    )

    class Meta:
        model = InventoryBalance
        fields = [
            'id', 'branch', 'branch_id', 'item', 'location', 'batch_number',
            'expiry_date', 'available_quantity', 'reserved_quantity',
            'average_cost', 'last_movement_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['last_movement_date', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate expiry and batch requirements."""
        item = data.get('item')
        if item:
            if item.track_expiry and not data.get('expiry_date'):
                raise serializers.ValidationError(
                    {'expiry_date': _('Expiry date is required for items that track expiry.')}
                )
            if item.track_batches and not data.get('batch_number'):
                raise serializers.ValidationError(
                    {'batch_number': _('Batch number is required for items that track batches.')}
                )
        return data

    def to_representation(self, instance):
        """Include total_quantity and expiry status."""
        representation = super().to_representation(instance)
        representation['total_quantity'] = instance.get_total_quantity()
        representation['is_expired'] = instance.is_expired()
        representation['is_near_expiry'] = instance.is_near_expiry()
        return representation

class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item model with nested relationships."""
    branch = BranchSerializer(read_only=True)
    item_group = ItemGroupSerializer(read_only=True)
    media = MediaSerializer(many=True, read_only=True)
    units = ItemUnitSerializer(many=True, read_only=True)
    barcodes = ItemBarcodeSerializer(many=True, read_only=True)
    
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True
    )
    item_group_id = serializers.PrimaryKeyRelatedField(
        queryset=ItemGroup.objects.all(),
        source='item_group',
        write_only=True
    )

    class Meta:
        model = Item
        fields = [
            'id', 'branch', 'branch_id', 'item_group', 'item_group_id',
            'code', 'name', 'slug', 'item_type', 'base_unit', 'shelf_location',
            'weight', 'volume', 'manufacturer', 'brand', 'size', 'color',
            'standard_cost', 'sales_price', 'wholesale_price', 'minimum_price',
            'maximum_price', 'media', 'meta_title', 'meta_description', 'tags',
            'average_rating', 'review_count', 'is_featured', 'visibility',
            'reorder_level', 'maximum_stock', 'minimum_order_quantity',
            'markup_percentage', 'discount_percentage', 'commission_percentage',
            'vat_percentage', 'handling_fee', 'is_service_item', 'track_expiry',
            'track_batches', 'allow_discount', 'allow_bonus', 'expiry_warning_days',
            'description', 'short_description', 'internal_notes', 'units', 'barcodes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'average_rating', 'review_count', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate name, base unit, and price constraints."""
        if not data.get('name', '').strip():
            raise serializers.ValidationError({'name': _('Name cannot be empty.')})
        if not data.get('base_unit', '').strip():
            raise serializers.ValidationError({'base_unit': _('Base unit cannot be empty.')})
        
        minimum_price = data.get('minimum_price', Decimal('0'))
        maximum_price = data.get('maximum_price', Decimal('0'))
        sales_price = data.get('sales_price', Decimal('0'))
        
        if minimum_price > 0 and maximum_price > 0 and minimum_price >= maximum_price:
            raise serializers.ValidationError(
                {'maximum_price': _('Maximum price must be greater than minimum price.')}
            )
        if sales_price > 0:
            if minimum_price > 0 and sales_price < minimum_price:
                raise serializers.ValidationError(
                    {'sales_price': _('Sales price cannot be less than minimum price.')}
                )
            if maximum_price > 0 and sales_price > maximum_price:
                raise serializers.ValidationError(
                    {'sales_price': _('Sales price cannot be greater than maximum price.')}
                )
        
        reorder_level = data.get('reorder_level', Decimal('0'))
        maximum_stock = data.get('maximum_stock', Decimal('0'))
        if reorder_level > 0 and maximum_stock > 0 and reorder_level >= maximum_stock:
            raise serializers.ValidationError(
                {'maximum_stock': _('Maximum stock must be greater than reorder level.')}
            )
        
        data['slug'] = generate_unique_slug(Item, data['name'], self.instance)
        return data

    def to_representation(self, instance):
        """Include calculated selling price and current stock."""
        representation = super().to_representation(instance)
        representation['selling_price'] = instance.calculate_selling_price()
        representation['current_stock'] = instance.get_current_stock()
        representation['is_low_stock'] = instance.is_low_stock()
        representation['display_name'] = instance.get_display_name()
        return representation