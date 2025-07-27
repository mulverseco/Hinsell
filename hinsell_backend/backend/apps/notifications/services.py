"""
Notification services for sending and managing notifications.
"""
import logging
from typing import List, Optional, Dict, Any
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.notifications.models import NotificationTemplate, Notification, NotificationPreference, NotificationLog

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications."""
    
    def send_notification(
        self,
        branch,
        notification_type: str,
        channel: str,
        recipient_users: List[int] = None,
        recipient_emails: List[str] = None,
        recipient_phones: List[str] = None,
        template_id: Optional[int] = None,
        subject: Optional[str] = None,
        content: Optional[str] = None,
        html_content: Optional[str] = None,
        context_data: Dict[str, Any] = None,
        priority: str = Notification.Priority.NORMAL,
        scheduled_at: Optional[timezone.datetime] = None,
        created_by = None
    ) -> List[Notification]:
        """Send notification to specified recipients."""
        
        context_data = context_data or {}
        notifications = []
        
        # Get template if specified
        template = None
        if template_id:
            try:
                template = NotificationTemplate.objects.get(id=template_id)
            except NotificationTemplate.DoesNotExist:
                logger.error(f"Template {template_id} not found")
                raise ValueError(f"Template {template_id} not found")
        
        # If no template specified, try to get default template
        if not template:
            template = NotificationTemplate.objects.filter(
                branch=branch,
                notification_type=notification_type,
                channel=channel,
                is_default=True,
                is_active=True
            ).first()
        
        # Render content from template if available
        if template:
            rendered = template.render(context_data)
            subject = subject or rendered['subject']
            content = content or rendered['content']
            html_content = html_content or rendered['html_content']
        
        # Validate required content
        if not subject or not content:
            raise ValueError("Subject and content are required")
        
        with transaction.atomic():
            # Create notifications for user recipients
            if recipient_users:
                for user_id in recipient_users:
                    try:
                        user = User.objects.get(id=user_id)
                        
                        # Check user preferences
                        if not self._should_send_to_user(user, channel, notification_type):
                            logger.info(f"Skipping notification to {user} due to preferences")
                            continue
                        
                        notification = Notification.objects.create(
                            branch=branch,
                            template=template,
                            recipient_user=user,
                            recipient_email=user.email,
                            channel=channel,
                            notification_type=notification_type,
                            priority=priority,
                            subject=subject,
                            content=content,
                            html_content=html_content,
                            context_data=context_data,
                            scheduled_at=scheduled_at or timezone.now(),
                            created_by=created_by
                        )
                        notifications.append(notification)
                        
                        # Log creation
                        NotificationLog.objects.create(
                            notification=notification,
                            action='created',
                            details={'created_by': created_by.id if created_by else None}
                        )
                        
                    except User.DoesNotExist:
                        logger.error(f"User {user_id} not found")
                        continue
            
            # Create notifications for email recipients
            if recipient_emails:
                for email in recipient_emails:
                    notification = Notification.objects.create(
                        branch=branch,
                        template=template,
                        recipient_email=email,
                        channel=channel,
                        notification_type=notification_type,
                        priority=priority,
                        subject=subject,
                        content=content,
                        html_content=html_content,
                        context_data=context_data,
                        scheduled_at=scheduled_at or timezone.now(),
                        created_by=created_by
                    )
                    notifications.append(notification)
                    
                    # Log creation
                    NotificationLog.objects.create(
                        notification=notification,
                        action='created',
                        details={'created_by': created_by.id if created_by else None}
                    )
            
            # Create notifications for phone recipients
            if recipient_phones:
                for phone in recipient_phones:
                    notification = Notification.objects.create(
                        branch=branch,
                        template=template,
                        recipient_phone=phone,
                        channel=channel,
                        notification_type=notification_type,
                        priority=priority,
                        subject=subject,
                        content=content,
                        html_content=html_content,
                        context_data=context_data,
                        scheduled_at=scheduled_at or timezone.now(),
                        created_by=created_by
                    )
                    notifications.append(notification)
                    
                    # Log creation
                    NotificationLog.objects.create(
                        notification=notification,
                        action='created',
                        details={'created_by': created_by.id if created_by else None}
                    )
        
        logger.info(f"Created {len(notifications)} notifications")
        return notifications
    
    def _should_send_to_user(self, user: User, channel: str, notification_type: str) -> bool: # type: ignore
        """Check if notification should be sent to user based on preferences."""
        try:
            preferences = user.notification_preferences
        except NotificationPreference.DoesNotExist:
            # If no preferences set, allow all notifications
            return True
        
        # Check if channel is enabled for this notification type
        if not preferences.is_channel_enabled(channel, notification_type):
            return False
        
        # Check quiet hours for non-urgent notifications
        if (notification_type not in ['security_alert', 'system_maintenance'] and 
            preferences.is_in_quiet_hours()):
            return False
        
        return True
    
    def process_scheduled_notifications(self):
        """Process notifications scheduled for sending."""
        now = timezone.now()
        
        # Get pending notifications that are due
        notifications = Notification.objects.filter(
            status=Notification.Status.PENDING,
            scheduled_at__lte=now
        ).select_related('template', 'recipient_user')
        
        for notification in notifications:
            try:
                self._send_notification(notification)
            except Exception as e:
                logger.error(f"Error sending notification {notification.id}: {str(e)}")
                notification.mark_as_failed(str(e))
    
    def _send_notification(self, notification: Notification):
        """Send individual notification via appropriate channel."""
        if notification.channel == 'email':
            self._send_email(notification)
        elif notification.channel == 'sms':
            self._send_sms(notification)
        elif notification.channel == 'whatsapp':
            self._send_whatsapp(notification)
        elif notification.channel == 'in_app':
            self._send_in_app(notification)
        elif notification.channel == 'push':
            self._send_push(notification)
        else:
            raise ValueError(f"Unsupported channel: {notification.channel}")
    
    def _send_email(self, notification: Notification):
        """Send email notification."""
        from django.core.mail import send_mail
        from django.conf import settings
        
        try:
            recipient_email = notification.recipient_email
            if not recipient_email and notification.recipient_user:
                recipient_email = notification.recipient_user.email
            
            if not recipient_email:
                raise ValueError("No email address available")
            
            send_mail(
                subject=notification.subject,
                message=notification.content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=notification.html_content,
                fail_silently=False
            )
            
            notification.mark_as_sent()
            
            # Log success
            NotificationLog.objects.create(
                notification=notification,
                action='sent',
                details={'email': recipient_email}
            )
            
        except Exception as e:
            notification.mark_as_failed(str(e))
            
            # Log failure
            NotificationLog.objects.create(
                notification=notification,
                action='failed',
                error_message=str(e)
            )
    
    def _send_sms(self, notification: Notification):
        """Send SMS notification."""
        # Implementation depends on SMS provider
        # This is a placeholder for actual SMS sending logic
        
        try:
            recipient_phone = notification.recipient_phone
            if not recipient_phone and notification.recipient_user:
                recipient_phone = getattr(notification.recipient_user, 'phone', None)
            
            if not recipient_phone:
                raise ValueError("No phone number available")
            
            # TODO: Implement actual SMS sending
            # For now, just mark as sent
            notification.mark_as_sent()
            
            # Log success
            NotificationLog.objects.create(
                notification=notification,
                action='sent',
                details={'phone': recipient_phone}
            )
            
        except Exception as e:
            notification.mark_as_failed(str(e))
            
            # Log failure
            NotificationLog.objects.create(
                notification=notification,
                action='failed',
                error_message=str(e)
            )
    
    def _send_whatsapp(self, notification: Notification):
        """Send WhatsApp notification."""
        # Implementation depends on WhatsApp provider
        # This is a placeholder for actual WhatsApp sending logic
        
        try:
            recipient_phone = notification.recipient_phone
            if not recipient_phone and notification.recipient_user:
                recipient_phone = getattr(notification.recipient_user, 'phone', None)
            
            if not recipient_phone:
                raise ValueError("No phone number available")
            
            # TODO: Implement actual WhatsApp sending
            # For now, just mark as sent
            notification.mark_as_sent()
            
            # Log success
            NotificationLog.objects.create(
                notification=notification,
                action='sent',
                details={'phone': recipient_phone}
            )
            
        except Exception as e:
            notification.mark_as_failed(str(e))
            
            # Log failure
            NotificationLog.objects.create(
                notification=notification,
                action='failed',
                error_message=str(e)
            )
    
    def _send_in_app(self, notification: Notification):
        """Send in-app notification."""
        # In-app notifications are just stored in database
        # They are displayed when user logs in
        
        notification.mark_as_sent()
        
        # Log success
        NotificationLog.objects.create(
            notification=notification,
            action='sent',
            details={'type': 'in_app'}
        )
    
    def _send_push(self, notification: Notification):
        """Send push notification."""
        # Implementation depends on push notification service
        # This is a placeholder for actual push notification sending logic
        
        try:
            if not notification.recipient_user:
                raise ValueError("Push notifications require a user recipient")
            
            # TODO: Implement actual push notification sending
            # For now, just mark as sent
            notification.mark_as_sent()
            
            # Log success
            NotificationLog.objects.create(
                notification=notification,
                action='sent',
                details={'user_id': notification.recipient_user.id}
            )
            
        except Exception as e:
            notification.mark_as_failed(str(e))
            
            # Log failure
            NotificationLog.objects.create(
                notification=notification,
                action='failed',
                error_message=str(e)
            )
    
    def retry_failed_notifications(self):
        """Retry failed notifications that can be retried."""
        failed_notifications = Notification.objects.filter(
            status=Notification.Status.FAILED
        ).select_related('template', 'recipient_user')
        
        for notification in failed_notifications:
            if notification.can_retry():
                try:
                    self._send_notification(notification)
                    
                    # Log retry
                    NotificationLog.objects.create(
                        notification=notification,
                        action='retried',
                        details={'retry_count': notification.retry_count}
                    )
                    
                except Exception as e:
                    logger.error(f"Error retrying notification {notification.id}: {str(e)}")
                    notification.mark_as_failed(str(e))
    
    def cleanup_old_notifications(self, days: int = 90):
        """Clean up old notifications and logs."""
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        
        # Delete old notification logs
        deleted_logs = NotificationLog.objects.filter(
            created_at__lt=cutoff_date
        ).delete()
        
        # Delete old notifications (except unread in-app notifications)
        deleted_notifications = Notification.objects.filter(
            created_at__lt=cutoff_date
        ).exclude(
            channel='in_app',
            status__in=[Notification.Status.SENT, Notification.Status.DELIVERED]
        ).delete()
        
        logger.info(f"Cleaned up {deleted_logs[0]} logs and {deleted_notifications[0]} notifications")
