from celery.schedules import crontab
from django.conf import settings

AR_SCHEDULES = {
    'send-daily-ar-notifications': {
        'task': 'apps.notifications.tasks.send_daily_ar_notifications_task',
        'schedule': crontab(hour=0, minute=0),
        'options': {
            'expires': 3600,
        },
        'kwargs': {
            'dry_run': getattr(settings, 'AR_NOTIFICATIONS_DRY_RUN', False)
        }
    },
    
    'generate-ar-summary-report': {
        'task': 'apps.notifications.tasks.generate_ar_summary_report_task',
        'schedule': crontab(hour=6, minute=0),
        'options': {
            'expires': 1800,
        }
    },
    
    'ar-system-health-check': {
        'task': 'apps.core_apps.tasks.ar_system_health_check_task',
        'schedule': crontab(minute=0, hour='*/4'),
        'options': {
            'expires': 300,
        }
    },
    
}

if getattr(settings, 'AR_CUSTOM_SCHEDULE', False):
    custom_hour = getattr(settings, 'AR_NOTIFICATION_HOUR', 0)
    custom_minute = getattr(settings, 'AR_NOTIFICATION_MINUTE', 0)
    
    AR_SCHEDULES['send-daily-ar-notifications']['schedule'] = crontab(
        hour=custom_hour, 
        minute=custom_minute
    )
