"""
URL configuration for transactions app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.transactions import views

app_name = 'transactions'

# API Router
router = DefaultRouter()
router.register(r'transaction-types', views.TransactionTypeViewSet, basename='transaction-type')
router.register(r'transaction-headers', views.TransactionHeaderViewSet, basename='transaction-header')
router.register(r'transaction-details', views.TransactionDetailViewSet, basename='transaction-detail')
router.register(r'ledger-entries', views.LedgerEntryViewSet, basename='ledger-entry')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Transaction workflow endpoints
    path('transactions/<uuid:pk>/approve/', views.ApproveTransactionView.as_view(), name='approve-transaction'),
    path('transactions/<uuid:pk>/post/', views.PostTransactionView.as_view(), name='post-transaction'),
    path('transactions/<uuid:pk>/reverse/', views.ReverseTransactionView.as_view(), name='reverse-transaction'),
    path('transactions/<uuid:pk>/cancel/', views.CancelTransactionView.as_view(), name='cancel-transaction'),

    # Transaction details management
    path('transactions/<uuid:pk>/details/', views.TransactionDetailsView.as_view(), name='transaction-details'),
    path('transactions/<uuid:pk>/add-detail/', views.AddTransactionDetailView.as_view(), name='add-transaction-detail'),
    path('transactions/<uuid:pk>/calculate-totals/', views.CalculateTransactionTotalsView.as_view(), name='calculate-totals'),

    # Reporting and analytics
    path('transactions/summary/', views.TransactionSummaryView.as_view(), name='transaction-summary'),
    path('transactions/by-status/', views.TransactionsByStatusView.as_view(), name='transactions-by-status'),
    path('transactions/overdue/', views.OverdueTransactionsView.as_view(), name='overdue-transactions'),
    path('transactions/pending-approval/', views.PendingApprovalView.as_view(), name='pending-approval'),

    # Ledger and accounting
    path('ledger/trial-balance/', views.TrialBalanceView.as_view(), name='trial-balance'),
    path('ledger/account-statement/', views.AccountStatementView.as_view(), name='account-statement'),
    path('ledger/general-ledger/', views.GeneralLedgerView.as_view(), name='general-ledger'),

    # Search and lookup
    path('transactions/search/', views.TransactionSearchView.as_view(), name='transaction-search'),
    path('transactions/number-check/', views.TransactionNumberCheckView.as_view(), name='transaction-number-check'),
]
