"""
API views for the organization application.
Provides comprehensive REST API endpoints for all organization models.
"""

import logging
from datetime import timedelta

from django.utils import timezone
from django.db.models import Q, Count
from django.core.cache import cache
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import (
    IsSystemAdmin, HasControlPanelAccess, IsBranchMember,
    CanManageUsers
)

from apps.organization.models import (
    LicenseType, License, Company, Branch,
    SystemSettings, SystemConfiguration, KeyboardShortcuts
)
from apps.organization.serializers import (
    LicenseTypeSerializer, LicenseSerializer, CompanySerializer, BranchSerializer,
    SystemSettingsSerializer, SystemConfigurationSerializer, KeyboardShortcutsSerializer,
    BranchDetailSerializer, CompanyDetailSerializer, LicenseValidationSerializer,
    LicenseUsageUpdateSerializer, BranchConfigurationSerializer
)
from apps.organization.tasks import (
    validate_license_task, update_license_usage_task,
    send_license_expiry_notification, generate_license_report
)
from apps.core_apps.services.services import MessagingService

logger = logging.getLogger(__name__)


class LicenseTypeViewSet(BaseViewSet):
    """ViewSet for License Types."""
    
    queryset = LicenseType.objects.all()
    serializer_class = LicenseTypeSerializer
    permission_classes = [IsAuthenticated, IsSystemAdmin]
    filterset_fields = ['category', 'is_available']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'category', 'monthly_price', 'yearly_price', 'created_at']
    ordering = ['category', 'name']
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            queryset = queryset.filter(is_available=True)
        
        return queryset.annotate(
            license_count=Count('licenses')
        )
    
    @action(detail=True, methods=['get'])
    def licenses(self, request, pk=None):
        """Get all licenses for this license type."""
        license_type = self.get_object()
        licenses = license_type.licenses.all()
        
        serializer = LicenseSerializer(licenses, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available license types."""
        queryset = self.get_queryset().filter(is_available=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class LicenseViewSet(BaseViewSet):
    """ViewSet for Licenses."""
    
    queryset = License.objects.all()
    serializer_class = LicenseSerializer
    permission_classes = [IsAuthenticated, IsSystemAdmin]
    filterset_fields = ['status', 'license_type', 'company']
    search_fields = ['license_key', 'company__company_name', 'licensee_name', 'licensee_email']
    ordering_fields = ['issued_date', 'expiry_date', 'company__company_name', 'status']
    ordering = ['-issued_date']
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset().select_related(
            'company', 'license_type'
        )
        
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'company'):
                queryset = queryset.filter(company=self.request.user.company)
            else:
                queryset = queryset.none()
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a license."""
        license = self.get_object()
        
        if license.activate():
            send_license_expiry_notification.delay(
                license.id,
                'activated',
                f"License {license.license_key} has been activated"
            )
            
            return Response({
                'message': 'License activated successfully',
                'status': license.status,
                'activation_date': license.activation_date
            })
        else:
            return Response(
                {'error': 'License cannot be activated'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a license."""
        license = self.get_object()
        reason = request.data.get('reason', 'Suspended via API')
        
        if license.suspend(reason):
            return Response({
                'message': 'License suspended successfully',
                'status': license.status,
                'reason': reason
            })
        else:
            return Response(
                {'error': 'License cannot be suspended'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke a license."""
        license = self.get_object()
        reason = request.data.get('reason', 'Revoked via API')
        
        if license.revoke(reason):
            return Response({
                'message': 'License revoked successfully',
                'status': license.status,
                'reason': reason
            })
        else:
            return Response(
                {'error': 'License cannot be revoked'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted license."""
        license = self.get_object()
        
        if license.is_deleted:
            license.restore(user=request.user)
            return Response({
                'message': 'License restored successfully',
                'status': license.status
            })
        else:
            return Response(
                {'error': 'License is not deleted'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def validate_license(self, request, pk=None):
        """Manually validate a license."""
        license = self.get_object()

        task = validate_license_task.delay(license.id)
        
        return Response({
            'message': 'License validation queued',
            'task_id': task.id,
            'license_id': license.id
        })
    
    @action(detail=True, methods=['get'])
    def usage_report(self, request, pk=None):
        """Get detailed usage report for a license."""
        license = self.get_object()
        
        violations = license.validate_usage_limits()
        validation_result = license.validate_and_update()
        
        report = {
            'license_info': {
                'key': license.license_key,
                'type': license.license_type.name,
                'status': license.status,
                'company': license.company.company_name
            },
            'usage_statistics': {
                'current_users': license.current_users,
                'max_users': license.license_type.max_users,
                'current_branches': license.current_branches,
                'max_branches': license.license_type.max_branches,
                'monthly_transactions': license.monthly_transactions,
                'max_monthly_transactions': license.license_type.max_transactions_per_month,
                'storage_used_gb': float(license.storage_used_gb),
                'max_storage_gb': license.license_type.max_storage_gb
            },
            'violations': violations,
            'validation_result': validation_result,
            'days_until_expiry': license.days_until_expiry(),
            'generated_at': timezone.now().isoformat()
        }
        
        return Response(report)


class CompanyViewSet(BaseViewSet):
    """ViewSet for Companies."""
    
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, CanManageUsers]
    filterset_fields = ['industry', 'is_active']
    search_fields = ['company_name', 'company_name_english', 'registration_number', 'email']
    ordering_fields = ['company_name', 'established_date', 'created_at']
    ordering = ['company_name']
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset().select_related('license')
        
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'company'):
                queryset = queryset.filter(id=self.request.user.company.id)
            else:
                queryset = queryset.none()
        
        return queryset.annotate(
            branch_count=Count('branches', filter=Q(branches__is_active=True))
        )
    
    def get_serializer_class(self):
        """Return detailed serializer for retrieve action."""
        if self.action == 'retrieve':
            return CompanyDetailSerializer
        return super().get_serializer_class()
    
    @action(detail=True, methods=['get'])
    def license_status(self, request, pk=None):
        """Get comprehensive license status for a company."""
        company = self.get_object()
        license_status = company.get_license_status()
        
        return Response({
            'company': company.company_name,
            'license_status': license_status,
            'is_authorized': company.is_authorized(),
            'checked_at': timezone.now().isoformat()
        })
    
    @action(detail=True, methods=['get'])
    def branches(self, request, pk=None):
        """Get all branches for a company."""
        company = self.get_object()
        branches = company.branches.filter(is_active=True)
        
        serializer = BranchSerializer(branches, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def dashboard_stats(self, request, pk=None):
        """Get dashboard statistics for a company."""
        company = self.get_object()
        
        stats = {
            'company_info': {
                'name': company.company_name,
                'registration_number': company.registration_number,
                'established_date': company.established_date
            },
            'license_info': company.get_license_status(),
            'branch_count': company.branches.filter(is_active=True).count(),
            'total_users': 0,
            'features_available': []
        }
        
        if company.has_feature('multi_currency'):
            stats['features_available'].append('Multi-Currency')
        if company.has_feature('advanced_reporting'):
            stats['features_available'].append('Advanced Reporting')
        if company.has_feature('api_access'):
            stats['features_available'].append('API Access')
        
        return Response(stats)


class BranchViewSet(BaseViewSet):
    """ViewSet for Branches."""
    
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated, IsBranchMember]
    filterset_fields = ['company', 'is_primary', 'is_headquarters', 'country', 'city']
    search_fields = ['branch_name', 'branch_code', 'address', 'city']
    ordering_fields = ['branch_name', 'branch_code', 'city', 'created_at']
    ordering = ['company__company_name', 'branch_name']
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset().select_related(
            'company', 'manager', 'default_currency'
        )
        
        company_pk = self.kwargs.get('company_pk')
        if company_pk:
            queryset = queryset.filter(company_id=company_pk)
        
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'company'):
                queryset = queryset.filter(company=self.request.user.company)
            else:
                queryset = queryset.none()
        
        return queryset
    
    def get_serializer_class(self):
        """Return detailed serializer for retrieve action."""
        if self.action == 'retrieve':
            return BranchDetailSerializer
        return super().get_serializer_class()
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set branch as primary for the company."""
        branch = self.get_object()
        
        Branch.objects.filter(
            company=branch.company,
            is_primary=True
        ).exclude(id=branch.id).update(is_primary=False)
        
        branch.is_primary = True
        branch.save()
        
        return Response({
            'message': f'Branch {branch.branch_name} set as primary',
            'is_primary': branch.is_primary
        })
    
    @action(detail=True, methods=['post'])
    def set_headquarters(self, request, pk=None):
        """Set branch as headquarters for the company."""
        branch = self.get_object()
        
        Branch.objects.filter(
            company=branch.company,
            is_headquarters=True
        ).exclude(id=branch.id).update(is_headquarters=False)
        
        branch.is_headquarters = True
        branch.save()
        
        return Response({
            'message': f'Branch {branch.branch_name} set as headquarters',
            'is_headquarters': branch.is_headquarters
        })
    
    @action(detail=True, methods=['get'])
    def messaging_status(self, request, pk=None):
        """Get messaging service status for a branch."""
        branch = self.get_object()
        
        messaging_service = MessagingService(branch)
        status_report = messaging_service.get_messaging_status_report()
        
        return Response(status_report)


class SystemSettingsViewSet(BaseViewSet):
    """ViewSet for System Settings."""
    
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAuthenticated, HasControlPanelAccess]
    filterset_fields = ['branch']
    search_fields = ['branch__branch_name', 'branch__company__company_name']
    ordering = ['branch__company__company_name', 'branch__branch_name']
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset().select_related('branch__company')
        
        branch_pk = self.kwargs.get('branch_pk')
        if branch_pk:
            queryset = queryset.filter(branch_id=branch_pk)

        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch__company=user_branch.company)
            else:
                queryset = queryset.none()
        
        return queryset


class SystemConfigurationViewSet(BaseViewSet):
    """ViewSet for System Configuration."""
    
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer
    permission_classes = [IsAuthenticated, HasControlPanelAccess]
    filterset_fields = ['branch', 'config_type', 'is_system']
    search_fields = ['config_key', 'description', 'branch__branch_name']
    ordering_fields = ['config_key', 'config_type', 'updated_at']
    ordering = ['branch__branch_name', 'config_key']
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset().select_related('branch')
        
        branch_pk = self.kwargs.get('branch_pk')
        if branch_pk:
            queryset = queryset.filter(branch_id=branch_pk)
  
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch__company=user_branch.company)
            else:
                queryset = queryset.none()
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update configurations for a branch."""
        branch_id = request.data.get('branch_id')
        configurations = request.data.get('configurations', {})
        
        if not branch_id:
            return Response(
                {'error': 'branch_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        branch = get_object_or_404(Branch, id=branch_id)
      
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if not user_branch or branch.company != user_branch.company:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        updated_configs = []
        for key, value in configurations.items():
            config, created = SystemConfiguration.objects.update_or_create(
                branch=branch,
                config_key=key,
                defaults={
                    'config_value': str(value),
                    'config_type': 'string', 
                    'updated_by': request.user
                }
            )
            updated_configs.append({
                'key': key,
                'value': value,
                'created': created
            })
        
        return Response({
            'message': f'Updated {len(updated_configs)} configurations',
            'configurations': updated_configs
        })


class KeyboardShortcutsViewSet(BaseViewSet):
    """ViewSet for Keyboard Shortcuts."""
    
    queryset = KeyboardShortcuts.objects.all()
    serializer_class = KeyboardShortcutsSerializer
    permission_classes = [IsAuthenticated, IsBranchMember]
    filterset_fields = ['branch', 'category', 'is_enabled', 'is_global']
    search_fields = ['action_name', 'display_name', 'key_combination']
    ordering_fields = ['category', 'sort_order', 'display_name', 'priority']
    ordering = ['category', 'sort_order', 'display_name']
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset().select_related('branch')
        
        branch_pk = self.kwargs.get('branch_pk')
        if branch_pk:
            queryset = queryset.filter(branch_id=branch_pk)
   
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch__company=user_branch.company)
            else:
                queryset = queryset.none()
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get shortcuts grouped by category."""
        branch_id = request.query_params.get('branch_id')
        category = request.query_params.get('category')
        
        queryset = self.get_queryset()
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        if category:
            queryset = queryset.filter(category=category)
        
        shortcuts_by_category = {}
        for shortcut in queryset:
            cat = shortcut.category
            if cat not in shortcuts_by_category:
                shortcuts_by_category[cat] = []
            
            serializer = self.get_serializer(shortcut)
            shortcuts_by_category[cat].append(serializer.data)
        
        return Response(shortcuts_by_category)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export shortcuts configuration."""
        branch_id = request.query_params.get('branch_id')
        
        queryset = self.get_queryset()
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        shortcuts_config = []
        for shortcut in queryset:
            shortcuts_config.append(shortcut.to_javascript_config())
        
        return Response({
            'shortcuts': shortcuts_config,
            'exported_at': timezone.now().isoformat(),
            'total_shortcuts': len(shortcuts_config)
        })
    
    @action(detail=False, methods=['post'])
    def import_shortcuts(self, request):
        """Import shortcuts configuration."""
        branch_id = request.data.get('branch_id')
        shortcuts_data = request.data.get('shortcuts', [])
        
        if not branch_id:
            return Response(
                {'error': 'branch_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        branch = get_object_or_404(Branch, id=branch_id)
        
        imported_count = 0
        errors = []
        
        for shortcut_data in shortcuts_data:
            try:
                KeyboardShortcuts.objects.update_or_create(
                    branch=branch,
                    action_name=shortcut_data['action'],
                    defaults={
                        'display_name': shortcut_data.get('display_name', shortcut_data['action']),
                        'key_combination': shortcut_data['combination'],
                        'primary_key': shortcut_data['key'],
                        'modifiers': '+'.join(shortcut_data.get('modifiers', [])),
                        'context': shortcut_data.get('context'),
                        'is_enabled': shortcut_data.get('enabled', True),
                        'is_global': shortcut_data.get('global', False),
                        'javascript_function': shortcut_data.get('function'),
                        'priority': shortcut_data.get('priority', 100),
                        'created_by': request.user
                    }
                )
                imported_count += 1
            except Exception as e:
                errors.append(f"Error importing {shortcut_data.get('action', 'unknown')}: {str(e)}")
        
        return Response({
            'message': f'Imported {imported_count} shortcuts',
            'imported_count': imported_count,
            'errors': errors
        })


# Custom API Views

class LicenseValidationView(APIView):
    """API view for license validation."""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Validate a license key."""
        serializer = LicenseValidationSerializer(data=request.data)
        
        if serializer.is_valid():
            license_key = serializer.validated_data['license_key']
            hardware_fingerprint = serializer.validated_data.get('hardware_fingerprint')
            
            try:
                license = License.objects.get(license_key=license_key)

                if hardware_fingerprint:
                    license.hardware_fingerprint = hardware_fingerprint
                    license.save()
                
                validation_result = license.validate_and_update()
                
                return Response({
                    'valid': validation_result['valid'],
                    'license_info': {
                        'company': license.company.company_name,
                        'type': license.license_type.name,
                        'status': license.status,
                        'expires_in_days': license.days_until_expiry()
                    },
                    'validation_result': validation_result
                })
                
            except License.DoesNotExist:
                return Response(
                    {'valid': False, 'error': 'License not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LicenseUsageUpdateView(APIView):
    """API view for updating license usage statistics."""
    
    permission_classes = [IsAuthenticated, IsSystemAdmin]
    
    def post(self, request, license_id):
        """Update license usage statistics."""
        try:
            license = License.objects.get(id=license_id)
        except License.DoesNotExist:
            return Response(
                {'error': 'License not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = LicenseUsageUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            for field, value in serializer.validated_data.items():
                setattr(license, field, value)
            
            license.save()
            
            update_license_usage_task.delay(license.id)
            
            return Response({
                'message': 'License usage updated successfully',
                'current_usage': {
                    'users': license.current_users,
                    'branches': license.current_branches,
                    'transactions': license.monthly_transactions,
                    'storage_gb': float(license.storage_used_gb)
                }
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BranchConfigurationView(APIView):
    """API view for branch configuration management."""
    
    permission_classes = [IsAuthenticated, HasControlPanelAccess]
    
    def post(self, request, branch_id):
        """Update branch configuration."""
        try:
            branch = Branch.objects.get(id=branch_id)
        except Branch.DoesNotExist:
            return Response(
                {'error': 'Branch not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = BranchConfigurationSerializer(data=request.data)
        
        if serializer.is_valid():
            configurations = serializer.validated_data['configurations']
            
            updated_configs = []
            for key, value in configurations.items():
                config, created = SystemConfiguration.objects.update_or_create(
                    branch=branch,
                    config_key=key,
                    defaults={
                        'config_value': str(value),
                        'config_type': 'string',
                        'updated_by': request.user
                    }
                )
                updated_configs.append({
                    'key': key,
                    'value': value,
                    'created': created
                })
            
            return Response({
                'message': f'Updated {len(updated_configs)} configurations',
                'branch': branch.branch_name,
                'configurations': updated_configs
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrganizationDashboardView(APIView):
    """API view for organization dashboard data."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get organization dashboard statistics."""


        company = Company.objects.order_by('id').first()
        if not company:
            return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)

        branches = company.branches.filter(is_active=True)

        license_status = company.get_license_status()
        
        dashboard_data = {
            'company_info': {
                'name': company.company_name,
                'registration_number': company.registration_number,
                'total_branches': branches.count()
            },
            'license_info': license_status,
            'branch_summary': [],
            'system_health': {
                'messaging_enabled': False,
                'notifications_active': 0,
                'last_updated': timezone.now().isoformat()
            },
            'quick_stats': {
                'active_branches': branches.count(),
                'primary_branch': branches.filter(is_primary=True).first().branch_name if branches.filter(is_primary=True).exists() else None,
                'headquarters': branches.filter(is_headquarters=True).first().branch_name if branches.filter(is_headquarters=True).exists() else None
            }
        }
        
        for branch in branches[:5]:
            messaging_service = MessagingService(branch)
            can_send, _ = messaging_service.can_send_messages()
            
            dashboard_data['branch_summary'].append({
                'id': branch.id,
                'name': branch.branch_name,
                'code': branch.branch_code,
                'city': branch.city,
                'is_primary': branch.is_primary,
                'messaging_enabled': can_send
            })
            
            if can_send:
                dashboard_data['system_health']['messaging_enabled'] = True
        
        return Response(dashboard_data)


class LicenseReportView(APIView):
    """API view for license reports."""
    
    permission_classes = [IsAuthenticated, IsSystemAdmin]
    
    def get(self, request):
        """Get comprehensive license report."""
        cached_report = cache.get('license_report')
        if cached_report:
            return Response(cached_report)

        task = generate_license_report.delay()
        
        return Response({
            'message': 'License report generation queued',
            'task_id': task.id,
            'check_url': f'/api/reports/licenses/status/{task.id}/'
        })
    
    def post(self, request):
        """Generate custom license report with filters."""
        filters = request.data.get('filters', {})
        
        queryset = License.objects.select_related('company', 'license_type')
        
        if filters.get('status'):
            queryset = queryset.filter(status__in=filters['status'])
        
        if filters.get('license_type'):
            queryset = queryset.filter(license_type__in=filters['license_type'])
        
        if filters.get('company'):
            queryset = queryset.filter(company__in=filters['company'])
        
        if filters.get('expiring_days'):
            expiry_threshold = timezone.now() + timedelta(days=filters['expiring_days'])
            queryset = queryset.filter(
                expiry_date__lte=expiry_threshold,
                expiry_date__gte=timezone.now()
            )
        
        licenses = list(queryset)
        
        report = {
            'generated_at': timezone.now().isoformat(),
            'filters_applied': filters,
            'total_licenses': len(licenses),
            'licenses': []
        }
        
        for license in licenses:
            report['licenses'].append({
                'company': license.company.company_name,
                'license_key': license.license_key,
                'type': license.license_type.name,
                'status': license.status,
                'issued_date': license.issued_date.isoformat(),
                'expiry_date': license.expiry_date.isoformat() if license.expiry_date else None,
                'days_until_expiry': license.days_until_expiry(),
                'current_usage': {
                    'users': license.current_users,
                    'branches': license.current_branches,
                    'transactions': license.monthly_transactions,
                    'storage_gb': float(license.storage_used_gb)
                },
                'violations': license.validate_usage_limits()
            })
        
        return Response(report)
