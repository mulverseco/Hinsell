from django.db import models, IntegrityError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal
from apps.core_apps.general import AuditableModel
from apps.core_apps.validators import validate_positive_decimal, validate_percentage
from apps.organization.models import Branch
from apps.accounting.models import Account
from apps.core_apps.utils import Logger, generate_unique_slug
from apps.shared.models import Media

class StoreGroup(AuditableModel):
    """Store group for inventory categorization."""
    class CostMethod(models.TextChoices):
        AVERAGE = 'average', _('Average Cost')
        FIFO = 'fifo', _('First In, First Out')
        LIFO = 'lifo', _('Last In, First Out')
        STANDARD = 'standard', _('Standard Cost')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='store_groups',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name")
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        verbose_name=_("Slug")
    )
    cost_method = models.CharField(
        max_length=10,
        choices=CostMethod.choices,
        default=CostMethod.AVERAGE,
        verbose_name=_("Cost Method")
    )
    stock_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_store_groups',
        verbose_name=_("Stock Account")
    )
    sales_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales_store_groups',
        verbose_name=_("Sales Account")
    )
    cost_of_sales_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cost_store_groups',
        verbose_name=_("Cost of Sales Account")
    )

    class Meta:
        verbose_name = _("Store Group")
        verbose_name_plural = _("Store Groups")
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['slug']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})

    def __str__(self):
        return f"{self.code} - {self.name} ({self.branch.branch_name})"

class ItemGroup(AuditableModel):
    """Item group with hierarchical structure for e-commerce."""
    class GroupType(models.TextChoices):
        PRODUCT = 'product', _('Product')
        SERVICE = 'service', _('Service')
        BOTH = 'both', _('Product & Service')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='item_groups',
        verbose_name=_("Branch")
    )
    store_group = models.ForeignKey(
        StoreGroup,
        on_delete=models.CASCADE,
        related_name='item_groups',
        verbose_name=_("Store Group")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name")
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        verbose_name=_("Slug")
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_("Parent Group")
    )
    group_type = models.CharField(
        max_length=10,
        choices=GroupType.choices,
        default=GroupType.PRODUCT,
        verbose_name=_("Group Type")
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='item_groups',
        verbose_name=_("Media")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    meta_title = models.CharField(
        max_length=60,
        blank=True,
        verbose_name=_("Meta Title")
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        verbose_name=_("Meta Description")
    )
    is_featured = models.BooleanField(
        default=False,
        verbose_name=_("Featured")
    )
    visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', _('Public')),
            ('registered', _('Registered Users Only')),
            ('hidden', _('Hidden')),
        ],
        default='public',
        verbose_name=_("Visibility")
    )

    class Meta:
        verbose_name = _("Item Group")
        verbose_name_plural = _("Item Groups")
        indexes = [
            models.Index(fields=['branch', 'store_group', 'code']),
            models.Index(fields=['slug', 'is_featured', 'visibility']),
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.parent and self.parent.store_group != self.store_group:
            raise ValidationError({'parent': _('Parent group must belong to the same store group.')})
        # Prevent cycles in hierarchy
        parent = self.parent
        seen = set()
        while parent:
            if parent.id in seen:
                raise ValidationError({'parent': _('Cycle detected in group hierarchy.')})
            seen.add(parent.id)
            parent = parent.parent

    def get_full_code(self) -> str:
        if self.parent:
            return f"{self.parent.get_full_code()}.{self.code}"
        return f"{self.store_group.code}.{self.code}"

    def get_level(self) -> int:
        level = 0
        current = self.parent
        while current:
            level += 1
            current = current.parent
        return level

    def __str__(self):
        return f"{self.store_group.code} - {self.code} - {self.name}"

class Item(AuditableModel):
    """Base item with shared e-commerce and inventory features."""
    class ItemType(models.TextChoices):
        PRODUCT = 'product', _('Product')
        SERVICE = 'service', _('Service')
        KIT = 'kit', _('Kit/Bundle')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_("Branch")
    )
    item_group = models.ForeignKey(
        ItemGroup,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_("Item Group")
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_("Name")
    )
    slug = models.SlugField(
        max_length=220,
        unique=True,
        verbose_name=_("Slug")
    )
    item_type = models.CharField(
        max_length=10,
        choices=ItemType.choices,
        default=ItemType.PRODUCT,
        verbose_name=_("Item Type")
    )
    base_unit = models.CharField(
        max_length=20,
        verbose_name=_("Base Unit")
    )
    manufacturer = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Manufacturer")
    )
    brand = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Brand")
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='items',
        verbose_name=_("Media")
    )
    meta_title = models.CharField(
        max_length=60,
        blank=True,
        verbose_name=_("Meta Title")
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        verbose_name=_("Meta Description")
    )
    tags = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Tags")
    )
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('5'))],
        verbose_name=_("Average Rating")
    )
    review_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Review Count")
    )
    is_featured = models.BooleanField(
        default=False,
        verbose_name=_("Featured")
    )
    visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', _('Public')),
            ('registered', _('Registered Users Only')),
            ('hidden', _('Hidden')),
        ],
        default='public',
        verbose_name=_("Visibility")
    )
    track_expiry = models.BooleanField(
        default=False,
        verbose_name=_("Track Expiry")
    )
    track_batches = models.BooleanField(
        default=False,
        verbose_name=_("Track Batches")
    )
    allow_discount = models.BooleanField(
        default=True,
        verbose_name=_("Allow Discount")
    )
    allow_bonus = models.BooleanField(
        default=True,
        verbose_name=_("Allow Bonus")
    )
    expiry_warning_days = models.PositiveIntegerField(
        default=30,
        verbose_name=_("Expiry Warning Days")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    short_description = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Short Description")
    )
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_("Internal Notes")
    )
    markup_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Markup Percentage")
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Discount Percentage")
    )
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Commission Percentage")
    )
    vat_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("VAT Percentage")
    )
    handling_fee = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Handling Fee")
    )

    class Meta:
        verbose_name = _("Item")
        verbose_name_plural = _("Items")
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['item_group', 'slug']),
            models.Index(fields=['is_featured', 'visibility', 'average_rating']),
            models.Index(fields=['manufacturer', 'brand']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(markup_percentage__gte=0) & models.Q(markup_percentage__lte=1000),
                name='item_valid_markup_percentage'
            ),
            models.CheckConstraint(
                check=models.Q(discount_percentage__gte=0) & models.Q(discount_percentage__lte=100),
                name='item_valid_discount_percentage'
            ),
            models.CheckConstraint(
                check=models.Q(commission_percentage__gte=0) & models.Q(commission_percentage__lte=100),
                name='item_valid_commission_percentage'
            ),
            models.CheckConstraint(
                check=models.Q(vat_percentage__gte=0) & models.Q(vat_percentage__lte=100),
                name='item_valid_vat_percentage'
            ),
            models.CheckConstraint(
                check=models.Q(average_rating__gte=0) & models.Q(average_rating__lte=5),
                name='valid_average_rating'
            )
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if not self.base_unit.strip():
            raise ValidationError({'base_unit': _('Base unit cannot be empty.')})
        if self.item_type == ItemType.SERVICE:
            self.track_expiry = False
            self.track_batches = False

    def get_variants(self):
        return self.variants.all()

    def get_current_stock(self) -> Decimal:
        from django.db.models import Sum
        return self.variants.aggregate(
            total=Sum('inventory_balances__available_quantity')
        )['total'] or Decimal('0.0000')

    def is_low_stock(self) -> bool:
        return any(variant.is_low_stock() for variant in self.variants.all())

    def get_display_name(self) -> str:
        return self.name

    def update_rating(self, new_rating: Decimal) -> None:
        if not (0 <= new_rating <= 5):
            raise ValidationError(_('Rating must be between 0 and 5.'))
        total_ratings = self.review_count + 1
        current_total = self.average_rating * self.review_count
        new_average = (current_total + new_rating) / total_ratings
        self.average_rating = round(new_average, 2)
        self.review_count = total_ratings
        self.save(update_fields=['average_rating', 'review_count'])

    def __str__(self):
        return f"{self.item_group.store_group.code} - {self.name}"

class ItemVariant(AuditableModel):
    """Variant-specific data for items."""
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='variants',
        verbose_name=_("Base Item")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Variant Code/SKU")
    )
    attributes = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Attributes")  # e.g., {"size": "M", "color": "Red"}
    )
    shelf_location = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Shelf Location")
    )
    weight = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        validators=[validate_positive_decimal],
        verbose_name=_("Weight")
    )
    volume = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        validators=[validate_positive_decimal],
        verbose_name=_("Volume")
    )
    standard_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Standard Cost")
    )
    sales_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Sales Price")
    )
    wholesale_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Wholesale Price")
    )
    minimum_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Minimum Price")
    )
    maximum_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Maximum Price")
    )
    reorder_level = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Reorder Level")
    )
    maximum_stock = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Maximum Stock")
    )
    minimum_order_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('1.0000'),
        validators=[MinValueValidator(Decimal('0.0001'))],
        verbose_name=_("Minimum Order Quantity")
    )

    class Meta:
        verbose_name = _("Item Variant")
        verbose_name_plural = _("Item Variants")
        unique_together = [['item', 'code']]
        indexes = [
            models.Index(fields=['item', 'code']),
            models.Index(fields=['sales_price']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(reorder_level__lte=models.F('maximum_stock')),
                name='variant_reorder_lte_max_stock'
            ),
            models.CheckConstraint(
                check=models.Q(minimum_order_quantity__gt=0),
                name='variant_positive_minimum_order_quantity'
            ),
        ]

    def clean(self):
        super().clean()
        if self.item.item_type == Item.ItemType.SERVICE and self.attributes:
            raise ValidationError(_('Services typically do not have variants.'))
        if self.minimum_price > 0 and self.maximum_price > 0 and self.minimum_price >= self.maximum_price:
            raise ValidationError({'maximum_price': _('Maximum price must be greater than minimum price.')})
        if self.sales_price > 0:
            if self.minimum_price > 0 and self.sales_price < self.minimum_price:
                raise ValidationError({'sales_price': _('Sales price cannot be less than minimum price.')})
            if self.maximum_price > 0 and self.sales_price > self.maximum_price:
                raise ValidationError({'sales_price': _('Sales price cannot be greater than maximum price.')})
        if self.reorder_level > 0 and self.maximum_stock > 0 and self.reorder_level >= self.maximum_stock:
            raise ValidationError({'maximum_stock': _('Maximum stock must be greater than reorder level.')})

    def calculate_selling_price(self, cost: Decimal = None) -> Decimal:
        cost = cost or self.standard_cost
        if cost > 0 and self.item.markup_percentage > 0:
            markup_amount = cost * (self.item.markup_percentage / 100)
            calculated_price = cost + markup_amount
            if self.minimum_price > 0:
                calculated_price = max(calculated_price, self.minimum_price)
            if self.maximum_price > 0:
                calculated_price = min(calculated_price, self.maximum_price)
            return calculated_price
        return self.sales_price

    def get_current_stock(self) -> Decimal:
        from django.db.models import Sum
        return self.inventory_balances.aggregate(
            total=Sum('available_quantity')
        )['total'] or Decimal('0.0000')

    def is_low_stock(self) -> bool:
        if self.reorder_level > 0:
            current_stock = self.get_current_stock()
            return current_stock <= self.reorder_level
        return False

    def __str__(self):
        attr_str = " ".join([f"{k}:{v}" for k, v in self.attributes.items()]) if self.attributes else ""
        return f"{self.item.item_group.store_group.code} - {self.item.name} ({attr_str})".strip()

class ItemUnit(AuditableModel):
    """Multiple units of measure for item variants."""
    variant = models.ForeignKey(
        ItemVariant,
        on_delete=models.CASCADE,
        related_name='units',
        verbose_name=_("Item Variant")
    )
    code = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=50,
        verbose_name=_("Name")
    )
    conversion_factor = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[MinValueValidator(Decimal('0.00000001'))],
        verbose_name=_("Conversion Factor")
    )
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Price")
    )
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Cost")
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Default Unit")
    )
    is_purchase_unit = models.BooleanField(
        default=False,
        verbose_name=_("Purchase Unit")
    )
    is_sales_unit = models.BooleanField(
        default=True,
        verbose_name=_("Sales Unit")
    )

    class Meta:
        verbose_name = _("Item Unit")
        verbose_name_plural = _("Item Units")
        unique_together = [['variant', 'code']]
        indexes = [
            models.Index(fields=['variant', 'code']),
            models.Index(fields=['is_default']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(conversion_factor__gt=0),
                name='positive_conversion_factor'
            )
        ]

    def clean(self):
        super().clean()
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if self.is_default:
            # Ensure only one default per variant
            existing_defaults = ItemUnit.objects.filter(variant=self.variant, is_default=True).exclude(pk=self.pk)
            if existing_defaults.exists():
                raise ValidationError({'is_default': _('Only one default unit allowed per variant.')})

    def convert_to_base_units(self, quantity: Decimal) -> Decimal:
        return quantity * self.conversion_factor

    def convert_from_base_units(self, base_quantity: Decimal) -> Decimal:
        return base_quantity / self.conversion_factor

    def __str__(self):
        return f"{self.variant.code} - {self.code}"

class ItemBarcode(AuditableModel):
    """Barcodes for item variants and their units."""
    variant = models.ForeignKey(
        ItemVariant,
        on_delete=models.CASCADE,
        related_name='barcodes',
        verbose_name=_("Item Variant")
    )
    barcode = models.CharField(
        max_length=50,
        verbose_name=_("Barcode"),
    )
    barcode_type = models.CharField(
        max_length=20,
        choices=[
            ('ean13', _('EAN-13')),
            ('ean8', _('EAN-8')),
            ('upc', _('UPC')),
            ('code128', _('Code 128')),
            ('code39', _('Code 39')),
            ('qr', _('QR Code')),
            ('other', _('Other')),
        ],
        default='ean13',
        verbose_name=_("Barcode Type")
    )
    unit = models.ForeignKey(
        ItemUnit,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='barcodes',
        verbose_name=_("Unit")
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_("Primary Barcode")
    )

    class Meta:
        verbose_name = _("Item Barcode")
        verbose_name_plural = _("Item Barcodes")
        unique_together = [['variant', 'barcode']]
        indexes = [
            models.Index(fields=['variant', 'barcode']),
            models.Index(fields=['is_primary']),
        ]

    def clean(self):
        super().clean()
        if not self.barcode.strip():
            raise ValidationError({'barcode': _('Barcode cannot be empty.')})
        if self.unit and self.unit.variant != self.variant:
            raise ValidationError({'unit': _('Unit must belong to the same variant.')})
        if self.is_primary:
            # Ensure only one primary per variant
            existing_primaries = ItemBarcode.objects.filter(variant=self.variant, is_primary=True).exclude(pk=self.pk)
            if existing_primaries.exists():
                raise ValidationError({'is_primary': _('Only one primary barcode allowed per variant.')})

    def __str__(self):
        return f"{self.variant.code} - {self.barcode}"


class ItemReview(AuditableModel):
    class FitChoices(models.TextChoices):
        TOO_SMALL = 'too_small', _('Too Small')
        FITS_WELL = 'fits_well', _('Fits Well')
        TOO_BIG = 'too_big', _('Too Big')

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_("Item")
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='item_reviews',
        verbose_name=_("User")
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Rating")
    )
    comment = models.TextField(
        blank=True,
        verbose_name=_("Comment")
    )
    images = models.ManyToManyField(
        Media,
        blank=True,
        related_name='item_review_images',
        verbose_name=_("Images")
    )
    is_verified_purchase = models.BooleanField(
        default=False,
        verbose_name=_("Verified Purchase")
    )
    helpful_votes = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Helpful Votes")
    )
    fit = models.CharField(
        max_length=20,
        choices=FitChoices.choices,
        blank=True,
        verbose_name=_("Fit")
    )
    reviewer_height = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Reviewer Height")
    )
    reviewer_weight = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Reviewer Weight")
    )
    is_anonymous = models.BooleanField(
        default=False,
        verbose_name=_("Anonymous Review")
    )

    class Meta:
        verbose_name = _("Item Review")
        verbose_name_plural = _("Item Reviews")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['item', 'created_at']),
            models.Index(fields=['user', 'item']),
            models.Index(fields=['rating', 'helpful_votes']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name='valid_review_rating'
            ),
        ]

    def clean(self):
        super().clean()
        if self.rating < 1 or self.rating > 5:
            raise ValidationError({'rating': _('Rating must be between 1 and 5.')})
        if self.images.exists() and any(media.media_type != 'image' for media in self.images.all()):
            raise ValidationError({'images': _('Only image media types are allowed for reviews.')})

    def save(self, *args, **kwargs):
        from apps.core_apps.utils import Logger
        logger = Logger(__name__, user=self.user, branch_id=self.item.branch.id if self.item else None)
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            try:
                self.item.update_rating(Decimal(str(self.rating)))
                logger.info(f"New review added for item {self.item.name}",
                           extra={'review_id': self.id, 'item_id': self.item.id, 'rating': self.rating})
            except Exception as e:
                logger.error(f"Error updating item rating after review save: {str(e)}",
                            extra={'review_id': self.id, 'item_id': self.item.id}, exc_info=True)

    def vote_helpful(self):
        """Increment helpful votes."""
        self.helpful_votes += 1
        self.save(update_fields=['helpful_votes'])

    def __str__(self):
        return f"Review for {self.item.name} by {self.user.get_full_name() if self.user and not self.is_anonymous else 'Anonymous'} - Rating: {self.rating}"

class InventoryBalance(AuditableModel):
    """Current inventory balances by item variant, location, batch, and expiry."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='inventory_balances',
        verbose_name=_("Branch")
    )
    variant = models.ForeignKey(
        ItemVariant,
        on_delete=models.CASCADE,
        related_name='inventory_balances',
        verbose_name=_("Item Variant")
    )
    location = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Location")
    )
    batch_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Batch Number")
    )
    expiry_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Expiry Date")
    )
    available_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        verbose_name=_("Available Quantity")
    )
    reserved_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Reserved Quantity")
    )
    average_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Average Cost")
    )
    last_movement_date = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Last Movement Date")
    )

    class Meta:
        verbose_name = _("Inventory Balance")
        verbose_name_plural = _("Inventory Balances")
        unique_together = [['branch', 'variant', 'location', 'batch_number', 'expiry_date']]
        indexes = [
            models.Index(fields=['branch', 'variant']),
            models.Index(fields=['expiry_date', 'batch_number']),
            models.Index(fields=['available_quantity', 'last_movement_date']),
            models.Index(fields=['variant', 'expiry_date']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(reserved_quantity__gte=0),
                name='non_negative_reserved_quantity'
            )
        ]

    def clean(self):
        super().clean()
        if self.variant.item.track_expiry and not self.expiry_date:
            raise ValidationError({'expiry_date': _('Expiry date is required for items that track expiry.')})
        if self.variant.item.track_batches and not self.batch_number:
            raise ValidationError({'batch_number': _('Batch number is required for items that track batches.')})

    def is_expired(self) -> bool:
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False

    def is_near_expiry(self) -> bool:
        if self.expiry_date:
            warning_date = timezone.now().date() + timezone.timedelta(days=self.variant.item.expiry_warning_days)
            return self.expiry_date <= warning_date and not self.is_expired()
        return False

    def get_total_quantity(self) -> Decimal:
        return self.available_quantity + self.reserved_quantity

    def __str__(self):
        parts = [f"{self.variant.item.item_group.store_group.code} - {self.variant.code}"]
        if self.batch_number:
            parts.append(f"Batch: {self.batch_number}")
        if self.expiry_date:
            parts.append(f"Exp: {self.expiry_date}")
        return " - ".join(parts)