"""
Webhook services for event dispatching and delivery management.
"""
import json
import logging
import requests
import uuid
from datetime import timedelta
from typing import Dict, Any
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.db.models import F

from apps.webhooks.models import (
    WebhookEvent, WebhookEndpoint, WebhookDelivery, 
    WebhookEventLog
)

logger = logging.getLogger(__name__)


class WebhookEventDispatcher:
    """
    Service for dispatching webhook events to subscribed endpoints.
    """
    
    def __init__(self):
        self.logger = logger

    def dispatch_event(
        self, 
        event_type: str, 
        event_data: Dict[str, Any], 
        branch_id: int,
        source_object: Any = None
    ) -> str:
        """
        Dispatch an event to all subscribed webhook endpoints.
        
        Args:
            event_type: Type of event (e.g., 'user.created')
            event_data: Event payload data
            branch_id: Branch ID where event occurred
            source_object: Source object that triggered the event
            
        Returns:
            Event ID for tracking
        """
        event_id = str(uuid.uuid4())
        
        try:
            # Check if event type exists and is active
            try:
                webhook_event = WebhookEvent.objects.get(
                    event_type=event_type,
                    is_active=True
                )
            except WebhookEvent.DoesNotExist:
                self.logger.warning(f"Webhook event type '{event_type}' not found or inactive")
                return event_id
            
            # Create event log
            event_log = self._create_event_log(
                event_id=event_id,
                event_type=event_type,
                event_data=event_data,
                branch_id=branch_id,
                source_object=source_object
            )
            
            # Get active endpoints subscribed to this event
            endpoints = WebhookEndpoint.objects.filter(
                branch_id=branch_id,
                status=WebhookEndpoint.Status.ACTIVE,
                subscribed_events=webhook_event
            ).prefetch_related('subscribed_events')
            
            if not endpoints.exists():
                self.logger.debug(f"No active endpoints found for event '{event_type}' in branch {branch_id}")
                event_log.is_processed = True
                event_log.processed_at = timezone.now()
                event_log.save()
                return event_id
            
            # Filter endpoints based on their filter conditions
            filtered_endpoints = []
            for endpoint in endpoints:
                if endpoint.should_deliver_event(event_data):
                    filtered_endpoints.append(endpoint)
            
            if not filtered_endpoints:
                self.logger.debug(f"No endpoints passed filter conditions for event '{event_type}'")
                event_log.is_processed = True
                event_log.processed_at = timezone.now()
                event_log.save()
                return event_id
            
            # Create delivery records for each endpoint
            deliveries_created = 0
            for endpoint in filtered_endpoints:
                try:
                    self._create_delivery_record(
                        endpoint=endpoint,
                        event_type=event_type,
                        event_id=event_id,
                        event_data=event_data
                    )
                    deliveries_created += 1
                except Exception as e:
                    self.logger.error(f"Failed to create delivery record for endpoint {endpoint.id}: {e}")
            
            # Update event log
            event_log.endpoints_notified = deliveries_created
            event_log.is_processed = True
            event_log.processed_at = timezone.now()
            event_log.save()
            
            self.logger.info(f"Event '{event_type}' dispatched to {deliveries_created} endpoints")
            
        except Exception as e:
            self.logger.error(f"Failed to dispatch event '{event_type}': {e}")
        
        return event_id

    def _create_event_log(
        self, 
        event_id: str, 
        event_type: str, 
        event_data: Dict[str, Any],
        branch_id: int,
        source_object: Any = None
    ) -> WebhookEventLog:
        """Create event log record."""
        
        # Get content type and object ID if source object provided
        source_content_type = None
        source_object_id = None
        
        if source_object:
            source_content_type = ContentType.objects.get_for_model(source_object)
            source_object_id = source_object.pk
        
        return WebhookEventLog.objects.create(
            branch_id=branch_id,
            event_id=event_id,
            event_type=event_type,
            event_data=event_data,
            source_content_type=source_content_type,
            source_object_id=source_object_id
        )

    def _create_delivery_record(
        self, 
        endpoint: WebhookEndpoint, 
        event_type: str, 
        event_id: str,
        event_data: Dict[str, Any]
    ) -> WebhookDelivery:
        """Create delivery record for webhook endpoint."""
        
        # Prepare payload
        payload = {
            'event_id': event_id,
            'event_type': event_type,
            'timestamp': timezone.now().isoformat(),
            'data': event_data
        }
        
        return WebhookDelivery.objects.create(
            endpoint=endpoint,
            event_type=event_type,
            event_id=event_id,
            payload=payload,
            max_attempts=endpoint.max_retries + 1,  # +1 for initial attempt
            next_retry_at=timezone.now()  # Schedule for immediate delivery
        )


class WebhookDeliveryService:
    """
    Service for delivering webhook payloads to endpoints.
    """
    
    def __init__(self):
        self.logger = logger
        self.session = requests.Session()
        
        # Configure session defaults
        self.session.headers.update({
            'User-Agent': f'PharmacyWebhook/1.0 (+{getattr(settings, "WEBHOOK_USER_AGENT_URL", "")})'
        })

    def deliver_webhook(self, delivery_id: int) -> bool:
        """
        Deliver webhook payload to endpoint.
        
        Args:
            delivery_id: WebhookDelivery ID
            
        Returns:
            True if delivery successful, False otherwise
        """
        try:
            delivery = WebhookDelivery.objects.select_related('endpoint').get(id=delivery_id)
        except WebhookDelivery.DoesNotExist:
            self.logger.error(f"Webhook delivery {delivery_id} not found")
            return False
        
        if delivery.status != WebhookDelivery.Status.PENDING:
            self.logger.warning(f"Delivery {delivery_id} is not in pending status")
            return False
        
        endpoint = delivery.endpoint
        
        # Check if endpoint is active and not suspended
        if endpoint.status != WebhookEndpoint.Status.ACTIVE:
            delivery.mark_as_failed(f"Endpoint is {endpoint.get_status_display().lower()}")
            return False
        
        if endpoint.suspended_until and timezone.now() < endpoint.suspended_until:
            delivery.mark_as_failed("Endpoint is suspended")
            return False
        
        try:
            # Update delivery status
            delivery.status = WebhookDelivery.Status.SENDING
            delivery.sent_at = timezone.now()
            delivery.save()
            
            # Prepare request
            payload_json = json.dumps(delivery.payload, separators=(',', ':'))
            signature = endpoint.generate_signature(payload_json)
            
            headers = {
                'Content-Type': endpoint.content_type,
                'X-Webhook-Signature': f'sha256={signature}',
                'X-Webhook-Event': delivery.event_type,
                'X-Webhook-Delivery': str(delivery.id),
                'X-Webhook-Timestamp': str(int(delivery.sent_at.timestamp())),
            }
            
            # Add custom headers
            if endpoint.custom_headers:
                headers.update(endpoint.custom_headers)
            
            delivery.request_headers = headers
            delivery.request_body = payload_json
            
            # Make HTTP request
            start_time = timezone.now()
            
            response = self.session.request(
                method=endpoint.http_method,
                url=endpoint.url,
                data=payload_json,
                headers=headers,
                timeout=endpoint.timeout,
                allow_redirects=False
            )
            
            end_time = timezone.now()
            duration_ms = int((end_time - start_time).total_seconds() * 1000)
            
            # Update delivery with response
            delivery.response_status_code = response.status_code
            delivery.response_headers = dict(response.headers)
            delivery.response_body = response.text[:10000]  # Limit response body size
            delivery.duration_ms = duration_ms
            
            # Check if delivery was successful
            if 200 <= response.status_code < 300:
                delivery.mark_as_success()
                self.logger.info(f"Webhook delivered successfully to {endpoint.url} (delivery {delivery.id})")
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:500]}"
                delivery.mark_as_failed(error_msg, f"HTTP_{response.status_code}")
                self.logger.warning(f"Webhook delivery failed with HTTP {response.status_code}: {endpoint.url}")
                return False
                
        except requests.exceptions.Timeout:
            delivery.mark_as_failed("Request timeout", "TIMEOUT")
            self.logger.warning(f"Webhook delivery timeout: {endpoint.url}")
            return False
            
        except requests.exceptions.ConnectionError as e:
            delivery.mark_as_failed(f"Connection error: {str(e)}", "CONNECTION_ERROR")
            self.logger.warning(f"Webhook delivery connection error: {endpoint.url}")
            return False
            
        except requests.exceptions.RequestException as e:
            delivery.mark_as_failed(f"Request error: {str(e)}", "REQUEST_ERROR")
            self.logger.error(f"Webhook delivery request error: {endpoint.url} - {e}")
            return False
            
        except Exception as e:
            delivery.mark_as_failed(f"Unexpected error: {str(e)}", "UNEXPECTED_ERROR")
            self.logger.error(f"Unexpected error during webhook delivery: {e}")
            return False

    def process_pending_deliveries(self) -> int:
        """
        Process all pending webhook deliveries.
        
        Returns:
            Number of deliveries processed
        """
        # Get pending deliveries ready for delivery/retry
        pending_deliveries = WebhookDelivery.objects.filter(
            status=WebhookDelivery.Status.PENDING,
            next_retry_at__lte=timezone.now()
        ).select_related('endpoint')[:100]  # Process in batches
        
        processed_count = 0
        
        for delivery in pending_deliveries:
            try:
                self.deliver_webhook(delivery.id)
                processed_count += 1
            except Exception as e:
                self.logger.error(f"Error processing delivery {delivery.id}: {e}")
        
        return processed_count

    def retry_failed_deliveries(self) -> int:
        """
        Retry failed webhook deliveries that are eligible for retry.
        
        Returns:
            Number of retries attempted
        """
        # Get failed deliveries eligible for retry
        failed_deliveries = WebhookDelivery.objects.filter(
            status=WebhookDelivery.Status.FAILED,
            next_retry_at__lte=timezone.now(),
            attempt_number__lt=F('max_attempts')
        ).select_related('endpoint')[:50]  # Process in smaller batches for retries
        
        retry_count = 0
        
        for delivery in failed_deliveries:
            try:
                # Create new delivery attempt
                delivery.attempt_number += 1
                delivery.status = WebhookDelivery.Status.PENDING
                delivery.error_message = ""
                delivery.error_code = None
                delivery.save()
                
                # Attempt delivery
                self.deliver_webhook(delivery.id)
                retry_count += 1
                
            except Exception as e:
                self.logger.error(f"Error retrying delivery {delivery.id}: {e}")
        
        return retry_count

    def cleanup_old_deliveries(self, days: int = 30) -> int:
        """
        Clean up old webhook delivery records.
        
        Args:
            days: Number of days to keep records
            
        Returns:
            Number of records deleted
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        
        deleted_count, _ = WebhookDelivery.objects.filter(
            created_at__lt=cutoff_date,
            status__in=[
                WebhookDelivery.Status.SUCCESS,
                WebhookDelivery.Status.FAILED,
                WebhookDelivery.Status.CANCELLED
            ]
        ).delete()
        
        self.logger.info(f"Cleaned up {deleted_count} old webhook delivery records")
        return deleted_count


# Convenience functions for triggering events
def trigger_webhook_event(
    event_type: str,
    event_data: Dict[str, Any],
    branch_id: int,
    source_object: Any = None
) -> str:
    """
    Convenience function to trigger a webhook event.
    
    Args:
        event_type: Type of event
        event_data: Event data
        branch_id: Branch ID
        source_object: Source object that triggered the event
        
    Returns:
        Event ID
    """
    dispatcher = WebhookEventDispatcher()
    return dispatcher.dispatch_event(event_type, event_data, branch_id, source_object)
