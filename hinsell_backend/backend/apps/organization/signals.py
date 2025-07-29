import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.organization.models import License, Branch, Company
from apps.organization.tasks import process_license_validation, process_company_update

logger = logging.getLogger(__name__)

@receiver(post_save, sender=License)
def handle_license_save(sender, instance, created, **kwargs):
    """Handle license save to trigger validation task."""
    try:
        if created or instance.status in [License.Status.ACTIVE, License.Status.TRIAL]:
            process_license_validation.delay(instance.id)
        logger.info(f"License {instance.license_code} saved; validation task dispatched.")
    except Exception as e:
        logger.error(f"Error handling license {instance.license_code} save: {str(e)}", exc_info=True)

@receiver(post_save, sender=Company)
def handle_company_save(sender, instance, created, **kwargs):
    """Handle company save to update license stats."""
    try:
        process_company_update.delay(instance.id)
        logger.info(f"Company {instance.code} saved; update task dispatched.")
    except Exception as e:
        logger.error(f"Error handling company {instance.code} save: {str(e)}", exc_info=True)

@receiver(post_save, sender=Branch)
def handle_branch_save(sender, instance, created, **kwargs):
    """Handle branch save to update license stats."""
    try:
        if instance.company.license:
            instance.company.license.update_usage_stats()
        logger.info(f"Branch {instance.branch_code} saved; license stats updated.")
    except Exception as e:
        logger.error(f"Error handling branch {instance.branch_code} save: {str(e)}", exc_info=True)