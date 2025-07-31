from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from apps.authentication.models import User, AuditLog, UserProfile
from apps.core_apps.utils import Logger
from django.contrib.sessions.models import Session
from django.utils import timezone
from apps.core_apps.services.messaging_service import MessagingService
from apps.organization.models import Branch
from django.utils.translation import gettext_lazy as _

logger = Logger(__name__)

@shared_task
def send_welcome_email(user_id):
    try:
        user = User.objects.get(id=user_id)
        branch = user.default_branch
        if not branch:
            logger.error(f"No default branch for user {user.username}", extra={'user_id': user_id})
            return

        messaging_service = MessagingService(branch=branch)
        messaging_service.send_notification(
            recipient=user,
            notification_type='welcome',
            context_data={
                'full_name': user.get_full_name(),
                'company_name': branch.company.company_name,
                'site_name': settings.SITE_NAME,
                'site_url': settings.SITE_URL,
                'profile_url': f"{settings.SITE_URL}/profile/edit"
            },
            channel='email',
            priority='normal',
            template_extra={'cta_text': _('Complete Your Profile'), 'cta_url': f"{settings.SITE_URL}/profile/edit"}
        )
        logger.info(f"Welcome email sent to {user.email}", extra={'user_id': user_id})
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for welcome email", extra={'user_id': user_id})
    except Exception as e:
        logger.error(f"Error sending welcome email to user {user_id}: {str(e)}", exc_info=True)

@shared_task
def cleanup_expired_sessions():
    try:
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        count = expired_sessions.count()
        expired_sessions.delete()
        logger.info(f"Deleted {count} expired sessions")
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            action_type=AuditLog.ActionType.SYSTEM_ACCESS,
            details={'action': 'Expired sessions cleaned up', 'count': count}
        )
    except Exception as e:
        logger.error(f"Error cleaning up expired sessions: {str(e)}", exc_info=True)

@shared_task
def send_password_reset_email(user_id, uid, token):
    try:
        user = User.objects.get(id=user_id)
        branch = user.default_branch
        if not branch:
            logger.error(f"No default branch for user {user.username}", extra={'user_id': user_id})
            return

        messaging_service = MessagingService(branch=branch)
        messaging_service.send_notification(
            recipient=user,
            notification_type='password_reset',
            context_data={
                'full_name': user.get_full_name(),
                'reset_url': f"{settings.SITE_URL}/password-reset/{uid}/{token}",
                'site_name': settings.SITE_NAME,
                'security_warning': _('For security, use a strong password and log out from other devices.')
            },
            channel='email',
            priority='high'
        )
        logger.info(f"Password reset email sent to {user.email}", extra={'user_id': user_id})
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=branch,
            user=user,
            action_type=AuditLog.ActionType.PASSWORD_CHANGE,
            username=user.username,
            details={'action': 'Password reset email sent', 'user_type': user.user_type}
        )
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for password reset email", extra={'user_id': user_id})
    except Exception as e:
        logger.error(f"Error sending password reset email to user {user_id}: {str(e)}", exc_info=True)

@shared_task
def add_loyalty_points_task(user_id: int, points: int, reason: str = None):
    try:
        user = User.objects.get(id=user_id)
        from apps.authentication.services import LoyaltyService
        LoyaltyService.add_loyalty_points(user, points, reason)
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for adding loyalty points", extra={'user_id': user_id})
    except Exception as e:
        logger.error(f"Error adding loyalty points for user {user_id}: {str(e)}", exc_info=True)

@shared_task
def redeem_loyalty_points_task(user_id: int, points: int, coupon_id: int = None):
    try:
        user = User.objects.get(id=user_id)
        from apps.authentication.services import LoyaltyService
        LoyaltyService.redeem_loyalty_points(user, points, coupon_id)
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for redeeming loyalty points", extra={'user_id': user_id})
    except Exception as e:
        logger.error(f"Error redeeming loyalty points for user {user_id}: {str(e)}", exc_info=True)

@shared_task
def withdraw_consent_task(profile_id: int, consent_type: str):
    try:
        profile = UserProfile.objects.get(id=profile_id)
        from apps.authentication.services import UserProfileService
        UserProfileService.withdraw_consent(profile, consent_type)
        if profile.can_receive_notifications('email'):
            from apps.core_apps.services.messaging_service import MessagingService
            MessagingService(branch=profile.user.default_branch).send_notification(
                recipient=profile.user,
                notification_type='consent_update',
                context_data={
                    'full_name': profile.user.get_full_name(),
                    'consent_type': consent_type.replace('_', ' ').title(),
                    'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'site_name': settings.SITE_NAME,
                    'profile_url': f"{settings.SITE_URL}/profile/edit"
                },
                channel='email',
                priority='normal'
            )
    except UserProfile.DoesNotExist:
        logger.error(f"Profile {profile_id} not found for consent withdrawal", extra={'profile_id': profile_id})
    except Exception as e:
        logger.error(f"Error withdrawing consent for profile {profile_id}: {str(e)}", exc_info=True)

@shared_task
def send_birthday_notifications():
    try:
        today = timezone.now().date()
        profiles = UserProfile.objects.filter(
            date_of_birth__month=today.month,
            date_of_birth__day=today.day,
            data_consent__marketing=True,
            user__is_active=True
        )
        for profile in profiles:
            user = profile.user
            if profile.can_receive_notifications('email'):
                from apps.authentication.services import LoyaltyService
                LoyaltyService.add_loyalty_points(user, 50, 'Birthday bonus')
                MessagingService(branch=user.default_branch).send_notification(
                    recipient=user,
                    notification_type='birthday',
                    context_data={
                        'full_name': user.get_full_name(),
                        'points': 50,
                        'site_name': settings.SITE_NAME,
                        'profile_url': f"{settings.SITE_URL}/profile"
                    },
                    channel='email',
                    priority='normal'
                )
                logger.info(f"Birthday notification sent to {user.email}", extra={'user_id': user.id})
    except Exception as e:
        logger.error(f"Error sending birthday notifications: {str(e)}", exc_info=True)

@shared_task
def send_password_change_notification(user_id):
    try:
        user = User.objects.get(id=user_id)
        if user.profile.can_receive_notifications('email'):
            from apps.core_apps.services.messaging_service import MessagingService
            MessagingService(branch=user.default_branch).send_notification(
                recipient=user,
                notification_type='password_change',
                context_data={
                    'full_name': user.get_full_name(),
                    'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'site_name': settings.SITE_NAME,
                    'security_url': f"{settings.SITE_URL}/account/security"
                },
                channel='email',
                priority='high'
            )
            logger.info(f"Password change notification sent to {user.email}", extra={'user_id': user_id})
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for password change notification", extra={'user_id': user_id})
    except Exception as e:
        logger.error(f"Error sending password change notification to user {user_id}: {str(e)}", exc_info=True)