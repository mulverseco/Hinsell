from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.notifications.views import (NotificationTemplateViewSet, NotificationViewSet, NotificationLogViewSet, InternalMessageViewSet, UserNoteViewSet)

router = DefaultRouter()
router.register(r'templates', NotificationTemplateViewSet, basename='notification-template')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'logs', NotificationLogViewSet, basename='notification-log')
router.register(r'messages', InternalMessageViewSet, basename='internal-message')
router.register(r'notes', UserNoteViewSet, basename='user-note')

urlpatterns = [
    path('', include(router.urls)),
]