from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.http import JsonResponse
from apps.core_apps.views import health_check


schema_view = get_schema_view(
   openapi.Info(
      title="Hinsell API",
      default_version='v1',
      description="Hinsell e-commerce System",
      terms_of_service="https://mulverse.com/policies/terms/",
      contact=openapi.Contact(email="contact@mulverse.com"),
      license=openapi.License(name="MUV License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

rest_api_urlpatterns = [
    path('api/auth/', include('djoser.urls')),
    path('api/', include('apps.authentication.urls')),
    path('api/', include('apps.organization.urls')),
    path('api/', include('apps.reporting.urls')),
    path('api/', include('apps.insurance.urls')),
    path('api/', include('apps.hinsell.urls')),
    path('api/', include('apps.accounting.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.webhooks.urls')),
    path('api/health/', health_check, name='health_check'),
]

urlpatterns = [
    path('', lambda request: JsonResponse({'message': 'Hinsell API!'})),
    path('admin/', admin.site.urls),
   path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
   path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + rest_api_urlpatterns + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
