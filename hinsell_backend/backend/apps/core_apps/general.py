"""
Core base models and utilities for the pharmacy management system.
Provides common functionality and ensures consistency across all models.
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import QuerySet
from typing import Dict, List
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework import viewsets
from apps.core_apps.utils import Logger


class Pagination(PageNumberPagination):
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
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
        Logger(__name__, user=user).info(f"Soft deleted {self.__class__.__name__}({self.id})")

    def restore(self, user=None):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
        Logger(__name__, user=user).info(f"Restored {self.__class__.__name__}({self.id})")
    
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
    """Base ViewSet for common functionality across apps."""
    permission_classes = [IsAuthenticated | HasAPIKey]
    permission_classes_by_action: Dict[str, List] = {}
    logger_name: str = __name__

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields: List[str] = []
    search_fields: List[str] = []
    ordering_fields: List[str] = []
    ordering: List[str] = ['-created_at']

    def get_queryset(self) -> QuerySet:
        """Filter queryset based on user's branch permissions."""
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'profile'):
            return self.queryset.none()
        
        queryset = self.queryset
        if hasattr(self.queryset.model, 'branch'):
            queryset = queryset.filter(branch__in=user.profile.branches.all())
        elif hasattr(self.queryset.model, 'item') and hasattr(self.queryset.model.item.field.related_model, 'branch'):
            queryset = queryset.filter(item__branch__in=user.profile.branches.all())
        elif hasattr(self.queryset.model, 'item') and hasattr(self.queryset.model.item.field.related_model, 'item'):
            queryset = queryset.filter(item__item__branch__in=user.profile.branches.all())
        
        return queryset

    def get_permissions(self):
        """Return permission classes based on action."""
        try:
            return [
                permission()
                for permission in self.permission_classes_by_action.get(
                    self.action, self.permission_classes
                )
            ]
        except AttributeError:
            return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        """Set created_by and updated_by fields on create."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        logger.info(f"Created {self.queryset.model.__name__} with ID {instance.id}", 
                   extra={'action': 'create', 'object_id': instance.id})
        return instance

    def perform_update(self, serializer):
        """Set updated_by field on update."""
        logger = Logger(self.logger_name, user=self.request.user)
        instance = serializer.save(updated_by=self.request.user)
        logger.info(f"Updated {self.queryset.model.__name__} with ID {instance.id}", 
                   extra={'action': 'update', 'object_id': instance.id})
        return instance

    def perform_destroy(self, instance):
        """Log deletion of an object."""
        logger = Logger(self.logger_name, user=self.request.user)
        logger.info(f"Deleted {self.queryset.model.__name__} with ID {instance.id}", 
                   extra={'action': 'delete', 'object_id': instance.id})
        instance.delete()