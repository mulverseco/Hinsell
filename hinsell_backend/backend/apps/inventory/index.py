import algoliasearch_django as algoliasearch

from apps.inventory.models import ItemGroup,Item,ItemUnit,ItemBarcode,InventoryBalance

algoliasearch.register(ItemGroup)
algoliasearch.register(Item)
algoliasearch.register(ItemUnit)
algoliasearch.register(ItemBarcode)
algoliasearch.register(InventoryBalance)