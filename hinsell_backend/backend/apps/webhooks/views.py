"""
API views for webhook management.
"""
import json
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.core_apps.general import BaseViewSet
from apps.webhooks.models import WebhookEvent, WebhookEndpoint, WebhookDelivery, WebhookEventLog
from apps.webhooks.serializers import (
    WebhookEventSerializer, WebhookEndpointSerializer, 
    WebhookDeliverySerializer, WebhookEventLogSerializer
)
from apps.webhooks.services import trigger_webhook_event


class WebhookEventViewSet(BaseViewSet):
    """ViewSet for webhook events."""
    queryset = WebhookEvent.objects.all()
    serializer_class = WebhookEventSerializer
    filterset_fields = ['category', 'is_system_event', 'is_active']
    search_fields = ['event_type', 'name', 'description']
    ordering_fields = ['event_type', 'name', 'category', 'created_at']
    ordering = ['category', 'event_type']


class WebhookEndpointViewSet(BaseViewSet):
    """ViewSet for webhook endpoints."""
    queryset = WebhookEndpoint.objects.all()
    serializer_class = WebhookEndpointSerializer
    filterset_fields = ['status', 'branch']
    search_fields = ['name', 'url']
    ordering_fields = ['name', 'status', 'created_at', 'last_success_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter endpoints by user's branch."""
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'default_branch') and self.request.user.default_branch:
            queryset = queryset.filter(branch=self.request.user.default_branch)
        return queryset

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """Test webhook endpoint with sample payload."""
        endpoint = self.get_object()
        
        # Create test event
        test_data = {
            'test': True,
            'message': 'This is a test webhook delivery',
            'timestamp': timezone.now().isoformat(),
            'endpoint_name': endpoint.name
        }
        
        event_id = trigger_webhook_event(
            event_type='system.test',
            event_data=test_data,
            branch_id=endpoint.branch_id,
            source_object=endpoint
        )
        
        return Response({
            'message': 'Test webhook triggered',
            'event_id': event_id
        })

    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Reactivate suspended endpoint."""
        endpoint = self.get_object()
        endpoint.reactivate()
        
        return Response({
            'message': f'Endpoint {endpoint.name} reactivated'
        })

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend endpoint."""
        endpoint = self.get_object()
        duration = request.data.get('duration_minutes', 60)
        endpoint.suspend(duration)
        
        return Response({
            'message': f'Endpoint {endpoint.name} suspended for {duration} minutes'
        })

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get endpoint statistics."""
        endpoint = self.get_object()
        
        return Response({
            'total_deliveries': endpoint.total_deliveries,
            'successful_deliveries': endpoint.successful_deliveries,
            'failed_deliveries': endpoint.failed_deliveries,
            'success_rate': endpoint.get_success_rate(),
            'consecutive_failures': endpoint.consecutive_failures,
            'is_healthy': endpoint.is_healthy(),
            'last_delivery_at': endpoint.last_delivery_at,
            'last_success_at': endpoint.last_success_at,
        })


class WebhookDeliveryViewSet(BaseViewSet):
    """ViewSet for webhook deliveries."""
    queryset = WebhookDelivery.objects.all()
    serializer_class = WebhookDeliverySerializer
    filterset_fields = ['status', 'event_type', 'endpoint']
    search_fields = ['event_type', 'endpoint__name']
    ordering_fields = ['created_at', 'sent_at', 'completed_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter deliveries by user's branch."""
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'default_branch') and self.request.user.default_branch:
            queryset = queryset.filter(endpoint__branch=self.request.user.default_branch)
        return queryset

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry failed delivery."""
        delivery = self.get_object()
        
        if not delivery.can_retry():
            return Response(
                {'error': 'Delivery cannot be retried'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reset delivery for retry
        delivery.attempt_number += 1
        delivery.status = WebhookDelivery.Status.PENDING
        delivery.error_message = ""
        delivery.error_code = None
        delivery.next_retry_at = timezone.now()
        delivery.save()
        
        return Response({
            'message': 'Delivery queued for retry',
            'attempt_number': delivery.attempt_number
        })


class WebhookEventLogViewSet(BaseViewSet):
    """ViewSet for webhook event logs."""
    queryset = WebhookEventLog.objects.all()
    serializer_class = WebhookEventLogSerializer
    filterset_fields = ['event_type', 'branch', 'is_processed']
    search_fields = ['event_type', 'event_id']
    ordering_fields = ['created_at', 'processed_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter event logs by user's branch."""
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'default_branch') and self.request.user.default_branch:
            queryset = queryset.filter(branch=self.request.user.default_branch)
        return queryset
