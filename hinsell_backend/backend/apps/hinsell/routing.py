from django.urls import re_path
from apps.hinsell.consumers import MessagingConsumer, TransactionConsumer, NotificationConsumer

websocket_urlpatterns = [
    re_path(r'ws/messaging/$', MessagingConsumer.as_asgi()),
    re_path(r'ws/transactions/$', TransactionConsumer.as_asgi()),
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
]