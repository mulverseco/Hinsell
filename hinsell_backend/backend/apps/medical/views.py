from apps.medical.models import Doctor, DoctorVisit
from apps.medical.serializers import DoctorSerializer, DoctorVisitSerializer
from apps.core_apps.general import BaseViewSet

from apps.core_apps.permissions import (
    HasMedicalAccess, HasControlPanelAccess, CanViewCostInformation
)
class DoctorViewSet(BaseViewSet):
    """ViewSet for Doctor model."""
    
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filterset_fields = ['branch', 'doctor_code', 'doctor_name', 'specialization', 'clinic_name', 'is_active']
    search_fields = ['doctor_code', 'doctor_name', 'specialization', 'clinic_name']
    ordering_fields = ['doctor_code', 'doctor_name']
    ordering = ['doctor_code']
    
    permission_classes_by_action = {
        'create': [HasMedicalAccess],
        'update': [HasMedicalAccess],
        'partial_update': [HasMedicalAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter doctors based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset

class DoctorVisitViewSet(BaseViewSet):
    """ViewSet for DoctorVisit model."""
    
    queryset = DoctorVisit.objects.all()
    serializer_class = DoctorVisitSerializer
    filterset_fields = ['branch', 'doctor', 'visit_date', 'visited_by', 'is_active']
    search_fields = ['doctor__doctor_name', 'visited_by__username', 'purpose']
    ordering_fields = ['visit_date', 'doctor__doctor_name']
    ordering = ['-visit_date']
    
    permission_classes_by_action = {
        'create': [HasMedicalAccess],
        'update': [HasMedicalAccess],
        'partial_update': [HasMedicalAccess],
        'destroy': [HasControlPanelAccess],
    }
    
    def get_queryset(self):
        """Filter doctor visits based on user branch."""
        queryset = super().get_queryset()
        
        if not self.request.user.is_superuser:
            user_branch = getattr(self.request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        
        return queryset.select_related('doctor', 'visited_by')
    