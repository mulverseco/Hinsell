import logging
from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from apps.inventory.models import Item, InventoryBalance,ItemGroup, ItemUnit, ItemBarcode
# from apps.inventory.tasks import check_item_stock, check_inventory_balance, update_algolia_index, delete_algolia_index

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

# @receiver(post_save, sender=ItemGroup)
# def handle_item_group_save(sender, instance, **kwargs):
#     update_algolia_index.delay('inventory', 'ItemGroup', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)

# @receiver(post_delete, sender=ItemGroup)
# def handle_item_group_delete(sender, instance, **kwargs):
#     delete_algolia_index.delay('inventory', 'ItemGroup', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)

# @receiver(post_save, sender=Item)
# def handle_item_save(sender, instance, **kwargs):
#     update_algolia_index.delay('inventory', 'Item', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)

# @receiver(post_delete, sender=Item)
# def handle_item_delete(sender, instance, **kwargs):
#     delete_algolia_index.delay('inventory', 'Item', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)

# @receiver(post_save, sender=ItemUnit)
# def handle_item_unit_save(sender, instance, **kwargs):
#     update_algolia_index.delay('inventory', 'ItemUnit', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)

# @receiver(post_delete, sender=ItemUnit)
# def handle_item_unit_delete(sender, instance, **kwargs):
#     delete_algolia_index.delay('inventory', 'ItemUnit', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)

# @receiver(post_save, sender=ItemBarcode)
# def handle_item_barcode_save(sender, instance, **kwargs):
#     update_algolia_index.delay('inventory', 'ItemBarcode', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)

# @receiver(post_delete, sender=ItemBarcode)
# def handle_item_barcode_delete(sender, instance, **kwargs):
#     delete_algolia_index.delay('inventory', 'ItemBarcode', str(instance.pk))

#     def get_object_id(self, obj):
#         return str(obj.id)