from datetime import date
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.utils import timezone

from apps.organization.models import Company, Branch
from apps.accounting.models import (
    AccountType, Account, Currency, AccountingPeriod, 
    TaxConfiguration, PaymentMethod
)

from apps.transactions.models import TransactionType
from apps.core_apps.utils import Logger
from apps.inventory.models import (
    StoreGroup, ItemGroup, Item, ItemVariant, ItemUnit,
    ItemBarcode, InventoryBalance, ItemReview
)
from apps.hinsell.models import (
    Offer, Coupon, UserCoupon, Campaign
)
from apps.notifications.models import (
    NotificationTemplate, Notification
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

            # Company
            company = self.create_company(options['company_name'])
            self.stdout.write(f'Created/found company: {company.company_name}')

            # Branch
            branch = self.create_primary_branch(company, options['fiscal_year'])
            self.stdout.write(f'Created/found primary branch: {branch.branch_name}')

            # Currencies
            currencies = self.setup_currencies(branch, options['country_code'])
            self.stdout.write(f'Setup {len(currencies)} currencies')

            # Account types
            account_types = self.create_account_types(branch)
            self.stdout.write(f'Created/found {len(account_types)} account types')

            # Chart of accounts
            accounts = self.create_chart_of_accounts(branch, account_types, currencies[0])
            self.stdout.write(f'Created/found {len(accounts)} accounts')

            # Accounting periods
            accounting_periods = self.create_accounting_periods(branch, options['fiscal_year'])
            self.stdout.write(f'Created/found {len(accounting_periods)} accounting periods')

            # Transaction types
            transaction_types = self.create_transaction_types(branch, accounts)
            self.stdout.write(f'Created/found {len(transaction_types)} transaction types')

            # Tax configurations
            tax_configs = self.create_tax_configurations(branch, accounts)
            self.stdout.write(f'Created/found {len(tax_configs)} tax configurations')

            # Payment methods
            payment_methods = self.create_payment_methods(branch, accounts)
            self.stdout.write(f'Created/found {len(payment_methods)} payment methods')

            # Admin user
            admin_user = self.create_admin_user(options['admin_email'], options['admin_password'], branch)
            self.stdout.write(f'Created/found admin user: {admin_user.email}')

            # Notification templates
            notification_templates = self.create_notification_templates(branch)
            self.stdout.write(f'Created/found {len(notification_templates)} notification templates')

            # Sample data
            if options['create_sample_data']:
                self.create_sample_data(branch, currencies[0])
                self.create_sample_coupons_and_reviews(branch, admin_user)
                self.create_sample_notifications(branch, admin_user, notification_templates)
                self.stdout.write('Created sample products, categories, coupons, reviews, and notifications')

            self.stdout.write(self.style.SUCCESS('Organization setup completed successfully!'))

        except Exception as e:
            logger.error(f"Organization setup failed: {str(e)}")
            self.stdout.write(self.style.ERROR(f'Setup failed: {str(e)}'))
            # Don't raise the exception to allow the command to complete gracefully

    # -----------------------
    # Basic Accounting Operations
    # -----------------------

    def create_accounting_periods(self, branch, fiscal_year):
        """Create accounting periods for the fiscal year"""
        periods = []
        month_names = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        
        for month in range(1, 13):
            try:
                # Calculate start and end dates for each period
                if month == 12:
                    start_date = date(fiscal_year, month, 1)
                    end_date = date(fiscal_year, month, 31)
                else:
                    start_date = date(fiscal_year, month, 1)
                    end_date = date(fiscal_year, month + 1, 1) - timezone.timedelta(days=1)
                
                period_code = f"{fiscal_year}-{month:02d}"
                period_name = f"{month_names[month-1]} {fiscal_year}"
                
                period, created = AccountingPeriod.objects.get_or_create(
                    branch=branch,
                    code=period_code,
                    defaults={
                        'name': period_name,
                        'start_date': start_date,
                        'end_date': end_date,
                        'fiscal_year': fiscal_year,
                        'is_closed': False,
                    }
                )
                periods.append(period)
            except Exception as e:
                logger.error(f"Error creating accounting period {month}/{fiscal_year}: {str(e)}")
                continue
        
        return periods

    def create_transaction_types(self, branch, accounts):
        """Create essential transaction types for the accounting system"""
        transaction_types_data = [
            {
                'code': 'SALE',
                'name': 'Sales Invoice',
                'category': TransactionType.Category.SALES,
                'affects_inventory': True,
                'affects_accounts': True,
                'requires_approval': False,
                'auto_post': True,
                'default_debit_account': self.find_account(accounts, '1121'),
                'default_credit_account': self.find_account(accounts, '4110'),
            },
            {
                'code': 'PURCH',
                'name': 'Purchase Invoice',
                'category': TransactionType.Category.PURCHASE,
                'affects_inventory': True,
                'affects_accounts': True,
                'requires_approval': True,
                'auto_post': False,
                'default_debit_account': self.find_account(accounts, '1132'),
                'default_credit_account': self.find_account(accounts, '2111'),
            },
            {
                'code': 'PAYMENT',
                'name': 'Customer Payment',
                'category': TransactionType.Category.PAYMENT,
                'affects_inventory': False,
                'affects_accounts': True,
                'requires_approval': False,
                'auto_post': True,
                'default_debit_account': self.find_account(accounts, '1112'),
                'default_credit_account': self.find_account(accounts, '1121'),
            },
            {
                'code': 'RECEIPT',
                'name': 'Supplier Payment',
                'category': TransactionType.Category.RECEIPT,
                'affects_inventory': False,
                'affects_accounts': True,
                'requires_approval': True,
                'auto_post': False,
                'default_debit_account': self.find_account(accounts, '2111'),
                'default_credit_account': self.find_account(accounts, '1112'),
            },
            {
                'code': 'JOURNAL',
                'name': 'Journal Entry',
                'category': TransactionType.Category.JOURNAL,
                'affects_inventory': False,
                'affects_accounts': True,
                'requires_approval': True,
                'auto_post': False,
                'default_debit_account': None,
                'default_credit_account': None,
            },
            {
                'code': 'ADJUST',
                'name': 'Inventory Adjustment',
                'category': TransactionType.Category.ADJUSTMENT,
                'affects_inventory': True,
                'affects_accounts': True,
                'requires_approval': True,
                'auto_post': False,
                'default_debit_account': self.find_account(accounts, '1132'),
                'default_credit_account': self.find_account(accounts, '5100'),
            },
        ]
        
        transaction_types = []
        for data in transaction_types_data:
            try:
                tt, created = TransactionType.objects.get_or_create(
                    branch=branch,
                    code=data['code'],
                    defaults={
                        'name': data['name'],
                        'category': data['category'],
                        'affects_inventory': data['affects_inventory'],
                        'affects_accounts': data['affects_accounts'],
                        'requires_approval': data['requires_approval'],
                        'auto_post': data['auto_post'],
                        'default_debit_account': data['default_debit_account'],
                        'default_credit_account': data['default_credit_account'],
                    }
                )
                transaction_types.append(tt)
            except Exception as e:
                logger.error(f"Error creating transaction type {data['code']}: {str(e)}")
                continue
        
        return transaction_types

    def create_tax_configurations(self, branch, accounts):
        """Create tax configurations for the accounting system"""
        tax_configs_data = [
            {
                'code': 'VAT15',
                'name': 'Value Added Tax 15%',
                'tax_type': TaxConfiguration.TaxType.VAT,
                'rate': Decimal('15.00'),
                'is_inclusive': False,
                'is_active': True,
                'effective_from': date.today(),
                'tax_account': self.find_account(accounts, '2140'),  # ضريبة القيمة المضافة المستحقة
            },
            {
                'code': 'SALES10',
                'name': 'Sales Tax 10%',
                'tax_type': TaxConfiguration.TaxType.SALES_TAX,
                'rate': Decimal('10.00'),
                'is_inclusive': False,
                'is_active': True,
                'effective_from': date.today(),
                'tax_account': self.find_account(accounts, '2130'),  # ضريبة المبيعات المستحقة
            },
        ]
        
        tax_configs = []
        for data in tax_configs_data:
            try:
                tc, created = TaxConfiguration.objects.get_or_create(
                    branch=branch,
                    code=data['code'],
                    defaults=data
                )
                tax_configs.append(tc)
            except Exception as e:
                logger.error(f"Error creating tax configuration {data['code']}: {str(e)}")
                continue
        
        return tax_configs

    def create_payment_methods(self, branch, accounts):
        """Create payment methods for the accounting system"""
        payment_methods_data = [
            {
                'code': 'CASH',
                'name': 'Cash',
                'payment_type': PaymentMethod.PaymentType.CASH,
                'account': self.find_account(accounts, '1111'),  # الصندوق
                'is_active': True,
                'processing_fee_rate': Decimal('0.00'),
            },
            {
                'code': 'BANK',
                'name': 'Bank Transfer',
                'payment_type': PaymentMethod.PaymentType.BANK_TRANSFER,
                'account': self.find_account(accounts, '1112'),
                'is_active': True,
                'processing_fee_rate': Decimal('0.50'),
                'processing_fee_account': self.find_account(accounts, '6200'),  # المصروفات التقنية
            },
            {
                'code': 'CREDIT',
                'name': 'Credit Card',
                'payment_type': PaymentMethod.PaymentType.CREDIT_CARD,
                'account': self.find_account(accounts, '1112'),
                'is_active': True,
                'processing_fee_rate': Decimal('2.50'),
                'processing_fee_account': self.find_account(accounts, '6200'),  # المصروفات التقنية
            },
            {
                'code': 'DIGITAL',
                'name': 'Digital Wallet',
                'payment_type': PaymentMethod.PaymentType.DIGITAL_WALLET,
                'account': self.find_account(accounts, '1112'),
                'is_active': True,
                'processing_fee_rate': Decimal('1.50'),
                'processing_fee_account': self.find_account(accounts, '6200'),  # المصروفات التقنية
            },
        ]
        
        payment_methods = []
        for data in payment_methods_data:
            try:
                pm, created = PaymentMethod.objects.get_or_create(
                    branch=branch,
                    code=data['code'],
                    defaults=data
                )
                payment_methods.append(pm)
            except Exception as e:
                logger.error(f"Error creating payment method {data['code']}: {str(e)}")
                continue
        
        return payment_methods

    def find_account(self, accounts, code):
        """Helper method to find account by code"""
        for account in accounts:
            if account.code == code:
                return account
        logger.warning(f"Account with code {code} not found")
        return None

    # -----------------------
    # Core creators (idempotent)
    # -----------------------

    def create_company(self, company_name):
        """Create or fetch the main company"""
        try:
            company, _ = Company.objects.get_or_create(
                company_name=company_name,
                defaults={
                    'company_name_english': company_name,
                    'industry': 'E-commerce',
                    'established_date': date.today(),
                    'description': f'{company_name} - E-commerce Platform',
                }
            )
            return company
        except Exception as e:
            logger.error(f"Error creating company: {str(e)}")
            # Try to get existing company
            return Company.objects.filter(company_name=company_name).first()

    def create_primary_branch(self, company, fiscal_year):
        """Create or fetch the primary branch"""
        try:
            branch_name = f'{company.company_name} - Main Branch'
            branch, created = Branch.objects.get_or_create(
                company=company,
                branch_name=branch_name,
                defaults={
                    'branch_name_english': branch_name,
                    'is_primary': True,
                    'is_headquarters': True,
                    'fiscal_year_start_month': 1,
                    'fiscal_year_end_month': 12,
                    'current_fiscal_year': fiscal_year,
                    'use_cost_center': True,
                    'use_sales_tax': True,
                    'use_vat_tax': True,
                    'use_carry_fee': True,
                    'use_expire_date': True,
                    'use_batch_no': True,
                    'use_barcode': True,
                    'use_multi_currency': True,
                    'city': 'Main City',
                    'country': 'United States',
                }
            )
            if not created:
                # keep current fiscal year up to date
                if branch.current_fiscal_year != fiscal_year:
                    branch.current_fiscal_year = fiscal_year
                    branch.save(update_fields=['current_fiscal_year'])
            return branch
        except Exception as e:
            logger.error(f"Error creating branch: {str(e)}")
            # Try to get existing branch
            return Branch.objects.filter(company=company, is_primary=True).first()

    def setup_currencies(self, branch, country_code='US'):
        """Setup default currencies; return list of objects"""
        currency_data = {
            'US': {'code': 'USD', 'name': 'US Dollar', 'symbol': '$'},
            'EU': {'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
            'GB': {'code': 'GBP', 'name': 'British Pound', 'symbol': '£'},
            'JP': {'code': 'JPY', 'name': 'Japanese Yen', 'symbol': '¥'},
            'CA': {'code': 'CAD', 'name': 'Canadian Dollar', 'symbol': 'C$'},
        }

        currencies = []
        selected_currency = currency_data.get(country_code, currency_data['US'])

        try:
            # Primary currency
            primary_currency, _ = Currency.objects.get_or_create(
                branch=branch,
                code=selected_currency['code'],
                defaults={
                    'name': selected_currency['name'],
                    'symbol': selected_currency['symbol'],
                    'is_default': True,
                    'decimal_places': 2,
                    'exchange_rate': Decimal('1.00000000'),
                }
            )
            currencies.append(primary_currency)

            # Ensure only this one is default
            Currency.objects.filter(branch=branch).exclude(pk=primary_currency.pk).update(is_default=False)

            # Other majors
            for code, data in currency_data.items():
                if code == country_code:
                    continue
                obj, _ = Currency.objects.get_or_create(
                    branch=branch,
                    code=data['code'],
                    defaults={
                        'name': data['name'],
                        'symbol': data['symbol'],
                        'is_default': False,
                        'decimal_places': 2,
                        'exchange_rate': Decimal('1.00000000'),
                    }
                )
                currencies.append(obj)

        except Exception as e:
            logger.error(f"Error in currency setup: {str(e)}")
            # Try to get at least the primary currency
            primary = Currency.objects.filter(branch=branch, code=selected_currency['code']).first()
            if primary:
                currencies = [primary]

        return currencies

    def create_account_types(self, branch):
        """Create standard account types for e-commerce; return list of objects"""
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

        result = []
        for data in account_types_data:
            try:
                obj, _ = AccountType.objects.get_or_create(
                    branch=branch,
                    name=data['name'],
                    defaults={
                        'category': data['category'],
                        'normal_balance': data['normal_balance'],
                    }
                )
                result.append(obj)
            except Exception as e:
                logger.error(f"Error creating account type {data['name']}: {str(e)}")
                continue

        return result

    def create_chart_of_accounts(self, branch, account_types, default_currency):
        """Create comprehensive chart of accounts for e-commerce; idempotent"""
        atype_by_name = {at.name: at for at in account_types}

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
            {'code': '1210', 'name': 'العقارات والمعدات', 'type': 'الأصول الثابتة', 'parent': '1200', 'is_header': True},
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
        created_by_code = {}

        for data in accounts_data:
            try:
                parent = created_by_code.get(data.get('parent')) if data.get('parent') else None
                code = data['code']
                atype = atype_by_name.get(data['type'])
                
                if not atype:
                    logger.warning(f"Account type {data['type']} not found for account {code}")
                    continue

                obj, created = Account.objects.get_or_create(
                    branch=branch,
                    code=code,
                    defaults={
                        'name': data['name'],
                        'parent': parent,
                        'account_type': atype,
                        'account_nature': data.get('nature', 'other'),
                        'is_header': data.get('is_header', False),
                        'currency': default_currency,
                        'is_system': True,
                    }
                )
                accounts.append(obj)
                created_by_code[code] = obj

            except Exception as e:
                logger.error(f"Error creating account {data.get('code', 'unknown')}: {str(e)}")
                continue

        return accounts

    def create_admin_user(self, email, password, branch):
        """Create or fetch the admin user for the organization"""
        try:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'user_type': 'admin',
                    'username': email,
                    'first_name': 'System',
                    'last_name': 'Administrator',
                    'default_branch': branch,
                    'is_staff': True,
                    'is_superuser': True,
                }
            )
            if created:
                user.set_password(password)
                user.save()
            else:
                # Ensure flags/branch are correct; do not reset password silently
                changed = False
                for f, v in [('is_staff', True), ('is_superuser', True), ('default_branch', branch)]:
                    if getattr(user, f) != v:
                        setattr(user, f, v)
                        changed = True
                if changed:
                    user.save()
            return user
        except Exception as e:
            logger.error(f"Error creating admin user: {str(e)}")
            # Return existing user if possible
            return User.objects.filter(email=email).first()


    # -----------------------
    # Sample data
    # -----------------------

    def create_notification_templates(self, branch):
        """Create standard notification templates for the e-commerce system"""
        templates_data = [
            {
                'code': 'WELCOME_EMAIL',
                'name': 'Welcome Email',
                'description': 'Welcome email for new users',
                'template_type': NotificationTemplate.TemplateType.EMAIL,
                'subject': 'Welcome to {{company_name}}!',
                'content': '''
                <h1>Welcome {{user_name}}!</h1>
                <p>Thank you for joining {{company_name}}. We're excited to have you as part of our community.</p>
                <p>Your account has been successfully created and you can now start shopping with us.</p>
                <p>Best regards,<br>The {{company_name}} Team</p>
                ''',
                'is_active': True,
            },
            {
                'code': 'ORDER_CONFIRMATION',
                'name': 'Order Confirmation',
                'description': 'Order confirmation email',
                'template_type': NotificationTemplate.TemplateType.EMAIL,
                'subject': 'Order Confirmation - {{order_number}}',
                'content': '''
                <h1>Order Confirmation</h1>
                <p>Dear {{user_name}},</p>
                <p>Thank you for your order! Your order #{{order_number}} has been confirmed.</p>
                <p>Order Total: {{order_total}}</p>
                <p>We'll send you another email when your order ships.</p>
                <p>Best regards,<br>{{company_name}}</p>
                ''',
                'is_active': True,
            },
            {
                'code': 'PASSWORD_RESET',
                'name': 'Password Reset',
                'description': 'Password reset email template',
                'template_type': NotificationTemplate.TemplateType.EMAIL,
                'subject': 'Reset Your Password',
                'content': '''
                <h1>Password Reset Request</h1>
                <p>Dear {{user_name}},</p>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <p><a href="{{reset_link}}">Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>{{company_name}}</p>
                ''',
                'is_active': True,
            },
            {
                'code': 'PROMOTION_SMS',
                'name': 'Promotion SMS',
                'description': 'SMS template for promotions',
                'template_type': NotificationTemplate.TemplateType.SMS,
                'subject': '',
                'content': 'Hi {{user_name}}! Get {{discount}}% off your next order with code {{coupon_code}}. Valid until {{expiry_date}}. Shop now!',
                'is_active': True,
            },
            {
                'code': 'LOW_STOCK_ALERT',
                'name': 'Low Stock Alert',
                'description': 'Internal notification for low stock',
                'template_type': NotificationTemplate.TemplateType.INTERNAL,
                'subject': 'Low Stock Alert - {{item_name}}',
                'content': 'Item {{item_name}} ({{item_code}}) is running low. Current stock: {{current_stock}}. Minimum threshold: {{min_threshold}}.',
                'is_active': True,
            },
        ]

        templates = []
        for data in templates_data:
            try:
                template, created = NotificationTemplate.objects.get_or_create(
                    branch=branch,
                    code=data['code'],
                    defaults=data
                )
                templates.append(template)
            except Exception as e:
                logger.error(f"Error creating notification template {data['code']}: {str(e)}")
                continue

        return templates

    def create_sample_notifications(self, branch, admin_user, notification_templates):
        """Create sample notifications for testing"""
        try:
            # Find templates
            welcome_template = next((t for t in notification_templates if t.code == 'WELCOME_EMAIL'), None)
            order_template = next((t for t in notification_templates if t.code == 'ORDER_CONFIRMATION'), None)
            
            if welcome_template:
                # Create welcome notification
                Notification.objects.get_or_create(
                    branch=branch,
                    template=welcome_template,
                    recipient_user=admin_user,
                    defaults={
                        'subject': 'Welcome to Our E-commerce Platform!',
                        'content': f'''
                        <h1>Welcome {admin_user.first_name}!</h1>
                        <p>Thank you for joining our platform. We're excited to have you as part of our community.</p>
                        <p>Your admin account has been successfully created and you can now manage the system.</p>
                        <p>Best regards,<br>The Platform Team</p>
                        ''',
                        'channel': Notification.Channel.EMAIL,
                        'priority': Notification.Priority.NORMAL,
                        'status': Notification.Status.SENT,
                        'sent_at': timezone.now(),
                    }
                )

            if order_template:
                # Create sample order confirmation
                Notification.objects.get_or_create(
                    branch=branch,
                    template=order_template,
                    recipient_user=admin_user,
                    defaults={
                        'subject': 'Order Confirmation - #ORD-001',
                        'content': f'''
                        <h1>Order Confirmation</h1>
                        <p>Dear {admin_user.first_name},</p>
                        <p>Thank you for your order! Your order #ORD-001 has been confirmed.</p>
                        <p>Order Total: $150.00</p>
                        <p>We'll send you another email when your order ships.</p>
                        <p>Best regards,<br>Our E-commerce Platform</p>
                        ''',
                        'channel': Notification.Channel.EMAIL,
                        'priority': Notification.Priority.HIGH,
                        'status': Notification.Status.PENDING,
                    }
                )

        except Exception as e:
            logger.error(f"Error creating sample notifications: {str(e)}")

    def create_sample_data(self, branch, currency):
        """Create sample store groups, item groups, and products"""
        try:
            stock_account = Account.objects.filter(branch=branch, code='1132', account_nature='inventory').first()
            sales_account = Account.objects.filter(branch=branch, code='4110').first()
            cost_account = Account.objects.filter(branch=branch, code='5100').first()

            apparel_store, _ = StoreGroup.objects.get_or_create(
                branch=branch,
                code="APP",
                defaults={
                    'name': "Apparel",
                    'cost_method': StoreGroup.CostMethod.AVERAGE,
                    'stock_account': stock_account,
                    'sales_account': sales_account,
                    'cost_of_sales_account': cost_account,
                }
            )
            electronics_store, _ = StoreGroup.objects.get_or_create(
                branch=branch,
                code="ELEC",
                defaults={
                    'name': "Electronics",
                    'cost_method': StoreGroup.CostMethod.AVERAGE,
                    'stock_account': stock_account,
                    'sales_account': sales_account,
                    'cost_of_sales_account': cost_account,
                }
            )

            mens_clothing, _ = ItemGroup.objects.get_or_create(
                branch=branch,
                store_group=apparel_store,
                code="MEN",
                defaults={
                    'name': "Men's Clothing",
                    'group_type': ItemGroup.GroupType.PRODUCT,
                }
            )
            womens_clothing, _ = ItemGroup.objects.get_or_create(
                branch=branch,
                store_group=apparel_store,
                code="WOMEN",
                defaults={
                    'name': "Women's Clothing",
                    'group_type': ItemGroup.GroupType.PRODUCT,
                }
            )
            smartphones, _ = ItemGroup.objects.get_or_create(
                branch=branch,
                store_group=electronics_store,
                code="PHONE",
                defaults={
                    'name': "Smartphones",
                    'group_type': ItemGroup.GroupType.PRODUCT,
                }
            )

            self.create_sample_t_shirt(branch, mens_clothing, currency)
            self.create_sample_dress(branch, womens_clothing, currency)
            self.create_sample_smartphone(branch, smartphones, currency)
        except Exception as e:
            logger.error(f"Error creating sample data: {str(e)}")

    def create_sample_coupons_and_reviews(self, self, branch, admin_user):
        """Create sample coupons, offers, campaigns, and reviews"""
        try:
            # Create sample offers
            percentage_offer, _ = Offer.objects.get_or_create(
                branch=branch,
                code="SUMMER20",
                defaults={
                    'name': "Summer Sale 20% Off",
                    'offer_type': Offer.OfferType.PERCENTAGE_DISCOUNT,
                    'discount_percentage': Decimal('20.00'),
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timezone.timedelta(days=30),
                    'is_active': True,
                    'max_uses': 1000,
                    'current_uses': 0,
                    'min_order_amount': Decimal('50.00'),
                    'max_discount_amount': Decimal('100.00'),
                }
            )

            fixed_offer, _ = Offer.objects.get_or_create(
                branch=branch,
                code="WELCOME10",
                defaults={
                    'name': "Welcome $10 Off",
                    'offer_type': Offer.OfferType.FIXED_DISCOUNT,
                    'discount_amount': Decimal('10.00'),
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timezone.timedelta(days=90),
                    'is_active': True,
                    'max_uses': 500,
                    'current_uses': 0,
                    'min_order_amount': Decimal('25.00'),
                }
            )

            # Create sample coupons
            summer_coupon, _ = Coupon.objects.get_or_create(
                offer=percentage_offer,
                code="SUMMER2024",
                defaults={
                    'is_active': True,
                    'usage_limit': 100,
                    'used_count': 0,
                    'expires_at': timezone.now() + timezone.timedelta(days=30),
                }
            )

            welcome_coupon, _ = Coupon.objects.get_or_create(
                offer=fixed_offer,
                code="WELCOME2024",
                defaults={
                    'is_active': True,
                    'usage_limit': 50,
                    'used_count': 0,
                    'expires_at': timezone.now() + timezone.timedelta(days=90),
                }
            )

            # Create sample campaign
            summer_campaign, _ = Campaign.objects.get_or_create(
                branch=branch,
                code="SUMMER_CAMPAIGN",
                defaults={
                    'name': "Summer 2024 Campaign",
                    'description': "Summer promotional campaign with discounts and special offers",
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timezone.timedelta(days=60),
                    'is_active': True,
                    'budget': Decimal('10000.00'),
                    'target_audience': Campaign.TargetAudience.ALL_CUSTOMERS,
                    'content': "Get ready for summer with our amazing deals! Use code SUMMER2024 for 20% off your order.",
                }
            )

            # Add offers to campaign
            summer_campaign.offers.add(percentage_offer, fixed_offer)

            # Create sample reviews for products
            items = Item.objects.filter(branch=branch)
            if items.exists():
                sample_reviews = [
                    {
                        'rating': 5,
                        'comment': "Great product, exactly as described. Fast shipping and excellent customer service.",
                        'is_verified_purchase': True,
                    },
                    {
                        'rating': 4,
                        'comment': "Nice product overall. Good quality and fits well. Would recommend to others.",
                        'is_verified_purchase': True,
                    },
                    {
                        'rating': 5,
                        'comment': "Perfect fit and great material. Will definitely buy again.",
                        'is_verified_purchase': False,
                    },
                ]

                for item in items[:3]:  # Add reviews to first 3 items
                    for i, review_data in enumerate(sample_reviews):
                        ItemReview.objects.get_or_create(
                            item=item,
                            user=admin_user,
                            rating=review_data['rating'],
                            defaults={
                                'comment': review_data['comment'],
                                'is_verified_purchase': review_data['is_verified_purchase'],
                                'is_approved': True,
                            }
                        )

        except Exception as e:
            logger.error(f"Error creating sample coupons and reviews: {str(e)}")

    def create_sample_t_shirt(self, branch, item_group, currency):
        """Create a sample T-shirt product"""
        try:
            t_shirt, _ = Item.objects.get_or_create(
                branch=branch,
                item_group=item_group,
                code="TSHIRT",
                defaults={
                    'name': "Men's T-Shirt",
                    'description': "Comfortable cotton T-shirt",
                    'price': Decimal('20.00'),
                    'currency': currency,
                }
            )
            ItemVariant.objects.get_or_create(
                item=t_shirt,
                code="TSHIRT-S",
                defaults={
                    'name': "Small",
                    'price': Decimal('20.00'),
                }
            )
            ItemVariant.objects.get_or_create(
                item=t_shirt,
                code="TSHIRT-M",
                defaults={
                    'name': "Medium",
                    'price': Decimal('20.00'),
                }
            )
            ItemVariant.objects.get_or_create(
                item=t_shirt,
                code="TSHIRT-L",
                defaults={
                    'name': "Large",
                    'price': Decimal('20.00'),
                }
            )
            ItemUnit.objects.get_or_create(
                item=t_shirt,
                code="PCS",
                defaults={
                    'name': "Pieces",
                }
            )
            ItemBarcode.objects.get_or_create(
                item=t_shirt,
                code="1234567890123",
                defaults={
                    'barcode_type': ItemBarcode.BarcodeType.EAN_13,
                }
            )
            InventoryBalance.objects.get_or_create(
                item=t_shirt,
                defaults={
                    'quantity': 100,
                }
            )
        except Exception as e:
            logger.error(f"Error creating sample T-shirt: {str(e)}")

    def create_sample_dress(self, branch, item_group, currency):
        """Create a sample dress product"""
        try:
            dress, _ = Item.objects.get_or_create(
                branch=branch,
                item_group=item_group,
                code="DRESS",
                defaults={
                    'name': "Women's Dress",
                    'description': "Stylish silk dress",
                    'price': Decimal('50.00'),
                    'currency': currency,
                }
            )
            ItemVariant.objects.get_or_create(
                item=dress,
                code="DRESS-S",
                defaults={
                    'name': "Small",
                    'price': Decimal('50.00'),
                }
            )
            ItemVariant.objects.get_or_create(
                item=dress,
                code="DRESS-M",
                defaults={
                    'name': "Medium",
                    'price': Decimal('50.00'),
                }
            )
            ItemVariant.objects.get_or_create(
                item=dress,
                code="DRESS-L",
                defaults={
                    'name': "Large",
                    'price': Decimal('50.00'),
                }
            )
            ItemUnit.objects.get_or_create(
                item=dress,
                code="PCS",
                defaults={
                    'name': "Pieces",
                }
            )
            ItemBarcode.objects.get_or_create(
                item=dress,
                code="4567890123456",
                defaults={
                    'barcode_type': ItemBarcode.BarcodeType.EAN_13,
                }
            )
            InventoryBalance.objects.get_or_create(
                item=dress,
                defaults={
                    'quantity': 50,
                }
            )
        except Exception as e:
            logger.error(f"Error creating sample dress: {str(e)}")

    def create_sample_smartphone(self, branch, item_group, currency):
        """Create a sample smartphone product"""
        try:
            smartphone, _ = Item.objects.get_or_create(
                branch=branch,
                item_group=item_group,
                code="SMARTPHONE",
                defaults={
                    'name': "Smartphone",
                    'description': "Latest model smartphone",
                    'price': Decimal('300.00'),
                    'currency': currency,
                }
            )
            ItemVariant.objects.get_or_create(
                item=smartphone,
                code="SMARTPHONE-128GB",
                defaults={
                    'name': "128GB Storage",
                    'price': Decimal('300.00'),
                }
            )
            ItemVariant.objects.get_or_create(
                item=smartphone,
                code="SMARTPHONE-256GB",
                defaults={
                    'name': "256GB Storage",
                    'price': Decimal('350.00'),
                }
            )
            ItemUnit.objects.get_or_create(
                item=smartphone,
                code="PCS",
                defaults={
                    'name': "Pieces",
                }
            )
            ItemBarcode.objects.get_or_create(
                item=smartphone,
                code="7890123456789",
                defaults={
                    'barcode_type': ItemBarcode.BarcodeType.EAN_13,
                }
            )
            InventoryBalance.objects.get_or_create(
                item=smartphone,
                defaults={
                    'quantity': 30,
                }
            )
        except Exception as e:
            logger.error(f"Error creating sample smartphone: {str(e)}")
