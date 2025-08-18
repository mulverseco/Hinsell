from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from apps.organization.models import LicenseType, License, Company, Branch, SystemSettings, KeyboardShortcuts
from apps.authentication.services import AuditService
from apps.core_apps.utils import Logger

logger = Logger(__name__)

@admin.register(LicenseType)
class LicenseTypeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'max_users', 'max_branches', 'monthly_price', 'is_available', 'is_active', 'is_deleted']
    list_filter = ['category', 'is_available', 'support_level', 'is_active', 'is_deleted']
    search_fields = ['code', 'name', 'description']
    list_editable = ['is_available', 'is_active']
    ordering = ['category', 'name']
    fieldsets = (
        (None, {
            'fields': ('code', 'name', 'category', 'description')
        }),
        (_('Limits'), {
            'fields': ('max_users', 'max_branches', 'max_transactions_per_month', 'max_storage_gb')
        }),
        (_('Features'), {
            'fields': (
                'allow_multi_currency', 'allow_advanced_reporting', 'allow_api_access',
                'allow_integrations', 'allow_custom_fields', 'allow_workflow_automation'
            )
        }),
        (_('Pricing & Support'), {
            'fields': ('monthly_price', 'yearly_price', 'support_level')
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_deleted', 'deleted_at')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']
    actions = ['soft_delete_selected', 'restore_selected']

    def soft_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.soft_delete(user=request.user)
        self.message_user(request, _("Selected license types soft deleted."))
    soft_delete_selected.short_description = _("Soft delete selected license types")

    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore(user=request.user)
        self.message_user(request, _("Selected license types restored."))
    restore_selected.short_description = _("Restore selected license types")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        AuditService.create_audit_log(
            branch=None,
            user=request.user,
            action_type='license_type_updated' if change else 'license_type_created',
            username=request.user.username,
            details={'license_type_code': obj.code, 'name': obj.name}
        )
        logger.info(f"{'Updated' if change else 'Created'} license type: {obj.code}", extra={'user_id': request.user.id})

@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ['code', 'company', 'license_type', 'status', 'issued_date', 'expiry_date', 'violation_count', 'is_active', 'is_deleted']
    list_filter = ['status', 'license_type__category', 'is_active', 'is_deleted']
    search_fields = ['code', 'license_key', 'licensee_name', 'licensee_email']
    list_editable = ['status']
    ordering = ['-issued_date']
    fieldsets = (
        (None, {
            'fields': ('code', 'license_key', 'license_type', 'company', 'status')
        }),
        (_('Details'), {
            'fields': ('licensee_name', 'licensee_email', 'notes')
        }),
        (_('Usage'), {
            'fields': ('current_users', 'current_branches', 'monthly_transactions', 'storage_used_gb')
        }),
        (_('Validation'), {
            'fields': ('hardware_fingerprint', 'license_data', 'violation_count', 'last_violation_date')
        }),
        (_('Dates'), {
            'fields': ('issued_date', 'activation_date', 'expiry_date', 'last_validated')
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_deleted', 'deleted_at')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ['id', 'license_hash', 'issued_date', 'last_validated', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']
    actions = ['soft_delete_selected', 'restore_selected']

    def soft_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.soft_delete(user=request.user)
        self.message_user(request, _("Selected licenses soft deleted."))
    soft_delete_selected.short_description = _("Soft delete selected licenses")

    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore(user=request.user)
        self.message_user(request, _("Selected licenses restored."))
    restore_selected.short_description = _("Restore selected licenses")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
            obj.license_key = obj.generate_license_key()
            obj.license_hash = obj.generate_license_hash(obj.license_key)
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        obj.validate_and_update()
        AuditService.create_audit_log(
            branch=obj.company.branches.filter(is_primary=True).first(),
            user=request.user,
            action_type='license_updated' if change else 'license_created',
            username=request.user.username,
            details={'code': obj.code, 'company': obj.company.company_name}
        )
        logger.info(f"{'Updated' if change else 'Created'} license: {obj.code}", extra={'user_id': request.user.id})

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['code', 'company_name', 'email', 'phone_number', 'is_authorized', 'is_active', 'is_deleted']
    list_filter = ['industry', 'is_active', 'is_deleted']
    search_fields = ['code', 'company_name', 'registration_number', 'tax_id', 'email']
    ordering = ['company_name']
    fieldsets = (
        (None, {
            'fields': ('code', 'company_name', 'company_name_english')
        }),
        (_('Details'), {
            'fields': ('registration_number', 'tax_id', 'email', 'phone_number', 'address', 'website', 'industry', 'established_date', 'description')
        }),
        (_('Media'), {
            'fields': ('logo',)
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_deleted', 'deleted_at')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']
    actions = ['soft_delete_selected', 'restore_selected']

    def soft_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.soft_delete(user=request.user)
        self.message_user(request, _("Selected companies soft deleted."))
    soft_delete_selected.short_description = _("Soft delete selected companies")

    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore(user=request.user)
        self.message_user(request, _("Selected companies restored."))
    restore_selected.short_description = _("Restore selected companies")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        AuditService.create_audit_log(
            branch=None,
            user=request.user,
            action_type='company_updated' if change else 'company_created',
            username=request.user.username,
            details={'company_code': obj.code, 'name': obj.company_name}
        )
        logger.info(f"{'Updated' if change else 'Created'} company: {obj.company_name}", extra={'user_id': request.user.id})

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['code', 'branch_name', 'company', 'is_primary', 'is_headquarters', 'email', 'is_active', 'is_deleted']
    list_filter = ['company', 'is_primary', 'is_headquarters', 'use_multi_currency', 'is_active', 'is_deleted']
    search_fields = ['code', 'branch_name', 'email', 'phone_number']
    list_editable = ['is_primary', 'is_headquarters']
    ordering = ['company', 'branch_name']
    fieldsets = (
        (None, {
            'fields': ('company', 'code', 'branch_name', 'branch_name_english')
        }),
        (_('Status'), {
            'fields': ('is_primary', 'is_headquarters', 'is_active', 'is_deleted', 'deleted_at')
        }),
        (_('Contact'), {
            'fields': ('email', 'phone_number', 'fax_number', 'address', 'city', 'state_province', 'country', 'postal_code')
        }),
        (_('Settings'), {
            'fields': (
                'fiscal_year_start_month', 'fiscal_year_end_month', 'current_fiscal_year',
                'use_cost_center', 'use_sales_tax', 'use_vat_tax', 'use_carry_fee',
                'use_expire_date', 'use_batch_no', 'use_barcode', 'use_multi_currency'
            )
        }),
        (_('Management'), {
            'fields': ('default_currency', 'manager', 'timezone')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']
    actions = ['soft_delete_selected', 'restore_selected']

    def soft_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.soft_delete(user=request.user)
        self.message_user(request, _("Selected branches soft deleted."))
    soft_delete_selected.short_description = _("Soft delete selected branches")

    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore(user=request.user)
        self.message_user(request, _("Selected branches restored."))
    restore_selected.short_description = _("Restore selected branches")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        AuditService.create_audit_log(
            branch=obj,
            user=request.user,
            action_type='branch_updated' if change else 'branch_created',
            username=request.user.username,
            details={'code': obj.code, 'name': obj.branch_name}
        )
        logger.info(f"{'Updated' if change else 'Created'} branch: {obj.branch_name}", extra={'user_id': request.user.id})

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['branch', 'connection_timeout', 'session_timeout', 'max_login_attempts', 'require_two_factor_auth', 'is_active', 'is_deleted']
    list_filter = ['branch__company', 'require_two_factor_auth', 'is_active', 'is_deleted']
    search_fields = ['branch__branch_name', 'branch__code']
    ordering = ['branch']
    fieldsets = (
        (None, {
            'fields': ('branch',)
        }),
        (_('Database'), {
            'fields': ('database_server', 'database_name', 'database_username', 'database_password')
        }),
        (_('Security'), {
            'fields': (
                'connection_timeout', 'session_timeout', 'max_login_attempts',
                'account_lockout_duration', 'require_two_factor_auth',
                'password_expiry_days', 'minimum_password_length'
            )
        }),
        (_('Features'), {
            'fields': ('show_warnings', 'check_sales_price', 'enable_photo_storage')
        }),
        (_('Paths'), {
            'fields': ('reports_path', 'backup_path')
        }),
        (_('Notifications'), {
            'fields': ('notifications',)
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_deleted', 'deleted_at')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']
    actions = ['soft_delete_selected', 'restore_selected']

    def soft_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.soft_delete(user=request.user)
        self.message_user(request, _("Selected system settings soft deleted."))
    soft_delete_selected.short_description = _("Soft delete selected system settings")

    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore(user=request.user)
        self.message_user(request, _("Selected system settings restored."))
    restore_selected.short_description = _("Restore selected system settings")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        AuditService.create_audit_log(
            branch=obj.branch,
            user=request.user,
            action_type='system_settings_updated' if change else 'system_settings_created',
            username=request.user.username,
            details={'branch': obj.branch.branch_name}
        )
        logger.info(f"{'Updated' if change else 'Created'} system settings for branch: {obj.branch.branch_name}", 
                    extra={'user_id': request.user.id})

@admin.register(KeyboardShortcuts)
class KeyboardShortcutsAdmin(admin.ModelAdmin):
    list_display = ['code', 'action_name', 'display_name', 'key_combination', 'category', 'is_enabled', 'is_active', 'is_deleted']
    list_filter = ['category', 'is_enabled', 'is_global', 'is_active', 'is_deleted']
    search_fields = ['code', 'action_name', 'display_name', 'key_combination']
    list_editable = ['is_enabled']
    ordering = ['category', 'sort_order']
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'action_name', 'display_name', 'category')
        }),
        (_('Shortcut Details'), {
            'fields': ('key_combination', 'primary_key', 'modifiers', 'alternative_combination')
        }),
        (_('Configuration'), {
            'fields': ('is_enabled', 'is_system_default', 'is_customizable', 'is_global')
        }),
        (_('Context'), {
            'fields': ('context', 'page_url_pattern', 'priority', 'sort_order', 'javascript_function')
        }),
        (_('Description'), {
            'fields': ('description',)
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_deleted', 'deleted_at')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']
    actions = ['soft_delete_selected', 'restore_selected']

    def soft_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.soft_delete(user=request.user)
        self.message_user(request, _("Selected keyboard shortcuts soft deleted."))
    soft_delete_selected.short_description = _("Soft delete selected keyboard shortcuts")

    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore(user=request.user)
        self.message_user(request, _("Selected keyboard shortcuts restored."))
    restore_selected.short_description = _("Restore selected keyboard shortcuts")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        AuditService.create_audit_log(
            branch=obj.branch,
            user=request.user,
            action_type='keyboard_shortcut_updated' if change else 'keyboard_shortcut_created',
            username=request.user.username,
            details={'action_name': obj.action_name, 'key_combination': obj.key_combination}
        )
        logger.info(f"{'Updated' if change else 'Created'} keyboard shortcut: {obj.action_name}", 
                    extra={'user_id': request.user.id})