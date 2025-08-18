from celery import shared_task
from apps.organization.models import License
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _

logger = Logger(__name__)

@shared_task
def validate_licenses():
    try:
        licenses = License.objects.filter(
            status__in=[License.Status.ACTIVE, License.Status.TRIAL],
            is_deleted=False
        )
        for license in licenses:
            result = license.validate_and_update()
            if not result['valid']:
                logger.warning(
                    f"License validation failed for {license.company.company_name}: {result['violations']}",
                    extra={'license_code': license.code}
                )
            elif result['warnings']:
                logger.info(
                    f"License warnings for {license.company.company_name}: {result['warnings']}",
                    extra={'license_code': license.code}
                )
    except Exception as e:
        logger.error(f"Error validating licenses: {str(e)}", exc_info=True)