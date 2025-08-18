"""
Reporting and analytics models
"""
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core_apps.general import AuditableModel

class ReportCategory(AuditableModel):
    """Report categories for organization"""
    name = models.CharField(
        max_length=100,
        help_text=_("Category name")
    )
    description = models.TextField(blank=True)
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text=_("Icon class name")
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text=_("Sort order for display")
    )
    
    class Meta:
        verbose_name = _("Report Category")
        verbose_name_plural = _("Report Categories")
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name

class ReportTemplate(AuditableModel):
    """Report templates and definitions"""
    
    class ReportType(models.TextChoices):
        TABULAR = 'tabular', _('Tabular')
        CHART = 'chart', _('Chart')
        DASHBOARD = 'dashboard', _('Dashboard')
        EXPORT = 'export', _('Export')

    category = models.ForeignKey(
        ReportCategory,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=200,
        help_text=_("Report name")
    )
    Parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_reports',
        help_text=_("Parent report for hierarchical structure")
    )
    description = models.TextField(blank=True)
    report_type = models.CharField(
        max_length=20,
        choices=ReportType.choices,
        default=ReportType.TABULAR
    )
    
    # Report definition
    query_config = models.JSONField(
        default=dict,
        help_text="Dynamic query configuration"
    )

    parameters = models.JSONField(
        default=list,
        help_text=_("Report parameters definition")
    )
    columns = models.JSONField(
        default=list,
        help_text=_("Report columns configuration")
    )
    
    # Display settings
    chart_config = models.JSONField(
        default=dict,
        help_text=_("Chart configuration for chart reports")
    )

    formatting_rules = models.JSONField(
        default=dict,
        help_text=_("Formatting rules for display")
    )
    
    
    class Meta:
        verbose_name = _("Report Template")
        verbose_name_plural = _("Report Templates")
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['code']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"

