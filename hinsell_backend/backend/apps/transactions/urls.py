from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.transactions.views import (
    TransactionTypeViewSet, TransactionHeaderViewSet, TransactionDetailViewSet, LedgerEntryViewSet
)

router = DefaultRouter()
router.register(r'transaction-types', TransactionTypeViewSet, basename='transaction-type')
router.register(r'transaction-headers', TransactionHeaderViewSet, basename='transaction-header')
router.register(r'transaction-details', TransactionDetailViewSet, basename='transaction-detail')
router.register(r'ledger-entries', LedgerEntryViewSet, basename='ledger-entry')

urlpatterns = [
    path('', include(router.urls)),
]