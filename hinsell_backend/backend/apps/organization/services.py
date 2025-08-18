from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.organization.models import License, Branch
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _
from apps.core_apps.services.messaging_service import MessagingService
from apps.authentication.services import AuditService
from django.conf import settings
from apps.authentication.models import AuditLog

logger = Logger(__name__)

class LicenseService:
    @staticmethod
    def create_license(company, license_type, licensee_name, licensee_email, created_by=None):
        if company.is_deleted or license_type.is_deleted:
            raise ValidationError(_('Cannot create license for deleted company or license type.'))
        
        license_key = License.generate_license_key()
        license = License.objects.create(
            license_key=license_key,
            license_type=license_type,
            company=company,
            licensee_name=licensee_name,
            licensee_email=licensee_email,
            created_by=created_by,
            updated_by=created_by
        )
        license.validate_and_update()
        
        primary_branch = company.branches.filter(is_primary=True, is_deleted=False).first()
        AuditService.create_audit_log(
            branch=primary_branch,
            user=created_by,
            action_type=AuditLog.ActionType.LICENSE_CREATED,
            username=created_by.username if created_by else None,
            details={'license_code': license.license_code, 'company': company.company_name}
        )
        
        # if license.licensee_email:
        #     try:
        #         if primary_branch:  # Only send notification if primary branch exists
        #             MessagingService(branch=primary_branch).send_notification(
        #                 recipient=None,
        #                 notification_type='license_created',
        #                 context_data={
        #                     'email': license.licensee_email,
        #                     'license_code': license.license_code,
        #                     'company_name': company.company_name,
        #                     'site_name': settings.SITE_NAME
        #                 },
        #                 channel='email',
        #                 priority='high'
        #             )
        #     except Exception as e:
        #         logger.error(f"Failed to send license creation notification: {str(e)}", exc_info=True)
        
        return license

    @staticmethod
    def suspend_license(license, reason, user):
        if license.is_deleted:
            raise ValidationError(_('Cannot suspend a deleted license.'))
        if license.suspend(reason):
            AuditService.create_audit_log(
                branch=license.company.branches.filter(is_primary=True, is_deleted=False).first(),
                user=user,
                action_type=AuditLog.ActionType.LICENSE_SUSPENDED,
                username=user.username if user else None,
                details={'license_code': license.license_code, 'reason': reason}
            )
            if license.licensee_email:
                MessagingService(branch=license.company.branches.filter(is_primary=True, is_deleted=False).first()).send_notification(
                    recipient=None,
                    notification_type='license_suspended',
                    context_data={
                        'email': license.licensee_email,
                        'license_code': license.license_code,
                        'company_name': license.company.company_name,
                        'reason': reason,
                        'site_name': settings.SITE_NAME
                    },
                    channel='email',
                    priority='high'
                )

    @staticmethod
    def revoke_license(license, reason, user):
        if license.is_deleted:
            raise ValidationError(_('Cannot revoke a deleted license.'))
        if license.revoke(reason):
            AuditService.create_audit_log(
                branch=license.company.branches.filter(is_primary=True, is_deleted=False).first(),
                user=user,
                action_type=AuditLog.ActionType.LICENSE_REVOKED,
                username=user.username if user else None,
                details={'license_code': license.license_code, 'reason': reason}
            )
            if license.licensee_email:
                MessagingService(branch=license.company.branches.filter(is_primary=True, is_deleted=False).first()).send_notification(
                    recipient=None,
                    notification_type='license_revoked',
                    context_data={
                        'email': license.licensee_email,
                        'license_code': license.license_code,
                        'company_name': license.company.company_name,
                        'reason': reason,
                        'site_name': settings.SITE_NAME
                    },
                    channel='email',
                    priority='high'
                )

class BranchService:
    @staticmethod
    def create_branch(company, branch_name, is_primary=False, created_by=None):
        if company.is_deleted:
            raise ValidationError(_('Cannot create branch for a deleted company.'))
        branch = Branch.objects.create(
            company=company,
            branch_name=branch_name,
            is_primary=is_primary,
            created_by=created_by,
            updated_by=created_by,
            current_fiscal_year=timezone.now().year
        )
        AuditService.create_audit_log(
            branch=branch,
            user=created_by,
            action_type=AuditLog.ActionType.BRANCH_CREATED,
            username=created_by.username if created_by else None,
            details={'branch_code': branch.branch_code, 'name': branch.branch_name}
        )
        # if company.email:
        #     MessagingService(branch=branch).send_notification(
        #         recipient=None,
        #         notification_type='branch_created',
        #         context_data={
        #             'email': company.email,
        #             'branch_name': branch.branch_name,
        #             'company_name': company.company_name,
        #             'site_name': settings.SITE_NAME
        #         },
        #         channel='email',
        #         priority='normal'
        #     )
        return branch

class SystemSettingsService:
    @staticmethod
    def update_notifications(settings, notifications, user):
        if settings.is_deleted:
            raise ValidationError(_('Cannot update notifications for a deleted system settings record.'))
        settings.notifications = notifications
        settings.save()
        AuditService.create_audit_log(
            branch=settings.branch,
            user=user,
            action_type=AuditLog.ActionType.SYSTEM_SETTINGS_UPDATED,
            username=user.username,
            details={'branch': settings.branch.branch_name, 'updated_field': 'notifications'}
        )
        if settings.notifications.get('email', False):
            MessagingService(branch=settings.branch).send_notification(
                recipient=None,
                notification_type='system_settings_updated',
                context_data={
                    'email': settings.branch.email,
                    'branch_name': settings.branch.branch_name,
                    'company_name': settings.branch.company.company_name,
                    'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'site_name': settings.SITE_NAME
                },
                channel='email',
                priority='normal'
            )