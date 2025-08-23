from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from apps.hinsell.models import Offer, Coupon, UserCoupon, Campaign

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['code','name', 'offer_type', 'target_type', 'is_active', 'start_date', 'end_date', 'current_uses']
    list_filter = ['offer_type', 'target_type', 'is_active', 'branch', 'created_at']
    search_fields = ['code', 'name', 'description', 'slug']
    readonly_fields = ['current_uses', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'code', 'name', 'slug', 'offer_type', 'is_active'),
            'description': 'Code and Slug are key identifiers for this offer'
        }),
        (_('Targeting'), {
            'fields': ('target_type', 'target_users', 'target_countries', 'target_items',
                       'target_item_groups', 'target_store_groups'),
            'classes': ('collapse',)
        }),
        (_('Offer Details'), {
            'fields': ('discount_percentage', 'discount_amount', 'buy_quantity', 'get_quantity',
                       'loyalty_points_earned', 'start_date', 'end_date', 'max_uses', 'current_uses')
        }),
        (_('Content'), {
            'fields': ('media', 'description', 'terms_conditions', 'meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    actions = ['notify_users', 'activate_offers', 'deactivate_offers']

    def activate_offers(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _("{} offers have been activated.").format(updated))
    activate_offers.short_description = _("Activate selected offers")

    def deactivate_offers(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _("{} offers have been deactivated.").format(updated))
    deactivate_offers.short_description = _("Deactivate selected offers")

    def notify_users(self, request, queryset):
        for offer in queryset:
            offer.notify_users()
        self.message_user(request, _("Selected offers have been notified to users."))
    notify_users.short_description = _("Notify users about selected offers")

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code','name', 'coupon_type', 'value', 'is_active', 'start_date', 'end_date', 'usage_stats']
    list_filter = ['coupon_type', 'is_active', 'branch', 'created_at']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['current_uses', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'code', 'name', 'coupon_type', 'is_active'),
            'description': 'Code is the unique identifier for this coupon'
        }),
        (_('Coupon Details'), {
            'fields': ('value', 'min_order_amount', 'max_uses', 'current_uses', 'start_date', 'end_date')
        }),
        (_('Targeting'), {
            'fields': ('target_users', 'target_items'),
            'classes': ('collapse',)
        }),
        (_('Content'), {
            'fields': ('media', 'description', 'terms_conditions'),
            'classes': ('collapse',)
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    actions = ['notify_users', 'activate_coupons', 'deactivate_coupons']

    def usage_stats(self, obj):
        if obj.max_uses:
            percentage = (obj.current_uses / obj.max_uses) * 100
            color = '#28a745' if percentage < 80 else '#ffc107' if percentage < 100 else '#dc3545'
            return format_html(
                '<span style="color: {};">{}/{} ({}%)</span>',
                color, obj.current_uses, obj.max_uses, round(percentage, 1)
            )
        return f"{obj.current_uses}/∞"
    usage_stats.short_description = _('Usage')

    def activate_coupons(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _("{} coupons have been activated.").format(updated))
    activate_coupons.short_description = _("Activate selected coupons")

    def deactivate_coupons(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _("{} coupons have been deactivated.").format(updated))
    deactivate_coupons.short_description = _("Deactivate selected coupons")

    def notify_users(self, request, queryset):
        for coupon in queryset:
            coupon.notify_users()
        self.message_user(request, _("Selected coupons have been notified to users."))
    notify_users.short_description = _("Notify users about selected coupons")

@admin.register(UserCoupon)
class UserCouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'user', 'branch', 'redemption_date', 'usage_status']
    list_filter = ['is_used', 'branch', 'redemption_date']
    search_fields = ['coupon__code', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['redemption_date', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Details'), {
            'fields': ('user', 'coupon', 'branch', 'order', 'is_used')
        }),
        (_('Audit'), {
            'fields': ('redemption_date', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )

    def usage_status(self, obj):
        if obj.is_used:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✓ Used</span>'
            )
        return format_html(
            '<span style="color: #6c757d;">○ Available</span>'
        )
    usage_status.short_description = _('Status')
    usage_status.admin_order_field = 'is_used'

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['display_code', 'display_slug', 'name', 'campaign_type', 'is_active', 'start_date', 'end_date', 'performance_summary']
    list_filter = ['campaign_type', 'is_active', 'branch', 'created_at']
    search_fields = ['code', 'name', 'content', 'slug']
    readonly_fields = ['impressions', 'clicks', 'conversions', 'conversion_rate', 'analytics_data', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('branch', 'code', 'name', 'slug', 'campaign_type', 'is_active'),
            'description': 'Code and Slug are key identifiers for this campaign'
        }),
        (_('Promotion Details'), {
            'fields': ('offer', 'coupon', 'target_users', 'target_countries')
        }),
        (_('Campaign Details'), {
            'fields': ('start_date', 'end_date', 'content', 'call_to_action')
        }),
        (_('Analytics'), {
            'fields': ('impressions', 'clicks', 'conversions', 'conversion_rate', 'analytics_data'),
            'classes': ('collapse',)
        }),
        (_('Content'), {
            'fields': ('media',),
            'classes': ('collapse',)
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    actions = ['launch_campaigns', 'pause_campaigns']

    def display_code(self, obj):
        return format_html(
            '<strong style="color: #0066cc;">{}</strong>',
            obj.code
        )
    display_code.short_description = _('Code')
    display_code.admin_order_field = 'code'

    def display_slug(self, obj):
        return format_html(
            '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">{}</code>',
            obj.slug
        )
    display_slug.short_description = _('Slug')
    display_slug.admin_order_field = 'slug'

    def performance_summary(self, obj):
        if obj.impressions > 0:
            ctr = (obj.clicks / obj.impressions) * 100
            return format_html(
                '<small>CTR: <strong>{}%</strong> | Conv: <strong>{}</strong></small>',
                round(ctr, 2), obj.conversions
            )
        return format_html('<small style="color: #6c757d;">No data</small>')
    performance_summary.short_description = _('Performance')

    def pause_campaigns(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _("{} campaigns have been paused.").format(updated))
    pause_campaigns.short_description = _("Pause selected campaigns")

    def launch_campaigns(self, request, queryset):
        for campaign in queryset:
            campaign.launch()
        self.message_user(request, _("Selected campaigns have been launched."))
    launch_campaigns.short_description = _("Launch selected campaigns")
