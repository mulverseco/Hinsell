from celery import shared_task
from django.utils import timezone
from apps.transactions.models import TransactionHeader
from apps.core_apps.utils import Logger
from django.db.models import F

logger = Logger(__name__)

@shared_task
def check_overdue_transactions():
    """Check for overdue transactions and send notifications."""
    overdue_transactions = TransactionHeader.objects.filter(
        status__in=[TransactionHeader.Status.APPROVED, TransactionHeader.Status.POSTED],
        due_date__lt=timezone.now().date(),
        is_deleted=False
    ).exclude(paid_amount__gte=F('total_amount'))
    
    for transaction in overdue_transactions:
        try:
            transaction.is_overdue()
            logger.info(
                f"Checked overdue status for transaction {transaction.code}",
                extra={'object_id': transaction.id}
            )
        except Exception as e:
            logger.error(
                f"Error checking overdue status for transaction {transaction.code}: {str(e)}",
                extra={'object_id': transaction.id}
            )

@shared_task
def process_transaction_posting(transaction_id, user_id):
    """Asynchronously post a transaction."""
    from apps.authentication.models import User
    try:
        transaction = TransactionHeader.objects.get(id=transaction_id, is_deleted=False)
        user = User.objects.get(id=user_id)
        transaction.post(user)
        logger.info(
            f"Asynchronously posted transaction {transaction.code}",
            extra={'object_id': transaction.id, 'user_id': user_id}
        )
    except TransactionHeader.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found", extra={'object_id': transaction_id})
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found", extra={'user_id': user_id})
    except Exception as e:
        logger.error(
            f"Error posting transaction {transaction_id}: {str(e)}",
            extra={'object_id': transaction_id, 'user_id': user_id}
        )

@shared_task
def process_transaction_reversal(transaction_id, user_id, reason):
    """Asynchronously reverse a transaction."""
    from apps.authentication.models import User
    try:
        transaction = TransactionHeader.objects.get(id=transaction_id, is_deleted=False)
        user = User.objects.get(id=user_id)
        transaction.reverse(user, reason)
        logger.info(
            f"Asynchronously reversed transaction {transaction.code}",
            extra={'object_id': transaction.id, 'user_id': user_id}
        )
    except TransactionHeader.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found", extra={'object_id': transaction_id})
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found", extra={'user_id': user_id})
    except Exception as e:
        logger.error(
            f"Error reversing transaction {transaction_id}: {str(e)}",
            extra={'object_id': transaction_id, 'user_id': user_id}
        )