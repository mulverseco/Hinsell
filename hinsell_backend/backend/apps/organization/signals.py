from django.conf import settings
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from apps.organization.models import Branch, SystemSettings, License
from apps.authentication.models import AuditLog
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _
from apps.core_apps.services.messaging_service import MessagingService

logger = Logger(__name__)
@receiver(post_save, sender=Branch)
def create_system_settings(sender, instance, created, **kwargs):
    if created:
        SystemSettings.objects.create(branch=instance, created_by=instance.created_by, updated_by=instance.created_by)
        logger.info(
            f"Created system settings for branch: {instance.branch_name}",
            extra={'branch_id': instance.id, 'company': instance.company.company_name}
        )
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=instance,
            user=instance.created_by,
            action_type=AuditLog.ActionType.SYSTEM_ACCESS,
            username=instance.created_by.username if instance.created_by else None,
            details={'action': 'System settings created', 'branch': instance.branch_name}
        )
        # if instance.company.email:
        #     MessagingService(branch=instance).send_notification(
        #         recipient=None,
        #         notification_type='branch_created',
        #         context_data={
        #             'email': instance.company.email,
        #             'branch_name': instance.branch_name,
        #             'company_name': instance.company.company_name,
        #             'site_name': settings.SITE_NAME
        #         },
        #         channel='email',
        #         priority='normal'
        #     )

@receiver(post_save, sender=License)
def notify_license_activation(sender, instance, created, **kwargs):
    if instance.status in [License.Status.ACTIVE, License.Status.TRIAL] and instance.activation_date:
        logger.info(
            f"License activated for company: {instance.company.company_name}",
            extra={'license_code': instance.license_code}
        )
        from apps.authentication.services import AuditService
        AuditService.create_audit_log(
            branch=instance.company.branches.filter(is_primary=True, is_deleted=False).first(),
            user=instance.created_by,
            action_type=AuditLog.ActionType.LICENSE_ACTIVATED,
            username=instance.created_by.username if instance.created_by else None,
            details={'license_code': instance.license_code, 'status': instance.status}
        )
        # if instance.licensee_email:
        #     MessagingService(branch=instance.company.branches.filter(is_primary=True, is_deleted=False).first()).send_notification(
        #         recipient=None,
        #         notification_type='license_activated',
        #         context_data={
        #             'email': instance.licensee_email,
        #             'license_code': instance.license_code,
        #             'company_name': instance.company.company_name,
        #             'activation_date': instance.activation_date.strftime('%Y-%m-%d'),
        #             'site_name': settings.SITE_NAME
        #         },
        #         channel='email',
        #         priority='high'
        #     )

@receiver(pre_delete, sender=License)
def handle_license_soft_delete(sender, instance, **kwargs):
    instance.soft_delete(user=None)
    logger.info(
        f"Soft deleted license: {instance.license_code}",
        extra={'license_code': instance.license_code}
    )
    from apps.authentication.services import AuditService
    AuditService.create_audit_log(
        branch=instance.company.branches.filter(is_primary=True, is_deleted=False).first(),
        user=None,
        action_type=AuditLog.ActionType.LICENSE_DELETED,
        username=None,
        details={'license_code': instance.license_code, 'company': instance.company.company_name}
    )