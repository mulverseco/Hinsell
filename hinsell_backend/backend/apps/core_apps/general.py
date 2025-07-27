"""
Core base models and utilities for the pharmacy management system.
Provides common functionality and ensures consistency across all models.
"""
import uuid
import logging
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework import viewsets

logger = logging.getLogger(__name__)


class PharmacyPagination(PageNumberPagination):
    """
    Custom pagination class for consistent API responses.
    """
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


class TimestampedModelManager(models.Manager):
    """
    Custom manager for timestamped models with soft delete functionality.
    """
    
    def get_queryset(self):
        """Return only non-deleted records by default."""
        return super().get_queryset().filter(is_deleted=False)
    
    def active(self):
        """Return only active, non-deleted records."""
        return self.get_queryset().filter(is_active=True)
    
    def inactive(self):
        """Return only inactive, non-deleted records."""
        return self.get_queryset().filter(is_active=False)
    
    def deleted(self):
        """Return only soft-deleted records."""
        return super().get_queryset().filter(is_deleted=True)
    
    def all_with_deleted(self):
        """Return all records including soft-deleted ones."""
        return super().get_queryset()


class TimestampedModel(models.Model):
    """
    Abstract base model that provides self-updating created_at and updated_at fields,
    along with soft delete functionality and common audit fields.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for this record")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text=_("Timestamp when this record was created")
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        db_index=True,
        help_text=_("Timestamp when this record was last updated")
    )
    
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text=_("Whether this record is active")
    )
    
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text=_("Whether this record has been soft deleted")
    )
    
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Timestamp when this record was soft deleted")
    )
    
    objects = TimestampedModelManager()
    all_objects = models.Manager() 
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_deleted']),
            models.Index(fields=['is_active', 'is_deleted']),
        ]
    
    def soft_delete(self, user=None):
        """
        Soft delete this record by setting is_deleted=True and deleted_at timestamp.
        """
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
        
        if user:
            logger.info(f"Record {self.__class__.__name__}({self.id}) soft deleted by user {user}")
    
    def restore(self, user=None):
        """
        Restore a soft-deleted record.
        """
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
        
        if user:
            logger.info(f"Record {self.__class__.__name__}({self.id}) restored by user {user}")
    
    def clean(self):
        """
        Validate the model instance.
        """
        super().clean()

        if self.is_deleted and not self.deleted_at:
            self.deleted_at = timezone.now()
        elif not self.is_deleted and self.deleted_at:
            self.deleted_at = None


class AuditableModel(TimestampedModel):
    """
    Abstract model that adds creator and modifier tracking to TimestampedModel.
    """
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created',
        help_text=_("User who created this record")
    )
    
    updated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_updated',
        help_text=_("User who last updated this record")
    )
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['created_by']),
            models.Index(fields=['updated_by']),
        ]


class BaseViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet with common configuration for all API endpoints.
    """
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    permission_classes = [IsAuthenticated | HasAPIKey]
    pagination_class = PharmacyPagination
    
    def get_queryset(self):
        """
        Return queryset filtered to exclude soft-deleted records.
        """
        queryset = super().get_queryset()
        
        if hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Set the created_by field when creating a new record.
        """
        if hasattr(serializer.Meta.model, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        """
        Set the updated_by field when updating a record.
        """
        if hasattr(serializer.Meta.model, 'updated_by'):
            serializer.save(updated_by=self.request.user)
        else:
            serializer.save()


