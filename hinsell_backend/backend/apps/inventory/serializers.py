"""
Serializers for inventory app.
"""
from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from apps.inventory.models import StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance,DrugInformation,SampleDistribution


class StoreGroupSerializer(serializers.ModelSerializer):
    """Serializer for StoreGroup model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    stock_account_name = serializers.CharField(source='stock_account.account_name', read_only=True)
    sales_account_name = serializers.CharField(source='sales_account.account_name', read_only=True)
    cost_account_name = serializers.CharField(source='cost_of_sales_account.account_name', read_only=True)
    item_groups_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StoreGroup
        fields = [
            'id', 'branch', 'branch_name', 'store_group_code', 'store_group_name',
            'cost_method', 'stock_account', 'stock_account_name', 'sales_account',
            'sales_account_name', 'cost_of_sales_account', 'cost_account_name',
            'item_groups_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_name', 'item_groups_count']
    
    def get_item_groups_count(self, obj):
        """Get number of item groups in this store group."""
        return obj.item_groups.filter(is_active=True).count()
    
    def validate_store_group_code(self, value):
        """Validate store group code."""
        if not value or not value.strip():
            raise serializers.ValidationError("Store group code cannot be empty.")
        return value.strip().upper()


class ItemGroupSerializer(serializers.ModelSerializer):
    """Serializer for ItemGroup model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    store_group_name = serializers.CharField(source='store_group.store_group_name', read_only=True)
    parent_name = serializers.CharField(source='parent.item_group_name', read_only=True)
    default_account_name = serializers.CharField(source='default_account.account_name', read_only=True)
    full_code = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemGroup
        fields = [
            'id', 'branch', 'branch_name', 'store_group', 'store_group_name',
            'item_group_code', 'item_group_name', 'parent', 'parent_name',
            'group_type', 'default_account', 'default_account_name', 'image',
            'description', 'full_code', 'level', 'items_count',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'branch_name', 'store_group_name',
            'parent_name', 'default_account_name', 'full_code', 'level', 'items_count'
        ]
    
    def get_full_code(self, obj):
        """Get full hierarchical code."""
        return obj.get_full_code()
    
    def get_level(self, obj):
        """Get hierarchy level."""
        return obj.get_level()
    
    def get_items_count(self, obj):
        """Get number of items in this group."""
        return obj.items.filter(is_active=True).count()
    
    def validate_item_group_code(self, value):
        """Validate item group code."""
        if not value or not value.strip():
            raise serializers.ValidationError("Item group code cannot be empty.")
        return value.strip().upper()


class ItemUnitSerializer(serializers.ModelSerializer):
    """Serializer for ItemUnit model."""
    
    item_code = serializers.CharField(source='item.item_code', read_only=True)
    base_unit_equivalent = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemUnit
        fields = [
            'id', 'item', 'item_code', 'unit_code', 'unit_name',
            'conversion_factor', 'unit_price', 'unit_cost', 'is_default',
            'is_purchase_unit', 'is_sales_unit', 'base_unit_equivalent',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'item_code', 'base_unit_equivalent']
    
    def get_base_unit_equivalent(self, obj):
        """Get description of base unit equivalent."""
        return f"1 {obj.unit_code} = {obj.conversion_factor} {obj.item.base_unit}"
    
    def validate_unit_code(self, value):
        """Validate unit code."""
        if not value or not value.strip():
            raise serializers.ValidationError("Unit code cannot be empty.")
        return value.strip().upper()


class ItemBarcodeSerializer(serializers.ModelSerializer):
    """Serializer for ItemBarcode model."""
    
    item_code = serializers.CharField(source='item.item_code', read_only=True)
    unit_code = serializers.CharField(source='unit.unit_code', read_only=True)
    
    class Meta:
        model = ItemBarcode
        fields = [
            'id', 'item', 'item_code', 'barcode', 'barcode_type',
            'unit', 'unit_code', 'is_primary',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'item_code', 'unit_code']
    
    def validate_barcode(self, value):
        """Validate barcode."""
        if not value or not value.strip():
            raise serializers.ValidationError("Barcode cannot be empty.")
        return value.strip()


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    item_group_name = serializers.CharField(source='item_group.item_group_name', read_only=True)
    store_group_name = serializers.CharField(source='item_group.store_group.store_group_name', read_only=True)
    display_name = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    calculated_selling_price = serializers.SerializerMethodField()
    units = ItemUnitSerializer(many=True, read_only=True)
    barcodes = ItemBarcodeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'branch', 'branch_name', 'item_group', 'item_group_name',
            'store_group_name', 'item_code', 'item_name', 'item_name_english',
            'item_type', 'base_unit', 'shelf_location', 'attributes', 'weight',
            'volume', 'manufacturer', 'brand', 'model_number', 'scientific_name',
            'active_ingredient', 'strength', 'dosage_form', 'route_of_administration',
            'indications', 'contraindications', 'side_effects', 'precautions',
            'drug_interactions', 'storage_conditions', 'standard_cost',
            'last_purchase_cost', 'sales_price', 'wholesale_price', 'minimum_price',
            'maximum_price', 'reorder_level', 'maximum_stock', 'minimum_order_quantity',
            'markup_percentage', 'discount_percentage', 'commission_percentage',
            'vat_percentage', 'handling_fee', 'is_service_item', 'track_expiry',
            'track_batches', 'allow_discount', 'allow_bonus', 'is_prescription_required',
            'is_controlled_substance', 'expiry_warning_days', 'primary_image',
            'description', 'internal_notes', 'display_name', 'current_stock',
            'is_low_stock', 'calculated_selling_price', 'units', 'barcodes',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'branch_name', 'item_group_name',
            'store_group_name', 'display_name', 'current_stock', 'is_low_stock',
            'calculated_selling_price', 'units', 'barcodes'
        ]
    
    def get_display_name(self, obj):
        """Get display name with scientific name."""
        return obj.get_display_name()
    
    def get_current_stock(self, obj):
        """Get current stock quantity."""
        return str(obj.get_current_stock())
    
    def get_is_low_stock(self, obj):
        """Check if item is low stock."""
        return obj.is_low_stock()
    
    def get_calculated_selling_price(self, obj):
        """Get calculated selling price."""
        return str(obj.calculate_selling_price())
    
    def validate_item_code(self, value):
        """Validate item code."""
        if not value or not value.strip():
            raise serializers.ValidationError("Item code cannot be empty.")
        return value.strip().upper()
    
    def validate(self, data):
        """Custom validation for item."""
        # Validate price relationships
        minimum_price = data.get('minimum_price', Decimal('0'))
        maximum_price = data.get('maximum_price', Decimal('0'))
        sales_price = data.get('sales_price', Decimal('0'))
        
        if minimum_price > 0 and maximum_price > 0 and minimum_price >= maximum_price:
            raise serializers.ValidationError({
                'maximum_price': 'Maximum price must be greater than minimum price.'
            })
        
        if sales_price > 0:
            if minimum_price > 0 and sales_price < minimum_price:
                raise serializers.ValidationError({
                    'sales_price': 'Sales price cannot be less than minimum price.'
                })
            
            if maximum_price > 0 and sales_price > maximum_price:
                raise serializers.ValidationError({
                    'sales_price': 'Sales price cannot be greater than maximum price.'
                })
        
        return data


class InventoryBalanceSerializer(serializers.ModelSerializer):
    """Serializer for InventoryBalance model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    item_code = serializers.CharField(source='item.item_code', read_only=True)
    item_name = serializers.CharField(source='item.item_name', read_only=True)
    base_unit = serializers.CharField(source='item.base_unit', read_only=True)
    total_quantity = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    is_near_expiry = serializers.SerializerMethodField()
    days_to_expiry = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryBalance
        fields = [
            'id', 'branch', 'branch_name', 'item', 'item_code', 'item_name',
            'base_unit', 'location', 'batch_number', 'expiry_date',
            'available_quantity', 'reserved_quantity', 'total_quantity',
            'average_cost', 'total_value', 'is_expired', 'is_near_expiry',
            'days_to_expiry', 'last_movement_date',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'branch_name', 'item_code',
            'item_name', 'base_unit', 'total_quantity', 'is_expired',
            'is_near_expiry', 'days_to_expiry', 'total_value', 'last_movement_date'
        ]
    
    def get_total_quantity(self, obj):
        """Get total quantity."""
        return str(obj.get_total_quantity())
    
    def get_is_expired(self, obj):
        """Check if expired."""
        return obj.is_expired()
    
    def get_is_near_expiry(self, obj):
        """Check if near expiry."""
        return obj.is_near_expiry()
    
    def get_days_to_expiry(self, obj):
        """Get days to expiry."""
        if obj.expiry_date:
            delta = obj.expiry_date - timezone.now().date()
            return delta.days
        return None
    
    def get_total_value(self, obj):
        """Get total inventory value."""
        total_qty = obj.get_total_quantity()
        return str(total_qty * obj.average_cost)

class DrugInformationSerializer(serializers.ModelSerializer):
    """Serializer for DrugInformation model."""
    
    item_code = serializers.CharField(source='item.item_code', read_only=True)
    item_name = serializers.CharField(source='item.item_name', read_only=True)
    
    class Meta:
        model = DrugInformation
        fields = [
            'id', 'item', 'item_code', 'item_name', 'drug_class',
            'therapeutic_category', 'pregnancy_category' , 'controlled_substance_schedule',
            'generic_available', 'refrigeration_required' , 'narcotic',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'item_code', 'item_name']
    
    def validate_item(self, value):
        """Ensure item is not already linked to another drug information."""
        if DrugInformation.objects.filter(item=value).exists():
            raise serializers.ValidationError("This item is already linked to a drug information.")
        return value
    
class SampleDistributionSerializer(serializers.ModelSerializer):
    """Serializer for SampleDistribution model."""
    
    item_code = serializers.CharField(source='item.item_code', read_only=True)
    item_name = serializers.CharField(source='item.item_name', read_only=True)
    
    class Meta:
        model = SampleDistribution
        fields = [
            'id', 'item', 'item_code', 'item_name', 'quantity',
            'unit', 'visit',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'item_code', 'item_name']
    
    def validate_quantity(self, value):
        """Ensure quantity is positive."""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

class ItemStockSummarySerializer(serializers.Serializer):
    """Serializer for item stock summary."""
    
    item_id = serializers.UUIDField()
    item_code = serializers.CharField()
    item_name = serializers.CharField()
    base_unit = serializers.CharField()
    total_available = serializers.DecimalField(max_digits=18, decimal_places=8)
    total_reserved = serializers.DecimalField(max_digits=18, decimal_places=8)
    total_quantity = serializers.DecimalField(max_digits=18, decimal_places=8)
    average_cost = serializers.DecimalField(max_digits=15, decimal_places=4)
    total_value = serializers.DecimalField(max_digits=20, decimal_places=4)
    reorder_level = serializers.DecimalField(max_digits=15, decimal_places=4)
    is_low_stock = serializers.BooleanField()
    locations_count = serializers.IntegerField()
    batches_count = serializers.IntegerField()
    expired_quantity = serializers.DecimalField(max_digits=18, decimal_places=8)
    near_expiry_quantity = serializers.DecimalField(max_digits=18, decimal_places=8)


class ItemPricingSerializer(serializers.Serializer):
    """Serializer for item pricing information."""
    
    item_id = serializers.UUIDField()
    item_code = serializers.CharField()
    item_name = serializers.CharField()
    standard_cost = serializers.DecimalField(max_digits=15, decimal_places=4)
    last_purchase_cost = serializers.DecimalField(max_digits=15, decimal_places=4)
    sales_price = serializers.DecimalField(max_digits=15, decimal_places=4)
    wholesale_price = serializers.DecimalField(max_digits=15, decimal_places=4)
    minimum_price = serializers.DecimalField(max_digits=15, decimal_places=4)
    maximum_price = serializers.DecimalField(max_digits=15, decimal_places=4)
    calculated_selling_price = serializers.DecimalField(max_digits=15, decimal_places=4)
    markup_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    discount_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    commission_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    vat_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    handling_fee = serializers.DecimalField(max_digits=15, decimal_places=4)
    unit_prices = serializers.ListField(child=serializers.DictField())
