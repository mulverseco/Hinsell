from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import NotificationTemplate, Notification, InternalMessage, UserNote


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    """
    Admin configuration for the NotificationTemplate model.
    """
    list_display = (
        'code',
        'name',
        'branch',
        'notification_type',
        'channel',
        'is_default',
        'created_at',
        'is_active',
    )
    list_filter = (
        'branch',
        'notification_type',
        'channel',
        'is_default',
        'is_active',
        'created_at',
    )
    search_fields = ('code', 'name', 'subject', 'content')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )
    fieldsets = (
        (_('Template Information'), {
            'fields': ('branch', 'code', 'name', 'notification_type', 'channel', 'is_default')
        }),
        (_('Content'), {
            'fields': ('subject', 'content', 'html_content', 'variables')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all notification templates, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log notification template creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'template_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Notification model.
    """
    list_display = (
        'notification_type',
        'recipient_display',
        'branch',
        'channel',
        'status',
        'priority',
        'scheduled_at',
        'sent_at',
        'created_at',
    )
    list_filter = (
        'branch',
        'notification_type',
        'channel',
        'status',
        'priority',
        'recurrence',
        'created_at',
    )
    search_fields = (
        'subject',
        'content',
        'recipient__username',
        'recipient__email',
        'context_data__email',
        'context_data__phone',
    )
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'sent_at',
        'delivered_at',
        'read_at',
        'retry_count',
        'error_message',
    )
    fieldsets = (
        (_('Notification Information'), {
            'fields': ('branch', 'template', 'recipient', 'notification_type', 'channel', 'priority', 'recurrence')
        }),
        (_('Content'), {
            'fields': ('subject', 'content', 'html_content', 'context_data', 'attachments')
        }),
        (_('Status'), {
            'fields': ('status', 'scheduled_at', 'sent_at', 'delivered_at', 'read_at', 'error_message', 'retry_count', 'max_retries', 'external_id')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def recipient_display(self, obj):
        """Display recipient name or contact info."""
        return obj.recipient.get_full_name() if obj.recipient else (
            obj.context_data.get('email') or obj.context_data.get('phone') or 'Unknown'
        )
    recipient_display.short_description = _('Recipient')

    def get_queryset(self, request):
        """Allow superusers to see all notifications, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log notification creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'notification_type': obj.notification_type,
                'action': 'update' if change else 'create'
            }
        )

    def has_add_permission(self, request):
        """Prevent manual creation of notifications."""
        return False

    def has_change_permission(self, request, obj=None):
        """Prevent manual updates to notifications."""
        return False


@admin.register(InternalMessage)
class InternalMessageAdmin(admin.ModelAdmin):
    """
    Admin configuration for the InternalMessage model.
    """
    list_display = (
        'code',
        'subject',
        'sender',
        'recipient',
        'branch',
        'priority',
        'is_read',
        'created_at',
    )
    list_filter = (
        'branch',
        'priority',
        'is_read',
        'created_at',
    )
    search_fields = ('code', 'subject', 'sender__username', 'recipient__username')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'read_at',
    )
    fieldsets = (
        (_('Message Information'), {
            'fields': ('branch', 'code', 'sender', 'recipient', 'subject', 'priority')
        }),
        (_('Content'), {
            'fields': ('content', 'attachments')
        }),
        (_('Status'), {
            'fields': ('is_read', 'read_at')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all messages, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log message creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'message_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )


@admin.register(UserNote)
class UserNoteAdmin(admin.ModelAdmin):
    """
    Admin configuration for the UserNote model.
    """
    list_display = (
        'code',
        'title',
        'user',
        'branch',
        'reminder_date',
        'is_reminder_sent',
        'created_at',
    )
    list_filter = (
        'branch',
        'is_reminder_sent',
        'created_at',
    )
    search_fields = ('code', 'title', 'content', 'tags', 'user__username')
    ordering = ('-created_at',)
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )
    fieldsets = (
        (_('Note Information'), {
            'fields': ('user', 'branch', 'code', 'title', 'content')
        }),
        (_('Additional Details'), {
            'fields': ('attachments', 'tags', 'color')
        }),
        (_('Reminder'), {
            'fields': ('reminder_date', 'is_reminder_sent')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all user notes, including soft-deleted ones."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log user note creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.branch,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'note_code': obj.code,
                'action': 'update' if change else 'create'
            }
        )