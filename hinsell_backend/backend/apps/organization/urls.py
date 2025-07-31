from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.organization.views import (
    LicenseTypeViewSet, LicenseViewSet, CompanyViewSet, BranchViewSet,
    SystemSettingsViewSet, KeyboardShortcutsViewSet
)

router = DefaultRouter()
router.register(r'license-types', LicenseTypeViewSet)
router.register(r'licenses', LicenseViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'system-settings', SystemSettingsViewSet)
router.register(r'keyboard-shortcuts', KeyboardShortcutsViewSet)

app_name = 'organization'

urlpatterns = [
    path('', include(router.urls)),
]