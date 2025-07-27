"""
Django signals for triggering webhook events.
"""
import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.authentication.models import User
from apps.inventory.models import Item, InventoryBalance
from apps.transactions.models import TransactionHeader
from apps.webhooks.services import trigger_webhook_event

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def user_webhook_events(sender, instance, created, **kwargs):
    """Trigger webhook events for user changes."""
    try:
        if created:
            event_data = {
                'user_id': str(instance.id),
                'username': instance.username,
                'email': getattr(instance, 'profile', {}).email if hasattr(instance, 'profile') else None,
                'full_name': instance.get_full_name(),
                'is_active': instance.is_active,
                'created_at': instance.created_at.isoformat() if instance.created_at else None,
            }
            
            trigger_webhook_event(
                event_type='user.created',
                event_data=event_data,
                branch_id=instance.default_branch_id if instance.default_branch_id else 1,
                source_object=instance
            )
        else:
            event_data = {
                'user_id': str(instance.id),
                'username': instance.username,
                'full_name': instance.get_full_name(),
                'is_active': instance.is_active,
                'updated_at': instance.updated_at.isoformat() if instance.updated_at else None,
            }
            
            trigger_webhook_event(
                event_type='user.updated',
                event_data=event_data,
                branch_id=instance.default_branch_id if instance.default_branch_id else 1,
                source_object=instance
            )
            
    except Exception as e:
        logger.error(f"Error triggering user webhook event: {e}")


@receiver(post_save, sender=Item)
def item_webhook_events(sender, instance, created, **kwargs):
    """Trigger webhook events for item changes."""
    try:
        event_data = {
            'item_id': str(instance.id),
            'item_code': instance.item_code,
            'item_name': instance.item_name,
            'item_type': instance.item_type,
            'is_active': instance.is_active,
            'branch_id': instance.branch_id,
        }
        
        if created:
            event_data['created_at'] = instance.created_at.isoformat() if instance.created_at else None
            trigger_webhook_event(
                event_type='inventory.item.created',
                event_data=event_data,
                branch_id=instance.branch_id,
                source_object=instance
            )
        else:
            event_data['updated_at'] = instance.updated_at.isoformat() if instance.updated_at else None
            trigger_webhook_event(
                event_type='inventory.item.updated',
                event_data=event_data,
                branch_id=instance.branch_id,
                source_object=instance
            )
            
    except Exception as e:
        logger.error(f"Error triggering item webhook event: {e}")


@receiver(post_save, sender=InventoryBalance)
def inventory_balance_webhook_events(sender, instance, created, **kwargs):
    """Trigger webhook events for inventory balance changes."""
    try:
        # Check for low stock
        if instance.item.reorder_level > 0 and instance.available_quantity <= instance.item.reorder_level:
            event_data = {
                'item_id': str(instance.item.id),
                'item_code': instance.item.item_code,
                'item_name': instance.item.item_name,
                'current_quantity': float(instance.available_quantity),
                'reorder_level': float(instance.item.reorder_level),
                'branch_id': instance.branch_id,
                'location': instance.location,
                'batch_number': instance.batch_number,
                'expiry_date': instance.expiry_date.isoformat() if instance.expiry_date else None,
            }
            
            trigger_webhook_event(
                event_type='inventory.low_stock',
                event_data=event_data,
                branch_id=instance.branch_id,
                source_object=instance
            )
        
        # Check for expired items
        if instance.is_expired():
            event_data = {
                'item_id': str(instance.item.id),
                'item_code': instance.item.item_code,
                'item_name': instance.item.item_name,
                'quantity': float(instance.available_quantity),
                'branch_id': instance.branch_id,
                'location': instance.location,
                'batch_number': instance.batch_number,
                'expiry_date': instance.expiry_date.isoformat() if instance.expiry_date else None,
            }
            
            trigger_webhook_event(
                event_type='inventory.expired',
                event_data=event_data,
                branch_id=instance.branch_id,
                source_object=instance
            )
            
    except Exception as e:
        logger.error(f"Error triggering inventory balance webhook event: {e}")


@receiver(post_save, sender=TransactionHeader)
def transaction_webhook_events(sender, instance, created, **kwargs):
    """Trigger webhook events for transaction changes."""
    try:
        event_data = {
            'transaction_id': str(instance.id),
            'transaction_number': instance.transaction_number,
            'transaction_type': instance.transaction_type.type_name,
            'status': instance.status,
            'total_amount': float(instance.total_amount),
            'currency': instance.currency.currency_code,
            'transaction_date': instance.transaction_date.isoformat(),
            'branch_id': instance.branch_id,
        }
        
        if created:
            event_data['created_at'] = instance.created_at.isoformat() if instance.created_at else None
            trigger_webhook_event(
                event_type='transaction.created',
                event_data=event_data,
                branch_id=instance.branch_id,
                source_object=instance
            )
        else:
            # Check for status changes
            if hasattr(instance, '_state') and instance._state.adding is False:
                try:
                    old_instance = TransactionHeader.objects.get(pk=instance.pk)
                    if old_instance.status != instance.status:
                        event_data['old_status'] = old_instance.status
                        event_data['new_status'] = instance.status
                        
                        if instance.status == 'approved':
                            trigger_webhook_event(
                                event_type='transaction.approved',
                                event_data=event_data,
                                branch_id=instance.branch_id,
                                source_object=instance
                            )
                        elif instance.status == 'posted':
                            trigger_webhook_event(
                                event_type='transaction.posted',
                                event_data=event_data,
                                branch_id=instance.branch_id,
                                source_object=instance
                            )
                        elif instance.status == 'cancelled':
                            trigger_webhook_event(
                                event_type='transaction.cancelled',
                                event_data=event_data,
                                branch_id=instance.branch_id,
                                source_object=instance
                            )
                except TransactionHeader.DoesNotExist:
                    pass
            
            event_data['updated_at'] = instance.updated_at.isoformat() if instance.updated_at else None
            trigger_webhook_event(
                event_type='transaction.updated',
                event_data=event_data,
                branch_id=instance.branch_id,
                source_object=instance
            )
            
    except Exception as e:
        logger.error(f"Error triggering transaction webhook event: {e}")
