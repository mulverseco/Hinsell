"""
Django signals for accounting app.
"""
import logging
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from apps.accounting.models import Currency, Account, CostCenter

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Currency)
def currency_post_save(sender, instance, created, **kwargs):
    """Handle currency creation and updates."""
    if created:
        logger.info(f"New currency created: {instance.currency_code} for branch {instance.branch.branch_name}")
        
        if not Currency.objects.filter(branch=instance.branch, is_default=True).exclude(id=instance.id).exists():
            instance.is_default = True
            instance.save(update_fields=['is_default'])
    else:
        logger.info(f"Currency updated: {instance.currency_code}")
    
    cache.delete_pattern(f"currencies:{instance.branch.id}:*")


@receiver(pre_save, sender=Currency)
def currency_pre_save(sender, instance, **kwargs):
    """Handle currency pre-save operations."""
    if instance.pk:
        try:
            old_instance = Currency.objects.get(pk=instance.pk)
            if old_instance.exchange_rate != instance.exchange_rate:
                from .models import CurrencyHistory
                CurrencyHistory.objects.create(
                    branch=instance.branch,
                    currency=instance,
                    old_exchange_rate=old_instance.exchange_rate,
                    new_exchange_rate=instance.exchange_rate,
                    changed_by=getattr(instance, 'updated_by', None),
                    reason="Exchange rate updated"
                )
        except Currency.DoesNotExist:
            pass


@receiver(post_save, sender=Account)
def account_post_save(sender, instance, created, **kwargs):
    """Handle account creation and updates."""
    if created:
        logger.info(f"New account created: {instance.account_code} - {instance.account_name}")
        
        cache.delete_pattern(f"accounts:{instance.branch.id}:*")
        cache.delete_pattern(f"chart_of_accounts:{instance.branch.id}:*")
   
        if instance.branch.use_cost_center and not instance.is_header:
            from .tasks import create_default_cost_center_for_account
            create_default_cost_center_for_account.delay(instance.id)
    else:
        logger.info(f"Account updated: {instance.account_code} - {instance.account_name}")
        cache.delete_pattern(f"account:{instance.id}:*")
    
        if instance.parent:
            from .tasks import update_parent_account_balances
            update_parent_account_balances.delay(instance.parent.id)


@receiver(post_delete, sender=Account)
def account_post_delete(sender, instance, **kwargs):
    """Handle account deletion cleanup."""
    logger.info(f"Account deleted: {instance.account_code} - {instance.account_name}")
    
    cache.delete_pattern(f"accounts:{instance.branch.id}:*")
    cache.delete_pattern(f"chart_of_accounts:{instance.branch.id}:*")
    cache.delete_pattern(f"account:{instance.id}:*")


@receiver(post_save, sender=CostCenter)
def cost_center_post_save(sender, instance, created, **kwargs):
    """Handle cost center creation and updates."""
    if created:
        logger.info(f"New cost center created: {instance.cost_center_code} - {instance.cost_center_name}")
    else:
        logger.info(f"Cost center updated: {instance.cost_center_code} - {instance.cost_center_name}")
    
    cache.delete_pattern(f"cost_centers:{instance.branch.id}:*")
