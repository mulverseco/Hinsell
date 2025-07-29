from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.core_apps.general import BaseViewSet
from apps.organization.models import LicenseType, License, Company, Branch, SystemSettings, SystemConfiguration, KeyboardShortcuts
from apps.organization.serializers import (
    LicenseTypeSerializer, LicenseSerializer, CompanySerializer, BranchSerializer,
    SystemSettingsSerializer, SystemConfigurationSerializer, KeyboardShortcutsSerializer
)
from apps.core_apps.permissions import HasRolePermission
from apps.core_apps.utils import Logger

class LicenseTypeViewSet(BaseViewSet):
    """ViewSet for LicenseType model."""
    queryset = LicenseType.objects.all()
    serializer_class = LicenseTypeSerializer
    logger_name = 'organization.license_type'
    
    filterset_fields = ['code', 'is_available']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['code', 'name', 'created_at', 'updated_at']
    ordering = ['code']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        """Filter queryset by available license types."""
        logger = Logger(self.logger_name, user=self.request.user)
        queryset = LicenseType.objects.filter(is_available=True)
        logger.debug("Fetched available license types", extra={'action': 'get_queryset'})
        return queryset

class LicenseViewSet(BaseViewSet):
    """ViewSet for License model."""
    queryset = License.objects.all()
    serializer_class = LicenseSerializer
    logger_name = 'organization.license'
    
    filterset_fields = ['company', 'license_type', 'status', 'start_date', 'end_date']
    search_fields = ['license_key', 'notes']
    ordering_fields = ['license_key', 'start_date', 'end_date', 'created_at', 'updated_at']
    ordering = ['-start_date']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
        'activate': [IsAuthenticated, HasRolePermission],
        'suspend': [IsAuthenticated, HasRolePermission],
        'revoke': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        """Filter queryset by user permissions."""
        user = self.request.user
        logger = Logger(self.logger_name, user=user)
        if user.is_authenticated and hasattr(user, 'profile'):
            queryset = License.objects.filter(company__branches__in=user.profile.branches.all()).distinct()
            logger.debug("Fetched licenses for user branches", extra={'action': 'get_queryset', 'user_id': user.id})
            return queryset
        logger.warning("No authenticated user or profile for license queryset", extra={'action': 'get_queryset'})
        return License.objects.none()

    def perform_create(self, serializer):
        """Set created_by on create."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(created_by=self.request.user)
        logger.info(f"Created License with ID {instance.id}", extra={'action': 'create', 'object_id': instance.id})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a license."""
        logger = Logger(self.logger_name, user=request.user)
        try:
            license = self.get_object()
            if license.activate():
                logger.info(f"Activated license {license.license_key}", 
                           extra={'action': 'activate', 'license_id': license.id})
                return Response({'status': _('License activated successfully.')}, status=status.HTTP_200_OK)
            logger.warning(f"Failed to activate license {license.license_key}", 
                          extra={'action': 'activate', 'license_id': license.id})
            return Response({'error': _('License cannot be activated.')}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.error(f"Validation error activating license: {str(e)}", 
                        extra={'action': 'activate', 'license_id': pk}, exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error activating license: {str(e)}", 
                        extra={'action': 'activate', 'license_id': pk}, exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a license."""
        logger = Logger(self.logger_name, user=request.user)
        reason = request.data.get('reason', '')
        try:
            license = self.get_object()
            if license.suspend(reason):
                logger.info(f"Suspended license {license.license_key}", 
                           extra={'action': 'suspend', 'license_id': license.id, 'reason': reason})
                return Response({'status': _('License suspended successfully.')}, status=status.HTTP_200_OK)
            logger.warning(f"Failed to suspend license {license.license_key}", 
                          extra={'action': 'suspend', 'license_id': license.id})
            return Response({'error': _('License cannot be suspended.')}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.error(f"Validation error suspending license: {str(e)}", 
                        extra={'action': 'suspend', 'license_id': pk}, exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error suspending license: {str(e)}", 
                        extra={'action': 'suspend', 'license_id': pk}, exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke a license."""
        logger = Logger(self.logger_name, user=request.user)
        reason = request.data.get('reason', '')
        try:
            license = self.get_object()
            if license.revoke(reason):
                logger.info(f"Revoked license {license.license_key}", 
                           extra={'action': 'revoke', 'license_id': license.id, 'reason': reason})
                return Response({'status': _('License revoked successfully.')}, status=status.HTTP_200_OK)
            logger.warning(f"Failed to revoke license {license.license_key}", 
                          extra={'action': 'revoke', 'license_id': license.id})
            return Response({'error': _('License cannot be revoked.')}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.error(f"Validation error revoking license: {str(e)}", 
                        extra={'action': 'revoke', 'license_id': pk}, exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error revoking license: {str(e)}", 
                        extra={'action': 'revoke', 'license_id': pk}, exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CompanyViewSet(BaseViewSet):
    """ViewSet for Company model."""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    logger_name = 'organization.company'
    
    filterset_fields = ['code', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['code', 'name', 'created_at', 'updated_at']
    ordering = ['name']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        """Filter queryset by user permissions."""
        user = self.request.user
        logger = Logger(self.logger_name, user=user)
        if user.is_authenticated and hasattr(user, 'profile'):
            queryset = Company.objects.filter(branches__in=user.profile.branches.all()).distinct()
            logger.debug("Fetched companies for user branches", extra={'action': 'get_queryset', 'user_id': user.id})
            return queryset
        logger.warning("No authenticated user or profile for company queryset", extra={'action': 'get_queryset'})
        return Company.objects.none()

    def perform_create(self, serializer):
        """Set created_by on create."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(created_by=self.request.user)
        logger.info(f"Created Company with ID {instance.id}", extra={'action': 'create', 'object_id': instance.id})

class BranchViewSet(BaseViewSet):
    """ViewSet for Branch model."""
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    logger_name = 'organization.branch'
    
    filterset_fields = ['company', 'branch_code', 'is_active']
    search_fields = ['branch_name', 'branch_code', 'address', 'email']
    ordering_fields = ['branch_code', 'branch_name', 'created_at', 'updated_at']
    ordering = ['branch_code']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        """Filter queryset by user permissions."""
        user = self.request.user
        logger = Logger(self.logger_name, user=user)
        if user.is_authenticated and hasattr(user, 'profile'):
            queryset = Branch.objects.filter(company__branches__in=user.profile.branches.all()).distinct()
            logger.debug("Fetched branches for user branches", extra={'action': 'get_queryset', 'user_id': user.id})
            return queryset
        logger.warning("No authenticated user or profile for branch queryset", extra={'action': 'get_queryset'})
        return Branch.objects.none()

    def perform_create(self, serializer):
        """Set created_by on create."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(created_by=self.request.user)
        logger.info(f"Created Branch with ID {instance.id}", extra={'action': 'create', 'object_id': instance.id})

class SystemSettingsViewSet(BaseViewSet):
    """ViewSet for SystemSettings model."""
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    logger_name = 'organization.system_settings'
    
    filterset_fields = ['branch']
    search_fields = ['settings_key']
    ordering_fields = ['settings_key', 'created_at', 'updated_at']
    ordering = ['settings_key']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        """Filter queryset by user permissions."""
        user = self.request.user
        logger = Logger(self.logger_name, user=user)
        if user.is_authenticated and hasattr(user, 'profile'):
            queryset = SystemSettings.objects.filter(branch__in=user.profile.branches.all())
            logger.debug("Fetched system settings for user branches", extra={'action': 'get_queryset', 'user_id': user.id})
            return queryset
        logger.warning("No authenticated user or profile for system settings queryset", extra={'action': 'get_queryset'})
        return SystemSettings.objects.none()

    def perform_create(self, serializer):
        """Set created_by on create."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(created_by=self.request.user)
        logger.info(f"Created SystemSettings with ID {instance.id}", extra={'action': 'create', 'object_id': instance.id})

class SystemConfigurationViewSet(BaseViewSet):
    """ViewSet for SystemConfiguration model."""
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer
    logger_name = 'organization.system_configuration'
    
    filterset_fields = ['branch']
    search_fields = ['config_key']
    ordering_fields = ['config_key', 'created_at', 'updated_at']
    ordering = ['config_key']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        """Filter queryset by user permissions."""
        user = self.request.user
        logger = Logger(self.logger_name, user=user)
        if user.is_authenticated and hasattr(user, 'profile'):
            queryset = SystemConfiguration.objects.filter(branch__in=user.profile.branches.all())
            logger.debug("Fetched system configurations for user branches", extra={'action': 'get_queryset', 'user_id': user.id})
            return queryset
        logger.warning("No authenticated user or profile for system configuration queryset", extra={'action': 'get_queryset'})
        return SystemConfiguration.objects.none()

    def perform_create(self, serializer):
        """Set created_by on create."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(created_by=self.request.user)
        logger.info(f"Created SystemConfiguration with ID {instance.id}", extra={'action': 'create', 'object_id': instance.id})

class KeyboardShortcutsViewSet(BaseViewSet):
    """ViewSet for KeyboardShortcuts model."""
    queryset = KeyboardShortcuts.objects.all()
    serializer_class = KeyboardShortcutsSerializer
    logger_name = 'organization.keyboard_shortcuts'
    
    filterset_fields = ['branch', 'user']
    search_fields = ['shortcut_key', 'description']
    ordering_fields = ['shortcut_key', 'created_at', 'updated_at']
    ordering = ['shortcut_key']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        """Filter queryset by user permissions."""
        user = self.request.user
        logger = Logger(self.logger_name, user=user)
        if user.is_authenticated and hasattr(user, 'profile'):
            queryset = KeyboardShortcuts.objects.filter(branch__in=user.profile.branches.all())
            logger.debug("Fetched keyboard shortcuts for user branches", extra={'action': 'get_queryset', 'user_id': user.id})
            return queryset
        logger.warning("No authenticated user or profile for keyboard shortcuts queryset", extra={'action': 'get_queryset'})
        return KeyboardShortcuts.objects.none()

    def perform_create(self, serializer):
        """Set created_by on create."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(created_by=self.request.user)
        logger.info(f"Created KeyboardShortcuts with ID {instance.id}", extra={'action': 'create', 'object_id': instance.id})