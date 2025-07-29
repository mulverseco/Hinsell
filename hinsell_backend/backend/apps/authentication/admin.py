from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, AuditLog


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Admin configuration for the User model.
    """
    list_display = (
        'username',
        'email',
        'user_type',
        'first_name',
        'last_name',
        'is_active',
        'is_staff',
        'is_superuser',
        'created_at',
        'last_login',
    )
    list_filter = (
        'user_type',
        'is_active',
        'is_staff',
        'is_superuser',
        'is_two_factor_enabled',
        'created_at',
    )
    search_fields = ('username', 'email', 'first_name', 'last_name', 'code')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'password_changed_at',
        'last_login_ip',
        'last_login_device',
        'failed_login_attempts',
        'account_locked_until',
    )
    fieldsets = (
        (_('Personal Information'), {
            'fields': ('username', 'email', 'first_name', 'last_name', 'user_type')
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('Security'), {
            'fields': ('is_two_factor_enabled', 'failed_login_attempts', 'account_locked_until', 'password_changed_at')
        }),
        (_('Employee Information'), {
            'fields': ('code', 'hide_cost', 'hide_comment', 'user_discount_ratio', 'loyalty_points', 'default_branch')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'last_login', 'last_login_ip', 'last_login_device')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all users, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log user creation or update in audit log."""
        from .models import AuditLog
        super().save_model(request, obj, form, change)
        action_type = AuditLog.ActionType.PROFILE_UPDATE if change else AuditLog.ActionType.SYSTEM_ACCESS
        AuditLog.objects.create(
            branch=obj.default_branch,
            user=obj,
            action_type=action_type,
            username=obj.username,
            details={
                'changed_by': request.user.username,
                'user_type': obj.user_type,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for the UserProfile model.
    """
    list_display = (
        'user',
        'email',
        'phone_number',
        'profile_visibility',
        'preferred_payment_method',
        'marketing_opt_in',
        'terms_accepted',
        'created_at',
    )
    list_filter = (
        'profile_visibility',
        'preferred_payment_method',
        'marketing_opt_in',
        'terms_accepted',
        'created_at',
    )
    search_fields = ('user__username', 'user__email', 'email', 'phone_number', 'bio')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'terms_accepted_at',
    )
    fieldsets = (
        (_('User Information'), {
            'fields': ('user', 'avatar', 'bio', 'email', 'phone_number', 'address')
        }),
        (_('Personal Details'), {
            'fields': ('nationality', 'date_of_birth', 'gender')
        }),
        (_('Preferences'), {
            'fields': ('profile_visibility', 'preferred_payment_method', 'notifications', 'marketing_opt_in')
        }),
        (_('Compliance'), {
            'fields': ('terms_accepted', 'terms_accepted_at', 'terms_version', 'data_consent')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all profiles, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log profile updates in audit log."""
        from .models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.user.default_branch,
            user=obj.user,
            action_type=AuditLog.ActionType.PROFILE_UPDATE,
            username=obj.user.username,
            details={
                'changed_by': request.user.username,
                'user_type': obj.user.user_type,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Admin configuration for the AuditLog model.
    """
    list_display = (
        'user',
        'action_type',
        'login_status',
        'risk_level',
        'ip_address',
        'device_type',
        'created_at',
    )
    list_filter = (
        'action_type',
        'login_status',
        'risk_level',
        'created_at',
        'branch',
    )
    search_fields = (
        'user__username',
        'user__email',
        'username',
        'ip_address',
        'user_agent',
        'device_type',
        'country',
        'city',
    )
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'risk_score',
        'risk_level',
        'device_type',
    )
    fieldsets = (
        (_('Audit Information'), {
            'fields': ('user', 'branch', 'action_type', 'username', 'login_status')
        }),
        (_('Security Details'), {
            'fields': ('ip_address', 'user_agent', 'device_type', 'session_id', 'country', 'city')
        }),
        (_('Risk Assessment'), {
            'fields': ('risk_score', 'risk_level')
        }),
        (_('Additional Information'), {
            'fields': ('details',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all audit logs, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def has_add_permission(self, request):
        """Prevent manual creation of audit logs."""
        return False

    def has_change_permission(self, request, obj=None):
        """Prevent manual updates to audit logs."""
        return False
# Customize admin site
admin.site.site_header = _('Hinsell Management')
admin.site.site_title = _('Hinsell Admin')
admin.site.index_title = _('Welcome to Hinsell Management Administration')
