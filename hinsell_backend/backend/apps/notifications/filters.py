"""
Filters for notifications app.
"""
import django_filters
from django.db.models import Q
from apps.notifications.models import Notification, NotificationLog
from apps.notifications.models import NotificationTemplate


class NotificationFilter(django_filters.FilterSet):
    """Filter for notifications."""
    
    status = django_filters.MultipleChoiceFilter(
        choices=Notification.Status.choices
    )
    
    channel = django_filters.MultipleChoiceFilter(
        choices=NotificationTemplate.Channel.choices
    )
    
    notification_type = django_filters.MultipleChoiceFilter(
        choices=NotificationTemplate.NotificationType.choices
    )
    
    priority = django_filters.MultipleChoiceFilter(
        choices=Notification.Priority.choices
    )
    
    date_from = django_filters.DateFilter(
        field_name='created_at__date',
        lookup_expr='gte'
    )
    
    date_to = django_filters.DateFilter(
        field_name='created_at__date',
        lookup_expr='lte'
    )
    
    recipient = django_filters.CharFilter(
        method='filter_recipient'
    )
    
    unread_only = django_filters.BooleanFilter(
        method='filter_unread'
    )
    
    class Meta:
        model = Notification
        fields = [
            'branch', 'template', 'recipient_user',
            'status', 'channel', 'notification_type', 'priority'
        ]
    
    def filter_recipient(self, queryset, name, value):
        """Filter by recipient (email, phone, or user name)."""
        return queryset.filter(
            Q(recipient_email__icontains=value) |
            Q(recipient_phone__icontains=value) |
            Q(recipient_user__first_name__icontains=value) |
            Q(recipient_user__last_name__icontains=value) |
            Q(recipient_user__email__icontains=value)
        )
    
    def filter_unread(self, queryset, name, value):
        """Filter unread notifications."""
        if value:
            return queryset.exclude(status=Notification.Status.READ)
        return queryset


class NotificationLogFilter(django_filters.FilterSet):
    """Filter for notification logs."""
    
    action = django_filters.MultipleChoiceFilter(
        choices=[
            ('created', 'Created'),
            ('sent', 'Sent'),
            ('delivered', 'Delivered'),
            ('read', 'Read'),
            ('failed', 'Failed'),
            ('retried', 'Retried'),
            ('cancelled', 'Cancelled'),
        ]
    )
    
    date_from = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte'
    )
    
    date_to = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte'
    )
    
    class Meta:
        model = NotificationLog
        fields = ['notification', 'action']