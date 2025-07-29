import django_filters
from apps.notifications.models import Notification, NotificationTemplate, NotificationLog, InternalMessage, UserNote

class NotificationTemplateFilter(django_filters.FilterSet):
    class Meta:
        model = NotificationTemplate
        fields = ['branch', 'notification_type', 'channel', 'is_default']

class NotificationFilter(django_filters.FilterSet):
    class Meta:
        model = Notification
        fields = ['branch', 'recipient', 'channel', 'notification_type', 'status', 'priority']

class NotificationLogFilter(django_filters.FilterSet):
    class Meta:
        model = NotificationLog
        fields = ['notification', 'action']

class InternalMessageFilter(django_filters.FilterSet):
    class Meta:
        model = InternalMessage
        fields = ['branch', 'sender', 'recipient', 'priority', 'is_read']

class UserNoteFilter(django_filters.FilterSet):
    class Meta:
        model = UserNote
        fields = ['branch', 'user', 'tags', 'is_reminder_sent']