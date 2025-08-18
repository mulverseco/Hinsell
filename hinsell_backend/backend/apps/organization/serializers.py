from rest_framework import serializers
from apps.organization.models import LicenseType, License, Company, Branch, SystemSettings, KeyboardShortcuts
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
logger = Logger(__name__)

class LicenseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LicenseType
        fields = [
            'id', 'code', 'name', 'category', 'description', 'max_users', 'max_branches',
            'max_transactions_per_month', 'max_storage_gb', 'allow_multi_currency',
            'allow_advanced_reporting', 'allow_api_access', 'allow_integrations',
            'allow_custom_fields', 'allow_workflow_automation', 'support_level',
            'monthly_price', 'yearly_price', 'is_available', 'is_active', 'is_deleted',
            'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']

    def validate(self, data):
        if data.get('category') == LicenseType.Category.TRIAL and data.get('monthly_price'):
            raise serializers.ValidationError({'monthly_price': _('Trial licenses cannot have a monthly price.')})
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        return data

class LicenseSerializer(serializers.ModelSerializer):
    license_type = LicenseTypeSerializer(read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    validation_status = serializers.SerializerMethodField()

    class Meta:
        model = License
        fields = [
            'id', 'license_code', 'license_key', 'license_type', 'company', 'company_name',
            'status', 'issued_date', 'activation_date', 'expiry_date', 'last_validated',
            'current_users', 'current_branches', 'monthly_transactions', 'storage_used_gb',
            'hardware_fingerprint', 'license_data', 'violation_count', 'last_violation_date',
            'licensee_name', 'licensee_email', 'notes', 'validation_status', 'is_active',
            'is_deleted', 'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = [
            'id', 'license_code', 'license_key', 'license_hash', 'issued_date', 'last_validated',
            'current_users', 'current_branches', 'monthly_transactions', 'storage_used_gb',
            'violation_count', 'last_violation_date', 'created_at', 'updated_at', 'created_by',
            'updated_by', 'deleted_at'
        ]

    def get_validation_status(self, obj):
        return obj.validate_and_update()

    def validate(self, data):
        if 'status' in data and data['status'] == License.Status.ACTIVE and not data.get('activation_date'):
            data['activation_date'] = timezone.now()
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        return data

class CompanySerializer(serializers.ModelSerializer):
    license = LicenseSerializer(read_only=True)
    branches_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'code', 'company_name', 'company_name_english', 'registration_number', 'tax_id',
            'email', 'phone_number', 'address', 'website', 'industry', 'established_date',
            'description', 'logo', 'license', 'branches_count', 'is_active', 'is_deleted',
            'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']

    def get_branches_count(self, obj):
        return obj.branches.filter(is_active=True, is_deleted=False).count()

    def validate_email(self, value):
        if value and Company.objects.exclude(id=self.instance.id if self.instance else None).filter(email=value, is_deleted=False).exists():
            raise serializers.ValidationError(_('Email address already in use.'))
        return value

    def validate(self, data):
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        return data

class BranchSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Branch
        fields = [
            'id', 'company', 'company_name', 'code', 'branch_name', 'branch_name_english',
            'is_primary', 'is_headquarters', 'fiscal_year_start_month', 'fiscal_year_end_month',
            'current_fiscal_year', 'use_cost_center', 'use_sales_tax', 'use_vat_tax',
            'use_carry_fee', 'use_expire_date', 'use_batch_no', 'use_barcode',
            'use_multi_currency', 'email', 'phone_number', 'fax_number', 'address',
            'city', 'state_province', 'country', 'postal_code', 'default_currency',
            'timezone', 'manager', 'manager_name', 'is_active', 'is_deleted',
            'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']

    def validate(self, data):
        if data.get('use_multi_currency') and not data.get('company').has_feature('multi_currency'):
            raise serializers.ValidationError({'use_multi_currency': _('Multi-currency not allowed by company license.')})
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        return data

class SystemSettingsSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)

    class Meta:
        model = SystemSettings
        fields = [
            'id', 'branch', 'branch_name', 'database_server', 'database_name', 'database_username',
            'database_password', 'connection_timeout', 'session_timeout', 'max_login_attempts',
            'account_lockout_duration', 'show_warnings', 'check_sales_price', 'enable_photo_storage',
            'reports_path', 'backup_path', 'notifications', 'require_two_factor_auth',
            'password_expiry_days', 'minimum_password_length', 'is_active', 'is_deleted',
            'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']

    def validate_notifications(self, value):
        required_channels = ['email', 'sms', 'whatsapp', 'in_app', 'push']
        if not all(channel in value for channel in required_channels):
            raise serializers.ValidationError(_('Notifications must include all required channels: %s') % required_channels)
        return value

    def validate(self, data):
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        return data

class KeyboardShortcutsSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)

    class Meta:
        model = KeyboardShortcuts
        fields = [
            'id', 'branch', 'branch_name', 'code', 'action_name', 'display_name', 'description',
            'category', 'key_combination', 'primary_key', 'modifiers', 'is_enabled',
            'is_system_default', 'is_customizable', 'is_global', 'context', 'page_url_pattern',
            'priority', 'sort_order', 'javascript_function', 'alternative_combination',
            'is_active', 'is_deleted', 'deleted_at', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at']

    def validate_key_combination(self, value):
        if not KeyboardShortcuts._is_valid_key_combination(value):
            raise serializers.ValidationError(_('Invalid key combination format.'))
        return value

    def validate(self, data):
        if data.get('is_deleted') and not data.get('deleted_at'):
            data['deleted_at'] = timezone.now()
        elif not data.get('is_deleted') and data.get('deleted_at'):
            data['deleted_at'] = None
        return data