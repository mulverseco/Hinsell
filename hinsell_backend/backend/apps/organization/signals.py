"""
Django signals for the organization application.
Handles automated tasks and data consistency.
"""

import logging
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.cache import cache

from apps.organization.models import License, Company, Branch, SystemSettings
from apps.organization.tasks import (
    validate_license_task, update_license_usage_task,
    send_license_expiry_notification
)

from apps.organization.signals_definitions import (
    license_validated,
    license_violation_detected,
    license_expiry_warning
)

logger = logging.getLogger(__name__)

@receiver(post_save, sender=License)
def license_post_save(sender, instance, created, **kwargs):
    """Handle license creation and updates."""
    if created:
        logger.info(f"New license created: {instance.license_key} for {instance.company.company_name}")
        
        validate_license_task.delay(instance.id)
        
        if instance.status == 'active':
            send_license_expiry_notification.delay(
                instance.id, 
                'activated',
                f"License {instance.license_key} has been activated"
            )
    
    else:
        logger.info(f"License updated: {instance.license_key} - Status: {instance.status}")
        cache_key = f"license_validation_{instance.id}"
        cache.delete(cache_key)
        
        update_license_usage_task.delay(instance.id)


@receiver(pre_save, sender=License)
def license_pre_save(sender, instance, **kwargs):
    """Handle license pre-save operations."""
    if instance.pk:
        try:
            old_instance = License.objects.get(pk=instance.pk)
            
            if old_instance.status != instance.status:
                logger.info(
                    f"License status changed: {instance.license_key} "
                    f"from {old_instance.status} to {instance.status}"
                )
                
                if instance.status == 'suspended':
                    instance.notes = f"{instance.notes}\nSuspended at {timezone.now()}" if instance.notes else f"Suspended at {timezone.now()}"
                
                elif instance.status == 'revoked':
                    instance.notes = f"{instance.notes}\nRevoked at {timezone.now()}" if instance.notes else f"Revoked at {timezone.now()}"
                
                elif instance.status == 'active' and old_instance.status in ['pending', 'suspended']:
                    if not instance.activation_date:
                        instance.activation_date = timezone.now()
            
            if old_instance.expiry_date != instance.expiry_date:
                if instance.expiry_date:
                    logger.info(f"License expiry date updated: {instance.license_key} - {instance.expiry_date}")
        
        except License.DoesNotExist:
            pass


@receiver(post_save, sender=Company)
def company_post_save(sender, instance, created, **kwargs):
    """Handle company creation and updates."""
    if created:
        logger.info(f"New company created: {instance.company_name}")
        
        if instance.branches.exists():
            first_branch = instance.branches.first()
            if not hasattr(first_branch, 'system_settings'):
                SystemSettings.objects.create(
                    branch=first_branch,
                    created_by=instance.created_by
                )
                logger.info(f"Default system settings created for branch: {first_branch.branch_name}")


@receiver(post_save, sender=Branch)
def branch_post_save(sender, instance, created, **kwargs):
    """Handle branch creation and updates."""
    if created:
        logger.info(f"New branch created: {instance.branch_name} for {instance.default_branch.company.company_name}")
        
        if not hasattr(instance, 'system_settings'):
            SystemSettings.objects.create(
                branch=instance,
                created_by=instance.created_by
            )
            logger.info(f"Default system settings created for branch: {instance.branch_name}")
        
        try:
            license = instance.default_branch.company.license
            update_license_usage_task.delay(license.id)
        except License.DoesNotExist:
            logger.warning(f"No license found for company: {instance.default_branch.company.company_name}")
        
        if instance.is_primary:
            Branch.objects.filter(
                default_branch=instance.default_branch,
                is_primary=True
            ).exclude(id=instance.id).update(is_primary=False)
            
            logger.info(f"Primary branch set: {instance.branch_name}")
        
        if instance.is_headquarters:
            Branch.objects.filter(
                default_branch=instance.default_branch,
                is_headquarters=True
            ).exclude(id=instance.id).update(is_headquarters=False)
            
            logger.info(f"Headquarters set: {instance.branch_name}")


@receiver(post_delete, sender=Branch)
def branch_post_delete(sender, instance, **kwargs):
    """Handle branch deletion."""
    logger.info(f"Branch deleted: {instance.branch_name}")
    
    try:
        license = instance.company.license
        update_license_usage_task.delay(license.id)
    except License.DoesNotExist:
        pass


@receiver(post_save, sender=SystemSettings)
def system_settings_post_save(sender, instance, created, **kwargs):
    """Handle system settings creation and updates."""
    if created:
        logger.info(f"System settings created for branch: {instance.branch.branch_name}")
    else:
        logger.info(f"System settings updated for branch: {instance.branch.branch_name}")
        
        cache_key = f"system_settings_{instance.branch.id}"
        cache.delete(cache_key)




@receiver(license_validated)
def handle_license_validated(sender, license, validation_result, **kwargs):
    """Handle license validation completion."""
    logger.info(f"License validated: {license.license_key} - Valid: {validation_result['valid']}")
    
    cache_key = f"license_validation_{license.id}"
    cache.set(cache_key, validation_result, timeout=3600)

    if validation_result['violations']:
        license_violation_detected.send(
            sender=License,
            license=license,
            violations=validation_result['violations']
        )

    if validation_result['warnings']:
        license_expiry_warning.send(
            sender=License,
            license=license,
            warnings=validation_result['warnings']
        )


@receiver(license_violation_detected)
def handle_license_violation(sender, license, violations, **kwargs):
    """Handle license violations."""
    logger.warning(f"License violations detected for {license.license_key}: {violations}")

    for violation in violations:
        license.record_violation(violation)
    
    send_license_expiry_notification.delay(
        license.id,
        'violation',
        f"License violations detected: {', '.join(violations)}"
    )


@receiver(license_expiry_warning)
def handle_license_expiry_warning(sender, license, warnings, **kwargs):
    """Handle license expiry warnings."""
    logger.warning(f"License expiry warnings for {license.license_key}: {warnings}")
    
    send_license_expiry_notification.delay(
        license.id,
        'expiry_warning',
        f"License expiry warnings: {', '.join(warnings)}"
    )


def schedule_periodic_tasks():
    """Schedule periodic maintenance tasks."""
    from django_celery_beat.models import PeriodicTask, CrontabSchedule
    
    schedule, created = CrontabSchedule.objects.get_or_create(
        minute=0,
        hour=2,
        day_of_week='*',
        day_of_month='*',
        month_of_year='*',
    )
    
    PeriodicTask.objects.get_or_create(
        crontab=schedule,
        name='Daily License Validation',
        task='apps.organization.tasks.validate_all_licenses_task',
        defaults={'enabled': True}
    )
    
    schedule, created = CrontabSchedule.objects.get_or_create(
        minute=0,
        hour=3,
        day_of_week=0,
        day_of_month='*',
        month_of_year='*',
    )
    
    PeriodicTask.objects.get_or_create(
        crontab=schedule,
        name='Weekly License Cleanup',
        task='apps.organization.tasks.cleanup_expired_licenses',
        defaults={'enabled': True}
    )
    
    logger.info("Periodic tasks scheduled successfully")
