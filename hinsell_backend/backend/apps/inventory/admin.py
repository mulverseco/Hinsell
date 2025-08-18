from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance
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

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'item_group', 'item_type', 'sales_price', 'standard_cost', 'is_featured', 'visibility', 'created_at')
    list_filter = ('item_group', 'item_type', 'is_featured', 'visibility', 'is_service_item', 'track_expiry', 'track_batches')
    search_fields = ('code', 'name', 'slug', 'manufacturer', 'brand', 'tags')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('item_group', 'code')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'item_group', 'code', 'name', 'slug', 'item_type', 'base_unit')
        }),
        (_('Attributes'), {
            'fields': ('shelf_location', 'weight', 'volume', 'manufacturer', 'brand', 'size', 'color')
        }),
        (_('Pricing'), {
            'fields': ('standard_cost', 'sales_price', 'wholesale_price', 'minimum_price', 'maximum_price',
                       'markup_percentage', 'discount_percentage', 'commission_percentage', 'vat_percentage', 'handling_fee')
        }),
        (_('Inventory Controls'), {
            'fields': ('reorder_level', 'maximum_stock', 'minimum_order_quantity',
                       'is_service_item', 'track_expiry', 'track_batches', 'allow_discount', 'allow_bonus', 'expiry_warning_days')
        }),
        (_('Content'), {
            'fields': ('short_description', 'description', 'media', 'meta_title', 'meta_description', 'tags', 'internal_notes')
        }),
        (_('Display & Ratings'), {
            'fields': ('average_rating', 'review_count', 'is_featured', 'visibility')
        }),
    )
    readonly_fields = ('average_rating', 'review_count', 'created_by', 'updated_by', 'created_at', 'updated_at')
    inlines = []  # Can add inlines for units, barcodes if needed

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('item_group__store_group', 'branch')

@admin.register(ItemUnit)
class ItemUnitAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'item', 'conversion_factor', 'unit_price', 'is_default', 'created_at')
    list_filter = ('is_default', 'is_purchase_unit', 'is_sales_unit')
    search_fields = ('code', 'name', 'item__code', 'item__name')
    ordering = ('item', 'code')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('item', 'code', 'name', 'conversion_factor')
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
    list_display = ('barcode', 'barcode_type', 'item', 'unit', 'is_primary', 'created_at')
    list_filter = ('barcode_type', 'is_primary')
    search_fields = ('barcode', 'item__code', 'item__name')
    ordering = ('item', 'barcode')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('item', 'barcode', 'barcode_type', 'unit', 'is_primary')
        }),
    )
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

@admin.register(InventoryBalance)
class InventoryBalanceAdmin(admin.ModelAdmin):
    list_display = ('item', 'branch', 'location', 'batch_number', 'expiry_date', 'available_quantity', 'reserved_quantity', 'average_cost', 'last_movement_date')
    list_filter = ('branch',)
    search_fields = ('item__code', 'item__name', 'batch_number', 'location')
    ordering = ('-last_movement_date',)
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'item', 'location', 'batch_number', 'expiry_date')
        }),
        (_('Quantities'), {
            'fields': ('available_quantity', 'reserved_quantity', 'average_cost')
        }),
    )
    readonly_fields = ('last_movement_date', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('item__item_group__store_group', 'branch')