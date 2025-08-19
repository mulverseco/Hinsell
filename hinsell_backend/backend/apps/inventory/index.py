import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.inventory.models import ItemGroup,Item,ItemUnit,ItemBarcode

def get_record_without_uuids(obj, exclude_fields=None):
    """
    Return a dict of object's fields for Algolia indexing, excluding UUIDs or specified fields.
    """
    if exclude_fields is None:
        exclude_fields = []

    record = {}
    for field in obj._meta.fields:
        name = field.name
        value = getattr(obj, name)

        if name in exclude_fields:
            continue
        if isinstance(value, (uuid.UUID, )):
            continue
        record[name] = value
    return record


@register(ItemGroup)
class ItemGroupIndex(AlgoliaIndex):
    fields = ('code', 'name', 'slug', 'visibility')

    def get_record(self, obj):
        return get_record_without_uuids(obj)


@register(Item)
class ItemIndex(AlgoliaIndex):
    fields = ('code', 'name', 'slug', 'size', 'color', 'sales_price')

    def get_record(self, obj):
        return get_record_without_uuids(obj)


@register(ItemUnit)
class ItemUnitIndex(AlgoliaIndex):
    fields = ('name', 'code', 'unit_cost')

    def get_record(self, obj):
        return get_record_without_uuids(obj)


@register(ItemBarcode)
class ItemBarcodeIndex(AlgoliaIndex):
    fields = ('item', 'barcode', 'unit', 'is_primary')

    def get_record(self, obj):
        return get_record_without_uuids(obj)