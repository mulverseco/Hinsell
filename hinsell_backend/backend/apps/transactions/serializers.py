from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry
from apps.accounting.models import Account, Currency, CostCenter
from apps.inventory.models import Item, ItemUnit, Media
from apps.organization.models import Branch
from apps.authentication.models import User

class TransactionTypeSerializer(serializers.ModelSerializer):
    """Serializer for TransactionType model."""
    class Meta:
        model = TransactionType
        fields = [
            'id', 'branch', 'code', 'name', 'category', 'affects_inventory',
            'affects_accounts', 'requires_approval', 'auto_post',
            'default_debit_account', 'default_credit_account', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate transaction type data."""
        if data.get('category') in [TransactionType.Category.SALES, TransactionType.Category.PURCHASE]:
            if data.get('branch').company.has_feature('multi_currency'):
                if not (data.get('default_debit_account') and data.get('default_credit_account')):
                    raise ValidationError(_('Default accounts are required for multi-currency transactions.'))
        return data

class TransactionDetailSerializer(serializers.ModelSerializer):
    """Serializer for TransactionDetail model."""
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())
    item_unit = serializers.PrimaryKeyRelatedField(queryset=ItemUnit.objects.all(), allow_null=True)
    
    class Meta:
        model = TransactionDetail
        fields = [
            'id', 'header', 'line_number', 'item', 'item_unit', 'quantity', 'base_quantity',
            'unit_size', 'bonus_quantity', 'unit_price', 'unit_cost', 'line_total',
            'discount_percentage', 'discount_amount', 'tax_percentage', 'tax_amount',
            'batch_number', 'expiry_date', 'description', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'base_quantity', 'line_total', 'discount_amount', 'tax_amount', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate transaction detail data."""
        item = data.get('item')
        item_unit = data.get('item_unit')
        header = data.get('header')
        
        if item_unit and item_unit.item != item:
            raise ValidationError(_('Item unit must belong to the selected item.'))
        if header.branch.use_batch_no and item.track_batches and not data.get('batch_number'):
            raise ValidationError(_('Batch number is required for this item.'))
        if header.branch.use_expire_date and item.track_expiry and not data.get('expiry_date'):
            raise ValidationError(_('Expiry date is required for this item.'))
        return data

class TransactionHeaderSerializer(serializers.ModelSerializer):
    """Serializer for TransactionHeader model."""
    details = TransactionDetailSerializer(many=True)
    customer_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)
    supplier_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)
    currency = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all())
    attachments = serializers.PrimaryKeyRelatedField(many=True, queryset=Media.objects.all(), required=False)
    approved_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)
    posted_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)
    reversed_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = TransactionHeader
        fields = [
            'id', 'branch', 'code', 'transaction_type', 'transaction_number', 'reference_number',
            'transaction_date', 'due_date', 'status', 'customer_account', 'supplier_account',
            'currency', 'exchange_rate', 'subtotal_amount', 'discount_amount', 'tax_amount',
            'total_amount', 'paid_amount', 'payment_terms', 'credit_days', 'notes',
            'internal_notes', 'attachments', 'approved_by', 'approved_at', 'posted_by',
            'posted_at', 'reversed_by', 'reversed_at', 'reversal_reason', 'details',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'code', 'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount',
            'approved_at', 'posted_at', 'reversed_at', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        """Validate transaction header data."""
        if data.get('due_date') and data.get('due_date') < data.get('transaction_date'):
            raise ValidationError(_('Due date cannot be before transaction date.'))
        if data.get('paid_amount', Decimal('0.00')) > data.get('total_amount', Decimal('0.00')):
            raise ValidationError(_('Paid amount cannot exceed total amount.'))
        if data.get('currency') != data.get('branch').default_currency and not data.get('branch').company.has_feature('multi_currency'):
            raise ValidationError(_('Multi-currency not supported by license.'))
        return data

    def create(self, validated_data):
        """Create transaction header with nested details."""
        details_data = validated_data.pop('details')
        attachments_data = validated_data.pop('attachments', [])
        with transaction.atomic():
            transaction_header = TransactionHeader.objects.create(**validated_data)
            for detail_data in details_data:
                TransactionDetail.objects.create(header=transaction_header, **detail_data)
            transaction_header.attachments.set(attachments_data)
            transaction_header.calculate_totals()
            transaction_header.save()
        return transaction_header

    def update(self, validated_data):
        """Update transaction header with nested details."""
        details_data = validated_data.pop('details')
        attachments_data = validated_data.pop('attachments', [])
        with transaction.atomic():
            transaction_header = self.instance
            for attr, value in validated_data.items():
                setattr(transaction_header, attr, value)
            transaction_header.save()
            transaction_header.details.all().delete()
            for detail_data in details_data:
                TransactionDetail.objects.create(header=transaction_header, **detail_data)
            transaction_header.attachments.set(attachments_data)
            transaction_header.calculate_totals()
            transaction_header.save()
        return transaction_header

class LedgerEntrySerializer(serializers.ModelSerializer):
    """Serializer for LedgerEntry model."""
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())
    cost_center = serializers.PrimaryKeyRelatedField(queryset=CostCenter.objects.all(), allow_null=True)
    currency = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all())

    class Meta:
        model = LedgerEntry
        fields = [
            'id', 'branch', 'code', 'transaction_header', 'account', 'cost_center',
            'entry_date', 'debit_amount', 'credit_amount', 'foreign_debit_amount',
            'foreign_credit_amount', 'currency', 'exchange_rate', 'is_posted',
            'is_reversed', 'reversal_entry', 'description', 'reference',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'is_posted', 'is_reversed', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate ledger entry data."""
        if data.get('debit_amount') > 0 and data.get('credit_amount') > 0:
            raise ValidationError(_('Entry cannot have both debit and credit amounts.'))
        if data.get('debit_amount') == 0 and data.get('credit_amount') == 0:
            raise ValidationError(_('Entry must have either debit or credit amount.'))
        return data