"""
Serializers for notifications app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.notifications.models import (
    NotificationTemplate, Notification, 
    NotificationPreference, NotificationLog
)

User = get_user_model()


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for notification templates."""
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'branch', 'name', 'notification_type', 'channel',
            'subject', 'content', 'html_content', 'variables',
            'is_default', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Custom validation for notification templates."""
        if data.get('channel') == 'email' and not data.get('html_content'):
            if '<' in data.get('content', ''):
                data['html_content'] = data['content']
        
        return data


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    
    template_name = serializers.CharField(source='template.name', read_only=True)
    recipient_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'branch', 'template', 'template_name',
            'recipient_user', 'recipient_email', 'recipient_phone', 'recipient_name',
            'channel', 'channel_display', 'notification_type', 'type_display',
            'priority', 'priority_display', 'subject', 'content', 'html_content',
            'context_data', 'status', 'status_display',
            'scheduled_at', 'sent_at', 'delivered_at', 'read_at',
            'error_message', 'retry_count', 'max_retries', 'external_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'sent_at', 'delivered_at', 'read_at', 'error_message',
            'retry_count', 'external_id', 'created_at', 'updated_at'
        ]
    
    def get_recipient_name(self, obj):
        """Get recipient display name."""
        if obj.recipient_user:
            return obj.recipient_user.get_full_name()
        elif obj.recipient_email:
            return obj.recipient_email
        elif obj.recipient_phone:
            return obj.recipient_phone
        return 'Unknown'


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'user_name',
            'email_enabled', 'email_welcome', 'email_security',
            'email_inventory', 'email_transactions', 'email_payments',
            'sms_enabled', 'sms_security', 'sms_urgent',
            'whatsapp_enabled', 'whatsapp_inventory',
            'whatsapp_transactions', 'whatsapp_payments',
            'in_app_enabled',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class NotificationLogSerializer(serializers.ModelSerializer):
    """Serializer for notification logs."""
    
    notification_subject = serializers.CharField(source='notification.subject', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = NotificationLog
        fields = [
            'id', 'notification', 'notification_subject',
            'action', 'action_display', 'details', 'error_message',
            'created_at'
        ]
        read_only_fields = ['created_at']


class SendNotificationSerializer(serializers.Serializer):
    """Serializer for sending notifications."""
    
    notification_type = serializers.ChoiceField(
        choices=NotificationTemplate.NotificationType.choices
    )
    channel = serializers.ChoiceField(
        choices=NotificationTemplate.Channel.choices
    )
    recipient_users = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    recipient_emails = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
        allow_empty=True
    )
    recipient_phones = serializers.ListField(
        child=serializers.CharField(max_length=20),
        required=False,
        allow_empty=True
    )
    template_id = serializers.IntegerField(required=False)
    subject = serializers.CharField(max_length=200, required=False)
    content = serializers.CharField(required=False)
    html_content = serializers.CharField(required=False)
    context_data = serializers.JSONField(default=dict)
    priority = serializers.ChoiceField(
        choices=Notification.Priority.choices,
        default=Notification.Priority.NORMAL
    )
    scheduled_at = serializers.DateTimeField(required=False)
    
    def validate(self, data):
        """Custom validation for send notification."""
        # Ensure at least one recipient is specified
        recipients = (
            data.get('recipient_users', []) +
            data.get('recipient_emails', []) +
            data.get('recipient_phones', [])
        )
        
        if not recipients:
            raise serializers.ValidationError(
                "At least one recipient must be specified."
            )
        
        # If template is not specified, subject and content are required
        if not data.get('template_id'):
            if not data.get('subject') or not data.get('content'):
                raise serializers.ValidationError(
                    "Subject and content are required when not using a template."
                )
        
        return data


class TemplatePreviewSerializer(serializers.Serializer):
    """Serializer for template preview."""
    
    template_id = serializers.IntegerField()
    context_data = serializers.JSONField(default=dict)


class NotificationStatsSerializer(serializers.Serializer):
    """Serializer for notification statistics."""
    
    date_from = serializers.DateField()
    date_to = serializers.DateField()
    channel = serializers.ChoiceField(
        choices=NotificationTemplate.Channel.choices,
        required=False
    )
    notification_type = serializers.ChoiceField(
        choices=NotificationTemplate.NotificationType.choices,
        required=False
    )
