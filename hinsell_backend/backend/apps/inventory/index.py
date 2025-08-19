import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.inventory.models import ItemGroup,Item,ItemUnit,ItemBarcode


@register(ItemGroup)
class ItemGroupIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug','visibility')

    def get_record(self, obj):
        record = super().get_record(obj)
        if isinstance(obj.id, uuid.UUID):
            record['id'] = str(obj.id)
        return record


@register(Item)
class ItemIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'size', 'color', 'sales_price')

    def get_record(self, obj):
        record = super().get_record(obj)
        if isinstance(obj.id, uuid.UUID):
            record['id'] = str(obj.id)
        return record


@register(ItemUnit)
class ItemUnitIndex(AlgoliaIndex):
    fields = ('id', 'name', 'code', 'unit_cost', 'unit_cost')

    def get_record(self, obj):
        record = super().get_record(obj)
        if isinstance(obj.id, uuid.UUID):
            record['id'] = str(obj.id)
        return record


@register(ItemBarcode)
class ItemBarcodeIndex(AlgoliaIndex):
    fields = ('id', 'item', 'barcode', 'unit', 'is_primary')

    def get_record(self, obj):
        record = super().get_record(obj)
        if isinstance(obj.id, uuid.UUID):
            record['id'] = str(obj.id)
        return record
