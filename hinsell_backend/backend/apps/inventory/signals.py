from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.hinsell.models import ItemReview
from apps.inventory.models import InventoryBalance
from apps.core_apps.utils import Logger
from decimal import Decimal

logger = Logger(__name__)

@receiver(post_save, sender=ItemReview)
def update_item_rating(sender, instance, created, **kwargs):
    if created:
        item = instance.item
        total_ratings = item.review_count + 1
        current_total = item.average_rating * item.review_count
        new_average = (current_total + Decimal(str(instance.rating))) / total_ratings
        item.average_rating = round(new_average, 2)
        item.review_count = total_ratings
        item.save(update_fields=['average_rating', 'review_count'])
        logger.info(f"Updated rating for item {item.name}", extra={'item_id': item.id})

@receiver(post_save, sender=InventoryBalance)
def check_inventory_balance(sender, instance, **kwargs):
    if instance.available_quantity <= instance.variant.reorder_level:
        instance.variant.is_low_stock()
    if instance.expiry_date:
        if instance.is_expired():
            instance.notify_expiry()
        elif instance.is_near_expiry():
            instance.notify_near_expiry()

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