from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry
from apps.authentication.services import AuditService
from apps.core_apps.utils import Logger
from apps.core_apps.services.messaging_service import MessagingService

logger = Logger(__name__)

@receiver(post_save, sender=TransactionType)
def transaction_type_saved(sender, instance, created, **kwargs):
    action = 'transaction_type_created' if created else 'transaction_type_updated'
    AuditService.create_audit_log(
        branch=instance.branch,
        user=instance.created_by if created else instance.updated_by,
        action_type=action,
        username=instance.created_by.username if created else instance.updated_by.username,
        details={'code': instance.code, 'name': instance.name}
    )
    logger.info(
        f"{'Created' if created else 'Updated'} TransactionType {instance.code}",
        extra={'object_id': instance.id, 'user_id': instance.created_by.id if created else instance.updated_by.id}
    )

@receiver(post_save, sender=TransactionHeader)
def transaction_header_saved(sender, instance, created, **kwargs):
    action = 'transaction_header_created' if created else 'transaction_header_updated'
    AuditService.create_audit_log(
        branch=instance.branch,
        user=instance.created_by if created else instance.updated_by,
        action_type=action,
        username=instance.created_by.username if created else instance.updated_by.username,
        details={'code': instance.code, 'transaction_number': instance.transaction_number, 'status': instance.status}
    )
    logger.info(
        f"{'Created' if created else 'Updated'} TransactionHeader {instance.code}",
        extra={'object_id': instance.id, 'user_id': instance.created_by.id if created else instance.updated_by.id}
    )

    if instance.status == TransactionHeader.Status.APPROVED and instance.approved_by:
        try:
            user = instance.customer_account.related_user if instance.customer_account else None
            if user and user.profile.can_receive_notifications('email'):
                MessagingService(instance.branch).send_notification(
                    recipient=user,
                    notification_type='transaction_approved',
                    context_data={
                        'transaction_number': instance.transaction_number,
                        'approved_by': instance.approved_by.get_full_name(),
                        'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                    },
                    channel='email',
                    priority='normal'
                )
        except Exception as e:
            logger.error(
                f"Error sending approval notification for transaction {instance.code}: {str(e)}",
                extra={'object_id': instance.id}
            )

@receiver(post_save, sender=TransactionDetail)
def transaction_detail_saved(sender, instance, created, **kwargs):
    action = 'transaction_detail_created' if created else 'transaction_detail_updated'
    AuditService.create_audit_log(
        branch=instance.header.branch,
        user=instance.created_by if created else instance.updated_by,
        action_type=action,
        username=instance.created_by.username if created else instance.updated_by.username,
        details={'header_code': instance.header.code, 'line_number': instance.line_number}
    )
    logger.info(
        f"{'Created' if created else 'Updated'} TransactionDetail for header {instance.header.code}",
        extra={'object_id': instance.id, 'user_id': instance.created_by.id if created else instance.updated_by.id}
    )

@receiver(post_save, sender=LedgerEntry)
def ledger_entry_saved(sender, instance, created, **kwargs):
    action = 'ledger_entry_created' if created else 'ledger_entry_updated'
    AuditService.create_audit_log(
        branch=instance.branch,
        user=instance.created_by if created else instance.updated_by,
        action_type=action,
        username=instance.created_by.username if created else instance.updated_by.username,
        details={'code': instance.code, 'account': instance.account.code}
    )
    logger.info(
        f"{'Created' if created else 'Updated'} LedgerEntry {instance.code}",
        extra={'object_id': instance.id, 'user_id': instance.created_by.id if created else instance.updated_by.id}
    )

@receiver(post_delete, sender=TransactionType)
def transaction_type_deleted(sender, instance, **kwargs):
    AuditService.create_audit_log(
        branch=instance.branch,
        user=None,
        action_type='transaction_type_deleted',
        username=None,
        details={'code': instance.code, 'name': instance.name}
    )
    logger.info(
        f"Deleted TransactionType {instance.code}",
        extra={'object_id': instance.id}
    )

@receiver(post_delete, sender=TransactionHeader)
def transaction_header_deleted(sender, instance, **kwargs):
    AuditService.create_audit_log(
        branch=instance.branch,
        user=None,
        action_type='transaction_header_deleted',
        username=None,
        details={'code': instance.code, 'transaction_number': instance.transaction_number}
    )
    logger.info(
        f"Deleted TransactionHeader {instance.code}",
        extra={'object_id': instance.id}
    )

@receiver(post_delete, sender=TransactionDetail)
def transaction_detail_deleted(sender, instance, **kwargs):
    AuditService.create_audit_log(
        branch=instance.header.branch,
        user=None,
        action_type='transaction_detail_deleted',
        username=None,
        details={'header_code': instance.header.code, 'line_number': instance.line_number}
    )
    logger.info(
        f"Deleted TransactionDetail for header {instance.header.code}",
        extra={'object_id': instance.id}
    )

@receiver(post_delete, sender=LedgerEntry)
def ledger_entry_deleted(sender, instance, **kwargs):
    AuditService.create_audit_log(
        branch=instance.branch,
        user=None,
        action_type='ledger_entry_deleted',
        username=None,
        details={'code': instance.code, 'account': instance.account.code}
    )
    logger.info(
        f"Deleted LedgerEntry {instance.code}",
        extra={'object_id': instance.id}
    )