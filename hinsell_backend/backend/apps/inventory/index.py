import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.inventory.models import ItemGroup,Item,ItemUnit,ItemBarcode

def serialize_record(record):
    """Recursively convert UUIDs to strings and related objects to IDs."""
    if isinstance(record, dict):
        return {k: serialize_record(v) for k, v in record.items()}
    elif isinstance(record, list):
        return [serialize_record(v) for v in record]
    elif isinstance(record, uuid.UUID):
        return str(record)
    # Convert Django model instances to their primary key
    elif hasattr(record, "pk"):
        return serialize_record(record.pk)
    return record


@register(ItemGroup)
class ItemGroupIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'visibility')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)


@register(Item)
class ItemIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'size', 'color', 'sales_price')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)


@register(ItemUnit)
class ItemUnitIndex(AlgoliaIndex):
    fields = ('id', 'name', 'code', 'unit_cost')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)


@register(ItemBarcode)
class ItemBarcodeIndex(AlgoliaIndex):
    fields = ('id', 'item', 'barcode', 'unit', 'is_primary')

    def get_record(self, obj):
        record = super().get_record(obj)
        return serialize_record(record)