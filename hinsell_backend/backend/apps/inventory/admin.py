from django.contrib import admin
from apps.hinsell.models import ItemReview
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

from django import forms
from django.contrib import admin
from apps.inventory.models import Item

class ItemAdminForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = '__all__'

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not name or not name.strip():
            raise forms.ValidationError("Name cannot be empty.")
        return name

    def clean_base_unit(self):
        base_unit = self.cleaned_data.get('base_unit')
        if not base_unit or not base_unit.strip():
            raise forms.ValidationError("Base unit cannot be empty.")
        return base_unit

    def clean_markup_percentage(self):
        markup = self.cleaned_data.get('markup_percentage')
        if markup is not None and (markup < 0 or markup > 1000):
            raise forms.ValidationError("Markup percentage must be between 0 and 1000.")
        return markup

    def clean_discount_percentage(self):
        discount = self.cleaned_data.get('discount_percentage')
        if discount is not None and (discount < 0 or discount > 100):
            raise forms.ValidationError("Discount percentage must be between 0 and 100.")
        return discount

    def clean_commission_percentage(self):
        commission = self.cleaned_data.get('commission_percentage')
        if commission is not None and (commission < 0 or commission > 100):
            raise forms.ValidationError("Commission percentage must be between 0 and 100.")
        return commission

    def clean_vat_percentage(self):
        vat = self.cleaned_data.get('vat_percentage')
        if vat is not None and (vat < 0 or vat > 100):
            raise forms.ValidationError("VAT percentage must be between 0 and 100.")
        return vat

class ItemAdmin(admin.ModelAdmin):
    form = ItemAdminForm
    list_display = ('name', 'item_group', 'item_type', 'average_rating', 'is_featured')
    search_fields = ('name', 'manufacturer', 'brand')
    list_filter = ('item_type', 'is_featured', 'visibility')
    readonly_fields = ('slug', 'average_rating', 'review_count')
    
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