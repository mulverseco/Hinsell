from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.transactions.views import (
    TransactionTypeViewSet, TransactionHeaderViewSet,
    TransactionDetailViewSet, LedgerEntryViewSet
)

app_name = 'transactions'

router = DefaultRouter()
router.register(r'transaction-types', TransactionTypeViewSet, basename='transaction-type')
router.register(r'transaction-headers', TransactionHeaderViewSet, basename='transaction-header')
router.register(r'transaction-details', TransactionDetailViewSet, basename='transaction-detail')
router.register(r'ledger-entries', LedgerEntryViewSet, basename='ledger-entry')

urlpatterns = [
    path('', include(router.urls)),
    path('transaction-headers/<int:pk>/approve/', TransactionHeaderViewSet.as_view({'post': 'approve'}), name='transaction-header-approve'),
    path('transaction-headers/<int:pk>/post/', TransactionHeaderViewSet.as_view({'post': 'post'}), name='transaction-header-post'),
    path('transaction-headers/<int:pk>/reverse/', TransactionHeaderViewSet.as_view({'post': 'reverse'}), name='transaction-header-reverse'),
]