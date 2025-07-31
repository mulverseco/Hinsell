from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from apps.authentication.models import User, UserProfile, AuditLog
from apps.authentication.serializers import UserPublicSerializer, UserProfileSerializer, AuditLogSerializer
from apps.core_apps.general import BaseViewSet
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _

logger = Logger(__name__)


class UserViewSet(BaseViewSet):
    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes_by_action = {
        'list': [IsAdminUser],
        'retrieve': [IsAuthenticated],
        'update': [IsAuthenticated],
        'partial_update': [IsAuthenticated],
        'destroy': [IsAdminUser],
        'loyalty_history': [IsAuthenticated]
    }
    filterset_fields = ['user_type', 'is_active', 'default_branch']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'created_at']

    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        logger.info(
            f"User updated: {instance.username}",
            extra={'user_id': instance.id, 'user_type': instance.user_type}
        )

    def perform_destroy(self, instance):
        logger.info(
            f"User deleted: {instance.username}",
            extra={'user_id': instance.id, 'user_type': instance.user_type}
        )
        instance.delete()

    @action(detail=True, methods=['get'])
    def loyalty_history(self, request, pk=None):
        user = self.get_object()
        logs = AuditLog.objects.filter(
            user=user,
            action_type__in=[AuditLog.ActionType.LOYALTY_POINTS_ADDED, AuditLog.ActionType.LOYALTY_POINTS_REDEEMED]
        ).order_by('-created_at')
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class UserProfileViewSet(BaseViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes_by_action = {
        'list': [IsAdminUser],
        'retrieve': [IsAuthenticated],
        'update': [IsAuthenticated],
        'partial_update': [IsAuthenticated],
        'destroy': [IsAdminUser],
        'withdraw_consent': [IsAuthenticated]
    }
    filterset_fields = ['profile_visibility', 'terms_accepted', 'marketing_opt_in']
    search_fields = ['user__username', 'user__email', 'phone_number']
    ordering_fields = ['user__username', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset

    @action(detail=True, methods=['post'])
    def withdraw_consent(self, request, pk=None):
        profile = self.get_object()
        consent_type = request.data.get('consent_type')
        if not consent_type:
            return Response({'detail': _('Consent type is required.')}, status=400)
        try:
            from apps.authentication.services import UserProfileService
            UserProfileService.withdraw_consent(profile, consent_type)
            return Response({'detail': _(f'{consent_type.replace("_", " ").title()} consent withdrawn successfully.')})
        except ValidationError as e:
            return Response({'detail': str(e)}, status=400)

class AuditLogViewSet(BaseViewSet):
    """ViewSet for viewing AuditLog instances (admin only)."""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['action_type', 'login_status', 'risk_level', 'created_at']
    search_fields = ['user__username', 'user__email', 'username', 'ip_address']
    ordering_fields = ['created_at', 'risk_score']

    def get_queryset(self):
        """Restrict to branch-specific audit logs for non-superusers."""
        queryset = super().get_queryset()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(branch__in=self.request.user.profile.branches.all())
        return queryset