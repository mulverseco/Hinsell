import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.accounting.models import Account, Currency, Budget
from apps.accounting.tasks import process_account_balance_update, process_currency_update, process_budget_update

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Account)
def handle_account_save(sender, instance, created, **kwargs):
    """Handle account save to update balance."""
    try:
        process_account_balance_update.delay(instance.id)
        logger.info(f"Account {instance.code} saved; balance update task dispatched.")
    except Exception as e:
        logger.error(f"Error handling account {instance.code} save: {str(e)}", exc_info=True)

@receiver(post_save, sender=Currency)
def handle_currency_save(sender, instance, created, **kwargs):
    """Handle currency save to update related accounts."""
    try:
        process_currency_update.delay(instance.id)
        logger.info(f"Currency {instance.code} saved; update task dispatched.")
    except Exception as e:
        logger.error(f"Error handling currency {instance.code} save: {str(e)}", exc_info=True)

@receiver(post_save, sender=Budget)
def handle_budget_save(sender, instance, created, **kwargs):
    """Handle budget save to check variance."""
    try:
        process_budget_update.delay(instance.id)
        logger.info(f"Budget {instance.code} saved; update task dispatched.")
    except Exception as e:
        logger.error(f"Error handling budget {instance.code} save: {str(e)}", exc_info=True)