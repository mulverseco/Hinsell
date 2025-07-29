from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.organization.views import (
    LicenseTypeViewSet, LicenseViewSet, CompanyViewSet, BranchViewSet,
    SystemSettingsViewSet, SystemConfigurationViewSet, KeyboardShortcutsViewSet
)

app_name = 'organization'

router = DefaultRouter()
router.register(r'license-types', LicenseTypeViewSet, basename='license-type')
router.register(r'licenses', LicenseViewSet, basename='license')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'system-settings', SystemSettingsViewSet, basename='system-settings')
router.register(r'system-configurations', SystemConfigurationViewSet, basename='system-configuration')
router.register(r'keyboard-shortcuts', KeyboardShortcutsViewSet, basename='keyboard-shortcuts')

urlpatterns = [
    path('', include(router.urls)),
    path('licenses/<int:pk>/activate/', LicenseViewSet.as_view({'post': 'activate'}), name='license-activate'),
    path('licenses/<int:pk>/suspend/', LicenseViewSet.as_view({'post': 'suspend'}), name='license-suspend'),
    path('licenses/<int:pk>/revoke/', LicenseViewSet.as_view({'post': 'revoke'}), name='license-revoke'),
]