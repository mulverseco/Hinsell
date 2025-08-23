from decimal import Decimal
from typing import List, Dict, Any, Optional
from django.db.models import Q, F, Case, When, Value, IntegerField
from django.db.models.functions import Abs
from apps.inventory.models import Item, ItemGroup
from apps.core_apps.utils import Logger


class ItemSimilarityService:
    """Service for finding similar items using multiple algorithms."""
    
    def __init__(self, branch_id: int):
        self.branch_id = branch_id
        self.logger = Logger(__name__, branch_id=branch_id)
    
    def find_similar_items(
        self, 
        item: Item, 
        limit: int = 10,
        exclude_out_of_stock: bool = True,
        similarity_factors: Optional[Dict[str, float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Find similar items using weighted similarity scoring.
        
        Args:
            item: The reference item to find similarities for
            limit: Maximum number of similar items to return
            exclude_out_of_stock: Whether to exclude items with zero stock
            similarity_factors: Custom weights for similarity factors
        
        Returns:
            List of similar items with similarity scores
        """
        if similarity_factors is None:
            similarity_factors = {
                'category': 0.3,      # Same item group/category
                'brand': 0.2,         # Same brand/manufacturer
                'price': 0.2,         # Similar price range
                'rating': 0.1,        # Similar ratings
                'attributes': 0.1,    # Similar size/color/attributes
                'tags': 0.1          # Similar tags
            }
        
        try:
            # Base queryset - exclude the item itself and hidden items
            queryset = Item.objects.filter(
                branch_id=self.branch_id,
                visibility__in=['public', 'registered']
            ).exclude(id=item.id)
            
            # Exclude out of stock items if requested
            if exclude_out_of_stock:
                queryset = queryset.filter(
                    inventory_balances__available_quantity__gt=0
                ).distinct()
            
            # Calculate similarity scores using database annotations
            queryset = self._annotate_similarity_scores(queryset, item, similarity_factors)
            
            # Order by total similarity score and limit results
            similar_items = queryset.order_by('-total_similarity_score')[:limit]
            
            # Convert to list with additional metadata
            results = []
            for similar_item in similar_items:
                similarity_data = {
                    'item': similar_item,
                    'similarity_score': float(similar_item.total_similarity_score),
                    'similarity_reasons': self._get_similarity_reasons(item, similar_item),
                    'price_difference': abs(similar_item.sales_price - item.sales_price),
                    'rating_difference': abs(similar_item.average_rating - item.average_rating)
                }
                results.append(similarity_data)
            
            self.logger.info(
                f"Found {len(results)} similar items for {item.code}",
                extra={'item_id': item.id, 'similar_count': len(results)}
            )
            
            return results
            
        except Exception as e:
            self.logger.error(
                f"Error finding similar items for {item.code}: {str(e)}",
                extra={'item_id': item.id},
                exc_info=True
            )
            return []
    
    def _annotate_similarity_scores(
        self, 
        queryset, 
        reference_item: Item, 
        weights: Dict[str, float]
    ):
        """Annotate queryset with similarity scores using database functions."""
        
        # Category similarity (same item group or parent group)
        category_score = Case(
            When(item_group=reference_item.item_group, then=Value(100)),
            When(item_group__parent=reference_item.item_group.parent, then=Value(80)),
            When(item_group__store_group=reference_item.item_group.store_group, then=Value(60)),
            default=Value(0),
            output_field=IntegerField()
        )
        
        # Brand similarity
        brand_score = Case(
            When(brand=reference_item.brand, then=Value(100)),
            When(manufacturer=reference_item.manufacturer, then=Value(80)),
            default=Value(0),
            output_field=IntegerField()
        )
        
        # Price similarity (closer prices get higher scores)
        price_diff = Abs(F('sales_price') - reference_item.sales_price)
        max_price = max(reference_item.sales_price, Decimal('1.00'))
        price_score = Case(
            When(sales_price=reference_item.sales_price, then=Value(100)),
            default=100 - (price_diff / max_price * 100),
            output_field=IntegerField()
        )
        
        # Rating similarity
        rating_diff = Abs(F('average_rating') - reference_item.average_rating)
        rating_score = Case(
            When(average_rating=reference_item.average_rating, then=Value(100)),
            default=100 - (rating_diff * 20),  # 5-point scale, so max diff is 5
            output_field=IntegerField()
        )
        
        # Attribute similarity (size, color)
        attribute_score = Case(
            When(
                Q(size=reference_item.size) & Q(color=reference_item.color),
                then=Value(100)
            ),
            When(size=reference_item.size, then=Value(70)),
            When(color=reference_item.color, then=Value(70)),
            default=Value(0),
            output_field=IntegerField()
        )
        
        # Calculate weighted total similarity score
        total_score = (
            category_score * weights['category'] +
            brand_score * weights['brand'] +
            price_score * weights['price'] +
            rating_score * weights['rating'] +
            attribute_score * weights['attributes']
        )
        
        return queryset.annotate(
            category_similarity=category_score,
            brand_similarity=brand_score,
            price_similarity=price_score,
            rating_similarity=rating_score,
            attribute_similarity=attribute_score,
            total_similarity_score=total_score
        )
    
    def _get_similarity_reasons(self, reference_item: Item, similar_item: Item) -> List[str]:
        """Get human-readable reasons why items are similar."""
        reasons = []
        
        if similar_item.item_group == reference_item.item_group:
            reasons.append("Same category")
        elif similar_item.item_group.parent == reference_item.item_group.parent:
            reasons.append("Related category")
        elif similar_item.item_group.store_group == reference_item.item_group.store_group:
            reasons.append("Same store group")
        
        if similar_item.brand == reference_item.brand:
            reasons.append("Same brand")
        elif similar_item.manufacturer == reference_item.manufacturer:
            reasons.append("Same manufacturer")
        
        price_diff = abs(similar_item.sales_price - reference_item.sales_price)
        if price_diff <= reference_item.sales_price * Decimal('0.1'):  # Within 10%
            reasons.append("Similar price")
        
        rating_diff = abs(similar_item.average_rating - reference_item.average_rating)
        if rating_diff <= Decimal('0.5'):
            reasons.append("Similar rating")
        
        if similar_item.size == reference_item.size:
            reasons.append("Same size")
        
        if similar_item.color == reference_item.color:
            reasons.append("Same color")
        
        # Check for common tags
        if reference_item.tags and similar_item.tags:
            ref_tags = set(reference_item.tags.lower().split(','))
            sim_tags = set(similar_item.tags.lower().split(','))
            common_tags = ref_tags.intersection(sim_tags)
            if common_tags:
                reasons.append("Similar features")
        
        return reasons
    
    def find_trending_similar_items(
        self, 
        item: Item, 
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Find similar items that are currently trending (high ratings, featured)."""
        try:
            similar_items = self.find_similar_items(
                item, 
                limit=limit * 2,  # Get more to filter for trending
                exclude_out_of_stock=True
            )
            
            # Filter for trending items (featured, high ratings, recent)
            trending_items = []
            for item_data in similar_items:
                similar_item = item_data['item']
                if (similar_item.is_featured or 
                    similar_item.average_rating >= Decimal('4.0') or
                    similar_item.review_count >= 10):
                    trending_items.append(item_data)
                    
                if len(trending_items) >= limit:
                    break
            
            return trending_items
            
        except Exception as e:
            self.logger.error(
                f"Error finding trending similar items: {str(e)}",
                extra={'item_id': item.id},
                exc_info=True
            )
            return []
    
    def find_price_alternative_items(
        self, 
        item: Item, 
        price_range: str = 'lower',
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Find similar items in different price ranges."""
        try:
            # Base similarity search
            similar_items = self.find_similar_items(
                item,
                limit=limit * 3,  # Get more to filter by price
                exclude_out_of_stock=True,
                similarity_factors={
                    'category': 0.4,  # Emphasize category over price
                    'brand': 0.3,
                    'price': 0.1,    # De-emphasize price
                    'rating': 0.1,
                    'attributes': 0.1,
                    'tags': 0.0
                }
            )
            
            # Filter by price range
            price_filtered = []
            for item_data in similar_items:
                similar_item = item_data['item']
                
                if price_range == 'lower' and similar_item.sales_price < item.sales_price:
                    price_filtered.append(item_data)
                elif price_range == 'higher' and similar_item.sales_price > item.sales_price:
                    price_filtered.append(item_data)
                elif price_range == 'budget' and similar_item.sales_price <= item.sales_price * Decimal('0.7'):
                    price_filtered.append(item_data)
                elif price_range == 'premium' and similar_item.sales_price >= item.sales_price * Decimal('1.3'):
                    price_filtered.append(item_data)
                
                if len(price_filtered) >= limit:
                    break
            
            return price_filtered
            
        except Exception as e:
            self.logger.error(
                f"Error finding price alternative items: {str(e)}",
                extra={'item_id': item.id},
                exc_info=True
            )
            return []
