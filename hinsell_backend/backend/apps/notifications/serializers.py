import logging
from typing import Dict, Any
from rest_framework import serializers
from django.utils import timezone
from apps.notifications.models import Notification, NotificationTemplate, NotificationLog, InternalMessage, UserNote
from apps.authentication.models import User
from apps.shared.models import Media

logger = logging.getLogger(__name__)

class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for NotificationTemplate model."""
    class Meta:
        model = NotificationTemplate
        fields = ['id', 'code', 'name', 'notification_type', 'channel', 'subject', 'content', 'html_content', 
                 'variables', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate notification template data."""
        if data.get('channel') == NotificationTemplate.Channel.EMAIL and not data.get('subject'):
            raise serializers.ValidationError({'subject': 'Subject is required for email notifications.'})
        return data

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    template = NotificationTemplateSerializer(read_only=True)
    recipient_email = serializers.EmailField(write_only=True, required=False)
    recipient_phone = serializers.CharField(write_only=True, required=False)
    attachments = serializers.PrimaryKeyRelatedField(many=True, queryset=Media.objects.all(), required=False)

    class Meta:
        model = Notification
        fields = ['id', 'branch', 'template', 'recipient', 'recipient_email', 'recipient_phone', 'channel', 
                 'notification_type', 'priority', 'recurrence', 'subject', 'content', 'html_content', 
                 'context_data', 'attachments', 'status', 'scheduled_at', 'sent_at', 'delivered_at', 
                 'read_at', 'error_message', 'retry_count', 'max_retries', 'external_id', 'created_at', 
                 'updated_at']
        read_only_fields = ['id', 'status', 'sent_at', 'delivered_at', 'read_at', 'error_message', 
                           'retry_count', 'external_id', 'created_at', 'updated_at']

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate notification data."""
        if not (data.get('recipient') or data.get('recipient_email') or data.get('recipient_phone')):
            raise serializers.ValidationError('Either recipient, email, or phone number must be provided.')
        
        if data.get('channel') in ('sms', 'whatsapp') and not (data.get('recipient_phone') or 
            (data.get('recipient') and data.get('recipient').profile.phone_number)):
            raise serializers.ValidationError('Phone number is required for SMS or WhatsApp notifications.')
        
        if data.get('channel') == 'email' and not (data.get('recipient_email') or 
            (data.get('recipient') and data.get('recipient').email)):
            raise serializers.ValidationError('Email is required for email notifications.')
        
        if data.get('scheduled_at') and data.get('scheduled_at') < timezone.now():
            raise serializers.ValidationError('Scheduled time cannot be in the past.')
        
        if data.get('recurrence') != Notification.Recurrence.NONE and not data.get('scheduled_at'):
            raise serializers.ValidationError('Scheduled time is required for recurring notifications.')
        
        return data

class NotificationLogSerializer(serializers.ModelSerializer):
    """Serializer for NotificationLog model."""
    notification = NotificationSerializer(read_only=True)

    class Meta:
        model = NotificationLog
        fields = ['id', 'notification', 'action', 'details', 'error_message', 'created_at']
        read_only_fields = ['id', 'notification', 'action', 'details', 'error_message', 'created_at']

class InternalMessageSerializer(serializers.ModelSerializer):
    """Serializer for InternalMessage model."""
    sender = serializers.StringRelatedField(read_only=True)
    recipient = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    attachments = serializers.PrimaryKeyRelatedField(many=True, queryset=Media.objects.all(), required=False)

    class Meta:
        model = InternalMessage
        fields = ['id', 'code', 'branch', 'sender', 'recipient', 'subject', 'content', 'attachments', 
                 'is_read', 'read_at', 'priority', 'created_at', 'updated_at']
        read_only_fields = ['id', 'code', 'sender', 'is_read', 'read_at', 'created_at', 'updated_at']

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate internal message data."""
        if data.get('sender') == data.get('recipient'):
            raise serializers.ValidationError('Sender and recipient cannot be the same.')
        return data

class UserNoteSerializer(serializers.ModelSerializer):
    """Serializer for UserNote model."""
    user = serializers.StringRelatedField(read_only=True)
    attachments = serializers.PrimaryKeyRelatedField(many=True, queryset=Media.objects.all(), required=False)

    class Meta:
        model = UserNote
        fields = ['id', 'code', 'branch', 'user', 'title', 'content', 'attachments', 'reminder_date', 
                 'is_reminder_sent', 'tags', 'color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'code', 'user', 'is_reminder_sent', 'created_at', 'updated_at']

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user note data."""
        if data.get('reminder_date') and data.get('reminder_date') < timezone.now():
            raise serializers.ValidationError('Reminder date cannot be in the past.')
        return data