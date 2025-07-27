"""
API views for inventory app.
"""
import logging
from decimal import Decimal
from django.db.models import Q, Sum, Count, F, DecimalField
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import (
    HasInventoryAccess, HasControlPanelAccess, CanViewCostInformation
)
from apps.inventory.models import DrugInformation, SampleDistribution, StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance
from apps.inventory.serializers import (
    StoreGroupSerializer, ItemGroupSerializer, ItemSerializer, ItemUnitSerializer,
    ItemBarcodeSerializer, InventoryBalanceSerializer, DrugInformationSerializer,
    SampleDistributionSerializer
)

logger = logging.getLogger(__name__)


class StoreGroupViewSet(BaseViewSet):
    """ViewSet for StoreGroup model."""
    
    queryset = StoreGroup.objects.all()
    serializer_class = StoreGroupSerializer
    filterset_fields = ['branch', 'cost_method', 'is_active']
    search_fields = ['store_group_code', 'store_group_name']
    ordering_fields = ['store_group_code', 'store_group_name']
    ordering = ['store_group_code']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter store groups based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset


class ItemGroupViewSet(BaseViewSet):
    """ViewSet for ItemGroup model."""
    
    queryset = ItemGroup.objects.all()
    serializer_class = ItemGroupSerializer
    filterset_fields = ['branch', 'store_group', 'parent', 'group_type', 'is_active']
    search_fields = ['item_group_code', 'item_group_name', 'description']
    ordering_fields = ['item_group_code', 'item_group_name']
    ordering = ['item_group_code']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter item groups based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """Get item group hierarchy."""
        branch_id = request.query_params.get('branch')
        store_group_id = request.query_params.get('store_group')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        queryset = self.get_queryset()
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if store_group_id:
            queryset = queryset.filter(store_group_id=store_group_id)
        
        item_groups = queryset.select_related('parent', 'store_group').order_by('item_group_code')
        
        def build_hierarchy(groups_list, parent=None):
            hierarchy = []
            for group in groups_list:
                if group.parent == parent:
                    group_data = ItemGroupSerializer(group).data
                    children = build_hierarchy(groups_list, group)
                    if children:
                        group_data['children'] = children
                    hierarchy.append(group_data)
            return hierarchy
        
        hierarchy_data = build_hierarchy(list(item_groups))
        return Response(hierarchy_data)


class ItemViewSet(BaseViewSet):
    """ViewSet for Item model."""
    
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    filterset_fields = [
        'branch', 'item_group', 'item_type', 'manufacturer', 'brand',
        'is_service_item', 'track_expiry', 'track_batches', 'allow_discount',
        'is_prescription_required', 'is_controlled_substance', 'is_active'
    ]
    search_fields = [
        'item_code', 'item_name', 'item_name_english', 'scientific_name',
        'active_ingredient', 'manufacturer', 'brand', 'model_number'
    ]
    ordering_fields = ['item_code', 'item_name', 'sales_price', 'created_at']
    ordering = ['item_code']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter items based on user branch and permissions."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset.select_related('item_group', 'item_group__store_group')
    
    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        """Get detailed stock information for an item."""
        item = self.get_object()
        
        # Check cache first
        cache_key = f"item_stock:{pk}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Get inventory balances
        balances = InventoryBalance.objects.filter(
            item=item,
            is_active=True
        ).order_by('expiry_date', 'batch_number')
        
        # Calculate totals
        total_available = balances.aggregate(Sum('available_quantity'))['available_quantity__sum'] or Decimal('0')
        total_reserved = balances.aggregate(Sum('reserved_quantity'))['reserved_quantity__sum'] or Decimal('0')
        
        # Calculate expired and near expiry quantities
        today = timezone.now().date()
        expired_qty = balances.filter(
            expiry_date__lt=today
        ).aggregate(Sum('available_quantity'))['available_quantity__sum'] or Decimal('0')
        
        warning_date = today + timezone.timedelta(days=item.expiry_warning_days)
        near_expiry_qty = balances.filter(
            expiry_date__lte=warning_date,
            expiry_date__gte=today
        ).aggregate(Sum('available_quantity'))['available_quantity__sum'] or Decimal('0')
        
        # Calculate average cost
        total_value = sum(b.available_quantity * b.average_cost for b in balances)
        avg_cost = total_value / total_available if total_available > 0 else Decimal('0')
        
        stock_data = {
            'item_id': str(item.id),
            'item_code': item.item_code,
            'item_name': item.item_name,
            'base_unit': item.base_unit,
            'total_available': str(total_available),
            'total_reserved': str(total_reserved),
            'total_quantity': str(total_available + total_reserved),
            'average_cost': str(avg_cost),
            'total_value': str(total_value),
            'reorder_level': str(item.reorder_level),
            'is_low_stock': item.is_low_stock(),
            'locations_count': balances.values('location').distinct().count(),
            'batches_count': balances.exclude(batch_number__isnull=True).values('batch_number').distinct().count(),
            'expired_quantity': str(expired_qty),
            'near_expiry_quantity': str(near_expiry_qty),
            'balances': InventoryBalanceSerializer(balances, many=True).data
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, stock_data, 300)
        return Response(stock_data)
    
    @action(detail=True, methods=['get'])
    def pricing(self, request, pk=None):
        """Get pricing information for an item."""
        item = self.get_object()
        
        # Get unit prices
        unit_prices = []
        for unit in item.units.filter(is_active=True):
            unit_prices.append({
                'unit_code': unit.unit_code,
                'unit_name': unit.unit_name,
                'conversion_factor': str(unit.conversion_factor),
                'unit_price': str(unit.unit_price),
                'unit_cost': str(unit.unit_cost),
                'is_default': unit.is_default,
                'is_sales_unit': unit.is_sales_unit,
                'is_purchase_unit': unit.is_purchase_unit
            })
        
        pricing_data = {
            'item_id': str(item.id),
            'item_code': item.item_code,
            'item_name': item.item_name,
            'standard_cost': str(item.standard_cost),
            'last_purchase_cost': str(item.last_purchase_cost),
            'sales_price': str(item.sales_price),
            'wholesale_price': str(item.wholesale_price),
            'minimum_price': str(item.minimum_price),
            'maximum_price': str(item.maximum_price),
            'calculated_selling_price': str(item.calculate_selling_price()),
            'markup_percentage': str(item.markup_percentage),
            'discount_percentage': str(item.discount_percentage),
            'commission_percentage': str(item.commission_percentage),
            'vat_percentage': str(item.vat_percentage),
            'handling_fee': str(item.handling_fee),
            'unit_prices': unit_prices
        }
        
        return Response(pricing_data)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get items with low stock levels."""
        branch_id = request.query_params.get('branch')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response({'error': 'Branch parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get items with current stock <= reorder level
        items = Item.objects.filter(
            branch_id=branch_id,
            is_active=True,
            reorder_level__gt=0
        ).annotate(
            current_stock=Sum('inventory_balances__available_quantity')
        ).filter(
            current_stock__lte=F('reorder_level')
        ).select_related('item_group')
        
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


class ItemUnitViewSet(BaseViewSet):
    """ViewSet for ItemUnit model."""
    
    queryset = ItemUnit.objects.all()
    serializer_class = ItemUnitSerializer
    filterset_fields = ['item', 'is_default', 'is_purchase_unit', 'is_sales_unit', 'is_active']
    search_fields = ['unit_code', 'unit_name', 'item__item_code']
    ordering_fields = ['unit_code', 'conversion_factor']
    ordering = ['unit_code']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasInventoryAccess],
    }


class ItemBarcodeViewSet(BaseViewSet):
    """ViewSet for ItemBarcode model."""
    
    queryset = ItemBarcode.objects.all()
    serializer_class = ItemBarcodeSerializer
    filterset_fields = ['item', 'barcode_type', 'is_primary', 'is_active']
    search_fields = ['barcode', 'item__item_code', 'item__item_name']
    ordering_fields = ['barcode', 'created_at']
    ordering = ['barcode']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasInventoryAccess],
    }


class InventoryBalanceViewSet(BaseViewSet):
    """ViewSet for InventoryBalance model."""
    
    queryset = InventoryBalance.objects.all()
    serializer_class = InventoryBalanceSerializer
    filterset_fields = ['branch', 'item', 'location', 'batch_number', 'expiry_date', 'is_active']
    search_fields = ['item__item_code', 'item__item_name', 'batch_number', 'location']
    ordering_fields = ['expiry_date', 'batch_number', 'available_quantity', 'last_movement_date']
    ordering = ['expiry_date', 'batch_number']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter inventory balances based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset.select_related('item', 'item__item_group')

class DrugInformationViewSet(BaseViewSet):
    """ViewSet for DrugInformation model."""
    
    queryset = DrugInformation.objects.all()
    serializer_class = DrugInformationSerializer
    filterset_fields = ['item', 'is_active']
    search_fields = ['item__item_code', 'item__item_name', 'drug_classification']
    ordering_fields = ['item__item_code', 'created_at']
    ordering = ['item__item_code']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasInventoryAccess],
    }
    def get_queryset(self):
        """Filter drug information based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(item__branch=user_branch)
        
        return queryset.select_related('item', 'item__item_group')
    
class SampleDistributionViewSet(BaseViewSet):
    """ViewSet for SampleDistribution model."""
    
    queryset = SampleDistribution.objects.all()
    serializer_class = SampleDistributionSerializer
    filterset_fields = ['item', 'is_active']
    search_fields = ['item__item_code', 'item__item_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter sample distributions based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset.select_related('item', 'branch')


class ItemSearchView(APIView):
    """Search items by various criteria."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request):
        """Search items."""
        query = request.query_params.get('q', '').strip()
        branch_id = request.query_params.get('branch')
        limit = int(request.query_params.get('limit', 20))
        
        if not query:
            return Response({'error': 'Search query required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        # Build search query
        search_q = Q(
            Q(item_code__icontains=query) |
            Q(item_name__icontains=query) |
            Q(item_name_english__icontains=query) |
            Q(scientific_name__icontains=query) |
            Q(active_ingredient__icontains=query) |
            Q(manufacturer__icontains=query) |
            Q(brand__icontains=query)
        )
        
        queryset = Item.objects.filter(search_q, is_active=True)
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        # Also search by barcode
        barcode_items = Item.objects.filter(
            barcodes__barcode__icontains=query,
            is_active=True
        )
        if branch_id:
            barcode_items = barcode_items.filter(branch_id=branch_id)
        
        # Combine results
        items = (queryset | barcode_items).distinct()[:limit]
        
        serializer = ItemSerializer(items, many=True)
        return Response({
            'query': query,
            'total_results': len(items),
            'items': serializer.data
        })


class LowStockItemsView(APIView):
    """Get items with low stock levels."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request):
        """Get low stock items."""
        branch_id = request.query_params.get('branch')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response({'error': 'Branch parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check cache first
        cache_key = f"low_stock_items:{branch_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Get items with low stock
        items = Item.objects.filter(
            branch_id=branch_id,
            is_active=True,
            reorder_level__gt=0
        ).annotate(
            current_stock=Sum('inventory_balances__available_quantity')
        ).filter(
            current_stock__lte=F('reorder_level')
        ).select_related('item_group').order_by('item_code')
        
        low_stock_data = []
        for item in items:
            current_stock = item.current_stock or Decimal('0')
            low_stock_data.append({
                'item_id': str(item.id),
                'item_code': item.item_code,
                'item_name': item.item_name,
                'item_group': item.item_group.item_group_name,
                'current_stock': str(current_stock),
                'reorder_level': str(item.reorder_level),
                'shortage': str(item.reorder_level - current_stock),
                'base_unit': item.base_unit,
                'last_purchase_cost': str(item.last_purchase_cost),
                'sales_price': str(item.sales_price)
            })
        
        response_data = {
            'branch_id': branch_id,
            'total_low_stock_items': len(low_stock_data),
            'items': low_stock_data,
            'generated_at': timezone.now().isoformat()
        }
        
        # Cache for 10 minutes
        cache.set(cache_key, response_data, 600)
        return Response(response_data)


class ExpiringItemsView(APIView):
    """Get items that are expired or near expiry."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request):
        """Get expiring items."""
        branch_id = request.query_params.get('branch')
        days_ahead = int(request.query_params.get('days_ahead', 30))
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response({'error': 'Branch parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        today = timezone.now().date()
        warning_date = today + timezone.timedelta(days=days_ahead)
        
        # Get inventory balances that are expired or near expiry
        balances = InventoryBalance.objects.filter(
            branch_id=branch_id,
            is_active=True,
            available_quantity__gt=0,
            expiry_date__lte=warning_date
        ).select_related('item', 'item__item_group').order_by('expiry_date')
        
        expiring_data = []
        for balance in balances:
            days_to_expiry = (balance.expiry_date - today).days if balance.expiry_date else None
            
            expiring_data.append({
                'balance_id': str(balance.id),
                'item_code': balance.item.item_code,
                'item_name': balance.item.item_name,
                'item_group': balance.item.item_group.item_group_name,
                'batch_number': balance.batch_number,
                'expiry_date': balance.expiry_date.isoformat() if balance.expiry_date else None,
                'days_to_expiry': days_to_expiry,
                'available_quantity': str(balance.available_quantity),
                'base_unit': balance.item.base_unit,
                'location': balance.location,
                'average_cost': str(balance.average_cost),
                'total_value': str(balance.available_quantity * balance.average_cost),
                'is_expired': balance.is_expired(),
                'status': 'EXPIRED' if balance.is_expired() else 'NEAR_EXPIRY'
            })

        response_status = 'EXPIRED' if balance.is_expired() else 'NEAR_EXPIRY'

        response_data = {
            'branch_id': branch_id,
            'days_ahead': days_ahead,
            'total_expiring_items': len(expiring_data),
            'expired_count': sum(1 for item in expiring_data if item['is_expired']),
            'near_expiry_count': sum(1 for item in expiring_data if not item['is_expired']),
            'items': expiring_data,
            'generated_at': timezone.now().isoformat()
        }
        
        return Response(response_data)


class InventorySummaryView(APIView):
    """Get inventory summary statistics."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request):
        """Get inventory summary."""
        branch_id = request.query_params.get('branch')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response({'error': 'Branch parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check cache first
        cache_key = f"inventory_summary:{branch_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Get summary statistics
        items_stats = Item.objects.filter(
            branch_id=branch_id,
            is_active=True
        ).aggregate(
            total_items=Count('id'),
            service_items=Count('id', filter=Q(is_service_item=True)),
            prescription_items=Count('id', filter=Q(is_prescription_required=True)),
            controlled_items=Count('id', filter=Q(is_controlled_substance=True))
        )
        
        # Inventory value
        inventory_value = InventoryBalance.objects.filter(
            branch_id=branch_id,
            is_active=True
        ).aggregate(
            total_value=Sum(F('available_quantity') * F('average_cost'), output_field=DecimalField())
        )['total_value'] or Decimal('0')
        
        # Low stock items
        low_stock_count = Item.objects.filter(
            branch_id=branch_id,
            is_active=True,
            reorder_level__gt=0
        ).annotate(
            current_stock=Sum('inventory_balances__available_quantity')
        ).filter(
            current_stock__lte=F('reorder_level')
        ).count()
        
        # Expired items
        today = timezone.now().date()
        expired_count = InventoryBalance.objects.filter(
            branch_id=branch_id,
            is_active=True,
            available_quantity__gt=0,
            expiry_date__lt=today
        ).count()
        
        # Near expiry items (next 30 days)
        warning_date = today + timezone.timedelta(days=30)
        near_expiry_count = InventoryBalance.objects.filter(
            branch_id=branch_id,
            is_active=True,
            available_quantity__gt=0,
            expiry_date__gte=today,
            expiry_date__lte=warning_date
        ).count()
        
        summary_data = {
            'branch_id': branch_id,
            'items': {
                'total_items': items_stats['total_items'],
                'service_items': items_stats['service_items'],
                'product_items': items_stats['total_items'] - items_stats['service_items'],
                'prescription_items': items_stats['prescription_items'],
                'controlled_items': items_stats['controlled_items']
            },
            'inventory': {
                'total_value': str(inventory_value),
                'low_stock_items': low_stock_count,
                'expired_items': expired_count,
                'near_expiry_items': near_expiry_count
            },
            'generated_at': timezone.now().isoformat()
        }
        
        # Cache for 15 minutes
        cache.set(cache_key, summary_data, 900)
        return Response(summary_data)


class InventoryMovementsView(APIView):
    """Get inventory movement history."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request):
        """Get inventory movements."""
        # This would typically integrate with the transactions app
        # For now, return a placeholder response
        return Response({
            'message': 'Inventory movements integration pending - requires transactions app implementation',
            'note': 'This endpoint would show stock in/out movements, adjustments, transfers, etc.'
        })


class BarcodeSearchView(APIView):
    """Search item by barcode."""
    permission_classes = [HasInventoryAccess]
    serializer_class = ItemBarcodeSerializer
    
    def get(self, request, barcode):
        """Search item by barcode."""
        try:
            item_barcode = ItemBarcode.objects.select_related(
                'item', 'item__item_group', 'unit'
            ).get(barcode=barcode, is_active=True)
            
            item = item_barcode.item
            
            # Get current stock
            current_stock = item.get_current_stock()
            
            # Get unit information
            unit_info = None
            if item_barcode.unit:
                unit_info = {
                    'unit_code': item_barcode.unit.unit_code,
                    'unit_name': item_barcode.unit.unit_name,
                    'conversion_factor': str(item_barcode.unit.conversion_factor),
                    'unit_price': str(item_barcode.unit.unit_price)
                }
            
            response_data = {
                'barcode': barcode,
                'item': {
                    'id': str(item.id),
                    'item_code': item.item_code,
                    'item_name': item.item_name,
                    'scientific_name': item.scientific_name,
                    'item_group': item.item_group.item_group_name,
                    'manufacturer': item.manufacturer,
                    'brand': item.brand,
                    'base_unit': item.base_unit,
                    'sales_price': str(item.sales_price),
                    'current_stock': str(current_stock),
                    'is_low_stock': item.is_low_stock(),
                    'track_expiry': item.track_expiry,
                    'track_batches': item.track_batches,
                    'is_prescription_required': item.is_prescription_required,
                    'is_controlled_substance': item.is_controlled_substance
                },
                'barcode_info': {
                    'barcode_type': item_barcode.barcode_type,
                    'is_primary': item_barcode.is_primary,
                    'unit': unit_info
                }
            }
            
            return Response(response_data)
            
        except ItemBarcode.DoesNotExist:
            return Response(
                {'error': f'No item found with barcode: {barcode}'},
                status=status.HTTP_404_NOT_FOUND
            )


class ItemStockView(APIView):
    """Get item stock information."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request, pk):
        """Get item stock."""
        item = get_object_or_404(Item, pk=pk)
        
        # This duplicates the stock action in ItemViewSet but provides a direct endpoint
        balances = InventoryBalance.objects.filter(
            item=item,
            is_active=True
        ).order_by('expiry_date', 'batch_number')
        
        total_available = balances.aggregate(Sum('available_quantity'))['available_quantity__sum'] or Decimal('0')
        total_reserved = balances.aggregate(Sum('reserved_quantity'))['reserved_quantity__sum'] or Decimal('0')
        
        return Response({
            'item_id': str(item.id),
            'item_code': item.item_code,
            'item_name': item.item_name,
            'total_available': str(total_available),
            'total_reserved': str(total_reserved),
            'total_quantity': str(total_available + total_reserved),
            'reorder_level': str(item.reorder_level),
            'is_low_stock': item.is_low_stock(),
            'balances': InventoryBalanceSerializer(balances, many=True).data
        })


class ItemPricingView(APIView):
    """Get item pricing information."""
    
    permission_classes = [CanViewCostInformation]
    
    def get(self, request, pk):
        """Get item pricing."""
        item = get_object_or_404(Item, pk=pk)
        
        # Get unit prices
        unit_prices = []
        for unit in item.units.filter(is_active=True):
            unit_prices.append({
                'unit_code': unit.unit_code,
                'unit_name': unit.unit_name,
                'conversion_factor': str(unit.conversion_factor),
                'unit_price': str(unit.unit_price),
                'unit_cost': str(unit.unit_cost),
                'is_default': unit.is_default
            })
        
        return Response({
            'item_id': str(item.id),
            'item_code': item.item_code,
            'item_name': item.item_name,
            'standard_cost': str(item.standard_cost),
            'last_purchase_cost': str(item.last_purchase_cost),
            'sales_price': str(item.sales_price),
            'calculated_selling_price': str(item.calculate_selling_price()),
            'markup_percentage': str(item.markup_percentage),
            'unit_prices': unit_prices
        })


class ItemUnitsView(APIView):
    """Get units for a specific item."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request, pk):
        """Get item units."""
        item = get_object_or_404(Item, pk=pk)
        units = item.units.filter(is_active=True).order_by('conversion_factor')
        serializer = ItemUnitSerializer(units, many=True)
        return Response(serializer.data)


class ItemBarcodesView(APIView):
    """Get barcodes for a specific item."""
    
    permission_classes = [HasInventoryAccess]
    
    def get(self, request, pk):
        """Get item barcodes."""
        item = get_object_or_404(Item, pk=pk)
        barcodes = item.barcodes.filter(is_active=True).order_by('-is_primary', 'barcode')
        serializer = ItemBarcodeSerializer(barcodes, many=True)
        return Response(serializer.data)
