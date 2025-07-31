from rest_framework import serializers
from apps.authentication.models import User, UserProfile, AuditLog
from django.utils.translation import gettext_lazy as _
from apps.core_apps.utils import Logger
from apps.organization.models import Branch
import re

logger = Logger(__name__)

class UserPublicSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    profile = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    data_consent = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'user_type', 'first_name', 'last_name',
            'full_name', 'is_active', 'profile', 'default_branch', 'loyalty_points',
            'password', 'data_consent'
        ]
        read_only_fields = ['id', 'username', 'user_type', 'is_active', 'loyalty_points']

    def get_profile(self, obj):
        try:
            profile = obj.profile
            return UserProfileSerializer(profile, context=self.context).data
        except UserProfile.DoesNotExist:
            return None

    def validate_email(self, value):
        user = self.context['request'].user if 'request' in self.context else None
        if User.objects.exclude(id=user.id if user else None).filter(email=value).exists():
            raise serializers.ValidationError(_('Email address already in use.'))
        return value

    def validate_password(self, value):
        if len(value) < 8 or not re.search(r'[0-9]', value) or not re.search(r'[!@#$%^&*]', value):
            raise serializers.ValidationError(
                _('Password must be at least 8 characters long and include a number and a special character.')
            )
        return value

    def validate_data_consent(self, value):
        required_consents = ['data_processing', 'analytics']
        for consent in required_consents:
            if not value.get(consent, False):
                raise serializers.ValidationError(
                    _(f'{consent.replace("_", " ").title()} consent is required to register.')
                )
        return value

    def create(self, validated_data):
        data_consent = validated_data.pop('data_consent', None)
        user = User.objects.create_user(**validated_data)
        if data_consent:
            profile = user.profile
            profile.data_consent = data_consent
            profile.terms_accepted = True
            profile.terms_version = '1.0'
            profile.save()
        from apps.authentication.tasks import send_welcome_email
        send_welcome_email.delay(user.id)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        data_consent = validated_data.pop('data_consent', None)
        instance = super().update(instance, validated_data)
        if password:
            from apps.authentication.services import AuthenticationService
            AuthenticationService.update_password(instance, password)
        if data_consent:
            profile = instance.profile
            profile.data_consent = data_consent
            profile.save()
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    branches = serializers.SerializerMethodField()
    is_complete = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'avatar', 'avatar_url', 'bio', 'phone_number', 'address', 'nationality',
            'date_of_birth', 'gender', 'notifications', 'profile_visibility',
            'preferred_payment_method', 'marketing_opt_in', 'terms_accepted',
            'terms_accepted_at', 'terms_version', 'data_consent', 'branches', 'is_complete'
        ]
        read_only_fields = ['terms_accepted_at', 'is_complete']

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'file'):
            return obj.avatar.file.url
        return None

    def get_branches(self, obj):
        return Branch.objects.filter(default_users=obj.user).values('id', 'branch_name')

    def get_is_complete(self, obj):
        return obj.has_complete_profile()

    def validate(self, data):
        if data.get('notifications') and any(data['notifications'].get(channel, False) for channel in data['notifications']):
            if not (data.get('phone_number') or data.get('user').email):
                raise serializers.ValidationError(
                    _('At least one contact method (email or phone) must be provided if notifications are enabled.')
                )
        return data

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=instance.user.default_branch,
            user=instance.user,
            action_type=AuditLog.ActionType.PROFILE_UPDATE,
            username=instance.user.username,
            details={'updated_fields': list(validated_data.keys()), 'user_type': instance.user.user_type}
        )
        return instance

class AuditLogSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True, allow_null=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'branch', 'branch_name', 'user', 'user_full_name', 'action_type',
            'username', 'ip_address', 'user_agent', 'device_type', 'login_status',
            'session_id', 'country', 'city', 'details', 'risk_score', 'risk_level',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'risk_score', 'risk_level']