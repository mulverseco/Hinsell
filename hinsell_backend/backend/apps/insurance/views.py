"""
API views for inventory app.
"""
import logging
from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import (
    HasInventoryAccess, HasControlPanelAccess
)
from apps.insurance.models import InsuranceSubscriber
from apps.insurance.serializers import InsuranceSubscriberSerializer


logger = logging.getLogger(__name__)

class InsuranceSubscriberViewSet(BaseViewSet):
    """ViewSet for InsuranceSubscriber model."""
    
    queryset = InsuranceSubscriber.objects.all()
    serializer_class = InsuranceSubscriberSerializer
    filterset_fields = ['branch', 'subscriber_code', 'subscriber_name', 'insurance_company', 'is_active']
    search_fields = ['subscriber_code', 'subscriber_name', 'insurance_company']
    ordering_fields = ['subscriber_code', 'subscriber_name']
    ordering = ['subscriber_code']
    
    permission_classes_by_action = {
        'create': [HasInventoryAccess],
        'update': [HasInventoryAccess],
        'partial_update': [HasInventoryAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter insurance subscribers based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset
