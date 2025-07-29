import logging
from celery import shared_task
from apps.accounting.models import Account, Currency, Budget
from apps.core_apps.services.messaging_service import MessagingService
from decimal import Decimal

logger = logging.getLogger(__name__)

@shared_task
def process_account_balance_update(account_id: int):
    """Process account balance update asynchronously."""
    try:
        account = Account.objects.get(id=account_id)
        account.update_balance()
        logger.info(f"Account {account.code} balance updated successfully.")
    except Account.DoesNotExist:
        logger.error(f"Account {account_id} not found")
    except Exception as e:
        logger.error(f"Error processing account {account_id} balance update: {str(e)}", exc_info=True)

@shared_task
def process_currency_update(currency_id: int):
    """Process currency update to refresh related account balances."""
    try:
        currency = Currency.objects.get(id=currency_id)
        accounts = Account.objects.filter(currency=currency)
        for account in accounts:
            account.update_balance()
        logger.info(f"Currency {currency.code} updated; related accounts processed.")
    except Currency.DoesNotExist:
        logger.error(f"Currency {currency_id} not found")
    except Exception as e:
        logger.error(f"Error processing currency {currency_id} update: {str(e)}", exc_info=True)

@shared_task
def process_budget_update(budget_id: int):
    """Process budget update to check variance and notify if exceeded."""
    try:
        budget = Budget.objects.get(id=budget_id)
        variance = budget.calculate_variance()
        if budget.budgeted_amount > 0 and abs(variance) > budget.budgeted_amount * Decimal('0.1'):  # 10% threshold
            service = MessagingService(budget.branch)
            service.send_notification(
                recipient=None,
                notification_type='budget_variance',
                context_data={
                    'budget_code': budget.code,
                    'budget_name': budget.name,
                    'variance': str(variance),
                    'budgeted_amount': str(budget.budgeted_amount),
                    'actual_amount': str(budget.actual_amount),
                    'email': budget.branch.email
                },
                channel='email',
                priority='high'
            )
            logger.info(f"Budget {budget.code} variance notification sent.")
        logger.info(f"Budget {budget.code} updated successfully.")
    except Budget.DoesNotExist:
        logger.error(f"Budget {budget_id} not found")
    except Exception as e:
        logger.error(f"Error processing budget {budget_id} update: {str(e)}", exc_info=True)