from celery import shared_task
from apps.inventory.models import Item, InventoryBalance
from apps.core_apps.utils import Logger

@shared_task
def check_item_stock(item_id: int):
    """Check item stock levels asynchronously."""
    logger = Logger('inventory.tasks')
    try:
        item = Item.objects.get(id=item_id)
        item.is_low_stock()
        logger.info(f"Stock check completed for item {item.code}", 
                   extra={'item_id': item_id, 'action': 'check_stock'})
    except Item.DoesNotExist:
        logger.error(f"Item {item_id} not found", extra={'item_id': item_id, 'action': 'check_stock'})
    except Exception as e:
        logger.error(f"Error checking stock for item {item_id}: {str(e)}", 
                    extra={'item_id': item_id, 'action': 'check_stock'}, exc_info=True)

@shared_task
def check_inventory_balance(balance_id: int):
    """Check inventory balance for expiry asynchronously."""
    logger = Logger('inventory.tasks')
    try:
        balance = InventoryBalance.objects.get(id=balance_id)
        balance.is_near_expiry()
        balance.is_expired()
        logger.info(f"Expiry check completed for balance {balance.item.code}", 
                   extra={'balance_id': balance_id, 'action': 'check_expiry'})
    except InventoryBalance.DoesNotExist:
        logger.error(f"Inventory balance {balance_id} not found", 
                    extra={'balance_id': balance_id, 'action': 'check_expiry'})
    except Exception as e:
        logger.error(f"Error checking expiry for balance {balance_id}: {str(e)}", 
                    extra={'balance_id': balance_id, 'action': 'check_expiry'}, exc_info=True)