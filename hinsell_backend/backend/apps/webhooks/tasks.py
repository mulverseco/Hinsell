"""
Celery tasks for webhook processing.
"""
import logging
from celery import shared_task
from django.utils import timezone

from apps.webhooks.services import WebhookDeliveryService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def deliver_webhook_task(self, delivery_id: int):
    """
    Celery task to deliver webhook payload.
    
    Args:
        delivery_id: WebhookDelivery ID
    """
    try:
        service = WebhookDeliveryService()
        success = service.deliver_webhook(delivery_id)
        
        if not success:
            logger.warning(f"Webhook delivery {delivery_id} failed")
        
        return success
        
    except Exception as e:
        logger.error(f"Error in webhook delivery task for delivery {delivery_id}: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task
def process_pending_webhooks():
    """
    Celery task to process pending webhook deliveries.
    """
    try:
        service = WebhookDeliveryService()
        processed_count = service.process_pending_deliveries()
        
        logger.info(f"Processed {processed_count} pending webhook deliveries")
        return processed_count
        
    except Exception as e:
        logger.error(f"Error processing pending webhooks: {e}")
        raise


@shared_task
def retry_failed_webhooks():
    """
    Celery task to retry failed webhook deliveries.
    """
    try:
        service = WebhookDeliveryService()
        retry_count = service.retry_failed_deliveries()
        
        logger.info(f"Retried {retry_count} failed webhook deliveries")
        return retry_count
        
    except Exception as e:
        logger.error(f"Error retrying failed webhooks: {e}")
        raise


@shared_task
def cleanup_old_webhook_data():
    """
    Celery task to clean up old webhook data.
    """
    try:
        service = WebhookDeliveryService()
        
        # Clean up deliveries older than 30 days
        delivery_count = service.cleanup_old_deliveries(days=30)
        
        # Clean up event logs older than 90 days
        from .models import WebhookEventLog
        cutoff_date = timezone.now() - timezone.timedelta(days=90)
        event_log_count, _ = WebhookEventLog.objects.filter(
            created_at__lt=cutoff_date
        ).delete()
        
        logger.info(f"Cleaned up {delivery_count} deliveries and {event_log_count} event logs")
        
        return {
            'deliveries_cleaned': delivery_count,
            'event_logs_cleaned': event_log_count
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up webhook data: {e}")
        raise
