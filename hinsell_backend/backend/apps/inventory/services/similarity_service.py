# apps/inventory/services/similarity_service.py
from decimal import Decimal
from django.db.models import Q, Case, When, Value, FloatField, F, Avg
from django.db.models.functions import Abs
from apps.inventory.models import Item
from apps.core_apps.utils import Logger

logger = Logger(__name__)

class ItemSimilarityService:
    """
    Service for finding similar items based on various criteria.
    Implements rule-based similarity using categories, tags, prices, and ratings.
    Designed for efficiency with query optimizations and annotations.
    """

    def __init__(self, branch_id):
        self.branch_id = branch_id

    def _get_candidates(self, item, scope='group'):
        """
        Get candidate items for similarity calculations.
        Scope can be 'group' (same item_group), 'store' (same store_group), or 'branch' (entire branch).
        """
        queryset = Item.objects.filter(branch_id=self.branch_id).exclude(id=item.id)
        
        if scope == 'group':
            queryset = queryset.filter(item_group=item.item_group)
        elif scope == 'store':
            queryset = queryset.filter(item_group__store_group=item.item_group.store_group)
        
        # Optimize by selecting only necessary fields
        queryset = queryset.only(
            'id', 'name', 'slug', 'tags', 'average_rating', 'review_count',
            'item_group_id', 'item_group__store_group_id'
        ).annotate(
            min_price=Avg('variants__sales_price')
        )
        
        return queryset

    def _calculate_similarity_score(self, item, candidates):
        """
        Annotate candidates with similarity score.
        Score based on:
        - Category match: 0.4 if same group, 0.2 if same store group
        - Tag overlap: 0.4 * (intersection / union)
        - Price proximity: 0.2 * (1 - normalized price diff)
        """
        item_tags = set(item.tags.split(',') if item.tags else [])
        item_price = item.variants.aggregate(avg_price=Avg('sales_price'))['avg_price'] or Decimal('0')
        
        # To avoid looping, we'll use annotations where possible
        # But tag overlap requires some processing; limit candidates first
        if len(candidates) > 100:
            candidates = candidates.order_by('-average_rating')[:100]
        
        annotated = []
        for cand in candidates:
            cand_tags = set(cand.tags.split(',') if cand.tags else [])
            intersection = len(item_tags & cand_tags)
            union = len(item_tags | cand_tags)
            tag_sim = intersection / union if union else 0.0
            
            cat_sim = 0.4 if cand.item_group_id == item.item_group_id else \
                      0.2 if cand.item_group.store_group_id == item.item_group.store_group_id else 0.0
            
            cand_price = cand.min_price or Decimal('0')
            price_diff = abs(cand_price - item_price)
            max_price = max(cand_price, item_price) or Decimal('1')
            price_sim = 1 - (price_diff / max_price)
            price_sim = max(0, min(1, price_sim)) * 0.2
            
            score = cat_sim + (tag_sim * 0.4) + price_sim
            cand.similarity_score = score
            annotated.append(cand)
        
        return sorted(annotated, key=lambda x: x.similarity_score, reverse=True)

    def find_similar_items(self, item, limit=10, exclude_out_of_stock=True):
        """
        Find similar items based on category, tags, and price proximity.
        """
        try:
            candidates = self._get_candidates(item, scope='store')
            
            if exclude_out_of_stock:
                candidates = candidates.filter(
                    variants__inventory_balances__available_quantity__gt=0
                ).distinct()
            
            similar = self._calculate_similarity_score(item, candidates)
            return similar[:limit]
        
        except Exception as e:
            logger.error(
                f"Error finding similar items for item {item.id}: {str(e)}",
                extra={'item_id': item.id},
                exc_info=True
            )
            return []

    def find_trending_similar_items(self, item, limit=10):
        """
        Find trending similar items: high review count and recent activity.
        Assuming trending based on review_count and average_rating.
        """
        try:
            candidates = self._get_candidates(item, scope='store')
            
            # Annotate with trend_score = review_count * average_rating
            candidates = candidates.annotate(
                trend_score=F('review_count') * F('average_rating'),
                sim_score=Case(
                    When(item_group_id=item.item_group_id, then=Value(1.0)),
                    default=Value(0.5),
                    output_field=FloatField()
                )
            ).order_by('-trend_score', '-sim_score')
            
            return candidates[:limit]
        
        except Exception as e:
            logger.error(
                f"Error finding trending similar items for item {item.id}: {str(e)}",
                extra={'item_id': item.id},
                exc_info=True
            )
            return []

    def find_price_alternative_items(self, item, price_range='budget', limit=10):
        """
        Find price alternatives: similar items cheaper (budget) or more expensive (premium).
        """
        try:
            item_price = item.variants.aggregate(avg_price=Avg('sales_price'))['avg_price'] or Decimal('0')
            
            candidates = self._get_candidates(item, scope='group')
            
            price_filter = Q(variants__sales_price__lt=item_price) if price_range == 'budget' else \
                           Q(variants__sales_price__gt=item_price)
            
            candidates = candidates.filter(price_filter).distinct().annotate(
                price_diff=Abs(Avg('variants__sales_price') - item_price),
                sim_score=Case(
                    When(tags__icontains=item.tags, then=Value(0.5)),
                    default=Value(0.0),
                    output_field=FloatField()
                )
            )
            
            if price_range == 'budget':
                candidates = candidates.order_by('price_diff', '-average_rating')
            else:
                candidates = candidates.order_by('-price_diff', '-average_rating')
            
            return candidates[:limit]
        
        except Exception as e:
            logger.error(
                f"Error finding price alternatives for item {item.id}: {str(e)}",
                extra={'item_id': item.id, 'price_range': price_range},
                exc_info=True
            )
            return []