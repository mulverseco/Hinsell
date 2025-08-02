import uuid
from django.utils.text import slugify
import logging
from typing import Optional, Dict, Any
# from django.contrib.auth.models import User
from django.http import HttpRequest

def generate_unique_code(prefix: str, length: int = 8) -> str:
    """Generate a unique code with a prefix and UUID."""
    return f"{prefix}-{str(uuid.uuid4())[:length].upper()}"

def generate_unique_slug(name: str, model_class, max_length: int = 120) -> str:
    """Generate a unique slug based on name."""
    base_slug = slugify(name)[:max_length-10]
    suffix = str(uuid.uuid4())[:8]
    slug = f"{base_slug}-{suffix}"
    
    counter = 1
    while model_class.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}-{suffix}"
        counter += 1
    return slug[:max_length]


class Logger:
    """Custom logger for structured logging with context."""
    
    def __init__(self, name: str, user: Optional[Any] = None, branch_id: Optional[int] = None, 
                 request: Optional[HttpRequest] = None):
        self.logger = logging.getLogger(name)
        self.user = user
        self.branch_id = branch_id
        self.request = request

    def _get_context(self) -> Dict[str, Any]:
        """Build context dictionary for logging."""
        context = {}
        if self.user:
            context['user_id'] = self.user.id
            context['username'] = self.user.username
        if self.branch_id:
            context['branch_id'] = self.branch_id
        if self.request:
            context['request_path'] = self.request.path
            context['request_method'] = self.request.method
        return context

    def info(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log an info message with context."""
        extra = extra or {}
        extra.update(self._get_context())
        self.logger.info(message, extra=extra)

    def error(self, message: str, extra: Optional[Dict[str, Any]] = None, exc_info: bool = False):
        """Log an error message with context."""
        extra = extra or {}
        extra.update(self._get_context())
        self.logger.error(message, extra=extra, exc_info=exc_info)

    def warning(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log a warning message with context."""
        extra = extra or {}
        extra.update(self._get_context())
        self.logger.warning(message, extra=extra)

    def debug(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log a debug message with context."""
        extra = extra or {}
        extra.update(self._get_context())
        self.logger.debug(message, extra=extra)

def get_default_notifications():
    return {'email': False, 'sms': False, 'whatsapp': False, 'in_app': False, 'push': False}

def get_default_data_consent():
    return {'data_processing': False, 'marketing': False, 'analytics': False, 'data_sharing': False}
