"""
Serializers for medical app.
"""
from rest_framework import serializers
from decimal import Decimal
from apps.medical.models import Doctor, DoctorVisit

class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model"""
    
    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def validate_commission_percentage(self, value):
        """Ensure commission percentage is between 0 and 100"""
        if not (0 <= value <= Decimal('100.00')):
            raise serializers.ValidationError("Commission percentage must be between 0 and 100.")
        return value
    
class DoctorVisitSerializer(serializers.ModelSerializer):
    """Serializer for DoctorVisit model"""
    
    class Meta:
        model = DoctorVisit
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def validate(self, attrs):
        """Custom validation logic for DoctorVisit"""
        if attrs.get('follow_up_date') and attrs['follow_up_date'] < attrs['visit_date']:
            raise serializers.ValidationError("Follow-up date cannot be before the visit date.")
        return attrs