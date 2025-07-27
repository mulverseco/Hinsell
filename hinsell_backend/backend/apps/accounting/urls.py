"""
URL configuration for accounting app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'accounting'

# API Router
router = DefaultRouter()
router.register(r'currencies', views.CurrencyViewSet, basename='currency')
router.register(r'currency-history', views.CurrencyHistoryViewSet, basename='currency-history')
router.register(r'account-types', views.AccountTypeViewSet, basename='account-type')
router.register(r'accounts', views.AccountViewSet, basename='account')
router.register(r'cost-centers', views.CostCenterViewSet, basename='cost-center')
router.register(r'opening-balances', views.OpeningBalanceViewSet, basename='opening-balance')
router.register(r'accounting-periods', views.AccountingPeriodViewSet, basename='accounting-period')
router.register(r'budgets', views.BudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
    
    path('currencies/<uuid:pk>/update-rate/', views.UpdateExchangeRateView.as_view(), name='update-exchange-rate'),
    path('accounts/<uuid:pk>/balance/', views.AccountBalanceView.as_view(), name='account-balance'),
    path('accounts/<uuid:pk>/transactions/', views.AccountTransactionsView.as_view(), name='account-transactions'),
    path('accounts/chart/', views.ChartOfAccountsView.as_view(), name='chart-of-accounts'),
    path('cost-centers/hierarchy/', views.CostCenterHierarchyView.as_view(), name='cost-center-hierarchy'),
]
