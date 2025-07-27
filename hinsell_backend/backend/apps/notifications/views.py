"""
Views for notifications app.
"""
import logging
from datetime import datetime, timedelta
from django.db.models import Count
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    NotificationTemplate, Notification, 
    NotificationPreference, NotificationLog
)
from apps.notifications.serializers import (
    NotificationTemplateSerializer, NotificationSerializer,
    NotificationPreferenceSerializer, NotificationLogSerializer,
    SendNotificationSerializer, TemplatePreviewSerializer,
    NotificationStatsSerializer
)
from apps.notifications.services import NotificationService
from apps.notifications.filters import NotificationFilter, NotificationLogFilter

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for notification templates."""
    
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['branch', 'notification_type', 'channel', 'is_default', 'is_active']
    search_fields = ['name', 'subject', 'content']
    ordering_fields = ['name', 'notification_type', 'channel', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter templates by user's branch."""
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        return self.queryset.filter(branch__in=user.branches.all())
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a notification template."""
        template = self.get_object()
        
        # Create a copy
        new_template = NotificationTemplate.objects.create(
            branch=template.branch,
            name=f"{template.name} (Copy)",
            notification_type=template.notification_type,
            channel=template.channel,
            subject=template.subject,
            content=template.content,
            html_content=template.html_content,
            variables=template.variables,
            is_default=False,  # Copy is never default
            created_by=request.user
        )
        
        serializer = self.get_serializer(new_template)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set template as default for its type and channel."""
        template = self.get_object()
        template.is_default = True
        template.save()
        
        return Response({'message': 'Template set as default'})


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for notifications."""
    
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = NotificationFilter
    search_fields = ['subject', 'content', 'recipient_email', 'recipient_phone']
    ordering_fields = ['created_at', 'sent_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter notifications by user's branch."""
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        return self.queryset.filter(branch__in=user.branches.all())
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read."""
        notification = self.get_object()
        notification.mark_as_read()
        
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry failed notification."""
        notification = self.get_object()
        
        if not notification.can_retry():
            return Response(
                {'error': 'Notification cannot be retried'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reset status and schedule for retry
        notification.status = Notification.Status.PENDING
        notification.scheduled_at = timezone.now()
        notification.save()
        
        return Response({'message': 'Notification scheduled for retry'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel pending notification."""
        notification = self.get_object()
        
        if notification.status not in [Notification.Status.PENDING]:
            return Response(
                {'error': 'Only pending notifications can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notification.status = Notification.Status.CANCELLED
        notification.save()
        
        return Response({'message': 'Notification cancelled'})


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for notification preferences."""
    
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter preferences by user permissions."""
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        return self.queryset.filter(user=user)
    
    @action(detail=False, methods=['get', 'put'])
    def my_preferences(self, request):
        """Get or update current user's preferences."""
        preference, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        
        if request.method == 'GET':
            serializer = self.get_serializer(preference)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = self.get_serializer(preference, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for notification logs."""
    
    queryset = NotificationLog.objects.all()
    serializer_class = NotificationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = NotificationLogFilter
    ordering_fields = ['created_at', 'action']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter logs by user's branch."""
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        return self.queryset.filter(notification__branch__in=user.branches.all())


class SendNotificationView(APIView):
    """Send notification to specified recipients."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SendNotificationSerializer
    
    def post(self, request):
        """Send notification."""
        serializer = SendNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        service = NotificationService()
        
        try:
            notifications = service.send_notification(
                branch=request.user.branches.first(),  # Use user's first branch
                notification_type=data['notification_type'],
                channel=data['channel'],
                recipient_users=data.get('recipient_users', []),
                recipient_emails=data.get('recipient_emails', []),
                recipient_phones=data.get('recipient_phones', []),
                template_id=data.get('template_id'),
                subject=data.get('subject'),
                content=data.get('content'),
                html_content=data.get('html_content'),
                context_data=data.get('context_data', {}),
                priority=data.get('priority', Notification.Priority.NORMAL),
                scheduled_at=data.get('scheduled_at'),
                created_by=request.user
            )
            
            return Response({
                'message': f'{len(notifications)} notifications created',
                'notification_ids': [n.id for n in notifications]
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            return Response(
                {'error': 'Failed to send notification'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BulkSendNotificationView(APIView):
    """Send notifications in bulk."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Send bulk notifications."""
        notifications_data = request.data.get('notifications', [])
        
        if not notifications_data:
            return Response(
                {'error': 'No notifications provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = NotificationService()
        created_notifications = []
        errors = []
        
        for i, notification_data in enumerate(notifications_data):
            serializer = SendNotificationSerializer(data=notification_data)
            if not serializer.is_valid():
                errors.append({
                    'index': i,
                    'errors': serializer.errors
                })
                continue
            
            try:
                data = serializer.validated_data
                notifications = service.send_notification(
                    branch=request.user.branches.first(),
                    notification_type=data['notification_type'],
                    channel=data['channel'],
                    recipient_users=data.get('recipient_users', []),
                    recipient_emails=data.get('recipient_emails', []),
                    recipient_phones=data.get('recipient_phones', []),
                    template_id=data.get('template_id'),
                    subject=data.get('subject'),
                    content=data.get('content'),
                    html_content=data.get('html_content'),
                    context_data=data.get('context_data', {}),
                    priority=data.get('priority', Notification.Priority.NORMAL),
                    scheduled_at=data.get('scheduled_at'),
                    created_by=request.user
                )
                created_notifications.extend(notifications)
                
            except Exception as e:
                errors.append({
                    'index': i,
                    'error': str(e)
                })
        
        return Response({
            'created': len(created_notifications),
            'errors': errors,
            'notification_ids': [n.id for n in created_notifications]
        })


class MarkAsReadView(APIView):
    """Mark notification as read."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        """Mark notification as read."""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient_user=request.user
            )
            notification.mark_as_read()
            
            return Response({'message': 'Notification marked as read'})
            
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserNotificationsView(ListAPIView):
    """Get current user's notifications."""
    queryset = Notification.objects.none() 
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'channel', 'notification_type', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get notifications for current user."""
        return Notification.objects.filter(recipient_user=self.request.user)


class NotificationStatsView(APIView):
    """Get notification statistics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get notification statistics."""
        serializer = NotificationStatsSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        queryset = Notification.objects.filter(
            created_at__date__range=[data['date_from'], data['date_to']]
        )
        
        # Filter by user's branches
        if not request.user.is_superuser:
            queryset = queryset.filter(branch__in=request.user.branches.all())
        
        # Apply optional filters
        if data.get('channel'):
            queryset = queryset.filter(channel=data['channel'])
        if data.get('notification_type'):
            queryset = queryset.filter(notification_type=data['notification_type'])
        
        # Calculate statistics
        stats = {
            'total': queryset.count(),
            'by_status': dict(queryset.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_channel': dict(queryset.values('channel').annotate(count=Count('id')).values_list('channel', 'count')),
            'by_type': dict(queryset.values('notification_type').annotate(count=Count('id')).values_list('notification_type', 'count')),
            'by_priority': dict(queryset.values('priority').annotate(count=Count('id')).values_list('priority', 'count')),
            'delivery_rate': self._calculate_delivery_rate(queryset),
            'read_rate': self._calculate_read_rate(queryset),
        }
        
        return Response(stats)
    
    def _calculate_delivery_rate(self, queryset):
        """Calculate delivery rate."""
        total = queryset.count()
        if total == 0:
            return 0
        
        delivered = queryset.filter(
            status__in=[Notification.Status.DELIVERED, Notification.Status.READ]
        ).count()
        
        return round((delivered / total) * 100, 2)
    
    def _calculate_read_rate(self, queryset):
        """Calculate read rate."""
        total = queryset.count()
        if total == 0:
            return 0
        
        read = queryset.filter(status=Notification.Status.READ).count()
        return round((read / total) * 100, 2)


class DeliveryReportView(APIView):
    """Get delivery report for notifications."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get delivery report."""
        # Get date range (default to last 30 days)
        date_to = timezone.now().date()
        date_from = date_to - timedelta(days=30)
        
        if request.query_params.get('date_from'):
            date_from = datetime.strptime(request.query_params['date_from'], '%Y-%m-%d').date()
        if request.query_params.get('date_to'):
            date_to = datetime.strptime(request.query_params['date_to'], '%Y-%m-%d').date()
        
        queryset = Notification.objects.filter(
            created_at__date__range=[date_from, date_to]
        )
        
        # Filter by user's branches
        if not request.user.is_superuser:
            queryset = queryset.filter(branch__in=request.user.branches.all())
        
        # Generate daily report
        daily_stats = []
        current_date = date_from
        
        while current_date <= date_to:
            day_notifications = queryset.filter(created_at__date=current_date)
            
            daily_stats.append({
                'date': current_date.isoformat(),
                'total': day_notifications.count(),
                'sent': day_notifications.filter(status__in=[
                    Notification.Status.SENT, Notification.Status.DELIVERED, Notification.Status.READ
                ]).count(),
                'delivered': day_notifications.filter(status__in=[
                    Notification.Status.DELIVERED, Notification.Status.READ
                ]).count(),
                'read': day_notifications.filter(status=Notification.Status.READ).count(),
                'failed': day_notifications.filter(status=Notification.Status.FAILED).count(),
            })
            
            current_date += timedelta(days=1)
        
        return Response({
            'date_from': date_from.isoformat(),
            'date_to': date_to.isoformat(),
            'daily_stats': daily_stats,
            'summary': {
                'total': queryset.count(),
                'sent': queryset.filter(status__in=[
                    Notification.Status.SENT, Notification.Status.DELIVERED, Notification.Status.READ
                ]).count(),
                'delivered': queryset.filter(status__in=[
                    Notification.Status.DELIVERED, Notification.Status.READ
                ]).count(),
                'read': queryset.filter(status=Notification.Status.READ).count(),
                'failed': queryset.filter(status=Notification.Status.FAILED).count(),
            }
        })


class TemplatePreviewView(APIView):
    """Preview notification template with sample data."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TemplatePreviewSerializer
    
    def post(self, request):
        """Preview template."""
        serializer = TemplatePreviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            template = NotificationTemplate.objects.get(id=data['template_id'])
            rendered = template.render(data['context_data'])
            
            return Response({
                'template': {
                    'name': template.name,
                    'type': template.notification_type,
                    'channel': template.channel,
                },
                'rendered': rendered
            })
            
        except NotificationTemplate.DoesNotExist:
            return Response(
                {'error': 'Template not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class TemplateVariablesView(APIView):
    """Get available variables for a notification type."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, notification_type):
        """Get template variables."""
        # Define available variables for each notification type
        variables = {
            'welcome': {
                'user_name': 'User full name',
                'user_email': 'User email address',
                'branch_name': 'Branch name',
                'login_url': 'Login URL',
            },
            'password_reset': {
                'user_name': 'User full name',
                'reset_url': 'Password reset URL',
                'expiry_time': 'Link expiry time',
            },
            'security_alert': {
                'user_name': 'User full name',
                'alert_type': 'Type of security alert',
                'alert_details': 'Alert details',
                'timestamp': 'Alert timestamp',
            },
            'inventory_low': {
                'item_name': 'Item name',
                'current_stock': 'Current stock level',
                'minimum_stock': 'Minimum stock level',
                'branch_name': 'Branch name',
            },
            'inventory_expired': {
                'item_name': 'Item name',
                'batch_number': 'Batch number',
                'expiry_date': 'Expiry date',
                'quantity': 'Expired quantity',
                'branch_name': 'Branch name',
            },
            'transaction_approved': {
                'transaction_number': 'Transaction number',
                'transaction_type': 'Transaction type',
                'amount': 'Transaction amount',
                'approved_by': 'Approver name',
                'approved_at': 'Approval timestamp',
            },
            'transaction_rejected': {
                'transaction_number': 'Transaction number',
                'transaction_type': 'Transaction type',
                'amount': 'Transaction amount',
                'rejected_by': 'Rejector name',
                'rejection_reason': 'Rejection reason',
            },
            'payment_due': {
                'customer_name': 'Customer name',
                'invoice_number': 'Invoice number',
                'due_amount': 'Amount due',
                'due_date': 'Due date',
                'days_overdue': 'Days overdue',
            },
            'payment_overdue': {
                'customer_name': 'Customer name',
                'invoice_number': 'Invoice number',
                'overdue_amount': 'Overdue amount',
                'days_overdue': 'Days overdue',
                'total_outstanding': 'Total outstanding amount',
            },
        }
        
        return Response({
            'notification_type': notification_type,
            'variables': variables.get(notification_type, {})
        })


# Webhook views for external service status updates
class SMSStatusWebhookView(APIView):
    """Webhook for SMS delivery status updates."""
    
    permission_classes = []  # No authentication for webhooks
    
    def post(self, request):
        """Handle SMS status webhook."""
        # Implementation depends on SMS provider
        # This is a placeholder for actual webhook handling
        external_id = request.data.get('id')
        status = request.data.get('status')
        
        if external_id and status:
            try:
                notification = Notification.objects.get(external_id=external_id)
                
                if status == 'delivered':
                    notification.mark_as_delivered()
                elif status == 'failed':
                    notification.mark_as_failed(request.data.get('error', 'SMS delivery failed'))
                
            except Notification.DoesNotExist:
                pass
        
        return Response({'status': 'ok'})


class EmailStatusWebhookView(APIView):
    """Webhook for email delivery status updates."""
    
    permission_classes = []
    
    def post(self, request):
        """Handle email status webhook."""
        # Implementation depends on email provider
        return Response({'status': 'ok'})


class WhatsAppStatusWebhookView(APIView):
    """Webhook for WhatsApp delivery status updates."""
    
    permission_classes = []
    
    def post(self, request):
        """Handle WhatsApp status webhook."""
        # Implementation depends on WhatsApp provider
        return Response({'status': 'ok'})
