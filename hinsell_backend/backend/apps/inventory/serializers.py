from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.inventory.models import Media, StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit, ItemBarcode, InventoryBalance
from apps.organization.models import Branch
from apps.accounting.models import Account

class MediaSerializer(serializers.ModelSerializer):
    """Serializer for Media model."""
    file = serializers.FileField()

    class Meta:
        model = Media
        fields = ['id', 'file', 'alt_text', 'display_order', 'media_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'media_type', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('file'):
            raise ValidationError(_('Media file is required.'))
        return data

class StoreGroupSerializer(serializers.ModelSerializer):
    """Serializer for StoreGroup model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    stock_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)
    sales_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)
    cost_of_sales_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)

    class Meta:
        model = StoreGroup
        fields = [
            'id', 'branch', 'code', 'name', 'slug', 'cost_method',
            'stock_account', 'sales_account', 'cost_of_sales_account',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'slug', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('name').strip():
            raise ValidationError(_('Name cannot be empty.'))
        return data

class ItemGroupSerializer(serializers.ModelSerializer):
    """Serializer for ItemGroup model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    store_group = serializers.PrimaryKeyRelatedField(queryset=StoreGroup.objects.all())
    parent = serializers.PrimaryKeyRelatedField(queryset=ItemGroup.objects.all(), allow_null=True)
    media = serializers.PrimaryKeyRelatedField(many=True, queryset=Media.objects.all(), required=False)

    class Meta:
        model = ItemGroup
        fields = [
            'id', 'branch', 'store_group', 'code', 'name', 'slug', 'parent',
            'group_type', 'media', 'description', 'meta_title', 'meta_description',
            'is_featured', 'visibility', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'slug', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('name').strip():
            raise ValidationError(_('Name cannot be empty.'))
        if data.get('parent') and data.get('store_group') != data.get('parent').store_group:
            raise ValidationError(_('Parent group must belong to the same store group.'))
        return data

class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    item_group = serializers.PrimaryKeyRelatedField(queryset=ItemGroup.objects.all())
    media = serializers.PrimaryKeyRelatedField(many=True, queryset=Media.objects.all(), required=False)

    class Meta:
        model = Item
        fields = [
            'id', 'branch', 'item_group', 'code', 'name', 'slug', 'item_type',
            'base_unit', 'shelf_location', 'weight', 'volume', 'manufacturer',
            'brand', 'scientific_name', 'active_ingredient', 'strength',
            'dosage_form', 'route_of_administration', 'indications',
            'contraindications', 'side_effects', 'precautions', 'drug_interactions',
            'storage_conditions', 'standard_cost', 'sales_price', 'wholesale_price',
            'minimum_price', 'maximum_price', 'media', 'meta_title',
            'meta_description', 'tags', 'average_rating', 'review_count',
            'is_featured', 'visibility', 'reorder_level', 'maximum_stock',
            'minimum_order_quantity', 'markup_percentage', 'discount_percentage',
            'commission_percentage', 'vat_percentage', 'handling_fee',
            'is_service_item', 'track_expiry', 'track_batches', 'allow_discount',
            'allow_bonus', 'is_prescription_required', 'is_controlled_substance',
            'expiry_warning_days', 'description', 'short_description',
            'internal_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'slug', 'average_rating', 'review_count', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('name').strip():
            raise ValidationError(_('Name cannot be empty.'))
        if not data.get('base_unit').strip():
            raise ValidationError(_('Base unit cannot be empty.'))
        if data.get('minimum_price', 0) > 0 and data.get('maximum_price', 0) > 0 and data.get('minimum_price') >= data.get('maximum_price'):
            raise ValidationError(_('Maximum price must be greater than minimum price.'))
        if data.get('is_prescription_required') and data.get('visibility') != 'prescription':
            raise ValidationError(_('Prescription-required items must have prescription visibility.'))
        return data

class ItemVariantSerializer(serializers.ModelSerializer):
    """Serializer for ItemVariant model."""
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())
    media = serializers.PrimaryKeyRelatedField(many=True, queryset=Media.objects.all(), required=False)

    class Meta:
        model = ItemVariant
        fields = [
            'id', 'item', 'code', 'size', 'color', 'standard_cost', 'sales_price',
            'media', 'reorder_level', 'maximum_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data):
        if not (data.get('size').strip() or data.get('color').strip()):
            raise ValidationError(_('At least one of size or color must be specified.'))
        return data

class ItemUnitSerializer(serializers.ModelSerializer):
    """Serializer for ItemUnit model."""
    item = serializers.PrimaryKeyRelatedField(queryset=ItemVariant.objects.all())

    class Meta:
        model = ItemUnit
        fields = [
            'id', 'item', 'code', 'name', 'conversion_factor', 'unit_price',
            'unit_cost', 'is_default', 'is_purchase_unit', 'is_sales_unit',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('name').strip():
            raise ValidationError(_('Name cannot be empty.'))
        return data

class ItemBarcodeSerializer(serializers.ModelSerializer):
    """Serializer for ItemBarcode model."""
    item = serializers.PrimaryKeyRelatedField(queryset=ItemVariant.objects.all())
    unit = serializers.PrimaryKeyRelatedField(queryset=ItemUnit.objects.all(), allow_null=True)

    class Meta:
        model = ItemBarcode
        fields = [
            'id', 'item', 'barcode', 'barcode_type', 'unit', 'is_primary',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'barcode', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('unit') and data.get('unit').item != data.get('item'):
            raise ValidationError(_('Unit must belong to the same item variant.'))
        return data

class InventoryBalanceSerializer(serializers.ModelSerializer):
    """Serializer for InventoryBalance model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    item = serializers.PrimaryKeyRelatedField(queryset=ItemVariant.objects.all())

    class Meta:
        model = InventoryBalance
        fields = [
            'id', 'branch', 'item', 'location', 'batch_number', 'expiry_date',
            'available_quantity', 'reserved_quantity', 'average_cost',
            'last_movement_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_movement_date', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('item').item.track_expiry and not data.get('expiry_date'):
            raise ValidationError(_('Expiry date is required for items that track expiry.'))
        if data.get('item').item.track_batches and not data.get('batch_number'):
            raise ValidationError(_('Batch number is required for items that track batches.'))
        return data