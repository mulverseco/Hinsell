"""
Background tasks for inventory app.
"""
import logging
from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Sum, F
from decimal import Decimal
from apps.inventory.models import StoreGroup, ItemGroup, Item, InventoryBalance

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def create_default_item_groups(self, store_group_id):
    """Create default item groups for a new store group."""
    try:
        store_group = StoreGroup.objects.get(id=store_group_id)
        logger.info(f"Creating default item groups for store group: {store_group.store_group_name}")
        
        default_groups = [
            {'code': 'PHARM', 'name': 'Pharmaceuticals', 'type': 'product'},
            {'code': 'OTC', 'name': 'Over-the-Counter', 'type': 'product'},
            {'code': 'SUPP', 'name': 'Supplements', 'type': 'product'},
            {'code': 'COSM', 'name': 'Cosmetics', 'type': 'product'},
            {'code': 'MED-DEV', 'name': 'Medical Devices', 'type': 'product'},
            {'code': 'SERV', 'name': 'Services', 'type': 'service'},
        ]
        
        for group_data in default_groups:
            ItemGroup.objects.get_or_create(
                branch=store_group.branch,
                store_group=store_group,
                item_group_code=group_data['code'],
                defaults={
                    'item_group_name': group_data['name'],
                    'group_type': group_data['type'],
                    'created_by': getattr(store_group, 'created_by', None)
                }
            )
        
        logger.info(f"Successfully created default item groups for store group: {store_group.store_group_name}")
        
        cache.delete_pattern(f"item_groups:{store_group.branch.id}:*")
        
    except StoreGroup.DoesNotExist:
        logger.error(f"Store group with ID {store_group_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error creating default item groups for store group {store_group_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def check_low_stock_items(self, branch_id):
    """Check for low stock items and send alerts."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Checking low stock items for branch: {branch.branch_name}")
        
        # Get items with low stock
        low_stock_items = Item.objects.filter(
            branch=branch,
            is_active=True,
            reorder_level__gt=0
        ).annotate(
            current_stock=Sum('inventory_balances__available_quantity')
        ).filter(
            current_stock__lte=F('reorder_level')
        )
        
        low_stock_count = low_stock_items.count()
        
        if low_stock_count > 0:
            logger.warning(f"Found {low_stock_count} low stock items in branch {branch.branch_name}")
            
            # Send notification (would integrate with messaging service)
            for item in low_stock_items[:10]:  # Limit to first 10 for notification
                send_low_stock_alert.delay(item.id)
        else:
            logger.info(f"No low stock items found in branch {branch.branch_name}")
        
        return {
            'branch_id': str(branch_id),
            'low_stock_count': low_stock_count,
            'checked_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error checking low stock items for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def send_low_stock_alert(self, item_id):
    """Send low stock alert for a specific item."""
    try:
        item = Item.objects.get(id=item_id)
        current_stock = item.get_current_stock()
        
        logger.info(f"Sending low stock alert for item: {item.item_code} (Stock: {current_stock}, Reorder: {item.reorder_level})")
        
        # Here you would integrate with the messaging service
        # For now, just log the alert
        alert_message = f"LOW STOCK ALERT: {item.item_code} - {item.item_name} has {current_stock} {item.base_unit} remaining (Reorder level: {item.reorder_level})"
        logger.warning(alert_message)
        
        return {
            'item_id': str(item_id),
            'item_code': item.item_code,
            'current_stock': str(current_stock),
            'reorder_level': str(item.reorder_level),
            'alert_sent_at': timezone.now().isoformat()
        }
        
    except Item.DoesNotExist:
        logger.error(f"Item with ID {item_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error sending low stock alert for item {item_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def send_expiry_alert(self, balance_id):
    """Send expiry alert for inventory balance."""
    try:
        balance = InventoryBalance.objects.get(id=balance_id)
        
        if balance.expiry_date:
            days_to_expiry = (balance.expiry_date - timezone.now().date()).days
            
            logger.info(f"Sending expiry alert for item: {balance.item.item_code}, Batch: {balance.batch_number}, Days to expiry: {days_to_expiry}")
            
            # Here you would integrate with the messaging service
            alert_message = f"EXPIRY ALERT: {balance.item.item_code} - {balance.item.item_name}, Batch: {balance.batch_number}, Expires in {days_to_expiry} days ({balance.expiry_date})"
            
            if days_to_expiry < 0:
                alert_message = f"EXPIRED: {balance.item.item_code} - {balance.item.item_name}, Batch: {balance.batch_number}, Expired on {balance.expiry_date}"
                logger.error(alert_message)
            else:
                logger.warning(alert_message)
        
        return {
            'balance_id': str(balance_id),
            'item_code': balance.item.item_code,
            'batch_number': balance.batch_number,
            'expiry_date': balance.expiry_date.isoformat() if balance.expiry_date else None,
            'alert_sent_at': timezone.now().isoformat()
        }
        
    except InventoryBalance.DoesNotExist:
        logger.error(f"Inventory balance with ID {balance_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error sending expiry alert for balance {balance_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def check_expiring_items(self, branch_id, days_ahead=30):
    """Check for expiring items and send alerts."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Checking expiring items for branch: {branch.branch_name}")
        
        today = timezone.now().date()
        warning_date = today + timezone.timedelta(days=days_ahead)
        
        # Get expiring inventory balances
        expiring_balances = InventoryBalance.objects.filter(
            branch=branch,
            is_active=True,
            available_quantity__gt=0,
            expiry_date__lte=warning_date
        ).select_related('item')
        
        expired_count = expiring_balances.filter(expiry_date__lt=today).count()
        near_expiry_count = expiring_balances.filter(expiry_date__gte=today).count()
        
        logger.info(f"Found {expired_count} expired and {near_expiry_count} near expiry items in branch {branch.branch_name}")
        
        # Send alerts for critical items
        for balance in expiring_balances[:20]:  # Limit to first 20
            send_expiry_alert.delay(balance.id)
        
        return {
            'branch_id': str(branch_id),
            'expired_count': expired_count,
            'near_expiry_count': near_expiry_count,
            'total_expiring': len(expiring_balances),
            'checked_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error checking expiring items for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def update_inventory_costs(self, branch_id, cost_method='average'):
    """Update inventory costs based on costing method."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Updating inventory costs for branch: {branch.branch_name} using {cost_method} method")
        
        # This would implement different costing methods (FIFO, LIFO, Average, Standard)
        # For now, just log the operation
        
        items_updated = 0
        items = Item.objects.filter(branch=branch, is_active=True, is_service_item=False)
        
        for item in items:
            # Calculate new average cost based on inventory balances
            balances = InventoryBalance.objects.filter(
                item=item,
                is_active=True,
                available_quantity__gt=0
            )
            
            if balances.exists():
                total_value = sum(b.available_quantity * b.average_cost for b in balances)
                total_quantity = sum(b.available_quantity for b in balances)
                
                if total_quantity > 0:
                    new_average_cost = total_value / total_quantity
                    
                    # Update item standard cost
                    if abs(item.standard_cost - new_average_cost) > Decimal('0.01'):
                        item.standard_cost = new_average_cost
                        item.save(update_fields=['standard_cost'])
                        items_updated += 1
        
        logger.info(f"Updated costs for {items_updated} items in branch {branch.branch_name}")
        
        return {
            'branch_id': str(branch_id),
            'cost_method': cost_method,
            'items_updated': items_updated,
            'updated_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating inventory costs for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def generate_inventory_report(self, branch_id, report_type='summary'):
    """Generate various inventory reports."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Generating {report_type} inventory report for branch: {branch.branch_name}")
        
        if report_type == 'summary':
            # Generate inventory summary report
            items_count = Item.objects.filter(branch=branch, is_active=True).count()
            
            total_value = InventoryBalance.objects.filter(
                branch=branch,
                is_active=True
            ).aggregate(
                total=Sum(F('available_quantity') * F('average_cost'))
            )['total'] or Decimal('0')
            
            low_stock_count = Item.objects.filter(
                branch=branch,
                is_active=True,
                reorder_level__gt=0
            ).annotate(
                current_stock=Sum('inventory_balances__available_quantity')
            ).filter(
                current_stock__lte=F('reorder_level')
            ).count()
            
            report_data = {
                'branch_id': str(branch_id),
                'branch_name': branch.branch_name,
                'report_type': report_type,
                'total_items': items_count,
                'total_inventory_value': str(total_value),
                'low_stock_items': low_stock_count,
                'generated_at': timezone.now().isoformat()
            }
            
            # Cache the report for 1 hour
            cache.set(f"inventory_report:{branch_id}:{report_type}", report_data, 3600)
            
            logger.info(f"Successfully generated {report_type} inventory report for branch: {branch.branch_name}")
            return report_data
        
    except Exception as e:
        logger.error(f"Error generating {report_type} inventory report for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def cleanup_expired_inventory(self, branch_id, auto_remove=False):
    """Clean up expired inventory records."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Cleaning up expired inventory for branch: {branch.branch_name}")
        
        today = timezone.now().date()
        
        # Find expired inventory with zero quantity
        expired_balances = InventoryBalance.objects.filter(
            branch=branch,
            is_active=True,
            expiry_date__lt=today,
            available_quantity=0,
            reserved_quantity=0
        )
        
        expired_count = expired_balances.count()
        
        if auto_remove and expired_count > 0:
            # Soft delete expired zero-quantity balances
            expired_balances.update(is_active=False)
            logger.info(f"Soft deleted {expired_count} expired zero-quantity inventory records")
        else:
            logger.info(f"Found {expired_count} expired zero-quantity inventory records (not removed)")
        
        return {
            'branch_id': str(branch_id),
            'expired_records_found': expired_count,
            'auto_removed': auto_remove,
            'cleaned_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up expired inventory for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=300, exc=e)
