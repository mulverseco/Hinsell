from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core_apps.general import BaseViewSet
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry
from apps.transactions.serializers import (
    TransactionTypeSerializer, TransactionHeaderSerializer,
    TransactionDetailSerializer, LedgerEntrySerializer
)
from apps.transactions.tasks import process_transaction_posting, process_transaction_reversal
from apps.core_apps.permissions import DynamicPermission, PharmacyPermissionMixin
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _

logger = Logger(__name__)

class TransactionTypeViewSet(PharmacyPermissionMixin, BaseViewSet):
    queryset = TransactionType.objects.filter(is_deleted=False)
    serializer_class = TransactionTypeSerializer
    permission_classes_by_action = {
        'create': [DynamicPermission],
        'update': [DynamicPermission],
        'partial_update': [DynamicPermission],
        'destroy': [DynamicPermission],
        'list': [DynamicPermission],
        'retrieve': [DynamicPermission]
    }
    logger_name = __name__
    filterset_fields = ['category', 'branch', 'affects_inventory', 'affects_accounts']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'created_at']

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted TransactionType {instance.code}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

class TransactionHeaderViewSet(PharmacyPermissionMixin, BaseViewSet):
    queryset = TransactionHeader.objects.filter(is_deleted=False)
    serializer_class = TransactionHeaderSerializer
    permission_classes_by_action = {
        'create': [DynamicPermission],
        'update': [DynamicPermission],
        'partial_update': [DynamicPermission],
        'destroy': [DynamicPermission],
        'list': [DynamicPermission],
        'retrieve': [DynamicPermission],
        'approve': [DynamicPermission],
        'post': [DynamicPermission],
        'reverse': [DynamicPermission]
    }
    logger_name = __name__
    filterset_fields = ['status', 'transaction_type', 'branch', 'transaction_date']
    search_fields = ['code', 'transaction_number', 'reference_number']
    ordering_fields = ['transaction_date', 'total_amount', 'created_at']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        transaction = self.get_object()
        try:
            transaction.approve(request.user)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except Exception as e:
            logger.error(
                f"Error approving transaction {transaction.code}: {str(e)}",
                extra={'object_id': transaction.id, 'user_id': request.user.id}
            )
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def post(self, request, pk=None):
        transaction = self.get_object()
        try:
            process_transaction_posting.delay(transaction.id, request.user.id)
            return Response({'status': _('Transaction posting scheduled')})
        except Exception as e:
            logger.error(
                f"Error scheduling posting for transaction {transaction.code}: {str(e)}",
                extra={'object_id': transaction.id, 'user_id': request.user.id}
            )
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reverse(self, request, pk=None):
        transaction = self.get_object()
        reason = request.data.get('reason', '')
        if not reason:
            return Response({'error': _('Reversal reason is required')}, status=status.HTTP_400_BAD_REQUEST)
        try:
            process_transaction_reversal.delay(transaction.id, request.user.id, reason)
            return Response({'status': _('Transaction reversal scheduled')})
        except Exception as e:
            logger.error(
                f"Error scheduling reversal for transaction {transaction.code}: {str(e)}",
                extra={'object_id': transaction.id, 'user_id': request.user.id}
            )
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted TransactionHeader {instance.code}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

class TransactionDetailViewSet(PharmacyPermissionMixin, BaseViewSet):
    queryset = TransactionDetail.objects.filter(is_deleted=False)
    serializer_class = TransactionDetailSerializer
    permission_classes_by_action = {
        'create': [DynamicPermission],
        'update': [DynamicPermission],
        'partial_update': [DynamicPermission],
        'destroy': [DynamicPermission],
        'list': [DynamicPermission],
        'retrieve': [DynamicPermission]
    }
    logger_name = __name__
    filterset_fields = ['header', 'item']
    search_fields = ['header__code', 'header__transaction_number', 'item__item_name', 'batch_number']
    ordering_fields = ['line_number', 'created_at']

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted TransactionDetail for header {instance.header.code}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

class LedgerEntryViewSet(PharmacyPermissionMixin, BaseViewSet):
    queryset = LedgerEntry.objects.filter(is_deleted=False)
    serializer_class = LedgerEntrySerializer
    permission_classes_by_action = {
        'create': [DynamicPermission],
        'update': [DynamicPermission],
        'partial_update': [DynamicPermission],
        'destroy': [DynamicPermission],
        'list': [DynamicPermission],
        'retrieve': [DynamicPermission]
    }
    logger_name = __name__
    filterset_fields = ['branch', 'account', 'is_posted', 'is_reversed']
    search_fields = ['code', 'transaction_header__code', 'account__code']
    ordering_fields = ['entry_date', 'created_at']

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted LedgerEntry {instance.code}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )