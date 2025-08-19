import uuid
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from apps.inventory.models import ItemGroup, Item, ItemUnit, ItemBarcode

# Monkey patch methods for should_index on inventory models
def item_group_is_indexable(self):
    return self.visibility != 'hidden'
ItemGroup.is_indexable = item_group_is_indexable

def item_is_indexable(self):
    return self.visibility != 'hidden'
Item.is_indexable = item_is_indexable

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
    fields = ('id', 'code', 'name', 'slug', 'visibility', 'group_type', 'description',
              'is_featured')
    should_index = 'is_indexable'
    settings = {
        'searchableAttributes': ['name', 'code', 'description'],
        'attributesForFaceting': ['visibility', 'group_type', 'is_featured', 'filterOnly(store_group_id)'],
        'ranking': ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }
    def category_path(self, obj):
        path = []
        current = obj
        while current:
            path.append(current.name)
            current = current.parent
        path.reverse()
        return ' > '.join(path)
    def store_group_id(self, obj):
        return obj.store_group.id
    def parent_id(self, obj):
        return obj.parent.id if obj.parent else None
    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        record['category_path'] = self.category_path(obj)
        record['store_group_id'] = self.store_group_id(obj)
        record['parent_id'] = self.parent_id(obj)
        return serialize_record(record)

@register(Item)
class ItemIndex(AlgoliaIndex):
    fields = ('id', 'code', 'name', 'slug', 'size', 'color', 'sales_price', 'item_type',
              'visibility', 'is_featured', 'brand', 'manufacturer', 'description',
              'short_description', 'average_rating')
    should_index = 'is_indexable'
    settings = {
        'searchableAttributes': ['name', 'code', 'description', 'short_description', 'brand', 'manufacturer', 'tags'],
        'attributesForFaceting': ['item_type', 'visibility', 'brand', 'manufacturer', 'size', 'color',
                                  'hierarchical_categories.lvl0', 'hierarchical_categories.lvl1',
                                  'hierarchical_categories.lvl2', 'hierarchical_categories.lvl3',
                                  'filterOnly(sales_price)', 'filterOnly(average_rating)'],
        'ranking': ['desc(average_rating)', 'asc(sales_price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }
    def get_tags(self, obj):
        if obj.tags:
            return [t.strip() for t in obj.tags.split(',') if t.strip()]
        return []
    def item_group_id(self, obj):
        return obj.item_group.id
    def hierarchical_categories(self, obj):
        path = []
        current = obj.item_group
        while current:
            path.append(current.name)
            current = current.parent
        path.reverse()
        levels = {}
        for i in range(len(path)):
            levels[f'lvl{i}'] = ' > '.join(path[:i+1])
        return levels
    def image_url(self, obj):
        if obj.media.exists():
            return obj.media.first().file.url
        return None
    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        record['tags'] = self.get_tags(obj)
        record['item_group_id'] = self.item_group_id(obj)
        record['hierarchical_categories'] = self.hierarchical_categories(obj)
        record['image_url'] = self.image_url(obj)
        return serialize_record(record)

@register(ItemUnit)
class ItemUnitIndex(AlgoliaIndex):
    fields = ('id', 'name', 'code', 'unit_cost', 'conversion_factor',
              'is_default', 'is_purchase_unit', 'is_sales_unit')
    settings = {
        'searchableAttributes': ['name', 'code'],
        'attributesForFaceting': ['item_id', 'is_default'],
        'ranking': ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }
    def item_id(self, obj):
        return obj.item.id
    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        record['item_id'] = self.item_id(obj)
        return serialize_record(record)

@register(ItemBarcode)
class ItemBarcodeIndex(AlgoliaIndex):
    fields = ('id', 'barcode', 'barcode_type', 'is_primary')
    settings = {
        'searchableAttributes': ['barcode'],
        'attributesForFaceting': ['barcode_type', 'is_primary', 'item_id'],
        'ranking': ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom']
    }
    def item_id(self, obj):
        return obj.item.id
    def unit_id(self, obj):
        return obj.unit.id if obj.unit else None
    def get_raw_record(self, obj):
        record = super().get_raw_record(obj)
        record['item_id'] = self.item_id(obj)
        record['unit_id'] = self.unit_id(obj)
        return serialize_record(record)