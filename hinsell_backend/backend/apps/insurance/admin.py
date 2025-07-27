from django.contrib import admin
from apps.insurance.models import InsuranceSubscriber


@admin.register(InsuranceSubscriber)
class InsuranceSubscriberAdmin(admin.ModelAdmin):
    list_display = ('subscriber_code', 'subscriber_name', 'insurance_company', 'is_active')
    search_fields = ('subscriber_code', 'subscriber_name', 'insurance_company')
    list_filter = ('is_active', 'insurance_company')
    ordering = ('subscriber_code',)
    list_per_page = 20
    fieldsets = (
        (None, {
            'fields': ('subscriber_code', 'subscriber_name', 'insurance_company', 'policy_number', 'coverage_percentage', 'expiry_date', 'phone_number', 'is_active')
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
    def has_add_permission(self, request):
        """Restrict add permission to superusers or users with specific permissions."""
        return request.user.is_superuser or request.user.has_perm('insurance.add_insurancesubscriber')
    def has_change_permission(self, request, obj=None):
        """Restrict change permission to superusers or users with specific permissions."""
        return request.user.is_superuser or request.user.has_perm('insurance.change_insurancesubscriber')
    def has_delete_permission(self, request, obj=None):
        """Restrict delete permission to superusers or users with specific permissions."""
        return request.user.is_superuser or request.user.has_perm('insurance.delete_insurancesubscriber')
    def has_view_permission(self, request, obj=None):
        """Restrict view permission to superusers or users with specific permissions."""
        return request.user.is_superuser or request.user.has_perm('insurance.view_insurancesubscriber')
    def get_queryset(self, request):
        """Filter queryset based on user branch."""
        queryset = super().get_queryset(request)
        if not request.user.is_superuser:
            user_branch = getattr(request.user, 'default_branch', None)
            if user_branch:
                queryset = queryset.filter(branch=user_branch)
        return queryset

