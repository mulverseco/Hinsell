from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.shared.models import Media

class MediaSerializer(serializers.ModelSerializer):
    """Serializer for Media model."""
    file = serializers.FileField()

    class Meta:
        model = Media
        fields = ['id', 'file', 'alt_text', 'display_order', 'media_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'media_type', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('file'):
            raise ValidationError(_('Media file is required.'))
        return data