"""
URL configuration for the organization application.
Provides comprehensive API endpoints for all organization models.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.organization.views import (
    LicenseTypeViewSet, LicenseViewSet, CompanyViewSet, BranchViewSet,
    SystemSettingsViewSet, SystemConfigurationViewSet, KeyboardShortcutsViewSet,
    LicenseValidationView, LicenseUsageUpdateView, BranchConfigurationView,
    OrganizationDashboardView, LicenseReportView
)

app_name = 'organization'

# Main router
router = DefaultRouter()
router.register(r'license-types', LicenseTypeViewSet, basename='licensetype')
router.register(r'licenses', LicenseViewSet, basename='license')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'system-settings', SystemSettingsViewSet, basename='systemsettings')
router.register(r'system-configurations', SystemConfigurationViewSet, basename='systemconfiguration')
router.register(r'keyboard-shortcuts', KeyboardShortcutsViewSet, basename='keyboardshortcuts')



urlpatterns = [
    # Main API routes
    path('', include(router.urls)),
    
    path('licenses/validate/', LicenseValidationView.as_view(), name='license-validate'),
    path('licenses/<int:license_id>/usage/', LicenseUsageUpdateView.as_view(), name='license-usage-update'),
    path('branches/<int:branch_id>/configure/', BranchConfigurationView.as_view(), name='branch-configure'),
    path('dashboard/', OrganizationDashboardView.as_view(), name='organization-dashboard'),
    path('reports/licenses/', LicenseReportView.as_view(), name='license-report'),
    
]
