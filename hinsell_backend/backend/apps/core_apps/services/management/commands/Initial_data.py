"""
Fixed and optimized Django management command for importing pharmacy data from CSV files.
Enhanced with proper database detection and error handling for PostgreSQL, MySQL, and SQLite.
"""

import csv
import logging
import time
import sys
from collections import defaultdict
from decimal import Decimal
from typing import Dict, List, Tuple, Any, Optional, Set
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction, IntegrityError, connection
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.conf import settings

# Import your models here - adjust paths as needed
try:
    from apps.organization.models import Company, Branch
    from apps.accounting.models import Account, AccountType, Currency
    from apps.inventory.models import Item, ItemGroup, StoreGroup
    from apps.reporting.models import ReportTemplate, ReportCategory
    from apps.authentication.models import User
except ImportError as e:
    # Handle import errors gracefully
    print(f"Warning: Could not import some models: {e}")

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'High-performance import of pharmacy data from CSV files with database compatibility'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.stats = {
            'start_time': None,
            'processed_rows': 0,
            'successful_creates': 0,
            'errors': 0,
            'warnings': 0,
            'skipped_rows': 0
        }
        
        # Performance caches
        self._existing_accounts_cache = set()
        self._existing_items_cache = set()
        self._code_counters = defaultdict(int)
        self._validation_cache = {}
        self._db_engine = None
        
    def add_arguments(self, parser):
        parser.add_argument('--company-name', type=str, required=True, help='Company name')
        parser.add_argument('--branch-name', type=str, required=True, help='Branch name')
        parser.add_argument('--accounts-csv', type=str, help='Accounts CSV file path')
        parser.add_argument('--items-csv', type=str, help='Items CSV file path')
        parser.add_argument('--reports-csv', type=str, help='Reports CSV file path')
        parser.add_argument('--batch-size', type=int, default=1000, help='Batch size (default: 1000)')
        parser.add_argument('--skip-errors', action='store_true', help='Skip errors and continue')
        parser.add_argument('--dry-run', action='store_true', help='Dry run without saving')
        parser.add_argument('--no-optimize', action='store_true', help='Skip database optimizations')
        parser.add_argument('--verbose', action='store_true', help='Verbose output')

    def handle(self, *args, **options):
        """Main handler with improved error handling"""
        self.stats['start_time'] = time.time()
        self.batch_size = options['batch_size']
        self.skip_errors = options['skip_errors']
        self.dry_run = options['dry_run']
        self.no_optimize = options['no_optimize']
        self.verbose = options['verbose']
        
        # Detect database engine
        self._detect_database_engine()
        
        if self.dry_run:
            self.stdout.write(self.style.WARNING('🔍 DRY RUN MODE - No data will be saved'))
        
        if self.verbose:
            self.stdout.write(f'🗄️ Database engine detected: {self._db_engine}')
        
        try:
            # Setup optimizations if not disabled
            if not self.no_optimize:
                self._setup_performance_optimizations()
            
            # Step 1: Create company and branch
            company, branch = self._create_company_and_branch(
                options['company_name'], options['branch_name']
            )
            
            # Step 2: Import data sequentially with progress tracking
            if options['accounts_csv']:
                self._import_accounts(branch, options['accounts_csv'])
            
            if options['items_csv']:
                self._import_items(branch, options['items_csv'])
            
            if options['reports_csv']:
                self._import_reports(options['reports_csv'])
            
            # Performance summary
            self._print_performance_summary()
            
        except Exception as e:
            logger.error(f"Import failed: {str(e)}", exc_info=True)
            self.stdout.write(self.style.ERROR(f"❌ Import failed: {str(e)}"))
            if not self.skip_errors:
                raise CommandError(f"Import failed: {str(e)}")
        finally:
            if not self.no_optimize:
                self._cleanup_performance_optimizations()

    def _detect_database_engine(self):
        """Detect the database engine being used"""
        try:
            engine = connection.settings_dict['ENGINE'].lower()
            if 'postgresql' in engine:
                self._db_engine = 'postgresql'
            elif 'mysql' in engine:
                self._db_engine = 'mysql'
            elif 'sqlite' in engine:
                self._db_engine = 'sqlite'
            else:
                self._db_engine = 'unknown'
        except Exception as e:
            logger.warning(f"Could not detect database engine: {e}")
            self._db_engine = 'unknown'

    def _setup_performance_optimizations(self):
        """Setup database optimizations based on detected engine"""
        if self.dry_run:
            return
        
        try:
            with connection.cursor() as cursor:
                if self._db_engine == 'postgresql':
                    self._setup_postgresql_optimizations(cursor)
                elif self._db_engine == 'mysql':
                    self._setup_mysql_optimizations(cursor)
                elif self._db_engine == 'sqlite':
                    self._setup_sqlite_optimizations(cursor)
                
                if self.verbose:
                    self.stdout.write('⚡ Database optimizations applied')
                    
        except Exception as e:
            logger.warning(f"Could not apply database optimizations: {e}")
            if self.verbose:
                self.stdout.write(f'⚠️ Database optimization warning: {e}')

    def _setup_postgresql_optimizations(self, cursor):
        """PostgreSQL-specific optimizations"""
        try:
            cursor.execute("SET synchronous_commit = OFF")
            cursor.execute("SET checkpoint_completion_target = 0.9")
            cursor.execute("SET wal_buffers = '16MB'")
            cursor.execute("SET maintenance_work_mem = '256MB'")
        except Exception as e:
            logger.warning(f"PostgreSQL optimization failed: {e}")

    def _setup_mysql_optimizations(self, cursor):
        """MySQL-specific optimizations"""
        try:
            cursor.execute("SET foreign_key_checks = 0")
            cursor.execute("SET unique_checks = 0")
            cursor.execute("SET sql_log_bin = 0")
            cursor.execute("SET innodb_flush_log_at_trx_commit = 0")
            cursor.execute("SET bulk_insert_buffer_size = 256*1024*1024")
        except Exception as e:
            logger.warning(f"MySQL optimization failed: {e}")

    def _setup_sqlite_optimizations(self, cursor):
        """SQLite-specific optimizations"""
        try:
            cursor.execute("PRAGMA synchronous = OFF")
            cursor.execute("PRAGMA journal_mode = MEMORY")
            cursor.execute("PRAGMA temp_store = MEMORY")
            cursor.execute("PRAGMA cache_size = 10000")
        except Exception as e:
            logger.warning(f"SQLite optimization failed: {e}")

    def _cleanup_performance_optimizations(self):
        """Restore normal database settings"""
        if self.dry_run:
            return
        
        try:
            with connection.cursor() as cursor:
                if self._db_engine == 'postgresql':
                    self._cleanup_postgresql_optimizations(cursor)
                elif self._db_engine == 'mysql':
                    self._cleanup_mysql_optimizations(cursor)
                elif self._db_engine == 'sqlite':
                    self._cleanup_sqlite_optimizations(cursor)
                
                # Commit any pending transactions
                cursor.execute("COMMIT")
                
                if self.verbose:
                    self.stdout.write('🔄 Database settings restored')
                    
        except Exception as e:
            logger.warning(f"Could not restore database settings: {e}")

    def _cleanup_postgresql_optimizations(self, cursor):
        """Restore PostgreSQL settings"""
        try:
            cursor.execute("SET synchronous_commit = ON")
        except Exception as e:
            logger.warning(f"PostgreSQL cleanup failed: {e}")

    def _cleanup_mysql_optimizations(self, cursor):
        """Restore MySQL settings"""
        try:
            cursor.execute("SET foreign_key_checks = 1")
            cursor.execute("SET unique_checks = 1")
            cursor.execute("SET sql_log_bin = 1")
            cursor.execute("SET innodb_flush_log_at_trx_commit = 1")
        except Exception as e:
            logger.warning(f"MySQL cleanup failed: {e}")

    def _cleanup_sqlite_optimizations(self, cursor):
        """Restore SQLite settings"""
        try:
            cursor.execute("PRAGMA synchronous = NORMAL")
            cursor.execute("PRAGMA journal_mode = DELETE")
        except Exception as e:
            logger.warning(f"SQLite cleanup failed: {e}")

    def _create_company_and_branch(self, company_name: str, branch_name: str) -> Tuple[Company, Branch]:
        """Create company and branch with error handling"""
        self.stdout.write(f'🏢 Creating company: {company_name}')
        
        if not self.dry_run:
            try:
                with transaction.atomic():
                    # Create or get company
                    company, created = Company.objects.get_or_create(
                        company_name=company_name,
                        defaults={
                            'company_name_english': company_name,
                            'description': f'Auto-created: {company_name}',
                            'industry': 'Pharmaceutical',
                            'established_date': timezone.now().date(),
                        }
                    )
                    
                    if created:
                        self.stdout.write(f'✅ Created company: {company_name}')
                    else:
                        self.stdout.write(f'📋 Using existing company: {company_name}')
                    
                    # Create branch
                    branch_code = self._generate_branch_code(company, branch_name)
                    branch, created = Branch.objects.get_or_create(
                        company=company,
                        branch_code=branch_code,
                        defaults={
                            'branch_name': branch_name,
                            'branch_name_english': branch_name,
                            'is_primary': True,
                            'is_headquarters': True,
                            'current_fiscal_year': timezone.now().year,
                            'use_expire_date': True,
                            'use_batch_no': True,
                            'use_barcode': True,
                        }
                    )
                    
                    if created:
                        self.stdout.write(f'✅ Created branch: {branch_name}')
                    else:
                        self.stdout.write(f'📋 Using existing branch: {branch_name}')
                    
                    # Create default currency
                    self._create_default_currency(branch)
                    
                    return company, branch
                    
            except Exception as e:
                logger.error(f"Error creating company/branch: {e}")
                raise CommandError(f"Failed to create company/branch: {e}")
        else:
            # Dry run - return mock objects
            return Company(company_name=company_name), Branch(branch_name=branch_name)

    def _import_accounts(self, branch: Branch, csv_file_path: str):
        """Import accounts with improved error handling and progress tracking"""
        self.stdout.write(f'💰 Importing accounts from: {csv_file_path}')
        
        try:
            # Pre-load existing accounts
            existing_accounts = set(
                Account.objects.filter(branch=branch)
                .values_list('account_name', flat=True)
            )
            
            # Get or create default account type
            account_type = self._get_or_create_default_account_type(branch)
            
            accounts_to_create = []
            processed_count = 0
            error_count = 0
            
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                # Detect delimiter
                sample = file.read(1024)
                file.seek(0)
                delimiter = self._detect_delimiter(sample)
                
                reader = csv.DictReader(file, delimiter=delimiter)
                
                # Find account name column
                account_name_column = self._find_account_name_column(reader.fieldnames)
                if not account_name_column:
                    raise CommandError("Could not find account name column in CSV")
                
                for row_num, row in enumerate(reader, start=2):
                    try:
                        account_name = row.get(account_name_column, '').strip()
                        
                        # Skip empty or duplicate accounts
                        if not account_name or account_name in existing_accounts:
                            continue
                        
                        # Validate account name
                        if len(account_name) > 250:
                            if self.skip_errors:
                                self.stats['warnings'] += 1
                                continue
                            else:
                                raise ValidationError(f"Account name too long: {account_name[:50]}...")
                        
                        # Generate unique account code
                        account_code = self._generate_account_code(branch, account_name, existing_accounts)
                        
                        account = Account(
                            branch=branch,
                            account_type=account_type,
                            account_code=account_code,
                            account_name=account_name,
                            account_name_english=account_name,
                            account_nature=Account.AccountNature.OTHER,
                            currency=branch.default_currency,
                        )
                        
                        # Validate the account
                        account.full_clean()
                        accounts_to_create.append(account)
                        existing_accounts.add(account_name)
                        processed_count += 1
                        
                        # Progress reporting
                        if processed_count % 500 == 0:
                            self.stdout.write(f'📊 Processed {processed_count} accounts...')
                        
                        # Bulk create when batch size is reached
                        if len(accounts_to_create) >= self.batch_size:
                            created_count = self._bulk_create_accounts(accounts_to_create)
                            self.stats['successful_creates'] += created_count
                            accounts_to_create = []
                        
                    except Exception as e:
                        error_count += 1
                        error_msg = f"Row {row_num}: {str(e)}"
                        
                        if self.skip_errors:
                            logger.warning(error_msg)
                            self.stats['errors'] += 1
                        else:
                            raise CommandError(error_msg)
                
                # Create remaining accounts
                if accounts_to_create:
                    created_count = self._bulk_create_accounts(accounts_to_create)
                    self.stats['successful_creates'] += created_count
                
                self.stdout.write(f'✅ Accounts import completed: {processed_count} processed, {error_count} errors')
                
        except FileNotFoundError:
            raise CommandError(f"CSV file not found: {csv_file_path}")
        except Exception as e:
            raise CommandError(f"Error importing accounts: {str(e)}")

    def _import_items(self, branch: Branch, csv_file_path: str):
        """Import items with improved error handling"""
        self.stdout.write(f'💊 Importing items from: {csv_file_path}')
        
        try:
            # Pre-load existing items
            existing_items = set(
                Item.objects.filter(branch=branch)
                .values_list('scientific_name', flat=True)
            )
            
            # Get or create default groups
            store_group = self._get_or_create_default_store_group(branch)
            item_group = self._get_or_create_default_item_group(branch, store_group)
            
            items_to_create = []
            processed_count = 0
            error_count = 0
            

            
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                # Detect delimiter
                sample = file.read(1024)
                file.seek(0)
                delimiter = self._detect_delimiter(sample)
                
                reader = csv.DictReader(file, delimiter=delimiter)
                
                # Find item columns
                column_mapping = self._find_item_columns(reader.fieldnames)
                
                for row_num, row in enumerate(reader, start=2):
                    try:
                        scientific_name = row.get(column_mapping.get('scientific_name', ''), '').strip()
                        english_name = row.get(column_mapping.get('english_name', ''), scientific_name).strip()
                        base_unit = row.get(column_mapping.get('base_unit', ''), 'piece').strip().lower()
                        
                        # Skip empty or duplicate items
                        if not scientific_name:
                            scientific_name = "Unnamed Item"
                        
                        # Validate fields
                        if len(scientific_name) > 200:
                            if self.skip_errors:
                                self.stats['warnings'] += 1
                                continue
                            else:
                                raise ValidationError(f"Scientific name too long: {scientific_name[:50]}...")
                        
                        if not english_name:
                            english_name = scientific_name
        

                        # Generate unique item code
                        item_code = self._generate_item_code(branch, scientific_name, existing_items)
                        
                        item = Item(
                            branch=branch,
                            item_group=item_group,
                            item_code=item_code,
                            item_name=english_name,
                            item_name_english=english_name,
                            scientific_name=scientific_name,
                            base_unit=base_unit or 'piece',
                            item_type=Item.ItemType.PRODUCT,
                            track_expiry=True,
                            track_batches=True,
                            standard_cost=Decimal('0.0000'),
                            sales_price=Decimal('0.0000'),
                            reorder_level=Decimal('10.0000'),
                            minimum_order_quantity=Decimal('1.0000'),
                        )
                        
                        # Validate the item
                        item.full_clean()
                        items_to_create.append(item)
                        existing_items.add(scientific_name)
                        processed_count += 1
                        
                        # Progress reporting
                        if processed_count % 500 == 0:
                            self.stdout.write(f'📊 Processed {processed_count} items...')
                        
                        # Bulk create when batch size is reached
                        if len(items_to_create) >= self.batch_size:
                            created_count = self._bulk_create_items(items_to_create)
                            self.stats['successful_creates'] += created_count
                            items_to_create = []
                        
                    except Exception as e:
                        error_count += 1
                        error_msg = f"Row {row_num}: {str(e)}"
                        
                        if self.skip_errors:
                            logger.warning(error_msg)
                            self.stats['errors'] += 1
                        else:
                            raise CommandError(error_msg)
                
                # Create remaining items
                if items_to_create:
                    created_count = self._bulk_create_items(items_to_create)
                    self.stats['successful_creates'] += created_count
                
                self.stdout.write(f'✅ Items import completed: {processed_count} processed, {error_count} errors')
                
        except FileNotFoundError:
            raise CommandError(f"CSV file not found: {csv_file_path}")
        except Exception as e:
            raise CommandError(f"Error importing items: {str(e)}")

    def _bulk_create_accounts(self, accounts: List[Account]) -> int:
        """Bulk create accounts with error handling"""
        if not accounts or self.dry_run:
            return len(accounts) if self.dry_run else 0
        
        try:
            with transaction.atomic():
                Account.objects.bulk_create(accounts, ignore_conflicts=True)
                return len(accounts)
        except Exception as e:
            logger.error(f"Bulk create accounts failed: {e}")
            # Fallback to individual creates
            success_count = 0
            for account in accounts:
                try:
                    account.save()
                    success_count += 1
                except Exception as individual_error:
                    logger.warning(f"Failed to create account {account.account_name}: {individual_error}")
            return success_count

    def _bulk_create_items(self, items: List[Item]) -> int:
        """Bulk create items with error handling"""
        if not items or self.dry_run:
            return len(items) if self.dry_run else 0
        
        try:
            with transaction.atomic():
                Item.objects.bulk_create(items, ignore_conflicts=True)
                return len(items)
        except Exception as e:
            logger.error(f"Bulk create items failed: {e}")
            # Fallback to individual creates
            success_count = 0
            for item in items:
                try:
                    item.save()
                    success_count += 1
                except Exception as individual_error:
                    logger.warning(f"Failed to create item {item.scientific_name}: {individual_error}")
            return success_count

    # Helper methods
    def _detect_delimiter(self, sample: str) -> str:
        """Detect CSV delimiter"""
        delimiters = [',', ';', '\t', '|']
        return max(delimiters, key=sample.count)

    def _find_account_name_column(self, fieldnames: List[str]) -> Optional[str]:
        """Find account name column"""
        if not fieldnames:
            return None
        
        possible_names = ['account_name', 'account', 'name', 'title', 'description']
        fieldnames_lower = [f.lower().strip() for f in fieldnames]
        
        for possible_name in possible_names:
            if possible_name in fieldnames_lower:
                index = fieldnames_lower.index(possible_name)
                return fieldnames[index]
        
        return fieldnames[0] if fieldnames else None

    def _find_item_columns(self, fieldnames: List[str]) -> Dict[str, Optional[str]]:
        """Find item columns"""
        if not fieldnames:
            return {'scientific_name': None, 'english_name': None, 'base_unit': None}
        
        fieldnames_lower = [f.lower().strip() for f in fieldnames]
        result = {}
        
        # Scientific name
        for possible in ['scientific_name', 'scientific', 'generic_name', 'generic']:
            if possible in fieldnames_lower:
                idx = fieldnames_lower.index(possible)
                result['scientific_name'] = fieldnames[idx]
                break
        else:
            result['scientific_name'] = fieldnames[0] if fieldnames else None
        
        # English name
        for possible in ['english_name', 'english', 'trade_name', 'brand_name', 'name']:
            if possible in fieldnames_lower:
                idx = fieldnames_lower.index(possible)
                result['english_name'] = fieldnames[idx]
                break
        else:
            result['english_name'] = fieldnames[1] if len(fieldnames) > 1 else result['scientific_name']
        
        # Base unit
        for possible in ['base_unit', 'unit', 'uom', 'unit_of_measure']:
            if possible in fieldnames_lower:
                idx = fieldnames_lower.index(possible)
                result['base_unit'] = fieldnames[idx]
                break
        else:
            result['base_unit'] = fieldnames[2] if len(fieldnames) > 2 else None
        
        return result

    def _generate_account_code(self, branch: Branch, account_name: str, existing_names: set) -> str:
        """Generate unique account code"""
        base = ''.join(c.upper() for c in account_name if c.isalpha())[:3]
        if len(base) < 3:
            base = base.ljust(3, 'A')
        
        counter = self._code_counters[f"acc_{base}"]
        self._code_counters[f"acc_{base}"] += 1
        
        return f"{base}{counter:04d}"

    def _generate_item_code(self, branch: Branch, scientific_name: str, existing_names: set) -> str:
        """Generate unique item code"""
        base = ''.join(c.upper() for c in scientific_name if c.isalpha())[:4]
        if len(base) < 3:
            base = base.ljust(3, 'I')
        
        counter = self._code_counters[f"itm_{base}"]
        self._code_counters[f"itm_{base}"] += 1
        
        return f"{base}{counter:04d}"

    def _generate_branch_code(self, company: Company, branch_name: str) -> str:
        """Generate unique branch code"""
        base_code = ''.join(c.upper() for c in branch_name if c.isalnum())[:3]
        if len(base_code) < 3:
            base_code = base_code.ljust(3, '0')
        
        # Use timestamp for uniqueness
        import time
        timestamp_suffix = str(int(time.time()))[-3:]
        return f"{base_code}{timestamp_suffix}"

    def _get_or_create_default_account_type(self, branch: Branch) -> AccountType:
        """Get or create default account type"""
        account_type, created = AccountType.objects.get_or_create(
            branch=branch,
            type_code='GEN',
            defaults={
                'type_name': 'General',
                'category': AccountType.AccountCategory.ASSET,
                'normal_balance': 'debit',
            }
        )
        return account_type

    def _get_or_create_default_store_group(self, branch: Branch) -> StoreGroup:
        """Get or create default store group"""
        store_group, created = StoreGroup.objects.get_or_create(
            branch=branch,
            store_group_code='MAIN',
            defaults={
                'store_group_name': 'Main Store',
                'cost_method': StoreGroup.CostMethod.AVERAGE,
            }
        )
        return store_group

    def _get_or_create_default_item_group(self, branch: Branch, store_group: StoreGroup) -> ItemGroup:
        """Get or create default item group"""
        item_group, created = ItemGroup.objects.get_or_create(
            branch=branch,
            store_group=store_group,
            item_group_code='GEN',
            defaults={
                'item_group_name': 'General Items',
                'group_type': ItemGroup.GroupType.PRODUCT,
            }
        )
        return item_group

    def _create_default_currency(self, branch: Branch):
        """Create default currency"""
        currency, created = Currency.objects.get_or_create(
            branch=branch,
            currency_code='USD',
            defaults={
                'currency_name': 'US Dollar',
                'currency_symbol': '$',
                'is_local': True,
                'is_default': True,
                'decimal_places': 2,
                'exchange_rate': Decimal('1.00000000'),
            }
        )
        
        if not branch.default_currency:
            branch.default_currency = currency
            if not self.dry_run:
                branch.save(update_fields=['default_currency'])

    def _import_reports(self, csv_file_path: str):
        """Import report templates (placeholder)"""
        self.stdout.write(f'📊 Importing reports from: {csv_file_path}')
        # Implementation would be similar to accounts/items
        pass

    def _print_performance_summary(self):
        """Print performance summary"""
        elapsed_time = time.time() - self.stats['start_time']
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("🚀 IMPORT SUMMARY"))
        self.stdout.write("="*60)
        self.stdout.write(f"⏱️  Total Time: {elapsed_time:.2f} seconds")
        self.stdout.write(f"✅ Successful Creates: {self.stats['successful_creates']:,}")
        self.stdout.write(f"⚠️  Warnings: {self.stats['warnings']:,}")
        self.stdout.write(f"❌ Errors: {self.stats['errors']:,}")
        
        if elapsed_time > 0 and self.stats['successful_creates'] > 0:
            rate = self.stats['successful_creates'] / elapsed_time
            self.stdout.write(f"🔥 Processing Rate: {rate:.0f} records/second")
        
        self.stdout.write("="*60)
