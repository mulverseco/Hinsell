from django.urls import path
from apps.authentication.auth_views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    CustomTokenVerifyView,
    LogoutView,
)

urlpatterns = [
    path('auth/jwt/create/', CustomTokenObtainPairView.as_view()),
    path('auth/jwt/refresh/', CustomTokenRefreshView.as_view()),
    path('auth/jwt/verify/', CustomTokenVerifyView.as_view()),
    path('logout/', LogoutView.as_view()),
]