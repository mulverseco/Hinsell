"""
Django signals for transactions app.
"""
import logging
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from apps.transactions.models import TransactionType, TransactionHeader, TransactionDetail, LedgerEntry

logger = logging.getLogger(__name__)


@receiver(post_save, sender=TransactionType)
def transaction_type_post_save(sender, instance, created, **kwargs):
    """Handle transaction type creation and updates."""
    if created:
        logger.info(f"New transaction type created: {instance.type_code} - {instance.type_name}")
    else:
        logger.info(f"Transaction type updated: {instance.type_code}")
    
    # Clear cache
    cache.delete_pattern(f"transaction_types:{instance.branch.id}:*")


@receiver(post_save, sender=TransactionHeader)
def transaction_header_post_save(sender, instance, created, **kwargs):
    """Handle transaction header creation and updates."""
    if created:
        logger.info(f"New transaction created: {instance.transaction_number}")
        
        # Generate transaction number if not provided
        if not instance.transaction_number:
            from apps.transactions.tasks import generate_transaction_number
            generate_transaction_number.delay(instance.id)
        
        # Send notification for transactions requiring approval
        if instance.transaction_type.requires_approval:
            from apps.transactions.tasks import send_approval_notification
            send_approval_notification.delay(instance.id)
    else:
        logger.info(f"Transaction updated: {instance.transaction_number} - Status: {instance.status}")
        
        # Handle status change notifications
        if hasattr(instance, '_status_changed') and instance._status_changed:
            from apps.transactions.tasks import send_status_change_notification
            send_status_change_notification.delay(instance.id, instance.status)
    
    # Clear cache
    cache.delete_pattern(f"transactions:{instance.branch.id}:*")
    cache.delete_pattern(f"transaction:{instance.id}:*")


@receiver(pre_save, sender=TransactionHeader)
def transaction_header_pre_save(sender, instance, **kwargs):
    """Handle transaction header pre-save operations."""
    if instance.pk:  # Existing transaction
        try:
            old_instance = TransactionHeader.objects.get(pk=instance.pk)
            
            # Track status changes
            if old_instance.status != instance.status:
                instance._status_changed = True
                logger.info(f"Transaction {instance.transaction_number} status changed: {old_instance.status} -> {instance.status}")
            
            # Validate status transitions
            if not instance._is_valid_status_transition(old_instance.status, instance.status):
                logger.error(f"Invalid status transition for transaction {instance.transaction_number}: {old_instance.status} -> {instance.status}")
                
        except TransactionHeader.DoesNotExist:
            pass


@receiver(post_save, sender=TransactionDetail)
def transaction_detail_post_save(sender, instance, created, **kwargs):
    """Handle transaction detail creation and updates."""
    if created:
        logger.info(f"New transaction detail created: {instance.header.transaction_number} - Line {instance.line_number}")
    else:
        logger.info(f"Transaction detail updated: {instance.header.transaction_number} - Line {instance.line_number}")
    
    # Update header totals
    instance.header.calculate_totals()
    instance.header.save(update_fields=[
        'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount'
    ])
    
    # Clear cache
    cache.delete_pattern(f"transaction:{instance.header.id}:*")
    cache.delete_pattern(f"transaction_details:{instance.header.id}:*")


@receiver(post_delete, sender=TransactionDetail)
def transaction_detail_post_delete(sender, instance, **kwargs):
    """Handle transaction detail deletion."""
    logger.info(f"Transaction detail deleted: {instance.header.transaction_number} - Line {instance.line_number}")
    
    # Update header totals
    instance.header.calculate_totals()
    instance.header.save(update_fields=[
        'subtotal_amount', 'discount_amount', 'tax_amount', 'total_amount'
    ])
    
    # Clear cache
    cache.delete_pattern(f"transaction:{instance.header.id}:*")
    cache.delete_pattern(f"transaction_details:{instance.header.id}:*")


@receiver(post_save, sender=LedgerEntry)
def ledger_entry_post_save(sender, instance, created, **kwargs):
    """Handle ledger entry creation and updates."""
    if created:
        logger.info(f"New ledger entry created: {instance.account.account_code} - {instance.get_amount()}")
        
        # Update account balance
        from apps.transactions.tasks import update_account_balance
        update_account_balance.delay(instance.account.id)
    else:
        logger.info(f"Ledger entry updated: {instance.account.account_code}")
    
    # Clear cache
    cache.delete_pattern(f"ledger_entries:{instance.branch.id}:*")
    cache.delete_pattern(f"account_balance:{instance.account.id}:*")


@receiver(post_delete, sender=LedgerEntry)
def ledger_entry_post_delete(sender, instance, **kwargs):
    """Handle ledger entry deletion."""
    logger.info(f"Ledger entry deleted: {instance.account.account_code} - {instance.get_amount()}")
    
    # Update account balance
    from apps.transactions.tasks import update_account_balance
    update_account_balance.delay(instance.account.id)
    
    # Clear cache
    cache.delete_pattern(f"ledger_entries:{instance.branch.id}:*")
    cache.delete_pattern(f"account_balance:{instance.account.id}:*")
