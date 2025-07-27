"""
API views for transactions app.
"""
import logging
from decimal import Decimal
from django.db.models import Q, Sum, Count, F,Max
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import (
    HasLedgerAccess, HasControlPanelAccess, HasTransactionAccess,
    CanApproveTransactions, CanPostTransactions
)
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry
from apps.transactions.serializers import (
    TransactionTypeSerializer, TransactionHeaderSerializer, TransactionDetailSerializer,
    LedgerEntrySerializer
)

logger = logging.getLogger(__name__)


class TransactionTypeViewSet(BaseViewSet):
    """ViewSet for TransactionType model."""
    
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer
    filterset_fields = ['branch', 'category', 'affects_inventory', 'affects_accounts', 'requires_approval', 'is_active']
    search_fields = ['type_code', 'type_name']
    ordering_fields = ['type_code', 'type_name']
    ordering = ['type_code']
    
    permission_classes_by_action = {
        'create': [HasControlPanelAccess],
        'update': [HasControlPanelAccess],
        'partial_update': [HasControlPanelAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter transaction types based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset


class TransactionHeaderViewSet(BaseViewSet):
    """ViewSet for TransactionHeader model."""
    
    queryset = TransactionHeader.objects.all()
    serializer_class = TransactionHeaderSerializer
    filterset_fields = [
        'branch', 'transaction_type', 'status', 'customer_account',
        'supplier_account', 'currency', 'transaction_date', 'due_date', 'is_active'
    ]
    search_fields = [
        'transaction_number', 'reference_number', 'customer_account__account_name',
        'supplier_account__account_name'
    ]
    ordering_fields = ['transaction_number', 'transaction_date', 'total_amount', 'created_at']
    ordering = ['-transaction_date', '-created_at']
    
    permission_classes_by_action = {
        'create': [HasTransactionAccess],
        'update': [HasTransactionAccess],
        'partial_update': [HasTransactionAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter transactions based on user branch and permissions."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset.select_related(
            'transaction_type', 'customer_account', 'supplier_account', 'currency'
        ).prefetch_related('details')
    
    @action(detail=True, methods=['post'], permission_classes=[CanApproveTransactions])
    def approve(self, request, pk=None):
        """Approve a transaction."""
        transaction_header = self.get_object()
        
        try:
            transaction_header.approve(request.user)
            return Response({
                'message': 'Transaction approved successfully',
                'transaction_number': transaction_header.transaction_number,
                'status': transaction_header.status,
                'approved_by': request.user.get_full_name(),
                'approved_at': transaction_header.approved_at
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[CanPostTransactions])
    def post_transaction(self, request, pk=None):
        """Post a transaction to ledger."""
        transaction_header = self.get_object()
        
        try:
            transaction_header.post(request.user)
            return Response({
                'message': 'Transaction posted successfully',
                'transaction_number': transaction_header.transaction_number,
                'status': transaction_header.status,
                'posted_by': request.user.get_full_name(),
                'posted_at': transaction_header.posted_at
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[CanPostTransactions])
    def reverse(self, request, pk=None):
        """Reverse a posted transaction."""
        transaction_header = self.get_object()
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'error': 'Reversal reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transaction_header.reverse(request.user, reason)
            return Response({
                'message': 'Transaction reversed successfully',
                'transaction_number': transaction_header.transaction_number,
                'status': transaction_header.status,
                'reversed_by': request.user.get_full_name(),
                'reversed_at': transaction_header.reversed_at,
                'reversal_reason': reason
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class TransactionDetailViewSet(BaseViewSet):
    """ViewSet for TransactionDetail model."""
    
    queryset = TransactionDetail.objects.all()
    serializer_class = TransactionDetailSerializer
    filterset_fields = ['header', 'item', 'batch_number', 'expiry_date', 'is_active']
    search_fields = ['item__item_code', 'item__item_name', 'batch_number']
    ordering_fields = ['line_number', 'created_at']
    ordering = ['line_number']
    
    permission_classes_by_action = {
        'create': [HasTransactionAccess],
        'update': [HasTransactionAccess],
        'partial_update': [HasTransactionAccess],
        'destroy': [HasTransactionAccess],
    }
    
    def get_queryset(self):
        """Filter transaction details based on user permissions."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(header__branch=user_branch)
        
        return queryset.select_related('header', 'item', 'item_unit')


class LedgerEntryViewSet(BaseViewSet):
    """ViewSet for LedgerEntry model."""
    
    queryset = LedgerEntry.objects.all()
    serializer_class = LedgerEntrySerializer
    filterset_fields = [
        'branch', 'account', 'cost_center', 'entry_date', 'is_posted',
        'is_reversed', 'currency', 'is_active'
    ]
    search_fields = [
        'transaction_header__transaction_number', 'account__account_code',
        'account__account_name', 'description', 'reference'
    ]
    ordering_fields = ['entry_date', 'created_at']
    ordering = ['-entry_date', '-created_at']
    
    permission_classes_by_action = {
        'create': [HasLedgerAccess],
        'update': [HasLedgerAccess],
        'partial_update': [HasLedgerAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter ledger entries based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset.select_related(
            'transaction_header', 'account', 'cost_center', 'currency'
        )


class ApproveTransactionView(APIView):
    """Approve a specific transaction."""
    
    permission_classes = [CanApproveTransactions]
    
    def post(self, request, pk):
        """Approve transaction."""
        transaction_header = get_object_or_404(TransactionHeader, pk=pk)
        
        try:
            transaction_header.approve(request.user)
            logger.info(f"Transaction {transaction_header.transaction_number} approved by {request.user}")
            
            return Response({
                'message': 'Transaction approved successfully',
                'transaction_id': str(transaction_header.id),
                'transaction_number': transaction_header.transaction_number,
                'status': transaction_header.status,
                'approved_by': request.user.get_full_name(),
                'approved_at': transaction_header.approved_at.isoformat()
            })
        except Exception as e:
            logger.error(f"Error approving transaction {transaction_header.transaction_number}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PostTransactionView(APIView):
    """Post a transaction to the ledger."""
    
    permission_classes = [CanPostTransactions]
    
    def post(self, request, pk):
        """Post transaction."""
        transaction_header = get_object_or_404(TransactionHeader, pk=pk)
        
        try:
            with transaction.atomic():
                transaction_header.post(request.user)
            
            logger.info(f"Transaction {transaction_header.transaction_number} posted by {request.user}")
            
            return Response({
                'message': 'Transaction posted successfully',
                'transaction_id': str(transaction_header.id),
                'transaction_number': transaction_header.transaction_number,
                'status': transaction_header.status,
                'posted_by': request.user.get_full_name(),
                'posted_at': transaction_header.posted_at.isoformat()
            })
        except Exception as e:
            logger.error(f"Error posting transaction {transaction_header.transaction_number}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReverseTransactionView(APIView):
    """Reverse a posted transaction."""
    
    permission_classes = [CanPostTransactions]
    
    def post(self, request, pk):
        """Reverse transaction."""
        transaction_header = get_object_or_404(TransactionHeader, pk=pk)
        reason = request.data.get('reason', '').strip()
        
        if not reason:
            return Response(
                {'error': 'Reversal reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                transaction_header.reverse(request.user, reason)
            
            logger.info(f"Transaction {transaction_header.transaction_number} reversed by {request.user}: {reason}")
            
            return Response({
                'message': 'Transaction reversed successfully',
                'transaction_id': str(transaction_header.id),
                'transaction_number': transaction_header.transaction_number,
                'status': transaction_header.status,
                'reversed_by': request.user.get_full_name(),
                'reversed_at': transaction_header.reversed_at.isoformat(),
                'reversal_reason': reason
            })
        except Exception as e:
            logger.error(f"Error reversing transaction {transaction_header.transaction_number}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class CancelTransactionView(APIView):
    """Cancel a transaction."""
    
    permission_classes = [HasTransactionAccess]
    
    def post(self, request, pk):
        """Cancel transaction."""
        transaction_header = get_object_or_404(TransactionHeader, pk=pk)
        
        if transaction_header.status not in [
            TransactionHeader.TransactionStatus.DRAFT,
            TransactionHeader.TransactionStatus.PENDING,
            TransactionHeader.TransactionStatus.APPROVED
        ]:
            return Response(
                {'error': 'Only draft, pending, or approved transactions can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transaction_header.status = TransactionHeader.TransactionStatus.CANCELLED
            transaction_header.save(update_fields=['status'])
            
            logger.info(f"Transaction {transaction_header.transaction_number} cancelled by {request.user}")
            
            return Response({
                'message': 'Transaction cancelled successfully',
                'transaction_id': str(transaction_header.id),
                'transaction_number': transaction_header.transaction_number,
                'status': transaction_header.status
            })
        except Exception as e:
            logger.error(f"Error cancelling transaction {transaction_header.transaction_number}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionDetailsView(APIView):
    """Get transaction details for a specific transaction."""
    
    permission_classes = [HasTransactionAccess]
    
    def get(self, request, pk):
        """Get transaction details."""
        transaction_header = get_object_or_404(TransactionHeader, pk=pk)
        details = transaction_header.details.filter(is_active=True).order_by('line_number')
        serializer = TransactionDetailSerializer(details, many=True)
        return Response(serializer.data)


class AddTransactionDetailView(APIView):
    """Add a detail line to a transaction."""
    permission_classes = [HasTransactionAccess]
    
    def post(self, request, pk):
        """Add transaction detail."""
        transaction_header = get_object_or_404(TransactionHeader, pk=pk)
        
        if transaction_header.status not in [
            TransactionHeader.TransactionStatus.DRAFT,
            TransactionHeader.TransactionStatus.PENDING
        ]:
            return Response(
                {'error': 'Can only add details to draft or pending transactions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get next line number
        last_line = transaction_header.details.aggregate(
            max_line=Max('line_number')
        )['max_line'] or 0
        
        data = request.data.copy()
        data['header'] = transaction_header.id
        data['line_number'] = last_line + 1
        
        serializer = TransactionDetailSerializer(data=data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CalculateTransactionTotalsView(APIView):
    """Recalculate transaction totals."""
    
    permission_classes = [HasTransactionAccess]
    
    def post(self, request, pk):
        """Calculate transaction totals."""
        transaction_header = get_object_or_404(TransactionHeader, pk=pk)
        
        try:
            transaction_header.calculate_totals()
            transaction_header.save(update_fields=[
                'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount'
            ])
            
            return Response({
                'message': 'Totals calculated successfully',
                'subtotal_amount': str(transaction_header.subtotal_amount),
                'discount_amount': str(transaction_header.discount_amount),
                'tax_amount': str(transaction_header.tax_amount),
                'total_amount': str(transaction_header.total_amount)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionSummaryView(APIView):
    """Get transaction summary statistics."""
    
    permission_classes = [HasTransactionAccess]
    
    def get(self, request):
        """Get transaction summary."""
        branch_id = request.query_params.get('branch')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response({'error': 'Branch parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Build query
        queryset = TransactionHeader.objects.filter(branch_id=branch_id, is_active=True)
        
        if date_from:
            queryset = queryset.filter(transaction_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(transaction_date__lte=date_to)
        
        # Get summary statistics
        summary = queryset.aggregate(
            total_transactions=Count('id'),
            draft_count=Count('id', filter=Q(status='draft')),
            pending_count=Count('id', filter=Q(status='pending')),
            approved_count=Count('id', filter=Q(status='approved')),
            posted_count=Count('id', filter=Q(status='posted')),
            cancelled_count=Count('id', filter=Q(status='cancelled')),
            reversed_count=Count('id', filter=Q(status='reversed')),
            total_amount=Sum('total_amount') or Decimal('0'),
            total_paid=Sum('paid_amount') or Decimal('0')
        )
        
        summary['total_outstanding'] = summary['total_amount'] - summary['total_paid']
        
        # Get overdue transactions
        today = timezone.now().date()
        overdue_stats = queryset.filter(
            due_date__lt=today,
            status='posted'
        ).aggregate(
            overdue_count=Count('id'),
            overdue_amount=Sum(F('total_amount') - F('paid_amount')) or Decimal('0')
        )
        
        summary.update(overdue_stats)
        
        # Add branch information
        from apps.organization.models import Branch
        branch = Branch.objects.get(id=branch_id)
        summary['branch_id'] = str(branch_id)
        summary['branch_name'] = branch.branch_name
        
        return Response(summary)


class TransactionsByStatusView(APIView):
    """Get transactions grouped by status."""
    
    permission_classes = [HasTransactionAccess]
    
    def get(self, request):
        """Get transactions by status."""
        branch_id = request.query_params.get('branch')
        transaction_status = request.query_params.get('status')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        queryset = TransactionHeader.objects.filter(is_active=True)
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        if transaction_status:
            queryset = queryset.filter(status=transaction_status)
        
        transactions = queryset.select_related(
            'transaction_type', 'customer_account', 'supplier_account'
        ).order_by('-transaction_date')
        
        serializer = TransactionHeaderSerializer(transactions, many=True)
        return Response(serializer.data)


class OverdueTransactionsView(APIView):
    """Get overdue transactions."""
    
    permission_classes = [HasTransactionAccess]
    
    def get(self, request):
        """Get overdue transactions."""
        branch_id = request.query_params.get('branch')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        today = timezone.now().date()
        
        queryset = TransactionHeader.objects.filter(
            is_active=True,
            due_date__lt=today,
            status='posted'
        ).annotate(
            balance_due=F('total_amount') - F('paid_amount')
        ).filter(balance_due__gt=0)
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        transactions = queryset.select_related(
            'transaction_type', 'customer_account', 'supplier_account'
        ).order_by('due_date')
        
        serializer = TransactionHeaderSerializer(transactions, many=True)
        return Response(serializer.data)


class PendingApprovalView(APIView):
    """Get transactions pending approval."""
    
    permission_classes = [CanApproveTransactions]
    
    def get(self, request):
        """Get pending approval transactions."""
        branch_id = request.query_params.get('branch')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        queryset = TransactionHeader.objects.filter(
            is_active=True,
            status='pending'
        )
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        transactions = queryset.select_related(
            'transaction_type', 'customer_account', 'supplier_account'
        ).order_by('transaction_date')
        
        serializer = TransactionHeaderSerializer(transactions, many=True)
        return Response(serializer.data)


class TrialBalanceView(APIView):
    """Generate trial balance report."""
    
    permission_classes = [HasLedgerAccess]
    
    def get(self, request):
        """Get trial balance."""
        branch_id = request.query_params.get('branch')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        if not branch_id:
            return Response({'error': 'Branch parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # This would typically generate a trial balance report
        # For now, return a placeholder response
        return Response({
            'message': 'Trial balance generation pending - requires full ledger implementation',
            'branch_id': branch_id,
            'date_from': date_from,
            'date_to': date_to
        })


class AccountStatementView(APIView):
    """Generate account statement."""
    
    permission_classes = [HasLedgerAccess]
    
    def get(self, request):
        """Get account statement."""
        account_id = request.query_params.get('account')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if not account_id:
            return Response({'error': 'Account parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # This would typically generate an account statement
        # For now, return a placeholder response
        return Response({
            'message': 'Account statement generation pending - requires full ledger implementation',
            'account_id': account_id,
            'date_from': date_from,
            'date_to': date_to
        })


class GeneralLedgerView(APIView):
    """Generate general ledger report."""
    
    permission_classes = [HasLedgerAccess]
    
    def get(self, request):
        """Get general ledger."""
        branch_id = request.query_params.get('branch')
        account_id = request.query_params.get('account')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        # Build query
        queryset = LedgerEntry.objects.filter(is_active=True, is_posted=True)
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        if date_from:
            queryset = queryset.filter(entry_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(entry_date__lte=date_to)
        
        entries = queryset.select_related(
            'account', 'transaction_header', 'cost_center'
        ).order_by('entry_date', 'created_at')
        
        serializer = LedgerEntrySerializer(entries, many=True)
        return Response(serializer.data)


class TransactionSearchView(APIView):
    """Search transactions by various criteria."""
    
    permission_classes = [HasTransactionAccess]
    
    def get(self, request):
        """Search transactions."""
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
            Q(transaction_number__icontains=query) |
            Q(reference_number__icontains=query) |
            Q(customer_account__account_name__icontains=query) |
            Q(supplier_account__account_name__icontains=query) |
            Q(notes__icontains=query)
        )
        
        queryset = TransactionHeader.objects.filter(search_q, is_active=True)
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        transactions = queryset.select_related(
            'transaction_type', 'customer_account', 'supplier_account'
        )[:limit]
        
        serializer = TransactionHeaderSerializer(transactions, many=True)
        return Response({
            'query': query,
            'total_results': len(transactions),
            'transactions': serializer.data
        })


class TransactionNumberCheckView(APIView):
    """Check if transaction number is available."""
    
    permission_classes = [HasTransactionAccess]
    
    def get(self, request):
        """Check transaction number availability."""
        transaction_number = request.query_params.get('number', '').strip()
        branch_id = request.query_params.get('branch')
        
        if not transaction_number:
            return Response({'error': 'Transaction number required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not branch_id and not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                branch_id = user_branch.id
        
        exists = TransactionHeader.objects.filter(
            branch_id=branch_id,
            transaction_number=transaction_number,
            is_active=True
        ).exists()
        
        return Response({
            'transaction_number': transaction_number,
            'is_available': not exists,
            'exists': exists
        })
