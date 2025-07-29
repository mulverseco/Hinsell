from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry
from apps.transactions.serializers import (
    TransactionTypeSerializer, TransactionHeaderSerializer,
    TransactionDetailSerializer, LedgerEntrySerializer
)
from apps.core_apps.permissions import HasRolePermission
from apps.core_apps.general import BaseViewSet

class TransactionTypeViewSet(BaseViewSet):
    """ViewSet for TransactionType model."""
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['pharmacy_manager', 'accountant']

    def get_queryset(self):
        """Filter queryset by branch for the authenticated user."""
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return TransactionType.objects.filter(branch__in=user.profile.branches.all())
        return TransactionType.objects.none()

class TransactionHeaderViewSet(BaseViewSet):
    """ViewSet for TransactionHeader model."""
    queryset = TransactionHeader.objects.all()
    serializer_class = TransactionHeaderSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['pharmacy_manager', 'pharmacist', 'accountant']

    def get_queryset(self):
        """Filter queryset by branch for the authenticated user."""
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return TransactionHeader.objects.filter(branch__in=user.profile.branches.all())
        return TransactionHeader.objects.none()

    def perform_create(self, serializer):
        """Set branch and created_by on create."""
        serializer.save(branch=self.request.user.profile.branches.first(), created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, HasRolePermission], required_roles=['pharmacy_manager', 'accountant'])
    def approve(self, request, pk=None):
        """Approve a transaction."""
        try:
            transaction = self.get_object()
            transaction.approve(request.user)
            return Response({'status': _('Transaction approved successfully.')}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, HasRolePermission], required_roles=['pharmacy_manager', 'accountant'])
    def post(self, request, pk=None):
        """Post a transaction."""
        try:
            transaction = self.get_object()
            transaction.post(request.user)
            return Response({'status': _('Transaction posted successfully.')}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, HasRolePermission], required_roles=['pharmacy_manager', 'accountant'])
    def reverse(self, request, pk=None):
        """Reverse a transaction."""
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': _('Reversal reason is required.')}, status=status.HTTP_400_BAD_REQUEST)
        try:
            transaction = self.get_object()
            transaction.reverse(request.user, reason)
            return Response({'status': _('Transaction reversed successfully.')}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionDetailViewSet(BaseViewSet):
    """ViewSet for TransactionDetail model."""
    queryset = TransactionDetail.objects.all()
    serializer_class = TransactionDetailSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['pharmacy_manager', 'pharmacist', 'accountant']

    def get_queryset(self):
        """Filter queryset by branch for the authenticated user."""
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return TransactionDetail.objects.filter(header__branch__in=user.profile.branches.all())
        return TransactionDetail.objects.none()

class LedgerEntryViewSet(BaseViewSet):
    """ViewSet for LedgerEntry model."""
    queryset = LedgerEntry.objects.all()
    serializer_class = LedgerEntrySerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['pharmacy_manager', 'accountant']

    def get_queryset(self):
        """Filter queryset by branch for the authenticated user."""
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return LedgerEntry.objects.filter(branch__in=user.profile.branches.all())
        return LedgerEntry.objects.none()