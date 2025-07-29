import logging
from celery import shared_task
from apps.transactions.models import TransactionHeader
from apps.core_apps.services.messaging_service import MessagingService

logger = logging.getLogger(__name__)

@shared_task
def process_transaction_status_change(transaction_id: int):
    """Process transaction status changes asynchronously."""
    try:
        transaction = TransactionHeader.objects.get(id=transaction_id)
        user = transaction.customer_account.related_user if transaction.customer_account else None
        if not user:
            logger.warning(f"No user associated with transaction {transaction.code}")
            return

        service = MessagingService(transaction.branch)
        
        if transaction.status == TransactionHeader.Status.PENDING:
            service.send_notification(
                recipient=user,
                notification_type='transaction_pending',
                context_data={'transaction_number': transaction.transaction_number},
                channel='email',
                priority='normal'
            )
        elif transaction.status == TransactionHeader.Status.APPROVED:
            service.send_notification(
                recipient=user,
                notification_type='transaction_approved',
                context_data={'transaction_number': transaction.transaction_number},
                channel='email',
                priority='normal'
            )
        elif transaction.status == TransactionHeader.Status.POSTED:
            service.send_notification(
                recipient=user,
                notification_type='transaction_posted',
                context_data={'transaction_number': transaction.transaction_number},
                channel='email',
                priority='normal'
            )
        logger.info(f"Processed status change for transaction {transaction.code} to {transaction.status}")
    except TransactionHeader.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found")
    except Exception as e:
        logger.error(f"Error processing transaction {transaction_id} status change: {str(e)}", exc_info=True)