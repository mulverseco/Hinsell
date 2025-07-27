"""
Custom validators for business logic
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal


def validate_positive_decimal(value):
    """Validate that decimal value is positive"""
    if value < 0:
        raise ValidationError(_('Value must be positive'))


def validate_percentage(value):
    """Validate percentage is between 0 and 100"""
    if not (0 <= value <= 100):
        raise ValidationError(_('Percentage must be between 0 and 100'))


def validate_future_date(value):
    """Validate that date is not in the past"""
    if value < timezone.now().date():
        raise ValidationError(_('Date cannot be in the past'))


def validate_phone_number(value):
    """Basic phone number validation"""
    import re
    if not re.match(r'^\+?1?\d{9,15}$', value):
        raise ValidationError(_('Invalid phone number format'))


class BusinessRuleValidator:
    """Collection of business rule validators"""
    
    @staticmethod
    def validate_discount_ratio(discount, max_discount=100):
        if discount > max_discount:
            raise ValidationError(
                _('Discount cannot exceed %(max)s%%') % {'max': max_discount}
            )
    
    @staticmethod
    def validate_price_consistency(cost_price, selling_price):
        if selling_price < cost_price:
            raise ValidationError(_('Selling price cannot be less than cost price'))
    
    @staticmethod
    def validate_date_range(start_date, end_date):
        if start_date >= end_date:
            raise ValidationError(_('Start date must be before end date'))
