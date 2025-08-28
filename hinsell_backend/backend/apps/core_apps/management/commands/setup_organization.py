from datetime import date
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.utils.text import slugify
from apps.organization.models import Company, Branch
from apps.accounting.models import AccountType, Account, Currency
from apps.core_apps.utils import Logger
from apps.inventory.models import (
    StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit, 
    ItemBarcode, InventoryBalance, Attribute, AttributeValue, 
    VariantAttributeValue
)

User = get_user_model()
logger = Logger(__name__)

class Command(BaseCommand):
    help = 'Setup initial organization structure for e-commerce accounting system'

    def add_arguments(self, parser):
        parser.add_argument('--company-name', type=str, required=True, help='Company name')
        parser.add_argument('--admin-email', type=str, required=True, help='Admin user email')
        parser.add_argument('--admin-password', type=str, required=True, help='Admin user password')
        parser.add_argument('--country-code', type=str, default='US', help='Country code for currency')
        parser.add_argument('--fiscal-year', type=int, default=date.today().year, help='Current fiscal year')
        parser.add_argument('--create-sample-data', action='store_true', help='Create sample products and categories')

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.SUCCESS('Starting organization setup...'))
            
            # Create company
            company = self.create_company(options['company_name'])
            self.stdout.write(f'Created company: {company.company_name}')
            
            # Create primary branch
            branch = self.create_primary_branch(company, options['fiscal_year'])
            self.stdout.write(f'Created primary branch: {branch.branch_name}')
            
            # Setup currencies
            currencies = self.setup_currencies(branch, options['country_code'])
            self.stdout.write(f'Setup {len(currencies)} currencies')
            
            # Create account types
            account_types = self.create_account_types(branch)
            self.stdout.write(f'Created {len(account_types)} account types')
            
            # Create chart of accounts
            accounts = self.create_chart_of_accounts(branch, account_types, currencies[0])
            self.stdout.write(f'Created {len(accounts)} accounts')
            
            # Create admin user
            admin_user = self.create_admin_user(
                options['admin_email'], 
                options['admin_password'], 
                branch
            )
            self.stdout.write(f'Created admin user: {admin_user.email}')
            
            # Setup additional e-commerce tables
            self.setup_ecommerce_tables(branch)
            self.stdout.write('Setup additional e-commerce tables')
            
            # Create sample data if requested
            if options['create_sample_data']:
                self.create_sample_data(branch, currencies[0])
                self.stdout.write('Created sample products and categories')
            
            self.stdout.write(
                self.style.SUCCESS('Organization setup completed successfully!')
            )
            
        except Exception as e:
            logger.error(f"Organization setup failed: {str(e)}")
            self.stdout.write(
                self.style.ERROR(f'Setup failed: {str(e)}')
            )
            raise

    def create_company(self, company_name):
        """Create the main company"""
        company = Company.objects.create(
            company_name=company_name,
            company_name_english=company_name,
            industry='E-commerce',
            established_date=date.today(),
            description=f'{company_name} - E-commerce Platform'
        )
        return company

    def create_primary_branch(self, company, fiscal_year):
        """Create the primary branch"""
        branch = Branch.objects.create(
            company=company,
            branch_name=f'{company.company_name} - Main Branch',
            branch_name_english=f'{company.company_name} - Main Branch',
            is_primary=True,
            is_headquarters=True,
            fiscal_year_start_month=1,
            fiscal_year_end_month=12,
            current_fiscal_year=fiscal_year,
            use_cost_center=True,
            use_sales_tax=True,
            use_vat_tax=True,
            use_carry_fee=True,
            use_expire_date=True,
            use_batch_no=True,
            use_barcode=True,
            use_multi_currency=True,
            city='Main City',
            country='United States'
        )
        return branch

    def setup_currencies(self, branch, country_code='US'):
        """Setup default currencies"""
        currency_data = {
            'US': {'code': 'USD', 'name': 'US Dollar', 'symbol': '$'},
            'EU': {'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
            'GB': {'code': 'GBP', 'name': 'British Pound', 'symbol': '£'},
            'JP': {'code': 'JPY', 'name': 'Japanese Yen', 'symbol': '¥'},
            'CA': {'code': 'CAD', 'name': 'Canadian Dollar', 'symbol': 'C$'},
        }
        
        currencies = []
        
        # Create primary currency based on country
        primary_currency_data = currency_data.get(country_code, currency_data['US'])
        primary_currency = Currency.objects.create(
            branch=branch,
            code=primary_currency_data['code'],
            name=primary_currency_data['name'],
            symbol=primary_currency_data['symbol'],
            is_default=True,
            decimal_places=2,
            exchange_rate=Decimal('1.00000000')
        )
        currencies.append(primary_currency)
        
        # Add other major currencies
        for code, data in currency_data.items():
            if code != country_code:
                currency = Currency.objects.create(
                    branch=branch,
                    code=data['code'],
                    name=data['name'],
                    symbol=data['symbol'],
                    is_default=False,
                    decimal_places=2,
                    exchange_rate=Decimal('1.00000000')  # Will be updated by exchange rate service
                )
                currencies.append(currency)
        
        return currencies

    def create_account_types(self, branch):
        """Create standard account types for e-commerce"""
        account_types_data = [
            # الأصول
            {'name': 'الأصول المتداولة', 'category': 'asset', 'normal_balance': 'debit'},
            {'name': 'الأصول الثابتة', 'category': 'asset', 'normal_balance': 'debit'},
            {'name': 'الأصول غير الملموسة', 'category': 'asset', 'normal_balance': 'debit'},
            {'name': 'أصول أخرى', 'category': 'asset', 'normal_balance': 'debit'},
            
            # الالتزامات
            {'name': 'الالتزامات المتداولة', 'category': 'liability', 'normal_balance': 'credit'},
            {'name': 'الالتزامات طويلة الأجل', 'category': 'liability', 'normal_balance': 'credit'},
            {'name': 'التزامات أخرى', 'category': 'liability', 'normal_balance': 'credit'},
            
            # حقوق الملكية
            {'name': 'حقوق الملكية', 'category': 'equity', 'normal_balance': 'credit'},
            {'name': 'الأرباح المحتجزة', 'category': 'equity', 'normal_balance': 'credit'},
            
            # الإيرادات
            {'name': 'إيرادات المبيعات', 'category': 'revenue', 'normal_balance': 'credit'},
            {'name': 'إيرادات الخدمات', 'category': 'revenue', 'normal_balance': 'credit'},
            {'name': 'إيرادات أخرى', 'category': 'revenue', 'normal_balance': 'credit'},
            
            # المصروفات
            {'name': 'تكلفة البضاعة المباعة', 'category': 'expense', 'normal_balance': 'debit'},
            {'name': 'المصروفات التشغيلية', 'category': 'expense', 'normal_balance': 'debit'},
            {'name': 'المصروفات الإدارية', 'category': 'expense', 'normal_balance': 'debit'},
            {'name': 'المصروفات المالية', 'category': 'expense', 'normal_balance': 'debit'},
        ]

        
        account_types = []
        for data in account_types_data:
            account_type = AccountType.objects.create(
                branch=branch,
                name=data['name'],
                category=data['category'],
                normal_balance=data['normal_balance']
            )
            account_types.append(account_type)
        
        return account_types

    def create_chart_of_accounts(self, branch, account_types, default_currency):
        """Create comprehensive chart of accounts for e-commerce"""
        # Get account types by name for easier reference
        account_types_dict = {at.name: at for at in account_types}
        
        accounts_data = [
            # الأصول
            {'code': '1000', 'name': 'الأصول', 'type': 'الأصول المتداولة', 'is_header': True},        

            # الأصول المتداولة
            {'code': '1100', 'name': 'الأصول المتداولة', 'type': 'الأصول المتداولة', 'parent': '1000', 'is_header': True},
            {'code': '1110', 'name': 'النقد وما في حكمه', 'type': 'الأصول المتداولة', 'parent': '1100', 'nature': 'cash'},
            {'code': '1111', 'name': 'الصندوق', 'type': 'الأصول المتداولة', 'parent': '1110', 'nature': 'cash'},
            {'code': '1112', 'name': 'الحساب البنكي الرئيسي', 'type': 'الأصول المتداولة', 'parent': '1110', 'nature': 'bank'},
            {'code': '1113', 'name': 'حساب الرواتب', 'type': 'الأصول المتداولة', 'parent': '1110', 'nature': 'bank'},
            {'code': '1120', 'name': 'المدينون', 'type': 'الأصول المتداولة', 'parent': '1100', 'nature': 'customer'},
            {'code': '1121', 'name': 'العملاء', 'type': 'الأصول المتداولة', 'parent': '1120', 'nature': 'customer'},
            {'code': '1122', 'name': 'مدينون آخرون', 'type': 'الأصول المتداولة', 'parent': '1120'},
            {'code': '1130', 'name': 'المخزون', 'type': 'الأصول المتداولة', 'parent': '1100', 'nature': 'inventory'},
            {'code': '1131', 'name': 'مواد خام', 'type': 'الأصول المتداولة', 'parent': '1130', 'nature': 'inventory'},
            {'code': '1132', 'name': 'بضاعة تامة الصنع', 'type': 'الأصول المتداولة', 'parent': '1130', 'nature': 'inventory'},
            {'code': '1133', 'name': 'بضاعة تحت التشغيل', 'type': 'الأصول المتداولة', 'parent': '1130', 'nature': 'inventory'},        

            # الأصول الثابتة
            {'code': '1200', 'name': 'الأصول الثابتة', 'type': 'الأصول الثابتة', 'parent': '1000', 'is_header': True},
            {'code': '1210', 'name': 'العقارات والمعدات', 'type': 'الأصول الثابتة', 'parent': '1200', 'nature': 'fixed_asset'},
            {'code': '1211', 'name': 'الأراضي', 'type': 'الأصول الثابتة', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1212', 'name': 'المباني', 'type': 'الأصول الثابتة', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1213', 'name': 'المعدات', 'type': 'الأصول الثابتة', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1214', 'name': 'المركبات', 'type': 'الأصول الثابتة', 'parent': '1210', 'nature': 'fixed_asset'},        

            # الالتزامات
            {'code': '2000', 'name': 'الالتزامات', 'type': 'الالتزامات المتداولة', 'is_header': True},        

            # الالتزامات المتداولة
            {'code': '2100', 'name': 'الالتزامات المتداولة', 'type': 'الالتزامات المتداولة', 'parent': '2000', 'is_header': True},
            {'code': '2110', 'name': 'الدائنون', 'type': 'الالتزامات المتداولة', 'parent': '2100', 'nature': 'supplier'},
            {'code': '2111', 'name': 'الموردون', 'type': 'الالتزامات المتداولة', 'parent': '2110', 'nature': 'supplier'},
            {'code': '2112', 'name': 'دائنون آخرون', 'type': 'الالتزامات المتداولة', 'parent': '2110'},
            {'code': '2120', 'name': 'المصروفات المستحقة', 'type': 'الالتزامات المتداولة', 'parent': '2100'},
            {'code': '2130', 'name': 'ضريبة المبيعات المستحقة', 'type': 'الالتزامات المتداولة', 'parent': '2100'},
            {'code': '2140', 'name': 'ضريبة القيمة المضافة المستحقة', 'type': 'الالتزامات المتداولة', 'parent': '2100'},        

            # حقوق الملكية
            {'code': '3000', 'name': 'حقوق الملكية', 'type': 'حقوق الملكية', 'is_header': True},
            {'code': '3100', 'name': 'رأس المال', 'type': 'حقوق الملكية', 'parent': '3000'},
            {'code': '3200', 'name': 'الأرباح المحتجزة', 'type': 'الأرباح المحتجزة', 'parent': '3000'},        

            # الإيرادات
            {'code': '4000', 'name': 'الإيرادات', 'type': 'إيرادات المبيعات', 'is_header': True},
            {'code': '4100', 'name': 'إيرادات المبيعات', 'type': 'إيرادات المبيعات', 'parent': '4000'},
            {'code': '4110', 'name': 'مبيعات المنتجات', 'type': 'إيرادات المبيعات', 'parent': '4100'},
            {'code': '4120', 'name': 'إيرادات الخدمات', 'type': 'إيرادات الخدمات', 'parent': '4100'},
            {'code': '4130', 'name': 'إيرادات الشحن', 'type': 'إيرادات المبيعات', 'parent': '4100'},
            {'code': '4200', 'name': 'إيرادات أخرى', 'type': 'إيرادات أخرى', 'parent': '4000'},        

            # المصروفات
            {'code': '5000', 'name': 'تكلفة البضاعة المباعة', 'type': 'تكلفة البضاعة المباعة', 'is_header': True},
            {'code': '5100', 'name': 'تكاليف المنتجات', 'type': 'تكلفة البضاعة المباعة', 'parent': '5000'},
            {'code': '5200', 'name': 'تكاليف الشحن', 'type': 'تكلفة البضاعة المباعة', 'parent': '5000'},        

            {'code': '6000', 'name': 'المصروفات التشغيلية', 'type': 'المصروفات التشغيلية', 'is_header': True},
            {'code': '6100', 'name': 'المصروفات التسويقية', 'type': 'المصروفات التشغيلية', 'parent': '6000'},
            {'code': '6200', 'name': 'المصروفات التقنية', 'type': 'المصروفات التشغيلية', 'parent': '6000'},
            {'code': '6300', 'name': 'المصروفات الإدارية', 'type': 'المصروفات الإدارية', 'parent': '6000'},
            {'code': '6400', 'name': 'مصروفات الرواتب', 'type': 'المصروفات التشغيلية', 'parent': '6000'},
        ]

        
        accounts = []
        account_objects = {}  # To store created accounts for parent reference
        
        # Create accounts in order (headers first, then children)
        for account_data in accounts_data:
            parent_account = None
            if account_data.get('parent'):
                parent_account = account_objects.get(account_data['parent'])
            
            account = Account.objects.create(
                branch=branch,
                code=account_data['code'],
                name=account_data['name'],
                parent=parent_account,
                account_type=account_types_dict[account_data['type']],
                account_nature=account_data.get('nature', 'other'),
                is_header=account_data.get('is_header', False),
                currency=default_currency,
                is_system=True  # Mark as system accounts
            )
            
            accounts.append(account)
            account_objects[account_data['code']] = account
        
        return accounts

    def create_admin_user(self, email, password, branch):
        """Create the admin user for the organization"""
        admin_user = User.objects.create_user(
            email=email,
            password=password,
            user_type='admin',
            first_name='System',
            last_name='Administrator',
            default_branch=branch,
            is_staff=True,
            is_superuser=True
        )
        return admin_user

    def setup_ecommerce_tables(self, branch):
        """Setup additional e-commerce specific configurations"""
        # Create attributes for product variants
        self.create_sample_attributes(branch)
        
    def create_sample_attributes(self, branch):
        """Create sample attributes for products"""
        color_attr = Attribute.objects.create(name="Color")
        size_attr = Attribute.objects.create(name="Size")
        material_attr = Attribute.objects.create(name="Material")
        
        # Color values
        AttributeValue.objects.create(attribute=color_attr, value="Red")
        AttributeValue.objects.create(attribute=color_attr, value="Blue")
        AttributeValue.objects.create(attribute=color_attr, value="Green")
        AttributeValue.objects.create(attribute=color_attr, value="Black")
        AttributeValue.objects.create(attribute=color_attr, value="White")
        
        # Size values
        AttributeValue.objects.create(attribute=size_attr, value="Small")
        AttributeValue.objects.create(attribute=size_attr, value="Medium")
        AttributeValue.objects.create(attribute=size_attr, value="Large")
        AttributeValue.objects.create(attribute=size_attr, value="XL")
        AttributeValue.objects.create(attribute=size_attr, value="XXL")
        
        # Material values
        AttributeValue.objects.create(attribute=material_attr, value="Cotton")
        AttributeValue.objects.create(attribute=material_attr, value="Polyester")
        AttributeValue.objects.create(attribute=material_attr, value="Wool")
        AttributeValue.objects.create(attribute=material_attr, value="Silk")
        AttributeValue.objects.create(attribute=material_attr, value="Leather")
    
    def create_sample_data(self, branch, currency):
        """Create sample store groups, item groups, and products"""
        # Get inventory accounts
        stock_account = Account.objects.filter(
            branch=branch, 
            code='1132',  # بضاعة تامة الصنع
            account_nature='inventory'
        ).first()
        
        sales_account = Account.objects.filter(
            branch=branch, 
            code='4110'  # مبيعات المنتجات
        ).first()
        
        cost_account = Account.objects.filter(
            branch=branch, 
            code='5100'  # تكاليف المنتجات
        ).first()
        
        # Create store groups
        apparel_store = StoreGroup.objects.create(
            branch=branch,
            code="APP",
            name="Apparel",
            slug=slugify("Apparel"),
            cost_method=StoreGroup.CostMethod.AVERAGE,
            stock_account=stock_account,
            sales_account=sales_account,
            cost_of_sales_account=cost_account
        )
        
        electronics_store = StoreGroup.objects.create(
            branch=branch,
            code="ELEC",
            name="Electronics",
            slug=slugify("Electronics"),
            cost_method=StoreGroup.CostMethod.AVERAGE,
            stock_account=stock_account,
            sales_account=sales_account,
            cost_of_sales_account=cost_account
        )
        
        # Create item groups
        mens_clothing = ItemGroup.objects.create(
            branch=branch,
            store_group=apparel_store,
            code="MEN",
            name="Men's Clothing",
            slug=slugify("Men's Clothing"),
            group_type=ItemGroup.GroupType.PRODUCT
        )
        
        womens_clothing = ItemGroup.objects.create(
            branch=branch,
            store_group=apparel_store,
            code="WOMEN",
            name="Women's Clothing",
            slug=slugify("Women's Clothing"),
            group_type=ItemGroup.GroupType.PRODUCT
        )
        
        smartphones = ItemGroup.objects.create(
            branch=branch,
            store_group=electronics_store,
            code="PHONE",
            name="Smartphones",
            slug=slugify("Smartphones"),
            group_type=ItemGroup.GroupType.PRODUCT
        )
        
        # Create sample products
        self.create_sample_t_shirt(branch, mens_clothing, currency)
        self.create_sample_dress(branch, womens_clothing, currency)
        self.create_sample_smartphone(branch, smartphones, currency)
    
    def create_sample_t_shirt(self, branch, item_group, currency):
        """Create a sample t-shirt product with variants"""
        # Create base item
        t_shirt = Item.objects.create(
            branch=branch,
            item_group=item_group,
            name="Men's Cotton T-Shirt",
            slug=slugify("Men's Cotton T-Shirt"),
            item_type=Item.ItemType.PRODUCT,
            base_unit="Piece",
            manufacturer="FashionCo",
            brand="FashionCo",
            markup_percentage=Decimal('50.00'),
            vat_percentage=Decimal('15.00'),
            track_expiry=False,
            track_batches=False,
            allow_discount=True,
            allow_bonus=True
        )
        
        # Get attribute values
        red = AttributeValue.objects.get(attribute__name="Color", value="Red")
        blue = AttributeValue.objects.get(attribute__name="Color", value="Blue")
        small = AttributeValue.objects.get(attribute__name="Size", value="Small")
        medium = AttributeValue.objects.get(attribute__name="Size", value="Medium")
        large = AttributeValue.objects.get(attribute__name="Size", value="Large")
        cotton = AttributeValue.objects.get(attribute__name="Material", value="Cotton")
        
        # Create variants
        variants_data = [
            {'size': 'S', 'color': 'Red', 'cost': 10.00, 'price': 19.99},
            {'size': 'M', 'color': 'Red', 'cost': 10.50, 'price': 20.99},
            {'size': 'L', 'color': 'Red', 'cost': 11.00, 'price': 21.99},
            {'size': 'S', 'color': 'Blue', 'cost': 10.00, 'price': 19.99},
            {'size': 'M', 'color': 'Blue', 'cost': 10.50, 'price': 20.99},
            {'size': 'L', 'color': 'Blue', 'cost': 11.00, 'price': 21.99},
        ]
        
        for i, data in enumerate(variants_data, 1):
            variant = ItemVariant.objects.create(
                item=t_shirt,
                code=f"TSHIRT-{data['size']}-{data['color']}",
                size=data['size'],
                color=data['color'],
                standard_cost=Decimal(str(data['cost'])),
                sales_price=Decimal(str(data['price'])),
                reorder_level=Decimal('50.0000'),
                maximum_stock=Decimal('500.0000')
            )
            
            # Add attribute values
            color_attr = AttributeValue.objects.get(attribute__name="Color", value=data['color'])
            size_attr = AttributeValue.objects.get(attribute__name="Size", value=data['size'])
            
            VariantAttributeValue.objects.create(variant=variant, attribute_value=color_attr)
            VariantAttributeValue.objects.create(variant=variant, attribute_value=size_attr)
            VariantAttributeValue.objects.create(variant=variant, attribute_value=cotton)
            
            # Create unit
            unit = ItemUnit.objects.create(
                variant=variant,
                code="PCS",
                name="Piece",
                conversion_factor=Decimal('1.00000000'),
                unit_price=Decimal(str(data['price'])),
                unit_cost=Decimal(str(data['cost'])),
                is_default=True,
                is_purchase_unit=True,
                is_sales_unit=True
            )
            
            # Create barcode
            ItemBarcode.objects.create(
                variant=variant,
                barcode=f"123456789012{i}",
                barcode_type="ean13",
                unit=unit,
                is_primary=True
            )
            
            # Create inventory balance
            InventoryBalance.objects.create(
                branch=branch,
                variant=variant,
                location="A-01",
                available_quantity=Decimal('100.00000000'),
                reserved_quantity=Decimal('0.00000000'),
                average_cost=Decimal(str(data['cost']))
            )
    
    def create_sample_dress(self, branch, item_group, currency):
        """Create a sample dress product with variants"""
        # Create base item
        dress = Item.objects.create(
            branch=branch,
            item_group=item_group,
            name="Women's Summer Dress",
            slug=slugify("Women's Summer Dress"),
            item_type=Item.ItemType.PRODUCT,
            base_unit="Piece",
            manufacturer="FashionCo",
            brand="FashionCo",
            markup_percentage=Decimal('60.00'),
            vat_percentage=Decimal('15.00'),
            track_expiry=False,
            track_batches=False,
            allow_discount=True,
            allow_bonus=True
        )
        
        # Get attribute values
        black = AttributeValue.objects.get(attribute__name="Color", value="Black")
        white = AttributeValue.objects.get(attribute__name="Color", value="White")
        small = AttributeValue.objects.get(attribute__name="Size", value="Small")
        medium = AttributeValue.objects.get(attribute__name="Size", value="Medium")
        large = AttributeValue.objects.get(attribute__name="Size", value="Large")
        cotton = AttributeValue.objects.get(attribute__name="Material", value="Cotton")
        
        # Create variants
        variants_data = [
            {'size': 'S', 'color': 'Black', 'cost': 25.00, 'price': 49.99},
            {'size': 'M', 'color': 'Black', 'cost': 26.00, 'price': 51.99},
            {'size': 'L', 'color': 'Black', 'cost': 27.00, 'price': 53.99},
            {'size': 'S', 'color': 'White', 'cost': 25.00, 'price': 49.99},
            {'size': 'M', 'color': 'White', 'cost': 26.00, 'price': 51.99},
            {'size': 'L', 'color': 'White', 'cost': 27.00, 'price': 53.99},
        ]
        
        for i, data in enumerate(variants_data, 1):
            variant = ItemVariant.objects.create(
                item=dress,
                code=f"DRESS-{data['size']}-{data['color']}",
                size=data['size'],
                color=data['color'],
                standard_cost=Decimal(str(data['cost'])),
                sales_price=Decimal(str(data['price'])),
                reorder_level=Decimal('30.0000'),
                maximum_stock=Decimal('300.0000')
            )
            
            # Add attribute values
            color_attr = AttributeValue.objects.get(attribute__name="Color", value=data['color'])
            size_attr = AttributeValue.objects.get(attribute__name="Size", value=data['size'])
            
            VariantAttributeValue.objects.create(variant=variant, attribute_value=color_attr)
            VariantAttributeValue.objects.create(variant=variant, attribute_value=size_attr)
            VariantAttributeValue.objects.create(variant=variant, attribute_value=cotton)
            
            # Create unit
            unit = ItemUnit.objects.create(
                variant=variant,
                code="PCS",
                name="Piece",
                conversion_factor=Decimal('1.00000000'),
                unit_price=Decimal(str(data['price'])),
                unit_cost=Decimal(str(data['cost'])),
                is_default=True,
                is_purchase_unit=True,
                is_sales_unit=True
            )
            
            # Create barcode
            ItemBarcode.objects.create(
                variant=variant,
                barcode=f"223456789012{i}",
                barcode_type="ean13",
                unit=unit,
                is_primary=True
            )
            
            # Create inventory balance
            InventoryBalance.objects.create(
                branch=branch,
                variant=variant,
                location="B-01",
                available_quantity=Decimal('75.00000000'),
                reserved_quantity=Decimal('0.00000000'),
                average_cost=Decimal(str(data['cost']))
            )
    
    def create_sample_smartphone(self, branch, item_group, currency):
        """Create a sample smartphone product with variants"""
        # Create base item
        smartphone = Item.objects.create(
            branch=branch,
            item_group=item_group,
            name="Premium Smartphone",
            slug=slugify("Premium Smartphone"),
            item_type=Item.ItemType.PRODUCT,
            base_unit="Piece",
            manufacturer="TechCorp",
            brand="TechCorp",
            markup_percentage=Decimal('30.00'),
            vat_percentage=Decimal('15.00'),
            track_expiry=False,
            track_batches=True,
            allow_discount=True,
            allow_bonus=False
        )
        
        # Get attribute values
        black = AttributeValue.objects.get(attribute__name="Color", value="Black")
        white = AttributeValue.objects.get(attribute__name="Color", value="White")
        
        # Create variants
        variants_data = [
            {'storage': '128GB', 'color': 'Black', 'cost': 400.00, 'price': 599.99},
            {'storage': '256GB', 'color': 'Black', 'cost': 450.00, 'price': 649.99},
            {'storage': '512GB', 'color': 'Black', 'cost': 500.00, 'price': 699.99},
            {'storage': '128GB', 'color': 'White', 'cost': 400.00, 'price': 599.99},
            {'storage': '256GB', 'color': 'White', 'cost': 450.00, 'price': 649.99},
            {'storage': '512GB', 'color': 'White', 'cost': 500.00, 'price': 699.99},
        ]
        
        for i, data in enumerate(variants_data, 1):
            variant = ItemVariant.objects.create(
                item=smartphone,
                code=f"PHONE-{data['storage']}-{data['color']}",
                color=data['color'],
                standard_cost=Decimal(str(data['cost'])),
                sales_price=Decimal(str(data['price'])),
                reorder_level=Decimal('20.0000'),
                maximum_stock=Decimal('200.0000'),
                extra_attributes={'storage': data['storage']}
            )
            
            # Add attribute values
            color_attr = AttributeValue.objects.get(attribute__name="Color", value=data['color'])
            VariantAttributeValue.objects.create(variant=variant, attribute_value=color_attr)
            
            # Create unit
            unit = ItemUnit.objects.create(
                variant=variant,
                code="PCS",
                name="Piece",
                conversion_factor=Decimal('1.00000000'),
                unit_price=Decimal(str(data['price'])),
                unit_cost=Decimal(str(data['cost'])),
                is_default=True,
                is_purchase_unit=True,
                is_sales_unit=True
            )
            
            # Create barcode
            ItemBarcode.objects.create(
                variant=variant,
                barcode=f"323456789012{i}",
                barcode_type="ean13",
                unit=unit,
                is_primary=True
            )
            
            # Create inventory balance with batch number
            batch_number = f"BATCH-{date.today().strftime('%Y%m%d')}-{i:03d}"
            InventoryBalance.objects.create(
                branch=branch,
                variant=variant,
                location="C-01",
                batch_number=batch_number,
                available_quantity=Decimal('50.00000000'),
                reserved_quantity=Decimal('0.00000000'),
                average_cost=Decimal(str(data['cost']))
            )