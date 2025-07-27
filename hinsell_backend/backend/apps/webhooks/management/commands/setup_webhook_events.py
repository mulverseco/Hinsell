"""
Management command to set up default webhook events.
"""
from django.core.management.base import BaseCommand
from apps.webhooks.models import WebhookEvent


class Command(BaseCommand):
    help = 'Set up default webhook events'

    def handle(self, *args, **options):
        events = [
            # User events
            {
                'event_type': 'user.created',
                'name': 'User Created',
                'category': 'user',
                'description': 'Triggered when a new user is created',
                'is_system_event': True,
                'payload_schema': {
                    'type': 'object',
                    'properties': {
                        'user_id': {'type': 'string'},
                        'username': {'type': 'string'},
                        'email': {'type': 'string'},
                        'full_name': {'type': 'string'},
                        'is_active': {'type': 'boolean'},
                        'created_at': {'type': 'string', 'format': 'date-time'}
                    }
                }
            },
            {
                'event_type': 'user.updated',
                'name': 'User Updated',
                'category': 'user',
                'description': 'Triggered when user information is updated',
                'is_system_event': True,
            },
            
            # Inventory events
            {
                'event_type': 'inventory.item.created',
                'name': 'Item Created',
                'category': 'inventory',
                'description': 'Triggered when a new inventory item is created',
                'is_system_event': True,
            },
            {
                'event_type': 'inventory.item.updated',
                'name': 'Item Updated',
                'category': 'inventory',
                'description': 'Triggered when inventory item is updated',
                'is_system_event': True,
            },
            {
                'event_type': 'inventory.low_stock',
                'name': 'Low Stock Alert',
                'category': 'inventory',
                'description': 'Triggered when item stock falls below reorder level',
                'is_system_event': True,
            },
            {
                'event_type': 'inventory.expired',
                'name': 'Expired Items',
                'category': 'inventory',
                'description': 'Triggered when items have expired',
                'is_system_event': True,
            },
            
            # Transaction events
            {
                'event_type': 'transaction.created',
                'name': 'Transaction Created',
                'category': 'transaction',
                'description': 'Triggered when a new transaction is created',
                'is_system_event': True,
            },
            {
                'event_type': 'transaction.updated',
                'name': 'Transaction Updated',
                'category': 'transaction',
                'description': 'Triggered when transaction is updated',
                'is_system_event': True,
            },
            {
                'event_type': 'transaction.approved',
                'name': 'Transaction Approved',
                '  'transaction.approved',
                'name': 'Transaction Approved',
                'category': 'transaction',
                'description': 'Triggered when transaction is approved',
                'is_system_event': True,
            },
            {
                'event_type': 'transaction.posted',
                'name': 'Transaction Posted',
                'category': 'transaction',
                'description': 'Triggered when transaction is posted to ledger',
                'is_system_event': True,
            },
            {
                'event_type': 'transaction.cancelled',
                'name': 'Transaction Cancelled',
                'category': 'transaction',
                'description': 'Triggered when transaction is cancelled',
                'is_system_event': True,
            },
            
            # Payment events
            {
                'event_type': 'payment.received',
                'name': 'Payment Received',
                'category': 'payment',
                'description': 'Triggered when payment is received',
                'is_system_event': True,
            },
            {
                'event_type': 'payment.overdue',
                'name': 'Payment Overdue',
                'category': 'payment',
                'description': 'Triggered when payment becomes overdue',
                'is_system_event': True,
            },
            
            # Medical events
            {
                'event_type': 'medical.visit.created',
                'name': 'Doctor Visit Created',
                'category': 'medical',
                'description': 'Triggered when doctor visit is recorded',
                'is_system_event': True,
            },
            
            # System events
            {
                'event_type': 'system.backup.completed',
                'name': 'Backup Completed',
                'category': 'system',
                'description': 'Triggered when system backup is completed',
                'is_system_event': True,
            },
            {
                'event_type': 'system.maintenance.started',
                'name': 'Maintenance Started',
                'category': 'system',
                'description': 'Triggered when system maintenance begins',
                'is_system_event': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for event_data in events:
            event, created = WebhookEvent.objects.get_or_create(
                event_type=event_data['event_type'],
                defaults=event_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created event: {event.event_type}')
                )
            else:
                # Update existing event with new data
                for key, value in event_data.items():
                    setattr(event, key, value)
                event.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated event: {event.event_type}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully set up webhook events: {created_count} created, {updated_count} updated'
            )
        )
