"""
Django admin configuration for transactions app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry


@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    """Admin interface for TransactionType model."""
    
    list_display = [
        'type_code', 'type_name', 'branch', 'category', 'affects_inventory',
        'affects_accounts', 'requires_approval', 'transactions_count', 'is_active'
    ]
    list_filter = [
        'branch', 'category', 'affects_inventory', 'affects_accounts',
        'requires_approval', 'auto_post', 'is_active'
    ]
    search_fields = ['type_code', 'type_name', 'branch__branch_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('branch', 'type_code', 'type_name', 'category')
        }),
        ('Settings', {
            'fields': (
                'affects_inventory', 'affects_accounts', 'requires_approval', 'auto_post'
            )
        }),
        ('Default Accounts', {
            'fields': ('default_debit_account', 'default_credit_account'),
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
    
    def transactions_count(self, obj):
        """Display number of transactions."""
        count = obj.transactions.filter(is_active=True).count()
        if count > 0:
            url = reverse('admin:transactions_transactionheader_changelist') + f'?transaction_type__id__exact={obj.id}'
            return format_html('<a href="{}">{} transactions</a>', url, count)
        return '0 transactions'
    transactions_count.short_description = 'Transactions'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


class TransactionDetailInline(admin.TabularInline):
    """Inline admin for TransactionDetail."""
    model = TransactionDetail
    extra = 1
    fields = [
        'line_number', 'item', 'item_unit', 'quantity', 'unit_price',
        'discount_percentage', 'tax_percentage', 'line_total'
    ]
    readonly_fields = ['line_total']


@admin.register(TransactionHeader)
class TransactionHeaderAdmin(admin.ModelAdmin):
    """Admin interface for TransactionHeader model."""
    
    list_display = [
        'transaction_number', 'transaction_type', 'transaction_date', 'status',
        'customer_account', 'supplier_account', 'total_amount', 'balance_due_display',
        'is_overdue'
    ]
    list_filter = [
        'branch', 'transaction_type', 'status', 'transaction_date',
        'due_date', 'currency', 'posted_at'
    ]
    search_fields = [
        'transaction_number', 'reference_number', 'customer_account__account_name',
        'supplier_account__account_name'
    ]
    readonly_fields = [
        'id', 'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount',
        'balance_due_display', 'is_fully_paid', 'is_overdue', 'approved_by',
        'approved_at', 'posted_by', 'posted_at', 'reversed_by', 'reversed_at',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    inlines = [TransactionDetailInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'branch', 'transaction_type', 'transaction_number', 'reference_number',
                'transaction_date', 'due_date', 'status'
            )
        }),
        ('Parties', {
            'fields': ('customer_account', 'supplier_account')
        }),
        ('Financial Information', {
            'fields': (
                'currency', 'exchange_rate', 'subtotal_amount', 'discount_amount',
                'tax_amount', 'total_amount', 'paid_amount', 'balance_due_display'
            )
        }),
        ('Payment Terms', {
            'fields': ('payment_terms', 'credit_days'),
            'classes': ('collapse',)
        }),
        ('Status Information', {
            'fields': (
                'is_fully_paid', 'is_overdue', 'approved_by', 'approved_at',
                'posted_by', 'posted_at', 'reversed_by', 'reversed_at'
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes', 'internal_notes'),
            'classes': ('collapse',)
        }),
        ('Reversal Information', {
            'fields': ('reversal_reason',),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def balance_due_display(self, obj):
        """Display balance due with color coding."""
        balance = obj.get_balance_due()
        if balance > 0:
            color = 'red' if obj.is_overdue() else 'orange'
            return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, balance)
        return format_html('<span style="color: green;">Paid</span>')
    balance_due_display.short_description = 'Balance Due'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TransactionDetail)
class TransactionDetailAdmin(admin.ModelAdmin):
    """Admin interface for TransactionDetail model."""
    
    list_display = [
        'header', 'line_number', 'item', 'quantity', 'unit_price',
        'discount_percentage', 'tax_percentage', 'line_total', 'net_amount_display'
    ]
    list_filter = ['header__transaction_type', 'item__item_group', 'expiry_date']
    search_fields = [
        'header__transaction_number', 'item__item_code', 'item__item_name',
        'batch_number'
    ]
    readonly_fields = [
        'id', 'base_quantity', 'line_total', 'discount_amount', 'tax_amount',
        'net_amount_display', 'total_quantity_display', 'created_at', 'updated_at',
        'created_by', 'updated_by'
    ]
    
    def net_amount_display(self, obj):
        """Display net amount."""
        return obj.get_net_amount()
    net_amount_display.short_description = 'Net Amount'
    
    def total_quantity_display(self, obj):
        """Display total quantity including bonus."""
        return obj.get_total_quantity()
    total_quantity_display.short_description = 'Total Quantity'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    """Admin interface for LedgerEntry model."""
    
    list_display = [
        'transaction_header', 'account', 'entry_date', 'debit_amount',
        'credit_amount', 'entry_type_display', 'is_posted', 'is_reversed'
    ]
    list_filter = [
        'branch', 'entry_date', 'is_posted', 'is_reversed', 'currency',
        'account__account_type'
    ]
    search_fields = [
        'transaction_header__transaction_number', 'account__account_code',
        'account__account_name', 'description', 'reference'
    ]
    readonly_fields = [
        'id', 'entry_type_display', 'entry_amount_display', 'created_at',
        'updated_at', 'created_by', 'updated_by'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'branch', 'transaction_header', 'account', 'cost_center', 'entry_date'
            )
        }),
        ('Amounts', {
            'fields': (
                'debit_amount', 'credit_amount', 'entry_type_display', 'entry_amount_display'
            )
        }),
        ('Foreign Currency', {
            'fields': (
                'foreign_debit_amount', 'foreign_credit_amount', 'currency', 'exchange_rate'
            ),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_posted', 'is_reversed', 'reversal_entry')
        }),
        ('Description', {
            'fields': ('description', 'reference')
        }),
        ('Audit Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def entry_type_display(self, obj):
        """Display entry type with color coding."""
        if obj.is_debit():
            return format_html('<span style="color: blue; font-weight: bold;">DR</span>')
        else:
            return format_html('<span style="color: green; font-weight: bold;">CR</span>')
    entry_type_display.short_description = 'Type'
    
    def entry_amount_display(self, obj):
        """Display entry amount."""
        return obj.get_amount()
    entry_amount_display.short_description = 'Amount'
    
    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by fields."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
