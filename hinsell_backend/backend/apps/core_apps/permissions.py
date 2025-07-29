"""
Comprehensive permission system for the pharmacy management system.
Implements role-based access control with granular permissions.
"""
from rest_framework import permissions
from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Permission
from apps.core_apps.utils import Logger

logger = Logger(__name__)

class IsBranchMember(permissions.BasePermission):
    """Custom permission to ensure user belongs to the branch of the object."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.default_branch is not None

    def has_object_permission(self, request, view, obj):
        user_branches = request.user.default_branch.company.branches.all()
        return hasattr(obj, 'branch') and obj.branch in user_branches

class IsSystemAdmin(permissions.BasePermission):
    """Custom permission for system administrators."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)
    
class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.created_by == request.user


class IsBranchMember(BasePermission):
    """
    Permission to check if user belongs to the same branch as the object.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if not hasattr(obj, 'branch'):
            return True
        
        user_branch = getattr(request.user, 'default_branch', None)
        return user_branch and obj.branch == user_branch


class IsSystemAdmin(BasePermission):
    """
    Permission for system administrators only.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_superuser
        )


class HasControlPanelAccess(BasePermission):
    """
    Permission for users with control panel access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_control_panel
        )


class HasMedicalAccess(BasePermission):
    """
    Permission for users with medical management access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_medical_management
        )
    
class HasTransactionAccess(BasePermission):
    """
    Permission for users with transaction access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_transactions
        )
    
class HasReportsAccess(BasePermission):
    """
    Permission for users with reports access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_reports
        )


class HasLedgerAccess(BasePermission):
    """
    Permission for users with ledger system access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_ledger_system
        )


class HasInventoryAccess(BasePermission):
    """
    Permission for users with inventory system access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_inventory_system
        )


class HasPurchaseAccess(BasePermission):
    """
    Permission for users with purchase system access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_purchase_system
        )


class HasSalesAccess(BasePermission):
    """
    Permission for users with sales system access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_sales_system
        )


class CanApproveTransactions(BasePermission):
    """
    Permission for users who can approve transactions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.use_control_panel)
        )


class CanPostTransactions(BasePermission):
    """
    Permission for users who can post transactions to ledger.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.use_ledger_system
        )


class CanReverseTransactions(BasePermission):
    """
    Permission for users who can reverse posted transactions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.use_control_panel)
        )


class CanViewCostInformation(BasePermission):
    """
    Permission for users who can view cost information.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            not request.user.hide_cost
        )


class CanManageUsers(BasePermission):
    """
    Permission for users who can manage other users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.use_control_panel)
        )


class CanAccessAuditLogs(BasePermission):
    """
    Permission for users who can access audit logs.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.use_control_panel)
        )


class DynamicPermission(BasePermission):
    """
    Dynamic permission class that checks permissions based on view action.
    """

    PERMISSION_MAP = {
        'list': 'view',
        'retrieve': 'view',
        'create': 'add',
        'update': 'change',
        'partial_update': 'change',
        'destroy': 'delete',
    }
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get the model from the view
        model = getattr(view, 'queryset', None)
        if model is not None:
            model = model.model
        else:
            return False
        
        action = getattr(view, 'action', None)
        if not action:
            return True
        
        permission_type = self.PERMISSION_MAP.get(action, action)
        
        app_label = model._meta.app_label
        model_name = model._meta.model_name
        permission_codename = f"{permission_type}_{model_name}"
        
        return request.user.has_perm(f"{app_label}.{permission_codename}")


class PharmacyPermissionMixin:
    """
    Mixin to provide common permission methods for views.
    """
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """
        permission_classes = []
        
        permission_classes.append(permissions.IsAuthenticated)
        
        permission_classes.append(IsBranchMember)
        
        if hasattr(self, 'permission_classes_by_action'):
            try:
                permission_classes.extend(
                    self.permission_classes_by_action[self.action]
                )
            except KeyError:
                pass
        
        return [permission() for permission in permission_classes]


def create_pharmacy_permissions():
    """
    Create custom permissions for the pharmacy management system.
    """
    from django.contrib.auth.models import Permission
    from django.contrib.contenttypes.models import ContentType
    from apps.authentication.models import User
    
    custom_permissions = [
        ('can_manage_users', 'Can manage users'),
        ('can_view_audit_logs', 'Can view audit logs'),
        ('can_reset_passwords', 'Can reset user passwords'),
        ('can_lock_accounts', 'Can lock/unlock user accounts'),
        
        ('can_approve_transactions', 'Can approve transactions'),
        ('can_post_transactions', 'Can post transactions to ledger'),
        ('can_reverse_transactions', 'Can reverse posted transactions'),
        ('can_view_cost_information', 'Can view cost information'),
        ('can_manage_currencies', 'Can manage currencies'),
        ('can_manage_accounts', 'Can manage chart of accounts'),
        
        ('can_adjust_inventory', 'Can adjust inventory levels'),
        ('can_manage_items', 'Can manage item master data'),
        ('can_view_expired_items', 'Can view expired items'),
        ('can_manage_suppliers', 'Can manage suppliers'),
        
        ('can_override_prices', 'Can override item prices'),
        ('can_apply_discounts', 'Can apply discounts'),
        ('can_process_returns', 'Can process sales returns'),
        ('can_void_transactions', 'Can void transactions'),
        
        ('can_create_purchase_orders', 'Can create purchase orders'),
        ('can_receive_goods', 'Can receive goods'),
        ('can_manage_purchase_returns', 'Can manage purchase returns'),
        
        ('can_generate_reports', 'Can generate reports'),
        ('can_export_data', 'Can export data'),
        ('can_view_analytics', 'Can view analytics dashboard'),
        

        ('can_manage_system_settings', 'Can manage system settings'),
        ('can_backup_database', 'Can backup database'),
        ('can_manage_branches', 'Can manage branches'),
    ]
    
    user_content_type = ContentType.objects.get_for_model(User)
    
    created_permissions = []
    for codename, name in custom_permissions:
        permission, created = Permission.objects.get_or_create(
            codename=codename,
            content_type=user_content_type,
            defaults={'name': name}
        )
        
        if created:
            created_permissions.append(permission)
            logger.info(f"Created permission: {codename}")
    
    return created_permissions


ROLE_PERMISSIONS = {
    'pharmacy_manager': [
        'can_manage_users',
        'can_view_audit_logs',
        'can_approve_transactions',
        'can_post_transactions',
        'can_view_cost_information',
        'can_manage_currencies',
        'can_manage_accounts',
        'can_adjust_inventory',
        'can_manage_items',
        'can_view_expired_items',
        'can_manage_suppliers',
        'can_override_prices',
        'can_apply_discounts',
        'can_process_returns',
        'can_void_transactions',
        'can_create_purchase_orders',
        'can_receive_goods',
        'can_manage_purchase_returns',
        'can_generate_reports',
        'can_export_data',
        'can_view_analytics',
        'can_manage_system_settings',
        'can_manage_branches',
    ],
    'pharmacist': [
        'can_view_cost_information',
        'can_adjust_inventory',
        'can_manage_items',
        'can_view_expired_items',
        'can_override_prices',
        'can_apply_discounts',
        'can_process_returns',
        'can_create_purchase_orders',
        'can_receive_goods',
        'can_generate_reports',
        'can_view_analytics',
    ],
    'sales_person': [
        'can_apply_discounts',
        'can_process_returns',
        'can_generate_reports',
    ],
    'inventory_clerk': [
        'can_adjust_inventory',
        'can_manage_items',
        'can_view_expired_items',
        'can_receive_goods',
        'can_generate_reports',
    ],
    'accountant': [
        'can_approve_transactions',
        'can_post_transactions',
        'can_reverse_transactions',
        'can_view_cost_information',
        'can_manage_currencies',
        'can_manage_accounts',
        'can_generate_reports',
        'can_export_data',
        'can_view_analytics',
    ],
}


def assign_role_permissions(user, role_name):
    """
    Assign permissions to a user based on their role.
    """
    if role_name not in ROLE_PERMISSIONS:
        raise ValueError(f"Unknown role: {role_name}")
    
    permissions = Permission.objects.filter(
        codename__in=ROLE_PERMISSIONS[role_name]
    )
    
    user.user_permissions.set(permissions)
    logger.info(f"Assigned {role_name} permissions to user {user.username}")
