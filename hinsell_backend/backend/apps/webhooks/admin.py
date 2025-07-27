"""
Django admin configuration for webhook models.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from apps.webhooks.models import (
    WebhookEvent, WebhookEndpoint, WebhookDelivery, WebhookEventLog
)


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = [
        'event_type', 'name', 'category', 'is_system_event', 
        'is_active', 'created_at'
    ]
    list_filter = ['category', 'is_system_event', 'is_active', 'created_at']
    search_fields = ['event_type', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('event_type', 'name', 'category', 'description')
        }),
        ('Configuration', {
            'fields': ('payload_schema', 'requires_permission', 'is_system_event')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'url', 'status', 'success_rate', 'total_deliveries',
        'consecutive_failures', 'last_success_at'
    ]
    list_filter = ['status', 'branch', 'created_at', 'last_success_at']
    search_fields = ['name', 'url']
    readonly_fields = [
        'secret_key', 'total_deliveries', 'successful_deliveries',
        'failed_deliveries', 'consecutive_failures', 'last_delivery_at',
        'last_success_at', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (None, {
            'fields': ('branch', 'name', 'url', 'status')
        }),
        ('Configuration', {
            'fields': (
                'http_method', 'content_type', 'custom_headers',
                'max_retries', 'retry_delay', 'timeout'
            )
        }),
        ('Security', {
            'fields': ('secret_key',),
            'classes': ('collapse',)
        }),
        ('Filtering', {
            'fields': ('filter_conditions',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': (
                'total_deliveries', 'successful_deliveries', 'failed_deliveries',
                'consecutive_failures', 'last_delivery_at', 'last_success_at'
            ),
            'classes': ('collapse',)
        }),
        ('Failure Management', {
            'fields': ('failure_threshold', 'suspended_until'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    filter_horizontal = ['subscribed_events']
    
    def success_rate(self, obj):
        rate = obj.get_success_rate()
        if rate >= 90:
            color = 'green'
        elif rate >= 70:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, rate
        )
    success_rate.short_description = 'Success Rate'
    
    actions = ['reactivate_endpoints', 'suspend_endpoints']
    
    def reactivate_endpoints(self, request, queryset):
        for endpoint in queryset:
            endpoint.reactivate()
        self.message_user(request, f"Reactivated {queryset.count()} endpoints")
    reactivate_endpoints.short_description = "Reactivate selected endpoints"
    
    def suspend_endpoints(self, request, queryset):
        for endpoint in queryset:
            endpoint.suspend()
        self.message_user(request, f"Suspended {queryset.count()} endpoints")
    suspend_endpoints.short_description = "Suspend selected endpoints"


@admin.register(WebhookDelivery)
class WebhookDeliveryAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'endpoint_name', 'event_type', 'status', 'attempt_number',
        'response_status_code', 'duration_ms', 'created_at'
    ]
    list_filter = [
        'status', 'event_type', 'response_status_code', 
        'created_at', 'endpoint__branch'
    ]
    search_fields = ['event_type', 'endpoint__name', 'error_message']
    readonly_fields = [
        'event_id', 'payload', 'request_headers', 'request_body',
        'response_headers', 'response_body', 'sent_at', 'completed_at',
        'duration_ms', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (None, {
            'fields': ('endpoint', 'event_type', 'event_id', 'status')
        }),
        ('Payload', {
            'fields': ('payload',),
            'classes': ('collapse',)
        }),
        ('Request Details', {
            'fields': ('request_headers', 'request_body'),
            'classes': ('collapse',)
        }),
        ('Response Details', {
            'fields': (
                'response_status_code', 'response_headers', 'response_body'
            ),
            'classes': ('collapse',)
        }),
        ('Timing', {
            'fields': ('sent_at', 'completed_at', 'duration_ms')
        }),
        ('Retry Information', {
            'fields': (
                'attempt_number', 'max_attempts', 'next_retry_at'
            )
        }),
        ('Error Information', {
            'fields': ('error_message', 'error_code'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def endpoint_name(self, obj):
        return obj.endpoint.name
    endpoint_name.short_description = 'Endpoint'
    
    def has_add_permission(self, request):
        return False  # Deliveries are created automatically


@admin.register(WebhookEventLog)
class WebhookEventLogAdmin(admin.ModelAdmin):
    list_display = [
        'event_id', 'event_type', 'branch', 'endpoints_notified',
        'successful_deliveries', 'failed_deliveries', 'success_rate',
        'is_processed', 'created_at'
    ]
    list_filter = [
        'event_type', 'branch', 'is_processed', 'created_at'
    ]
    search_fields = ['event_id', 'event_type']
    readonly_fields = [
        'event_id', 'event_data', 'source_content_type', 'source_object_id',
        'endpoints_notified', 'successful_deliveries', 'failed_deliveries',
        'processed_at', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (None, {
            'fields': ('branch', 'event_id', 'event_type', 'is_processed')
        }),
        ('Source Object', {
            'fields': ('source_content_type', 'source_object_id'),
            'classes': ('collapse',)
        }),
        ('Event Data', {
            'fields': ('event_data',),
            'classes': ('collapse',)
        }),
        ('Delivery Statistics', {
            'fields': (
                'endpoints_notified', 'successful_deliveries', 'failed_deliveries'
            )
        }),
        ('Processing', {
            'fields': ('processed_at',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def success_rate(self, obj):
        rate = obj.get_delivery_success_rate()
        if rate >= 90:
            color = 'green'
        elif rate >= 70:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, rate
        )
    success_rate.short_description = 'Success Rate'
    
    def has_add_permission(self, request):
        return False  # Event logs are created automatically
