from apps.core_apps.general import BaseViewSet
from apps.organization.models import LicenseType, License, Company, Branch, SystemSettings, KeyboardShortcuts
from apps.organization.serializers import (
    LicenseTypeSerializer, LicenseSerializer, CompanySerializer,
    BranchSerializer, SystemSettingsSerializer, KeyboardShortcutsSerializer
)
from apps.core_apps.permissions import (
    LicenseTypePermission, LicensePermission, CompanyPermission,
    BranchPermission, SystemSettingsPermission, KeyboardShortcutsPermission
)

from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

logger = Logger(__name__)

class LicenseTypeViewSet(BaseViewSet):
    queryset = LicenseType.objects.all()
    serializer_class = LicenseTypeSerializer
    permission_classes_by_action = {
        'create': [LicenseTypePermission],
        'update': [LicenseTypePermission],
        'partial_update': [LicenseTypePermission],
        'destroy': [LicenseTypePermission],
        'list': [LicenseTypePermission],
        'retrieve': [LicenseTypePermission]
    }
    logger_name = __name__
    filterset_fields = ['category', 'is_available', 'support_level']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['category', 'name', 'created_at']

class LicenseViewSet(BaseViewSet):
    queryset = License.objects.all()
    serializer_class = LicenseSerializer
    permission_classes_by_action = {
        'create': [LicensePermission],
        'update': [LicensePermission],
        'partial_update': [LicensePermission],
        'destroy': [LicensePermission],
        'list': [LicensePermission],
        'retrieve': [LicensePermission],
        'validate': [LicensePermission]
    }
    logger_name = __name__
    filterset_fields = ['status', 'license_type__category', 'company']
    search_fields = ['license_code', 'license_key', 'licensee_name', 'licensee_email']
    ordering_fields = ['issued_date', 'expiry_date', 'created_at']

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        license = self.get_object()
        result = license.validate_and_update()
        logger.info(
            f"Validated license {license.license_code} for company {license.company.company_name}",
            extra={'action': 'validate', 'object_id': license.id, 'user_id': request.user.id}
        )
        return Response(result)

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted license {instance.license_code}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

class CompanyViewSet(BaseViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes_by_action = {
        'create': [CompanyPermission],
        'update': [CompanyPermission],
        'partial_update': [CompanyPermission],
        'destroy': [CompanyPermission],
        'list': [CompanyPermission],
        'retrieve': [CompanyPermission]
    }
    logger_name = __name__
    filterset_fields = ['industry', 'is_active']
    search_fields = ['code', 'company_name', 'registration_number', 'tax_id', 'email']
    ordering_fields = ['company_name', 'created_at']

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted company {instance.company_name}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

class BranchViewSet(BaseViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes_by_action = {
        'create': [BranchPermission],
        'update': [BranchPermission],
        'partial_update': [BranchPermission],
        'destroy': [BranchPermission],
        'list': [BranchPermission],
        'retrieve': [BranchPermission]
    }
    logger_name = __name__
    filterset_fields = ['company', 'is_primary', 'is_headquarters', 'use_multi_currency']
    search_fields = ['code', 'branch_name', 'email', 'phone_number']
    ordering_fields = ['branch_name', 'created_at']

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted branch {instance.branch_name}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

class SystemSettingsViewSet(BaseViewSet):
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes_by_action = {
        'create': [SystemSettingsPermission],
        'update': [SystemSettingsPermission],
        'partial_update': [SystemSettingsPermission],
        'destroy': [SystemSettingsPermission],
        'list': [SystemSettingsPermission],
        'retrieve': [SystemSettingsPermission]
    }
    logger_name = __name__
    filterset_fields = ['branch', 'require_two_factor_auth']
    search_fields = ['branch__branch_name', 'code']
    ordering_fields = ['branch', 'created_at']

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted system settings for branch {instance.branch.branch_name}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        from apps.core_apps.services.messaging_service import MessagingService
        from django.conf import settings
        if instance.notifications.get('email', False):
            MessagingService(branch=instance.branch).send_notification(
                recipient=None,
                notification_type='system_settings_updated',
                context_data={
                    'email': instance.branch.email,
                    'branch_name': instance.branch.branch_name,
                    'company_name': instance.branch.company.company_name,
                    'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'site_name': settings.SITE_NAME
                },
                channel='email',
                priority='normal'
            )
        logger.info(
            f"Updated system settings for branch {instance.branch.branch_name}",
            extra={'action': 'update', 'object_id': instance.id, 'user_id': self.request.user.id}
        )

class KeyboardShortcutsViewSet(BaseViewSet):
    queryset = KeyboardShortcuts.objects.all()
    serializer_class = KeyboardShortcutsSerializer
    permission_classes_by_action = {
        'create': [KeyboardShortcutsPermission],
        'update': [KeyboardShortcutsPermission],
        'partial_update': [KeyboardShortcutsPermission],
        'destroy': [KeyboardShortcutsPermission],
        'list': [KeyboardShortcutsPermission],
        'retrieve': [KeyboardShortcutsPermission]
    }
    logger_name = __name__
    filterset_fields = ['branch', 'category', 'is_enabled', 'is_global']
    search_fields = ['code', 'action_name', 'display_name', 'key_combination']
    ordering_fields = ['category', 'sort_order', 'created_at']

    def perform_destroy(self, instance):
        instance.soft_delete(user=self.request.user)
        logger.info(
            f"Soft deleted keyboard shortcut {instance.action_name}",
            extra={'action': 'soft_delete', 'object_id': instance.id, 'user_id': self.request.user.id}
        )