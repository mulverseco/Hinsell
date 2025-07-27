from django.contrib import admin
from apps.reporting.models import ReportCategory, ReportTemplate

@admin.register(ReportCategory)
class ReportCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'sort_order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['sort_order', 'name']

@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'report_type', 'is_active', 'created_at']
    list_filter = ['category', 'report_type', 'is_active', 'created_at']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'code', 'name', 'description', 'report_type')
        }),
        ('Configuration', {
            'fields': ('query_config', 'parameters', 'columns'),
            'classes': ('collapse',)
        }),
        ('Display Settings', {
            'fields': ('chart_config', 'formatting_rules'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        })
    )
