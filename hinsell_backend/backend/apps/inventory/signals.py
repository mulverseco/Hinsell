"""
Django signals for inventory app.
"""
import logging
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from decimal import Decimal
from apps.inventory.models import StoreGroup, ItemGroup, Item, ItemUnit, ItemBarcode, InventoryBalance

logger = logging.getLogger(__name__)


@receiver(post_save, sender=StoreGroup)
def store_group_post_save(sender, instance, created, **kwargs):
    """Handle store group creation and updates."""
    if created:
        logger.info(f"New store group created: {instance.store_group_code} - {instance.store_group_name}")
        
        # Create default item groups
        from apps.inventory.tasks import create_default_item_groups
        create_default_item_groups.delay(instance.id)
    else:
        logger.info(f"Store group updated: {instance.store_group_code}")
    
    # Clear cache
    cache.delete_pattern(f"store_groups:{instance.branch.id}:*")


@receiver(post_save, sender=ItemGroup)
def item_group_post_save(sender, instance, created, **kwargs):
    """Handle item group creation and updates."""
    if created:
        logger.info(f"New item group created: {instance.item_group_code} - {instance.item_group_name}")
    else:
        logger.info(f"Item group updated: {instance.item_group_code}")
    
    # Clear cache
    cache.delete_pattern(f"item_groups:{instance.branch.id}:*")


@receiver(post_save, sender=Item)
def item_post_save(sender, instance, created, **kwargs):
    """Handle item creation and updates."""
    if created:
        logger.info(f"New item created: {instance.item_code} - {instance.item_name}")
        
        # Create default unit (base unit)
        ItemUnit.objects.get_or_create(
            item=instance,
            unit_code=instance.base_unit.upper(),
            defaults={
                'unit_name': instance.base_unit,
                'conversion_factor': Decimal('1.00000000'),
                'unit_price': instance.sales_price,
                'unit_cost': instance.standard_cost,
                'is_default': True,
                'is_purchase_unit': True,
                'is_sales_unit': True,
                'created_by': getattr(instance, 'created_by', None)
            }
        )
        
        # Create initial inventory balance if not service item
        if not instance.is_service_item:
            InventoryBalance.objects.get_or_create(
                branch=instance.branch,
                item=instance,
                location=instance.shelf_location or 'MAIN',
                batch_number=None if not instance.track_batches else 'INITIAL',
                expiry_date=None,
                defaults={
                    'available_quantity': Decimal('0.00000000'),
                    'reserved_quantity': Decimal('0.00000000'),
                    'average_cost': instance.standard_cost,
                    'created_by': getattr(instance, 'created_by', None)
                }
            )
        
        # Clear cache
        cache.delete_pattern(f"items:{instance.branch.id}:*")
        
        # Schedule low stock check
        from .tasks import check_low_stock_items
        check_low_stock_items.delay(instance.branch.id)
        
    else:
        logger.info(f"Item updated: {instance.item_code} - {instance.item_name}")
        
        # Update default unit pricing
        try:
            default_unit = instance.units.filter(is_default=True).first()
            if default_unit:
                default_unit.unit_price = instance.sales_price
                default_unit.unit_cost = instance.standard_cost
                default_unit.save(update_fields=['unit_price', 'unit_cost'])
        except Exception as e:
            logger.error(f"Error updating default unit for item {instance.item_code}: {str(e)}")
        
        cache.delete_pattern(f"item:{instance.id}:*")


@receiver(post_save, sender=ItemUnit)
def item_unit_post_save(sender, instance, created, **kwargs):
    """Handle item unit creation and updates."""
    if created:
        logger.info(f"New item unit created: {instance.item.item_code} - {instance.unit_code}")
    else:
        logger.info(f"Item unit updated: {instance.item.item_code} - {instance.unit_code}")
    
    # Clear cache
    cache.delete_pattern(f"item_units:{instance.item.id}:*")
    cache.delete_pattern(f"item:{instance.item.id}:*")


@receiver(post_save, sender=ItemBarcode)
def item_barcode_post_save(sender, instance, created, **kwargs):
    """Handle item barcode creation and updates."""
    if created:
        logger.info(f"New barcode created: {instance.barcode} for item {instance.item.item_code}")
    else:
        logger.info(f"Barcode updated: {instance.barcode}")
    
    # Clear cache
    cache.delete_pattern(f"barcodes:*")
    cache.delete_pattern(f"item_barcodes:{instance.item.id}:*")


@receiver(post_save, sender=InventoryBalance)
def inventory_balance_post_save(sender, instance, created, **kwargs):
    """Handle inventory balance changes."""
    if created:
        logger.info(f"New inventory balance created for item: {instance.item.item_code}")
    else:
        logger.info(f"Inventory balance updated for item: {instance.item.item_code}")
    
    # Clear cache
    cache.delete_pattern(f"inventory:{instance.branch.id}:*")
    cache.delete_pattern(f"item_stock:{instance.item.id}:*")
    
    # Check for low stock
    if instance.item.is_low_stock():
        from apps.inventory.tasks import send_low_stock_alert
        send_low_stock_alert.delay(instance.item.id)
    
    # Check for expiry alerts
    if instance.is_near_expiry():
        from apps.inventory.tasks import send_expiry_alert
        send_expiry_alert.delay(instance.id)


@receiver(post_delete, sender=Item)
def item_post_delete(sender, instance, **kwargs):
    """Handle item deletion cleanup."""
    logger.info(f"Item deleted: {instance.item_code} - {instance.item_name}")
    
    # Clear cache
    cache.delete_pattern(f"items:{instance.branch.id}:*")
    cache.delete_pattern(f"item:{instance.id}:*")


@receiver(pre_save, sender=InventoryBalance)
def inventory_balance_pre_save(sender, instance, **kwargs):
    """Handle inventory balance pre-save operations."""
    if instance.pk:  # Existing balance
        try:
            old_instance = InventoryBalance.objects.get(pk=instance.pk)
            
            # Log significant quantity changes
            old_qty = old_instance.available_quantity
            new_qty = instance.available_quantity
            
            if abs(old_qty - new_qty) > Decimal('0.0001'):
                logger.info(f"Inventory quantity changed for {instance.item.item_code}: {old_qty} -> {new_qty}")
                
                # Create inventory movement record (would be implemented in transactions app)
                # This is where you'd log the movement for audit purposes
                
        except InventoryBalance.DoesNotExist:
            pass
