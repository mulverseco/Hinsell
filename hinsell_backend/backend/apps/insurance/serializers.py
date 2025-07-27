from apps.insurance.models import InsuranceSubscriber
from rest_framework import serializers

class InsuranceSubscriberSerializer(serializers.ModelSerializer):
    """Serializer for InsuranceSubscriber model."""
    
    class Meta:
        model = InsuranceSubscriber
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def validate_coverage_percentage(self, value):
        """Ensure coverage percentage is between 0 and 100."""
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Coverage percentage must be between 0 and 100.")
        return value
    
    def validate_policy_number(self, value):
        """Ensure policy number is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Policy number cannot be empty.")
        return value.strip()