"""
Serializers for accounting app.
"""
from rest_framework import serializers
from decimal import Decimal
from apps.accounting.models import Currency, CurrencyHistory, AccountType, Account, CostCenter,OpeningBalance,AccountingPeriod,Budget


class CurrencySerializer(serializers.ModelSerializer):
    """Serializer for Currency model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    formatted_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Currency
        fields = [
            'id', 'branch', 'branch_name', 'currency_code', 'currency_name',
            'currency_symbol', 'is_local', 'is_default', 'fraction_name',
            'decimal_places', 'exchange_rate', 'formatted_rate', 'exchange_rate_date',
            'upper_limit', 'lower_limit', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_name', 'exchange_rate_date', 'formatted_rate']
    
    def get_formatted_rate(self, obj):
        """Get formatted exchange rate."""
        return f"1 {obj.currency_code} = {obj.exchange_rate} (Base)"
    
    def validate_currency_code(self, value):
        """Validate currency code."""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Currency code must be at least 2 characters.")
        return value.upper().strip()
    
    def validate(self, data):
        """Custom validation for currency."""
        upper_limit = data.get('upper_limit', Decimal('0'))
        lower_limit = data.get('lower_limit', Decimal('0'))
        exchange_rate = data.get('exchange_rate', Decimal('1'))
        
        if upper_limit > 0 and lower_limit > 0 and lower_limit >= upper_limit:
            raise serializers.ValidationError({
                'upper_limit': 'Upper limit must be greater than lower limit.'
            })
        
        if upper_limit > 0 and exchange_rate > upper_limit:
            raise serializers.ValidationError({
                'exchange_rate': 'Exchange rate exceeds upper limit.'
            })
        
        if lower_limit > 0 and exchange_rate < lower_limit:
            raise serializers.ValidationError({
                'exchange_rate': 'Exchange rate is below lower limit.'
            })
        
        return data

class OpeningBalanceSerializer(serializers.ModelSerializer):
    """Serializer for OpeningBalance model."""

    class Meta:
        model = OpeningBalance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
        
class AccountingPeriodSerializer(serializers.ModelSerializer):
    """Serializer for AccountingPeriod model."""
    
    class Meta:
        model = AccountingPeriod
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget model."""

    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class CurrencyHistorySerializer(serializers.ModelSerializer):
    """Serializer for CurrencyHistory model."""
    
    currency_code = serializers.CharField(source='currency.currency_code', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    rate_change = serializers.SerializerMethodField()
    
    class Meta:
        model = CurrencyHistory
        fields = [
            'id', 'branch', 'currency', 'currency_code', 'old_exchange_rate',
            'new_exchange_rate', 'rate_change', 'changed_by', 'changed_by_name',
            'reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'currency_code', 'changed_by_name', 'rate_change']
    
    def get_rate_change(self, obj):
        """Calculate rate change percentage."""
        if obj.old_exchange_rate > 0:
            change = ((obj.new_exchange_rate - obj.old_exchange_rate) / obj.old_exchange_rate) * 100
            return round(change, 4)
        return 0


class AccountTypeSerializer(serializers.ModelSerializer):
    """Serializer for AccountType model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    accounts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AccountType
        fields = [
            'id', 'branch', 'branch_name', 'type_code', 'type_name',
            'category', 'normal_balance', 'accounts_count',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_name', 'accounts_count']
    
    def get_accounts_count(self, obj) -> int:
        """Get number of accounts using this type."""
        return obj.accounts.filter(is_active=True).count()


class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    account_type_name = serializers.CharField(source='account_type.type_name', read_only=True)
    parent_name = serializers.CharField(source='parent.account_name', read_only=True)
    currency_code = serializers.CharField(source='currency.currency_code', read_only=True)
    full_code = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    formatted_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = [
            'id', 'branch', 'branch_name', 'account_code', 'account_name',
            'account_name_english', 'parent', 'parent_name', 'account_type',
            'account_type_name', 'account_nature', 'is_header', 'is_hidden',
            'is_system', 'currency', 'currency_code', 'is_taxable', 'tax_code',
            'commission_ratio', 'credit_limit', 'debit_limit', 'email',
            'phone_number', 'mobile_number', 'fax_number', 'address',
            'tax_registration_number', 'commercial_registration', 'stop_sales',
            'current_balance', 'formatted_balance', 'budget_amount',
            'enable_email_notifications', 'enable_sms_notifications',
            'enable_whatsapp_notifications', 'full_code', 'level',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'branch_name', 'account_type_name',
            'parent_name', 'currency_code', 'current_balance', 'formatted_balance',
            'full_code', 'level'
        ]
    
    def get_full_code(self, obj) -> str:
        """Get full hierarchical account code."""
        return obj.get_full_code()
    
    def get_level(self, obj):
        """Get account level in hierarchy."""
        return obj.get_level()
    
    def get_formatted_balance(self, obj):
        """Get formatted balance with currency."""
        if obj.currency:
            return obj.currency.format_amount(obj.current_balance)
        return f"{obj.current_balance:.2f}"
    
    def validate_account_code(self, value):
        """Validate account code."""
        if not value or not value.strip():
            raise serializers.ValidationError("Account code cannot be empty.")
        return value.strip()
    
    def validate(self, data):
        """Custom validation for account."""
        parent = data.get('parent')
        if parent and parent.is_header is False:
            raise serializers.ValidationError({
                'parent': 'Parent account must be a header account.'
            })
        return data


class CostCenterSerializer(serializers.ModelSerializer):
    """Serializer for CostCenter model."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    parent_name = serializers.CharField(source='parent.cost_center_name', read_only=True)
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    full_code = serializers.SerializerMethodField()
    
    class Meta:
        model = CostCenter
        fields = [
            'id', 'branch', 'branch_name', 'cost_center_code', 'cost_center_name',
            'parent', 'parent_name', 'is_header', 'budget_limit', 'manager',
            'manager_name', 'full_code', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch_name', 'parent_name', 'manager_name', 'full_code']
    
    def get_full_code(self, obj):
        """Get full hierarchical cost center code."""
        return obj.get_full_code()
