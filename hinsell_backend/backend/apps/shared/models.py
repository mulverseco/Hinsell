from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.core_apps.general import AuditableModel

class Media(AuditableModel):
    """Centralized media management for items and groups with automatic type detection."""
    
    IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
    VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mkv', '.webm'}
    DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt'}
    ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS | DOCUMENT_EXTENSIONS

    file = models.FileField(
        upload_to='media/%Y/%m/%d/',
        verbose_name=_("File"),
        help_text=_("Media file (image, video, etc.)"),
        validators=[FileExtensionValidator(allowed_extensions=[ext.lstrip('.') for ext in ALLOWED_EXTENSIONS])]
    )
    alt_text = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Alt Text"),
        help_text=_("Alternative text for accessibility")
    )
    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order")
    )
    media_type = models.CharField(
        max_length=20,
        choices=[
            ('image', _('Image')),
            ('video', _('Video')),
            ('document', _('Document')),
            ('other', _('Other')),
        ],
        verbose_name=_("Media Type"),
        help_text=_("Automatically detected media type")
    )

    class Meta:
        verbose_name = _("Media")
        verbose_name_plural = _("Media")
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['media_type', 'display_order']),
        ]

    def _detect_media_type(self) -> str:
        """Detect media type based on file extension."""
        if not self.file:
            return 'other'
        
        extension = self.file.name.lower().rsplit('.', 1)[-1]
        extension = f".{extension}"

        if extension in self.IMAGE_EXTENSIONS:
            return 'image'
        elif extension in self.VIDEO_EXTENSIONS:
            return 'video'
        elif extension in self.DOCUMENT_EXTENSIONS:
            return 'document'
        return 'other'

    def save(self, *args, **kwargs):
        """Automatically set media_type before saving."""
        self.media_type = self._detect_media_type()
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        if not self.file:
            raise ValidationError({'file': _('Media file is required.')})

    def __str__(self):
        return f"{self.media_type} - {self.file.name}"