from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from apps.core_apps.general import AuditableModel
from apps.organization.models import Branch
from apps.core_apps.utils import Logger

logger = Logger(__name__)

class InsuranceSubscriber(AuditableModel):
    """Insurance company subscribers"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    subscriber_code = models.CharField(max_length=20)
    subscriber_name = models.CharField(max_length=200)
    insurance_company = models.CharField(max_length=200)
    policy_number = models.CharField(max_length=50)
    coverage_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    expiry_date = models.DateField(null=True, blank=True)
    phone_number = PhoneNumberField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Insurance Subscriber")
        verbose_name_plural = _("Insurance Subscribers")
        ordering = ['subscriber_name']
        
    def __str__(self):
        return f"{self.subscriber_name} ({self.insurance_company}) - {self.subscriber_code}"