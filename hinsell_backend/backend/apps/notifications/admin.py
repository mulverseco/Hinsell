"""
Admin configuration for notifications app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from apps.notifications.models import (
    NotificationTemplate, Notification, 
    NotificationPreference, NotificationLog
)


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    """Admin for notification templates."""
    
    list_display = [
        'name', 'notification_type', 'channel', 'branch',
        'is_default', 'is_active', 'created_at'
    ]
    list_filter = [
        'notification_type', 'channel', 'is_default', 
        'is_active', 'branch', 'created_at'
    ]
    search_fields = ['name', 'subject', 'content']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('branch', 'name', 'notification_type', 'channel')
        }),
        ('Content', {
            'fields': ('subject', 'content', 'html_content', 'variables')
        }),
        ('Settings', {
            'fields': ('is_default', 'is_active')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        """Set created_by/updated_by on save."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin for notifications."""
    
    list_display = [
        'id', 'notification_type', 'channel', 'recipient_display',
        'status_colored', 'priority', 'created_at', 'sent_at'
    ]
    list_filter = [
        'status', 'channel', 'notification_type', 'priority',
        'branch', 'created_at', 'sent_at'
    ]
    search_fields = [
        'subject', 'content', 'recipient_email', 'recipient_phone',
        'recipient_user__first_name', 'recipient_user__last_name'
    ]
    readonly_fields = [
        'sent_at', 'delivered_at', 'read_at', 'error_message',
        'retry_count', 'external_id', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('branch', 'template', 'notification_type', 'channel', 'priority')
        }),
        ('Recipients', {
            'fields': ('recipient_user', 'recipient_email', 'recipient_phone')
        }),
        ('Content', {
            'fields': ('subject', 'content', 'html_content', 'context_data')
        }),
        ('Scheduling', {
            'fields': ('scheduled_at', 'status')
        }),
        ('Delivery Tracking', {
            'fields': (
                'sent_at', 'delivered_at', 'read_at', 
                'error_message', 'retry_count', 'max_retries', 'external_id'
            ),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def recipient_display(self, obj):
        """Display recipient information."""
        if obj.recipient_user:
            return obj.recipient_user.get_full_name()
        elif obj.recipient_email:
            return obj.recipient_email
        elif obj.recipient_phone:
            return obj.recipient_phone
        return 'Unknown'
    recipient_display.short_description = 'Recipient'
    
    def status_colored(self, obj):
        """Display status with color coding."""
        colors = {
            'pending': 'orange',
            'sent': 'blue',
            'delivered': 'green',
            'read': 'darkgreen',
            'failed': 'red',
            'cancelled': 'gray',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colored.short_description = 'Status'
    
    actions = ['mark_as_read', 'retry_failed', 'cancel_pending']
    
    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read."""
        count = 0
        for notification in queryset:
            if notification.status in [Notification.Status.SENT, Notification.Status.DELIVERED]:
                notification.mark_as_read()
                count += 1
        
        self.message_user(request, f'{count} notifications marked as read.')
    mark_as_read.short_description = 'Mark selected notifications as read'
    
    def retry_failed(self, request, queryset):
        """Retry failed notifications."""
        count = 0
        for notification in queryset.filter(status=Notification.Status.FAILED):
            if notification.can_retry():
                notification.status = Notification.Status.PENDING
                notification.save()
                count += 1
        
        self.message_user(request, f'{count} notifications scheduled for retry.')
    retry_failed.short_description = 'Retry failed notifications'
    
    def cancel_pending(self, request, queryset):
        """Cancel pending notifications."""
        count = queryset.filter(status=Notification.Status.PENDING).update(
            status=Notification.Status.CANCELLED
        )
        self.message_user(request, f'{count} notifications cancelled.')
    cancel_pending.short_description = 'Cancel pending notifications'


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """Admin for notification preferences."""
    
    list_display = [
        'user', 'email_enabled', 'sms_enabled', 
        'whatsapp_enabled', 'in_app_enabled', 'quiet_hours_enabled'
    ]
    list_filter = [
        'email_enabled', 'sms_enabled', 'whatsapp_enabled', 
        'in_app_enabled', 'quiet_hours_enabled'
    ]
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Email Preferences', {
            'fields': (
                'email_enabled', 'email_welcome', 'email_security',
                'email_inventory', 'email_transactions', 'email_payments'
            )
        }),
        ('SMS Preferences', {
            'fields': ('sms_enabled', 'sms_security', 'sms_urgent')
        }),
        ('WhatsApp Preferences', {
            'fields': (
                'whatsapp_enabled', 'whatsapp_inventory',
                'whatsapp_transactions', 'whatsapp_payments'
            )
        }),
        ('Other Preferences', {
            'fields': ('in_app_enabled',)
        }),
        ('Quiet Hours', {
            'fields': ('quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end')
        })
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    """Admin for notification logs."""
    
    list_display = [
        'notification', 'action', 'created_at', 'has_error'
    ]
    list_filter = ['action', 'created_at']
    search_fields = ['notification__subject', 'error_message']
    readonly_fields = ['notification', 'action', 'details', 'error_message', 'created_at']
    
    def has_error(self, obj):
        """Check if log has error message."""
        return bool(obj.error_message)
    has_error.boolean = True
    has_error.short_description = 'Has Error'
    
    def has_add_permission(self, request):
        """Disable adding logs manually."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable changing logs."""
        return False
