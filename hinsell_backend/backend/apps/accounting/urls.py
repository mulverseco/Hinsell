from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.accounting.views import (
    CurrencyViewSet, CurrencyHistoryViewSet, AccountTypeViewSet, AccountViewSet,
    CostCenterViewSet, OpeningBalanceViewSet, AccountingPeriodViewSet, BudgetViewSet
)

app_name = 'accounting'

router = DefaultRouter()
router.register(r'currencies', CurrencyViewSet, basename='currency')
router.register(r'currency-history', CurrencyHistoryViewSet, basename='currency-history')
router.register(r'account-types', AccountTypeViewSet, basename='account-type')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'cost-centers', CostCenterViewSet, basename='cost-center')
router.register(r'opening-balances', OpeningBalanceViewSet, basename='opening-balance')
router.register(r'accounting-periods', AccountingPeriodViewSet, basename='accounting-period')
router.register(r'budgets', BudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
    path('accounts/<int:pk>/update-balance/', AccountViewSet.as_view({'post': 'update_balance'}), name='account-update-balance'),
]