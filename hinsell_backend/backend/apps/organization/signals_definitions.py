from django.dispatch import Signal

license_validated = Signal()
license_violation_detected = Signal()
license_expiry_warning = Signal()