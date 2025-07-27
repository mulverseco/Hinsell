"""
Inventory management models including items, categories, units, and stock tracking.
Handles all inventory-related data with comprehensive validation and features.
"""
import logging
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.core_apps.general import AuditableModel
from apps.core_apps.validators import validate_positive_decimal, validate_percentage
from apps.organization.models import Branch
from apps.accounting.models import Account

logger = logging.getLogger(__name__)


class StoreGroup(AuditableModel):
    """
    Store group for inventory categorization and costing methods.
    """
    
    class CostMethod(models.TextChoices):
        AVERAGE = 'average', _('Average Cost')
        FIFO = 'fifo', _('First In, First Out')
        LIFO = 'lifo', _('Last In, First Out')
        STANDARD = 'standard', _('Standard Cost')
    
    branch = models.ForeignKey(
        'organization.Branch',
        on_delete=models.CASCADE,
        related_name='store_groups',
        verbose_name=_("Branch")
    )
    
    store_group_code = models.CharField(
        max_length=20,
        verbose_name=_("Store Group Code"),
        help_text=_("Unique store group code")
    )
    
    store_group_name = models.CharField(
        max_length=100,
        verbose_name=_("Store Group Name"),
        help_text=_("Store group display name")
    )
    
    cost_method = models.CharField(
        max_length=10,
        choices=CostMethod.choices,
        default=CostMethod.AVERAGE,
        verbose_name=_("Cost Method"),
        help_text=_("Inventory costing method")
    )
    
    # Default accounts for this store group
    stock_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_store_groups',
        verbose_name=_("Stock Account"),
        help_text=_("Default stock/inventory account")
    )
    
    sales_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales_store_groups',
        verbose_name=_("Sales Account"),
        help_text=_("Default sales account")
    )
    
    cost_of_sales_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cost_store_groups',
        verbose_name=_("Cost of Sales Account"),
        help_text=_("Default cost of sales account")
    )
    
    class Meta:
        verbose_name = _("Store Group")
        verbose_name_plural = _("Store Groups")
        unique_together = [
            ['branch', 'store_group_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['store_group_code']),
            models.Index(fields=['is_active']),
        ]
    
    def clean(self):
        """Custom validation for store group."""
        super().clean()
        
        if not self.store_group_code.strip():
            raise ValidationError({
                'store_group_code': _('Store group code cannot be empty.')
            })
        
        if not self.store_group_name.strip():
            raise ValidationError({
                'store_group_name': _('Store group name cannot be empty.')
            })
    
    def __str__(self):
        return f"{self.store_group_code} - {self.store_group_name}"


class ItemGroup(AuditableModel):
    """
    Item group categorization with hierarchical structure.
    """
    
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
        verbose_name=_("Store Group"),
        help_text=_("Parent store group")
    )
    
    item_group_code = models.CharField(
        max_length=20,
        verbose_name=_("Item Group Code"),
        help_text=_("Unique item group code")
    )
    
    item_group_name = models.CharField(
        max_length=100,
        verbose_name=_("Item Group Name"),
        help_text=_("Item group display name")
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_("Parent Group"),
        help_text=_("Parent item group in hierarchy")
    )
    
    group_type = models.CharField(
        max_length=10,
        choices=GroupType.choices,
        default=GroupType.PRODUCT,
        verbose_name=_("Group Type"),
        help_text=_("Type of items in this group")
    )
    
    # Default account for this item group
    default_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='item_groups',
        verbose_name=_("Default Account"),
        help_text=_("Default account for items in this group")
    )
    
    # Image for the group
    image = models.ImageField(
        upload_to='item_groups/',
        blank=True,
        null=True,
        verbose_name=_("Group Image"),
        help_text=_("Image representing this item group")
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Description of this item group")
    )
    
    class Meta:
        verbose_name = _("Item Group")
        verbose_name_plural = _("Item Groups")
        unique_together = [
            ['branch', 'item_group_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['store_group']),
            models.Index(fields=['parent']),
            models.Index(fields=['item_group_code']),
            models.Index(fields=['group_type']),
            models.Index(fields=['is_active']),
        ]
    
    def clean(self):
        """Custom validation for item group."""
        super().clean()
        
        if not self.item_group_code.strip():
            raise ValidationError({
                'item_group_code': _('Item group code cannot be empty.')
            })
        
        if not self.item_group_name.strip():
            raise ValidationError({
                'item_group_name': _('Item group name cannot be empty.')
            })
        
        # Prevent circular parent relationships
        if self.parent:
            current = self.parent
            while current:
                if current == self:
                    raise ValidationError({
                        'parent': _('Circular parent relationship detected.')
                    })
                current = current.parent
        
        if self.parent and self.parent.store_group != self.store_group:
            raise ValidationError({
                'parent': _('Parent group must belong to the same store group.')
            })
    
    def get_full_code(self) -> str:
        """Get full hierarchical item group code."""
        if self.parent:
            return f"{self.parent.get_full_code()}.{self.item_group_code}"
        return self.item_group_code
    
    def get_level(self) -> int:
        """Get item group level in hierarchy."""
        level = 0
        current = self.parent
        while current:
            level += 1
            current = current.parent
        return level
    
    def __str__(self):
        return f"{self.item_group_code} - {self.item_group_name}"


class Item(AuditableModel):
    """
    Enhanced item master data with comprehensive features for pharmaceutical inventory.
    """
    
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
        verbose_name=_("Item Group"),
        help_text=_("Item group this item belongs to")
    )
    
    item_code = models.CharField(
        max_length=50,
        verbose_name=_("Item Code"),
        help_text=_("Unique item code/SKU")
    )
    
    item_name = models.CharField(
        max_length=200,
        verbose_name=_("Item Name"),
        help_text=_("Item display name")
    )
    
    item_name_english = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Item Name (English)"),
        help_text=_("Item name in English")
    )
    
    item_type = models.CharField(
        max_length=10,
        choices=ItemType.choices,
        default=ItemType.PRODUCT,
        verbose_name=_("Item Type"),
        help_text=_("Type of item")
    )
    
    # Basic unit information
    base_unit = models.CharField(
        max_length=20,
        verbose_name=_("Base Unit"),
        help_text=_("Base unit of measure (e.g., piece, box, bottle)")
    )
    
    # Physical attributes
    shelf_location = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Shelf Location"),
        help_text=_("Physical location in warehouse/store")
    )
    
    attributes = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Attributes"),
        help_text=_("Physical attributes (size, color, etc.)")
    )
    
    weight = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        validators=[validate_positive_decimal],
        verbose_name=_("Weight"),
        help_text=_("Item weight in kg")
    )
    
    volume = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        validators=[validate_positive_decimal],
        verbose_name=_("Volume"),
        help_text=_("Item volume in liters")
    )
    
    # Manufacturer information
    manufacturer = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Manufacturer"),
        help_text=_("Item manufacturer")
    )
    
    brand = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Brand"),
        help_text=_("Item brand name")
    )
    
    model_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Model Number"),
        help_text=_("Manufacturer model number")
    )
    
    # Pharmaceutical-specific fields
    scientific_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Scientific Name"),
        help_text=_("Scientific/generic name of the drug")
    )
    
    active_ingredient = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Active Ingredient"),
        help_text=_("Active pharmaceutical ingredient")
    )
    
    strength = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Strength"),
        help_text=_("Drug strength/concentration")
    )
    
    dosage_form = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Dosage Form"),
        help_text=_("Form of medication (tablet, capsule, syrup, etc.)")
    )
    
    route_of_administration = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Route of Administration"),
        help_text=_("How the medication is administered")
    )
    
    # Medical information
    indications = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Indications"),
        help_text=_("Medical conditions this drug treats")
    )
    
    contraindications = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Contraindications"),
        help_text=_("Conditions where this drug should not be used")
    )
    
    side_effects = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Side Effects"),
        help_text=_("Known side effects and adverse reactions")
    )
    
    precautions = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Precautions"),
        help_text=_("Precautions and warnings")
    )
    
    drug_interactions = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Drug Interactions"),
        help_text=_("Known drug interactions")
    )
    
    storage_conditions = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Storage Conditions"),
        help_text=_("Required storage conditions")
    )
    
    # Pricing information
    standard_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Standard Cost"),
        help_text=_("Standard/average cost per base unit")
    )
    
    last_purchase_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Last Purchase Cost"),
        help_text=_("Cost from last purchase")
    )
    
    sales_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Sales Price"),
        help_text=_("Standard sales price per base unit")
    )
    
    wholesale_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Wholesale Price"),
        help_text=_("Wholesale price per base unit")
    )
    
    minimum_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Minimum Price"),
        help_text=_("Minimum allowed selling price")
    )
    
    maximum_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Maximum Price"),
        help_text=_("Maximum allowed selling price")
    )
    
    # Inventory control
    reorder_level = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Reorder Level"),
        help_text=_("Minimum stock level before reordering")
    )
    
    maximum_stock = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Maximum Stock"),
        help_text=_("Maximum stock level to maintain")
    )
    
    minimum_order_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('1.0000'),
        validators=[MinValueValidator(Decimal('0.0001'))],
        verbose_name=_("Minimum Order Quantity"),
        help_text=_("Minimum quantity that can be ordered")
    )
    
    # Ratios and percentages
    markup_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Markup Percentage"),
        help_text=_("Standard markup percentage")
    )
    
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Discount Percentage"),
        help_text=_("Maximum discount percentage allowed")
    )
    
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("Commission Percentage"),
        help_text=_("Sales commission percentage")
    )
    
    vat_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[validate_percentage],
        verbose_name=_("VAT Percentage"),
        help_text=_("VAT tax percentage")
    )
    
    # Additional costs
    handling_fee = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Handling Fee"),
        help_text=_("Additional handling fee per unit")
    )
    
    # Control flags
    is_service_item = models.BooleanField(
        default=False,
        verbose_name=_("Service Item"),
        help_text=_("Whether this is a service item (no inventory tracking)")
    )
    
    track_expiry = models.BooleanField(
        default=True,
        verbose_name=_("Track Expiry"),
        help_text=_("Track expiration dates for this item")
    )
    
    track_batches = models.BooleanField(
        default=True,
        verbose_name=_("Track Batches"),
        help_text=_("Track batch numbers for this item")
    )
    
    allow_discount = models.BooleanField(
        default=True,
        verbose_name=_("Allow Discount"),
        help_text=_("Allow discounts on this item")
    )
    
    allow_bonus = models.BooleanField(
        default=True,
        verbose_name=_("Allow Bonus"),
        help_text=_("Allow bonus quantities for this item")
    )
    
    is_prescription_required = models.BooleanField(
        default=False,
        verbose_name=_("Prescription Required"),
        help_text=_("Whether prescription is required to sell this item")
    )
    
    is_controlled_substance = models.BooleanField(
        default=False,
        verbose_name=_("Controlled Substance"),
        help_text=_("Whether this is a controlled substance")
    )
    
    # Expiry warning
    expiry_warning_days = models.PositiveIntegerField(
        default=30,
        verbose_name=_("Expiry Warning Days"),
        help_text=_("Days before expiry to show warning")
    )
    
    # Images
    primary_image = models.ImageField(
        upload_to='items/primary/',
        blank=True,
        null=True,
        verbose_name=_("Primary Image"),
        help_text=_("Primary product image")
    )
    
    # Notes and descriptions
    description = models.TextField(
        blank=True,
        verbose_name=_("Description"),
        help_text=_("Detailed item description")
    )
    
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_("Internal Notes"),
        help_text=_("Internal notes (not visible to customers)")
    )
    
    class Meta:
        verbose_name = _("Item")
        verbose_name_plural = _("Items")
        unique_together = [
            ['branch', 'item_code']
        ]
        indexes = [
            models.Index(fields=['branch']),
            models.Index(fields=['item_group']),
            models.Index(fields=['item_code']),
            models.Index(fields=['item_name']),
            models.Index(fields=['manufacturer']),
            models.Index(fields=['brand']),
            models.Index(fields=['scientific_name']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_service_item']),
            models.Index(fields=['track_expiry']),
            models.Index(fields=['track_batches']),
            models.Index(fields=['is_prescription_required']),
            models.Index(fields=['is_controlled_substance']),
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
            )
        ]
    
    def clean(self):
        """Custom validation for item."""
        super().clean()
        
        if not self.item_code.strip():
            raise ValidationError({
                'item_code': _('Item code cannot be empty.')
            })
        
        if not self.item_name.strip():
            raise ValidationError({
                'item_name': _('Item name cannot be empty.')
            })
        
        if not self.base_unit.strip():
            raise ValidationError({
                'base_unit': _('Base unit cannot be empty.')
            })
        
        # Validate price relationships
        if self.minimum_price > 0 and self.maximum_price > 0:
            if self.minimum_price >= self.maximum_price:
                raise ValidationError({
                    'maximum_price': _('Maximum price must be greater than minimum price.')
                })
        
        if self.sales_price > 0:
            if self.minimum_price > 0 and self.sales_price < self.minimum_price:
                raise ValidationError({
                    'sales_price': _('Sales price cannot be less than minimum price.')
                })
            
            if self.maximum_price > 0 and self.sales_price > self.maximum_price:
                raise ValidationError({
                    'sales_price': _('Sales price cannot be greater than maximum price.')
                })
        
        # Validate inventory levels
        if self.reorder_level > 0 and self.maximum_stock > 0:
            if self.reorder_level >= self.maximum_stock:
                raise ValidationError({
                    'maximum_stock': _('Maximum stock must be greater than reorder level.')
                })
    
    def calculate_selling_price(self, cost: Decimal = None) -> Decimal:
        """Calculate selling price based on cost and markup."""
        if cost is None:
            cost = self.standard_cost or self.last_purchase_cost
        
        if cost > 0 and self.markup_percentage > 0:
            markup_amount = cost * (self.markup_percentage / 100)
            calculated_price = cost + markup_amount
            
            # Apply price limits
            if self.minimum_price > 0:
                calculated_price = max(calculated_price, self.minimum_price)
            
            if self.maximum_price > 0:
                calculated_price = min(calculated_price, self.maximum_price)
            
            return calculated_price
        
        return self.sales_price
    
    def get_current_stock(self) -> Decimal:
        """Get current stock quantity from inventory."""
        from apps.inventory.models import InventoryBalance
        
        balance = InventoryBalance.objects.filter(
            branch=self.branch,
            item=self
        ).aggregate(
            total=models.Sum('available_quantity')
        )['total']
        
        return balance or Decimal('0.0000')
    
    def is_low_stock(self) -> bool:
        """Check if item is below reorder level."""
        if self.reorder_level > 0:
            current_stock = self.get_current_stock()
            return current_stock <= self.reorder_level
        return False
    
    def get_display_name(self) -> str:
        """Get display name with scientific name if available."""
        if self.scientific_name:
            return f"{self.item_name} ({self.scientific_name})"
        return self.item_name
    
    def __str__(self):
        return f"{self.item_code} - {self.item_name}"


class ItemUnit(AuditableModel):
    """
    Multiple units of measure for items with conversion factors.
    """
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='units',
        verbose_name=_("Item")
    )
    
    unit_code = models.CharField(
        max_length=20,
        verbose_name=_("Unit Code"),
        help_text=_("Unit code (e.g., BOX, STRIP, PIECE)")
    )
    
    unit_name = models.CharField(
        max_length=50,
        verbose_name=_("Unit Name"),
        help_text=_("Full unit name")
    )
    
    conversion_factor = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('1.00000000'),
        validators=[MinValueValidator(Decimal('0.00000001'))],
        verbose_name=_("Conversion Factor"),
        help_text=_("Number of base units in this unit")
    )
    
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Price"),
        help_text=_("Sales price for this unit")
    )
    
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Unit Cost"),
        help_text=_("Cost for this unit")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Default Unit"),
        help_text=_("Whether this is the default selling unit")
    )
    
    is_purchase_unit = models.BooleanField(
        default=False,
        verbose_name=_("Purchase Unit"),
        help_text=_("Whether this unit can be used for purchasing")
    )
    
    is_sales_unit = models.BooleanField(
        default=True,
        verbose_name=_("Sales Unit"),
        help_text=_("Whether this unit can be used for sales")
    )
    
    class Meta:
        verbose_name = _("Item Unit")
        verbose_name_plural = _("Item Units")
        unique_together = [
            ['item', 'unit_code']
        ]
        indexes = [
            models.Index(fields=['item']),
            models.Index(fields=['unit_code']),
            models.Index(fields=['is_default']),
            models.Index(fields=['is_active']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(conversion_factor__gt=0),
                name='positive_conversion_factor'
            )
        ]
    
    def clean(self):
        """Custom validation for item unit."""
        super().clean()
        
        if not self.unit_code.strip():
            raise ValidationError({
                'unit_code': _('Unit code cannot be empty.')
            })
        
        if not self.unit_name.strip():
            raise ValidationError({
                'unit_name': _('Unit name cannot be empty.')
            })
    
    def save(self, *args, **kwargs):
        """Override save to handle default unit logic."""
        if self.is_default:
            ItemUnit.objects.filter(
                item=self.item,
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        
        super().save(*args, **kwargs)
    
    def convert_to_base_units(self, quantity: Decimal) -> Decimal:
        """Convert quantity from this unit to base units."""
        return quantity * self.conversion_factor
    
    def convert_from_base_units(self, base_quantity: Decimal) -> Decimal:
        """Convert quantity from base units to this unit."""
        return base_quantity / self.conversion_factor
    
    def __str__(self):
        return f"{self.item.item_code} - {self.unit_code}"


class ItemBarcode(AuditableModel):
    """
    Multiple barcodes for items and their units.
    """
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='barcodes',
        verbose_name=_("Item")
    )
    
    barcode = models.CharField(
        max_length=50,
        verbose_name=_("Barcode"),
        help_text=_("Barcode value")
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
        verbose_name=_("Barcode Type"),
        help_text=_("Type of barcode")
    )
    
    unit = models.ForeignKey(
        ItemUnit,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='barcodes',
        verbose_name=_("Unit"),
        help_text=_("Unit this barcode represents (if specific)")
    )
    
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_("Primary Barcode"),
        help_text=_("Whether this is the primary barcode for the item")
    )
    
    class Meta:
        verbose_name = _("Item Barcode")
        verbose_name_plural = _("Item Barcodes")
        unique_together = [
            ['item', 'barcode']
        ]
        indexes = [
            models.Index(fields=['barcode']),
            models.Index(fields=['item']),
            models.Index(fields=['is_primary']),
            models.Index(fields=['is_active']),
        ]
    
    def clean(self):
        """Custom validation for item barcode."""
        super().clean()
        
        if not self.barcode.strip():
            raise ValidationError({
                'barcode': _('Barcode cannot be empty.')
            })
        
        # Validate unit belongs to item
        if self.unit and self.unit.item != self.item:
            raise ValidationError({
                'unit': _('Unit must belong to the same item.')
            })
    
    def save(self, *args, **kwargs):
        """Override save to handle primary barcode logic."""
        if self.is_primary:
            ItemBarcode.objects.filter(
                item=self.item,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.item.item_code} - {self.barcode}"


class InventoryBalance(AuditableModel):
    """
    Current inventory balances by item, location, batch, and expiry.
    """
    branch = models.ForeignKey(
        'organization.Branch',
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
        verbose_name=_("Location"),
        help_text=_("Storage location within branch")
    )
    
    batch_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Batch Number"),
        help_text=_("Manufacturing batch number")
    )
    
    expiry_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Expiry Date"),
        help_text=_("Product expiration date")
    )
    
    available_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        verbose_name=_("Available Quantity"),
        help_text=_("Currently available quantity in base units")
    )
    
    reserved_quantity = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal('0.00000000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Reserved Quantity"),
        help_text=_("Quantity reserved for pending orders")
    )
    
    average_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name=_("Average Cost"),
        help_text=_("Average cost per base unit")
    )
    
    last_movement_date = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Last Movement Date"),
        help_text=_("Date of last inventory movement")
    )
    
    class Meta:
        verbose_name = _("Inventory Balance")
        verbose_name_plural = _("Inventory Balances")
        unique_together = [
            ['branch', 'item', 'location', 'batch_number', 'expiry_date']
        ]
        indexes = [
            models.Index(fields=['branch', 'item']),
            models.Index(fields=['item']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['batch_number']),
            models.Index(fields=['available_quantity']),
            models.Index(fields=['last_movement_date']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(reserved_quantity__gte=0),
                name='non_negative_reserved_quantity'
            )
        ]
    
    def clean(self):
        """Custom validation for inventory balance."""
        super().clean()
        
        # Validate expiry date for items that track expiry
        if self.item.track_expiry and not self.expiry_date:
            raise ValidationError({
                'expiry_date': _('Expiry date is required for items that track expiry.')
            })
        
        # Validate batch number for items that track batches
        if self.item.track_batches and not self.batch_number:
            raise ValidationError({
                'batch_number': _('Batch number is required for items that track batches.')
            })
    
    def is_expired(self) -> bool:
        """Check if this inventory is expired."""
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False
    
    def is_near_expiry(self) -> bool:
        """Check if this inventory is near expiry."""
        if self.expiry_date:
            warning_date = timezone.now().date() + timezone.timedelta(days=self.item.expiry_warning_days)
            return self.expiry_date <= warning_date
        return False
    
    def get_total_quantity(self) -> Decimal:
        """Get total quantity (available + reserved)."""
        return self.available_quantity + self.reserved_quantity
    
    def __str__(self):
        parts = [self.item.item_code]
        if self.batch_number:
            parts.append(f"Batch: {self.batch_number}")
        if self.expiry_date:
            parts.append(f"Exp: {self.expiry_date}")
        return " - ".join(parts)


class DrugInformation(AuditableModel):
    """Extended pharmaceutical information for drugs"""
    item = models.OneToOneField(Item, on_delete=models.CASCADE, related_name='drug_info')
    drug_class = models.CharField(max_length=100, blank=True)
    therapeutic_category = models.CharField(max_length=100, blank=True)
    pregnancy_category = models.CharField(max_length=10, blank=True)
    controlled_substance_schedule = models.CharField(max_length=10, blank=True)
    generic_available = models.BooleanField(default=False)
    refrigeration_required = models.BooleanField(default=False)
    narcotic = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Drug Information")
        verbose_name_plural = _("Drug Information")
        
        def __str__(self):
            return f"{self.item.item_name} - {self.drug_class}"



class SampleDistribution(AuditableModel):
    """Track sample distribution to doctors"""
    visit = models.ForeignKey('medical.DoctorVisit', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.ForeignKey(ItemUnit, on_delete=models.CASCADE)

    class Meta:
        unique_together = [['visit', 'item', 'unit']]
        
    def __str__(self):
        return f"{self.visit.doctor.name} - {self.item.item_name} ({self.quantity} {self.unit.unit_name})"