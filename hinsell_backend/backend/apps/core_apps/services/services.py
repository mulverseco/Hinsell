"""
Free Messages Service for Pharmacy Management System
Validates system settings, account permissions, and user preferences before sending messages.
"""
import logging
from typing import Dict, List, Optional, Tuple, Any
from django.db import transaction, models
from django.utils import timezone

from apps.notifications.models import (
    Notification, NotificationLog
)
from apps.authentication.models import User, UserProfile
from apps.organization.models import Branch, SystemSettings
from apps.accounting.models import Account

logger = logging.getLogger(__name__)

class MessageValidationError(Exception):
    """Custom exception for message validation errors."""
    pass


class MessagingService:
    """
    Comprehensive messaging service that validates permissions and settings
    before sending notifications through various channels.
    """
    
    def __init__(self, branch: Branch):
        self.branch = branch
        self.system_settings = self._get_system_settings()
    
    def _get_system_settings(self) -> Optional[SystemSettings]:
        """Get system settings for the branch."""
        try:
            return SystemSettings.objects.get(branch=self.branch)
        except SystemSettings.DoesNotExist:
            logger.warning(f"No system settings found for branch {self.branch.id}")
            return None
    
    def can_send_messages(self) -> Tuple[bool, str]:
        """
        Check if the system allows sending messages at all.
        
        Returns:
            Tuple of (can_send: bool, reason: str)
        """
        if not self.system_settings:
            return False, "System settings not configured"
        
        channels_enabled = [
            self.system_settings.enable_email_notifications,
            self.system_settings.enable_sms_notifications,
            self.system_settings.enable_whatsapp_notifications,
            self.system_settings.enable_in_app_notifications,
            self.system_settings.enable_push_notifications,
        ]
        
        if not any(channels_enabled):
            return False, "No notification channels are enabled in system settings"
        
        return True, "System allows message sending"
    
    def is_account_enabled_for_messages(self, account: Account) -> Tuple[bool, str]:
        """
        Check if a specific account is enabled to receive messages.
        
        Args:
            account: The account to check
            
        Returns:
            Tuple of (is_enabled: bool, reason: str)
        """
        if not account.is_active:
            return False, "Account is inactive"

        has_contact = bool(account.email or account.phone_number or account.mobile_number)
        if not has_contact:
            return False, "Account has no contact information"
        
        channels_enabled = [
            account.enable_email_notifications and bool(account.email),
            account.enable_sms_notifications and bool(account.phone_number or account.mobile_number),
            account.enable_whatsapp_notifications and bool(account.phone_number or account.mobile_number),
        ]
        
        if not any(channels_enabled):
            return False, "Account has disabled all notification channels"
        
        return True, "Account is enabled for messages"
    
    def is_user_enabled_for_messages(self, user: User) -> Tuple[bool, str]:
        """
        Check if a specific user is enabled to send/receive messages.
        
        Args:
            user: The user to check
            
        Returns:
            Tuple of (is_enabled: bool, reason: str)
        """
        if not user.is_active:
            return False, "User account is inactive"
        
        if user.is_account_locked():
            return False, "User account is locked"
        
        if not hasattr(user, 'profile'):
            return False, "User has no profile configured"
        
        profile = user.profile
        has_contact = bool(profile.email or profile.phone_number)
        if not has_contact:
            return False, "User has no contact information in profile"
        
        channels_enabled = [
            profile.enable_email_notifications and bool(profile.email),
            profile.enable_sms_notifications and bool(profile.phone_number),
            profile.enable_whatsapp_notifications and bool(profile.phone_number),
            profile.enable_in_app_notifications,
            profile.enable_push_notifications,
        ]
        
        if not any(channels_enabled):
            return False, "User has disabled all notification channels"
        
        return True, "User is enabled for messages"
    
    def validate_message_permissions(
        self, 
        sender_user: Optional[User] = None,
        recipient_user: Optional[User] = None,
        recipient_account: Optional[Account] = None,
        channel: str = 'email'
    ) -> Tuple[bool, List[str]]:
        """
        Comprehensive validation of message sending permissions.
        
        Args:
            sender_user: User attempting to send the message
            recipient_user: User recipient (if applicable)
            recipient_account: Account recipient (if applicable)
            channel: Message channel ('email', 'sms', 'whatsapp', 'in_app', 'push')
            
        Returns:
            Tuple of (can_send: bool, validation_messages: List[str])
        """
        validation_messages = []
        
        system_can_send, system_reason = self.can_send_messages()
        if not system_can_send:
            validation_messages.append(f"System: {system_reason}")
        
        channel_enabled = self._is_channel_enabled_in_system(channel)
        if not channel_enabled:
            validation_messages.append(f"System: {channel.upper()} notifications are disabled")
        
        if sender_user:
            sender_can_send, sender_reason = self.is_user_enabled_for_messages(sender_user)
            if not sender_can_send:
                validation_messages.append(f"Sender: {sender_reason}")
        
        if recipient_user:
            recipient_can_receive, recipient_reason = self.is_user_enabled_for_messages(recipient_user)
            if not recipient_can_receive:
                validation_messages.append(f"Recipient User: {recipient_reason}")
            
            if recipient_user.profile:
                channel_allowed = self._is_channel_allowed_for_user(recipient_user.profile, channel)
                if not channel_allowed:
                    validation_messages.append(f"Recipient User: {channel.upper()} notifications disabled")
        
        if recipient_account:
            account_can_receive, account_reason = self.is_account_enabled_for_messages(recipient_account)
            if not account_can_receive:
                validation_messages.append(f"Recipient Account: {account_reason}")
            
            channel_allowed = self._is_channel_allowed_for_account(recipient_account, channel)
            if not channel_allowed:
                validation_messages.append(f"Recipient Account: {channel.upper()} notifications disabled")

        if recipient_user and hasattr(recipient_user, 'notification_preferences'):
            prefs = recipient_user.notification_preferences
            if prefs.is_in_quiet_hours():
                validation_messages.append("Recipient: Currently in quiet hours")
        
        can_send = len(validation_messages) == 0
        return can_send, validation_messages
    
    def _is_channel_enabled_in_system(self, channel: str) -> bool:
        """Check if a specific channel is enabled in system settings."""
        if not self.system_settings:
            return False
        
        channel_map = {
            'email': self.system_settings.enable_email_notifications,
            'sms': self.system_settings.enable_sms_notifications,
            'whatsapp': self.system_settings.enable_whatsapp_notifications,
            'in_app': self.system_settings.enable_in_app_notifications,
            'push': self.system_settings.enable_push_notifications,
        }
        
        return channel_map.get(channel, False)
    
    def _is_channel_allowed_for_user(self, profile: UserProfile, channel: str) -> bool:
        """Check if a channel is allowed for a specific user profile."""
        channel_map = {
            'email': profile.enable_email_notifications and bool(profile.email),
            'sms': profile.enable_sms_notifications and bool(profile.phone_number),
            'whatsapp': profile.enable_whatsapp_notifications and bool(profile.phone_number),
            'in_app': profile.enable_in_app_notifications,
            'push': profile.enable_push_notifications,
        }
        
        return channel_map.get(channel, False)
    
    def _is_channel_allowed_for_account(self, account: Account, channel: str) -> bool:
        """Check if a channel is allowed for a specific account."""
        channel_map = {
            'email': account.enable_email_notifications and bool(account.email),
            'sms': account.enable_sms_notifications and bool(account.phone_number or account.mobile_number),
            'whatsapp': account.enable_whatsapp_notifications and bool(account.phone_number or account.mobile_number),
        }
        
        return channel_map.get(channel, False)
    
    def send_free_message(
        self,
        message_type: str,
        channel: str,
        recipient_user: Optional[User] = None,
        recipient_account: Optional[Account] = None,
        sender_user: Optional[User] = None,
        subject: str = "",
        content: str = "",
        context_data: Optional[Dict[str, Any]] = None,
        priority: str = 'normal',
        scheduled_at: Optional[timezone.datetime] = None
    ) -> Tuple[bool, str, Optional[Notification]]:
        """
        Send a free message after validating all permissions and settings.
        
        Args:
            message_type: Type of message (from NotificationTemplate.NotificationType)
            channel: Delivery channel
            recipient_user: User recipient
            recipient_account: Account recipient  
            sender_user: User sending the message
            subject: Message subject
            content: Message content
            context_data: Additional context for template rendering
            priority: Message priority
            scheduled_at: When to send the message
            
        Returns:
            Tuple of (success: bool, message: str, notification: Optional[Notification])
        """
        try:
            can_send, validation_messages = self.validate_message_permissions(
                sender_user=sender_user,
                recipient_user=recipient_user,
                recipient_account=recipient_account,
                channel=channel
            )
            
            if not can_send:
                error_msg = "Message sending not allowed: " + "; ".join(validation_messages)
                logger.warning(error_msg)
                return False, error_msg, None
            
            recipient_email = None
            recipient_phone = None
            
            if recipient_user and recipient_user.profile:
                recipient_email = recipient_user.profile.email
                recipient_phone = str(recipient_user.profile.phone_number) if recipient_user.profile.phone_number else None
            elif recipient_account:
                recipient_email = recipient_account.email
                recipient_phone = str(recipient_account.phone_number or recipient_account.mobile_number) if (recipient_account.phone_number or recipient_account.mobile_number) else None
            
            if channel == 'email' and not recipient_email:
                return False, "No email address available for recipient", None
            elif channel in ['sms', 'whatsapp'] and not recipient_phone:
                return False, f"No phone number available for {channel}", None

            with transaction.atomic():
                notification = Notification.objects.create(
                    branch=self.branch,
                    recipient_user=recipient_user,
                    recipient_email=recipient_email,
                    recipient_phone=recipient_phone,
                    channel=channel,
                    notification_type=message_type,
                    priority=priority,
                    subject=subject,
                    content=content,
                    context_data=context_data or {},
                    scheduled_at=scheduled_at,
                    created_by=sender_user
                )
                
                NotificationLog.objects.create(
                    notification=notification,
                    action='created',
                    details={
                        'sender': sender_user.username if sender_user else 'system',
                        'validation_passed': True,
                        'channel': channel
                    },
                    created_by=sender_user
                )
                
                logger.info(f"Free message created: {notification.id} for {channel}")
                
                return True, "Message created successfully", notification
                
        except Exception as e:
            error_msg = f"Error creating free message: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, error_msg, None
    
    def get_available_channels_for_user(self, user: User) -> List[Dict[str, Any]]:
        """
        Get list of available messaging channels for a user.
        
        Args:
            user: User to check channels for
            
        Returns:
            List of available channels with their status
        """
        channels = []
        
        if not user.is_active or not hasattr(user, 'profile'):
            return channels
        
        profile = user.profile
        
        # Email
        if (self.system_settings and self.system_settings.enable_email_notifications and
            profile.enable_email_notifications and profile.email):
            channels.append({
                'channel': 'email',
                'name': 'Email',
                'contact': profile.email,
                'enabled': True
            })
        
        # SMS
        if (self.system_settings and self.system_settings.enable_sms_notifications and
            profile.enable_sms_notifications and profile.phone_number):
            channels.append({
                'channel': 'sms',
                'name': 'SMS',
                'contact': str(profile.phone_number),
                'enabled': True
            })
        
        # WhatsApp
        if (self.system_settings and self.system_settings.enable_whatsapp_notifications and
            profile.enable_whatsapp_notifications and profile.phone_number):
            channels.append({
                'channel': 'whatsapp',
                'name': 'WhatsApp',
                'contact': str(profile.phone_number),
                'enabled': True
            })
        
        # In-App
        if (self.system_settings and self.system_settings.enable_in_app_notifications and
            profile.enable_in_app_notifications):
            channels.append({
                'channel': 'in_app',
                'name': 'In-App',
                'contact': 'Dashboard',
                'enabled': True
            })
        
        # Push
        if (self.system_settings and self.system_settings.enable_push_notifications and
            profile.enable_push_notifications):
            channels.append({
                'channel': 'push',
                'name': 'Push Notification',
                'contact': 'Device',
                'enabled': True
            })
        
        return channels
    
    def get_available_channels_for_account(self, account: Account) -> List[Dict[str, Any]]:
        """
        Get list of available messaging channels for an account.
        
        Args:
            account: Account to check channels for
            
        Returns:
            List of available channels with their status
        """
        channels = []
        
        if not account.is_active:
            return channels
        
        # Email
        if (self.system_settings and self.system_settings.enable_email_notifications and
            account.enable_email_notifications and account.email):
            channels.append({
                'channel': 'email',
                'name': 'Email',
                'contact': account.email,
                'enabled': True
            })
        
        # SMS
        phone = account.phone_number or account.mobile_number
        if (self.system_settings and self.system_settings.enable_sms_notifications and
            account.enable_sms_notifications and phone):
            channels.append({
                'channel': 'sms',
                'name': 'SMS',
                'contact': str(phone),
                'enabled': True
            })
        
        # WhatsApp
        if (self.system_settings and self.system_settings.enable_whatsapp_notifications and
            account.enable_whatsapp_notifications and phone):
            channels.append({
                'channel': 'whatsapp',
                'name': 'WhatsApp',
                'contact': str(phone),
                'enabled': True
            })
        
        return channels
    
    def get_messaging_status_report(self) -> Dict[str, Any]:
        """
        Get comprehensive status report for messaging capabilities.
        
        Returns:
            Dictionary with messaging status information
        """
        system_can_send, system_reason = self.can_send_messages()
        
        # Count enabled channels
        enabled_channels = []
        if self.system_settings:
            if self.system_settings.enable_email_notifications:
                enabled_channels.append('email')
            if self.system_settings.enable_sms_notifications:
                enabled_channels.append('sms')
            if self.system_settings.enable_whatsapp_notifications:
                enabled_channels.append('whatsapp')
            if self.system_settings.enable_in_app_notifications:
                enabled_channels.append('in_app')
            if self.system_settings.enable_push_notifications:
                enabled_channels.append('push')
        
        # Count users with messaging enabled
        users_with_messaging = User.objects.filter(
            is_active=True,
            profile__isnull=False
        ).filter(
            models.Q(profile__enable_email_notifications=True, profile__email__isnull=False) |
            models.Q(profile__enable_sms_notifications=True, profile__phone_number__isnull=False) |
            models.Q(profile__enable_whatsapp_notifications=True, profile__phone_number__isnull=False) |
            models.Q(profile__enable_in_app_notifications=True) |
            models.Q(profile__enable_push_notifications=True)
        ).count()
        
        # Count accounts with messaging enabled
        accounts_with_messaging = Account.objects.filter(
            branch=self.branch,
            is_active=True
        ).filter(
            models.Q(enable_email_notifications=True, email__isnull=False) |
            models.Q(enable_sms_notifications=True) & (
                models.Q(phone_number__isnull=False) | models.Q(mobile_number__isnull=False)
            ) |
            models.Q(enable_whatsapp_notifications=True) & (
                models.Q(phone_number__isnull=False) | models.Q(mobile_number__isnull=False)
            )
        ).count()
        
        return {
            'system_messaging_enabled': system_can_send,
            'system_status_reason': system_reason,
            'enabled_channels': enabled_channels,
            'total_enabled_channels': len(enabled_channels),
            'users_with_messaging': users_with_messaging,
            'accounts_with_messaging': accounts_with_messaging,
            'branch': {
                'id': self.branch.id,
                'name': self.branch.branch_name,
                'company': self.branch.company.company_name
            },
            'system_settings_configured': self.system_settings is not None,
            'generated_at': timezone.now().isoformat()
        }


# Convenience functions for easy access
def create_messaging_service(branch: Branch) -> MessagingService:
    """Create a messaging service instance for a branch."""
    return MessagingService(branch)


def can_system_send_messages(branch: Branch) -> Tuple[bool, str]:
    """Quick check if system can send messages."""
    service = MessagingService(branch)
    return service.can_send_messages()


def validate_user_messaging(branch: Branch, user: User) -> Tuple[bool, str]:
    """Quick validation for user messaging capabilities."""
    service = MessagingService(branch)
    return service.is_user_enabled_for_messages(user)


def validate_account_messaging(branch: Branch, account: Account) -> Tuple[bool, str]:
    """Quick validation for account messaging capabilities."""
    service = MessagingService(branch)
    return service.is_account_enabled_for_messages(account)
