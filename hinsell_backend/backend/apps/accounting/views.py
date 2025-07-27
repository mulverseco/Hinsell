"""
API views for accounting app.
"""
import logging
from decimal import Decimal
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.utils import timezone
from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import (
    HasLedgerAccess, HasControlPanelAccess, CanViewCostInformation
)
from apps.accounting.models import Currency, CurrencyHistory, AccountType, Account, CostCenter
from apps.accounting.serializers import (
    CurrencySerializer, CurrencyHistorySerializer, AccountTypeSerializer,
    AccountSerializer, CostCenterSerializer, OpeningBalanceSerializer,
    AccountingPeriodSerializer, BudgetSerializer
)

logger = logging.getLogger(__name__)


class CurrencyViewSet(BaseViewSet):
    """ViewSet for Currency model."""
    
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    filterset_fields = ['branch', 'is_local', 'is_default', 'is_active']
    search_fields = ['currency_code', 'currency_name']
    ordering_fields = ['currency_code', 'currency_name', 'exchange_rate']
    ordering = ['currency_code']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter currencies based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def update_rate(self, request, pk=None):
        """Update currency exchange rate."""
        currency = self.get_object()
        
        try:
            new_rate = Decimal(str(request.data.get('exchange_rate')))
            reason = request.data.get('reason', 'Manual update')
            
            if new_rate <= 0:
                return Response(
                    {'error': 'Exchange rate must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            currency.update_exchange_rate(new_rate, request.user)
            
            return Response({
                'message': 'Exchange rate updated successfully',
                'old_rate': currency.exchange_rate,
                'new_rate': new_rate,
                'currency': currency.currency_code
            })
        
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid exchange rate format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error updating exchange rate: {str(e)}")
            return Response(
                {'error': 'Failed to update exchange rate'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CurrencyHistoryViewSet(BaseViewSet):
    """ViewSet for CurrencyHistory model."""
    
    queryset = CurrencyHistory.objects.all()
    serializer_class = CurrencyHistorySerializer
    filterset_fields = ['currency', 'branch', 'changed_by']
    search_fields = ['currency__currency_code', 'reason']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter currency history based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset


class AccountTypeViewSet(BaseViewSet):
    """ViewSet for AccountType model."""
    
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeSerializer
    filterset_fields = ['branch', 'category', 'normal_balance', 'is_active']
    search_fields = ['type_code', 'type_name']
    ordering_fields = ['type_code', 'type_name']
    ordering = ['type_code']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter account types based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset


class AccountViewSet(BaseViewSet):
    """ViewSet for Account model."""
    
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    filterset_fields = [
        'branch', 'account_type', 'account_nature', 'parent',
        'is_header', 'is_hidden', 'is_system', 'stop_sales', 'is_active'
    ]
    search_fields = ['account_code', 'account_name', 'email', 'tax_registration_number']
    ordering_fields = ['account_code', 'account_name', 'current_balance']
    ordering = ['account_code']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter accounts based on user branch and permissions."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
            
            # Hide system accounts for non-admin users
            if not self.request.user.use_control_panel:
                queryset = queryset.filter(is_system=False)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def balance(self, request, pk=None):
        """Get current account balance."""
        account = self.get_object()
        
        # Check if user can view cost information
        if not request.user.has_perm('accounting.can_view_cost_information'):
            return Response(
                {'error': 'Permission denied to view balance information'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        balance = account.calculate_balance()
        account.update_balance()  # Update stored balance
        
        return Response({
            'account_code': account.account_code,
            'account_name': account.account_name,
            'current_balance': balance,
            'formatted_balance': account.currency.format_amount(balance) if account.currency else f"{balance:.2f}",
            'last_updated': account.updated_at
        })
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get account transactions."""
        account = self.get_object()
        
        # This would typically import from transactions app
        # For now, return placeholder
        return Response({
            'account': account.account_code,
            'transactions': [],
            'message': 'Transaction history would be implemented in transactions app'
        })
    
    @action(detail=False, methods=['get'])
    def chart(self, request):
        """Get chart of accounts in hierarchical format."""
        branch_id = request.query_params.get('branch')
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response(
                {'error': 'Branch parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check cache first
        cache_key = f"chart_of_accounts:{branch_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Get all accounts for the branch
        accounts = Account.objects.filter(
            branch_id=branch_id,
            is_active=True
        ).select_related('account_type', 'parent', 'currency').order_by('account_code')
        
        # Build hierarchical structure
        def build_hierarchy(accounts_list, parent=None):
            hierarchy = []
            for account in accounts_list:
                if account.parent == parent:
                    account_data = AccountSerializer(account).data
                    children = build_hierarchy(accounts_list, account)
                    if children:
                        account_data['children'] = children
                    hierarchy.append(account_data)
            return hierarchy
        
        chart_data = build_hierarchy(list(accounts))
        
        # Cache for 15 minutes
        cache.set(cache_key, chart_data, 900)
        return Response(chart_data)


class CostCenterViewSet(BaseViewSet):
    """ViewSet for CostCenter model."""
    
    queryset = CostCenter.objects.all()
    serializer_class = CostCenterSerializer
    filterset_fields = ['branch', 'parent', 'is_header', 'manager', 'is_active']
    search_fields = ['cost_center_code', 'cost_center_name']
    ordering_fields = ['cost_center_code', 'cost_center_name']
    ordering = ['cost_center_code']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter cost centers based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """Get cost center hierarchy."""
        branch_id = request.query_params.get('branch')
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response(
                {'error': 'Branch parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cost_centers = CostCenter.objects.filter(
            branch_id=branch_id,
            is_active=True
        ).select_related('parent', 'manager').order_by('cost_center_code')
        
        def build_hierarchy(centers_list, parent=None):
            hierarchy = []
            for center in centers_list:
                if center.parent == parent:
                    center_data = CostCenterSerializer(center).data
                    children = build_hierarchy(centers_list, center)
                    if children:
                        center_data['children'] = children
                    hierarchy.append(center_data)
            return hierarchy
        
        hierarchy_data = build_hierarchy(list(cost_centers))
        return Response(hierarchy_data)

class OpeningBalanceViewSet(BaseViewSet):
    """ViewSet for OpeningBalance model."""
    
    queryset = Account.objects.all()  # Assuming opening balances are stored in Account
    serializer_class = OpeningBalanceSerializer
    filterset_fields = ['branch', 'account_type', 'is_active']
    search_fields = ['account_code', 'account_name']
    ordering_fields = ['account_code', 'account_name']
    ordering = ['account_code']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter accounts based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset
    
class AccountingPeriodViewSet(BaseViewSet):
    """ViewSet for AccountingPeriod model."""
    
    queryset = Account.objects.all()  # Assuming periods are stored in Account
    serializer_class = AccountingPeriodSerializer
    filterset_fields = ['branch', 'is_active']
    search_fields = ['period_name']
    ordering_fields = ['start_date', 'end_date']
    ordering = ['start_date']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter accounting periods based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset
    
class BudgetViewSet(BaseViewSet):
    """ViewSet for Budget model."""
    
    queryset = Account.objects.all()  # Assuming budgets are stored in Account
    serializer_class = BudgetSerializer
    filterset_fields = ['branch', 'account_type', 'is_active']
    search_fields = ['account_code', 'account_name']
    ordering_fields = ['account_code', 'account_name']
    ordering = ['account_code']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter budgets based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset

class UpdateExchangeRateView(APIView):
    """Update exchange rate for a specific currency."""
    
    permission_classes = [HasLedgerAccess]
    
    def post(self, request, pk):
        """Update currency exchange rate."""
        currency = get_object_or_404(Currency, pk=pk)
        
        try:
            new_rate = Decimal(str(request.data.get('exchange_rate')))
            reason = request.data.get('reason', 'Manual update via API')
            
            if new_rate <= 0:
                return Response(
                    {'error': 'Exchange rate must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate against limits
            if currency.upper_limit > 0 and new_rate > currency.upper_limit:
                return Response(
                    {'error': f'Exchange rate exceeds upper limit of {currency.upper_limit}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if currency.lower_limit > 0 and new_rate < currency.lower_limit:
                return Response(
                    {'error': f'Exchange rate below lower limit of {currency.lower_limit}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            old_rate = currency.exchange_rate
            currency.update_exchange_rate(new_rate, request.user)
            
            logger.info(f"Exchange rate updated for {currency.currency_code}: {old_rate} -> {new_rate} by {request.user}")
            
            return Response({
                'message': 'Exchange rate updated successfully',
                'currency_code': currency.currency_code,
                'old_rate': str(old_rate),
                'new_rate': str(new_rate),
                'change_percentage': float(((new_rate - old_rate) / old_rate) * 100) if old_rate > 0 else 0,
                'updated_at': currency.exchange_rate_date,
                'updated_by': request.user.get_full_name()
            })
        
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid exchange rate format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error updating exchange rate for {currency.currency_code}: {str(e)}")
            return Response(
                {'error': 'Failed to update exchange rate'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AccountBalanceView(APIView):
    """Get account balance information."""
    
    permission_classes = [CanViewCostInformation]
    
    def get(self, request, pk):
        """Get account balance."""
        account = get_object_or_404(Account, pk=pk)
        
        # Calculate current balance
        calculated_balance = account.calculate_balance()
        
        # Update stored balance if different
        if account.current_balance != calculated_balance:
            account.current_balance = calculated_balance
            account.save(update_fields=['current_balance'])
        
        return Response({
            'account_id': str(account.id),
            'account_code': account.account_code,
            'account_name': account.account_name,
            'account_type': account.account_type.type_name,
            'current_balance': str(calculated_balance),
            'formatted_balance': account.currency.format_amount(calculated_balance) if account.currency else f"{calculated_balance:.2f}",
            'currency_code': account.currency.currency_code if account.currency else None,
            'last_updated': account.updated_at,
            'credit_limit': str(account.credit_limit),
            'debit_limit': str(account.debit_limit),
            'budget_amount': str(account.budget_amount)
        })


class AccountTransactionsView(APIView):
    """Get account transaction history."""
    
    permission_classes = [CanViewCostInformation]
    
    def get(self, request, pk):
        """Get account transactions."""
        account = get_object_or_404(Account, pk=pk)
        
        # This would typically integrate with the transactions app
        # For now, return a placeholder response
        return Response({
            'account_id': str(account.id),
            'account_code': account.account_code,
            'account_name': account.account_name,
            'transactions': [],
            'total_transactions': 0,
            'message': 'Transaction history integration pending - requires transactions app implementation'
        })


class ChartOfAccountsView(APIView):
    """Get complete chart of accounts."""
    
    permission_classes = [HasLedgerAccess]
    
    def get(self, request):
        """Get chart of accounts."""
        branch_id = request.query_params.get('branch')
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response(
                {'error': 'Branch parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Build cache key
        cache_key = f"chart_of_accounts:{branch_id}:{'with_inactive' if include_inactive else 'active_only'}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Get accounts
        queryset = Account.objects.filter(branch_id=branch_id)
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        
        accounts = queryset.select_related(
            'account_type', 'parent', 'currency'
        ).order_by('account_code')
        
        # Group by account type
        chart_by_type = {}
        for account in accounts:
            account_type = account.account_type.type_name
            if account_type not in chart_by_type:
                chart_by_type[account_type] = {
                    'type_info': {
                        'code': account.account_type.type_code,
                        'name': account.account_type.type_name,
                        'category': account.account_type.category,
                        'normal_balance': account.account_type.normal_balance
                    },
                    'accounts': []
                }
            
            account_data = AccountSerializer(account).data
            chart_by_type[account_type]['accounts'].append(account_data)
        
        response_data = {
            'branch_id': branch_id,
            'include_inactive': include_inactive,
            'total_accounts': len(accounts),
            'chart_by_type': chart_by_type,
            'generated_at': timezone.now().isoformat()
        }
        
        # Cache for 10 minutes
        cache.set(cache_key, response_data, 600)
        return Response(response_data)


class CostCenterHierarchyView(APIView):
    """Get cost center hierarchy."""
    
    permission_classes = [HasLedgerAccess]
    
    def get(self, request):
        """Get cost center hierarchy."""
        branch_id = request.query_params.get('branch')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response(
                {'error': 'Branch parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cost_centers = CostCenter.objects.filter(
            branch_id=branch_id,
            is_active=True
        ).select_related('parent', 'manager').order_by('cost_center_code')
        
        def build_hierarchy(centers_list, parent=None, level=0):
            hierarchy = []
            for center in centers_list:
                if center.parent == parent:
                    center_data = CostCenterSerializer(center).data
                    center_data['level'] = level
                    center_data['has_children'] = any(c.parent == center for c in centers_list)
                    
                    children = build_hierarchy(centers_list, center, level + 1)
                    if children:
                        center_data['children'] = children
                    
                    hierarchy.append(center_data)
            return hierarchy
        
        hierarchy_data = build_hierarchy(list(cost_centers))
        
        return Response({
            'branch_id': branch_id,
            'total_cost_centers': len(cost_centers),
            'hierarchy': hierarchy_data,
            'generated_at': timezone.now().isoformat()
        })
