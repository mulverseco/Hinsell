"""
Background tasks for transactions app.
"""
import logging
from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Sum, F
from django.db import models
from decimal import Decimal
from apps.transactions.models import TransactionHeader, LedgerEntry

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_transaction_number(self, transaction_id):
    """Generate transaction number for a transaction."""
    try:
        transaction_header = TransactionHeader.objects.get(id=transaction_id)
        
        if transaction_header.transaction_number:
            logger.info(f"Transaction {transaction_id} already has number: {transaction_header.transaction_number}")
            return
        
        # Generate number based on transaction type and date
        today = timezone.now().date()
        type_code = transaction_header.transaction_type.type_code
        
        # Get next sequence number for this type and date
        last_transaction = TransactionHeader.objects.filter(
            branch=transaction_header.branch,
            transaction_type=transaction_header.transaction_type,
            transaction_date=today,
            transaction_number__isnull=False
        ).order_by('-transaction_number').first()
        
        if last_transaction and last_transaction.transaction_number:
            # Extract sequence from last number (assuming format: TYPE-YYYYMMDD-NNNN)
            try:
                parts = last_transaction.transaction_number.split('-')
                if len(parts) >= 3:
                    sequence = int(parts[-1]) + 1
                else:
                    sequence = 1
            except (ValueError, IndexError):
                sequence = 1
        else:
            sequence = 1
        
        # Generate new transaction number
        date_str = today.strftime('%Y%m%d')
        new_number = f"{type_code}-{date_str}-{sequence:04d}"
        
        transaction_header.transaction_number = new_number
        transaction_header.save(update_fields=['transaction_number'])
        
        logger.info(f"Generated transaction number: {new_number} for transaction {transaction_id}")
        
        return new_number
        
    except TransactionHeader.DoesNotExist:
        logger.error(f"Transaction with ID {transaction_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error generating transaction number for {transaction_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def send_approval_notification(self, transaction_id):
    """Send notification for transaction requiring approval."""
    try:
        transaction_header = TransactionHeader.objects.get(id=transaction_id)
        
        logger.info(f"Sending approval notification for transaction: {transaction_header.transaction_number}")
        
        # Here you would integrate with the messaging service
        # For now, just log the notification
        notification_message = f"APPROVAL REQUIRED: Transaction {transaction_header.transaction_number} ({transaction_header.transaction_type.type_name}) for {transaction_header.total_amount} requires approval"
        logger.info(notification_message)
        
        return {
            'transaction_id': str(transaction_id),
            'transaction_number': transaction_header.transaction_number,
            'notification_sent_at': timezone.now().isoformat()
        }
        
    except TransactionHeader.DoesNotExist:
        logger.error(f"Transaction with ID {transaction_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error sending approval notification for transaction {transaction_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def send_status_change_notification(self, transaction_id, new_status):
    """Send notification when transaction status changes."""
    try:
        transaction_header = TransactionHeader.objects.get(id=transaction_id)
        
        logger.info(f"Sending status change notification for transaction: {transaction_header.transaction_number} - New status: {new_status}")
        
        # Here you would integrate with the messaging service
        notification_message = f"STATUS CHANGE: Transaction {transaction_header.transaction_number} status changed to {new_status}"
        logger.info(notification_message)
        
        return {
            'transaction_id': str(transaction_id),
            'transaction_number': transaction_header.transaction_number,
            'new_status': new_status,
            'notification_sent_at': timezone.now().isoformat()
        }
        
    except TransactionHeader.DoesNotExist:
        logger.error(f"Transaction with ID {transaction_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error sending status change notification for transaction {transaction_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def update_account_balance(self, account_id):
    """Update account balance based on ledger entries."""
    try:
        from apps.accounting.models import Account
        
        account = Account.objects.get(id=account_id)
        logger.info(f"Updating balance for account: {account.account_code}")
        
        # Calculate balance from ledger entries
        entries = LedgerEntry.objects.filter(
            account=account,
            is_posted=True,
            is_reversed=False,
            is_active=True
        )
        
        total_debits = entries.aggregate(
            total=Sum('debit_amount')
        )['total'] or Decimal('0')
        
        total_credits = entries.aggregate(
            total=Sum('credit_amount')
        )['total'] or Decimal('0')
        
        # Calculate balance based on account type
        if account.account_type.normal_balance == 'debit':
            new_balance = total_debits - total_credits
        else:
            new_balance = total_credits - total_debits
        
        # Update account balance
        old_balance = account.current_balance
        account.current_balance = new_balance
        account.save(update_fields=['current_balance'])
        
        logger.info(f"Updated balance for account {account.account_code}: {old_balance} -> {new_balance}")
        
        # Clear cache
        cache.delete_pattern(f"account_balance:{account_id}:*")
        
        return {
            'account_id': str(account_id),
            'account_code': account.account_code,
            'old_balance': str(old_balance),
            'new_balance': str(new_balance),
            'updated_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating account balance for account {account_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def process_overdue_transactions(self, branch_id):
    """Process overdue transactions and send notifications."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Processing overdue transactions for branch: {branch.branch_name}")
        
        today = timezone.now().date()
        
        # Get overdue transactions
        overdue_transactions = TransactionHeader.objects.filter(
            branch=branch,
            is_active=True,
            due_date__lt=today,
            status='posted'
        ).annotate(
            balance_due=F('total_amount') - F('paid_amount')
        ).filter(balance_due__gt=0)
        
        overdue_count = overdue_transactions.count()
        total_overdue_amount = overdue_transactions.aggregate(
            total=Sum('balance_due')
        )['total'] or Decimal('0')
        
        logger.info(f"Found {overdue_count} overdue transactions totaling {total_overdue_amount}")
        
        # Send notifications for overdue transactions
        for transaction in overdue_transactions[:10]:  # Limit to first 10
            send_overdue_notification.delay(transaction.id)
        
        return {
            'branch_id': str(branch_id),
            'overdue_count': overdue_count,
            'total_overdue_amount': str(total_overdue_amount),
            'processed_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error processing overdue transactions for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def send_overdue_notification(self, transaction_id):
    """Send overdue notification for a specific transaction."""
    try:
        transaction_header = TransactionHeader.objects.get(id=transaction_id)
        
        days_overdue = (timezone.now().date() - transaction_header.due_date).days
        balance_due = transaction_header.get_balance_due()
        
        logger.info(f"Sending overdue notification for transaction: {transaction_header.transaction_number} ({days_overdue} days overdue)")
        
        # Here you would integrate with the messaging service
        notification_message = f"OVERDUE: Transaction {transaction_header.transaction_number} is {days_overdue} days overdue. Balance due: {balance_due}"
        logger.warning(notification_message)
        
        return {
            'transaction_id': str(transaction_id),
            'transaction_number': transaction_header.transaction_number,
            'days_overdue': days_overdue,
            'balance_due': str(balance_due),
            'notification_sent_at': timezone.now().isoformat()
        }
        
    except TransactionHeader.DoesNotExist:
        logger.error(f"Transaction with ID {transaction_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error sending overdue notification for transaction {transaction_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def generate_transaction_report(self, branch_id, report_type='summary', date_from=None, date_to=None):
    """Generate various transaction reports."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Generating {report_type} transaction report for branch: {branch.branch_name}")
        
        # Build query
        queryset = TransactionHeader.objects.filter(branch=branch, is_active=True)
        
        if date_from:
            queryset = queryset.filter(transaction_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(transaction_date__lte=date_to)
        
        if report_type == 'summary':
            # Generate summary report
            summary = queryset.aggregate(
                total_transactions=models.Count('id'),
                total_amount=Sum('total_amount') or Decimal('0'),
                total_paid=Sum('paid_amount') or Decimal('0'),
                draft_count=models.Count('id', filter=models.Q(status='draft')),
                pending_count=models.Count('id', filter=models.Q(status='pending')),
                approved_count=models.Count('id', filter=models.Q(status='approved')),
                posted_count=models.Count('id', filter=models.Q(status='posted')),
                cancelled_count=models.Count('id', filter=models.Q(status='cancelled')),
                reversed_count=models.Count('id', filter=models.Q(status='reversed'))
            )
            
            summary['total_outstanding'] = summary['total_amount'] - summary['total_paid']
            
            report_data = {
                'branch_id': str(branch_id),
                'branch_name': branch.branch_name,
                'report_type': report_type,
                'date_from': date_from,
                'date_to': date_to,
                'summary': summary,
                'generated_at': timezone.now().isoformat()
            }
            
            # Cache the report for 1 hour
            cache.set(f"transaction_report:{branch_id}:{report_type}", report_data, 3600)
            
            logger.info(f"Successfully generated {report_type} transaction report for branch: {branch.branch_name}")
            return report_data
        
    except Exception as e:
        logger.error(f"Error generating {report_type} transaction report for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def cleanup_draft_transactions(self, days_old=30):
    """Clean up old draft transactions."""
    try:
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days_old)
        
        old_drafts = TransactionHeader.objects.filter(
            status='draft',
            created_at__lt=cutoff_date,
            is_active=True
        )
        
        count = old_drafts.count()
        
        if count > 0:
            # Soft delete old drafts
            old_drafts.update(is_active=False)
            logger.info(f"Soft deleted {count} old draft transactions older than {days_old} days")
        else:
            logger.info("No old draft transactions to clean up")
        
        return {
            'deleted_count': count,
            'cutoff_date': cutoff_date.isoformat(),
            'cleaned_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up draft transactions: {str(e)}")
        raise self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def validate_ledger_balance(self, branch_id):
    """Validate that ledger entries are balanced."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Validating ledger balance for branch: {branch.branch_name}")
        
        # Get all posted ledger entries
        entries = LedgerEntry.objects.filter(
            branch=branch,
            is_posted=True,
            is_reversed=False,
            is_active=True
        )
        
        total_debits = entries.aggregate(
            total=Sum('debit_amount')
        )['total'] or Decimal('0')
        
        total_credits = entries.aggregate(
            total=Sum('credit_amount')
        )['total'] or Decimal('0')
        
        difference = total_debits - total_credits
        is_balanced = abs(difference) < Decimal('0.01')  # Allow for rounding differences
        
        if not is_balanced:
            logger.error(f"Ledger is out of balance for branch {branch.branch_name}: Difference = {difference}")
        else:
            logger.info(f"Ledger is balanced for branch {branch.branch_name}")
        
        return {
            'branch_id': str(branch_id),
            'total_debits': str(total_debits),
            'total_credits': str(total_credits),
            'difference': str(difference),
            'is_balanced': is_balanced,
            'validated_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error validating ledger balance for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=300, exc=e)
