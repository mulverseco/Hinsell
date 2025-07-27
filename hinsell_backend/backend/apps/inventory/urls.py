"""
URL configuration for inventory app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.inventory import views

app_name = 'inventory'

# API Router
router = DefaultRouter()
router.register(r'store-groups', views.StoreGroupViewSet, basename='store-group')
router.register(r'item-groups', views.ItemGroupViewSet, basename='item-group')
router.register(r'items', views.ItemViewSet, basename='item')
router.register(r'item-units', views.ItemUnitViewSet, basename='item-unit')
router.register(r'item-barcodes', views.ItemBarcodeViewSet, basename='item-barcode')
router.register(r'inventory-balances', views.InventoryBalanceViewSet, basename='inventory-balance')
router.register(r'drug-informations', views.DrugInformationViewSet, basename='drug-information')
router.register(r'sample-distributions', views.SampleDistributionViewSet, basename='sample-distribution')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Custom endpoints
    path('items/<uuid:pk>/stock/', views.ItemStockView.as_view(), name='item-stock'),
    path('items/<uuid:pk>/pricing/', views.ItemPricingView.as_view(), name='item-pricing'),
    path('items/<uuid:pk>/units/', views.ItemUnitsView.as_view(), name='item-units-list'),
    path('items/<uuid:pk>/barcodes/', views.ItemBarcodesView.as_view(), name='item-barcodes-list'),
    path('items/search/', views.ItemSearchView.as_view(), name='item-search'),
    path('items/low-stock/', views.LowStockItemsView.as_view(), name='low-stock-items'),
    path('items/expiring/', views.ExpiringItemsView.as_view(), name='expiring-items'),
    path('inventory/summary/', views.InventorySummaryView.as_view(), name='inventory-summary'),
    path('inventory/movements/', views.InventoryMovementsView.as_view(), name='inventory-movements'),
    path('barcode/<str:barcode>/', views.BarcodeSearchView.as_view(), name='barcode-search'),
]
