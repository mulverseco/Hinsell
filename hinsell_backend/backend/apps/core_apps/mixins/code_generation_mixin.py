from django.db import models, IntegrityError
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.core_apps.utils import generate_unique_code, Logger

class CodeGenerationMixin(models.Model):
    """
    Mixin to handle automatic code generation with retry logic.
    Eliminates code duplication across models.
    """
    
    class Meta:
        abstract = True

    CODE_PREFIX = 'GEN'
    CODE_LENGTH = 12
    MAX_RETRIES = 3
    
    def get_code_prefix(self) -> str:
        """Override this method to provide dynamic prefixes."""
        return getattr(self, 'CODE_PREFIX', 'GEN')
    
    def get_code_length(self) -> int:
        """Override this method to provide dynamic lengths."""
        return getattr(self, 'CODE_LENGTH', 12)
    
    def generate_code(self) -> str:
        """Generate a unique code for this model."""
        return generate_unique_code(self.get_code_prefix(), length=self.get_code_length())
    
    def clean(self):
        """Enhanced clean method that handles code validation properly."""
        super().clean()
        
        if hasattr(self, 'code'):
            if self.code and not self.code.strip():
                self.code = None
    
    def save(self, *args, **kwargs):
        """Save with automatic code generation and retry logic."""
        logger = Logger(__name__)
        
        if hasattr(self, 'code') and not self.code:
            self.code = self.generate_code()
        
        retries = self.MAX_RETRIES
        while retries > 0:
            try:
                super().save(*args, **kwargs)
                logger.info(f"{self.__class__.__name__} saved successfully", 
                          extra={'model': self.__class__.__name__, 'id': getattr(self, 'id', None)})
                return
            except IntegrityError as e:
                if 'unique constraint' in str(e).lower() and 'code' in str(e).lower():
                    if hasattr(self, 'code'):
                        self.code = self.generate_code()
                        retries -= 1
                        logger.warning(f"Code collision for {self.__class__.__name__}, retrying", 
                                     extra={'retries_left': retries})
                    else:
                        logger.error(f"Unique constraint error but no code field: {str(e)}")
                        raise
                else:
                    logger.error(f"IntegrityError saving {self.__class__.__name__}: {str(e)}", exc_info=True)
                    raise
        
        error_msg = f'Unable to generate a unique code for {self.__class__.__name__} after {self.MAX_RETRIES} retries.'
        logger.error(error_msg)
        raise ValidationError({'code': _(error_msg)})
