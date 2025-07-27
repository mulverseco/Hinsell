"""
Notification models for comprehensive messaging system.
Supports multiple channels and delivery tracking.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.core_apps.general import AuditableModel
from apps.authentication.models import User
from apps.organization.models import Branch

class NotificationTemplate(AuditableModel):
    """
    Template for different types of notifications.
    """
    
    class NotificationType(models.TextChoices):
        WELCOME = 'welcome', _('Welcome')
        PASSWORD_RESET = 'password_reset', _('Password Reset')
        SECURITY_ALERT = 'security_alert', _('Security Alert')
        INVENTORY_LOW = 'inventory_low', _('Low Inventory')
        INVENTORY_EXPIRED = 'inventory_expired', _('Expired Inventory')
        TRANSACTION_APPROVED = 'transaction_approved', _('Transaction Approved')
        TRANSACTION_REJECTED = 'transaction_rejected', _('Transaction Rejected')
        PAYMENT_DUE = 'payment_due', _('Payment Due')
        PAYMENT_OVERDUE = 'payment_overdue', _('Payment Overdue')
        SYSTEM_MAINTENANCE = 'system_maintenance', _('System Maintenance')
        CUSTOM = 'custom', _('Custom')
    
    class Channel(models.TextChoices):
        EMAIL = 'email', _('Email')
        SMS = 'sms', _('SMS')
        WHATSAPP = 'whatsapp', _('WhatsApp')
        IN_APP = 'in_app', _('In-App')
        PUSH = 'push', _('Push Notification')
    
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='notification_templates',
        verbose_name=_("Branch")
    )
    
    name = models.CharField(
        max_length=100,
        verbose_name=_("Template Name"),
        help_text=_("Descriptive name for the template")
    )
    
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        verbose_name=_("Notification Type"),
        help_text=_("Type of notification this template is for")
    )
    
    channel = models.CharField(
        max_length=10,
        choices=Channel.choices,
        verbose_name=_("Channel"),
        help_text=_("Delivery channel for this template")
    )
    
    subject = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Subject"),
        help_text=_("Subject line (for email) or title (for other channels)")
    )
    
    content = models.TextField(
        verbose_name=_("Content"),
        help_text=_("Template content with placeholders")
    )
    
    html_content = models.TextField(
        blank=True,
        verbose_name=_("HTML Content"),
        help_text=_("HTML version of the content (for email)")
    )
    
    variables = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Template Variables"),
        help_text=_("Available variables for this template")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Default Template"),
        help_text=_("Whether this is the default template for this type and channel")
    )
    
    class Meta:
        verbose_name = _("Notification Template")
        verbose_name_plural = _("Notification Templates")
        unique_together = [
            ['branch', 'notification_type', 'channel', 'is_default']
        ]
        indexes = [
            models.Index(fields=['branch', 'notification_type']),
            models.Index(fields=['channel']),
            models.Index(fields=['is_default']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to handle default template logic."""
        if self.is_default:
            # Ensure only one default template per type and channel
            NotificationTemplate.objects.filter(
                branch=self.branch,
                notification_type=self.notification_type,
                channel=self.channel,
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        
        super().save(*args, **kwargs)
    
    def render(self, context):
        """Render template with given context."""
        from django.template import Template, Context
        
        # Render subject
        subject_template = Template(self.subject)
        rendered_subject = subject_template.render(Context(context))
        
        # Render content
        content_template = Template(self.content)
        rendered_content = content_template.render(Context(context))
        
        # Render HTML content if available
        rendered_html = None
        if self.html_content:
            html_template = Template(self.html_content)
            rendered_html = html_template.render(Context(context))
        
        return {
            'subject': rendered_subject,
            'content': rendered_content,
            'html_content': rendered_html
        }
    
    def __str__(self):
        return f"{self.name} ({self.get_channel_display()})"


class Notification(AuditableModel):
    """
    Individual notification instance with delivery tracking.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        SENT = 'sent', _('Sent')
        DELIVERED = 'delivered', _('Delivered')
        READ = 'read', _('Read')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')
    
    class Priority(models.TextChoices):
        LOW = 'low', _('Low')
        NORMAL = 'normal', _('Normal')
        HIGH = 'high', _('High')
        URGENT = 'urgent', _('Urgent')
    
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_("Branch")
    )
    
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_("Template")
    )
    
    recipient_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_("Recipient User")
    )
    
    recipient_email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_("Recipient Email")
    )
    
    recipient_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Recipient Phone")
    )
    
    channel = models.CharField(
        max_length=10,
        choices=NotificationTemplate.Channel.choices,
        verbose_name=_("Channel")
    )
    
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationTemplate.NotificationType.choices,
        verbose_name=_("Type")
    )
    
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL,
        verbose_name=_("Priority")
    )
    
    subject = models.CharField(
        max_length=200,
        verbose_name=_("Subject")
    )
    
    content = models.TextField(
        verbose_name=_("Content")
    )
    
    html_content = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("HTML Content")
    )
    
    context_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Context Data"),
        help_text=_("Data used to render the notification")
    )
    
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name=_("Status")
    )
    
    scheduled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Scheduled At"),
        help_text=_("When to send this notification")
    )
    
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Sent At")
    )
    
    delivered_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Delivered At")
    )
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Read At")
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Error Message")
    )
    
    retry_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Retry Count")
    )
    
    max_retries = models.PositiveIntegerField(
        default=3,
        verbose_name=_("Max Retries")
    )
    
    external_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("External ID"),
        help_text=_("ID from external service (SMS provider, etc.)")
    )
    
    class Meta:
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        indexes = [
            models.Index(fields=['branch', 'status']),
            models.Index(fields=['recipient_user', 'status']),
            models.Index(fields=['channel', 'status']),
            models.Index(fields=['scheduled_at']),
            models.Index(fields=['created_at']),
            models.Index(fields=['priority', 'status']),
        ]
    
    def mark_as_sent(self):
        """Mark notification as sent."""
        self.status = self.Status.SENT
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])
    
    def mark_as_delivered(self):
        """Mark notification as delivered."""
        self.status = self.Status.DELIVERED
        self.delivered_at = timezone.now()
        self.save(update_fields=['status', 'delivered_at'])
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.status = self.Status.READ
        self.read_at = timezone.now()
        self.save(update_fields=['status', 'read_at'])
    
    def mark_as_failed(self, error_message):
        """Mark notification as failed."""
        self.status = self.Status.FAILED
        self.error_message = error_message
        self.retry_count += 1
        self.save(update_fields=['status', 'error_message', 'retry_count'])
    
    def can_retry(self):
        """Check if notification can be retried."""
        return (self.status == self.Status.FAILED and 
                self.retry_count < self.max_retries)
    
    def __str__(self):
        recipient = self.recipient_user.get_full_name() if self.recipient_user else (
            self.recipient_email or self.recipient_phone or 'Unknown'
        )
        return f"{self.get_notification_type_display()} to {recipient}"


class NotificationPreference(AuditableModel):
    """
    User preferences for different types of notifications.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        verbose_name=_("User")
    )
    
    # Email preferences
    email_enabled = models.BooleanField(
        default=True,
        verbose_name=_("Email Notifications Enabled")
    )
    
    email_welcome = models.BooleanField(
        default=True,
        verbose_name=_("Welcome Emails")
    )
    
    email_security = models.BooleanField(
        default=True,
        verbose_name=_("Security Alerts")
    )
    
    email_inventory = models.BooleanField(
        default=True,
        verbose_name=_("Inventory Alerts")
    )
    
    email_transactions = models.BooleanField(
        default=True,
        verbose_name=_("Transaction Notifications")
    )
    
    email_payments = models.BooleanField(
        default=True,
        verbose_name=_("Payment Reminders")
    )
    
    # SMS preferences
    sms_enabled = models.BooleanField(
        default=False,
        verbose_name=_("SMS Notifications Enabled")
    )
    
    sms_security = models.BooleanField(
        default=True,
        verbose_name=_("Security SMS")
    )
    
    sms_urgent = models.BooleanField(
        default=True,
        verbose_name=_("Urgent SMS")
    )
    
    # WhatsApp preferences
    whatsapp_enabled = models.BooleanField(
        default=True,
        verbose_name=_("WhatsApp Notifications Enabled")
    )
    
    whatsapp_inventory = models.BooleanField(
        default=True,
        verbose_name=_("Inventory WhatsApp")
    )
    
    whatsapp_transactions = models.BooleanField(
        default=True,
        verbose_name=_("Transaction WhatsApp")
    )
    
    whatsapp_payments = models.BooleanField(
        default=True,
        verbose_name=_("Payment WhatsApp")
    )
    
    # In-app preferences
    in_app_enabled = models.BooleanField(
        default=True,
        verbose_name=_("In-App Notifications Enabled")
    )
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(
        default=False,
        verbose_name=_("Quiet Hours Enabled")
    )
    
    quiet_hours_start = models.TimeField(
        null=True,
        blank=True,
        verbose_name=_("Quiet Hours Start")
    )
    
    quiet_hours_end = models.TimeField(
        null=True,
        blank=True,
        verbose_name=_("Quiet Hours End")
    )
    
    class Meta:
        verbose_name = _("Notification Preference")
        verbose_name_plural = _("Notification Preferences")
    
    def is_channel_enabled(self, channel, notification_type):
        """Check if a specific channel is enabled for a notification type."""
        if channel == 'email':
            if not self.email_enabled:
                return False
            
            type_mapping = {
                'welcome': self.email_welcome,
                'security_alert': self.email_security,
                'inventory_low': self.email_inventory,
                'inventory_expired': self.email_inventory,
                'transaction_approved': self.email_transactions,
                'transaction_rejected': self.email_transactions,
                'payment_due': self.email_payments,
                'payment_overdue': self.email_payments,
            }
            
            return type_mapping.get(notification_type, True)
        
        elif channel == 'sms':
            if not self.sms_enabled:
                return False
            
            type_mapping = {
                'security_alert': self.sms_security,
            }
            
            # Only urgent notifications via SMS by default
            return type_mapping.get(notification_type, self.sms_urgent)
        
        elif channel == 'whatsapp':
            if not self.whatsapp_enabled:
                return False
            
            type_mapping = {
                'inventory_low': self.whatsapp_inventory,
                'inventory_expired': self.whatsapp_inventory,
                'transaction_approved': self.whatsapp_transactions,
                'transaction_rejected': self.whatsapp_transactions,
                'payment_due': self.whatsapp_payments,
                'payment_overdue': self.whatsapp_payments,
            }
            
            return type_mapping.get(notification_type, True)
        
        elif channel == 'in_app':
            return self.in_app_enabled
        
        return True
    
    def is_in_quiet_hours(self):
        """Check if current time is within quiet hours."""
        if not self.quiet_hours_enabled or not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        
        current_time = timezone.now().time()
        
        if self.quiet_hours_start <= self.quiet_hours_end:
            # Same day quiet hours
            return self.quiet_hours_start <= current_time <= self.quiet_hours_end
        else:
            # Overnight quiet hours
            return current_time >= self.quiet_hours_start or current_time <= self.quiet_hours_end
    
    def __str__(self):
        return f"Notification preferences for {self.user.get_full_name()}"


class NotificationLog(AuditableModel):
    """
    Log of all notification delivery attempts and results.
    """
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='logs',
        verbose_name=_("Notification")
    )
    
    action = models.CharField(
        max_length=20,
        choices=[
            ('created', _('Created')),
            ('sent', _('Sent')),
            ('delivered', _('Delivered')),
            ('read', _('Read')),
            ('failed', _('Failed')),
            ('retried', _('Retried')),
            ('cancelled', _('Cancelled')),
        ],
        verbose_name=_("Action")
    )
    
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Details")
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Error Message")
    )
    
    class Meta:
        verbose_name = _("Notification Log")
        verbose_name_plural = _("Notification Logs")
        indexes = [
            models.Index(fields=['notification', 'created_at']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        return f"{self.notification} - {self.get_action_display()}"

class InternalMessage(AuditableModel):
    """Internal messaging system between users"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='normal')


class UserNote(AuditableModel):
    """User personal notes and reminders"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    reminder_date = models.DateTimeField(null=True, blank=True)
    is_reminder_sent = models.BooleanField(default=False)
    tags = models.CharField(max_length=200, blank=True)
    color = models.CharField(max_length=7, default='#ffffff')  # Hex color