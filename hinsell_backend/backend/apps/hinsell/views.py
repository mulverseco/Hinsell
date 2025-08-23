from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.cache import cache
from apps.core_apps.general import BaseViewSet
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign
from apps.hinsell.serializers import OfferSerializer, CouponSerializer, UserCouponSerializer, CampaignSerializer
from apps.core_apps.utils import Logger

class OfferViewSet(BaseViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    filterset_fields = ['offer_type', 'target_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['start_date', 'end_date', 'current_uses']
    permission_classes_by_action = {
        'create': [IsAdminUser],
        'update': [IsAdminUser],
        'partial_update': [IsAdminUser],
        'destroy': [IsAdminUser],
        'list': [],
        'retrieve': [],
        'apply': [],
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply an offer to a given price and quantity."""
        offer = self.get_object()
        price = request.data.get('price')
        quantity = request.data.get('quantity', 1)
        try:
            price = Decimal(price)
            quantity = int(quantity)
            result = offer.apply(price, quantity, user=request.user)
            cache.delete(f"active_offers_{offer.branch.id}")
            return Response(result, status=status.HTTP_200_OK)
        except (ValueError, TypeError) as e:
            logger.error(f"Error applying offer {offer.code}: {str(e)}", extra={'offer_id': offer.id, 'user_id': request.user.id})
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CouponViewSet(BaseViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    filterset_fields = ['coupon_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['start_date', 'end_date', 'current_uses']
    permission_classes_by_action = {
        'create': [IsAdminUser],
        'update': [IsAdminUser],
        'partial_update': [IsAdminUser],
        'destroy': [IsAdminUser],
        'list': [],
        'retrieve': [],
        'apply': [],
    }

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply a coupon to a given price."""
        coupon = self.get_object()
        price = request.data.get('price')
        try:
            price = Decimal(price)
            discounted_price = coupon.apply(price, user=request.user)
            UserCoupon.objects.create(
                user=request.user,
                coupon=coupon,
                branch=coupon.branch
            )
            return Response({'discounted_price': discounted_price}, status=status.HTTP_200_OK)
        except (ValueError, TypeError) as e:
            logger.error(f"Error applying coupon {coupon.code}: {str(e)}", extra={'coupon_id': coupon.id, 'user_id': request.user.id})
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserCouponViewSet(BaseViewSet):
    queryset = UserCoupon.objects.all()
    serializer_class = UserCouponSerializer
    filterset_fields = ['is_used', 'coupon']
    search_fields = ['coupon__code', 'user__email']
    permission_classes_by_action = {
        'create': [IsAdminUser],
        'list': [],
        'retrieve': [],
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset

class CampaignViewSet(BaseViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    filterset_fields = ['campaign_type', 'is_active']
    search_fields = ['name', 'code', 'content']
    ordering_fields = ['start_date', 'end_date', 'impressions', 'clicks', 'conversions']
    permission_classes_by_action = {
        'create': [IsAdminUser],
        'update': [IsAdminUser],
        'partial_update': [IsAdminUser],
        'destroy': [],
        'list': [],
        'retrieve': [],
        'track_impression': [],
        'track_click': [],
        'track_conversion': [],
    }

    @action(detail=True, methods=['post'])
    def track_impression(self, request, pk=None):
        """Track a campaign impression."""
        campaign = self.get_object()
        campaign.track_impression()
        return Response({'status': 'impression tracked'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def track_click(self, request, pk=None):
        """Track a campaign click."""
        campaign = self.get_object()
        campaign.track_click()
        return Response({'status': 'click tracked'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def track_conversion(self, request, pk=None):
        """Track a campaign conversion."""
        campaign = self.get_object()
        campaign.track_conversion(user=request.user)
        return Response({'status': 'conversion tracked'}, status=status.HTTP_200_OK)