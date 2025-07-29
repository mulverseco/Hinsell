import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.notifications.models import Notification, NotificationTemplate, NotificationLog, InternalMessage, UserNote
from apps.notifications.serializers import (NotificationTemplateSerializer, NotificationSerializer, NotificationLogSerializer, InternalMessageSerializer, UserNoteSerializer)
from apps.authentication.models import User
from apps.core_apps.services.messaging_service import MessagingService
from apps.core_apps.permissions import IsBranchMember, IsSystemAdmin

logger = logging.getLogger(__name__)

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notification templates."""
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsBranchMember, IsSystemAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['branch', 'notification_type', 'channel', 'is_default']
    search_fields = ['name', 'code', 'subject']
    ordering_fields = ['created_at', 'updated_at', 'name']

    def get_queryset(self):
        """Filter queryset to user's branch."""
        user = self.request.user
        return NotificationTemplate.objects.filter(branch__in=user.default_branch.company.branches.all())

    def perform_create(self, serializer):
        """Set branch from request user."""
        serializer.save(branch=self.request.user.default_branch)

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notifications."""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsBranchMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['branch', 'recipient', 'channel', 'notification_type', 'status', 'priority']
    search_fields = ['subject', 'content']
    ordering_fields = ['created_at', 'sent_at', 'scheduled_at']

    def get_queryset(self):
        """Filter queryset to user's branch and permissions."""
        user = self.request.user
        queryset = Notification.objects.filter(branch__in=user.default_branch.company.branches.all())
        if not user.is_staff:
            queryset = queryset.filter(recipient=user)
        return queryset

    def perform_create(self, serializer):
        """Send notification using MessagingService."""
        try:
            data = serializer.validated_data
            branch = data.get('branch', self.request.user.default_branch)
            service = MessagingService(branch)
            
            recipient = data.get('recipient')
            recipient_email = data.get('recipient_email')
            recipient_phone = data.get('recipient_phone')
            recipient_id = recipient if isinstance(recipient, User) else recipient_email or recipient_phone
            
            notification = service.send_notification(
                recipient=recipient_id,
                notification_type=data['notification_type'],
                context_data=data.get('context_data', {}),
                channel=data['channel'],
                priority=data.get('priority', 'normal'),
                scheduled_at=data.get('scheduled_at')
            )
            if data.get('attachments'):
                notification.attachments.set(data['attachments'])
            serializer.instance = notification
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsBranchMember])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read."""
        try:
            notification = self.get_object()
            if notification.recipient != request.user and not request.user.is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            notification.mark_as_read()
            return Response({'status': 'Notification marked as read'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error marking notification {pk} as read: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing notification logs."""
    queryset = NotificationLog.objects.all()
    serializer_class = NotificationLogSerializer
    permission_classes = [IsAuthenticated, IsBranchMember, IsSystemAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['notification', 'action']
    search_fields = ['details', 'error_message']
    ordering_fields = ['created_at']

    def get_queryset(self):
        """Filter queryset to user's branch."""
        user = self.request.user
        return NotificationLog.objects.filter(notification__branch__in=user.default_branch.company.branches.all())

class InternalMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing internal messages."""
    queryset = InternalMessage.objects.all()
    serializer_class = InternalMessageSerializer
    permission_classes = [IsAuthenticated, IsBranchMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['branch', 'sender', 'recipient', 'priority', 'is_read']
    search_fields = ['subject', 'content']
    ordering_fields = ['created_at', 'read_at']

    def get_queryset(self):
        """Filter queryset to messages involving the user."""
        user = self.request.user
        return InternalMessage.objects.filter(
            branch__in=user.default_branch.company.branches.all(),
            recipient=user
        ) | InternalMessage.objects.filter(sender=user)

    def perform_create(self, serializer):
        """Send internal message using MessagingService."""
        try:
            data = serializer.validated_data
            branch = data.get('branch', self.request.user.default_branch)
            service = MessagingService(branch)
            message = service.send_internal_message(
                sender=self.request.user,
                recipient=data['recipient'],
                subject=data['subject'],
                content=data['content'],
                priority=data.get('priority', 'normal'),
                attachments=data.get('attachments', [])
            )
            serializer.instance = message
        except Exception as e:
            logger.error(f"Error creating internal message: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsBranchMember])
    def mark_as_read(self, request, pk=None):
        """Mark an internal message as read."""
        try:
            message = self.get_object()
            if message.recipient != request.user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            message.mark_as_read()
            return Response({'status': 'Message marked as read'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error marking message {pk} as read: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user notes."""
    queryset = UserNote.objects.all()
    serializer_class = UserNoteSerializer
    permission_classes = [IsAuthenticated, IsBranchMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['branch', 'user', 'tags', 'is_reminder_sent']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'reminder_date']

    def get_queryset(self):
        """Filter queryset to user's notes."""
        return UserNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set user and branch from request."""
        serializer.save(user=self.request.user, branch=self.request.user.default_branch)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsBranchMember])
    def mark_reminder_sent(self, request, pk=None):
        """Mark a user note reminder as sent."""
        try:
            note = self.get_object()
            if note.user != request.user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            note.mark_reminder_sent()
            return Response({'status': 'Reminder marked as sent'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error marking note {pk} reminder as sent: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)