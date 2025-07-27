from django.contrib import admin
from apps.medical.models import Doctor, DoctorVisit

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('doctor_code', 'doctor_name', 'specialization', 'clinic_name', 'phone_number', 'email')
    search_fields = ('doctor_code', 'doctor_name', 'specialization')
    list_filter = ('branch', 'specialization')
    ordering = ('doctor_name',)
    list_per_page = 20
    
@admin.register(DoctorVisit)
class DoctorVisitAdmin(admin.ModelAdmin):
    list_display = (
        'visit_date', 'doctor', 'visited_by', 'purpose', 
        'follow_up_date', 'is_active'
    )
    search_fields = (
        'doctor__doctor_name', 'doctor__doctor_code', 
        'visited_by__username', 'purpose'
    )
    list_filter = (
        'branch', 'doctor', 'visit_date', 'is_active'
    )
    ordering = ('-visit_date',)
    list_per_page = 20
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'created_by', 'updated_by'
    ]

