"""
URL configuration for webhooks app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.webhooks.views import (
    WebhookEventViewSet, WebhookEndpointViewSet, 
    WebhookDeliveryViewSet, WebhookEventLogViewSet
)

router = DefaultRouter()
router.register(r'events', WebhookEventViewSet)
router.register(r'endpoints', WebhookEndpointViewSet)
router.register(r'deliveries', WebhookDeliveryViewSet)
router.register(r'logs', WebhookEventLogViewSet)

app_name = 'webhooks'

urlpatterns = [
    path('api/webhooks/', include(router.urls)),
]
