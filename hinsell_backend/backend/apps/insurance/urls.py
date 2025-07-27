from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.insurance.views import InsuranceSubscriberViewSet

app_name = 'insurance'

router = DefaultRouter()
router.register(r'subscribers', InsuranceSubscriberViewSet, basename='subscriber')

urlpatterns = [
    path('', include(router.urls)),
]
