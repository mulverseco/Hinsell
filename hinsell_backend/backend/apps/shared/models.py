from django.conf import settings
from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import magic
from apps.core_apps.general import AuditableModel

class StableFileExtensionValidator(FileExtensionValidator):
    """Custom FileExtensionValidator to ensure consistent serialization in migrations."""
    def __eq__(self, other):
        if isinstance(other, FileExtensionValidator):
            return sorted(self.allowed_extensions) == sorted(other.allowed_extensions)
        return super().__eq__(other)

    def deconstruct(self):
        path, args, kwargs = super().deconstruct()
        kwargs['allowed_extensions'] = sorted(kwargs['allowed_extensions'])
        return path, args, kwargs

def validate_file_size(value):
    """Validate file size (e.g., max 10MB for images/documents, 100MB for videos)."""
    max_sizes = {
        'image': 10 * 1024 * 1024,  # 10MB
        'video': 100 * 1024 * 1024,  # 100MB
        'document': 10 * 1024 * 1024,  # 10MB
    }
    extension = value.name.lower().rsplit('.', 1)[-1]
    extension = f".{extension}"
    media_type = 'other'
    for m_type, extensions in settings.ALLOWED_MEDIA_EXTENSIONS.items():
        if extension in extensions:
            media_type = m_type
            break
    max_size = max_sizes.get(media_type, 10 * 1024 * 1024)
    if value.size > max_size:
        raise ValidationError(_('File size cannot exceed %(max_size)s MB.'), params={'max_size': max_size // (1024 * 1024)})

class Media(AuditableModel):
    """Centralized media management with stable extension validation."""

    ALLOWED_EXTENSIONS = sorted(
        sum(getattr(settings, 'ALLOWED_MEDIA_EXTENSIONS', {
            'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
            'video': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
            'document': ['.pdf', '.doc', '.docx', '.txt']
        }).values(), [])
    )

    ALLOWED_MIME_TYPES = {
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
        'video': ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
        'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    }

    file = models.FileField(
        upload_to='media/%Y/%m/%d/',
        verbose_name=_("File"),
        help_text=_("Media file (image, video, document)"),
        validators=[
            StableFileExtensionValidator(allowed_extensions=[ext.lstrip('.') for ext in ALLOWED_EXTENSIONS]),
            validate_file_size
        ]
    )
    alt_text = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Alt Text"),
        help_text=_("Alternative text for accessibility")
    )
    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order"),
        help_text=_("Order for displaying media")
    )
    media_type = models.CharField(
        max_length=20,
        choices=[
            ('image', _('Image')),
            ('video', _('Video')),
            ('document', _('Document')),
            ('other', _('Other')),
        ],
        blank=True,
        null=True,
        verbose_name=_("Media Type"),
        help_text=_("Automatically detected media type")
    )
    file_size = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("File Size"),
        help_text=_("File size in bytes")
    )
    image_dimensions = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name=_("Image Dimensions"),
        help_text=_("Image dimensions (e.g., 1920x1080)")
    )

    class Meta:
        verbose_name = _("Media")
        verbose_name_plural = _("Media")
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['media_type', 'display_order']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_deleted']),
        ]

    def _detect_media_type(self) -> str:
        """Detect media type based on file extension and MIME type."""
        if not self.file:
            return 'other'

        extension = self.file.name.lower().rsplit('.', 1)[-1]
        extension = f".{extension}"

        ext_map = settings.ALLOWED_MEDIA_EXTENSIONS
        for media_type, extensions in ext_map.items():
            if extension in extensions:
                mime = magic.Magic(mime=True)
                mime_type = mime.from_buffer(self.file.read(1024))
                self.file.seek(0)
                if mime_type in self.ALLOWED_MIME_TYPES.get(media_type, []):
                    return media_type
        return 'other'

    def validate_mime_type(self):
        """Validate file MIME type."""
        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(self.file.read(1024))
        self.file.seek(0)
        allowed_mimes = sum(self.ALLOWED_MIME_TYPES.values(), [])
        if mime_type not in allowed_mimes:
            raise ValidationError(_('Unsupported file type: %(mime)s'), params={'mime': mime_type})

    def save(self, *args, **kwargs):
        """Set media_type, file_size, and image_dimensions before saving."""
        self.full_clean()
        if self.file:
            self.file_size = self.file.size
            if self.media_type == 'image':
                try:
                    from PIL import Image
                    with Image.open(self.file) as img:
                        self.image_dimensions = f"{img.width}x{img.height}"
                except Exception:
                    self.image_dimensions = None
        self.media_type = self._detect_media_type()
        super().save(*args, **kwargs)

    def clean(self):
        """Validate file presence and MIME type."""
        super().clean()
        if not self.file:
            raise ValidationError({'file': _('Media file is required.')})
        self.validate_mime_type()

    def __str__(self):
        return f"{self.media_type} - {self.file.name}"