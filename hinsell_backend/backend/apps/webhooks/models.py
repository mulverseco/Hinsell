"""
Webhook system models for event-driven integrations.
Handles webhook endpoints, events, deliveries, and security.
"""
import hashlib
import hmac
import json
import logging
import secrets
import uuid
from datetime import timedelta
from typing import Dict, List, Optional, Any

from django.db import models
from django.core.validators import URLValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

from apps.core_apps.general import AuditableModel
from apps.organization.models import Branch
from apps.authentication.models import User

logger = logging.getLogger(__name__)


class WebhookEvent(AuditableModel):
    """
    Define available webhook events that can be subscribed to.
    """
    
    class EventCategory(models.TextChoices):
        USER = 'user', _('User Events')
        INVENTORY = 'inventory', _('Inventory Events')
        TRANSACTION = 'transaction', _('Transaction Events')
        PAYMENT = 'payment', _('Payment Events')
        MEDICAL = 'medical', _('Medical Events')
        SYSTEM = 'system', _('System Events')
        CUSTOM = 'custom', _('Custom Events')

    event_type = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Event Type"),
        help_text=_("Unique identifier for the event type (e.g., 'user.created', 'inventory.low_stock')")
    )
    
    name = models.CharField(
        max_length=200,
        verbose_name=_("Event Name"),
        help_text=_("Human-readable name for the event")
    )
    
    category = models.CharField(
        max_length=20,
        choices=EventCategory.choices,
        verbose_name=_("Category"),
        help_text=_("Event category for organization")
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Detailed description of when this event is triggered")
    )
    
    payload_schema = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Payload Schema"),
        help_text=_("JSON schema describing the event payload structure")
    )
    
    is_system_event = models.BooleanField(
        default=False,
        verbose_name=_("System Event"),
        help_text=_("Whether this is a built-in system event")
    )
    
    requires_permission = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Required Permission"),
        help_text=_("Permission required to subscribe to this event")
    )

    class Meta:
        verbose_name = _("Webhook Event")
        verbose_name_plural = _("Webhook Events")
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]

    def clean(self):
        """Custom validation for webhook event."""
        super().clean()
        
        if not self.event_type.strip():
            raise ValidationError({
                'event_type': _('Event type cannot be empty.')
            })
        
        # Validate event type format (should be like 'category.action')
        if '.' not in self.event_type:
            raise ValidationError({
                'event_type': _('Event type should follow format "category.action" (e.g., "user.created")')
            })

    def __str__(self):
        return f"{self.event_type} - {self.name}"


class WebhookEndpoint(AuditableModel):
    """
    Webhook endpoint configuration with security and filtering options.
    """
    
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        INACTIVE = 'inactive', _('Inactive')
        SUSPENDED = 'suspended', _('Suspended')
        FAILED = 'failed', _('Failed')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='webhook_endpoints',
        verbose_name=_("Branch")
    )
    
    name = models.CharField(
        max_length=200,
        verbose_name=_("Endpoint Name"),
        help_text=_("Descriptive name for this webhook endpoint")
    )
    
    url = models.URLField(
        max_length=500,
        validators=[URLValidator()],
        verbose_name=_("Webhook URL"),
        help_text=_("URL where webhook payloads will be sent")
    )
    
    secret_key = models.CharField(
        max_length=255,
        verbose_name=_("Secret Key"),
        help_text=_("Secret key for HMAC signature verification")
    )
    
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name=_("Status"),
        help_text=_("Current status of the webhook endpoint")
    )
    
    # Event subscriptions
    subscribed_events = models.ManyToManyField(
        WebhookEvent,
        related_name='endpoints',
        verbose_name=_("Subscribed Events"),
        help_text=_("Events this endpoint is subscribed to")
    )
    
    # HTTP configuration
    http_method = models.CharField(
        max_length=10,
        choices=[('POST', 'POST'), ('PUT', 'PUT'), ('PATCH', 'PATCH')],
        default='POST',
        verbose_name=_("HTTP Method"),
        help_text=_("HTTP method to use for webhook delivery")
    )
    
    content_type = models.CharField(
        max_length=50,
        default='application/json',
        verbose_name=_("Content Type"),
        help_text=_("Content-Type header for webhook requests")
    )
    
    custom_headers = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Custom Headers"),
        help_text=_("Additional HTTP headers to include in webhook requests")
    )
    
    # Retry configuration
    max_retries = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name=_("Max Retries"),
        help_text=_("Maximum number of delivery retry attempts")
    )
    
    retry_delay = models.PositiveIntegerField(
        default=60,
        validators=[MinValueValidator(1), MaxValueValidator(3600)],
        verbose_name=_("Retry Delay"),
        help_text=_("Initial retry delay in seconds (exponential backoff)")
    )
    
    timeout = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(5), MaxValueValidator(300)],
        verbose_name=_("Timeout"),
        help_text=_("Request timeout in seconds")
    )
    
    # Filtering options
    filter_conditions = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Filter Conditions"),
        help_text=_("Conditions to filter which events trigger this webhook")
    )
    
    # Statistics
    total_deliveries = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Total Deliveries"),
        help_text=_("Total number of delivery attempts")
    )
    
    successful_deliveries = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Successful Deliveries"),
        help_text=_("Number of successful deliveries")
    )
    
    failed_deliveries = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Failed Deliveries"),
        help_text=_("Number of failed deliveries")
    )
    
    last_delivery_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Delivery"),
        help_text=_("Timestamp of last delivery attempt")
    )
    
    last_success_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Last Success"),
        help_text=_("Timestamp of last successful delivery")
    )
    
    # Failure tracking
    consecutive_failures = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Consecutive Failures"),
        help_text=_("Number of consecutive failed deliveries")
    )
    
    failure_threshold = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        verbose_name=_("Failure Threshold"),
        help_text=_("Number of consecutive failures before suspending endpoint")
    )
    
    suspended_until = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Suspended Until"),
        help_text=_("Timestamp until which endpoint is suspended")
    )

    class Meta:
        verbose_name = _("Webhook Endpoint")
        verbose_name_plural = _("Webhook Endpoints")
        unique_together = [
            ['branch', 'name']
        ]
        indexes = [
            models.Index(fields=['branch', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['last_delivery_at']),
            models.Index(fields=['consecutive_failures']),
        ]

    def clean(self):
        """Custom validation for webhook endpoint."""
        super().clean()
        
        if not self.name.strip():
            raise ValidationError({
                'name': _('Endpoint name cannot be empty.')
            })
        
        if not self.url.strip():
            raise ValidationError({
                'url': _('Webhook URL cannot be empty.')
            })

    def save(self, *args, **kwargs):
        """Override save to generate secret key if not provided."""
        if not self.secret_key:
            self.secret_key = self.generate_secret_key()
        
        super().save(*args, **kwargs)

    @staticmethod
    def generate_secret_key() -> str:
        """Generate a secure secret key for webhook signing."""
        return secrets.token_urlsafe(32)

    def generate_signature(self, payload: str) -> str:
        """Generate HMAC signature for payload verification."""
        return hmac.new(
            self.secret_key.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def verify_signature(self, payload: str, signature: str) -> bool:
        """Verify HMAC signature of received payload."""
        expected_signature = self.generate_signature(payload)
        return hmac.compare_digest(expected_signature, signature)

    def is_subscribed_to(self, event_type: str) -> bool:
        """Check if endpoint is subscribed to a specific event type."""
        return self.subscribed_events.filter(
            event_type=event_type,
            is_active=True
        ).exists()

    def should_deliver_event(self, event_data: Dict[str, Any]) -> bool:
        """Check if event should be delivered based on filter conditions."""
        if not self.filter_conditions:
            return True
        
        # Implement filtering logic based on conditions
        # This is a simplified example - you can extend this
        for field, condition in self.filter_conditions.items():
            if field in event_data:
                if isinstance(condition, dict):
                    operator = condition.get('operator', 'equals')
                    value = condition.get('value')
                    
                    if operator == 'equals' and event_data[field] != value:
                        return False
                    elif operator == 'not_equals' and event_data[field] == value:
                        return False
                    elif operator == 'contains' and value not in str(event_data[field]):
                        return False
                elif event_data[field] != condition:
                    return False
        
        return True

    def get_success_rate(self) -> float:
        """Calculate delivery success rate."""
        if self.total_deliveries == 0:
            return 0.0
        return (self.successful_deliveries / self.total_deliveries) * 100

    def is_healthy(self) -> bool:
        """Check if endpoint is healthy (low failure rate)."""
        if self.status != self.Status.ACTIVE:
            return False
        
        if self.consecutive_failures >= self.failure_threshold:
            return False
        
        success_rate = self.get_success_rate()
        return success_rate >= 80.0  # Consider healthy if >80% success rate

    def suspend(self, duration_minutes: int = 60):
        """Suspend endpoint for specified duration."""
        self.status = self.Status.SUSPENDED
        self.suspended_until = timezone.now() + timedelta(minutes=duration_minutes)
        self.save(update_fields=['status', 'suspended_until'])
        
        logger.warning(f"Webhook endpoint {self.name} suspended for {duration_minutes} minutes")

    def reactivate(self):
        """Reactivate suspended endpoint."""
        if self.status == self.Status.SUSPENDED:
            self.status = self.Status.ACTIVE
            self.suspended_until = None
            self.consecutive_failures = 0
            self.save(update_fields=['status', 'suspended_until', 'consecutive_failures'])
            
            logger.info(f"Webhook endpoint {self.name} reactivated")

    def record_delivery_attempt(self, success: bool):
        """Record delivery attempt statistics."""
        self.total_deliveries += 1
        self.last_delivery_at = timezone.now()
        
        if success:
            self.successful_deliveries += 1
            self.consecutive_failures = 0
            self.last_success_at = timezone.now()
            
            # Reactivate if was suspended due to failures
            if self.status == self.Status.SUSPENDED:
                self.reactivate()
        else:
            self.failed_deliveries += 1
            self.consecutive_failures += 1
            
            # Auto-suspend if failure threshold reached
            if self.consecutive_failures >= self.failure_threshold:
                self.suspend()
        
        self.save(update_fields=[
            'total_deliveries', 'successful_deliveries', 'failed_deliveries',
            'consecutive_failures', 'last_delivery_at', 'last_success_at'
        ])

    def __str__(self):
        return f"{self.name} ({self.url})"


class WebhookDelivery(AuditableModel):
    """
    Track individual webhook delivery attempts with detailed logging.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        SENDING = 'sending', _('Sending')
        SUCCESS = 'success', _('Success')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')

    endpoint = models.ForeignKey(
        WebhookEndpoint,
        on_delete=models.CASCADE,
        related_name='deliveries',
        verbose_name=_("Webhook Endpoint")
    )
    
    event_type = models.CharField(
        max_length=100,
        verbose_name=_("Event Type"),
        help_text=_("Type of event that triggered this delivery")
    )
    
    event_id = models.UUIDField(
        verbose_name=_("Event ID"),
        help_text=_("Unique identifier for the event")
    )
    
    payload = models.JSONField(
        verbose_name=_("Payload"),
        help_text=_("JSON payload sent to webhook endpoint")
    )
    
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name=_("Status"),
        help_text=_("Current delivery status")
    )
    
    # Request details
    request_headers = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Request Headers"),
        help_text=_("HTTP headers sent with the request")
    )
    
    request_body = models.TextField(
        blank=True,
        verbose_name=_("Request Body"),
        help_text=_("Raw request body sent")
    )
    
    # Response details
    response_status_code = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Response Status Code"),
        help_text=_("HTTP status code received")
    )
    
    response_headers = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Response Headers"),
        help_text=_("HTTP headers received in response")
    )
    
    response_body = models.TextField(
        blank=True,
        verbose_name=_("Response Body"),
        help_text=_("Response body received")
    )
    
    # Timing information
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Sent At"),
        help_text=_("Timestamp when request was sent")
    )
    
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Completed At"),
        help_text=_("Timestamp when delivery completed")
    )
    
    duration_ms = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Duration (ms)"),
        help_text=_("Request duration in milliseconds")
    )
    
    # Retry information
    attempt_number = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Attempt Number"),
        help_text=_("Delivery attempt number (1 for first attempt)")
    )
    
    max_attempts = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Max Attempts"),
        help_text=_("Maximum number of attempts for this delivery")
    )
    
    next_retry_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Next Retry At"),
        help_text=_("Timestamp for next retry attempt")
    )
    
    # Error information
    error_message = models.TextField(
        blank=True,
        verbose_name=_("Error Message"),
        help_text=_("Error message if delivery failed")
    )
    
    error_code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Error Code"),
        help_text=_("Error code for categorizing failures")
    )

    class Meta:
        verbose_name = _("Webhook Delivery")
        verbose_name_plural = _("Webhook Deliveries")
        indexes = [
            models.Index(fields=['endpoint', 'status']),
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['status', 'next_retry_at']),
            models.Index(fields=['created_at']),
            models.Index(fields=['event_id']),
        ]

    def is_successful(self) -> bool:
        """Check if delivery was successful."""
        return (self.status == self.Status.SUCCESS and 
                self.response_status_code and 
                200 <= self.response_status_code < 300)

    def can_retry(self) -> bool:
        """Check if delivery can be retried."""
        return (self.status == self.Status.FAILED and 
                self.attempt_number < self.max_attempts and
                self.next_retry_at and
                timezone.now() >= self.next_retry_at)

    def calculate_next_retry(self):
        """Calculate next retry timestamp with exponential backoff."""
        if self.attempt_number >= self.max_attempts:
            return None
        
        # Exponential backoff: base_delay * (2 ^ attempt_number)
        base_delay = self.endpoint.retry_delay
        delay_seconds = base_delay * (2 ** (self.attempt_number - 1))
        
        # Cap maximum delay at 1 hour
        delay_seconds = min(delay_seconds, 3600)
        
        return timezone.now() + timedelta(seconds=delay_seconds)

    def mark_as_failed(self, error_message: str, error_code: str = None):
        """Mark delivery as failed and schedule retry if applicable."""
        self.status = self.Status.FAILED
        self.error_message = error_message
        self.error_code = error_code
        self.completed_at = timezone.now()
        
        # Calculate next retry if within attempt limits
        if self.attempt_number < self.max_attempts:
            self.next_retry_at = self.calculate_next_retry()
        
        self.save()
        
        # Update endpoint statistics
        self.endpoint.record_delivery_attempt(success=False)

    def mark_as_success(self):
        """Mark delivery as successful."""
        self.status = self.Status.SUCCESS
        self.completed_at = timezone.now()
        self.save()
        
        # Update endpoint statistics
        self.endpoint.record_delivery_attempt(success=True)

    def __str__(self):
        return f"{self.endpoint.name} - {self.event_type} ({self.get_status_display()})"


class WebhookEventLog(AuditableModel):
    """
    Log of webhook events triggered in the system.
    """
    
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='webhook_event_logs',
        verbose_name=_("Branch")
    )
    
    event_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        verbose_name=_("Event ID"),
        help_text=_("Unique identifier for this event")
    )
    
    event_type = models.CharField(
        max_length=100,
        verbose_name=_("Event Type"),
        help_text=_("Type of event that occurred")
    )
    
    # Source object information
    source_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_("Source Content Type")
    )
    
    source_object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Source Object ID")
    )
    
    source_object = GenericForeignKey('source_content_type', 'source_object_id')
    
    # Event data
    event_data = models.JSONField(
        verbose_name=_("Event Data"),
        help_text=_("Data associated with the event")
    )
    
    # Delivery tracking
    endpoints_notified = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Endpoints Notified"),
        help_text=_("Number of endpoints that were notified")
    )
    
    successful_deliveries = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Successful Deliveries"),
        help_text=_("Number of successful deliveries")
    )
    
    failed_deliveries = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Failed Deliveries"),
        help_text=_("Number of failed deliveries")
    )
    
    # Processing status
    is_processed = models.BooleanField(
        default=False,
        verbose_name=_("Processed"),
        help_text=_("Whether event has been processed for webhook delivery")
    )
    
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Processed At"),
        help_text=_("Timestamp when event was processed")
    )

    class Meta:
        verbose_name = _("Webhook Event Log")
        verbose_name_plural = _("Webhook Event Logs")
        indexes = [
            models.Index(fields=['branch', 'event_type']),
            models.Index(fields=['event_id']),
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['is_processed']),
            models.Index(fields=['source_content_type', 'source_object_id']),
        ]

    def get_delivery_success_rate(self) -> float:
        """Calculate delivery success rate for this event."""
        if self.endpoints_notified == 0:
            return 0.0
        return (self.successful_deliveries / self.endpoints_notified) * 100

    def __str__(self):
        return f"{self.event_type} - {self.event_id}"
