from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.hinsell.views import OfferViewSet, CouponViewSet, UserCouponViewSet, CampaignViewSet

app_name = 'hinsell'

router = DefaultRouter()
router.register(r'offers', OfferViewSet, basename='offer')
router.register(r'coupons', CouponViewSet, basename='coupon')
router.register(r'user-coupons', UserCouponViewSet, basename='user-coupon')
router.register(r'campaigns', CampaignViewSet, basename='campaign')

urlpatterns = [
    path('', include(router.urls)),
]