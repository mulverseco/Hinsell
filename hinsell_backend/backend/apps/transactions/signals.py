import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.transactions.models import TransactionHeader
from apps.transactions.tasks import process_transaction_status_change

logger = logging.getLogger(__name__)

@receiver(post_save, sender=TransactionHeader)
def handle_transaction_status_change(sender, instance, created, **kwargs):
    """Handle transaction status changes to trigger tasks or notifications."""
    try:
        if created or instance.status in [TransactionHeader.Status.PENDING, TransactionHeader.Status.APPROVED, TransactionHeader.Status.POSTED]:
            process_transaction_status_change.delay(instance.id)
        if instance.is_overdue():
            logger.info(f"Transaction {instance.code} is overdue; notification dispatched.")
    except Exception as e:
        logger.error(f"Error handling transaction {instance.code} status change: {str(e)}", exc_info=True)