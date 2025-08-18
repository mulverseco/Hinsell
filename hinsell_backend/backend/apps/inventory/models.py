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
    """Item master data with e-commerce and pharmaceutical features."""
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
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
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
    shelf_location = models.CharField(
        max_length=50,
        blank=True,
        null=True,
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
    manufacturer = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Manufacturer")
    )
    brand = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Brand")
    )
    size = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Size")
    )
    color = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Color")
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
    is_service_item = models.BooleanField(
        default=False,
        verbose_name=_("Service Item")
    )
    track_expiry = models.BooleanField(
        default=True,
        verbose_name=_("Track Expiry")
    )
    track_batches = models.BooleanField(
        default=True,
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

    class Meta:
        verbose_name = _("Item")
        verbose_name_plural = _("Items")
        indexes = [
            models.Index(fields=['branch', 'code']),
            models.Index(fields=['item_group', 'slug']),
            models.Index(fields=['is_featured', 'visibility', 'average_rating']),
            models.Index(fields=['manufacturer', 'brand']),
            models.Index(fields=['size', 'color']),
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
                check=models.Q(minimum_order_quantity__gt=0),
                name='item_positive_minimum_order_quantity'
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
        if cost > 0 and self.markup_percentage > 0:
            markup_amount = cost * (self.markup_percentage / 100)
            calculated_price = cost + markup_amount
            if self.minimum_price > 0:
                calculated_price = max(calculated_price, self.minimum_price)
            if self.maximum_price > 0:
                calculated_price = min(calculated_price, self.maximum_price)
            return calculated_price
        return self.sales_price

    def get_current_stock(self) -> Decimal:
        balance = InventoryBalance.objects.filter(
            item=self
        ).aggregate(
            total=models.Sum('available_quantity')
        )['total']
        return balance or Decimal('0.0000')

    def is_low_stock(self) -> bool:
        logger = Logger(__name__, branch_id=self.branch.id)
        if self.reorder_level > 0:
            current_stock = self.get_current_stock()
            if current_stock <= self.reorder_level:
                self.notify_low_stock(current_stock)
                logger.info(f"Low stock detected for item {self.code}", 
                           extra={'item_id': self.id, 'current_stock': str(current_stock)})
                return True
        return False

    def notify_low_stock(self, current_stock: Decimal):
        """Send notification for low stock."""
        from apps.core_apps.services.messaging_service import MessagingService
        logger = Logger(__name__, branch_id=self.branch.id)
        try:
            service = MessagingService(self.branch)
            service.send_notification(
                recipient=None,
                notification_type='low_stock',
                context_data={
                    'item_code': self.code,
                    'item_name': self.name,
                    'current_stock': str(current_stock),
                    'reorder_level': str(self.reorder_level),
                    'email': self.branch.email
                },
                channel='email',
                priority='high'
            )
            logger.info(f"Low stock notification sent for item {self.code}", 
                       extra={'item_id': self.id, 'notification_type': 'low_stock'})
        except Exception as e:
            logger.error(f"Error sending low stock notification for item {self.code}: {str(e)}", 
                        extra={'item_id': self.id, 'notification_type': 'low_stock'}, exc_info=True)

    def get_display_name(self) -> str:
        return self.name

    def update_rating(self, new_rating: Decimal) -> None:
        logger = Logger(__name__, branch_id=self.branch.id)
        if not (0 <= new_rating <= 5):
            raise ValidationError(_('Rating must be between 0 and 5.'))
        total_ratings = self.review_count + 1
        current_total = self.average_rating * self.review_count
        new_average = (current_total + new_rating) / total_ratings
        self.average_rating = round(new_average, 2)
        self.review_count = total_ratings
        self.save(update_fields=['average_rating', 'review_count'])
        logger.info(f"Updated rating for item {self.code}", 
                   extra={'item_id': self.id, 'new_rating': str(new_rating), 'average_rating': str(self.average_rating)})

    def __str__(self):
        return f"{self.item_group.store_group.code} - {self.code} - {self.name}"

class ItemUnit(AuditableModel):
    """Multiple units of measure for item variants."""
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='units',
        verbose_name=_("Item")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
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
        unique_together = [['item', 'code']]
        indexes = [
            models.Index(fields=['item', 'code']),
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

    def convert_to_base_units(self, quantity: Decimal) -> Decimal:
        return quantity * self.conversion_factor

    def convert_from_base_units(self, base_quantity: Decimal) -> Decimal:
        return base_quantity / self.conversion_factor

    def __str__(self):
        return f"{self.item.code} - {self.code}"

class ItemBarcode(AuditableModel):
    """Barcodes for item variants and their units."""
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='barcodes',
        verbose_name=_("Item")
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
        unique_together = [['item', 'barcode']]
        indexes = [
            models.Index(fields=['item', 'barcode']),
            models.Index(fields=['is_primary']),
        ]


    def clean(self):
        super().clean()
        if not self.barcode.strip():
            raise ValidationError({'barcode': _('Barcode cannot be empty.')})
        if self.unit and self.unit.item != self.item:
            raise ValidationError({'unit': _('Unit must belong to the same item.')})

    def __str__(self):
        return f"{self.item.code} - {self.barcode}"

class InventoryBalance(AuditableModel):
    """Current inventory balances by item variant, location, batch, and expiry."""
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='inventory_balances',
        verbose_name=_("Branch")
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='inventory_balances',
        verbose_name=_("Item")
    )
    location = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Location")
    )
    batch_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
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
        unique_together = [['branch', 'item', 'location', 'batch_number', 'expiry_date']]
        indexes = [
            models.Index(fields=['branch', 'item']),
            models.Index(fields=['expiry_date', 'batch_number']),
            models.Index(fields=['available_quantity', 'last_movement_date']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(reserved_quantity__gte=0),
                name='non_negative_reserved_quantity'
            )
        ]

    def clean(self):
        super().clean()
        if self.item.track_expiry and not self.expiry_date:
            raise ValidationError({'expiry_date': _('Expiry date is required for items that track expiry.')})
        if self.item.track_batches and not self.batch_number:
            raise ValidationError({'batch_number': _('Batch number is required for items that track batches.')})

    def is_expired(self) -> bool:
        logger = Logger(__name__, branch_id=self.branch.id)
        if self.expiry_date:
            is_expired = self.expiry_date < timezone.now().date()
            if is_expired:
                self.notify_expiry()
                logger.info(f"Expired stock detected for batch {self.batch_number}", 
                           extra={'item_id': self.item.id, 'batch_number': self.batch_number})
            return is_expired
        return False

    def is_near_expiry(self) -> bool:
        logger = Logger(__name__, branch_id=self.branch.id)
        if self.expiry_date:
            warning_date = timezone.now().date() + timezone.timedelta(days=self.item.expiry_warning_days)
            is_near = self.expiry_date <= warning_date
            if is_near and not self.is_expired():
                self.notify_near_expiry()
                logger.info(f"Near-expiry stock detected for batch {self.batch_number}", 
                           extra={'item_id': self.item.id, 'batch_number': self.batch_number})
            return is_near
        return False

    def notify_expiry(self):
        """Send notification for expired stock."""
        from apps.core_apps.services.messaging_service import MessagingService
        logger = Logger(__name__, branch_id=self.branch.id)
        try:
            service = MessagingService(self.branch)
            service.send_notification(
                recipient=None,
                notification_type='expired_stock',
                context_data={
                    'item_code': self.item.code,
                    'batch_number': self.batch_number,
                    'expiry_date': str(self.expiry_date),
                    'available_quantity': str(self.available_quantity),
                    'email': self.branch.email
                },
                channel='email',
                priority='urgent'
            )
            logger.info(f"Expiry notification sent for batch {self.batch_number} of item {self.item.code}", 
                       extra={'item_id': self.item.id, 'notification_type': 'expired_stock'})
        except Exception as e:
            logger.error(f"Error sending expiry notification for batch {self.batch_number}: {str(e)}", 
                        extra={'item_id': self.item.id, 'notification_type': 'expired_stock'}, exc_info=True)

    def notify_near_expiry(self):
        """Send notification for near-expiry stock."""
        from apps.core_apps.services.messaging_service import MessagingService
        logger = Logger(__name__, branch_id=self.branch.id)
        try:
            service = MessagingService(self.branch)
            service.send_notification(
                recipient=None,
                notification_type='near_expiry_stock',
                context_data={
                    'item_code': self.item.code,
                    'batch_number': self.batch_number,
                    'expiry_date': str(self.expiry_date),
                    'available_quantity': str(self.available_quantity),
                    'warning_days': self.item.expiry_warning_days,
                    'email': self.branch.email
                },
                channel='email',
                priority='high'
            )
            logger.info(f"Near-expiry notification sent for batch {self.batch_number} of item {self.item.code}", 
                       extra={'item_id': self.item.id, 'notification_type': 'near_expiry_stock'})
        except Exception as e:
            logger.error(f"Error sending near-expiry notification for batch {self.batch_number}: {str(e)}", 
                        extra={'item_id': self.item.id, 'notification_type': 'near_expiry_stock'}, exc_info=True)

    def get_total_quantity(self) -> Decimal:
        return self.available_quantity + self.reserved_quantity

    def __str__(self):
        parts = [f"{self.item.item_group.store_group.code} - {self.item.code}"]
        if self.batch_number:
            parts.append(f"Batch: {self.batch_number}")
        if self.expiry_date:
            parts.append(f"Exp: {self.expiry_date}")
        return " - ".join(parts)