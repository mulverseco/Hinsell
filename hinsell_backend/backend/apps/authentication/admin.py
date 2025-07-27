"""
Django admin configuration for authentication app.
Provides comprehensive admin interface for user and security management.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from .models import UserProfile, AuditLog, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Enhanced user admin with comprehensive features.
    """
    list_display = [
        'username', 'get_full_name', 'employee_id', 'email_display',
        'is_active', 'is_staff', 'is_superuser', 'default_branch',
        'last_login', 'failed_login_attempts', 'account_status'
    ]
    
    list_filter = [
        'is_active', 'is_staff', 'is_superuser', 'is_two_factor_enabled',
        'default_branch', 'use_control_panel', 'use_reports',
        'use_ledger_system', 'use_inventory_system',
        'use_purchase_system', 'use_sales_system',
        'created_at', 'last_login'
    ]
    
    search_fields = [
        'username', 'first_name', 'last_name', 'employee_id',
        'profile__email', 'profile__phone_number'
    ]
    
    ordering = ['-created_at']
    
    readonly_fields = [
        'created_at', 'updated_at', 'last_login',
        'password_changed_at', 'failed_login_attempts',
        'account_locked_until', 'last_login_device', 'last_login_ip'
    ]
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'employee_id')
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            ),
        }),
        (_('System Access'), {
            'fields': (
                'use_control_panel', 'use_reports', 'use_ledger_system',
                'use_inventory_system', 'use_purchase_system', 'use_sales_system'
            ),
        }),
        (_('Display Settings'), {
            'fields': ('hide_cost', 'hide_comment', 'user_discount_ratio'),
        }),
        (_('Security'), {
            'fields': (
                'is_two_factor_enabled', 'failed_login_attempts',
                'account_locked_until', 'password_changed_at'
            ),
        }),
        (_('Branch & Location'), {
            'fields': ('default_branch',),
        }),
        (_('Login Information'), {
            'fields': ('last_login', 'last_login_device', 'last_login_ip'),
        }),
        (_('Important dates'), {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'password1', 'password2',
                'first_name', 'last_name', 'employee_id',
                'default_branch'
            ),
        }),
    )
    
    actions = [
        'activate_users', 'deactivate_users', 'lock_accounts',
        'unlock_accounts', 'reset_failed_attempts', 'send_welcome_email'
    ]
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name()
    get_full_name.short_description = _('Full Name')
    
    def email_display(self, obj):
        """Display user's email from profile."""
        if hasattr(obj, 'profile') and obj.profile.email:
            return obj.profile.email
        return '-'
    email_display.short_description = _('Email')
    
    def account_status(self, obj):
        """Display account status with visual indicators."""
        if not obj.is_active:
            return format_html(
                '<span style="color: red;">●</span> Inactive'
            )
        elif obj.is_account_locked():
            return format_html(
                '<span style="color: orange;">●</span> Locked'
            )
        else:
            return format_html(
                '<span style="color: green;">●</span> Active'
            )
    account_status.short_description = _('Status')
    
    def activate_users(self, request, queryset):
        """Activate selected users."""
        count = queryset.update(is_active=True)
        self.message_user(
            request,
            f'{count} users were successfully activated.'
        )
    activate_users.short_description = _('Activate selected users')
    
    def deactivate_users(self, request, queryset):
        """Deactivate selected users."""
        # Prevent deactivating superusers
        queryset = queryset.exclude(is_superuser=True)
        count = queryset.update(is_active=False)
        self.message_user(
            request,
            f'{count} users were successfully deactivated.'
        )
    deactivate_users.short_description = _('Deactivate selected users')
    
    def lock_accounts(self, request, queryset):
        """Lock selected user accounts."""
        count = 0
        for user in queryset:
            if not user.is_superuser:
                user.lock_account(30)  # Lock for 30 minutes
                count += 1
        
        self.message_user(
            request,
            f'{count} user accounts were successfully locked.'
        )
    lock_accounts.short_description = _('Lock selected accounts')
    
    def unlock_accounts(self, request, queryset):
        """Unlock selected user accounts."""
        count = 0
        for user in queryset:
            user.unlock_account()
            count += 1
        
        self.message_user(
            request,
            f'{count} user accounts were successfully unlocked.'
        )
    unlock_accounts.short_description = _('Unlock selected accounts')
    
    def reset_failed_attempts(self, request, queryset):
        """Reset failed login attempts for selected users."""
        count = queryset.update(failed_login_attempts=0)
        self.message_user(
            request,
            f'Failed login attempts reset for {count} users.'
        )
    reset_failed_attempts.short_description = _('Reset failed login attempts')
    
    def send_welcome_email(self, request, queryset):
        """Send welcome email to selected users."""
        from .tasks import send_welcome_email
        
        count = 0
        for user in queryset:
            if hasattr(user, 'profile') and user.profile.email:
                send_welcome_email.delay(user.id)
                count += 1
        
        self.message_user(
            request,
            f'Welcome emails queued for {count} users.'
        )
    send_welcome_email.short_description = _('Send welcome email')


class UserProfileInline(admin.StackedInline):
    """
    Inline admin for user profile.
    """
    model = UserProfile
    fk_name = 'user'
    can_delete = False
    verbose_name_plural = _('Profile')
    
    fields = [
        'avatar', 'bio', 'email', 'phone_number', 'address',
        'nationality', 'date_of_birth', 'gender',
        'emergency_contact_name', 'emergency_contact_phone',
        'enable_whatsapp_notifications', 'enable_email_notifications',
        'enable_sms_notifications', 'profile_visibility'
    ]


# Add profile inline to user admin
UserAdmin.inlines = [UserProfileInline]


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for user profiles.
    """
    list_display = [
        'user', 'email', 'phone_number', 'nationality',
        'profile_visibility', 'has_complete_profile',
        'notification_preferences','created_at'
    ]
    
    list_filter = [
        'gender', 'nationality', 'profile_visibility', 
        'created_at'
    ]
    
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'email', 'phone_number', 'nationality'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('User'), {
            'fields': ('user',)
        }),
        (_('Contact Information'), {
            'fields': ('email', 'phone_number', 'address')
        }),
        (_('Personal Information'), {
            'fields': (
                'bio', 'nationality', 'date_of_birth', 'gender',
                'avatar'
            )
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact_name', 'emergency_contact_phone')
        }),
        (_('Notification Preferences'), {
            'fields': (
                'enable_whatsapp_notifications', 'enable_sms_notifications',
                'enable_email_notifications'
            )
        }),
        (_('Privacy'), {
            'fields': ('profile_visibility',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def has_complete_profile(self, obj):
        """Check if profile is complete."""
        return obj.has_complete_profile()
    has_complete_profile.boolean = True
    has_complete_profile.short_description = _('Complete Profile')
    
    def notification_preferences(self, obj):
        """Display notification preferences."""
        prefs = []
        if obj.enable_email_notifications:
            prefs.append('Email')
        if obj.enable_sms_notifications:
            prefs.append('SMS')
        if obj.enable_whatsapp_notifications:
            prefs.append('WhatsApp')
        
        return ', '.join(prefs) if prefs else 'None'
    notification_preferences.short_description = _('Notifications')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Admin interface for audit logs with security monitoring features.
    """
    list_display = [
        'created_at', 'user_display', 'action_type', 'login_status',
        'ip_address', 'device_type', 'risk_level', 'is_suspicious',
        'branch_display'
    ]
    
    list_filter = [
        'action_type', 'login_status', 'risk_level', 'is_suspicious',
        'device_type', 'branch', 'created_at'
    ]
    
    search_fields = [
        'username', 'ip_address', 'user_agent', 'computer_name',
        'screen_name', 'user__username', 'user__first_name', 'user__last_name'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'risk_score', 'risk_level'
    ]
    
    ordering = ['-created_at']
    
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'branch', 'user', 'action_type', 'username',
                'created_at'
            )
        }),
        (_('Network Information'), {
            'fields': (
                'ip_address', 'user_agent', 'device_type',
                'country', 'city'
            )
        }),
        (_('Session Information'), {
            'fields': (
                'login_status', 'session_id', 'computer_name',
                'screen_name'
            )
        }),
        (_('Risk Assessment'), {
            'fields': (
                'risk_score', 'risk_level', 'is_suspicious'
            )
        }),
        (_('Additional Details'), {
            'fields': ('details',),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'mark_as_suspicious', 'mark_as_safe', 'export_logs'
    ]
    
    def user_display(self, obj):
        """Display user with link to user admin."""
        if obj.user:
            url = reverse('admin:authentication_user_change', args=[obj.user.id])
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.user.get_full_name()
            )
        return obj.username or '-'
    user_display.short_description = _('User')
    
    def branch_display(self, obj):
        """Display branch with link to branch admin."""
        if obj.branch:
            url = reverse('admin:company_branch_change', args=[obj.branch.id])
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.branch.branch_name
            )
        return '-'
    branch_display.short_description = _('Branch')
    
    def mark_as_suspicious(self, request, queryset):
        """Mark selected logs as suspicious."""
        count = queryset.update(is_suspicious=True)
        self.message_user(
            request,
            f'{count} audit logs marked as suspicious.'
        )
    mark_as_suspicious.short_description = _('Mark as suspicious')
    
    def mark_as_safe(self, request, queryset):
        """Mark selected logs as safe."""
        count = queryset.update(is_suspicious=False)
        self.message_user(
            request,
            f'{count} audit logs marked as safe.'
        )
    mark_as_safe.short_description = _('Mark as safe')
    
    def export_logs(self, request, queryset):
        """Export selected logs to CSV."""
        # This would implement CSV export functionality
        self.message_user(
            request,
            f'Export functionality would be implemented here for {queryset.count()} logs.'
        )
    export_logs.short_description = _('Export selected logs')
    
    def has_add_permission(self, request):
        """Disable adding audit logs through admin."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable changing audit logs through admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete audit logs."""
        return request.user.is_superuser


# Customize admin site
admin.site.site_header = _('Pharsy Management')
admin.site.site_title = _('Pharsy Admin')
admin.site.index_title = _('Welcome to Pharsy Management Administration')
