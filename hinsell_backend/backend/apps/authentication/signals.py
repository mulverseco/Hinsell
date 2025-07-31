from django.conf import settings
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from apps.authentication.models import User, UserProfile, AuditLog
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid

logger = Logger(__name__)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created and instance.user_type != User.UserType.GUEST:
        UserProfile.objects.create(user=instance)
        logger.info(
            f"Created profile for user: {instance.username}",
            extra={'user_id': instance.id, 'user_type': instance.user_type}
        )
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=instance.default_branch,
            user=instance,
            action_type=AuditLog.ActionType.PROFILE_UPDATE,
            username=instance.username,
            details={'action': 'Profile created', 'user_type': instance.user_type}
        )

@receiver(post_save, sender=User)
def log_user_creation(sender, instance, created, **kwargs):
    if created:
        logger.info(
            f"User created: {instance.username}",
            extra={'user_id': instance.id, 'user_type': instance.user_type}
        )
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=instance.default_branch,
            user=instance,
            action_type=AuditLog.ActionType.SYSTEM_ACCESS,
            username=instance.username,
            details={'action': 'User account created', 'user_type': instance.user_type}
        )

@receiver(post_save, sender=UserProfile)
def log_profile_update(sender, instance, created, **kwargs):
    from apps.core_apps.services.messaging_service import MessagingService
    if not created:
        logger.info(
            f"Profile updated for user: {instance.user.username}",
            extra={'user_id': instance.user.id, 'user_type': instance.user.user_type}
        )
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=instance.user.default_branch,
            user=instance.user,
            action_type=AuditLog.ActionType.PROFILE_UPDATE,
            username=instance.user.username,
            details={'action': 'Profile updated', 'user_type': instance.user.user_type}
        )
        if instance.can_receive_notifications('email'):
            MessagingService(branch=instance.user.default_branch).send_notification(
                recipient=instance.user,
                notification_type='profile_update',
                context_data={
                    'full_name': instance.user.get_full_name(),
                    'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'site_name': settings.SITE_NAME,
                    'profile_url': f"{settings.SITE_URL}/profile/edit"
                },
                channel='email',
                priority='normal'
            )

@receiver(pre_delete, sender=User)
def handle_profile_deletion(sender, instance, **kwargs):
    try:
        profile = instance.profile
        profile.email = None
        profile.phone_number = None
        profile.address = None
        profile.date_of_birth = None
        profile.gender = profile.Gender.PREFER_NOT_TO_SAY
        profile.bio = ''
        profile.avatar = None
        profile.notifications = {channel: False for channel in profile.notifications}
        profile.data_consent = {key: False for key in profile.data_consent}
        profile.marketing_opt_in = False
        profile.terms_accepted = False
        profile.terms_accepted_at = None
        profile.terms_version = None
        profile.push_token = None
        profile.wishlist_items.clear()
        profile.save()
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=instance.default_branch,
            user=instance,
            action_type=AuditLog.ActionType.PROFILE_DELETION,
            username=f"anonymized_{uuid.uuid4().hex[:8]}",
            details={'reason': 'User requested profile deletion', 'user_type': instance.user_type}
        )
        logger.info(f"Profile data deleted for user: {instance.username}", 
                   extra={'user_type': instance.user_type})
        if instance.profile.can_receive_notifications('email'):
            from apps.core_apps.services.messaging_service import MessagingService
            MessagingService(branch=instance.default_branch).send_notification(
                recipient=instance,
                notification_type='profile_deletion',
                context_data={
                    'full_name': instance.get_full_name(),
                    'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'site_name': settings.SITE_NAME
                },
                channel='email',
                priority='high'
            )
    except UserProfile.DoesNotExist:
        logger.warning(f"No profile found for user: {instance.username}", extra={'user_id': instance.id})