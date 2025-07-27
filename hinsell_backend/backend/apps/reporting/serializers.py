from rest_framework import serializers
from apps.reporting.models import ReportTemplate, ReportCategory

class ReportCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportCategory
        fields = ['id', 'name', 'description', 'icon', 'sort_order', 'is_active']

class ReportTemplateSerializer(serializers.ModelSerializer):
    category = ReportCategorySerializer(read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'category', 'code', 'name', 'description',
            'report_type', 'query_config', 'parameters', 'columns',
            'chart_config', 'formatting_rules', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_query_config(self, value):
        """Validate query configuration"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("query_config must be a dictionary")
        
        if 'model' not in value:
            raise serializers.ValidationError("query_config must contain 'model' key")
        
        return value

    def validate_parameters(self, value):
        """Validate parameters configuration"""
        if not isinstance(value, (list, dict)):
            raise serializers.ValidationError("parameters must be a list or dictionary")
        
        return value

class ReportRequestSerializer(serializers.Serializer):
    """Serializer for report execution requests"""
    parameters = serializers.DictField(
        child=serializers.CharField(allow_blank=True),
        required=False,
        default=dict
    )
    format = serializers.ChoiceField(
        choices=['json', 'csv', 'excel', 'pdf'],
        default='json'
    )
    limit = serializers.IntegerField(
        min_value=1,
        max_value=10000,
        required=False
    )
    offset = serializers.IntegerField(
        min_value=0,
        required=False
    )

class QueryValidationSerializer(serializers.Serializer):
    """Serializer for query validation"""
    query_config = serializers.DictField()
    
    def validate_query_config(self, value):
        """Validate query configuration structure"""
        required_keys = ['model']
        for key in required_keys:
            if key not in value:
                raise serializers.ValidationError(f"'{key}' is required in query_config")
        
        return value
