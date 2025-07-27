"""
Django signals for the pharmacy management system.
Handles automatic actions triggered by model events.
"""
import logging
from django.db.models.signals import post_save, pre_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.cache import cache

from apps.authentication.models import User, UserProfile, AuditLog
from apps.authentication.tasks import (
    send_welcome_message_task,
    create_audit_log_entry,
    send_security_alert_task,
    cleanup_expired_sessions_task
)

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a new User is created.
    """
    if created:
        try:
            UserProfile.objects.create(
                user=instance,
                created_by=instance
            )
            logger.info(f"Created profile for user: {instance.username}")
            
            if hasattr(instance, 'email') and instance.email:
                send_welcome_message_task.delay(instance.id, instance.branch.id)
                
        except Exception as e:
            logger.error(f"Failed to create profile for user {instance.username}: {str(e)}")


@receiver(post_save, sender=User)
def user_profile_updated(sender, instance, created, **kwargs):
    """
    Handle user profile updates and security changes.
    """
    if not created:
        try:
            original = User.objects.get(pk=instance.pk)
            
            # Check for security-relevant changes
            if original.is_active != instance.is_active:
                if not instance.is_active:
                    # User was deactivated
                    create_audit_log_entry.delay({
                        'user_id': instance.id,
                        'action_type': 'account_deactivated',
                        'details': {'deactivated_at': timezone.now().isoformat()}
                    })
                    
                    # Invalidate all user sessions
                    cache.delete_pattern(f"user_session_{instance.id}_*")
                    
            if (original.is_staff != instance.is_staff or 
                original.is_superuser != instance.is_superuser):
                # Permission changes
                create_audit_log_entry.delay({
                    'user_id': instance.id,
                    'action_type': 'permission_change',
                    'details': {
                        'is_staff': instance.is_staff,
                        'is_superuser': instance.is_superuser,
                        'changed_at': timezone.now().isoformat()
                    }
                })
                
                # Send security alert
                send_security_alert_task.delay(
                    instance.id,
                    'permission_change',
                    'Your account permissions have been modified.'
                )
                
        except User.DoesNotExist:
            pass

@receiver(user_logged_in)
def user_login_success(sender, request, user, **kwargs):
    """
    Handle successful user login.
    """
    try:
        # Reset failed login attempts
        user.reset_failed_login()
        
        # Update login information
        user.last_login_ip = getattr(request, 'client_ip', '')
        user.last_login_device = str(getattr(request, 'user_agent_parsed', ''))
        user.save(update_fields=['last_login_ip', 'last_login_device'])
        
        # Create audit log entry
        audit_data = {
            'user_id': user.id,
            'username': user.username,
            'action_type': 'login',
            'ip_address': getattr(request, 'client_ip', ''),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'login_status': 'success',
            'timestamp': timezone.now().isoformat()
        }
        
        create_audit_log_entry.delay(audit_data)
        
        # Check for suspicious login patterns
        recent_logins = AuditLog.objects.filter(
            user=user,
            action_type='login',
            created_at__gte=timezone.now() - timezone.timedelta(hours=1)
        ).count()
        
        if recent_logins > 5:
            send_security_alert_task.delay(
                user.id,
                'suspicious_login',
                'Multiple login attempts detected on your account.'
            )
            
        logger.info(f"User {user.username} logged in successfully from {audit_data['ip_address']}")
        
    except Exception as e:
        logger.error(f"Error handling user login for {user.username}: {str(e)}")


@receiver(user_login_failed)
def user_login_failed_handler(sender, credentials, request, **kwargs):
    """
    Handle failed login attempts.
    """
    try:
        username = credentials.get('username', '')
        ip_address = getattr(request, 'client_ip', '')
        
        # Try to find the user
        try:
            user = User.objects.get(username=username)
            user.increment_failed_login()
            
            # Create audit log entry
            audit_data = {
                'user_id': user.id,
                'username': username,
                'action_type': 'login_failed',
                'ip_address': ip_address,
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'login_status': 'failed',
                'timestamp': timezone.now().isoformat()
            }
            
            create_audit_log_entry.delay(audit_data)
            
            # Send security alert if account is locked
            if user.is_account_locked():
                send_security_alert_task.delay(
                    user.id,
                    'account_locked',
                    'Your account has been temporarily locked due to multiple failed login attempts.'
                )
                
        except User.DoesNotExist:
            # Log failed attempt for non-existent user
            audit_data = {
                'username': username,
                'action_type': 'login_failed',
                'ip_address': ip_address,
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'login_status': 'failed',
                'details': {'reason': 'user_not_found'},
                'timestamp': timezone.now().isoformat()
            }
            
            create_audit_log_entry.delay(audit_data)
        
        logger.warning(f"Failed login attempt for username: {username} from IP: {ip_address}")
        
    except Exception as e:
        logger.error(f"Error handling failed login: {str(e)}")


@receiver(user_logged_out)
def user_logout_handler(sender, request, user, **kwargs):
    """
    Handle user logout.
    """
    try:
        if user:
            # Create audit log entry
            audit_data = {
                'user_id': user.id,
                'username': user.username,
                'action_type': 'logout',
                'ip_address': getattr(request, 'client_ip', ''),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'login_status': 'success',
                'timestamp': timezone.now().isoformat()
            }
            
            create_audit_log_entry.delay(audit_data)
            
            # Clean up user-specific cache
            cache.delete_pattern(f"user_session_{user.id}_*")
            
            logger.info(f"User {user.username} logged out")
            
    except Exception as e:
        logger.error(f"Error handling user logout: {str(e)}")


@receiver(pre_save, sender=User)
def track_user_changes(sender, instance, **kwargs):
    """
    Track changes to user model for audit purposes.
    """
    if instance.pk:
        try:
            # Get the original instance
            original = User.objects.get(pk=instance.pk)
            
            # Track password changes
            if original.password != instance.password:
                instance.password_changed_at = timezone.now()
                
                # Send password change notification
                send_security_alert_task.delay(
                    instance.id,
                    'password_changed',
                    'Your password has been successfully changed.'
                )
                
        except User.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Error tracking user changes: {str(e)}")


@receiver(post_delete, sender=User)
def user_deleted_handler(sender, instance, **kwargs):
    """
    Handle user deletion.
    """
    try:
        # Create audit log entry
        audit_data = {
            'username': instance.username,
            'action_type': 'user_deleted',
            'details': {
                'user_id': str(instance.id),
                'deleted_at': timezone.now().isoformat()
            }
        }
        
        create_audit_log_entry.delay(audit_data)
        
        # Clean up user-related cache
        cache.delete_pattern(f"user_*_{instance.id}_*")
        
        logger.info(f"User {instance.username} was deleted")
        
    except Exception as e:
        logger.error(f"Error handling user deletion: {str(e)}")


# Periodic cleanup signal
@receiver(user_logged_in)
def trigger_cleanup_tasks(sender, **kwargs):
    """
    Trigger periodic cleanup tasks on user login.
    """
    try:
        # Randomly trigger cleanup (1 in 100 chance)
        import random
        if random.randint(1, 100) == 1:
            cleanup_expired_sessions_task.delay()
            
    except Exception as e:
        logger.error(f"Error triggering cleanup tasks: {str(e)}")
