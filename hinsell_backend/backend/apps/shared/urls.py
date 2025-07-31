from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.shared.views import MediaViewSet

app_name = 'shared'

router = DefaultRouter()
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = [
    path('', include(router.urls)),
]