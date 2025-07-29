"""
Celery tasks for asynchronous processing in the pharmacy management system.
Uses MessagingService for all notification handling with comprehensive validation.
"""
import logging
from typing import Dict, Any, Optional, List
from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import transaction
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from apps.authentication.models import AuditLog
from apps.organization.models import Branch
from apps.accounting.models import Account

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task(bind=True, max_retries=3)
def send_welcome_message_task(self, user_id: int, branch_id: str):
    """
    Send welcome message to new users using MessagingService.
    """
    try:
        from hinsell_backend.backend.apps.core_apps.services.messaging_service import MessagingService
        
        user = User.objects.get(id=user_id)
        branch = Branch.objects.get(id=branch_id)
        
        # Create messaging service instance
        messaging_service = MessagingService(branch)
        
        # Check if user can receive messages
        can_receive, reason = messaging_service.is_user_enabled_for_messages(user)
        if not can_receive:
            logger.warning(f"Cannot send welcome message to {user.username}: {reason}")
            return False
        
        # Get available channels for user
        available_channels = messaging_service.get_available_channels_for_user(user)
        
        if not available_channels:
            logger.warning(f"No available channels for user {user.username}")
            return False
        
        # Prepare message content
        subject = "Welcome to Pharmacy Management System"
        content = render_to_string('messages/welcome_message.txt', {
            'user': user,
            'branch': branch,
        })
        
        # Try to send via preferred channels (email first, then others)
        success_channels = []
        failed_channels = []
        
        for channel_info in available_channels:
            channel = channel_info['channel']
            
            success, message, notification = messaging_service.send_free_message(
                message_type='welcome',
                channel=channel,
                recipient_user=user,
                subject=subject,
                content=content,
                context_data={
                    'welcome_message': True,
                    'user_id': user_id,
                    'branch_id': str(branch_id)
                },
                priority='normal'
            )
            
            if success:
                success_channels.append(channel)
                logger.info(f"Welcome message sent to {user.username} via {channel}")
            else:
                failed_channels.append({'channel': channel, 'reason': message})
                logger.warning(f"Failed to send welcome message via {channel}: {message}")
        
        if success_channels:
            logger.info(f"Welcome message sent successfully to {user.username} via {success_channels}")
            return True
        else:
            logger.error(f"Failed to send welcome message to {user.username} via all channels: {failed_channels}")
            return False
        
    except (User.DoesNotExist, Branch.DoesNotExist) as e:
        logger.error(f"User or Branch not found: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send welcome message to user {user_id}: {str(e)}")
        
        # Retry the task
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return False


@shared_task(bind=True, max_retries=3)
def send_security_alert_task(self, user_id: int, branch_id: str, alert_type: str, message: str, additional_context: Optional[Dict] = None):
    """
    Send security alert notifications using MessagingService.
    """
    try:
        from hinsell_backend.backend.apps.core_apps.services.messaging_service import MessagingService
        
        user = User.objects.get(id=user_id)
        branch = Branch.objects.get(id=branch_id)
        
        # Create messaging service instance
        messaging_service = MessagingService(branch)
        
        # Check if user can receive messages
        can_receive, reason = messaging_service.is_user_enabled_for_messages(user)
        if not can_receive:
            logger.warning(f"Cannot send security alert to {user.username}: {reason}")
            return False
        
        # Get available channels for user
        available_channels = messaging_service.get_available_channels_for_user(user)
        
        if not available_channels:
            logger.warning(f"No available channels for user {user.username}")
            return False
        
        # Prepare alert content
        subject_map = {
            'password_changed': 'Password Changed - Security Alert',
            'permission_change': 'Account Permissions Modified',
            'account_locked': 'Account Temporarily Locked',
            'suspicious_login': 'Suspicious Login Activity Detected',
            'two_factor_enabled': 'Two-Factor Authentication Enabled',
            'two_factor_disabled': 'Two-Factor Authentication Disabled',
            'multiple_failed_logins': 'Multiple Failed Login Attempts',
            'new_device_login': 'New Device Login Detected',
        }
        
        subject = subject_map.get(alert_type, 'Security Alert')
        
        # Render content based on alert type
        content = render_to_string('messages/security_alert.txt', {
            'user': user,
            'alert_type': alert_type,
            'message': message,
            'timestamp': timezone.now(),
            'additional_context': additional_context or {}
        })
        
        # Determine priority based on alert type
        high_priority_alerts = ['account_locked', 'suspicious_login', 'multiple_failed_logins']
        priority = 'high' if alert_type in high_priority_alerts else 'normal'
        
        # Send via all available channels for security alerts
        success_channels = []
        failed_channels = []
        
        for channel_info in available_channels:
            channel = channel_info['channel']
            
            success, response_message, notification = messaging_service.send_free_message(
                message_type='security_alert',
                channel=channel,
                recipient_user=user,
                subject=subject,
                content=content,
                context_data={
                    'alert_type': alert_type,
                    'security_alert': True,
                    'user_id': user_id,
                    'branch_id': str(branch_id),
                    'additional_context': additional_context or {}
                },
                priority=priority
            )
            
            if success:
                success_channels.append(channel)
                logger.info(f"Security alert sent to {user.username} via {channel}")
            else:
                failed_channels.append({'channel': channel, 'reason': response_message})
                logger.warning(f"Failed to send security alert via {channel}: {response_message}")
        
        if success_channels:
            logger.info(f"Security alert sent successfully to {user.username} via {success_channels}")
            return True
        else:
            logger.error(f"Failed to send security alert to {user.username} via all channels: {failed_channels}")
            return False
        
    except (User.DoesNotExist, Branch.DoesNotExist) as e:
        logger.error(f"User or Branch not found: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send security alert to user {user_id}: {str(e)}")
        
        # Retry the task
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return False


@shared_task
def create_audit_log_entry(audit_data: Dict[str, Any], screen_name: Optional[str] = None):
    """
    Create audit log entry asynchronously.
    """
    try:
        with transaction.atomic():
            # Get user if user_id is provided
            user = None
            if 'user_id' in audit_data:
                try:
                    user = User.objects.get(id=audit_data['user_id'])
                except User.DoesNotExist:
                    pass
            
            # Get branch (default to primary branch if not specified)
            branch = None
            if user and hasattr(user, 'default_branch'):
                branch = user.default_branch
            
            if not branch:
                branch = Branch.objects.filter(is_primary=True).first()
            
            if not branch:
                logger.error("No branch found for audit log entry")
                return False
            
            # Determine action type
            action_type = audit_data.get('action_type', 'data_access')
            
            # Create audit log entry
            audit_log = AuditLog.objects.create(
                branch=branch,
                user=user,
                action_type=action_type,
                username=audit_data.get('username', ''),
                ip_address=audit_data.get('ip_address', ''),
                user_agent=audit_data.get('user_agent', ''),
                device_type=audit_data.get('device_type', ''),
                login_status=audit_data.get('login_status', 'success'),
                session_id=audit_data.get('session_id', ''),
                country=audit_data.get('country', ''),
                city=audit_data.get('city', ''),
                computer_name=audit_data.get('computer_name', ''),
                screen_name=screen_name or audit_data.get('screen_name', ''),
                details=audit_data.get('details', {}),
                created_by=user
            )
            
            logger.info(f"Audit log entry created: {audit_log.id}")
            return True
            
    except Exception as e:
        logger.error(f"Failed to create audit log entry: {str(e)}")
        return False


@shared_task(bind=True, max_retries=3)
def send_notification_task(
    self,
    branch_id: str,
    message_type: str,
    channel: str,
    recipient_user_id: Optional[int] = None,
    recipient_account_id: Optional[str] = None,
    sender_user_id: Optional[int] = None,
    subject: str = "",
    content: str = "",
    context_data: Optional[Dict[str, Any]] = None,
    priority: str = 'normal',
    scheduled_at: Optional[str] = None
):
    """
    Send notification using MessagingService with comprehensive validation.
    """
    try:
        from hinsell_backend.backend.apps.core_apps.services.messaging_service import MessagingService
        
        # Get branch
        branch = Branch.objects.get(id=branch_id)
        
        # Create messaging service instance
        messaging_service = MessagingService(branch)
        
        # Get users/accounts
        recipient_user = None
        recipient_account = None
        sender_user = None
        
        if recipient_user_id:
            recipient_user = User.objects.get(id=recipient_user_id)
        
        if recipient_account_id:
            recipient_account = Account.objects.get(id=recipient_account_id)
        
        if sender_user_id:
            sender_user = User.objects.get(id=sender_user_id)
        
        # Parse scheduled_at if provided
        scheduled_datetime = None
        if scheduled_at:
            scheduled_datetime = timezone.datetime.fromisoformat(scheduled_at)
        
        # Validate permissions before sending
        can_send, validation_messages = messaging_service.validate_message_permissions(
            sender_user=sender_user,
            recipient_user=recipient_user,
            recipient_account=recipient_account,
            channel=channel
        )
        
        if not can_send:
            error_msg = f"Message validation failed: {'; '.join(validation_messages)}"
            logger.warning(error_msg)
            return {'success': False, 'message': error_msg, 'validation_errors': validation_messages}
        
        # Send message using MessagingService
        success, message, notification = messaging_service.send_free_message(
            message_type=message_type,
            channel=channel,
            recipient_user=recipient_user,
            recipient_account=recipient_account,
            sender_user=sender_user,
            subject=subject,
            content=content,
            context_data=context_data or {},
            priority=priority,
            scheduled_at=scheduled_datetime
        )
        
        if success:
            logger.info(f"Notification sent successfully: {notification.id if notification else 'N/A'}")
            return {
                'success': True, 
                'message': message, 
                'notification_id': str(notification.id) if notification else None
            }
        else:
            logger.warning(f"Failed to send notification: {message}")
            return {'success': False, 'message': message}
            
    except (Branch.DoesNotExist, User.DoesNotExist, Account.DoesNotExist) as e:
        error_msg = f"Required object not found: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'message': error_msg}
    except Exception as e:
        error_msg = f"Error sending notification: {str(e)}"
        logger.error(error_msg)
        
        # Retry the task
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return {'success': False, 'message': error_msg}


@shared_task
def send_bulk_notification_task(
    branch_id: str,
    user_ids: List[int],
    message_type: str,
    channel: str,
    subject: str,
    content: str,
    sender_user_id: Optional[int] = None,
    context_data: Optional[Dict[str, Any]] = None,
    priority: str = 'normal'
):
    """
    Send bulk notifications to multiple users using MessagingService.
    """
    try:
        from hinsell_backend.backend.apps.core_apps.services.messaging_service import MessagingService
        
        branch = Branch.objects.get(id=branch_id)
        messaging_service = MessagingService(branch)
        
        sender_user = None
        if sender_user_id:
            sender_user = User.objects.get(id=sender_user_id)
        
        results = {
            'total': len(user_ids),
            'success': 0,
            'failures': 0,
            'skipped': 0,
            'details': []
        }
        
        for user_id in user_ids:
            try:
                user = User.objects.get(id=user_id)
                
                # Check if user can receive messages
                can_receive, reason = messaging_service.is_user_enabled_for_messages(user)
                if not can_receive:
                    results['skipped'] += 1
                    results['details'].append({
                        'user_id': user_id,
                        'status': 'skipped',
                        'reason': reason
                    })
                    continue
                
                # Validate permissions
                can_send, validation_messages = messaging_service.validate_message_permissions(
                    sender_user=sender_user,
                    recipient_user=user,
                    channel=channel
                )
                
                if not can_send:
                    results['skipped'] += 1
                    results['details'].append({
                        'user_id': user_id,
                        'status': 'skipped',
                        'reason': '; '.join(validation_messages)
                    })
                    continue
                
                # Send message
                success, message, notification = messaging_service.send_free_message(
                    message_type=message_type,
                    channel=channel,
                    recipient_user=user,
                    sender_user=sender_user,
                    subject=subject,
                    content=content,
                    context_data=context_data or {},
                    priority=priority
                )
                
                if success:
                    results['success'] += 1
                    results['details'].append({
                        'user_id': user_id,
                        'status': 'success',
                        'notification_id': str(notification.id) if notification else None
                    })
                else:
                    results['failures'] += 1
                    results['details'].append({
                        'user_id': user_id,
                        'status': 'failed',
                        'reason': message
                    })
                    
            except User.DoesNotExist:
                results['failures'] += 1
                results['details'].append({
                    'user_id': user_id,
                    'status': 'failed',
                    'reason': 'User not found'
                })
            except Exception as e:
                results['failures'] += 1
                results['details'].append({
                    'user_id': user_id,
                    'status': 'failed',
                    'reason': str(e)
                })
        
        logger.info(f"Bulk notification completed: {results['success']} success, {results['failures']} failures, {results['skipped']} skipped")
        return results
        
    except (Branch.DoesNotExist, User.DoesNotExist) as e:
        error_msg = f"Required object not found: {str(e)}"
        logger.error(error_msg)
        return {
            'total': len(user_ids),
            'success': 0,
            'failures': len(user_ids),
            'skipped': 0,
            'error': error_msg
        }
    except Exception as e:
        error_msg = f"Error in bulk notification task: {str(e)}"
        logger.error(error_msg)
        return {
            'total': len(user_ids),
            'success': 0,
            'failures': len(user_ids),
            'skipped': 0,
            'error': error_msg
        }


@shared_task
def send_system_announcement_task(
    branch_id: str,
    announcement_title: str,
    announcement_content: str,
    target_user_roles: Optional[List[str]] = None,
    channels: Optional[List[str]] = None,
    sender_user_id: Optional[int] = None,
    priority: str = 'normal'
):
    """
    Send system announcements to users based on roles using MessagingService.
    """
    try:
        from hinsell_backend.backend.apps.core_apps.services.messaging_service import MessagingService
        
        branch = Branch.objects.get(id=branch_id)
        messaging_service = MessagingService(branch)
        
        sender_user = None
        if sender_user_id:
            sender_user = User.objects.get(id=sender_user_id)
        
        # Get target users based on roles
        if target_user_roles:
            # Filter users by roles (this would depend on your role implementation)
            target_users = User.objects.filter(
                is_active=True,
                default_branch=branch
            )
            # Add role filtering logic here based on your role system
        else:
            # Send to all active users in the branch
            target_users = User.objects.filter(
                is_active=True,
                default_branch=branch
            )
        
        # Default channels if not specified
        if not channels:
            channels = ['email', 'in_app']
        
        results = {
            'total_users': target_users.count(),
            'channels_used': channels,
            'results_by_channel': {}
        }
        
        # Send announcement via each channel
        for channel in channels:
            channel_results = {
                'success': 0,
                'failures': 0,
                'skipped': 0,
                'details': []
            }
            
            for user in target_users:
                try:
                    # Check if user can receive messages via this channel
                    available_channels = messaging_service.get_available_channels_for_user(user)
                    user_channels = [ch['channel'] for ch in available_channels]
                    
                    if channel not in user_channels:
                        channel_results['skipped'] += 1
                        channel_results['details'].append({
                            'user_id': user.id,
                            'status': 'skipped',
                            'reason': f'Channel {channel} not available for user'
                        })
                        continue
                    
                    # Send announcement
                    success, message, notification = messaging_service.send_free_message(
                        message_type='system_announcement',
                        channel=channel,
                        recipient_user=user,
                        sender_user=sender_user,
                        subject=f"System Announcement: {announcement_title}",
                        content=announcement_content,
                        context_data={
                            'announcement_title': announcement_title,
                            'system_announcement': True,
                            'branch_id': str(branch_id)
                        },
                        priority=priority
                    )
                    
                    if success:
                        channel_results['success'] += 1
                        channel_results['details'].append({
                            'user_id': user.id,
                            'status': 'success',
                            'notification_id': str(notification.id) if notification else None
                        })
                    else:
                        channel_results['failures'] += 1
                        channel_results['details'].append({
                            'user_id': user.id,
                            'status': 'failed',
                            'reason': message
                        })
                        
                except Exception as e:
                    channel_results['failures'] += 1
                    channel_results['details'].append({
                        'user_id': user.id,
                        'status': 'failed',
                        'reason': str(e)
                    })
            
            results['results_by_channel'][channel] = channel_results
        
        logger.info(f"System announcement sent: {announcement_title}")
        return results
        
    except (Branch.DoesNotExist, User.DoesNotExist) as e:
        error_msg = f"Required object not found: {str(e)}"
        logger.error(error_msg)
        return {'error': error_msg}
    except Exception as e:
        error_msg = f"Error sending system announcement: {str(e)}"
        logger.error(error_msg)
        return {'error': error_msg}


@shared_task
def generate_messaging_report_task(branch_id: str, user_id: int, period_days: int = 30):
    """
    Generate messaging status report using MessagingService.
    """
    try:
        from hinsell_backend.backend.apps.core_apps.services.messaging_service import MessagingService
        
        branch = Branch.objects.get(id=branch_id)
        user = User.objects.get(id=user_id)
        messaging_service = MessagingService(branch)
        
        # Get comprehensive messaging status
        status_report = messaging_service.get_messaging_status_report()
        
        # Get notification statistics for the period
        from apps.notifications.models import Notification, NotificationLog
        
        end_date = timezone.now()
        start_date = end_date - timezone.timedelta(days=period_days)
        
        notification_stats = {
            'total_sent': Notification.objects.filter(
                branch=branch,
                created_at__range=[start_date, end_date]
            ).count(),
            'by_channel': {},
            'by_type': {},
            'success_rate': 0
        }
        
        # Calculate stats by channel
        for channel in ['email', 'sms', 'whatsapp', 'in_app', 'push']:
            channel_count = Notification.objects.filter(
                branch=branch,
                channel=channel,
                created_at__range=[start_date, end_date]
            ).count()
            notification_stats['by_channel'][channel] = channel_count
        
        # Send report via messaging service
        report_content = render_to_string('messages/messaging_report.txt', {
            'user': user,
            'branch': branch,
            'status_report': status_report,
            'notification_stats': notification_stats,
            'period_days': period_days,
            'generated_at': timezone.now()
        })
        
        success, message, notification = messaging_service.send_free_message(
            message_type='system_report',
            channel='email',
            recipient_user=user,
            subject=f"Messaging System Report - {branch.branch_name}",
            content=report_content,
            context_data={
                'report_type': 'messaging_status',
                'period_days': period_days,
                'branch_id': str(branch_id)
            },
            priority='normal'
        )
        
        if success:
            logger.info(f"Messaging report sent to {user.username}")
            return {'success': True, 'report_data': status_report}
        else:
            logger.error(f"Failed to send messaging report: {message}")
            return {'success': False, 'error': message}
        
    except (Branch.DoesNotExist, User.DoesNotExist) as e:
        error_msg = f"Required object not found: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'error': error_msg}
    except Exception as e:
        error_msg = f"Error generating messaging report: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'error': error_msg}


@shared_task
def cleanup_expired_sessions_task():
    """
    Clean up expired sessions and audit logs.
    """
    try:
        from django.contrib.sessions.models import Session
        
        # Clean up expired sessions
        expired_sessions = Session.objects.filter(
            expire_date__lt=timezone.now()
        )
        expired_count = expired_sessions.count()
        expired_sessions.delete()
        
        # Clean up old audit logs (older than 1 year)
        old_audit_logs = AuditLog.objects.filter(
            created_at__lt=timezone.now() - timezone.timedelta(days=365)
        )
        old_logs_count = old_audit_logs.count()
        old_audit_logs.delete()
        
        # Clean up old notifications (older than 6 months)
        try:
            from apps.notifications.models import Notification
            old_notifications = Notification.objects.filter(
                created_at__lt=timezone.now() - timezone.timedelta(days=180)
            )
            old_notifications_count = old_notifications.count()
            old_notifications.delete()
        except ImportError:
            old_notifications_count = 0
        
        # Clean up cache entries
        cache.clear()
        
        logger.info(f"Cleanup completed: {expired_count} sessions, {old_logs_count} audit logs, {old_notifications_count} notifications")
        return {
            'expired_sessions': expired_count,
            'old_audit_logs': old_logs_count,
            'old_notifications': old_notifications_count
        }
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        return {'error': str(e)}


@shared_task
def test_messaging_channels_task(branch_id: str, user_id: int):
    """
    Test all available messaging channels for a user.
    """
    try:
        from hinsell_backend.backend.apps.core_apps.services.messaging_service import MessagingService
        
        branch = Branch.objects.get(id=branch_id)
        user = User.objects.get(id=user_id)
        messaging_service = MessagingService(branch)
        
        # Get available channels
        available_channels = messaging_service.get_available_channels_for_user(user)
        
        test_results = {
            'user_id': user_id,
            'total_channels': len(available_channels),
            'test_results': []
        }
        
        # Test each available channel
        for channel_info in available_channels:
            channel = channel_info['channel']
            
            test_content = f"This is a test message for the {channel} channel. If you receive this, the channel is working correctly."
            
            success, message, notification = messaging_service.send_free_message(
                message_type='system_test',
                channel=channel,
                recipient_user=user,
                subject=f"Test Message - {channel.upper()} Channel",
                content=test_content,
                context_data={
                    'test_message': True,
                    'channel_test': channel,
                    'branch_id': str(branch_id)
                },
                priority='low'
            )
            
            test_results['test_results'].append({
                'channel': channel,
                'success': success,
                'message': message,
                'notification_id': str(notification.id) if notification else None,
                'contact_info': channel_info.get('contact', 'N/A')
            })
        
        logger.info(f"Channel testing completed for user {user.username}")
        return test_results
        
    except (Branch.DoesNotExist, User.DoesNotExist) as e:
        error_msg = f"Required object not found: {str(e)}"
        logger.error(error_msg)
        return {'error': error_msg}
    except Exception as e:
        error_msg = f"Error testing messaging channels: {str(e)}"
        logger.error(error_msg)
        return {'error': error_msg}
