"""
Serializers for transactions app.
"""
from rest_framework import serializers
from decimal import Decimal
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry


class TransactionTypeSerializer(serializers.ModelSerializer):
    """Serializer for TransactionType model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    default_debit_account_name = serializers.CharField(source='default_debit_account.account_name', read_only=True)
    default_credit_account_name = serializers.CharField(source='default_credit_account.account_name', read_only=True)
    transactions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TransactionType
        fields = [
            'id', 'branch', 'branch_name', 'type_code', 'type_name', 'category',
            'affects_inventory', 'affects_accounts', 'requires_approval', 'auto_post',
            'default_debit_account', 'default_debit_account_name',
            'default_credit_account', 'default_credit_account_name',
            'transactions_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'branch_name',
            'default_debit_account_name', 'default_credit_account_name', 'transactions_count'
        ]
    
    def get_transactions_count(self, obj):
        """Get number of transactions using this type."""
        return obj.transactions.filter(is_active=True).count()
    
    def validate_type_code(self, value):
        """Validate transaction type code."""
        if not value or not value.strip():
            raise serializers.ValidationError("Transaction type code cannot be empty.")
        return value.strip().upper()


class TransactionDetailSerializer(serializers.ModelSerializer):
    """Serializer for TransactionDetail model."""
    
    item_code = serializers.CharField(source='item.item_code', read_only=True)
    item_name = serializers.CharField(source='item.item_name', read_only=True)
    unit_code = serializers.CharField(source='item_unit.unit_code', read_only=True)
    net_amount = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    
    class Meta:
        model = TransactionDetail
        fields = [
            'id', 'header', 'line_number', 'item', 'item_code', 'item_name',
            'item_unit', 'unit_code', 'quantity', 'base_quantity', 'unit_size',
            'bonus_quantity', 'total_quantity', 'unit_price', 'unit_cost',
            'line_total', 'discount_percentage', 'discount_amount',
            'tax_percentage', 'tax_amount', 'net_amount', 'batch_number',
            'expiry_date', 'description', 'notes',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'item_code', 'item_name',
            'unit_code', 'base_quantity', 'line_total', 'discount_amount',
            'tax_amount', 'net_amount', 'total_quantity'
        ]
    
    def get_net_amount(self, obj):
        """Get net amount after discount and tax."""
        return str(obj.get_net_amount())
    
    def get_total_quantity(self, obj):
        """Get total quantity including bonus."""
        return str(obj.get_total_quantity())
    
    def validate(self, data):
        """Custom validation for transaction detail."""
        item = data.get('item')
        item_unit = data.get('item_unit')
        
        # Validate item unit belongs to item
        if item_unit and item_unit.item != item:
            raise serializers.ValidationError({
                'item_unit': 'Item unit must belong to the selected item.'
            })
        
        # Validate batch and expiry requirements
        if item and item.track_batches and not data.get('batch_number'):
            raise serializers.ValidationError({
                'batch_number': 'Batch number is required for this item.'
            })
        
        if item and item.track_expiry and not data.get('expiry_date'):
            raise serializers.ValidationError({
                'expiry_date': 'Expiry date is required for this item.'
            })
        
        return data


class TransactionHeaderSerializer(serializers.ModelSerializer):
    """Serializer for TransactionHeader model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    transaction_type_name = serializers.CharField(source='transaction_type.type_name', read_only=True)
    customer_name = serializers.CharField(source='customer_account.account_name', read_only=True)
    supplier_name = serializers.CharField(source='supplier_account.account_name', read_only=True)
    currency_code = serializers.CharField(source='currency.currency_code', read_only=True)
    balance_due = serializers.SerializerMethodField()
    is_fully_paid = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    details = TransactionDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = TransactionHeader
        fields = [
            'id', 'branch', 'branch_name', 'transaction_type', 'transaction_type_name',
            'transaction_number', 'reference_number', 'transaction_date', 'due_date',
            'status', 'customer_account', 'customer_name', 'supplier_account',
            'supplier_name', 'currency', 'currency_code', 'exchange_rate',
            'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount',
            'paid_amount', 'balance_due', 'is_fully_paid', 'is_overdue',
            'payment_terms', 'credit_days', 'notes', 'internal_notes',
            'approved_by', 'approved_at', 'posted_by', 'posted_at',
            'reversed_by', 'reversed_at', 'reversal_reason', 'details',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'branch_name', 'transaction_type_name',
            'customer_name', 'supplier_name', 'currency_code', 'balance_due',
            'is_fully_paid', 'is_overdue', 'approved_by', 'approved_at',
            'posted_by', 'posted_at', 'reversed_by', 'reversed_at', 'details'
        ]
    
    def get_balance_due(self, obj):
        """Get remaining balance due."""
        return str(obj.get_balance_due())
    
    def get_is_fully_paid(self, obj):
        """Check if transaction is fully paid."""
        return obj.is_fully_paid()
    
    def get_is_overdue(self, obj):
        """Check if transaction is overdue."""
        return obj.is_overdue()
    
    def validate_transaction_number(self, value):
        """Validate transaction number."""
        if not value or not value.strip():
            raise serializers.ValidationError("Transaction number cannot be empty.")
        return value.strip()
    
    def validate(self, data):
        """Custom validation for transaction header."""
        # Validate due date
        transaction_date = data.get('transaction_date')
        due_date = data.get('due_date')
        
        if due_date and transaction_date and due_date < transaction_date:
            raise serializers.ValidationError({
                'due_date': 'Due date cannot be before transaction date.'
            })
        
        # Validate paid amount
        total_amount = data.get('total_amount', Decimal('0'))
        paid_amount = data.get('paid_amount', Decimal('0'))
        
        if paid_amount > total_amount:
            raise serializers.ValidationError({
                'paid_amount': 'Paid amount cannot exceed total amount.'
            })
        
        return data


class LedgerEntrySerializer(serializers.ModelSerializer):
    """Serializer for LedgerEntry model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    account_code = serializers.CharField(source='account.account_code', read_only=True)
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    cost_center_code = serializers.CharField(source='cost_center.cost_center_code', read_only=True)
    currency_code = serializers.CharField(source='currency.currency_code', read_only=True)
    transaction_number = serializers.CharField(source='transaction_header.transaction_number', read_only=True)
    entry_amount = serializers.SerializerMethodField()
    entry_type = serializers.SerializerMethodField()
    
    class Meta:
        model = LedgerEntry
        fields = [
            'id', 'branch', 'branch_name', 'transaction_header', 'transaction_number',
            'account', 'account_code', 'account_name', 'cost_center', 'cost_center_code',
            'entry_date', 'debit_amount', 'credit_amount', 'entry_amount', 'entry_type',
            'foreign_debit_amount', 'foreign_credit_amount', 'currency', 'currency_code',
            'exchange_rate', 'is_posted', 'is_reversed', 'reversal_entry',
            'description', 'reference', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'branch_name', 'account_code',
            'account_name', 'cost_center_code', 'currency_code', 'transaction_number',
            'entry_amount', 'entry_type'
        ]
    
    def get_entry_amount(self, obj):
        """Get the entry amount (debit or credit)."""
        return str(obj.get_amount())
    
    def get_entry_type(self, obj):
        """Get entry type (DR or CR)."""
        return "DR" if obj.is_debit() else "CR"
    
    def validate(self, data):
        """Custom validation for ledger entry."""
        debit_amount = data.get('debit_amount', Decimal('0'))
        credit_amount = data.get('credit_amount', Decimal('0'))
        
        # Ensure either debit or credit, but not both
        if debit_amount > 0 and credit_amount > 0:
            raise serializers.ValidationError(
                'Entry cannot have both debit and credit amounts.'
            )
        
        if debit_amount == 0 and credit_amount == 0:
            raise serializers.ValidationError(
                'Entry must have either debit or credit amount.'
            )
        
        return data


class TransactionSummarySerializer(serializers.Serializer):
    """Serializer for transaction summary data."""
    
    branch_id = serializers.UUIDField()
    branch_name = serializers.CharField()
    total_transactions = serializers.IntegerField()
    draft_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    approved_count = serializers.IntegerField()
    posted_count = serializers.IntegerField()
    cancelled_count = serializers.IntegerField()
    reversed_count = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_outstanding = serializers.DecimalField(max_digits=15, decimal_places=2)
    overdue_count = serializers.IntegerField()
    overdue_amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class TrialBalanceSerializer(serializers.Serializer):
    """Serializer for trial balance data."""
    
    account_id = serializers.UUIDField()
    account_code = serializers.CharField()
    account_name = serializers.CharField()
    account_type = serializers.CharField()
    opening_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    debit_total = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit_total = serializers.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = serializers.DecimalField(max_digits=15, decimal_places=2)


class AccountStatementSerializer(serializers.Serializer):
    """Serializer for account statement data."""
    
    entry_date = serializers.DateField()
    transaction_number = serializers.CharField()
    description = serializers.CharField()
    reference = serializers.CharField()
    debit_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    running_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
