import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from apps.authentication.authentication import CustomJWTAuthentication
from apps.authentication.models import User
from apps.notifications.models import Notification
from apps.transactions.models import TransactionHeader
from apps.notifications.models import InternalMessage
from django.core.exceptions import ValidationError

logger = logging.getLogger('apps.messaging')

class MessagingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = await self.authenticate_user()
        if not user:
            await self.close(code=4000)
            return

        self.user = user
        self.group_name = 'sales_support'
        self.user_group = f'user_{user.id}'

        # Rate limiting
        if await self.check_rate_limit(user, 'messaging'):
            await self.close(code=4001)
            return

        # Join groups
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.accept()

        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'welcome',
            'message': 'Connected to sales support. How can we assist you?',
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        transaction_id = data.get('transaction_id')  # Optional: Link message to a transaction

        if message:
            try:
                # Save message to InternalMessage
                internal_message = await self.save_message(message, transaction_id)
                # Broadcast to sales support
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'sales_message',
                        'message': message,
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'transaction_id': transaction_id,
                        'message_id': internal_message.id,
                        'timestamp': internal_message.created_at.isoformat(),
                    }
                )
                # Send confirmation to user
                await self.send(text_data=json.dumps({
                    'type': 'message_sent',
                    'message': message,
                    'message_id': internal_message.id,
                    'timestamp': internal_message.created_at.isoformat(),
                }))
            except ValidationError as e:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': str(e),
                }))
                logger.error(f"Message validation failed for user {self.user.id}: {str(e)}")

    async def sales_message(self, event):
        # Send message to connected clients
        await self.send(text_data=json.dumps({
            'type': 'sales_message',
            'message': event['message'],
            'user_id': event['user_id'],
            'username': event['username'],
            'transaction_id': event.get('transaction_id'),
            'message_id': event['message_id'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def authenticate_user(self):
        token = self.scope['query_string'].decode().split('token=')[-1]
        auth = CustomJWTAuthentication()
        try:
            user, _ = auth.authenticate_credentials(token)
            return user
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            return None

    @database_sync_to_async
    def check_rate_limit(self, user, limit_type):
        if not settings.WEBSOCKET_RATE_LIMIT:
            return False
        key = f"ws_rate_limit_{limit_type}_{user.id}"
        limit = settings[f'{limit_type.upper()}_RATE_LIMIT_PER_MINUTE']
        count = cache.get(key, 0)
        if count >= limit:
            logger.warning(f"Rate limit exceeded for user {user.id} on {limit_type}")
            return True
        cache.set(key, count + 1, timeout=60)
        return False

    @database_sync_to_async
    def save_message(self, message, transaction_id):
        transaction = None
        if transaction_id:
            transaction = TransactionHeader.objects.filter(id=transaction_id).first()
        internal_message = InternalMessage.objects.create(
            sender=self.user,
            recipient=None,  # Sales support group (no specific recipient)
            subject='Sales Support Inquiry',
            body=message,
            transaction=transaction,
            priority=InternalMessage.Priority.NORMAL,
            created_by=self.user,
            updated_by=self.user,
        )
        return internal_message

class TransactionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = await self.authenticate_user()
        if not user:
            await self.close(code=4000)
            return

        self.user = user
        self.user_group = f'user_{user.id}'
        self.branch_group = f'branch_{user.default_branch_id}'

        # Rate limiting
        if await self.check_rate_limit(user, 'transaction'):
            await self.close(code=4001)
            return

        # Join user and branch groups
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add(self.branch_group, self.channel_name)
        await self.accept()

        # Send initial transaction data
        await self.send_initial_data()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
            await self.channel_layer.group_discard(self.branch_group, self.channel_name)

    async def transaction_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'transaction_update',
            'transaction_id': event['transaction_id'],
            'status': event['status'],
            'updated_at': event['updated_at'],
        }))

    @database_sync_to_async
    def authenticate_user(self):
        token = self.scope['query_string'].decode().split('token=')[-1]
        auth = CustomJWTAuthentication()
        try:
            user, _ = auth.authenticate_credentials(token)
            return user
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            return None

    @database_sync_to_async
    def check_rate_limit(self, user, limit_type):
        if not settings.WEBSOCKET_RATE_LIMIT:
            return False
        key = f"ws_rate_limit_{limit_type}_{user.id}"
        limit = settings[f'{limit_type.upper()}_RATE_LIMIT_PER_MINUTE']
        count = cache.get(key, 0)
        if count >= limit:
            logger.warning(f"Rate limit exceeded for user {user.id} on {limit_type}")
            return True
        cache.set(key, count + 1, timeout=60)
        return False

    @database_sync_to_async
    def get_transaction_data(self):
        return list(TransactionHeader.objects.filter(
            branch_id=self.user.default_branch_id,
            created_by=self.user
        ).values('id', 'transaction_number', 'status', 'updated_at'))

    async def send_initial_data(self):
        transaction_data = await self.get_transaction_data()
        await self.send(text_data=json.dumps({
            'type': 'initial_data',
            'data': transaction_data,
        }))

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = await self.authenticate_user()
        if not user:
            await self.close(code=4000)
            return

        self.user = user
        self.user_group = f'user_{user.id}'

        # Rate limiting
        if await self.check_rate_limit(user, 'notification'):
            await self.close(code=4001)
            return

        # Join user-specific notification group
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.accept()

        # Send initial notifications
        await self.send_initial_notifications()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def notification_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification_update',
            'notification_id': event['notification_id'],
            'message': event['message'],
            'status': event['status'],
            'created_at': event['created_at'],
        }))

    @database_sync_to_async
    def authenticate_user(self):
        token = self.scope['query_string'].decode().split('token=')[-1]
        auth = CustomJWTAuthentication()
        try:
            user, _ = auth.authenticate_credentials(token)
            return user
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            return None

    @database_sync_to_async
    def check_rate_limit(self, user, limit_type):
        if not settings.WEBSOCKET_RATE_LIMIT:
            return False
        key = f"ws_rate_limit_{limit_type}_{user.id}"
        limit = settings[f'{limit_type.upper()}_RATE_LIMIT_PER_MINUTE']
        count = cache.get(key, 0)
        if count >= limit:
            logger.warning(f"Rate limit exceeded for user {user.id} on {limit_type}")
            return True
        cache.set(key, count + 1, timeout=60)
        return False

    @database_sync_to_async
    def get_notifications(self):
        return list(Notification.objects.filter(
            recipient=self.user,
            status__in=['PENDING', 'SENT']
        ).values('id', 'message', 'status', 'created_at'))

    async def send_initial_notifications(self):
        notifications = await self.get_notifications()
        await self.send(text_data=json.dumps({
            'type': 'initial_notifications',
            'data': notifications,
        }))