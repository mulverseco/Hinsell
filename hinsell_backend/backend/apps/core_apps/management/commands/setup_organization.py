from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date
from apps.organization.models import Company, Branch
from apps.accounting.models import AccountType, Account, Currency
from apps.core_apps.utils import Logger

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
            {'code': '1000', 'name': 'الأصول', 'type': 'Current Assets', 'is_header': True},        

            # الأصول المتداولة
            {'code': '1100', 'name': 'الأصول المتداولة', 'type': 'Current Assets', 'parent': '1000', 'is_header': True},
            {'code': '1110', 'name': 'النقد وما في حكمه', 'type': 'Current Assets', 'parent': '1100', 'nature': 'cash'},
            {'code': '1111', 'name': 'الصندوق', 'type': 'Current Assets', 'parent': '1110', 'nature': 'cash'},
            {'code': '1112', 'name': 'الحساب البنكي الرئيسي', 'type': 'Current Assets', 'parent': '1110', 'nature': 'bank'},
            {'code': '1113', 'name': 'حساب الرواتب', 'type': 'Current Assets', 'parent': '1110', 'nature': 'bank'},
            {'code': '1120', 'name': 'المدينون', 'type': 'Current Assets', 'parent': '1100', 'nature': 'customer'},
            {'code': '1121', 'name': 'العملاء', 'type': 'Current Assets', 'parent': '1120', 'nature': 'customer'},
            {'code': '1122', 'name': 'مدينون آخرون', 'type': 'Current Assets', 'parent': '1120'},
            {'code': '1130', 'name': 'المخزون', 'type': 'Current Assets', 'parent': '1100', 'nature': 'inventory'},
            {'code': '1131', 'name': 'مواد خام', 'type': 'Current Assets', 'parent': '1130', 'nature': 'inventory'},
            {'code': '1132', 'name': 'بضاعة تامة الصنع', 'type': 'Current Assets', 'parent': '1130', 'nature': 'inventory'},
            {'code': '1133', 'name': 'بضاعة تحت التشغيل', 'type': 'Current Assets', 'parent': '1130', 'nature': 'inventory'},        

            # الأصول الثابتة
            {'code': '1200', 'name': 'الأصول الثابتة', 'type': 'Fixed Assets', 'parent': '1000', 'is_header': True},
            {'code': '1210', 'name': 'العقارات والمعدات', 'type': 'Fixed Assets', 'parent': '1200', 'nature': 'fixed_asset'},
            {'code': '1211', 'name': 'الأراضي', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1212', 'name': 'المباني', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1213', 'name': 'المعدات', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1214', 'name': 'المركبات', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},        

            # الالتزامات
            {'code': '2000', 'name': 'الالتزامات', 'type': 'Current Liabilities', 'is_header': True},        

            # الالتزامات المتداولة
            {'code': '2100', 'name': 'الالتزامات المتداولة', 'type': 'Current Liabilities', 'parent': '2000', 'is_header': True},
            {'code': '2110', 'name': 'الدائنون', 'type': 'Current Liabilities', 'parent': '2100', 'nature': 'supplier'},
            {'code': '2111', 'name': 'الموردون', 'type': 'Current Liabilities', 'parent': '2110', 'nature': 'supplier'},
            {'code': '2112', 'name': 'دائنون آخرون', 'type': 'Current Liabilities', 'parent': '2110'},
            {'code': '2120', 'name': 'المصروفات المستحقة', 'type': 'Current Liabilities', 'parent': '2100'},
            {'code': '2130', 'name': 'ضريبة المبيعات المستحقة', 'type': 'Current Liabilities', 'parent': '2100'},
            {'code': '2140', 'name': 'ضريبة القيمة المضافة المستحقة', 'type': 'Current Liabilities', 'parent': '2100'},        

            # حقوق الملكية
            {'code': '3000', 'name': 'حقوق الملكية', 'type': 'Owner Equity', 'is_header': True},
            {'code': '3100', 'name': 'رأس المال', 'type': 'Owner Equity', 'parent': '3000'},
            {'code': '3200', 'name': 'الأرباح المحتجزة', 'type': 'Retained Earnings', 'parent': '3000'},        

            # الإيرادات
            {'code': '4000', 'name': 'الإيرادات', 'type': 'Sales Revenue', 'is_header': True},
            {'code': '4100', 'name': 'إيرادات المبيعات', 'type': 'Sales Revenue', 'parent': '4000'},
            {'code': '4110', 'name': 'مبيعات المنتجات', 'type': 'Sales Revenue', 'parent': '4100'},
            {'code': '4120', 'name': 'إيرادات الخدمات', 'type': 'Service Revenue', 'parent': '4100'},
            {'code': '4130', 'name': 'إيرادات الشحن', 'type': 'Sales Revenue', 'parent': '4100'},
            {'code': '4200', 'name': 'إيرادات أخرى', 'type': 'Other Revenue', 'parent': '4000'},        

            # المصروفات
            {'code': '5000', 'name': 'تكلفة البضاعة المباعة', 'type': 'Cost of Goods Sold', 'is_header': True},
            {'code': '5100', 'name': 'تكاليف المنتجات', 'type': 'Cost of Goods Sold', 'parent': '5000'},
            {'code': '5200', 'name': 'تكاليف الشحن', 'type': 'Cost of Goods Sold', 'parent': '5000'},        

            {'code': '6000', 'name': 'المصروفات التشغيلية', 'type': 'Operating Expenses', 'is_header': True},
            {'code': '6100', 'name': 'المصروفات التسويقية', 'type': 'Operating Expenses', 'parent': '6000'},
            {'code': '6200', 'name': 'المصروفات التقنية', 'type': 'Operating Expenses', 'parent': '6000'},
            {'code': '6300', 'name': 'المصروفات الإدارية', 'type': 'Administrative Expenses', 'parent': '6000'},
            {'code': '6400', 'name': 'مصروفات الرواتب', 'type': 'Operating Expenses', 'parent': '6000'},
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
        # This method can be extended to create additional tables
        # like payment methods, shipping methods, tax configurations, etc.
        pass
