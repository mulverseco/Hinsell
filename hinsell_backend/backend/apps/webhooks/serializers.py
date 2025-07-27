"""
Serializers for webhook models.
"""
from rest_framework import serializers
from apps.webhooks.models import WebhookEvent, WebhookEndpoint, WebhookDelivery, WebhookEventLog


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer for webhook events."""
    
    class Meta:
        model = WebhookEvent
        fields = [
            'id', 'event_type', 'name', 'category', 'description',
            'payload_schema', 'is_system_event', 'requires_permission',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WebhookEndpointSerializer(serializers.ModelSerializer):
    """Serializer for webhook endpoints."""
    
    success_rate = serializers.SerializerMethodField()
    is_healthy = serializers.SerializerMethodField()
    subscribed_events = WebhookEventSerializer(many=True, read_only=True)
    subscribed_event_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=WebhookEvent.objects.filter(is_active=True),
        source='subscribed_events',
        write_only=True
    )
    
    class Meta:
        model = WebhookEndpoint
        fields = [
            'id', 'branch', 'name', 'url', 'status', 'subscribed_events',
            'subscribed_event_ids', 'http_method', 'content_type', 
            'custom_headers', 'max_retries', 'retry_delay', 'timeout',
            'filter_conditions', 'total_deliveries', 'successful_deliveries',
            'failed_deliveries', 'consecutive_failures', 'last_delivery_at',
            'last_success_at', 'failure_threshold', 'suspended_until',
            'success_rate', 'is_healthy', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'secret_key', 'total_deliveries', 'successful_deliveries',
            'failed_deliveries', 'consecutive_failures', 'last_delivery_at',
            'last_success_at', 'success_rate', 'is_healthy', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'custom_headers': {'required': False},
            'filter_conditions': {'required': False},
        }
    
    def get_success_rate(self, obj):
        return obj.get_success_rate()
    
    def get_is_healthy(self, obj):
        return obj.is_healthy()


class WebhookDeliverySerializer(serializers.ModelSerializer):
    """Serializer for webhook deliveries."""
    
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)
    endpoint_url = serializers.CharField(source='endpoint.url', read_only=True)
    can_retry = serializers.SerializerMethodField()
    is_successful = serializers.SerializerMethodField()
    
    class Meta:
        model = WebhookDelivery
        fields = [
            'id', 'endpoint', 'endpoint_name', 'endpoint_url', 'event_type',
            'event_id', 'payload', 'status', 'request_headers', 'request_body',
            'response_status_code', 'response_headers', 'response_body',
            'sent_at', 'completed_at', 'duration_ms', 'attempt_number',
            'max_attempts', 'next_retry_at', 'error_message', 'error_code',
            'can_retry', 'is_successful', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'endpoint_name', 'endpoint_url', 'payload', 'request_headers',
            'request_body', 'response_status_code', 'response_headers',
            'response_body', 'sent_at', 'completed_at', 'duration_ms',
            'error_message', 'error_code', 'can_retry', 'is_successful',
            'created_at', 'updated_at'
        ]
    
    def get_can_retry(self, obj):
        return obj.can_retry()
    
    def get_is_successful(self, obj):
        return obj.is_successful()


class WebhookEventLogSerializer(serializers.ModelSerializer):
    """Serializer for webhook event logs."""
    
    success_rate = serializers.SerializerMethodField()
    source_object_name = serializers.SerializerMethodField()
    
    class Meta:
        model = WebhookEventLog
        fields = [
            'id', 'branch', 'event_id', 'event_type', 'source_content_type',
            'source_object_id', 'source_object_name', 'event_data',
            'endpoints_notified', 'successful_deliveries', 'failed_deliveries',
            'success_rate', 'is_processed', 'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'source_object_name', 'success_rate', 'created_at', 'updated_at'
        ]
    
    def get_success_rate(self, obj):
        return obj.get_delivery_success_rate()
    
    def get_source_object_name(self, obj):
        if obj.source_object:
            return str(obj.source_object)
        return None
