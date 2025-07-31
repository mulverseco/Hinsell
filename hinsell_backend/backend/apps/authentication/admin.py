from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from apps.authentication.models import User, UserProfile, AuditLog
from apps.core_apps.utils import Logger
from apps.authentication.services import AuthenticationService

logger = Logger(__name__)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'user_type', 'is_active', 'default_branch', 'last_login']
    list_filter = ['user_type', 'is_active', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'password_changed_at', 'last_login_ip']
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'user_type', 'code')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Security'), {'fields': ('is_two_factor_enabled', 'failed_login_attempts', 'account_locked_until')}),
        (_('E-commerce'), {'fields': ('hide_cost', 'hide_comment', 'user_discount_ratio', 'loyalty_points')}),
        (_('Organization'), {'fields': ('default_branch',)}),
        (_('Metadata'), {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'last_login_ip', 'last_login_device')}),
    )
    actions = ['unlock_accounts', 'reset_failed_logins']

    def unlock_accounts(self, request, queryset):
        for user in queryset:
            AuthenticationService.unlock_account(user)
        self.message_user(request, _("Selected accounts have been unlocked."))
    unlock_accounts.short_description = _("Unlock selected accounts")

    def reset_failed_logins(self, request, queryset):
        for user in queryset:
            AuthenticationService.reset_failed_logins(user)
        self.message_user(request, _("Failed login attempts reset for selected users."))
    reset_failed_logins.short_description = _("Reset failed login attempts")

    def save_model(self, request, obj, form, change):
        logger.info(
            f"Admin saving user: {obj.username}",
            extra={'user_id': obj.id, 'user_type': obj.user_type, 'change': change}
        )
        super().save_model(request, obj, form, change)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'profile_visibility', 'terms_accepted', 'marketing_opt_in']
    list_filter = ['profile_visibility', 'terms_accepted', 'marketing_opt_in']
    search_fields = ['user__username', 'user__email', 'phone_number']
    readonly_fields = ['id', 'created_at', 'updated_at', 'terms_accepted_at']
    fieldsets = (
        (None, {'fields': ('user',)}),
        (_('Personal Info'), {'fields': ('avatar', 'bio', 'phone_number', 'address', 'nationality', 'date_of_birth', 'gender')}),
        (_('Preferences'), {'fields': ('notifications', 'profile_visibility', 'preferred_payment_method', 'marketing_opt_in')}),
        (_('Compliance'), {'fields': ('terms_accepted', 'terms_accepted_at', 'terms_version', 'data_consent')}),
        (_('Metadata'), {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )

    def save_model(self, request, obj, form, change):
        logger.info(
            f"Admin saving profile for user: {obj.user.username}",
            extra={'user_id': obj.user.id, 'user_type': obj.user.user_type, 'change': change}
        )
        super().save_model(request, obj, form, change)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action_type', 'login_status', 'risk_level', 'created_at']
    list_filter = ['action_type', 'login_status', 'risk_level', 'created_at']
    search_fields = ['user__username', 'user__email', 'username', 'ip_address']
    readonly_fields = ['id', 'created_at', 'updated_at', 'risk_score', 'risk_level']
    fieldsets = (
        (None, {'fields': ('user', 'branch', 'action_type', 'username')}),
        (_('Details'), {'fields': ('ip_address', 'user_agent', 'device_type', 'login_status', 'session_id', 'country', 'city', 'details')}),
        (_('Risk'), {'fields': ('risk_score', 'risk_level')}),
        (_('Metadata'), {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )