from django.conf import settings
from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import magic
from apps.core_apps.general import AuditableModel
import os
import uuid
import datetime
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image, ExifTags

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
        'image': getattr(settings, 'MEDIA_MAX_IMAGE_SIZE', 10 * 1024 * 1024),  # Default 10MB
        'video': getattr(settings, 'MEDIA_MAX_VIDEO_SIZE', 100 * 1024 * 1024),  # Default 100MB
        'document': getattr(settings, 'MEDIA_MAX_DOCUMENT_SIZE', 10 * 1024 * 1024),  # Default 10MB
        'other': getattr(settings, 'MEDIA_MAX_OTHER_SIZE', 10 * 1024 * 1024),  # Default 10MB
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

def media_upload_to(instance, filename):
    """Generate unique upload path to prevent filename collisions and improve distribution."""
    ext = os.path.splitext(filename)[1]
    new_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('media', datetime.datetime.now().strftime('%Y/%m/%d'), new_filename)

class Media(AuditableModel):
    """Centralized media management with stable extension validation, improved storage, and image optimization."""

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
        # Note: For large-scale production, configure DEFAULT_FILE_STORAGE to use cloud storage like AWS S3 via django-storages.
        # For advanced image optimization, consider integrating with services like Cloudinary or Imgix for on-the-fly processing.
        upload_to=media_upload_to,
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

    def _get_mime_type(self) -> str:
        """Get MIME type of the file."""
        if not self.file:
            return ''
        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(self.file.read(1024))
        self.file.seek(0)
        return mime_type

    def _handle_exif_orientation(self, img: Image) -> Image:
        """Handle EXIF orientation to rotate the image correctly."""
        try:
            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == 'Orientation':
                    exif = dict(img._getexif().items())
                    if orientation in exif:
                        if exif[orientation] == 3:
                            img = img.rotate(180, expand=True)
                        elif exif[orientation] == 6:
                            img = img.rotate(270, expand=True)
                        elif exif[orientation] == 8:
                            img = img.rotate(90, expand=True)
                    break
        except (AttributeError, KeyError, IndexError):
            pass
        return img

    def _is_animated(self, img: Image) -> bool:
        """Check if the image is animated (e.g., GIF with multiple frames)."""
        if img.format != 'GIF':
            return False
        try:
            img.seek(1)
            img.seek(0)
            return True
        except EOFError:
            return False

    def _resize_image(self, img: Image) -> Image:
        """Resize the image if it exceeds maximum dimensions while maintaining aspect ratio."""
        max_dim = getattr(settings, 'MEDIA_IMAGE_MAX_DIM', 1920)  # Default max width/height
        if img.width > max_dim or img.height > max_dim:
            aspect_ratio = img.width / img.height
            if img.width > img.height:
                new_width = max_dim
                new_height = int(max_dim / aspect_ratio)
            else:
                new_height = max_dim
                new_width = int(max_dim * aspect_ratio)
            img = img.resize((new_width, new_height), Image.LANCZOS)  # High-quality resampling
        return img

    def save(self, *args, **kwargs):
        """Set media_type, file_size, image_dimensions, optimize images (compress/convert to WebP), before saving."""
        self.full_clean()  # Validates and sets media_type based on original file
        if self.file and self.media_type == 'image':
            try:
                img = Image.open(self.file)
                img = self._handle_exif_orientation(img)
                img = self._resize_image(img)
                self.image_dimensions = f"{img.width}x{img.height}"

                # Prepare for WebP conversion
                output = BytesIO()
                is_animated = self._is_animated(img)
                original_format = img.format.lower()
                lossless = original_format in ['png', 'webp'] or img.mode in ['P', 'RGBA']  # Lossless for graphics/transparency

                save_kwargs = {
                    'format': 'WEBP',
                    'lossless': lossless,
                    'quality': getattr(settings, 'MEDIA_IMAGE_QUALITY', 85) if not lossless else 100,
                    'method': 6,  # Highest compression level
                    'save_all': is_animated,
                }
                if is_animated:
                    frames = [frame.copy() for frame in Image.sequence.getiterator(img)]
                    frames[0].save(output, **save_kwargs, append_images=frames[1:])
                else:
                    img.save(output, **save_kwargs)
                output.seek(0)

                # Update file with optimized content and change extension to .webp
                new_name = os.path.splitext(self.file.name)[0] + '.webp'
                self.file.save(new_name, ContentFile(output.read()), save=False)
                self.file_size = self.file.size
            except Exception as e:
                # Log error and proceed without optimization if fails
                # In production, use logging: logger.error(f"Image optimization failed: {e}")
                self.file_size = self.file.size
                self.image_dimensions = None
        else:
            if self.file:
                self.file_size = self.file.size

        super().save(*args, **kwargs)

    def clean(self):
        """Validate file presence, MIME type, and set media_type."""
        super().clean()
        if not self.file:
            raise ValidationError({'file': _('Media file is required.')})
        
        mime_type = self._get_mime_type()
        extension = self.file.name.lower().rsplit('.', 1)[-1]
        extension = f".{extension}"
        ext_map = settings.ALLOWED_MEDIA_EXTENSIONS
        matched = False
        for m_type, extensions in ext_map.items():
            if extension in extensions and mime_type in self.ALLOWED_MIME_TYPES.get(m_type, []):
                self.media_type = m_type
                matched = True
                break
        if not matched:
            raise ValidationError(_('Unsupported file type or mismatch between extension and content: %(mime)s'), params={'mime': mime_type})

    def __str__(self):
        return f"{self.media_type} - {self.file.name}"