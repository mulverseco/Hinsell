from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'offer_type', 'target_type', 'is_active', 'start_date', 'end_date', 'current_uses']
    list_filter = ['offer_type', 'target_type', 'is_active', 'branch']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['code', 'slug', 'current_uses', 'created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'code', 'name', 'slug', 'offer_type', 'is_active')
        }),
        (_('Targeting'), {
            'fields': ('target_type', 'target_users', 'target_countries', 'target_items',
                       'target_item_groups', 'target_store_groups')
        }),
        (_('Offer Details'), {
            'fields': ('discount_percentage', 'discount_amount', 'buy_quantity', 'get_quantity',
                       'loyalty_points_earned', 'start_date', 'end_date', 'max_uses', 'current_uses')
        }),
        (_('Content'), {
            'fields': ('media', 'description', 'terms_conditions', 'meta_title', 'meta_description')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')
        }),
    )
    actions = ['notify_users']

    def notify_users(self, request, queryset):
        for offer in queryset:
            offer.notify_users()
        self.message_user(request, _("Selected offers have been notified to users."))
    notify_users.short_description = _("Notify users about selected offers")

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'coupon_type', 'value', 'is_active', 'start_date', 'end_date']
    list_filter = ['coupon_type', 'is_active', 'branch']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['code', 'current_uses', 'created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'code', 'name', 'coupon_type', 'is_active')
        }),
        (_('Coupon Details'), {
            'fields': ('value', 'min_order_amount', 'max_uses', 'current_uses', 'start_date', 'end_date')
        }),
        (_('Targeting'), {
            'fields': ('target_users', 'target_items')
        }),
        (_('Content'), {
            'fields': ('media', 'description', 'terms_conditions')
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')
        }),
    )
    actions = ['notify_users']

    def notify_users(self, request, queryset):
        for coupon in queryset:
            coupon.notify_users()
        self.message_user(request, _("Selected coupons have been notified to users."))
    notify_users.short_description = _("Notify users about selected coupons")

@admin.register(UserCoupon)
class UserCouponAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'branch', 'redemption_date', 'is_used']
    list_filter = ['is_used', 'branch']
    search_fields = ['coupon__code', 'user__email']
    readonly_fields = ['redemption_date', 'created_at', 'updated_at']
    fieldsets = (
        (_('Details'), {
            'fields': ('user', 'coupon', 'branch', 'order', 'is_used')
        }),
        (_('Audit'), {
            'fields': ('redemption_date', 'created_at', 'updated_at', 'created_by', 'updated_by')
        }),
    )

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'campaign_type', 'is_active', 'start_date', 'end_date', 'impressions', 'clicks', 'conversions']
    list_filter = ['campaign_type', 'is_active', 'branch']
    search_fields = ['code', 'name', 'content']
    readonly_fields = ['code', 'slug', 'impressions', 'clicks', 'conversions', 'conversion_rate', 'analytics_data', 'created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'code', 'name', 'slug', 'campaign_type', 'is_active')
        }),
        (_('Promotion Details'), {
            'fields': ('offer', 'coupon', 'target_users', 'target_countries')
        }),
        (_('Campaign Details'), {
            'fields': ('start_date', 'end_date', 'content', 'call_to_action')
        }),
        (_('Analytics'), {
            'fields': ('impressions', 'clicks', 'conversions', 'conversion_rate', 'analytics_data')
        }),
        (_('Content'), {
            'fields': ('media',)
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')
        }),
    )
    actions = ['launch_campaigns']

    def launch_campaigns(self, request, queryset):
        for campaign in queryset:
            campaign.launch()
        self.message_user(request, _("Selected campaigns have been launched."))
    launch_campaigns.short_description = _("Launch selected campaigns")