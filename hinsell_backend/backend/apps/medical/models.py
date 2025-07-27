"""
medical management models.
Handles all medical data with proper validation and audit trails.
"""
import logging
from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from apps.core_apps.general import AuditableModel
from apps.organization.models import Branch
from apps.authentication.tasks import User

logger = logging.getLogger(__name__)

class Doctor(AuditableModel):
    """Healthcare providers and physicians"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    doctor_code = models.CharField(max_length=20)
    doctor_name = models.CharField(max_length=200)
    specialization = models.CharField(max_length=100, blank=True)
    license_number = models.CharField(max_length=50, blank=True)
    clinic_name = models.CharField(max_length=200, blank=True)
    phone_number = PhoneNumberField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True)
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)

class DoctorVisit(AuditableModel):
    """Track visits to doctors for relationship management"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    visit_date = models.DateField()
    visited_by = models.ForeignKey(User, on_delete=models.CASCADE)
    purpose = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    samples_given = models.ManyToManyField('inventory.Item', through='inventory.SampleDistribution', blank=True)
