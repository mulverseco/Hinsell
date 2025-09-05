from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from apps.core_apps.general import BaseViewSet
from apps.core_apps.permissions import HasRolePermission
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign
from apps.hinsell.serializers import OfferSerializer, CouponSerializer, UserCouponSerializer, CampaignSerializer

class OfferViewSet(BaseViewSet):
    """ViewSet for Offer model."""
    queryset = Offer.objects.all().select_related('branch').prefetch_related(
        'target_users', 'target_items', 'target_item_groups', 'target_store_groups', 'media'
    )
    serializer_class = OfferSerializer
    logger_name = 'inventory.offer'
    
    filterset_fields = ['branch', 'code', 'offer_type', 'target_type', 'is_active']
    search_fields = ['code', 'name', 'slug', 'description']
    ordering_fields = ['code', 'name', 'start_date', 'end_date']
    ordering = ['-start_date']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    @action(detail=True, methods=['post'], url_path='apply')
    def apply_offer(self, request, pk=None):
        offer = self.get_object()
        price = Decimal(request.data.get('price', '0'))
        quantity = int(request.data.get('quantity', 1))
        item_id = request.data.get('item_id')
        country = request.data.get('country')
        
        item = None
        if item_id:
            item = get_object_or_404(Item, id=item_id)
        
        result = offer.apply(price=price, quantity=quantity, user=request.user, country=country, item=item)
        return Response(result)

class CouponViewSet(BaseViewSet):
    """ViewSet for Coupon model."""
    queryset = Coupon.objects.all().select_related('branch').prefetch_related(
        'target_users', 'target_items', 'media'
    )
    serializer_class = CouponSerializer
    logger_name = 'inventory.coupon'
    
    filterset_fields = ['branch', 'code', 'coupon_type', 'is_active']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'start_date', 'end_date']
    ordering = ['-start_date']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    @action(detail=True, methods=['post'], url_path='apply')
    def apply_coupon(self, request, pk=None):
        coupon = self.get_object()
        price = Decimal(request.data.get('price', '0'))
        
        discounted_price = coupon.apply(price=price, user=request.user)
        return Response({'discounted_price': discounted_price})

class UserCouponViewSet(BaseViewSet):
    """ViewSet for UserCoupon model."""
    queryset = UserCoupon.objects.all().select_related('user', 'coupon', 'branch', 'order')
    serializer_class = UserCouponSerializer
    logger_name = 'inventory.user_coupon'
    
    filterset_fields = ['user', 'coupon', 'is_used']
    search_fields = ['coupon__code']
    ordering_fields = ['redemption_date']
    ordering = ['-redemption_date']
    
    permission_classes_by_action = {
        'list': [IsAuthenticated],
        'retrieve': [IsAuthenticated],
        'create': [IsAuthenticated],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset

class CampaignViewSet(BaseViewSet):
    """ViewSet for Campaign model."""
    queryset = Campaign.objects.all().select_related('branch', 'offer', 'coupon').prefetch_related(
        'target_users', 'media'
    )
    serializer_class = CampaignSerializer
    logger_name = 'inventory.campaign'
    
    filterset_fields = ['branch', 'code', 'campaign_type', 'is_active']
    search_fields = ['code', 'name', 'slug', 'content']
    ordering_fields = ['code', 'name', 'start_date', 'end_date']
    ordering = ['-start_date']
    
    permission_classes_by_action = {
        'list': [],
        'retrieve': [],
        'create': [IsAuthenticated, HasRolePermission],
        'update': [IsAuthenticated, HasRolePermission],
        'partial_update': [IsAuthenticated, HasRolePermission],
        'destroy': [IsAuthenticated, HasRolePermission],
    }

    @action(detail=True, methods=['post'], url_path='track-impression')
    def track_impression(self, request, pk=None):
        campaign = self.get_object()
        campaign.track_impression()
        return Response({'status': 'impression tracked'})

    @action(detail=True, methods=['post'], url_path='track-click')
    def track_click(self, request, pk=None):
        campaign = self.get_object()
        campaign.track_click()
        return Response({'status': 'click tracked'})

    @action(detail=True, methods=['post'], url_path='track-conversion')
    def track_conversion(self, request, pk=None):
        campaign = self.get_object()
        campaign.track_conversion(user=request.user)
        return Response({'status': 'conversion tracked'})