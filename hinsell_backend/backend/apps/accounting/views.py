from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.accounting.models import Currency, CurrencyHistory, AccountType, Account, CostCenter, OpeningBalance, AccountingPeriod, Budget
from apps.accounting.serializers import (
    CurrencySerializer, CurrencyHistorySerializer, AccountTypeSerializer, AccountSerializer,
    CostCenterSerializer, OpeningBalanceSerializer, AccountingPeriodSerializer, BudgetSerializer
)
from apps.core_apps.permissions import HasRolePermission

class CurrencyViewSet(viewsets.ModelViewSet):
    """ViewSet for Currency model."""
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return Currency.objects.filter(branch__in=user.profile.branches.all())
        return Currency.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CurrencyHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for CurrencyHistory model."""
    queryset = CurrencyHistory.objects.all()
    serializer_class = CurrencyHistorySerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return CurrencyHistory.objects.filter(branch__in=user.profile.branches.all())
        return CurrencyHistory.objects.none()

class AccountTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for AccountType model."""
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return AccountType.objects.filter(branch__in=user.profile.branches.all())
        return AccountType.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AccountViewSet(viewsets.ModelViewSet):
    """ViewSet for Account model."""
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return Account.objects.filter(branch__in=user.profile.branches.all())
        return Account.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, HasRolePermission], required_roles=['admin', 'super_admin', 'accountant'])
    def update_balance(self, request, pk=None):
        """Update account balance."""
        try:
            account = self.get_object()
            account.update_balance(user=self.request.user)
            return Response({'status': _('Balance updated successfully.')}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CostCenterViewSet(viewsets.ModelViewSet):
    """ViewSet for CostCenter model."""
    queryset = CostCenter.objects.all()
    serializer_class = CostCenterSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return CostCenter.objects.filter(branch__in=user.profile.branches.all())
        return CostCenter.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class OpeningBalanceViewSet(viewsets.ModelViewSet):
    """ViewSet for OpeningBalance model."""
    queryset = OpeningBalance.objects.all()
    serializer_class = OpeningBalanceSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return OpeningBalance.objects.filter(branch__in=user.profile.branches.all())
        return OpeningBalance.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AccountingPeriodViewSet(viewsets.ModelViewSet):
    """ViewSet for AccountingPeriod model."""
    queryset = AccountingPeriod.objects.all()
    serializer_class = AccountingPeriodSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return AccountingPeriod.objects.filter(branch__in=user.profile.branches.all())
        return AccountingPeriod.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for Budget model."""
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated, HasRolePermission]
    required_roles = ['admin', 'super_admin', 'accountant']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            return Budget.objects.filter(branch__in=user.profile.branches.all())
        return Budget.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)