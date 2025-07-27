"""
Django admin configuration for accounting app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from apps.accounting.models import Currency, CurrencyHistory, AccountType, Account, CostCenter


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    """Admin interface for Currency model."""
    
    list_display = [
        'currency_code', 'currency_name', 'branch', 'exchange_rate',
        'is_local', 'is_default', 'exchange_rate_date', 'is_active'
    ]
    list_filter = ['branch', 'is_local', 'is_default', 'is_active', 'exchange_rate_date']
    search_fields = ['currency_code', 'currency_name', 'branch__branch_name']
    readonly_fields = ['id', 'exchange_rate_date', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('branch', 'currency_code', 'currency_name', 'currency_symbol')
        }),
        ('Settings', {
            'fields': ('is_local', 'is_default', 'fraction_name', 'decimal_places')
        }),
        ('Exchange Rate', {
            'fields': ('exchange_rate', 'exchange_rate_date', 'upper_limit', 'lower_limit')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CurrencyHistory)
class CurrencyHistoryAdmin(admin.ModelAdmin):
    """Admin interface for CurrencyHistory model."""
    
    list_display = [
        'currency', 'old_exchange_rate', 'new_exchange_rate',
        'rate_change_display', 'changed_by', 'created_at'
    ]
    list_filter = ['currency', 'branch', 'created_at']
    search_fields = ['currency__currency_code', 'changed_by__username', 'reason']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def rate_change_display(self, obj):
        """Display rate change with color coding."""
        if obj.old_exchange_rate > 0:
            change = ((obj.new_exchange_rate - obj.old_exchange_rate) / obj.old_exchange_rate) * 100
            color = 'green' if change > 0 else 'red' if change < 0 else 'black'
            return format_html(
                '<span style="color: {};">{:.4f}%</span>',
                color, change
            )
        return 'N/A'
    rate_change_display.short_description = 'Rate Change'


@admin.register(AccountType)
class AccountTypeAdmin(admin.ModelAdmin):
    """Admin interface for AccountType model."""
    
    list_display = ['type_code', 'type_name', 'branch', 'category', 'normal_balance', 'accounts_count', 'is_active']
    list_filter = ['branch', 'category', 'normal_balance', 'is_active']
    search_fields = ['type_code', 'type_name', 'branch__branch_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    def accounts_count(self, obj):
        """Display number of accounts using this type."""
        count = obj.accounts.filter(is_active=True).count()
        if count > 0:
            url = reverse('admin:accounting_account_changelist') + f'?account_type__id__exact={obj.id}'
            return format_html('<a href="{}">{} accounts</a>', url, count)
        return '0 accounts'
    accounts_count.short_description = 'Accounts'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """Admin interface for Account model."""
    
    list_display = [
        'account_code', 'account_name', 'account_type', 'account_nature',
        'current_balance', 'is_header', 'is_active'
    ]
    list_filter = [
        'branch', 'account_type', 'account_nature', 'is_header',
        'is_hidden', 'is_system', 'stop_sales', 'is_active'
    ]
    search_fields = ['account_code', 'account_name', 'email', 'tax_registration_number']
    readonly_fields = ['id', 'current_balance', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'branch', 'account_code', 'account_name', 'account_name_english',
                'parent', 'account_type', 'account_nature'
            )
        }),
        ('Settings', {
            'fields': (
                'is_header', 'is_hidden', 'is_system', 'currency',
                'is_taxable', 'tax_code', 'stop_sales'
            )
        }),
        ('Financial Limits', {
            'fields': ('commission_ratio', 'credit_limit', 'debit_limit', 'budget_amount')
        }),
        ('Contact Information', {
            'fields': (
                'email', 'phone_number', 'mobile_number', 'fax_number', 'address'
            ),
            'classes': ('collapse',)
        }),
        ('Registration Information', {
            'fields': ('tax_registration_number', 'commercial_registration'),
            'classes': ('collapse',)
        }),
        ('Notification Settings', {
            'fields': (
                'enable_email_notifications', 'enable_sms_notifications',
                'enable_whatsapp_notifications'
            ),
            'classes': ('collapse',)
        }),
        ('Balance Information', {
            'fields': ('current_balance',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CostCenter)
class CostCenterAdmin(admin.ModelAdmin):
    """Admin interface for CostCenter model."""
    
    list_display = [
        'cost_center_code', 'cost_center_name', 'branch', 'parent',
        'is_header', 'budget_limit', 'manager', 'is_active'
    ]
    list_filter = ['branch', 'is_header', 'is_active']
    search_fields = ['cost_center_code', 'cost_center_name', 'branch__branch_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('branch', 'cost_center_code', 'cost_center_name', 'parent')
        }),
        ('Settings', {
            'fields': ('is_header', 'budget_limit', 'manager')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
