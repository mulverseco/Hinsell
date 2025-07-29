import logging
from celery import shared_task
from apps.organization.models import License, Company

logger = logging.getLogger(__name__)

@shared_task
def process_license_validation(license_id: int):
    """Process license validation asynchronously."""
    try:
        license = License.objects.get(id=license_id)
        result = license.validate_and_update()
        if result['warnings'] or result['violations']:
            logger.warning(f"License {license.license_code} validation: {result}")
        else:
            logger.info(f"License {license.license_code} validated successfully.")
    except License.DoesNotExist:
        logger.error(f"License {license_id} not found")
    except Exception as e:
        logger.error(f"Error processing license {license_id} validation: {str(e)}", exc_info=True)

@shared_task
def process_company_update(company_id: int):
    """Process company update to sync license stats."""
    try:
        company = Company.objects.get(id=company_id)
        if company.license:
            company.license.update_usage_stats()
            logger.info(f"Company {company.code} updated; license stats synced.")
    except Company.DoesNotExist:
        logger.error(f"Company {company_id} not found")
    except Exception as e:
        logger.error(f"Error processing company {company_id} update: {str(e)}", exc_info=True)