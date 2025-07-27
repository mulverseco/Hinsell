"""
Management command to process webhook deliveries.
"""
from django.core.management.base import BaseCommand
from apps.webhooks.services import WebhookDeliveryService


class Command(BaseCommand):
    help = 'Process pending webhook deliveries'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retry-failed',
            action='store_true',
            help='Also retry failed deliveries',
        )
        parser.add_argument(
            '--cleanup',
            action='store_true',
            help='Clean up old delivery records',
        )

    def handle(self, *args, **options):
        service = WebhookDeliveryService()
        
        # Process pending deliveries
        processed_count = service.process_pending_deliveries()
        self.stdout.write(
            self.style.SUCCESS(f'Processed {processed_count} pending deliveries')
        )
        
        # Retry failed deliveries if requested
        if options['retry_failed']:
            retry_count = service.retry_failed_deliveries()
            self.stdout.write(
                self.style.SUCCESS(f'Retried {retry_count} failed deliveries')
            )
        
        # Clean up old records if requested
        if options['cleanup']:
            cleanup_count = service.cleanup_old_deliveries()
            self.stdout.write(
                self.style.SUCCESS(f'Cleaned up {cleanup_count} old delivery records')
            )
