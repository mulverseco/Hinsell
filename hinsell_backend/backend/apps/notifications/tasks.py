"""
Background tasks for notifications app.
"""
import logging
from celery import shared_task
from django.utils import timezone
from django.db.models import Q, F
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification
from apps.notifications.services import NotificationService

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task
def process_scheduled_notifications():
    """Process notifications scheduled for sending."""
    service = NotificationService()
    service.process_scheduled_notifications()


@shared_task
def retry_failed_notifications():
    """Retry failed notifications."""
    service = NotificationService()
    service.retry_failed_notifications()


@shared_task
def cleanup_old_notifications():
    """Clean up old notifications and logs."""
    service = NotificationService()
    service.cleanup_old_notifications()


@shared_task
def send_inventory_alerts():
    """Send inventory-related alerts."""
    from apps.inventory.models import InventoryBalance
    
    # Get low stock items
    low_stock_items = InventoryBalance.objects.filter(
        current_balance__lte=F('item__minimum_stock_level'),
        item__is_active=True
    ).select_related('item', 'branch')
    
    service = NotificationService()
    
    for balance in low_stock_items:
        # Get users who should receive inventory alerts
        users = User.objects.filter(
            branches=balance.branch,
            is_active=True,
            notification_preferences__email_inventory=True
        )
        
        if users.exists():
            context_data = {
                'item_name': balance.item.item_name,
                'current_stock': balance.current_balance,
                'minimum_stock': balance.item.minimum_stock_level,
                'branch_name': balance.branch.branch_name,
            }
            
            service.send_notification(
                branch=balance.branch,
                notification_type='inventory_low',
                channel='email',
                recipient_users=[user.id for user in users],
                context_data=context_data,
                priority=Notification.Priority.HIGH
            )


@shared_task
def send_expiry_alerts():
    """Send alerts for items nearing expiry."""
    from apps.inventory.models import ItemBalance
    from datetime import timedelta
    
    # Get items expiring in next 30 days
    expiry_threshold = timezone.now().date() + timedelta(days=30)
    
    expiring_items = ItemBalance.objects.filter(
        expiry_date__lte=expiry_threshold,
        expiry_date__gte=timezone.now().date(),
        current_balance__gt=0,
        item__is_active=True
    ).select_related('item', 'branch')
    
    service = NotificationService()
    
    for balance in expiring_items:
        # Get users who should receive inventory alerts
        users = User.objects.filter(
            branches=balance.branch,
            is_active=True,
            notification_preferences__email_inventory=True
        )
        
        if users.exists():
            context_data = {
                'item_name': balance.item.item_name,
                'batch_number': balance.batch_number,
                'expiry_date': balance.expiry_date.strftime('%Y-%m-%d'),
                'quantity': balance.current_balance,
                'branch_name': balance.branch.branch_name,
            }
            
            service.send_notification(
                branch=balance.branch,
                notification_type='inventory_expired',
                channel='email',
                recipient_users=[user.id for user in users],
                context_data=context_data,
                priority=Notification.Priority.HIGH
            )


@shared_task
def send_payment_reminders():
    """Send payment due reminders."""
    from apps.transactions.models import TransactionHeader
    from datetime import timedelta
    
    # Get transactions due in next 7 days
    due_threshold = timezone.now().date() + timedelta(days=7)
    
    due_transactions = TransactionHeader.objects.filter(
        due_date__lte=due_threshold,
        due_date__gte=timezone.now().date(),
        status=TransactionHeader.TransactionStatus.POSTED,
        total_amount__gt=F('paid_amount')
    ).select_related('customer_account', 'branch')
    
    service = NotificationService()
    
    for transaction in due_transactions:
        if transaction.customer_account and transaction.customer_account.email:
            context_data = {
                'customer_name': transaction.customer_account.account_name,
                'invoice_number': transaction.transaction_number,
                'due_amount': transaction.get_balance_due(),
                'due_date': transaction.due_date.strftime('%Y-%m-%d'),
                'days_overdue': (timezone.now().date() - transaction.due_date).days,
            }
            
            service.send_notification(
                branch=transaction.branch,
                notification_type='payment_due',
                channel='email',
                recipient_emails=[transaction.customer_account.email],
                context_data=context_data,
                priority=Notification.Priority.NORMAL
            )


@shared_task
def send_overdue_payment_alerts():
    """Send overdue payment alerts."""
    from apps.transactions.models import TransactionHeader
    
    # Get overdue transactions
    overdue_transactions = TransactionHeader.objects.filter(
        due_date__lt=timezone.now().date(),
        status=TransactionHeader.TransactionStatus.POSTED,
        total_amount__gt=F('paid_amount')
    ).select_related('customer_account', 'branch')
    
    service = NotificationService()
    
    for transaction in overdue_transactions:
        if transaction.customer_account and transaction.customer_account.email:
            context_data = {
                'customer_name': transaction.customer_account.account_name,
                'invoice_number': transaction.transaction_number,
                'overdue_amount': transaction.get_balance_due(),
                'days_overdue': (timezone.now().date() - transaction.due_date).days,
                'total_outstanding': transaction.get_balance_due(),
            }
            
            service.send_notification(
                branch=transaction.branch,
                notification_type='payment_overdue',
                channel='email',
                recipient_emails=[transaction.customer_account.email],
                context_data=context_data,
                priority=Notification.Priority.HIGH
            )


@shared_task
def send_welcome_notification(user_id):
    """Send welcome notification to new user."""
    try:
        user = User.objects.get(id=user_id)
        service = NotificationService()
        
        context_data = {
            'user_name': user.get_full_name(),
            'user_email': user.email,
            'branch_name': user.branches.first().branch_name if user.branches.exists() else 'N/A',
            'login_url': 'https://your-domain.com/login',  # Replace with actual URL
        }
        
        service.send_notification(
            branch=user.branches.first() if user.branches.exists() else None,
            notification_type='welcome',
            channel='email',
            recipient_users=[user.id],
            context_data=context_data,
            priority=Notification.Priority.NORMAL
        )
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for welcome notification")


@shared_task
def send_transaction_approval_notification(transaction_id, approved_by_id):
    """Send transaction approval notification."""
    from apps.transactions.models import TransactionHeader
    
    try:
        transaction = TransactionHeader.objects.get(id=transaction_id)
        approved_by = User.objects.get(id=approved_by_id)
        service = NotificationService()
        
        context_data = {
            'transaction_number': transaction.transaction_number,
            'transaction_type': transaction.transaction_type.type_name,
            'amount': transaction.total_amount,
            'approved_by': approved_by.get_full_name(),
            'approved_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
        
        # Notify transaction creator
        if transaction.created_by:
            service.send_notification(
                branch=transaction.branch,
                notification_type='transaction_approved',
                channel='email',
                recipient_users=[transaction.created_by.id],
                context_data=context_data,
                priority=Notification.Priority.NORMAL
            )
        
    except (TransactionHeader.DoesNotExist, User.DoesNotExist) as e:
        logger.error(f"Error sending transaction approval notification: {str(e)}")


@shared_task
def generate_notification_reports():
    """Generate daily notification reports."""
    from django.db.models import Count
    from datetime import timedelta
    
    yesterday = timezone.now().date() - timedelta(days=1)
    
    # Get notification statistics for yesterday
    stats = Notification.objects.filter(
        created_at__date=yesterday
    ).aggregate(
        total=Count('id'),
        sent=Count('id', filter=Q(status__in=[
            Notification.Status.SENT, 
            Notification.Status.DELIVERED, 
            Notification.Status.READ
        ])),
        failed=Count('id', filter=Q(status=Notification.Status.FAILED)),
        pending=Count('id', filter=Q(status=Notification.Status.PENDING))
    )
    
    # Send report to administrators
    admin_users = User.objects.filter(
        is_staff=True,
        is_active=True,
        notification_preferences__email_enabled=True
    )
    
    if admin_users.exists():
        service = NotificationService()
        
        context_data = {
            'date': yesterday.strftime('%Y-%m-%d'),
            'total_notifications': stats['total'],
            'sent_notifications': stats['sent'],
            'failed_notifications': stats['failed'],
            'pending_notifications': stats['pending'],
            'success_rate': round((stats['sent'] / stats['total']) * 100, 2) if stats['total'] > 0 else 0,
        }
        
        service.send_notification(
            branch=admin_users.first().branches.first() if admin_users.first().branches.exists() else None,
            notification_type='custom',
            channel='email',
            recipient_users=[user.id for user in admin_users],
            subject=f'Daily Notification Report - {yesterday.strftime("%Y-%m-%d")}',
            content=f"""
            Daily Notification Report for {yesterday.strftime('%Y-%m-%d')}:
            
            Total Notifications: {stats['total']}
            Successfully Sent: {stats['sent']}
            Failed: {stats['failed']}
            Pending: {stats['pending']}
            Success Rate: {context_data['success_rate']}%
            """,
            context_data=context_data,
            priority=Notification.Priority.LOW
        )
