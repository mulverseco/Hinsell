from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import HasRolePermission
from apps.inventory.services.similarity_service import ItemSimilarityService
from apps.inventory.models import StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance
from apps.inventory.serializers import (
    StoreGroupSerializer, ItemGroupSerializer, ItemSerializer,
    ItemUnitSerializer, ItemBarcodeSerializer, InventoryBalanceSerializer,
    SimilarItemResponseSerializer
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
    @action(detail=True, methods=['get'], url_path='similar')
    def similar_items(self, request, pk=None):
        """
        Get similar items for a specific item.
        
        Query Parameters:
        - limit: Number of similar items to return (default: 10, max: 20)
        - exclude_out_of_stock: Exclude items with zero stock (default: true)
        - type: Type of similarity search ('default', 'trending', 'budget', 'premium')
        """
        try:
            item = self.get_object()
            limit = min(int(request.query_params.get('limit', 10)), 20)
            exclude_out_of_stock = request.query_params.get('exclude_out_of_stock', 'true').lower() == 'true'
            similarity_type = request.query_params.get('type', 'default')
            
            # Initialize similarity service
            similarity_service = ItemSimilarityService(branch_id=item.branch_id)
            
            # Get similar items based on type
            if similarity_type == 'trending':
                similar_items = similarity_service.find_trending_similar_items(
                    item=item,
                    limit=limit
                )
            elif similarity_type == 'budget':
                similar_items = similarity_service.find_price_alternative_items(
                    item=item,
                    price_range='budget',
                    limit=limit
                )
            elif similarity_type == 'premium':
                similar_items = similarity_service.find_price_alternative_items(
                    item=item,
                    price_range='premium',
                    limit=limit
                )
            else:  # default
                similar_items = similarity_service.find_similar_items(
                    item=item,
                    limit=limit,
                    exclude_out_of_stock=exclude_out_of_stock
                )
            
            # Serialize the results
            serializer = SimilarItemResponseSerializer(similar_items, many=True)
            
            return Response({
                'count': len(similar_items),
                'reference_item': {
                    'id': item.id,
                    'code': item.code,
                    'name': item.name
                },
                'similar_items': serializer.data,
                'similarity_type': similarity_type
            })
            
        except ValueError as e:
            return Response(
                {'error': 'Invalid limit parameter. Must be a number.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            self.logger.error(
                f"Error getting similar items for item {pk}: {str(e)}",
                extra={'item_id': pk},
                exc_info=True
            )
            return Response(
                {'error': 'An error occurred while finding similar items.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'], url_path='recommendations')
    def item_recommendations(self, request, pk=None):
        """
        Get comprehensive item recommendations including similar, trending, and alternatives.
        """
        try:
            item = self.get_object()
            similarity_service = ItemSimilarityService(branch_id=item.branch_id)
            
            # Get different types of recommendations
            similar_items = similarity_service.find_similar_items(item, limit=5)
            trending_items = similarity_service.find_trending_similar_items(item, limit=3)
            budget_alternatives = similarity_service.find_price_alternative_items(
                item, price_range='budget', limit=3
            )
            premium_alternatives = similarity_service.find_price_alternative_items(
                item, price_range='premium', limit=3
            )
            
            return Response({
                'reference_item': {
                    'id': item.id,
                    'code': item.code,
                    'name': item.name,
                    'price': item.sales_price
                },
                'recommendations': {
                    'similar': SimilarItemResponseSerializer(similar_items, many=True).data,
                    'trending': SimilarItemResponseSerializer(trending_items, many=True).data,
                    'budget_alternatives': SimilarItemResponseSerializer(budget_alternatives, many=True).data,
                    'premium_alternatives': SimilarItemResponseSerializer(premium_alternatives, many=True).data
                }
            })
            
        except Exception as e:
            self.logger.error(
                f"Error getting recommendations for item {pk}: {str(e)}",
                extra={'item_id': pk},
                exc_info=True
            )
            return Response(
                {'error': 'An error occurred while getting recommendations.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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