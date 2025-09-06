from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry
from apps.core_apps.utils import Logger

logger = Logger(__name__)

@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'branch', 'affects_inventory', 'affects_accounts', 'requires_approval']
    list_filter = ['category', 'branch', 'affects_inventory', 'affects_accounts', 'requires_approval']
    search_fields = ['code', 'name']
    list_select_related = ['branch', 'default_debit_account', 'default_credit_account']
    autocomplete_fields = ['branch', 'default_debit_account', 'default_credit_account']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'name', 'category')
        }),
        (_('Accounting Settings'), {
            'fields': ('affects_inventory', 'affects_accounts', 'requires_approval', 'auto_post',
                      'default_debit_account', 'default_credit_account')
        }),
        (_('Audit Fields'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        logger.info(
            f"{'Updated' if change else 'Created'} TransactionType {obj.code}",
            extra={'user_id': request.user.id, 'object_id': obj.id}
        )

@admin.register(TransactionHeader)
class TransactionHeaderAdmin(admin.ModelAdmin):
    list_display = ['code', 'transaction_number', 'transaction_type', 'branch', 'status', 'total_amount', 'transaction_date']
    list_filter = ['status', 'transaction_type', 'branch', 'transaction_date']
    search_fields = ['code', 'transaction_number', 'reference_number']
    list_select_related = ['branch', 'transaction_type', 'currency', 'approved_by', 'posted_by']
    autocomplete_fields = ['branch', 'transaction_type', 'customer_account', 'supplier_account', 'currency']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by', 'approved_at', 'posted_at', 'reversed_at']
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'transaction_number', 'transaction_type', 'reference_number')
        }),
        (_('Financial Details'), {
            'fields': ('currency', 'exchange_rate', 'subtotal_amount', 'discount_amount', 'tax_amount',
                      'total_amount', 'paid_amount', 'customer_account', 'supplier_account')
        }),
        (_('Dates'), {
            'fields': ('transaction_date', 'due_date')
        }),
        (_('Status'), {
            'fields': ('status', 'approved_by', 'approved_at', 'posted_by', 'posted_at',
                      'reversed_by', 'reversed_at', 'reversal_reason')
        }),
        (_('Notes'), {
            'fields': ('notes', 'internal_notes')
        }),
        (_('Attachments'), {
            'fields': ('attachments',)
        }),
        (_('Audit Fields'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    actions = ['approve_transactions', 'post_transactions', 'reverse_transactions']

    def approve_transactions(self, request, queryset):
        for transaction in queryset:
            if transaction.status == TransactionHeader.Status.PENDING:
                try:
                    transaction.approve(request.user)
                    self.message_user(request, f"Transaction {transaction.code} approved.")
                except Exception as e:
                    self.message_user(request, f"Error approving {transaction.code}: {str(e)}", level='error')
                    logger.error(
                        f"Error approving transaction {transaction.code}: {str(e)}",
                        extra={'user_id': request.user.id, 'object_id': transaction.id}
                    )
    approve_transactions.short_description = _("Approve selected transactions")

    def post_transactions(self, request, queryset):
        for transaction in queryset:
            if transaction.status == TransactionHeader.Status.APPROVED:
                try:
                    transaction.post(request.user)
                    self.message_user(request, f"Transaction {transaction.code} posted.")
                except Exception as e:
                    self.message_user(request, f"Error posting {transaction.code}: {str(e)}", level='error')
                    logger.error(
                        f"Error posting transaction {transaction.code}: {str(e)}",
                        extra={'user_id': request.user.id, 'object_id': transaction.id}
                    )
    post_transactions.short_description = _("Post selected transactions")

    def reverse_transactions(self, request, queryset):
        for transaction in queryset:
            if transaction.status == TransactionHeader.Status.POSTED:
                try:
                    reason = f"Reversed via admin by {request.user.username}"
                    transaction.reverse(request.user, reason)
                    self.message_user(request, f"Transaction {transaction.code} reversed.")
                except Exception as e:
                    self.message_user(request, f"Error reversing {transaction.code}: {str(e)}", level='error')
                    logger.error(
                        f"Error reversing transaction {transaction.code}: {str(e)}",
                        extra={'user_id': request.user.id, 'object_id': transaction.id}
                    )
    reverse_transactions.short_description = _("Reverse selected transactions")

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        logger.info(
            f"{'Updated' if change else 'Created'} TransactionHeader {obj.code}",
            extra={'user_id': request.user.id, 'object_id': obj.id}
        )

@admin.register(TransactionDetail)
class TransactionDetailAdmin(admin.ModelAdmin):
    list_display = ['header', 'line_number', 'item', 'quantity', 'unit_price', 'line_total']
    list_filter = ['header__transaction_type', 'header__branch']
    search_fields = ['header__code', 'header__transaction_number', 'item__item_name', 'batch_number']
    list_select_related = ['header', 'item', 'item_unit']
    autocomplete_fields = ['header', 'item', 'item_unit']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by', 'line_total']
    fieldsets = (
        (None, {
            'fields': ('header', 'line_number', 'item', 'item_unit')
        }),
        (_('Quantities'), {
            'fields': ('quantity', 'base_quantity', 'unit_size', 'bonus_quantity')
        }),
        (_('Pricing'), {
            'fields': ('unit_price', 'unit_cost', 'line_total', 'discount_percentage',
                      'discount_amount', 'tax_percentage', 'tax_amount')
        }),
        (_('Details'), {
            'fields': ('batch_number', 'expiry_date', 'description', 'notes')
        }),
        (_('Audit Fields'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        logger.info(
            f"{'Updated' if change else 'Created'} TransactionDetail for header {obj.header.code}",
            extra={'user_id': request.user.id, 'object_id': obj.id}
        )

@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ['code', 'transaction_header', 'account', 'entry_date', 'debit_amount', 'credit_amount', 'is_posted']
    list_filter = ['is_posted', 'is_reversed', 'branch', 'entry_date']
    search_fields = ['code', 'transaction_header__code', 'transaction_header__transaction_number', 'account__code']
    list_select_related = ['branch', 'transaction_header', 'account', 'currency']
    autocomplete_fields = ['branch', 'transaction_header', 'account', 'cost_center', 'currency']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by', 'is_posted', 'is_reversed']
    fieldsets = (
        (None, {
            'fields': ('branch', 'code', 'transaction_header', 'account', 'cost_center')
        }),
        (_('Financial Details'), {
            'fields': ('entry_date', 'debit_amount', 'credit_amount', 'foreign_debit_amount',
                      'foreign_credit_amount', 'currency', 'exchange_rate')
        }),
        (_('Status'), {
            'fields': ('is_posted', 'is_reversed', 'reversal_entry')
        }),
        (_('Details'), {
            'fields': ('description', 'reference')
        }),
        (_('Audit Fields'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        logger.info(
            f"{'Updated' if change else 'Created'} LedgerEntry {obj.code}",
            extra={'user_id': request.user.id, 'object_id': obj.id}
        )