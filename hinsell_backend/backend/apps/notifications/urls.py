"""
URL configuration for notifications app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.notifications import views

app_name = 'notifications'

router = DefaultRouter()
router.register(r'templates', views.NotificationTemplateViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'preferences', views.NotificationPreferenceViewSet)
router.register(r'logs', views.NotificationLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Custom endpoints
    path('send/', views.SendNotificationView.as_view(), name='send-notification'),
    path('bulk-send/', views.BulkSendNotificationView.as_view(), name='bulk-send-notification'),
    path('mark-read/<int:notification_id>/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('user-notifications/', views.UserNotificationsView.as_view(), name='user-notifications'),
    path('notification-stats/', views.NotificationStatsView.as_view(), name='notification-stats'),
    path('delivery-report/', views.DeliveryReportView.as_view(), name='delivery-report'),

    # Template management
    path('template-preview/', views.TemplatePreviewView.as_view(), name='template-preview'),
    path('template-variables/<str:notification_type>/', views.TemplateVariablesView.as_view(), name='template-variables'),

    # Webhook endpoints for external services
    path('webhooks/sms-status/', views.SMSStatusWebhookView.as_view(), name='sms-status-webhook'),
    path('webhooks/email-status/', views.EmailStatusWebhookView.as_view(), name='email-status-webhook'),
    path('webhooks/whatsapp-status/', views.WhatsAppStatusWebhookView.as_view(), name='whatsapp-status-webhook'),
]
