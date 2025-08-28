from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.accounting.models import Currency, CurrencyHistory, AccountType, Account, CostCenter, OpeningBalance, AccountingPeriod, Budget
from apps.organization.models import Branch
from apps.authentication.models import User
from apps.inventory.models import Item
from phonenumber_field.serializerfields import PhoneNumberField

class CurrencySerializer(serializers.ModelSerializer):
    """Serializer for Currency model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())

    class Meta:
        model = Currency
        fields = [
            'id', 'branch', 'code', 'name', 'symbol', 'is_default', 'decimal_places',
            'exchange_rate', 'exchange_rate_date', 'upper_limit', 'lower_limit',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'exchange_rate_date', 'created_at', 'updated_at']

class CurrencyHistorySerializer(serializers.ModelSerializer):
    """Serializer for CurrencyHistory model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    currency = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all())
    changed_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = CurrencyHistory
        fields = [
            'id', 'branch', 'currency', 'old_exchange_rate', 'new_exchange_rate',
            'changed_by', 'reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class AccountTypeSerializer(serializers.ModelSerializer):
    """Serializer for AccountType model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())

    class Meta:
        model = AccountType
        fields = [
            'id', 'branch', 'code', 'name', 'category', 'normal_balance',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']


class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    parent = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)
    account_type = serializers.PrimaryKeyRelatedField(queryset=AccountType.objects.all())
    currency = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all(), allow_null=True)
    phone_number = PhoneNumberField(allow_blank=True, required=False)

    class Meta:
        model = Account
        fields = [
            'id', 'branch', 'code', 'name', 'parent', 'account_type', 'account_nature',
            'is_header', 'is_hidden', 'is_system', 'currency', 'is_taxable', 'tax_code',
            'commission_ratio', 'credit_limit', 'debit_limit', 'email', 'phone_number',
            'address', 'tax_registration_number', 'stop_sales', 'current_balance',
            'budget_amount', 'enable_notifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'current_balance', 'created_at', 'updated_at']

class CostCenterSerializer(serializers.ModelSerializer):
    """Serializer for CostCenter model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    parent = serializers.PrimaryKeyRelatedField(queryset=CostCenter.objects.all(), allow_null=True)
    manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = CostCenter
        fields = [
            'id', 'branch', 'code', 'name', 'parent', 'is_header', 'budget_limit',
            'manager', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

class OpeningBalanceSerializer(serializers.ModelSerializer):
    """Serializer for OpeningBalance model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), allow_null=True)

    class Meta:
        model = OpeningBalance
        fields = [
            'id', 'branch', 'account', 'item', 'fiscal_year', 'opening_date',
            'debit_amount', 'credit_amount', 'quantity', 'unit_cost',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('opening_date'):
            raise ValidationError(_('Opening date cannot be empty.'))
        if data.get('account') and data.get('item'):
            raise ValidationError(_('Cannot set both account and item for opening balance.'))
        if not (data.get('account') or data.get('item')):
            raise ValidationError(_('Either account or item must be set.'))
        return data

class AccountingPeriodSerializer(serializers.ModelSerializer):
    """Serializer for AccountingPeriod model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    closed_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = AccountingPeriod
        fields = [
            'id', 'branch', 'code', 'name', 'start_date', 'end_date', 'fiscal_year',
            'is_closed', 'closed_by', 'closed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'closed_at', 'created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), allow_null=True)
    cost_center = serializers.PrimaryKeyRelatedField(queryset=CostCenter.objects.all(), allow_null=True)
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), allow_null=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'branch', 'code', 'name', 'fiscal_year', 'account', 'cost_center',
            'item', 'budgeted_amount', 'actual_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'actual_amount', 'created_at', 'updated_at']