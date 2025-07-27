"""
Background tasks for accounting app.
"""
import logging
from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from decimal import Decimal
from apps.accounting.models import Account, Currency, CostCenter

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def update_account_balances(self, branch_id):
    """Update all account balances for a branch."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Updating account balances for branch: {branch.branch_name}")
        
        accounts = Account.objects.filter(branch=branch, is_active=True)
        updated_count = 0
        
        for account in accounts:
            old_balance = account.current_balance
            new_balance = account.calculate_balance()
            
            if old_balance != new_balance:
                account.current_balance = new_balance
                account.save(update_fields=['current_balance', 'updated_at'])
                updated_count += 1
                
                logger.debug(f"Updated balance for {account.account_code}: {old_balance} -> {new_balance}")
        
        logger.info(f"Updated {updated_count} account balances for branch: {branch.branch_name}")
        
        cache.delete_pattern(f"accounts:{branch_id}:*")
        cache.delete_pattern(f"account_balances:{branch_id}:*")
        
        return {
            'branch_id': str(branch_id),
            'total_accounts': len(accounts),
            'updated_accounts': updated_count,
            'updated_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating account balances for branch {branch_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def update_parent_account_balances(self, parent_account_id):
    """Update parent account balance based on child accounts."""
    try:
        parent_account = Account.objects.get(id=parent_account_id)
        logger.info(f"Updating parent account balance: {parent_account.account_code}")
        
        if not parent_account.is_header:
            logger.warning(f"Account {parent_account.account_code} is not a header account")
            return
        
        child_accounts = Account.objects.filter(
            parent=parent_account,
            is_active=True
        )
        
        total_balance = Decimal('0.00')
        for child in child_accounts:
            child_balance = child.calculate_balance()
            total_balance += child_balance

        old_balance = parent_account.current_balance
        parent_account.current_balance = total_balance
        parent_account.save(update_fields=['current_balance', 'updated_at'])
        
        logger.info(f"Updated parent account {parent_account.account_code}: {old_balance} -> {total_balance}")
  
        cache.delete_pattern(f"account:{parent_account_id}:*")

        if parent_account.parent:
            update_parent_account_balances.delay(parent_account.parent.id)
        
    except Account.DoesNotExist:
        logger.error(f"Account with ID {parent_account_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error updating parent account balance {parent_account_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def create_default_cost_center_for_account(self, account_id):
    """Create default cost center for an account."""
    try:
        account = Account.objects.get(id=account_id)
        
        if not account.branch.use_cost_center:
            logger.info(f"Cost center not enabled for branch: {account.branch.branch_name}")
            return
        
        if CostCenter.objects.filter(
            branch=account.branch,
            cost_center_code=f"CC-{account.account_code}"
        ).exists():
            logger.info(f"Cost center already exists for account: {account.account_code}")
            return
        
        cost_center = CostCenter.objects.create(
            branch=account.branch,
            cost_center_code=f"CC-{account.account_code}",
            cost_center_name=f"Cost Center - {account.account_name}",
            is_header=False,
            budget_limit=Decimal('0.00')
        )
        
        logger.info(f"Created cost center {cost_center.cost_center_code} for account {account.account_code}")
        
        cache.delete_pattern(f"cost_centers:{account.branch.id}:*")
        
    except Account.DoesNotExist:
        logger.error(f"Account with ID {account_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error creating cost center for account {account_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)

@shared_task(bind=True, max_retries=3)
def update_currency_rates(self, branch_id=None):
    """Update currency exchange rates from external API."""
    try:
        from apps.organization.models import Branch
        
        if branch_id:
            branches = [Branch.objects.get(id=branch_id)]
        else:
            branches = Branch.objects.filter(is_active=True, use_multi_currency=True)
        
        updated_currencies = []
        
        for branch in branches:
            logger.info(f"Updating currency rates for branch: {branch.branch_name}")
            
            currencies = Currency.objects.filter(
                branch=branch,
                is_active=True,
                is_local=False
            )
            
            for currency in currencies:
                logger.info(f"Would update rate for {currency.currency_code}")
                
                # Example of how you might update:
                # new_rate = get_exchange_rate_from_api(currency.currency_code)
                # if new_rate and new_rate != currency.exchange_rate:
                #     currency.update_exchange_rate(new_rate, None)
                #     updated_currencies.append(currency.currency_code)
        
        logger.info(f"Currency rate update completed. Updated: {', '.join(updated_currencies)}")
        
        return {
            'updated_currencies': updated_currencies,
            'total_branches': len(branches),
            'updated_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating currency rates: {str(e)}")
        raise self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def generate_account_aging_report(self, branch_id, account_nature='customer'):
    """Generate aging report for customer or supplier accounts."""
    try:
        from apps.organization.models import Branch
        
        branch = Branch.objects.get(id=branch_id)
        logger.info(f"Generating {account_nature} aging report for branch: {branch.branch_name}")
        
        accounts = Account.objects.filter(
            branch=branch,
            account_nature=account_nature,
            is_active=True
        )
        
        aging_data = []
        for account in accounts:
            account_aging = {
                'account_code': account.account_code,
                'account_name': account.account_name,
                'current_balance': str(account.current_balance),
                'aging_buckets': {
                    'current': '0.00',
                    '1_30_days': '0.00',
                    '31_60_days': '0.00',
                    '61_90_days': '0.00',
                    'over_90_days': '0.00'
                },
                'contact_info': {
                    'email': account.email,
                    'phone': str(account.phone_number) if account.phone_number else None
                }
            }
            aging_data.append(account_aging)
        
        report_data = {
            'branch_id': str(branch_id),
            'branch_name': branch.branch_name,
            'report_type': f'{account_nature}_aging',
            'total_accounts': len(aging_data),
            'accounts': aging_data,
            'generated_at': timezone.now().isoformat()
        }
        
        cache.set(f"aging_report:{branch_id}:{account_nature}", report_data, 7200)
        
        logger.info(f"Generated {account_nature} aging report for {len(aging_data)} accounts")
        return report_data
        
    except Exception as e:
        logger.error(f"Error generating aging report: {str(e)}")
        raise self.retry(countdown=60, exc=e)

@shared_task(bind=True, max_retries=3)
def cleanup_old_currency_history(self, days_to_keep=365):
    """Clean up old currency history records."""
    try:
        from datetime import timedelta
        from .models import CurrencyHistory
        
        cutoff_date = timezone.now() - timedelta(days=days_to_keep)
        
        old_records = CurrencyHistory.objects.filter(created_at__lt=cutoff_date)
        count = old_records.count()
        
        if count > 0:
            old_records.delete()
            logger.info(f"Deleted {count} old currency history records older than {days_to_keep} days")
        else:
            logger.info("No old currency history records to delete")
        
        return {
            'deleted_records': count,
            'cutoff_date': cutoff_date.isoformat(),
            'cleaned_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up currency history: {str(e)}")
        raise self.retry(countdown=300, exc=e)
