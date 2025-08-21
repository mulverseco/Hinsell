# admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Media

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    """Admin configuration for Media model with best practices for performance and usability."""
    list_display = (
        'file_preview',
        'media_type',
        'alt_text',
        'display_order',
        'file_size_mb',
        'is_active',
        'is_deleted',
        'created_at',
        'updated_at',
    )
    
    # Enable searching on these fields
    search_fields = ('alt_text', 'file__name', 'media_type')
    
    # Add filters for quick filtering
    list_filter = ('media_type', 'is_active', 'is_deleted')
    
    # Order the list view by display_order and media_type
    ordering = ('display_order', 'media_type')
    
    # Make these fields read-only in the admin form
    readonly_fields = ('media_type', 'file_size', 'image_dimensions', 'created_at', 'updated_at', 'created_by', 'updated_by')
    
    # Organize form fields into fieldsets for better UX
    fieldsets = (
        (_('Media Information'), {
            'fields': ('file', 'alt_text', 'display_order'),
        }),
        (_('Detected Details'), {
            'fields': ('media_type', 'file_size', 'image_dimensions'),
        }),
        (_('Audit Information'), {
            'fields': ('is_active', 'is_deleted', 'created_at', 'updated_at', 'created_by', 'updated_by'),
        }),
    )
    
    # Improve performance by prefetching related objects if needed (assuming AuditableModel has user relations)
    list_select_related = ('created_by', 'updated_by')
    
    def file_preview(self, obj):
        """Custom preview for file in list view."""
        if obj.file:
            if obj.media_type == 'image':
                return admin.utils.format_html('<img src="{}" width="50" height="50" alt="{}" />', obj.file.url, obj.alt_text)
            return obj.file.name
        return '-'
    file_preview.short_description = _('File Preview')
    
    def file_size_mb(self, obj):
        """Display file size in MB for readability."""
        if obj.file_size:
            return f"{obj.file_size / (1024 * 1024):.2f} MB"
        return '-'
    file_size_mb.short_description = _('File Size')