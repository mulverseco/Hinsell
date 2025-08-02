from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from apps.shared.models import Media


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Media model.
    """
    list_display = (
        'file',
        'media_type',
        'alt_text',
        'display_order',
        'created_at',
        'is_active',
    )
    list_filter = (
        'media_type',
        'is_active',
        'created_at',
    )
    search_fields = ('file', 'alt_text')
    ordering = ('display_order', '-created_at')
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'media_type',
    )
    fieldsets = (
        (_('Media Information'), {
            'fields': ('file', 'media_type', 'alt_text', 'display_order')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'is_active', 'is_deleted', 'deleted_at')
        }),
    )
    list_per_page = 25

    def get_queryset(self, request):
        """Allow superusers to see all media, including soft-deleted ones."""
        qs = self.model.objects.get_queryset()
        if request.user.is_superuser:
            return self.model.objects.all_with_deleted()
        return qs

    def save_model(self, request, obj, form, change):
        """Log media creation or update in audit log."""
        from apps.authentication.models import AuditLog
        super().save_model(request, obj, form, change)
        AuditLog.objects.create(
            branch=obj.created_by.default_branch if obj.created_by else None,
            user=obj.created_by,
            action_type=AuditLog.ActionType.DATA_MODIFICATION,
            username=obj.created_by.username if obj.created_by else None,
            details={
                'changed_by': request.user.username,
                'media_type': obj.media_type,
                'action': 'update' if change else 'create'
            }
        )
