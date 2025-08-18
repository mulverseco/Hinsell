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
            # Assets
            {'name': 'Current Assets', 'category': 'asset', 'is_debit_balance': True},
            {'name': 'Fixed Assets', 'category': 'asset', 'is_debit_balance': True},
            {'name': 'Intangible Assets', 'category': 'asset', 'is_debit_balance': True},
            {'name': 'Other Assets', 'category': 'asset', 'is_debit_balance': True},
            
            # Liabilities
            {'name': 'Current Liabilities', 'category': 'liability', 'is_debit_balance': False},
            {'name': 'Long-term Liabilities', 'category': 'liability', 'is_debit_balance': False},
            {'name': 'Other Liabilities', 'category': 'liability', 'is_debit_balance': False},
            
            # Equity
            {'name': 'Owner Equity', 'category': 'equity', 'is_debit_balance': False},
            {'name': 'Retained Earnings', 'category': 'equity', 'is_debit_balance': False},
            
            # Revenue
            {'name': 'Sales Revenue', 'category': 'revenue', 'is_debit_balance': False},
            {'name': 'Service Revenue', 'category': 'revenue', 'is_debit_balance': False},
            {'name': 'Other Revenue', 'category': 'revenue', 'is_debit_balance': False},
            
            # Expenses
            {'name': 'Cost of Goods Sold', 'category': 'expense', 'is_debit_balance': True},
            {'name': 'Operating Expenses', 'category': 'expense', 'is_debit_balance': True},
            {'name': 'Administrative Expenses', 'category': 'expense', 'is_debit_balance': True},
            {'name': 'Financial Expenses', 'category': 'expense', 'is_debit_balance': True},
        ]
        
        account_types = []
        for data in account_types_data:
            account_type = AccountType.objects.create(
                branch=branch,
                name=data['name'],
                category=data['category'],
                is_debit_balance=data['is_debit_balance']
            )
            account_types.append(account_type)
        
        return account_types

    def create_chart_of_accounts(self, branch, account_types, default_currency):
        """Create comprehensive chart of accounts for e-commerce"""
        # Get account types by name for easier reference
        account_types_dict = {at.name: at for at in account_types}
        
        accounts_data = [
            # ASSETS
            {'code': '1000', 'name': 'ASSETS', 'type': 'Current Assets', 'is_header': True},
            
            # Current Assets
            {'code': '1100', 'name': 'Current Assets', 'type': 'Current Assets', 'parent': '1000', 'is_header': True},
            {'code': '1110', 'name': 'Cash and Cash Equivalents', 'type': 'Current Assets', 'parent': '1100', 'nature': 'cash'},
            {'code': '1111', 'name': 'Petty Cash', 'type': 'Current Assets', 'parent': '1110', 'nature': 'cash'},
            {'code': '1112', 'name': 'Bank Account - Main', 'type': 'Current Assets', 'parent': '1110', 'nature': 'bank'},
            {'code': '1113', 'name': 'Bank Account - Payroll', 'type': 'Current Assets', 'parent': '1110', 'nature': 'bank'},
            {'code': '1120', 'name': 'Accounts Receivable', 'type': 'Current Assets', 'parent': '1100', 'nature': 'customer'},
            {'code': '1121', 'name': 'Trade Receivables', 'type': 'Current Assets', 'parent': '1120', 'nature': 'customer'},
            {'code': '1122', 'name': 'Other Receivables', 'type': 'Current Assets', 'parent': '1120'},
            {'code': '1130', 'name': 'Inventory', 'type': 'Current Assets', 'parent': '1100', 'nature': 'inventory'},
            {'code': '1131', 'name': 'Raw Materials', 'type': 'Current Assets', 'parent': '1130', 'nature': 'inventory'},
            {'code': '1132', 'name': 'Finished Goods', 'type': 'Current Assets', 'parent': '1130', 'nature': 'inventory'},
            {'code': '1133', 'name': 'Work in Progress', 'type': 'Current Assets', 'parent': '1130', 'nature': 'inventory'},
            
            # Fixed Assets
            {'code': '1200', 'name': 'Fixed Assets', 'type': 'Fixed Assets', 'parent': '1000', 'is_header': True},
            {'code': '1210', 'name': 'Property, Plant & Equipment', 'type': 'Fixed Assets', 'parent': '1200', 'nature': 'fixed_asset'},
            {'code': '1211', 'name': 'Land', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1212', 'name': 'Buildings', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1213', 'name': 'Equipment', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},
            {'code': '1214', 'name': 'Vehicles', 'type': 'Fixed Assets', 'parent': '1210', 'nature': 'fixed_asset'},
            
            # LIABILITIES
            {'code': '2000', 'name': 'LIABILITIES', 'type': 'Current Liabilities', 'is_header': True},
            
            # Current Liabilities
            {'code': '2100', 'name': 'Current Liabilities', 'type': 'Current Liabilities', 'parent': '2000', 'is_header': True},
            {'code': '2110', 'name': 'Accounts Payable', 'type': 'Current Liabilities', 'parent': '2100', 'nature': 'supplier'},
            {'code': '2111', 'name': 'Trade Payables', 'type': 'Current Liabilities', 'parent': '2110', 'nature': 'supplier'},
            {'code': '2112', 'name': 'Other Payables', 'type': 'Current Liabilities', 'parent': '2110'},
            {'code': '2120', 'name': 'Accrued Expenses', 'type': 'Current Liabilities', 'parent': '2100'},
            {'code': '2130', 'name': 'Sales Tax Payable', 'type': 'Current Liabilities', 'parent': '2100'},
            {'code': '2140', 'name': 'VAT Payable', 'type': 'Current Liabilities', 'parent': '2100'},
            
            # EQUITY
            {'code': '3000', 'name': 'EQUITY', 'type': 'Owner Equity', 'is_header': True},
            {'code': '3100', 'name': 'Owner Capital', 'type': 'Owner Equity', 'parent': '3000'},
            {'code': '3200', 'name': 'Retained Earnings', 'type': 'Retained Earnings', 'parent': '3000'},
            
            # REVENUE
            {'code': '4000', 'name': 'REVENUE', 'type': 'Sales Revenue', 'is_header': True},
            {'code': '4100', 'name': 'Sales Revenue', 'type': 'Sales Revenue', 'parent': '4000'},
            {'code': '4110', 'name': 'Product Sales', 'type': 'Sales Revenue', 'parent': '4100'},
            {'code': '4120', 'name': 'Service Revenue', 'type': 'Service Revenue', 'parent': '4100'},
            {'code': '4130', 'name': 'Shipping Revenue', 'type': 'Sales Revenue', 'parent': '4100'},
            {'code': '4200', 'name': 'Other Revenue', 'type': 'Other Revenue', 'parent': '4000'},
            
            # EXPENSES
            {'code': '5000', 'name': 'COST OF GOODS SOLD', 'type': 'Cost of Goods Sold', 'is_header': True},
            {'code': '5100', 'name': 'Product Costs', 'type': 'Cost of Goods Sold', 'parent': '5000'},
            {'code': '5200', 'name': 'Shipping Costs', 'type': 'Cost of Goods Sold', 'parent': '5000'},
            
            {'code': '6000', 'name': 'OPERATING EXPENSES', 'type': 'Operating Expenses', 'is_header': True},
            {'code': '6100', 'name': 'Marketing Expenses', 'type': 'Operating Expenses', 'parent': '6000'},
            {'code': '6200', 'name': 'Technology Expenses', 'type': 'Operating Expenses', 'parent': '6000'},
            {'code': '6300', 'name': 'Administrative Expenses', 'type': 'Administrative Expenses', 'parent': '6000'},
            {'code': '6400', 'name': 'Payroll Expenses', 'type': 'Operating Expenses', 'parent': '6000'},
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
