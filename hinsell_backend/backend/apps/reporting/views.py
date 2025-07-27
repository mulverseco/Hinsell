from django.db.models import Sum, Count, Avg, Max, Min, F, Q, Case, When, Value
from django.db.models.functions import Coalesce
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.apps import apps
from django.core.cache import cache
from django.db import transaction
from django.core.exceptions import FieldError
from apps.reporting.models import ReportTemplate
from apps.reporting.serializers import ReportTemplateSerializer, ReportRequestSerializer
import time
import logging
from apps.core_apps.general import BaseViewSet

logger = logging.getLogger(__name__)

class ReportViewSet(BaseViewSet):
    queryset = ReportTemplate.objects.filter(is_active=True)
    serializer_class = ReportTemplateSerializer
    
    # Field mappings for different models
    FIELD_MAPPINGS = {
        'accounting.Account': {
            'account_name': 'account_name',
            'account_type__name': 'account_type__type_name',
            'parent__account_name': 'parent__account_name',
            'type_name': 'account_type__type_name',
        },
        'accounting.AccountType': {
            'name': 'type_name',
            'type_name': 'type_name',
        },
        'inventory.Item': {
            'name': 'item_name',
            'item_name': 'item_name',
            'group__name': 'item_group__item_group_name',
        },
        'transactions.TransactionHeader': {
            'customer__name': 'customer_account__account_name',
            'supplier__name': 'supplier_account__account_name',
        }
    }
    
    # Aggregation mappings
    AGGREGATION_MAPPINGS = {
        'SUM(ledger_entries__debit_amount)': lambda: Sum('ledger_entries__debit_amount'),
        'SUM(ledger_entries__credit_amount)': lambda: Sum('ledger_entries__credit_amount'),
        'SUM(ledger_entries__debit_amount) - SUM(ledger_entries__credit_amount)': 
            lambda: Coalesce(Sum('ledger_entries__debit_amount'), 0) - Coalesce(Sum('ledger_entries__credit_amount'), 0),
        'COUNT(*)': lambda: Count('id'),
        'COUNT(DISTINCT id)': lambda: Count('id', distinct=True),
        'AVG(total_amount)': lambda: Avg('total_amount'),
        'MAX(transaction_date)': lambda: Max('transaction_date'),
        'MIN(transaction_date)': lambda: Min('transaction_date'),
        'SUM(total_amount)': lambda: Sum('total_amount'),
        'SUM(quantity)': lambda: Sum('quantity'),
        'SUM(available_quantity)': lambda: Sum('available_quantity'),
    }

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a report and return JSON data"""
        template = self.get_object()
        logger.info(f"Executing report template: {template.code}")
        
        serializer = ReportRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        start_time = time.time()
        try:
            with transaction.atomic():
                data = self._generate_report(
                    template, 
                    serializer.validated_data.get('parameters', {})
                )
                
                return Response({
                    'success': True,
                    'data': data,
                    'meta': {
                        'row_count': len(data),
                        'duration_seconds': round(time.time() - start_time, 4),
                        'template_code': template.code,
                        'template_name': template.name,
                    }
                })
                
        except Exception as e:
            logger.error(f"Report execution failed: {str(e)}", exc_info=True)
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Preview report structure without executing"""
        template = self.get_object()
        
        try:
            query_config = self._get_validated_query_config(template)
            model = self._get_report_model(query_config)
            
            # Get field information
            field_info = self._get_field_info(model, query_config)
            
            return Response({
                'success': True,
                'template': {
                    'code': template.code,
                    'name': template.name,
                    'description': template.description,
                    'report_type': template.report_type,
                },
                'model': query_config.get('model'),
                'fields': field_info,
                'parameters': template.parameters,
                'query_config': query_config
            })
            
        except Exception as e:
            logger.error(f"Report preview failed: {str(e)}", exc_info=True)
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
                
    def _generate_report(self, template, params):
        """Generate report data with improved error handling and field mapping"""
        cache_key = f"report_{template.code}_{hash(frozenset(params.items()) if params else frozenset())}"
        
        if cached := cache.get(cache_key):
            logger.debug(f"Returning cached result for {template.code}")
            return cached
        
        try:
            # Get and validate query_config
            query_config = self._get_validated_query_config(template)
            
            # Get model and base queryset
            model = self._get_report_model(query_config)
            queryset = self._build_base_queryset(model, query_config)
            
            # Apply filters and joins
            queryset = self._apply_filters(queryset, query_config, params)
            queryset = self._apply_joins(queryset, query_config)
            
            # Apply aggregations if specified
            if 'aggregations' in query_config:
                queryset = self._apply_aggregations(queryset, query_config)
            
            # Get field mapping for this model
            model_path = query_config.get('model')
            field_mapping = self.FIELD_MAPPINGS.get(model_path, {})
            
            # Finalize queryset
            queryset = self._finalize_queryset(queryset, query_config, field_mapping)
            
            # Execute and cache results
            fields = self._map_fields(query_config.get('fields', ['id']), field_mapping)
            
            # Validate fields exist
            self._validate_fields(model, fields, query_config)
            
            data = list(queryset.values(*fields))
            
            # Post-process data if needed
            data = self._post_process_data(data, query_config)
            
            cache.set(cache_key, data, timeout=300)
            return data
            
        except Exception as e:
            logger.error(f"Report generation failed for {template.code}: {str(e)}", exc_info=True)
            raise ValueError(f"Report generation failed: {str(e)}") from e

    def _get_validated_query_config(self, template):
        """Extract and validate the query configuration"""
        query_config = template.query_config
        
        # Handle nested query_config
        if 'query_config' in query_config and isinstance(query_config['query_config'], dict):
            query_config = query_config['query_config']
        
        if not isinstance(query_config, dict):
            raise ValueError("query_config must be a dictionary")
            
        logger.debug(f"Processing report with config: {query_config}")
        return query_config

    def _get_report_model(self, query_config):
        """Get the model class for the report"""
        model_path = query_config.get('model')
        if not model_path:
            raise ValueError("'model' key is required in query_config")
        
        try:
            model = apps.get_model(model_path)
            logger.debug(f"Using model: {model.__name__}")
            return model
        except LookupError as e:
            raise ValueError(f"Model not found: {model_path}") from e

    def _build_base_queryset(self, model, query_config):
        """Build and return the base queryset with default filters"""
        queryset = model.objects.all()
        
        # Apply branch filtering if model has branch field
        if hasattr(model, 'branch') and hasattr(self.request, 'user'):
            if hasattr(self.request.user, 'default_branch') and self.request.user.default_branch:
                queryset = queryset.filter(branch=self.request.user.default_branch)
        
        if 'default_filters' in query_config:
            default_filters = query_config['default_filters']
            if isinstance(default_filters, dict):
                logger.debug(f"Applying default filters: {default_filters}")
                queryset = queryset.filter(**default_filters)
        
        return queryset

    def _apply_filters(self, queryset, query_config, params):
        """Apply parameter filters to the queryset"""
        if 'parameters' in query_config and params:
            for param_name, param_value in params.items():
                if param_name in query_config['parameters']:
                    param_config = query_config['parameters'][param_name]
                    
                    if isinstance(param_config, str):
                        field = param_config
                    elif isinstance(param_config, dict):
                        field = param_config.get('field', param_name)
                    else:
                        continue
                    
                    logger.debug(f"Applying parameter filter: {field}={param_value}")
                    try:
                        # Handle different filter types
                        if '__' in field and field.endswith('__icontains'):
                            queryset = queryset.filter(**{field: param_value})
                        elif '__' in field and field.endswith('__gte'):
                            queryset = queryset.filter(**{field: param_value})
                        elif '__' in field and field.endswith('__lte'):
                            queryset = queryset.filter(**{field: param_value})
                        else:
                            queryset = queryset.filter(**{field: param_value})
                    except FieldError as e:
                        logger.warning(f"Invalid filter field '{field}': {str(e)}")
                        continue
        
        return queryset

    def _apply_joins(self, queryset, query_config):
        """Apply joins to the queryset"""
        if 'joins' in query_config:
            select_related = []
            prefetch_related = []
            
            for join in query_config['joins']:
                if isinstance(join, dict) and 'on' in join:
                    join_field = join['on']
                    
                    # Determine if this should be select_related or prefetch_related
                    if '__' not in join_field or join_field.count('__') == 1:
                        select_related.append(join_field.replace('_id', ''))
                    else:
                        prefetch_related.append(join_field)
            
            if select_related:
                logger.debug(f"Applying select_related: {select_related}")
                queryset = queryset.select_related(*select_related)
            
            if prefetch_related:
                logger.debug(f"Applying prefetch_related: {prefetch_related}")
                queryset = queryset.prefetch_related(*prefetch_related)
        
        return queryset

    def _apply_aggregations(self, queryset, query_config):
        """Apply aggregations to the queryset"""
        try:
            aggregations = {}
            
            for agg_name, agg_expr in query_config['aggregations'].items():
                if agg_expr in self.AGGREGATION_MAPPINGS:
                    aggregations[agg_name] = self.AGGREGATION_MAPPINGS[agg_expr]()
                else:
                    logger.warning(f"Unsupported aggregation expression: {agg_expr}")
                    continue
            
            if aggregations:
                logger.debug(f"Applying aggregations: {list(aggregations.keys())}")
                return queryset.annotate(**aggregations)
            
            return queryset
            
        except Exception as e:
            raise ValueError(f"Aggregation failed: {str(e)}") from e

    def _map_fields(self, fields, field_mapping):
        """Map field names using the field mapping"""
        mapped_fields = []
        for field in fields:
            mapped_field = field_mapping.get(field, field)
            mapped_fields.append(mapped_field)
        return mapped_fields

    def _validate_fields(self, model, fields, query_config):
        """Validate that fields exist in the model or are aggregated fields"""
        model_fields = [f.name for f in model._meta.get_fields()]
        aggregated_fields = list(query_config.get('aggregations', {}).keys())
        
        for field in fields:
            # Skip aggregated fields
            if field in aggregated_fields:
                continue
                
            # Check if field exists or is a related field
            if '__' in field:
                # For related fields, just check the first part exists
                base_field = field.split('__')[0]
                if base_field not in model_fields:
                    logger.warning(f"Base field '{base_field}' not found in model {model.__name__}")
            elif field not in model_fields:
                logger.warning(f"Field '{field}' not found in model {model.__name__}")

    def _finalize_queryset(self, queryset, query_config, field_mapping=None):
        """Apply final queryset operations (group by, ordering) with field mapping"""
        if field_mapping is None:
            field_mapping = {}
        
        if 'group_by' in query_config:
            group_by_fields = self._map_fields(query_config['group_by'], field_mapping)
            logger.debug(f"Grouping by: {group_by_fields}")
            queryset = queryset.values(*group_by_fields)
        
        if 'order_by' in query_config:
            order_by_fields = []
            for field in query_config['order_by']:
                if field.startswith('-'):
                    mapped = field_mapping.get(field[1:], field[1:])
                    order_by_fields.append(f'-{mapped}')
                else:
                    mapped = field_mapping.get(field, field)
                    order_by_fields.append(mapped)
            logger.debug(f"Ordering by: {order_by_fields}")
            queryset = queryset.order_by(*order_by_fields)
        
        return queryset

    def _post_process_data(self, data, query_config):
        """Post-process data after query execution"""
        # Add any post-processing logic here
        # For example, formatting dates, calculating derived fields, etc.
        
        if 'post_processing' in query_config:
            for processor in query_config['post_processing']:
                if processor['type'] == 'format_currency':
                    field = processor['field']
                    for row in data:
                        if field in row and row[field] is not None:
                            row[field] = f"${row[field]:,.2f}"
                elif processor['type'] == 'format_date':
                    field = processor['field']
                    for row in data:
                        if field in row and row[field] is not None:
                            row[field] = row[field].strftime('%Y-%m-%d')
        
        return data

    def _get_field_info(self, model, query_config):
        """Get information about available fields for the model"""
        fields = []
        
        for field in model._meta.get_fields():
            field_info = {
                'name': field.name,
                'type': field.__class__.__name__,
                'verbose_name': getattr(field, 'verbose_name', field.name),
                'help_text': getattr(field, 'help_text', ''),
            }
            
            if hasattr(field, 'related_model') and field.related_model:
                field_info['related_model'] = f"{field.related_model._meta.app_label}.{field.related_model.__name__}"
            
            fields.append(field_info)
        
        return fields

    @action(detail=False, methods=['get'])
    def available_models(self, request):
        """Get list of available models for reporting"""
        models = []
        
        # Define which models are available for reporting
        available_models = [
            'accounting.Account',
            'accounting.AccountType',
            'accounting.Currency',
            'inventory.Item',
            'inventory.ItemGroup',
            'inventory.InventoryBalance',
            'transactions.TransactionHeader',
            'transactions.TransactionDetail',
            'transactions.LedgerEntry',
            'organization.Branch',
            'authentication.User',
        ]
        
        for model_path in available_models:
            try:
                model = apps.get_model(model_path)
                models.append({
                    'path': model_path,
                    'name': model.__name__,
                    'verbose_name': model._meta.verbose_name,
                    'verbose_name_plural': model._meta.verbose_name_plural,
                })
            except LookupError:
                continue
        
        return Response({'models': models})

    @action(detail=False, methods=['post'])
    def validate_query(self, request):
        """Validate a query configuration"""
        try:
            query_config = request.data.get('query_config', {})
            
            # Basic validation
            if not isinstance(query_config, dict):
                return Response(
                    {'valid': False, 'error': 'query_config must be a dictionary'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if 'model' not in query_config:
                return Response(
                    {'valid': False, 'error': 'model is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Try to get the model
            try:
                model = apps.get_model(query_config['model'])
            except LookupError:
                return Response(
                    {'valid': False, 'error': f"Model {query_config['model']} not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate fields if provided
            if 'fields' in query_config:
                field_mapping = self.FIELD_MAPPINGS.get(query_config['model'], {})
                mapped_fields = self._map_fields(query_config['fields'], field_mapping)
                self._validate_fields(model, mapped_fields, query_config)
            
            return Response({
                'valid': True,
                'message': 'Query configuration is valid',
                'model_info': {
                    'name': model.__name__,
                    'verbose_name': model._meta.verbose_name,
                    'field_count': len(model._meta.get_fields()),
                }
            })
            
        except Exception as e:
            return Response(
                {'valid': False, 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
