from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit, ItemBarcode, InventoryBalance,
    Attribute, AttributeValue, VariantAttributeValue
)

@admin.register(StoreGroup)
class StoreGroupAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'cost_method', 'created_by', 'created_at')
    list_filter = ('branch', 'cost_method')
    search_fields = ('code', 'name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('branch', 'code')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'code', 'name', 'slug', 'cost_method')
        }),
        (_('Accounting'), {
            'fields': ('stock_account', 'sales_account', 'cost_of_sales_account')
        }),
    )
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

@admin.register(ItemGroup)
class ItemGroupAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'store_group', 'parent', 'group_type', 'is_featured', 'visibility', 'created_at')
    list_filter = ('store_group', 'group_type', 'is_featured', 'visibility')
    search_fields = ('code', 'name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('store_group', 'code')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'store_group', 'code', 'name', 'slug', 'parent', 'group_type')
        }),
        (_('Content'), {
            'fields': ('description', 'media', 'meta_title', 'meta_description')
        }),
        (_('Display'), {
            'fields': ('is_featured', 'visibility')
        }),
    )
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('store_group', 'branch', 'parent')

class ItemVariantInline(admin.TabularInline):
    model = ItemVariant
    extra = 0
    fields = ('code', 'size', 'color', 'sales_price', 'standard_cost', 'reorder_level')
    readonly_fields = ('code', 'size', 'color', 'sales_price', 'standard_cost', 'reorder_level')

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'item_group', 'item_type', 'is_featured', 'visibility', 'created_at')
    list_filter = ('item_group', 'item_type', 'is_featured', 'visibility', 'is_service_item', 'track_expiry', 'track_batches')
    search_fields = ('name', 'slug', 'manufacturer', 'brand', 'tags')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('item_group', 'name')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'item_group', 'name', 'slug', 'item_type', 'base_unit')
        }),
        (_('Attributes'), {
            'fields': ('manufacturer', 'brand')
        }),
        (_('Pricing'), {
            'fields': ('markup_percentage', 'discount_percentage', 'commission_percentage', 'vat_percentage', 'handling_fee')
        }),
        (_('Inventory Controls'), {
            'fields': ('is_service_item', 'track_expiry', 'track_batches', 'allow_discount', 'allow_bonus', 'expiry_warning_days')
        }),
        (_('Content'), {
            'fields': ('short_description', 'description', 'media', 'meta_title', 'meta_description', 'tags', 'internal_notes')
        }),
        (_('Display & Ratings'), {
            'fields': ('average_rating', 'review_count', 'is_featured', 'visibility')
        }),
    )
    readonly_fields = ('average_rating', 'review_count', 'created_by', 'updated_by', 'created_at', 'updated_at')
    inlines = [ItemVariantInline]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('item_group__store_group', 'branch')

class VariantAttributeValueInline(admin.TabularInline):
    model = VariantAttributeValue
    extra = 1

@admin.register(ItemVariant)
class ItemVariantAdmin(admin.ModelAdmin):
    list_display = ('code', 'get_item_name', 'size', 'color', 'sales_price', 'standard_cost', 'reorder_level', 'created_at')
    list_filter = ('item__item_type', 'item__is_featured')
    search_fields = ('code', 'item__name', 'size', 'color')
    ordering = ('item', 'code')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('item', 'code', 'size', 'color', 'shelf_location')
        }),
        (_('Physical Attributes'), {
            'fields': ('weight', 'volume')
        }),
        (_('Pricing'), {
            'fields': ('standard_cost', 'sales_price', 'wholesale_price', 'minimum_price', 'maximum_price')
        }),
        (_('Inventory Controls'), {
            'fields': ('reorder_level', 'maximum_stock', 'minimum_order_quantity')
        }),
        (_('Extra'), {
            'fields': ('extra_attributes',)
        }),
    )
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')
    inlines = [VariantAttributeValueInline]

    def get_item_name(self, obj):
        return obj.item.name
    get_item_name.short_description = _('Item Name')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('item__item_group__store_group', 'item__branch')

@admin.register(ItemUnit)
class ItemUnitAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'variant', 'conversion_factor', 'unit_price', 'is_default', 'created_at')
    list_filter = ('is_default', 'is_purchase_unit', 'is_sales_unit')
    search_fields = ('code', 'name', 'variant__code', 'variant__item__name')
    ordering = ('variant', 'code')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('variant', 'code', 'name', 'conversion_factor')
        }),
        (_('Pricing'), {
            'fields': ('unit_price', 'unit_cost')
        }),
        (_('Flags'), {
            'fields': ('is_default', 'is_purchase_unit', 'is_sales_unit')
        }),
    )
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

@admin.register(ItemBarcode)
class ItemBarcodeAdmin(admin.ModelAdmin):
    list_display = ('barcode', 'barcode_type', 'variant', 'unit', 'is_primary', 'created_at')
    list_filter = ('barcode_type', 'is_primary')
    search_fields = ('barcode', 'variant__code', 'variant__item__name')
    ordering = ('variant', 'barcode')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('variant', 'barcode', 'barcode_type', 'unit', 'is_primary')
        }),
    )
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

@admin.register(InventoryBalance)
class InventoryBalanceAdmin(admin.ModelAdmin):
    list_display = ('variant', 'branch', 'location', 'batch_number', 'expiry_date', 'available_quantity', 'reserved_quantity', 'average_cost', 'last_movement_date')
    list_filter = ('branch',)
    search_fields = ('variant__code', 'variant__item__name', 'batch_number', 'location')
    ordering = ('-last_movement_date',)
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'variant', 'location', 'batch_number', 'expiry_date')
        }),
        (_('Quantities'), {
            'fields': ('available_quantity', 'reserved_quantity', 'average_cost')
        }),
    )
    readonly_fields = ('last_movement_date', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('variant__item__item_group__store_group', 'branch')

@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

@admin.register(AttributeValue)
class AttributeValueAdmin(admin.ModelAdmin):
    list_display = ('attribute', 'value', 'created_at')
    list_filter = ('attribute',)
    search_fields = ('value',)
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

@admin.register(VariantAttributeValue)
class VariantAttributeValueAdmin(admin.ModelAdmin):
    list_display = ('variant', 'attribute_value', 'created_at')
    list_filter = ('attribute_value__attribute',)
    search_fields = ('variant__code', 'attribute_value__value')
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')