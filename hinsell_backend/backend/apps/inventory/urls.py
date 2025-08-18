from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.inventory.views import ( StoreGroupViewSet, ItemGroupViewSet, ItemViewSet, ItemUnitViewSet, ItemBarcodeViewSet, InventoryBalanceViewSet)

app_name = 'inventory'

router = DefaultRouter()
router.register(r'store-groups', StoreGroupViewSet, basename='store-group')
router.register(r'item-groups', ItemGroupViewSet, basename='item-group')
router.register(r'items', ItemViewSet, basename='item')
router.register(r'item-units', ItemUnitViewSet, basename='item-unit')
router.register(r'item-barcodes', ItemBarcodeViewSet, basename='item-barcode')
router.register(r'inventory-balances', InventoryBalanceViewSet, basename='inventory-balance')

urlpatterns = [
    path('', include(router.urls)),
]