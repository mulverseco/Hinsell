import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.inventory.models import Item, InventoryBalance
from apps.inventory.tasks import check_item_stock, check_inventory_balance

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Item)
def handle_item_save(sender, instance, created, **kwargs):
    """Handle item save to check stock levels."""
    try:
        check_item_stock.delay(instance.id)
        logger.info(f"Item {instance.code} saved; stock check task dispatched.")
    except Exception as e:
        logger.error(f"Error handling item {instance.code} save: {str(e)}", exc_info=True)


@receiver(post_save, sender=InventoryBalance)
def handle_inventory_balance_save(sender, instance, created, **kwargs):
    """Handle inventory balance save to check expiry."""
    try:
        check_inventory_balance.delay(instance.id)
        logger.info(f"Inventory balance for {instance.item.code} saved; expiry check task dispatched.")
    except Exception as e:
        logger.error(f"Error handling inventory balance save: {str(e)}", exc_info=True)