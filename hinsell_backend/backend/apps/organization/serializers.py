from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.organization.models import LicenseType, License, Company, Branch, SystemSettings, SystemConfiguration, KeyboardShortcuts
from apps.inventory.models import Media
from apps.accounting.models import Currency
from apps.authentication.models import User
from phonenumber_field.serializerfields import PhoneNumberField

class LicenseTypeSerializer(serializers.ModelSerializer):
    """Serializer for LicenseType model."""
    class Meta:
        model = LicenseType
        fields = [
            'id', 'code', 'name', 'category', 'description', 'max_users', 'max_branches',
            'max_transactions_per_month', 'max_storage_gb', 'allow_multi_currency',
            'allow_advanced_reporting', 'allow_api_access', 'allow_integrations',
            'allow_custom_fields', 'allow_workflow_automation', 'support_level',
            'monthly_price', 'yearly_price', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate license type data."""
        if not data.get('name').strip():
            raise ValidationError(_('Name cannot be empty.'))
        return data

class LicenseSerializer(serializers.ModelSerializer):
    """Serializer for License model."""
    license_type = serializers.PrimaryKeyRelatedField(queryset=LicenseType.objects.all())
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())

    class Meta:
        model = License
        fields = [
            'id', 'license_key', 'license_code', 'license_hash', 'company', 'license_type',
            'status', 'issued_date', 'activation_date', 'expiry_date', 'last_validated',
            'current_users', 'current_branches', 'monthly_transactions', 'storage_used_gb',
            'hardware_fingerprint', 'license_data', 'violation_count', 'last_violation_date',
            'licensee_name', 'licensee_email', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'license_code', 'license_hash', 'issued_date', 'last_validated',
            'current_users', 'current_branches', 'monthly_transactions', 'storage_used_gb',
            'violation_count', 'last_violation_date', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        """Validate license data."""
        if not data.get('license_key').strip():
            raise ValidationError(_('License key cannot be empty.'))
        if data.get('expiry_date') and data.get('expiry_date') <= timezone.now() and data.get('status') == License.Status.ACTIVE:
            raise ValidationError(_('Cannot set expiry date in the past for active license.'))
        return data

class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model."""
    logo = serializers.PrimaryKeyRelatedField(queryset=Media.objects.filter(media_type='image'), allow_null=True)

    class Meta:
        model = Company
        fields = [
            'id', 'code', 'company_name', 'company_name_english', 'registration_number',
            'tax_id', 'email', 'phone_number', 'address', 'website', 'industry',
            'established_date', 'description', 'logo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate company data."""
        if not data.get('company_name').strip():
            raise ValidationError(_('Name cannot be empty.'))
        if data.get('logo') and data.get('logo').media_type != 'image':
            raise ValidationError(_('Logo must be an image media type.'))
        return data

class BranchSerializer(serializers.ModelSerializer):
    """Serializer for Branch model."""
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())
    default_currency = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all(), allow_null=True)
    manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = Branch
        fields = [
            'id', 'company', 'branch_code', 'branch_name', 'branch_name_english',
            'is_primary', 'is_headquarters', 'fiscal_year_start_month', 'fiscal_year_end_month',
            'current_fiscal_year', 'use_cost_center', 'use_sales_tax', 'use_vat_tax',
            'use_carry_fee', 'use_expire_date', 'use_batch_no', 'use_barcode',
            'use_multi_currency', 'email', 'phone_number', 'fax_number', 'address',
            'city', 'state_province', 'country', 'postal_code', 'default_currency',
            'timezone', 'manager', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'branch_code', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate branch data."""
        if not data.get('branch_name').strip():
            raise ValidationError(_('Name cannot be empty.'))
        if data.get('fiscal_year_start_month') == data.get('fiscal_year_end_month'):
            raise ValidationError(_('Fiscal year start and end months cannot be the same.'))
        if data.get('company') and data.get('use_multi_currency') and not data.get('company').has_feature('multi_currency'):
            raise ValidationError(_('Multi-currency feature not available in current license.'))
        return data

class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for SystemSettings model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    phone_number = PhoneNumberField(allow_blank=True, required=False)
    fax_number = PhoneNumberField(allow_blank=True, required=False)

    class Meta:
        model = SystemSettings
        fields = [
            'id', 'branch', 'database_server', 'database_name', 'database_username',
            'database_password', 'connection_timeout', 'session_timeout', 'max_login_attempts',
            'account_lockout_duration', 'show_warnings', 'check_sales_price',
            'enable_photo_storage', 'reports_path', 'backup_path', 'notifications',
            'require_two_factor_auth', 'password_expiry_days', 'minimum_password_length',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate system settings data."""
        if any(data.get('notifications', {}).get(channel, False) for channel in ['email', 'sms', 'whatsapp']) and not (data.get('branch').email or data.get('branch').phone_number):
            raise ValidationError(_('Branch must have email or phone for enabled notifications.'))
        return data

class SystemConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for SystemConfiguration model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())

    class Meta:
        model = SystemConfiguration
        fields = [
            'id', 'branch', 'code', 'config_key', 'config_value', 'config_type',
            'description', 'is_system', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate system configuration data."""
        if not data.get('config_key').strip():
            raise ValidationError(_('Key cannot be empty.'))
        if not data.get('config_value').strip():
            raise ValidationError(_('Value cannot be empty.'))
        return data

class KeyboardShortcutsSerializer(serializers.ModelSerializer):
    """Serializer for KeyboardShortcuts model."""
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())

    class Meta:
        model = KeyboardShortcuts
        fields = [
            'id', 'branch', 'code', 'action_name', 'display_name', 'description',
            'category', 'key_combination', 'primary_key', 'modifiers', 'is_enabled',
            'is_system_default', 'is_customizable', 'is_global', 'context',
            'page_url_pattern', 'priority', 'sort_order', 'javascript_function',
            'alternative_combination', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate keyboard shortcuts data."""
        if not data.get('action_name').strip():
            raise ValidationError(_('Action name cannot be empty.'))
        if not data.get('key_combination').strip():
            raise ValidationError(_('Key combination cannot be empty.'))
        if not data.get('primary_key').strip():
            raise ValidationError(_('Primary key cannot be empty.'))
        return data