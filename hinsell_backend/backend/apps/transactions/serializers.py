from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry
from apps.inventory.serializers import ItemSerializer, ItemUnitSerializer
from apps.accounting.serializers import AccountSerializer, CurrencySerializer
from apps.organization.serializers import BranchSerializer
from apps.core_apps.utils import Logger
from apps.accounting.models import Account, CostCenter, Currency
from apps.inventory.models import Item, ItemUnit
from apps.organization.models import Branch

logger = Logger(__name__)

class TransactionTypeSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    default_debit_account = AccountSerializer(read_only=True)
    default_credit_account = AccountSerializer(read_only=True)

    class Meta:
        model = TransactionType
        fields = [
            'id', 'branch', 'code', 'name', 'category', 'affects_inventory', 'affects_accounts',
            'requires_approval', 'auto_post', 'default_debit_account', 'default_credit_account',
            'is_active', 'is_deleted', 'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']

    def validate(self, data):
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        return data

class TransactionDetailSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_unit = ItemUnitSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.filter(is_deleted=False),
        source='item',
        write_only=True
    )
    item_unit_id = serializers.PrimaryKeyRelatedField(
        queryset=ItemUnit.objects.filter(is_deleted=False),
        source='item_unit',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = TransactionDetail
        fields = [
            'id', 'header', 'line_number', 'item', 'item_id', 'item_unit', 'item_unit_id',
            'quantity', 'base_quantity', 'unit_size', 'bonus_quantity', 'unit_price', 'unit_cost',
            'line_total', 'discount_percentage', 'discount_amount', 'tax_percentage', 'tax_amount',
            'batch_number', 'expiry_date', 'description', 'notes',
            'is_active', 'is_deleted', 'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'line_total', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']

    def validate(self, data):
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        if data.get('item_unit') and data.get('item') and data['item_unit'].item != data['item']:
            raise serializers.ValidationError({'item_unit': _('Item unit must belong to the selected item.')})
        return data

class TransactionHeaderSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    transaction_type = TransactionTypeSerializer(read_only=True)
    currency = CurrencySerializer(read_only=True)
    customer_account = AccountSerializer(read_only=True)
    supplier_account = AccountSerializer(read_only=True)
    details = TransactionDetailSerializer(many=True, read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.filter(is_deleted=False),
        source='branch',
        write_only=True
    )
    transaction_type_id = serializers.PrimaryKeyRelatedField(
        queryset=TransactionType.objects.filter(is_deleted=False),
        source='transaction_type',
        write_only=True
    )
    currency_id = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.filter(is_deleted=False),
        source='currency',
        write_only=True
    )
    customer_account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_deleted=False),
        source='customer_account',
        write_only=True,
        allow_null=True
    )
    supplier_account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_deleted=False),
        source='supplier_account',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = TransactionHeader
        fields = [
            'id', 'branch', 'branch_id', 'code', 'transaction_type', 'transaction_type_id',
            'transaction_number', 'reference_number', 'transaction_date', 'due_date', 'status',
            'customer_account', 'customer_account_id', 'supplier_account', 'supplier_account_id',
            'currency', 'currency_id', 'exchange_rate', 'subtotal_amount', 'discount_amount',
            'tax_amount', 'total_amount', 'paid_amount', 'payment_terms', 'credit_days',
            'notes', 'internal_notes', 'attachments', 'approved_by', 'approved_at',
            'posted_by', 'posted_at', 'reversed_by', 'reversed_at', 'reversal_reason',
            'details', 'is_active', 'is_deleted', 'deleted_at', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]
        read_only_fields = [
            'id', 'code', 'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount',
            'created_at', 'updated_at', 'created_by', 'updated_by', 'approved_at', 'posted_at',
            'reversed_at', 'deleted_at'
        ]

    def validate(self, data):
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        if data.get('due_date') and data.get('transaction_date') and data['due_date'] < data['transaction_date']:
            raise serializers.ValidationError({'due_date': _('Due date cannot be before transaction date.')})
        return data

class LedgerEntrySerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    transaction_header = TransactionHeaderSerializer(read_only=True)
    account = AccountSerializer(read_only=True)
    currency = CurrencySerializer(read_only=True)
    cost_center = serializers.StringRelatedField(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.filter(is_deleted=False),
        source='branch',
        write_only=True
    )
    transaction_header_id = serializers.PrimaryKeyRelatedField(
        queryset=TransactionHeader.objects.filter(is_deleted=False),
        source='transaction_header',
        write_only=True
    )
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_deleted=False),
        source='account',
        write_only=True
    )
    currency_id = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.filter(is_deleted=False),
        source='currency',
        write_only=True
    )
    cost_center_id = serializers.PrimaryKeyRelatedField(
        queryset=CostCenter.objects.filter(is_deleted=False),
        source='cost_center',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = LedgerEntry
        fields = [
            'id', 'branch', 'branch_id', 'code', 'transaction_header', 'transaction_header_id',
            'account', 'account_id', 'cost_center', 'cost_center_id', 'entry_date',
            'debit_amount', 'credit_amount', 'foreign_debit_amount', 'foreign_credit_amount',
            'currency', 'currency_id', 'exchange_rate', 'is_posted', 'is_reversed',
            'reversal_entry', 'description', 'reference',
            'is_active', 'is_deleted', 'deleted_at', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]
        read_only_fields = [
            'id', 'code', 'is_posted', 'is_reversed', 'created_at', 'updated_at',
            'created_by', 'updated_by', 'deleted_at'
        ]

    def validate(self, data):
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        if data.get('debit_amount', 0) > 0 and data.get('credit_amount', 0) > 0:
            raise serializers.ValidationError(_('Entry cannot have both debit and credit amounts.'))
        if data.get('debit_amount', 0) == 0 and data.get('credit_amount', 0) == 0:
            raise serializers.ValidationError(_('Entry must have either debit or credit amount.'))
        return data