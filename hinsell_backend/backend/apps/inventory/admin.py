"""
Django admin configuration for inventory app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from apps.inventory.models import StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance,DrugInformation,SampleDistribution


@admin.register(StoreGroup)
class StoreGroupAdmin(admin.ModelAdmin):
    """Admin interface for StoreGroup model."""
    
    list_display = [
        'store_group_code', 'store_group_name', 'branch', 'cost_method',
        'item_groups_count', 'is_active', 'created_at'
    ]
    list_filter = ['branch', 'cost_method', 'is_active', 'created_at']
    search_fields = ['store_group_code', 'store_group_name', 'branch__branch_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('branch', 'store_group_code', 'store_group_name', 'cost_method')
        }),
        ('Default Accounts', {
            'fields': ('stock_account', 'sales_account', 'cost_of_sales_account')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def item_groups_count(self, obj):
        """Display number of item groups."""
        count = obj.item_groups.filter(is_active=True).count()
        if count > 0:
            url = reverse('admin:inventory_itemgroup_changelist') + f'?store_group__id__exact={obj.id}'
            return format_html('<a href="{}">{} groups</a>', url, count)
        return '0 groups'
    item_groups_count.short_description = 'Item Groups'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ItemGroup)
class ItemGroupAdmin(admin.ModelAdmin):
    """Admin interface for ItemGroup model."""
    
    list_display = [
        'item_group_code', 'item_group_name', 'store_group', 'parent',
        'group_type', 'items_count', 'is_active'
    ]
    list_filter = ['store_group', 'group_type', 'is_active', 'created_at']
    search_fields = ['item_group_code', 'item_group_name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('branch', 'store_group', 'item_group_code', 'item_group_name', 'parent')
        }),
        ('Settings', {
            'fields': ('group_type', 'default_account', 'image')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def items_count(self, obj):
        """Display number of items."""
        count = obj.items.filter(is_active=True).count()
        if count > 0:
            url = reverse('admin:inventory_item_changelist') + f'?item_group__id__exact={obj.id}'
            return format_html('<a href="{}">{} items</a>', url, count)
        return '0 items'
    items_count.short_description = 'Items'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


class ItemUnitInline(admin.TabularInline):
    """Inline admin for ItemUnit."""
    model = ItemUnit
    extra = 1
    fields = ['unit_code', 'unit_name', 'conversion_factor', 'unit_price', 'unit_cost', 'is_default', 'is_active']


class ItemBarcodeInline(admin.TabularInline):
    """Inline admin for ItemBarcode."""
    model = ItemBarcode
    extra = 1
    fields = ['barcode', 'barcode_type', 'unit', 'is_primary', 'is_active']


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    """Admin interface for Item model."""
    
    list_display = [
        'item_code', 'item_name', 'item_group', 'manufacturer', 'brand',
        'sales_price', 'current_stock_display', 'is_low_stock', 'is_active'
    ]
    list_filter = [
        'item_group', 'item_type', 'manufacturer', 'brand', 'is_service_item',
        'track_expiry', 'track_batches', 'is_prescription_required',
        'is_controlled_substance', 'is_active'
    ]
    search_fields = [
        'item_code', 'item_name', 'item_name_english', 'scientific_name',
        'active_ingredient', 'manufacturer', 'brand'
    ]
    readonly_fields = [
        'id', 'current_stock_display', 'is_low_stock', 'calculated_selling_price',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    inlines = [ItemUnitInline, ItemBarcodeInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'branch', 'item_group', 'item_code', 'item_name', 'item_name_english',
                'item_type', 'base_unit', 'shelf_location', 'attributes'
            )
        }),
        ('Physical Attributes', {
            'fields': ('weight', 'volume', 'manufacturer', 'brand', 'model_number'),
            'classes': ('collapse',)
        }),
        ('Pharmaceutical Information', {
            'fields': (
                'scientific_name', 'active_ingredient', 'strength', 'dosage_form',
                'route_of_administration'
            ),
            'classes': ('collapse',)
        }),
        ('Medical Information', {
            'fields': (
                'indications', 'contraindications', 'side_effects', 'precautions',
                'drug_interactions', 'storage_conditions'
            ),
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': (
                'standard_cost', 'last_purchase_cost', 'sales_price', 'wholesale_price',
                'minimum_price', 'maximum_price', 'calculated_selling_price'
            )
        }),
        ('Inventory Control', {
            'fields': (
                'reorder_level', 'maximum_stock', 'minimum_order_quantity',
                'current_stock_display', 'is_low_stock'
            )
        }),
        ('Percentages and Fees', {
            'fields': (
                'markup_percentage', 'discount_percentage', 'commission_percentage',
                'vat_percentage', 'handling_fee'
            ),
            'classes': ('collapse',)
        }),
        ('Control Flags', {
            'fields': (
                'is_service_item', 'track_expiry', 'track_batches', 'allow_discount',
                'allow_bonus', 'is_prescription_required', 'is_controlled_substance',
                'expiry_warning_days'
            )
        }),
        ('Images and Notes', {
            'fields': ('primary_image', 'description', 'internal_notes'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def current_stock_display(self, obj):
        """Display current stock with unit."""
        stock = obj.get_current_stock()
        return f"{stock} {obj.base_unit}"
    current_stock_display.short_description = 'Current Stock'
    
    def calculated_selling_price(self, obj):
        """Display calculated selling price."""
        price = obj.calculate_selling_price()
        return f"{price:.4f}"
    calculated_selling_price.short_description = 'Calculated Price'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ItemUnit)
class ItemUnitAdmin(admin.ModelAdmin):
    """Admin interface for ItemUnit model."""
    
    list_display = [
        'item', 'unit_code', 'unit_name', 'conversion_factor',
        'unit_price', 'is_default', 'is_purchase_unit', 'is_sales_unit', 'is_active'
    ]
    list_filter = ['is_default', 'is_purchase_unit', 'is_sales_unit', 'is_active']
    search_fields = ['item__item_code', 'item__item_name', 'unit_code', 'unit_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ItemBarcode)
class ItemBarcodeAdmin(admin.ModelAdmin):
    """Admin interface for ItemBarcode model."""
    
    list_display = [
        'item', 'barcode', 'barcode_type', 'unit', 'is_primary', 'is_active'
    ]
    list_filter = ['barcode_type', 'is_primary', 'is_active']
    search_fields = ['item__item_code', 'item__item_name', 'barcode']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(InventoryBalance)
class InventoryBalanceAdmin(admin.ModelAdmin):
    """Admin interface for InventoryBalance model."""
    
    list_display = [
        'item', 'location', 'batch_number', 'expiry_date',
        'available_quantity', 'reserved_quantity', 'average_cost',
        'expiry_status', 'last_movement_date'
    ]
    list_filter = [
        'branch', 'location', 'expiry_date', 'last_movement_date', 'is_active'
    ]
    search_fields = [
        'item__item_code', 'item__item_name', 'batch_number', 'location'
    ]
    readonly_fields = [
        'id', 'last_movement_date', 'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    
    def expiry_status(self, obj):
        """Display expiry status with color coding."""
        if obj.is_expired():
            return format_html('<span style="color: red; font-weight: bold;">EXPIRED</span>')
        elif obj.is_near_expiry():
            return format_html('<span style="color: orange; font-weight: bold;">NEAR EXPIRY</span>')
        elif obj.expiry_date:
            return format_html('<span style="color: green;">OK</span>')
        return 'N/A'
    expiry_status.short_description = 'Expiry Status'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(DrugInformation)
class DrugInformationAdmin(admin.ModelAdmin):
    """Admin interface for DrugInformation model."""
    list_display = [
        'item', 'drug_class', 'therapeutic_category', 'pregnancy_category',
        'controlled_substance_schedule', 'generic_available', 'refrigeration_required',
        'narcotic', 'is_active'
    ]   
    list_filter = ['drug_class', 'therapeutic_category', 'pregnancy_category', 'controlled_substance_schedule', 'is_active']
    search_fields = ['item__item_code', 'item__item_name', 'drug_class', 'therapeutic_category', 'pregnancy_category']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(SampleDistribution)
class SampleDistributionAdmin(admin.ModelAdmin):
    """Admin interface for SampleDistribution model."""
    
    list_display = ['visit', 'item', 'quantity', 'unit', 'is_active']
    list_filter = ['quantity', 'is_active']
    search_fields = [ 'item__item_code', 'item__item_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
