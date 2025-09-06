from django.contrib import admin
from apps.hinsell.models import ItemReview
from django.core.exceptions import ValidationError
from apps.inventory.models import (
    StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit, ItemBarcode,
    InventoryBalance
)

class StoreGroupAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'cost_method')
    search_fields = ('code', 'name')
    list_filter = ('cost_method', 'branch')
    readonly_fields = ('slug',)

class ItemGroupAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'store_group', 'group_type', 'is_featured')
    search_fields = ('code', 'name')
    list_filter = ('group_type', 'is_featured', 'visibility')
    readonly_fields = ('slug',)

class ItemAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'code']
    search_fields = ['item_name', 'code']
    list_filter = ['item_name']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
            super().save_model(request, obj, form, change)
        except ValidationError as e:
            self.message_user(request, f"Validation error: {e}", level='error')

class ItemVariantAdmin(admin.ModelAdmin):
    list_display = ('code', 'item', 'sales_price', 'standard_cost')
    search_fields = ('code',)
    list_filter = ('item__item_type',)

class ItemUnitAdmin(admin.ModelAdmin):
    list_display = ('code', 'variant', 'name', 'is_default')
    search_fields = ('code', 'name')
    list_filter = ('is_default', 'is_purchase_unit', 'is_sales_unit')

class ItemBarcodeAdmin(admin.ModelAdmin):
    list_display = ('barcode', 'variant', 'barcode_type', 'is_primary')
    search_fields = ('barcode',)
    list_filter = ('barcode_type', 'is_primary')

class ItemReviewAdmin(admin.ModelAdmin):
    list_display = ('item', 'user', 'rating', 'created_at')
    search_fields = ('item__name', 'user__username')
    list_filter = ('rating', 'is_verified_purchase')

class InventoryBalanceAdmin(admin.ModelAdmin):
    list_display = ('variant', 'available_quantity', 'batch_number', 'expiry_date')
    search_fields = ('variant__code', 'batch_number')
    list_filter = ('expiry_date',)
    readonly_fields = ('last_movement_date',)


admin.site.register(StoreGroup, StoreGroupAdmin)
admin.site.register(ItemGroup, ItemGroupAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(ItemVariant, ItemVariantAdmin)
admin.site.register(ItemUnit, ItemUnitAdmin)
admin.site.register(ItemBarcode, ItemBarcodeAdmin)
admin.site.register(ItemReview, ItemReviewAdmin)
admin.site.register(InventoryBalance, InventoryBalanceAdmin)