from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from apps.inventory.models import StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit, ItemBarcode, InventoryBalance


@admin.register(StoreGroup)
class StoreGroupAdmin(admin.ModelAdmin):
    """
    Admin configuration for the StoreGroup model.
    """
    list_display = (
        'code',
        'name',
        'branch',
        'cost_method',
        'created_at',
        'is_active',
    )
    list_filter = (
        'branch',
        'cost_method',
        'is_active',
        'created_at',
    )
    search_fields = ('code', 'name', 'slug')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'slug',
    )
    fieldsets = (
        (_('Store Group Information'), {
            'fields': ('branch', 'code', 'name', 'slug', 'cost_method')
        }),
        (_('Accounting'), {
            'fields': ('stock_account', 'sales_account', 'cost_of_sales_account')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all store groups, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log store group creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'store_group_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(ItemGroup)
class ItemGroupAdmin(admin.ModelAdmin):
    """
    Admin configuration for the ItemGroup model.
    """
    list_display = (
        'code',
        'name',
        'branch',
        'store_group',
        'group_type',
        'is_featured',
        'visibility',
        'created_at',
    )
    list_filter = (
        'branch',
        'store_group',
        'group_type',
        'is_featured',
        'visibility',
        'created_at',
    )
    search_fields = ('code', 'name', 'slug', 'description')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'slug',
    )
    fieldsets = (
        (_('Item Group Information'), {
            'fields': ('branch', 'store_group', 'code', 'name', 'slug', 'parent', 'group_type')
        }),
        (_('Content'), {
            'fields': ('description', 'meta_title', 'meta_description', 'media')
        }),
        (_('Display Options'), {
            'fields': ('is_featured', 'visibility')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all item groups, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log item group creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'item_group_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Item model.
    """
    list_display = (
        'code',
        'name',
        'branch',
        'item_group',
        'item_type',
        'sales_price',
        'is_featured',
        'visibility',
        'created_at',
    )
    list_filter = (
        'branch',
        'item_group',
        'item_type',
        'is_featured',
        'visibility',
        'is_prescription_required',
        'is_controlled_substance',
        'created_at',
    )
    search_fields = (
        'code',
        'name',
        'slug',
        'manufacturer',
        'brand',
        'scientific_name',
        'active_ingredient',
    )
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'slug',
        'average_rating',
        'review_count',
    )
    fieldsets = (
        (_('Item Information'), {
            'fields': (
                'branch',
                'item_group',
                'code',
                'name',
                'slug',
                'item_type',
                'base_unit',
                'shelf_location',
            )
        }),
        (_('Pharmaceutical Details'), {
            'fields': (
                'manufacturer',
                'brand',
                'scientific_name',
                'active_ingredient',
                'strength',
                'dosage_form',
                'route_of_administration',
                'indications',
                'contraindications',
                'side_effects',
                'precautions',
                'drug_interactions',
                'storage_conditions',
                'is_prescription_required',
                'is_controlled_substance',
            )
        }),
        (_('Pricing'), {
            'fields': (
                'standard_cost',
                'sales_price',
                'wholesale_price',
                'minimum_price',
                'maximum_price',
                'markup_percentage',
                'discount_percentage',
                'commission_percentage',
                'vat_percentage',
                'handling_fee',
            )
        }),
        (_('Inventory'), {
            'fields': (
                'reorder_level',
                'maximum_stock',
                'minimum_order_quantity',
                'weight',
                'volume',
                'track_expiry',
                'track_batches',
                'allow_discount',
                'allow_bonus',
                'expiry_warning_days',
            )
        }),
        (_('Content'), {
            'fields': (
                'description',
                'short_description',
                'meta_title',
                'meta_description',
                'tags',
                'media',
                'average_rating',
                'review_count',
            )
        }),
        (_('Display Options'), {
            'fields': ('is_featured', 'visibility')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all items, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log item creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'item_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(ItemVariant)
class ItemVariantAdmin(admin.ModelAdmin):
    """
    Admin configuration for the ItemVariant model.
    """
    list_display = (
        'code',
        'item',
        'size',
        'color',
        'sales_price',
        'created_at',
    )
    list_filter = (
        'item__branch',
        'item__item_group',
        'created_at',
    )
    search_fields = ('code', 'item__name', 'size', 'color')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )
    fieldsets = (
        (_('Variant Information'), {
            'fields': ('item', 'code', 'size', 'color')
        }),
        (_('Pricing'), {
            'fields': ('standard_cost', 'sales_price', 'reorder_level', 'maximum_stock')
        }),
        (_('Content'), {
            'fields': ('media',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all item variants, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log item variant creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.item.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'variant_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(ItemUnit)
class ItemUnitAdmin(admin.ModelAdmin):
    """
    Admin configuration for the ItemUnit model.
    """
    list_display = (
        'code',
        'item',
        'name',
        'is_default',
        'is_sales_unit',
        'is_purchase_unit',
        'unit_price',
        'created_at',
    )
    list_filter = (
        'item__item__branch',
        'is_default',
        'is_sales_unit',
        'is_purchase_unit',
        'created_at',
    )
    search_fields = ('code', 'name', 'item__item__name')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )
    fieldsets = (
        (_('Unit Information'), {
            'fields': ('item', 'code', 'name', 'conversion_factor')
        }),
        (_('Pricing'), {
            'fields': ('unit_price', 'unit_cost')
        }),
        (_('Configuration'), {
            'fields': ('is_default', 'is_purchase_unit', 'is_sales_unit')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all item units, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log item unit creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.item.item.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'unit_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(ItemBarcode)
class ItemBarcodeAdmin(admin.ModelAdmin):
    """
    Admin configuration for the ItemBarcode model.
    """
    list_display = (
        'barcode',
        'item',
        'barcode_type',
        'is_primary',
        'unit',
        'created_at',
    )
    list_filter = (
        'barcode_type',
        'is_primary',
        'item__item__branch',
        'created_at',
    )
    search_fields = ('barcode', 'item__item__name')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )
    fieldsets = (
        (_('Barcode Information'), {
            'fields': ('item', 'barcode', 'barcode_type', 'unit', 'is_primary')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all barcodes, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log barcode creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.item.item.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'barcode': obj.barcode,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(InventoryBalance)
class InventoryBalanceAdmin(admin.ModelAdmin):
    """
    Admin configuration for the InventoryBalance model.
    """
    list_display = (
        'item',
        'branch',
        'batch_number',
        'expiry_date',
        'available_quantity',
        'reserved_quantity',
        'average_cost',
        'last_movement_date',
    )
    list_filter = (
        'branch',
        'item__item__item_group',
        'expiry_date',
        'created_at',
    )
    search_fields = ('item__item__name', 'batch_number', 'location')
    ordering = ('-last_movement_date',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'last_movement_date',
    )
    fieldsets = (
        (_('Inventory Information'), {
            'fields': ('branch', 'item', 'location', 'batch_number', 'expiry_date')
        }),
        (_('Stock Details'), {
            'fields': ('available_quantity', 'reserved_quantity', 'average_cost')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'last_movement_date', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all inventory balances, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log inventory balance creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'item_code': obj.item.item.code,
                'batch_number': obj.batch_number,
                'action': 'update' if change else 'create'
            }
        )

    def has_add_permission(self, request):
        """Prevent manual creation of inventory balances."""
        return False

    def has_change_permission(self, request, obj=None):
        """Prevent manual updates to inventory balances."""
        return False