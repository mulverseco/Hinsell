import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.inventory.models import ItemGroup,Item,ItemUnit,ItemBarcode

def uuid_to_str(value):
    return str(value) if isinstance(value, uuid.UUID) else value

@register(ItemGroup)
class ItemGroupIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'visibility')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        return record


@register(Item)
class ItemIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'size', 'color', 'sales_price')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        return record


@register(ItemUnit)
class ItemUnitIndex(AlgoliaIndex):
    fields = ('id', 'name', 'code', 'unit_cost')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        return record


@register(ItemBarcode)
class ItemBarcodeIndex(AlgoliaIndex):
    fields = ('id', 'item', 'barcode', 'unit', 'is_primary')

    def get_record(self, obj):
        record = super().get_record(obj)
        record['id'] = uuid_to_str(obj.id)
        record['item'] = uuid_to_str(obj.item_id)
        record['unit'] = uuid_to_str(obj.unit_id)
        return record