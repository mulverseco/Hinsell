from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.authentication.views import UserViewSet, UserProfileViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

app_name = 'authentication'

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/social/', include('djoser.social.urls')),
]