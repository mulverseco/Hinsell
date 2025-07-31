from rest_framework.permissions import IsAuthenticated
from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import HasRolePermission
from apps.shared.models import Media
from apps.shared.serializers import MediaSerializer

class MediaViewSet(BaseViewSet):
    """ViewSet for Media model."""
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    logger_name = 'inventory.media'
    
    filterset_fields = ['media_type', 'display_order']
    search_fields = ['alt_text', 'file']
    ordering_fields = ['display_order', 'created_at', 'updated_at']
    ordering = ['display_order']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }