"""
Celery tasks for the organization application.
Handles background processing for license validation, notifications, and maintenance.
"""

import logging
from datetime import timedelta
from typing import Dict

from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.core.cache import cache

from apps.organization.models import License
from apps.organization.signals_definitions import (
    license_validated,
    license_violation_detected,
)

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def validate_license_task(self, license_id: int) -> Dict:
    """
    Validate a specific license and update its status.
    
    Args:
        license_id: ID of the license to validate
        
    Returns:
        Dictionary with validation results
    """
    try:
        license = License.objects.get(id=license_id)
        
        logger.info(f"Validating license: {license.license_key}")
        
        validation_result = license.validate_and_update()
        
        license_validated.send(
            sender=License,
            license=license,
            validation_result=validation_result
        )
        
        return {
            'success': True,
            'license_id': license_id,
            'license_key': license.license_key,
            'validation_result': validation_result
        }
        
    except License.DoesNotExist:
        logger.error(f"License not found: {license_id}")
        return {
            'success': False,
            'error': f'License not found: {license_id}'
        }
    
    except Exception as exc:
        logger.error(f"Error validating license {license_id}: {str(exc)}")

        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return {
            'success': False,
            'error': str(exc),
            'license_id': license_id
        }


@shared_task(bind=True, max_retries=3)
def update_license_usage_task(self, license_id: int) -> Dict:
    """
    Update license usage statistics.
    
    Args:
        license_id: ID of the license to update
        
    Returns:
        Dictionary with update results
    """
    try:
        license = License.objects.get(id=license_id)
        logger.info(f"Updating usage statistics for license: {license.license_key}")

        license.update_usage_stats()
        violations = license.validate_usage_limits()
        
        if any(violations.values()):
            violation_list = [key for key, violated in violations.items() if violated]
            license_violation_detected.send(
                sender=License,
                license=license,
                violations=violation_list
            )
        
        return {
            'success': True,
            'license_id': license_id,
            'current_users': license.current_users,
            'current_branches': license.current_branches,
            'violations': violations
        }
        
    except License.DoesNotExist:
        logger.error(f"License not found: {license_id}")
        return {
            'success': False,
            'error': f'License not found: {license_id}'
        }
    
    except Exception as exc:
        logger.error(f"Error updating license usage {license_id}: {str(exc)}")
        
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return {
            'success': False,
            'error': str(exc),
            'license_id': license_id
        }


@shared_task(bind=True, max_retries=3)
def send_license_expiry_notification(self, license_id: int, notification_type: str, message: str) -> Dict:
    """
    Send license expiry or violation notifications.
    
    Args:
        license_id: ID of the license
        notification_type: Type of notification ('expiry_warning', 'violation', 'activated', etc.)
        message: Notification message
        
    Returns:
        Dictionary with send results
    """
    try:
        license = License.objects.get(id=license_id)
        
        logger.info(f"Sending {notification_type} notification for license: {license.license_key}")
        
        context = {
            'license': license,
            'company': license.company,
            'notification_type': notification_type,
            'message': message,
            'days_until_expiry': license.days_until_expiry(),
            'validation_result': license.validate_and_update()
        }
        
        template_map = {
            'expiry_warning': 'organization/emails/license_expiry_warning.html',
            'violation': 'organization/emails/license_violation.html',
            'activated': 'organization/emails/license_activated.html',
            'suspended': 'organization/emails/license_suspended.html',
            'expired': 'organization/emails/license_expired.html',
        }
        
        template = template_map.get(notification_type, 'organization/emails/license_notification.html')
        
        html_content = render_to_string(template, context)
        
        subject_map = {
            'expiry_warning': f'License Expiry Warning - {license.company.company_name}',
            'violation': f'License Violation Alert - {license.company.company_name}',
            'activated': f'License Activated - {license.company.company_name}',
            'suspended': f'License Suspended - {license.company.company_name}',
            'expired': f'License Expired - {license.company.company_name}',
        }
        
        subject = subject_map.get(notification_type, f'License Notification - {license.company.company_name}')
        
        recipients = [license.licensee_email]
        if license.company.email:
            recipients.append(license.company.email)
        
        admin_emails = getattr(settings, 'LICENSE_ADMIN_EMAILS', [])
        recipients.extend(admin_emails)

        recipients = list(set(recipients))
        
        send_mail(
            subject=subject,
            message=message,
            html_message=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False
        )
        
        logger.info(f"Notification sent successfully to {len(recipients)} recipients")
        
        return {
            'success': True,
            'license_id': license_id,
            'notification_type': notification_type,
            'recipients_count': len(recipients)
        }
        
    except License.DoesNotExist:
        logger.error(f"License not found: {license_id}")
        return {
            'success': False,
            'error': f'License not found: {license_id}'
        }
    
    except Exception as exc:
        logger.error(f"Error sending notification for license {license_id}: {str(exc)}")
        
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return {
            'success': False,
            'error': str(exc),
            'license_id': license_id
        }


@shared_task
def validate_all_licenses_task() -> Dict:
    """
    Validate all active licenses (daily task).
    
    Returns:
        Dictionary with validation summary
    """
    logger.info("Starting daily license validation")
    
    active_licenses = License.objects.filter(
        status__in=['active', 'trial']
    )
    
    results = {
        'total_licenses': active_licenses.count(),
        'validated': 0,
        'violations': 0,
        'warnings': 0,
        'errors': 0
    }
    
    for license in active_licenses:
        try:
            validation_result = license.validate_and_update()
            results['validated'] += 1
            
            if validation_result['violations']:
                results['violations'] += 1
            
            if validation_result['warnings']:
                results['warnings'] += 1
                
        except Exception as exc:
            logger.error(f"Error validating license {license.id}: {str(exc)}")
            results['errors'] += 1
    
    logger.info(f"Daily validation completed: {results}")
    return results


@shared_task
def cleanup_expired_licenses() -> Dict:
    """
    Clean up expired licenses and send notifications (weekly task).
    
    Returns:
        Dictionary with cleanup summary
    """
    logger.info("Starting weekly license cleanup")
    
    now = timezone.now()
    
    expired_licenses = License.objects.filter(
        expiry_date__lt=now - timedelta(days=30),
        status='active'
    )
    
    results = {
        'expired_licenses': expired_licenses.count(),
        'suspended': 0,
        'notifications_sent': 0,
        'errors': 0
    }
    
    for license in expired_licenses:
        try:
            if license.suspend("Automatically suspended - expired over 30 days"):
                results['suspended'] += 1
                
                send_license_expiry_notification.delay(
                    license.id,
                    'expired',
                    f"License has been automatically suspended due to expiry"
                )
                results['notifications_sent'] += 1
                
        except Exception as exc:
            logger.error(f"Error processing expired license {license.id}: {str(exc)}")
            results['errors'] += 1

    expiring_licenses = License.objects.filter(
        expiry_date__gte=now,
        expiry_date__lte=now + timedelta(days=30),
        status__in=['active', 'trial']
    )
    
    results['expiring_licenses'] = expiring_licenses.count()
    
    for license in expiring_licenses:
        try:
            days_left = license.days_until_expiry()
            if days_left in [30, 14, 7, 3, 1]:
                send_license_expiry_notification.delay(
                    license.id,
                    'expiry_warning',
                    f"License expires in {days_left} day(s)"
                )
                results['notifications_sent'] += 1
                
        except Exception as exc:
            logger.error(f"Error processing expiring license {license.id}: {str(exc)}")
            results['errors'] += 1
    
    logger.info(f"Weekly cleanup completed: {results}")
    return results


@shared_task
def generate_license_report() -> Dict:
    """
    Generate comprehensive license usage report.
    
    Returns:
        Dictionary with report data
    """
    logger.info("Generating license report")

    licenses = License.objects.select_related('company', 'license_type').all()
    
    report = {
        'generated_at': timezone.now().isoformat(),
        'total_licenses': licenses.count(),
        'by_status': {},
        'by_type': {},
        'expiring_soon': [],
        'violations': [],
        'usage_summary': {
            'total_users': 0,
            'total_branches': 0,
            'total_transactions': 0,
            'total_storage_gb': 0
        }
    }
    
    for license in licenses:
        status = license.status
        if status not in report['by_status']:
            report['by_status'][status] = 0
        report['by_status'][status] += 1
        
        type_name = license.license_type.name
        if type_name not in report['by_type']:
            report['by_type'][type_name] = 0
        report['by_type'][type_name] += 1
        
        days_left = license.days_until_expiry()
        if days_left is not None and days_left <= 30:
            report['expiring_soon'].append({
                'company': license.company.company_name,
                'license_key': license.license_key,
                'days_left': days_left
            })
        
        violations = license.validate_usage_limits()
        if any(violations.values()):
            report['violations'].append({
                'company': license.company.company_name,
                'license_key': license.license_key,
                'violations': [key for key, violated in violations.items() if violated]
            })
        
        if license.status in ['active', 'trial']:
            report['usage_summary']['total_users'] += license.current_users
            report['usage_summary']['total_branches'] += license.current_branches
            report['usage_summary']['total_transactions'] += license.monthly_transactions
            report['usage_summary']['total_storage_gb'] += float(license.storage_used_gb)
    
    cache.set('license_report', report, timeout=3600)
    
    logger.info("License report generated successfully")
    return report


@shared_task(bind=True, max_retries=3)
def sync_license_with_external_service(self, license_id: int) -> Dict:
    """
    Sync license data with external licensing service.
    
    Args:
        license_id: ID of the license to sync
        
    Returns:
        Dictionary with sync results
    """
    try:
        license = License.objects.get(id=license_id)
        
        logger.info(f"Syncing license with external service: {license.license_key}")
        
        validation_result = license.validate_and_update()
        
        external_response = {
            'status': 'success',
            'license_valid': validation_result['valid'],
            'server_time': timezone.now().isoformat(),
            'sync_id': f"sync_{license_id}_{timezone.now().timestamp()}"
        }
        
        return {
            'success': True,
            'license_id': license_id,
            'license_key': license.license_key,
            'external_response': external_response,
            'validation_result': validation_result
        }
        
    except License.DoesNotExist:
        logger.error(f"License not found: {license_id}")
        return {
            'success': False,
            'error': f'License not found: {license_id}'
        }
    
    except Exception as exc:
        logger.error(f"Error syncing license {license_id}: {str(exc)}")

        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return {
            'success': False,
            'error': str(exc),
            'license_id': license_id
        }


@shared_task
def bulk_update_license_usage() -> Dict:
    """
    Bulk update usage statistics for all active licenses.
    
    Returns:
        Dictionary with update summary
    """
    logger.info("Starting bulk license usage update")
    
    active_licenses = License.objects.filter(
        status__in=['active', 'trial']
    ).select_related('company')
    
    results = {
        'total_licenses': active_licenses.count(),
        'updated': 0,
        'errors': 0,
        'violations_detected': 0
    }
    
    for license in active_licenses:
        try:
            license.update_usage_stats()
            results['updated'] += 1

            violations = license.validate_usage_limits()
            if any(violations.values()):
                results['violations_detected'] += 1
                
        except Exception as exc:
            logger.error(f"Error updating usage for license {license.id}: {str(exc)}")
            results['errors'] += 1
    
    logger.info(f"Bulk usage update completed: {results}")
    return results
