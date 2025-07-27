from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.medical.views import DoctorViewSet,DoctorVisitViewSet

app_name = 'medical'

router = DefaultRouter()
router.register(r'doctor', DoctorViewSet, basename='doctor')
router.register(r'doctor-visit', DoctorVisitViewSet, basename='doctor-visit')

urlpatterns = [
    path('', include(router.urls)),
]
