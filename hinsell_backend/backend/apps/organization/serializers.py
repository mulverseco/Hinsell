"""
DRF serializers for the organization application.
Provides comprehensive API serialization for all organization models.
"""

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from apps.organization.models import (
    LicenseType, License, Company, Branch,
    SystemSettings, SystemConfiguration, KeyboardShortcuts
)

User = get_user_model()


class LicenseTypeSerializer(serializers.ModelSerializer):
    """Serializer for License Types."""
    
    license_count = serializers.SerializerMethodField()
    feature_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = LicenseType
        fields = [
            'id', 'name', 'category', 'description',
            'max_users', 'max_branches', 'max_transactions_per_month', 'max_storage_gb',
            'allow_multi_currency', 'allow_advanced_reporting', 'allow_api_access',
            'allow_integrations', 'allow_custom_fields', 'allow_workflow_automation',
            'support_level', 'monthly_price', 'yearly_price', 'is_available',
            'license_count', 'feature_summary', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'license_count', 'feature_summary']
    
    def get_license_count(self, obj):
        """Get number of active licenses for this type."""
        return obj.licenses.filter(status__in=['active', 'trial']).count()
    
    def get_feature_summary(self, obj):
        """Get summary of enabled features."""
        features = []
        if obj.allow_multi_currency:
            features.append('Multi-Currency')
        if obj.allow_advanced_reporting:
            features.append('Advanced Reporting')
        if obj.allow_api_access:
            features.append('API Access')
        if obj.allow_integrations:
            features.append('Integrations')
        if obj.allow_custom_fields:
            features.append('Custom Fields')
        if obj.allow_workflow_automation:
            features.append('Workflow Automation')
        return features


class LicenseSerializer(serializers.ModelSerializer):
    """Serializer for Licenses."""
    
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    license_type_name = serializers.CharField(source='license_type.name', read_only=True)
    days_until_expiry = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    usage_violations = serializers.SerializerMethodField()
    validation_status = serializers.SerializerMethodField()
    
    class Meta:
        model = License
        fields = [
            'id', 'license_key', 'company', 'company_name', 'license_type', 'license_type_name',
            'status', 'issued_date', 'activation_date', 'expiry_date', 'last_validated',
            'current_users', 'current_branches', 'monthly_transactions', 'storage_used_gb',
            'hardware_fingerprint', 'violation_count', 'last_violation_date',
            'licensee_name', 'licensee_email', 'license_data', 'notes',
            'days_until_expiry', 'is_valid', 'usage_violations', 'validation_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'license_hash', 'issued_date', 'last_validated',
            'company_name', 'license_type_name', 'days_until_expiry',
            'is_valid', 'usage_violations', 'validation_status',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'license_key': {'write_only': True},
            'hardware_fingerprint': {'write_only': True},
            'license_data': {'write_only': True},
        }
    
    def get_days_until_expiry(self, obj):
        """Get days until license expires."""
        return obj.days_until_expiry()
    
    def get_is_valid(self, obj):
        """Check if license is currently valid."""
        return obj.is_valid()
    
    def get_usage_violations(self, obj):
        """Get current usage violations."""
        return obj.validate_usage_limits()
    
    def get_validation_status(self, obj):
        """Get comprehensive validation status."""
        return obj.validate_and_update()


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Companies."""
    
    license_status = serializers.SerializerMethodField()
    branch_count = serializers.SerializerMethodField()
    is_authorized = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'company_name', 'company_name_english', 'registration_number', 'tax_id',
            'email', 'phone_number', 'address', 'website',
            'industry', 'established_date', 'description', 'logo',
            'license_status', 'branch_count', 'is_authorized',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'license_status', 'branch_count', 'is_authorized',
            'created_at', 'updated_at'
        ]
    
    def get_license_status(self, obj):
        """Get license status information."""
        return obj.get_license_status()
    
    def get_branch_count(self, obj):
        """Get number of active branches."""
        return obj.branches.filter(is_active=True).count()
    
    def get_is_authorized(self, obj):
        """Check if company is authorized."""
        return obj.is_authorized()


class BranchSerializer(serializers.ModelSerializer):
    """Serializer for Branches."""
    
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    full_name = serializers.SerializerMethodField()
    address_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Branch
        fields = [
            'id', 'company', 'company_name', 'branch_code', 'branch_name', 'branch_name_english',
            'is_primary', 'is_headquarters', 'fiscal_year_start_month', 'fiscal_year_end_month',
            'current_fiscal_year', 'use_cost_center', 'use_sales_tax', 'use_vat_tax',
            'use_carry_fee', 'use_expire_date', 'use_batch_no', 'use_barcode', 'use_multi_currency',
            'email', 'phone_number', 'fax_number', 'address', 'city', 'state_province',
            'country', 'postal_code', 'default_currency', 'timezone', 'manager', 'manager_name',
            'full_name', 'address_display', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'company_name', 'manager_name', 'full_name', 'address_display',
            'created_at', 'updated_at'
        ]
        
        validators = [
            UniqueTogetherValidator(
                queryset=Branch.objects.all(),
                fields=['company', 'branch_code'],
                message=_("Branch code must be unique within the company.")
            ),
            UniqueTogetherValidator(
                queryset=Branch.objects.all(),
                fields=['company', 'branch_name'],
                message=_("Branch name must be unique within the company.")
            )
        ]
    
    def get_full_name(self, obj):
        """Get full branch name."""
        return obj.get_full_name()
    
    def get_address_display(self, obj):
        """Get formatted address."""
        return obj.get_address_display()
    
    def validate(self, attrs):
        """Custom validation for branch data."""
        # Check if company is authorized
        company = attrs.get('company')
        if company and not company.is_authorized():
            raise serializers.ValidationError(
                _("Company is not authorized to create branches.")
            )
        
        # Check multi-currency license
        if attrs.get('use_multi_currency', False):
            if company and not company.has_feature('multi_currency'):
                raise serializers.ValidationError({
                    'use_multi_currency': _("Multi-currency feature not available in current license.")
                })
        
        return attrs


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for System Settings."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = [
            'id', 'branch', 'branch_name', 'database_server', 'database_name',
            'database_username', 'connection_timeout', 'session_timeout',
            'max_login_attempts', 'account_lockout_duration', 'show_warnings',
            'check_sales_price', 'enable_photo_storage', 'reports_path', 'backup_path',
            'enable_email_notifications', 'enable_sms_notifications',
            'enable_whatsapp_notifications', 'enable_in_app_notifications',
            'enable_push_notifications', 'require_two_factor_auth',
            'password_expiry_days', 'minimum_password_length',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'branch_name', 'created_at', 'updated_at']
        extra_kwargs = {
            'database_password': {'write_only': True},
            'database_username': {'write_only': True},
            'database_server': {'write_only': True},
        }


class SystemConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for System Configuration."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    parsed_value = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemConfiguration
        fields = [
            'id', 'branch', 'branch_name', 'config_key', 'config_value',
            'config_type', 'description', 'is_system', 'parsed_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'branch_name', 'parsed_value', 'created_at', 'updated_at']
        
        validators = [
            UniqueTogetherValidator(
                queryset=SystemConfiguration.objects.all(),
                fields=['branch', 'config_key'],
                message=_("Configuration key must be unique within the branch.")
            )
        ]
    
    def get_parsed_value(self, obj):
        """Parse config value based on type."""
        try:
            if obj.config_type == 'integer':
                return int(obj.config_value)
            elif obj.config_type == 'decimal':
                return float(obj.config_value)
            elif obj.config_type == 'boolean':
                return obj.config_value.lower() in ('true', '1', 'yes', 'on')
            elif obj.config_type == 'json':
                import json
                return json.loads(obj.config_value)
            else:
                return obj.config_value
        except (ValueError, TypeError):
            return obj.config_value


class KeyboardShortcutsSerializer(serializers.ModelSerializer):
    """Serializer for Keyboard Shortcuts."""
    
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    formatted_combination = serializers.SerializerMethodField()
    modifiers_list = serializers.SerializerMethodField()
    javascript_config = serializers.SerializerMethodField()
    
    class Meta:
        model = KeyboardShortcuts
        fields = [
            'id', 'branch', 'branch_name', 'action_name', 'display_name', 'description',
            'category', 'key_combination', 'primary_key', 'modifiers', 'alternative_combination',
            'is_enabled', 'is_system_default', 'is_customizable', 'is_global',
            'context', 'page_url_pattern', 'priority', 'sort_order', 'javascript_function',
            'formatted_combination', 'modifiers_list', 'javascript_config',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'branch_name', 'formatted_combination', 'modifiers_list',
            'javascript_config', 'created_at', 'updated_at'
        ]
        
        validators = [
            UniqueTogetherValidator(
                queryset=KeyboardShortcuts.objects.all(),
                fields=['branch', 'action_name'],
                message=_("Action name must be unique within the branch.")
            ),
            UniqueTogetherValidator(
                queryset=KeyboardShortcuts.objects.all(),
                fields=['branch', 'key_combination', 'context'],
                message=_("Key combination must be unique within the branch and context.")
            )
        ]
    
    def get_formatted_combination(self, obj):
        """Get formatted key combination."""
        return obj.get_formatted_combination()
    
    def get_modifiers_list(self, obj):
        """Get list of modifier keys."""
        return obj.get_modifiers_list()
    
    def get_javascript_config(self, obj):
        """Get JavaScript configuration."""
        return obj.to_javascript_config()

class BranchDetailSerializer(BranchSerializer):
    """Detailed branch serializer with related data."""
    
    system_settings = SystemSettingsSerializer(read_only=True)
    configurations = SystemConfigurationSerializer(many=True, read_only=True, source='systemconfiguration_set')
    shortcuts = KeyboardShortcutsSerializer(many=True, read_only=True, source='keyboard_shortcuts')
    
    class Meta(BranchSerializer.Meta):
        fields = BranchSerializer.Meta.fields + [
            'system_settings', 'configurations', 'shortcuts'
        ]


class CompanyDetailSerializer(CompanySerializer):
    """Detailed company serializer with related data."""
    
    license = LicenseSerializer(read_only=True)
    branches = BranchSerializer(many=True, read_only=True)
    
    class Meta(CompanySerializer.Meta):
        fields = CompanySerializer.Meta.fields + ['license', 'branches']


class LicenseValidationSerializer(serializers.Serializer):
    """Serializer for license validation operations."""
    
    license_key = serializers.CharField(max_length=255)
    hardware_fingerprint = serializers.CharField(max_length=255, required=False)
    
    def validate_license_key(self, value):
        """Validate license key format."""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError(_("License key cannot be empty."))
        return value


class LicenseUsageUpdateSerializer(serializers.Serializer):
    """Serializer for updating license usage statistics."""
    
    current_users = serializers.IntegerField(min_value=0, required=False)
    current_branches = serializers.IntegerField(min_value=0, required=False)
    monthly_transactions = serializers.IntegerField(min_value=0, required=False)
    storage_used_gb = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False)


class BranchConfigurationSerializer(serializers.Serializer):
    """Serializer for bulk branch configuration updates."""
    
    configurations = serializers.DictField(
        child=serializers.CharField(),
        help_text=_("Dictionary of configuration key-value pairs")
    )
    
    def validate_configurations(self, value):
        """Validate configuration data."""
        if not value:
            raise serializers.ValidationError(_("At least one configuration must be provided."))
        
        valid_keys = [
            'session_timeout', 'max_login_attempts', 'enable_email_notifications',
            'enable_sms_notifications', 'require_two_factor_auth'
        ]
        
        for key in value.keys():
            if key not in valid_keys:
                raise serializers.ValidationError(
                    _(f"Invalid configuration key: {key}")
                )
        
        return value
