from typing import Dict, List, Optional, Union
from datetime import datetime
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.conf import settings
from celery import shared_task
from firebase_admin import messaging, credentials
import firebase_admin
import requests
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from apps.notifications.models import InternalMessage, Notification, NotificationTemplate, NotificationLog
from apps.organization.models import Branch
from apps.authentication.models import User
from apps.core_apps.utils import Logger, generate_unique_code
from django.core.validators import EmailValidator
from phonenumber_field.phonenumber import PhoneNumber

logger = Logger(__name__)

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
except Exception as e:
    logger.error(f"Failed to initialize Firebase: {str(e)}", exc_info=True)
    raise

def get_twilio_client() -> Client:
    """Initialize and return Twilio client."""
    try:
        return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    except AttributeError as e:
        logger.error(f"Twilio configuration missing: {str(e)}", exc_info=True)
        raise ValidationError("Twilio configuration (ACCOUNT_SID or AUTH_TOKEN) not set in settings.")

class MessagingService:
    """A flexible messaging service integrating WhatsApp, Firebase, and Twilio for notifications."""
    
    def __init__(self, branch: Branch):
        self.branch = branch
        self.company = branch.company
        self.settings = self._load_settings()
        self.whatsapp_api_url = getattr(settings, 'WHATSAPP_API_URL', 'https://api.whatsapp.com/v1')
        self.whatsapp_api_token = getattr(settings, 'WHATSAPP_API_TOKEN', None)
        
    def _load_settings(self) -> Dict:
        """Load notification settings from company, branch, and system configurations."""
        try:
            system_settings = self.branch.system_settings
            company_settings = self.company.system_settings if hasattr(self.company, 'system_settings') else {}
            
            return {
                'notifications_enabled': system_settings.notifications if system_settings else {'email': True, 'sms': False, 'whatsapp': False, 'in_app': False, 'push': False},
                'require_two_factor_auth': system_settings.require_two_factor_auth if system_settings else False,
                'max_retries': system_settings.max_retries if hasattr(system_settings, 'max_retries') else 3,
                'company_multi_currency': self.company.has_feature('multi_currency') if hasattr(self.company, 'has_feature') else False,
                'branch_multi_currency': self.branch.use_multi_currency,
            }
        except Exception as e:
            logger.error(f"Error loading settings for branch {self.branch}: {str(e)}", exc_info=True)
            return {'notifications_enabled': {'email': True, 'sms': False, 'whatsapp': False, 'in_app': False, 'push': False}}

    def _validate_recipient(self, recipient: Union[User, str], channel: str) -> bool:
        """Validate if recipient can receive notifications on the specified channel."""
        if isinstance(recipient, User) and hasattr(recipient, 'profile'):
            return recipient.profile.can_receive_notifications(channel)
        elif isinstance(recipient, str):
            if channel == 'email':
                try:
                    EmailValidator()(recipient)
                    return True
                except ValidationError:
                    return False
            elif channel in ('sms', 'whatsapp'):
                try:
                    phone = PhoneNumber.from_string(recipient)
                    return phone.is_valid()
                except Exception:
                    return False
        return False

    def _get_template(self, notification_type: str, channel: str) -> Optional[NotificationTemplate]:
        """Retrieve the appropriate notification template for the given type and channel."""
        try:
            return NotificationTemplate.objects.filter(
                branch=self.branch,
                notification_type=notification_type,
                channel=channel,
                is_default=True
            ).first()
        except Exception as e:
            logger.error(f"Error retrieving template for {notification_type}/{channel}: {str(e)}", exc_info=True)
            return None

    def send_notification(self, recipient: Union[User, str], notification_type: str, 
                        context_data: Dict, channel: str, priority: str = 'normal',
                        scheduled_at: Optional[datetime] = None) -> Optional[Notification]:
        """Send a notification via the specified channel (email, SMS, WhatsApp, in-app, push)."""
        if channel not in NotificationTemplate.Channel.choices:
            logger.error(f"Invalid channel: {channel}")
            raise ValueError(f"Invalid channel: {channel}")

        if not self._validate_recipient(recipient, channel):
            logger.error(f"Recipient {recipient} not configured for {channel} notifications")
            raise ValidationError(f"Recipient not configured for {channel} notifications")

        template = self._get_template(notification_type, channel)
        if not template:
            logger.error(f"No template found for {notification_type}/{channel}")
            raise ValueError(f"No template found for {notification_type}/{channel}")

        try:
            rendered = template.render(context_data)
            notification = Notification.objects.create(
                branch=self.branch,
                template=template,
                recipient=recipient if isinstance(recipient, User) else None,
                channel=channel,
                notification_type=notification_type,
                priority=priority,
                subject=rendered['subject'],
                content=rendered['content'],
                html_content=rendered['html_content'],
                context_data={'email': recipient} if isinstance(recipient, str) and channel == 'email' else 
                            {'phone': recipient} if isinstance(recipient, str) and channel in ('sms', 'whatsapp') else context_data,
                scheduled_at=scheduled_at,
                max_retries=self.settings['max_retries']
            )
            
            if not scheduled_at:
                self._dispatch_notification(notification)
            else:
                dispatch_notification.delay(notification.id)
                
            return notification
        except Exception as e:
            logger.error(f"Error sending notification {notification_type}/{channel}: {str(e)}", exc_info=True)
            raise

    def _dispatch_notification(self, notification: Notification) -> None:
        """Dispatch notification to the appropriate channel handler."""
        channel = notification.channel
        if channel == NotificationTemplate.Channel.EMAIL:
            dispatch_email_notification.delay(notification.id)
        elif channel == NotificationTemplate.Channel.SMS:
            dispatch_sms_notification.delay(notification.id)
        elif channel == NotificationTemplate.Channel.WHATSAPP:
            dispatch_whatsapp_notification.delay(notification.id)
        elif channel == NotificationTemplate.Channel.PUSH:
            dispatch_push_notification.delay(notification.id)
        elif channel == NotificationTemplate.Channel.IN_APP:
            dispatch_in_app_notification.delay(notification.id)

    def send_internal_message(self, sender: User, recipient: User, subject: str, 
                            content: str, priority: str = 'normal', attachments: Optional[List] = None) -> InternalMessage:
        """Send an internal message between users."""
        try:
            message = InternalMessage.objects.create(
                branch=self.branch,
                sender=sender,
                recipient=recipient,
                subject=subject,
                content=content,
                priority=priority,
                code=generate_unique_code('MSG')
            )
            if attachments:
                message.attachments.set(attachments)
            
            if recipient.profile and recipient.profile.can_receive_notifications('in_app'):
                self.send_notification(
                    recipient=recipient,
                    notification_type='custom',
                    context_data={'message_subject': subject, 'sender': sender.get_full_name(), 'content': content},
                    channel='in_app',
                    priority=priority
                )
            return message
        except Exception as e:
            logger.error(f"Error sending internal message from {sender} to {recipient}: {str(e)}", exc_info=True)
            raise

@shared_task
def dispatch_notification(notification_id: int) -> None:
    """Celery task to dispatch a notification to its channel-specific task."""
    try:
        notification = Notification.objects.get(id=notification_id)
        service = MessagingService(notification.branch)
        service._dispatch_notification(notification)
        logger.info(f"Dispatched notification {notification_id} to channel {notification.channel}")
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except Exception as e:
        logger.error(f"Error dispatching notification {notification_id}: {str(e)}", exc_info=True)
        if notification:
            notification.mark_as_failed(str(e))

@shared_task
def dispatch_email_notification(notification_id: int) -> None:
    """Celery task to send email notification."""
    try:
        notification = Notification.objects.get(id=notification_id)
        logger.info(f"Sending email notification {notification.id} to {notification.context_data.get('email')}")
        notification.mark_as_sent()
        notification.mark_as_delivered()
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except Exception as e:
        logger.error(f"Error sending email notification {notification_id}: {str(e)}", exc_info=True)
        notification.mark_as_failed(str(e))

@shared_task
def dispatch_sms_notification(notification_id: int) -> None:
    """Celery task to send SMS notification via Twilio."""
    try:
        notification = Notification.objects.get(id=notification_id)
        phone_number = str(notification.context_data.get('phone'))
        if not phone_number:
            raise ValueError("Phone number not provided in context data")
        
        client = get_twilio_client()
        message = client.messages.create(
            body=notification.content,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        
        notification.external_id = message.sid
        notification.mark_as_sent()
        if message.status in ('sent', 'delivered'):
            notification.mark_as_delivered()
        
        logger.info(f"Sent SMS notification {notification.id} to {phone_number} with SID {message.sid}")
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except TwilioRestException as e:
        logger.error(f"Twilio error sending SMS notification {notification_id}: {str(e)}", exc_info=True)
        notification.mark_as_failed(f"Twilio error: {str(e)}")
    except Exception as e:
        logger.error(f"Error sending SMS notification {notification_id}: {str(e)}", exc_info=True)
        notification.mark_as_failed(str(e))

@shared_task
def dispatch_whatsapp_notification(notification_id: int) -> None:
    """Celery task to send WhatsApp notification."""
    try:
        notification = Notification.objects.get(id=notification_id)
        service = MessagingService(notification.branch)
        if not service.whatsapp_api_token:
            raise ValueError("WhatsApp API token not configured")
        
        headers = {'Authorization': f'Bearer {service.whatsapp_api_token}'}
        payload = {
            'to': str(notification.context_data.get('phone')),
            'message': notification.content,
            'type': 'text'
        }
        response = requests.post(
            f"{service.whatsapp_api_url}/messages",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        notification.mark_as_sent()
        notification.mark_as_delivered()
        logger.info(f"Sent WhatsApp notification {notification.id} to {notification.context_data.get('phone')}")
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except Exception as e:
        logger.error(f"Error sending WhatsApp notification {notification_id}: {str(e)}", exc_info=True)
        notification.mark_as_failed(str(e))

@shared_task
def dispatch_push_notification(notification_id: int) -> None:
    """Celery task to send Firebase push notification."""
    try:
        notification = Notification.objects.get(id=notification_id)
        recipient = notification.recipient
        if not recipient or not hasattr(recipient, 'profile') or not recipient.profile.can_receive_notifications('push'):
            raise ValueError("Recipient not configured for push notifications")
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=notification.subject,
                body=notification.content
            ),
            token=recipient.profile.context_data.get('fcm_token'),
            data=notification.context_data
        )
        response = messaging.send(message)
        notification.mark_as_sent()
        notification.mark_as_delivered()
        logger.info(f"Sent push notification {notification.id} to {recipient}")
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except Exception as e:
        logger.error(f"Error sending push notification {notification_id}: {str(e)}", exc_info=True)
        notification.mark_as_failed(str(e))

@shared_task
def dispatch_in_app_notification(notification_id: int) -> None:
    """Celery task to handle in-app notification."""
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.mark_as_sent()
        notification.mark_as_delivered()
        logger.info(f"Processed in-app notification {notification.id}")
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except Exception as e:
        logger.error(f"Error processing in-app notification {notification_id}: {str(e)}", exc_info=True)
        notification.mark_as_failed(str(e))

@shared_task
def process_scheduled_notifications():
    """Celery task to process scheduled notifications."""
    try:
        notifications = Notification.objects.filter(
            status=Notification.Status.PENDING,
            scheduled_at__lte=timezone.now()
        )
        for notification in notifications:
            dispatch_notification.delay(notification.id)
            if notification.recurrence != Notification.Recurrence.NONE:
                notification.schedule_next_recurrence()
        logger.info(f"Processed {len(notifications)} scheduled notifications")
    except Exception as e:
        logger.error(f"Error processing scheduled notifications: {str(e)}", exc_info=True)