"""
Django admin configuration for the organization application.
Provides comprehensive admin interface for managing companies, branches, licenses, and system settings.
"""

from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.utils.safestring import mark_safe
from django.db.models import Count, Q
from django.contrib import messages

from apps.organization.models import (
    LicenseType, License, Company, Branch, 
    SystemSettings, SystemConfiguration, KeyboardShortcuts
)


class LicenseStatusFilter(SimpleListFilter):
    """Filter licenses by status."""
    title = _('License Status')
    parameter_name = 'license_status'

    def lookups(self, request, model_admin):
        return License.LICENSE_STATUS_CHOICES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(status=self.value())
        return queryset


class ExpiryFilter(SimpleListFilter):
    """Filter licenses by expiry status."""
    title = _('Expiry Status')
    parameter_name = 'expiry_status'

    def lookups(self, request, model_admin):
        return [
            ('expired', _('Expired')),
            ('expiring_soon', _('Expiring Soon (30 days)')),
            ('expiring_week', _('Expiring This Week')),
            ('never_expires', _('Never Expires')),
        ]

    def queryset(self, request, queryset):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        
        if self.value() == 'expired':
            return queryset.filter(expiry_date__lt=now)
        elif self.value() == 'expiring_soon':
            return queryset.filter(
                expiry_date__gte=now,
                expiry_date__lte=now + timedelta(days=30)
            )
        elif self.value() == 'expiring_week':
            return queryset.filter(
                expiry_date__gte=now,
                expiry_date__lte=now + timedelta(days=7)
            )
        elif self.value() == 'never_expires':
            return queryset.filter(expiry_date__isnull=True)
        return queryset


@admin.register(LicenseType)
class LicenseTypeAdmin(admin.ModelAdmin):
    """Admin interface for License Types."""
    
    list_display = [
        'name', 'category', 'max_users', 'max_branches', 
        'monthly_price', 'yearly_price', 'is_available', 'created_at'
    ]
    list_filter = ['category', 'is_available', 'allow_multi_currency', 'allow_api_access']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'category', 'description', 'is_available')
        }),
        (_('Usage Limits'), {
            'fields': (
                'max_users', 'max_branches', 
                'max_transactions_per_month', 'max_storage_gb'
            )
        }),
        (_('Features'), {
            'fields': (
                'allow_multi_currency', 'allow_advanced_reporting',
                'allow_api_access', 'allow_integrations',
                'allow_custom_fields', 'allow_workflow_automation'
            )
        }),
        (_('Support & Pricing'), {
            'fields': ('support_level', 'monthly_price', 'yearly_price')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            license_count=Count('licenses')
        )


@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    """Admin interface for Licenses."""
    
    list_display = [
        'company', 'license_type', 'status_badge', 'expiry_info',
        'current_users', 'current_branches', 'violation_count', 'last_validated'
    ]
    list_filter = [
        LicenseStatusFilter, ExpiryFilter, 'license_type__category',
        'license_type', 'violation_count'
    ]
    search_fields = [
        'company__company_name', 'license_key', 'licensee_name', 'licensee_email'
    ]
    readonly_fields = [
        'id', 'license_hash', 'issued_date', 'last_validated',
        'created_at', 'updated_at', 'usage_summary'
    ]
    
    fieldsets = (
        (_('License Information'), {
            'fields': (
                'company', 'license_type', 'license_key', 'license_hash',
                'licensee_name', 'licensee_email'
            )
        }),
        (_('Status & Validity'), {
            'fields': (
                'status', 'issued_date', 'activation_date', 
                'expiry_date', 'last_validated'
            )
        }),
        (_('Usage Statistics'), {
            'fields': (
                'current_users', 'current_branches', 'monthly_transactions',
                'storage_used_gb', 'usage_summary'
            )
        }),
        (_('Security & Violations'), {
            'fields': (
                'hardware_fingerprint', 'violation_count', 
                'last_violation_date'
            )
        }),
        (_('Additional Data'), {
            'fields': ('license_data', 'notes'),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['activate_licenses', 'suspend_licenses', 'validate_licenses']
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'active': 'green',
            'trial': 'blue',
            'pending': 'orange',
            'expired': 'red',
            'suspended': 'red',
            'revoked': 'darkred'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def expiry_info(self, obj):
        """Display expiry information."""
        if not obj.expiry_date:
            return format_html('<span style="color: green;">Never expires</span>')
        
        days_left = obj.days_until_expiry()
        if days_left is None:
            return '-'
        
        if days_left <= 0:
            return format_html('<span style="color: red;">Expired</span>')
        elif days_left <= 7:
            return format_html('<span style="color: red;">{} days left</span>', days_left)
        elif days_left <= 30:
            return format_html('<span style="color: orange;">{} days left</span>', days_left)
        else:
            return format_html('<span style="color: green;">{} days left</span>', days_left)
    expiry_info.short_description = _('Expiry')
    
    def usage_summary(self, obj):
        """Display usage summary."""
        violations = obj.validate_usage_limits()
        summary = []
        
        if obj.license_type.max_users:
            status = "⚠️" if violations.get('users', False) else "✅"
            summary.append(f"{status} Users: {obj.current_users}/{obj.license_type.max_users}")
        
        if obj.license_type.max_branches:
            status = "⚠️" if violations.get('branches', False) else "✅"
            summary.append(f"{status} Branches: {obj.current_branches}/{obj.license_type.max_branches}")
        
        return mark_safe('<br>'.join(summary))
    usage_summary.short_description = _('Usage Summary')
    
    def activate_licenses(self, request, queryset):
        """Activate selected licenses."""
        activated = 0
        for license in queryset:
            if license.activate():
                activated += 1
        
        self.message_user(
            request,
            f"Successfully activated {activated} license(s).",
            messages.SUCCESS
        )
    activate_licenses.short_description = _("Activate selected licenses")
    
    def suspend_licenses(self, request, queryset):
        """Suspend selected licenses."""
        suspended = 0
        for license in queryset:
            if license.suspend("Suspended via admin action"):
                suspended += 1
        
        self.message_user(
            request,
            f"Successfully suspended {suspended} license(s).",
            messages.WARNING
        )
    suspend_licenses.short_description = _("Suspend selected licenses")
    
    def validate_licenses(self, request, queryset):
        """Validate selected licenses."""
        for license in queryset:
            license.validate_and_update()
        
        self.message_user(
            request,
            f"Validated {queryset.count()} license(s).",
            messages.INFO
        )
    validate_licenses.short_description = _("Validate selected licenses")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin interface for Companies."""
    
    list_display = [
        'company_name', 'registration_number', 'email', 
        'license_status', 'branch_count', 'established_date', 'is_active'
    ]
    list_filter = ['industry', 'is_active', 'established_date']
    search_fields = [
        'company_name', 'company_name_english', 'registration_number', 
        'tax_id', 'email'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at', 'license_info']
    
    fieldsets = (
        (_('Company Information'), {
            'fields': (
                'company_name', 'company_name_english', 
                'registration_number', 'tax_id'
            )
        }),
        (_('Contact Information'), {
            'fields': ('email', 'phone_number', 'address', 'website')
        }),
        (_('Business Information'), {
            'fields': ('industry', 'established_date', 'description')
        }),
        (_('Branding'), {
            'fields': ('logo',)
        }),
        (_('License Information'), {
            'fields': ('license_info',),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def license_status(self, obj):
        """Display license status."""
        try:
            license = obj.license
            return self.get_license_badge(license.status)
        except License.DoesNotExist:
            return format_html('<span style="color: red;">No License</span>')
    license_status.short_description = _('License Status')
    
    def license_info(self, obj):
        """Display detailed license information."""
        try:
            license = obj.license
            info = [
                f"Type: {license.license_type.name}",
                f"Status: {license.get_status_display()}",
                f"Key: {license.license_key}",
            ]
            if license.expiry_date:
                info.append(f"Expires: {license.expiry_date.strftime('%Y-%m-%d')}")
            
            return mark_safe('<br>'.join(info))
        except License.DoesNotExist:
            return "No license assigned"
    license_info.short_description = _('License Details')
    
    def branch_count(self, obj):
        """Display number of branches."""
        return obj.branches.filter(is_active=True).count()
    branch_count.short_description = _('Active Branches')
    
    def get_license_badge(self, status):
        """Get colored badge for license status."""
        colors = {
            'active': 'green',
            'trial': 'blue',
            'pending': 'orange',
            'expired': 'red',
            'suspended': 'red',
            'revoked': 'darkred'
        }
        color = colors.get(status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, status.title()
        )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('license').annotate(
            branch_count=Count('branches', filter=Q(branches__is_active=True))
        )


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    """Admin interface for Branches."""
    
    list_display = [
        'branch_name', 'company', 'branch_code', 'city', 'country',
        'is_primary', 'is_headquarters', 'manager', 'is_active'
    ]
    list_filter = [
        'company', 'is_primary', 'is_headquarters', 'is_active',
        'country', 'city', 'use_multi_currency'
    ]
    search_fields = [
        'branch_name', 'branch_name_english', 'branch_code',
        'company__company_name', 'city', 'address'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'company', 'branch_code', 'branch_name', 'branch_name_english',
                'is_primary', 'is_headquarters', 'manager'
            )
        }),
        (_('Contact Information'), {
            'fields': (
                'email', 'phone_number', 'fax_number', 'address',
                'city', 'state_province', 'country', 'postal_code'
            )
        }),
        (_('Business Settings'), {
            'fields': (
                'fiscal_year_start_month', 'fiscal_year_end_month',
                'current_fiscal_year', 'default_currency', 'timezone'
            )
        }),
        (_('Feature Settings'), {
            'fields': (
                'use_cost_center', 'use_sales_tax', 'use_vat_tax',
                'use_carry_fee', 'use_expire_date', 'use_batch_no',
                'use_barcode', 'use_multi_currency'
            )
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'company', 'manager', 'default_currency'
        )


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    """Admin interface for System Settings."""
    
    list_display = [
        'branch', 'session_timeout', 'max_login_attempts',
        'enable_email_notifications', 'enable_sms_notifications',
        'require_two_factor_auth'
    ]
    list_filter = [
        'enable_email_notifications', 'enable_sms_notifications',
        'enable_whatsapp_notifications', 'require_two_factor_auth',
        'show_warnings', 'check_sales_price'
    ]
    search_fields = ['branch__branch_name', 'branch__company__company_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Branch'), {
            'fields': ('branch',)
        }),
        (_('Database Settings'), {
            'fields': (
                'database_server', 'database_name',
                'database_username', 'database_password'
            ),
            'classes': ('collapse',)
        }),
        (_('System Settings'), {
            'fields': (
                'connection_timeout', 'session_timeout',
                'max_login_attempts', 'account_lockout_duration'
            )
        }),
        (_('Display Settings'), {
            'fields': (
                'show_warnings', 'check_sales_price', 'enable_photo_storage'
            )
        }),
        (_('File Paths'), {
            'fields': ('reports_path', 'backup_path'),
            'classes': ('collapse',)
        }),
        (_('Notification Settings'), {
            'fields': (
                'enable_email_notifications', 'enable_sms_notifications',
                'enable_whatsapp_notifications', 'enable_in_app_notifications',
                'enable_push_notifications'
            )
        }),
        (_('Security Settings'), {
            'fields': (
                'require_two_factor_auth', 'password_expiry_days',
                'minimum_password_length'
            )
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    """Admin interface for System Configuration."""
    
    list_display = [
        'config_key', 'branch', 'config_type', 'is_system', 'updated_at'
    ]
    list_filter = ['config_type', 'is_system', 'branch']
    search_fields = ['config_key', 'description', 'branch__branch_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Configuration'), {
            'fields': ('branch', 'config_key', 'config_value', 'config_type')
        }),
        (_('Details'), {
            'fields': ('description', 'is_system')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(KeyboardShortcuts)
class KeyboardShortcutsAdmin(admin.ModelAdmin):
    """Admin interface for Keyboard Shortcuts."""
    
    list_display = [
        'display_name', 'key_combination', 'category', 'branch',
        'is_enabled', 'is_global', 'priority'
    ]
    list_filter = [
        'category', 'is_enabled', 'is_global', 'is_system_default',
        'is_customizable', 'branch'
    ]
    search_fields = [
        'action_name', 'display_name', 'key_combination',
        'description', 'branch__branch_name'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'branch', 'action_name', 'display_name', 'description', 'category'
            )
        }),
        (_('Keyboard Combination'), {
            'fields': (
                'key_combination', 'primary_key', 'modifiers',
                'alternative_combination'
            )
        }),
        (_('Configuration'), {
            'fields': (
                'is_enabled', 'is_system_default', 'is_customizable',
                'is_global', 'priority', 'sort_order'
            )
        }),
        (_('Context & Scope'), {
            'fields': ('context', 'page_url_pattern'),
            'classes': ('collapse',)
        }),
        (_('JavaScript Function'), {
            'fields': ('javascript_function',),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('branch')

