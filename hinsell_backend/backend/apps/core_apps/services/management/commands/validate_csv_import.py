"""
Django management command to validate CSV files before import.
Provides detailed validation reports and suggestions for fixing issues.
"""

import csv
from typing import List
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Validate CSV files before import to identify potential issues'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--accounts-csv',
            type=str,
            help='Path to CSV file containing account names'
        )
        parser.add_argument(
            '--items-csv',
            type=str,
            help='Path to CSV file containing items'
        )
        parser.add_argument(
            '--reports-csv',
            type=str,
            help='Path to CSV file containing report names'
        )
        parser.add_argument(
            '--max-errors',
            type=int,
            default=50,
            help='Maximum number of errors to display per file'
        )

    def handle(self, *args, **options):
        """Main validation handler"""
        self.max_errors = options['max_errors']
        total_issues = 0
        
        if options['accounts_csv']:
            issues = self._validate_accounts_csv(options['accounts_csv'])
            total_issues += issues
        
        if options['items_csv']:
            issues = self._validate_items_csv(options['items_csv'])
            total_issues += issues
        
        if options['reports_csv']:
            issues = self._validate_reports_csv(options['reports_csv'])
            total_issues += issues
        
        if total_issues == 0:
            self.stdout.write(
                self.style.SUCCESS('All CSV files are valid and ready for import!')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Found {total_issues} total issues across all files')
            )

    def _validate_accounts_csv(self, csv_file_path: str) -> int:
        """Validate accounts CSV file"""
        self.stdout.write(f'\nValidating accounts CSV: {csv_file_path}')
        
        issues = []
        row_count = 0
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                # Detect delimiter
                sample = file.read(1024)
                file.seek(0)
                delimiter = self._detect_delimiter(sample)
                
                reader = csv.DictReader(file, delimiter=delimiter)
                
                # Check headers
                expected_headers = ['account_name']
                if not self._validate_headers(reader.fieldnames, expected_headers):
                    issues.append(f"Missing required columns: {', '.join(expected_headers)}")
                    issues.append(f"Found columns: {', '.join(reader.fieldnames or [])}")
                
                # Validate data rows
                seen_names = set()
                for row_num, row in enumerate(reader, start=2):
                    row_count += 1
                    
                    account_name = row.get('account_name', '').strip()
                    
                    if not account_name:
                        issues.append(f"Row {row_num}: Empty account name")
                        continue
                    
                    if len(account_name) > 250:
                        issues.append(f"Row {row_num}: Account name too long (max 250 chars): {account_name[:50]}...")
                    
                    if account_name.lower() in seen_names:
                        issues.append(f"Row {row_num}: Duplicate account name: {account_name}")
                    else:
                        seen_names.add(account_name.lower())
                    
                    # Check for special characters that might cause issues
                    if any(char in account_name for char in ['<', '>', '"', "'"]):
                        issues.append(f"Row {row_num}: Account name contains special characters: {account_name}")
                
        except FileNotFoundError:
            issues.append(f"File not found: {csv_file_path}")
        except Exception as e:
            issues.append(f"Error reading file: {str(e)}")
        
        self._report_validation_results('Accounts', row_count, issues)
        return len(issues)

    def _validate_items_csv(self, csv_file_path: str) -> int:
        """Validate items CSV file"""
        self.stdout.write(f'\nValidating items CSV: {csv_file_path}')
        
        issues = []
        row_count = 0
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                # Detect delimiter
                sample = file.read(1024)
                file.seek(0)
                delimiter = self._detect_delimiter(sample)
                
                reader = csv.DictReader(file, delimiter=delimiter)
                
                # Check headers
                expected_headers = ['scientific_name', 'english_name', 'base_unit']
                if not self._validate_headers(reader.fieldnames, expected_headers):
                    issues.append(f"Missing required columns: {', '.join(expected_headers)}")
                    issues.append(f"Found columns: {', '.join(reader.fieldnames or [])}")
                
                # Validate data rows
                seen_scientific_names = set()
                valid_units = {'piece', 'box', 'bottle', 'tablet', 'capsule', 'ml', 'mg', 'g', 'kg', 'strip', 'vial'}
                
                for row_num, row in enumerate(reader, start=2):
                    row_count += 1
                    
                    scientific_name = row.get('scientific_name', '').strip()
                    english_name = row.get('english_name', '').strip()
                    base_unit = row.get('base_unit', '').strip().lower()
                    
                    # Check required fields
                    if not scientific_name:
                        issues.append(f"Row {row_num}: Empty scientific name")
                        continue
                    
                    if not english_name:
                        issues.append(f"Row {row_num}: Empty English name")
                    
                    if not base_unit:
                        issues.append(f"Row {row_num}: Empty base unit")
                    
                    # Check field lengths
                    if len(scientific_name) > 200:
                        issues.append(f"Row {row_num}: Scientific name too long (max 200 chars)")
                    
                    if len(english_name) > 200:
                        issues.append(f"Row {row_num}: English name too long (max 200 chars)")
                    
                    if len(base_unit) > 20:
                        issues.append(f"Row {row_num}: Base unit too long (max 20 chars)")
                    
                    # Check for duplicates
                    if scientific_name.lower() in seen_scientific_names:
                        issues.append(f"Row {row_num}: Duplicate scientific name: {scientific_name}")
                    else:
                        seen_scientific_names.add(scientific_name.lower())
                    
                    # Validate base unit
                    if base_unit and base_unit not in valid_units:
                        issues.append(f"Row {row_num}: Unusual base unit '{base_unit}' (common units: {', '.join(sorted(valid_units))})")
                
        except FileNotFoundError:
            issues.append(f"File not found: {csv_file_path}")
        except Exception as e:
            issues.append(f"Error reading file: {str(e)}")
        
        self._report_validation_results('Items', row_count, issues)
        return len(issues)

    def _validate_reports_csv(self, csv_file_path: str) -> int:
        """Validate reports CSV file"""
        self.stdout.write(f'\nValidating reports CSV: {csv_file_path}')
        
        issues = []
        row_count = 0
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                # Detect delimiter
                sample = file.read(1024)
                file.seek(0)
                delimiter = self._detect_delimiter(sample)
                
                reader = csv.DictReader(file, delimiter=delimiter)
                
                # Check headers
                expected_headers = ['report_name']
                if not self._validate_headers(reader.fieldnames, expected_headers):
                    issues.append(f"Missing required columns: {', '.join(expected_headers)}")
                    issues.append(f"Found columns: {', '.join(reader.fieldnames or [])}")
                
                # Validate data rows
                seen_names = set()
                for row_num, row in enumerate(reader, start=2):
                    row_count += 1
                    
                    report_name = row.get('report_name', '').strip()
                    
                    if not report_name:
                        issues.append(f"Row {row_num}: Empty report name")
                        continue
                    
                    if len(report_name) > 200:
                        issues.append(f"Row {row_num}: Report name too long (max 200 chars)")
                    
                    if report_name.lower() in seen_names:
                        issues.append(f"Row {row_num}: Duplicate report name: {report_name}")
                    else:
                        seen_names.add(report_name.lower())
                
        except FileNotFoundError:
            issues.append(f"File not found: {csv_file_path}")
        except Exception as e:
            issues.append(f"Error reading file: {str(e)}")
        
        self._report_validation_results('Reports', row_count, issues)
        return len(issues)

    def _detect_delimiter(self, sample: str) -> str:
        """Detect CSV delimiter"""
        delimiters = [',', ';', '\t', '|']
        delimiter_counts = {}
        
        for delimiter in delimiters:
            delimiter_counts[delimiter] = sample.count(delimiter)
        
        return max(delimiter_counts, key=delimiter_counts.get)

    def _validate_headers(self, actual_headers: List[str], expected_headers: List[str]) -> bool:
        """Validate CSV headers"""
        if not actual_headers:
            return False
        
        actual_headers_lower = [h.lower().strip() for h in actual_headers]
        expected_headers_lower = [h.lower() for h in expected_headers]
        
        return all(header in actual_headers_lower for header in expected_headers_lower)

    def _report_validation_results(self, entity_type: str, row_count: int, issues: List[str]):
        """Report validation results"""
        if not issues:
            self.stdout.write(
                self.style.SUCCESS(f'✓ {entity_type} CSV is valid ({row_count} rows)')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'✗ {entity_type} CSV has {len(issues)} issues ({row_count} rows):')
            )
            
            for i, issue in enumerate(issues[:self.max_errors]):
                self.stdout.write(f'  {i+1}. {issue}')
            
            if len(issues) > self.max_errors:
                self.stdout.write(f'  ... and {len(issues) - self.max_errors} more issues')
