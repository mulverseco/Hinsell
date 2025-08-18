from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from apps.accounting.models import Currency, CurrencyHistory, AccountType, Account, CostCenter, OpeningBalance, AccountingPeriod, Budget, TaxConfiguration, PaymentMethod
from django.utils import timezone


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'symbol', 'is_default', 'exchange_rate', 'exchange_rate_date')
    list_filter = ('branch', 'is_default')
    search_fields = ('code', 'name', 'symbol')
    list_editable = ('exchange_rate', 'is_default')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'name', 'symbol', 'is_default')
        }),
        (_('Exchange Rate Details'), {
            'fields': ('decimal_places', 'exchange_rate', 'exchange_rate_date', 'upper_limit', 'lower_limit')
        }),
    )
    readonly_fields = ('exchange_rate_date',)

    def save_model(self, request, obj, form, change):
        if change and 'exchange_rate' in form.changed_data:
            old_rate = Currency.objects.get(pk=obj.pk).exchange_rate
            if old_rate != obj.exchange_rate:
                obj.update_exchange_rate(obj.exchange_rate, user=request.user)
        else:
            super().save_model(request, obj, form, change)

@admin.register(CurrencyHistory)
class CurrencyHistoryAdmin(admin.ModelAdmin):
    list_display = ('currency', 'branch', 'old_exchange_rate', 'new_exchange_rate', 'changed_by', 'created_at')
    list_filter = ('branch', 'currency', 'created_at')
    search_fields = ('currency__code', 'currency__name')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'currency', 'old_exchange_rate', 'new_exchange_rate', 'changed_by', 'reason')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(AccountType)
class AccountTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'category', 'normal_balance')
    list_filter = ('branch', 'category', 'normal_balance')
    search_fields = ('code', 'name')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'name', 'category', 'normal_balance')
        }),
    )

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'account_type', 'account_nature', 'current_balance', 'is_header', 'stop_sales')
    list_filter = ('branch', 'account_type', 'account_nature', 'is_header', 'is_hidden', 'stop_sales')
    search_fields = ('code', 'name', 'email', 'phone_number')
    list_editable = ('current_balance', 'stop_sales')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'name', 'parent', 'account_type', 'account_nature')
        }),
        (_('Financial Details'), {
            'fields': ('currency', 'is_taxable', 'tax_code', 'commission_ratio', 'credit_limit', 'debit_limit')
        }),
        (_('Contact Information'), {
            'fields': ('email', 'phone_number', 'address', 'tax_registration_number')
        }),
        (_('Settings'), {
            'fields': ('is_header', 'is_hidden', 'is_system', 'stop_sales', 'enable_notifications')
        }),
        (_('Balance'), {
            'fields': ('current_balance', 'budget_amount')
        }),
    )
    readonly_fields = ('current_balance',)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if change and 'current_balance' in form.changed_data:
            obj.update_balance(user=request.user)

@admin.register(TaxConfiguration)
class TaxConfigurationAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'tax_type', 'rate', 'is_active')
    list_filter = ('branch', 'tax_type', 'is_active')
    search_fields = ('name', 'tax_code')
    list_editable = ('rate', 'is_active')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'name', 'tax_code', 'tax_type', 'rate')
        }),
        (_('Settings'), {
            'fields': ('is_active', 'is_inclusive', 'applies_to_shipping')
        }),
        (_('Accounts'), {
            'fields': ('tax_payable_account', 'tax_receivable_account')
        }),
    )

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'method_type', 'processing_fee_rate', 'is_active')
    list_filter = ('branch', 'method_type', 'is_active')
    search_fields = ('name', 'processor_name')
    list_editable = ('processing_fee_rate', 'is_active')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'name', 'method_type', 'processor_name')
        }),
        (_('Fee Configuration'), {
            'fields': ('processing_fee_rate', 'fixed_fee', 'fee_account')
        }),
        (_('Settings'), {
            'fields': ('is_active', 'requires_verification', 'settlement_days')
        }),
    )

@admin.register(CostCenter)
class CostCenterAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'parent', 'is_header', 'budget_limit', 'manager')
    list_filter = ('branch', 'is_header')
    search_fields = ('code', 'name')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'name', 'parent', 'is_header')
        }),
        (_('Details'), {
            'fields': ('budget_limit', 'manager')
        }),
    )

@admin.register(OpeningBalance)
class OpeningBalanceAdmin(admin.ModelAdmin):
    list_display = ('branch', 'account', 'item', 'fiscal_year', 'opening_date', 'debit_amount', 'credit_amount', 'quantity')
    list_filter = ('branch', 'fiscal_year', 'opening_date')
    search_fields = ('account__code', 'account__name', 'item__name')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'account', 'item', 'fiscal_year', 'opening_date')
        }),
        (_('Balance Details'), {
            'fields': ('debit_amount', 'credit_amount', 'quantity', 'unit_cost')
        }),
    )

@admin.register(AccountingPeriod)
class AccountingPeriodAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'fiscal_year', 'start_date', 'end_date', 'is_closed')
    list_filter = ('branch', 'fiscal_year', 'is_closed')
    search_fields = ('code', 'name')
    list_editable = ('is_closed',)
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'name', 'fiscal_year', 'start_date', 'end_date')
        }),
        (_('Status'), {
            'fields': ('is_closed', 'closed_by', 'closed_at')
        }),
    )
    readonly_fields = ('closed_at',)

    def save_model(self, request, obj, form, change):
        if 'is_closed' in form.changed_data and obj.is_closed:
            obj.closed_by = request.user
            obj.closed_at = timezone.now()
        super().save_model(request, obj, form, change)

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'fiscal_year', 'account', 'cost_center', 'item', 'budgeted_amount', 'actual_amount')
    list_filter = ('branch', 'fiscal_year')
    search_fields = ('code', 'name', 'account__code', 'account__name', 'cost_center__code', 'cost_center__name')
    list_per_page = 25
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'name', 'fiscal_year')
        }),
        (_('Associations'), {
            'fields': ('account', 'cost_center', 'item')
        }),
        (_('Amounts'), {
            'fields': ('budgeted_amount', 'actual_amount')
        }),
    )
