from djoser.serializers import UserSerializer as DjoserUserSerializer
from rest_framework import serializers
from apps.authentication.models import User, UserProfile
from django.contrib.auth.models import Permission, Group

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']
        read_only_fields = fields

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions']
        read_only_fields = ['id']

class GroupBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']
        read_only_fields = fields

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'avatar', 'bio', 'email', 'phone_number', 'address', 
            'nationality', 'date_of_birth', 'gender', 'emergency_contact_name',
            'emergency_contact_phone', 'enable_email_notifications',
            'enable_sms_notifications', 'enable_whatsapp_notifications',
            'enable_in_app_notifications', 'enable_push_notifications',
            'profile_visibility'
        ]
        read_only_fields = ['id']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    user_permissions = PermissionSerializer(many=True, read_only=True)
    all_permissions = serializers.SerializerMethodField()
    groups = GroupBasicSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'employee_id',
            'is_staff', 'is_superuser', 'is_two_factor_enabled',
            'use_control_panel', 'use_reports', 'use_ledger_system',
            'use_inventory_system', 'use_purchase_system', 'use_sales_system',
            'use_medical_management', 'hide_cost', 'hide_comment',
            'user_discount_ratio', 'default_branch', 'profile',
            'user_permissions', 'groups', 'all_permissions'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'all_permissions']

    def get_all_permissions(self, obj):
        perms = obj.get_all_permissions()
        permissions = []
        for perm in perms:
            try:
                app_label, codename = perm.split('.')
                perm_obj = Permission.objects.get(
                    content_type__app_label=app_label,
                    codename=codename
                )
                permissions.append(PermissionSerializer(perm_obj).data)
            except (Permission.DoesNotExist, ValueError):
                continue
        return permissions

class UserPublicSerializer(DjoserUserSerializer):
    profile = UserProfileSerializer(read_only=True)
    user_permissions = PermissionSerializer(many=True, read_only=True)
    groups = GroupBasicSerializer(many=True, read_only=True)
    branch_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'employee_id',
            'is_staff', 'is_superuser', 'is_two_factor_enabled',
            'use_control_panel', 'use_reports', 'use_ledger_system',
            'use_inventory_system', 'use_purchase_system', 'use_sales_system',
            'use_medical_management', 'hide_cost', 'hide_comment',
            'user_discount_ratio', 'default_branch','branch_name', 'profile',
            'user_permissions', 'groups'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser']
    
    def get_branch_name(self, obj):
        if not hasattr(obj, 'default_branch') or obj.is_anonymous:
            return None
        return getattr(obj.default_branch, 'branch_name', None)