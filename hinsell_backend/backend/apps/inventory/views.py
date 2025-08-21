from rest_framework.permissions import IsAuthenticated
from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import HasRolePermission
from apps.inventory.models import StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance
from apps.inventory.serializers import (
    StoreGroupSerializer, ItemGroupSerializer, ItemSerializer,
    ItemUnitSerializer, ItemBarcodeSerializer, InventoryBalanceSerializer
)

class StoreGroupViewSet(BaseViewSet):
    """ViewSet for StoreGroup model."""
    queryset = StoreGroup.objects.all()
    serializer_class = StoreGroupSerializer
    logger_name = 'inventory.store_group'
    
    filterset_fields = ['branch', 'code', 'cost_method']
    search_fields = ['code', 'name', 'slug']
    ordering_fields = ['code', 'name', 'created_at', 'updated_at']
    ordering = ['code']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    } 

class ItemGroupViewSet(BaseViewSet):
    """ViewSet for ItemGroup model."""
    queryset = ItemGroup.objects.all()
    serializer_class = ItemGroupSerializer
    logger_name = 'inventory.item_group'
    
    filterset_fields = ['branch', 'store_group', 'code', 'group_type', 'is_featured', 'visibility']
    search_fields = ['code', 'name', 'slug', 'description']
    ordering_fields = ['code', 'name', 'created_at', 'updated_at', 'is_featured']
    ordering = ['code']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    } 

class ItemViewSet(BaseViewSet):
    """ViewSet for Item model."""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    logger_name = 'inventory.item'
    
    filterset_fields = [
        'branch', 'item_group', 'code', 'item_type', 'is_featured', 'visibility',
        'track_expiry', 'track_batches'
    ]
    search_fields = [
        'code', 'name', 'slug', 'manufacturer', 'brand',
        'description', 'short_description', 'tags'
    ]
    ordering_fields = ['code', 'name', 'sales_price', 'average_rating', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    } 

class ItemUnitViewSet(BaseViewSet):
    """ViewSet for ItemUnit model."""
    queryset = ItemUnit.objects.all()
    serializer_class = ItemUnitSerializer
    logger_name = 'inventory.item_unit'
    
    filterset_fields = ['item', 'code', 'is_default', 'is_purchase_unit', 'is_sales_unit']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'created_at', 'updated_at']
    ordering = ['code']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    } 

class ItemBarcodeViewSet(BaseViewSet):
    """ViewSet for ItemBarcode model."""
    queryset = ItemBarcode.objects.all()
    serializer_class = ItemBarcodeSerializer
    logger_name = 'inventory.item_barcode'
    
    filterset_fields = ['item', 'barcode', 'barcode_type', 'is_primary']
    search_fields = ['barcode']
    ordering_fields = ['barcode', 'created_at', 'updated_at']
    ordering = ['barcode']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    } 

class InventoryBalanceViewSet(BaseViewSet):
    """ViewSet for InventoryBalance model."""
    queryset = InventoryBalance.objects.all()
    serializer_class = InventoryBalanceSerializer
    logger_name = 'inventory.inventory_balance'
    
    filterset_fields = [
        'branch', 'item', 'batch_number', 'expiry_date',
        'available_quantity', 'last_movement_date'
    ]
    search_fields = ['batch_number']
    ordering_fields = ['available_quantity', 'last_movement_date', 'created_at', 'updated_at']
    ordering = ['-last_movement_date']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    } 