from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.template.loader import render_to_string
from django.core.exceptions import ValidationError
from apps.core_apps.general import AuditableModel
from apps.authentication.models import User
from apps.organization.models import Branch
from apps.inventory.models import Media
from apps.core_apps.utils import Logger, generate_unique_code
from django.db.utils import IntegrityError

logger = Logger(__name__)

class NotificationTemplate(AuditableModel):
    """Template for different types of notifications."""
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
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name")
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        verbose_name=_("Type")
    )
    channel = models.CharField(
        max_length=10,
        choices=Channel.choices,
        verbose_name=_("Channel")
    )
    subject = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Subject")
    )
    content = models.TextField(
        verbose_name=_("Content")
    )
    html_content = models.TextField(
        blank=True,
        verbose_name=_("HTML Content")
    )
    variables = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Template Variables")
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Default Template")
    )

    class Meta:
        verbose_name = _("Notification Template")
        verbose_name_plural = _("Notification Templates")
        unique_together = [['branch', 'notification_type', 'channel']]
        indexes = [
            models.Index(fields=['branch', 'notification_type', 'channel']),
            models.Index(fields=['code']),
        ]

    def clean(self):
        super().clean()
        if not self.code or not self.code.strip():
            raise ValidationError({'code': _('Code cannot be empty.')})
        if not self.name.strip():
            raise ValidationError({'name': _('Name cannot be empty.')})
        if not self.content.strip():
            raise ValidationError({'content': _('Content cannot be empty.')})
        if self.channel == self.Channel.EMAIL and not self.subject.strip():
            raise ValidationError({'subject': _('Subject is required for email notifications.')})

    def render(self, context: dict) -> dict:
        """Render template with given context using Django's render_to_string."""
        try:
            rendered_subject = render_to_string(
                f'notifications/{self.notification_type}_subject.txt',
                context
            ) if self.subject else ''
            rendered_content = render_to_string(
                f'notifications/{self.notification_type}_content.txt',
                {**context, 'content': self.content}
            )
            rendered_html = render_to_string(
                f'notifications/{self.notification_type}_content.html',
                {**context, 'html_content': self.html_content}
            ) if self.html_content else None
            return {
                'subject': rendered_subject.strip(),
                'content': rendered_content.strip(),
                'html_content': rendered_html.strip() if rendered_html else None
            }
        except Exception as e:
            logger.error(f"Error rendering template {self.code}: {str(e)}", exc_info=True)
            raise

    def preview(self, context: dict) -> dict:
        """Preview rendered template without saving or sending."""
        return self.render(context)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.get_channel_display()})"

class Notification(AuditableModel):
    """Individual notification instance with delivery tracking and media attachments."""
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

    class Recurrence(models.TextChoices):
        NONE = 'none', _('None')
        DAILY = 'daily', _('Daily')
        WEEKLY = 'weekly', _('Weekly')
        MONTHLY = 'monthly', _('Monthly')

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
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_("Recipient")
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
    recurrence = models.CharField(
        max_length=10,
        choices=Recurrence.choices,
        default=Recurrence.NONE,
        verbose_name=_("Recurrence")
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
        verbose_name=_("Context Data")
    )
    attachments = models.ManyToManyField(
        Media,
        blank=True,
        related_name='notifications',
        verbose_name=_("Attachments")
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
        verbose_name=_("Scheduled At")
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
        verbose_name=_("External ID")
    )

    class Meta:
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        indexes = [
            models.Index(fields=['branch', 'recipient', 'status']),
            models.Index(fields=['channel', 'notification_type', 'priority']),
            models.Index(fields=['scheduled_at', 'recurrence']),
        ]

    def clean(self):
        super().clean()
        if not self.recipient and not (self.context_data.get('email') or self.context_data.get('phone')):
            raise ValidationError(_('Recipient or contact information (email/phone) must be provided.'))
        if self.recipient and hasattr(self.recipient, 'profile'):
            if not self.recipient.profile.can_receive_notifications(self.channel):
                raise ValidationError({f'channel': _(f'Recipient does not allow {self.channel} notifications.')})
        if self.channel == NotificationTemplate.Channel.EMAIL and not self.subject.strip():
            raise ValidationError({'subject': _('Subject is required for email notifications.')})
        if self.scheduled_at and self.scheduled_at < timezone.now():
            raise ValidationError({'scheduled_at': _('Scheduled time cannot be in the past.')})
        if self.recurrence != self.Recurrence.NONE and not self.scheduled_at:
            raise ValidationError({'recurrence': _('Scheduled time is required for recurring notifications.')})

    def mark_as_sent(self):
        self.status = self.Status.SENT
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])
        NotificationLog.objects.create(
            notification=self,
            action='sent',
            details={'timestamp': self.sent_at.isoformat()}
        )

    def mark_as_delivered(self):
        self.status = self.Status.DELIVERED
        self.delivered_at = timezone.now()
        self.save(update_fields=['status', 'delivered_at'])
        NotificationLog.objects.create(
            notification=self,
            action='delivered',
            details={'timestamp': self.delivered_at.isoformat()}
        )

    def mark_as_read(self):
        self.status = self.Status.READ
        self.read_at = timezone.now()
        self.save(update_fields=['status', 'read_at'])
        NotificationLog.objects.create(
            notification=self,
            action='read',
            details={'timestamp': self.read_at.isoformat()}
        )

    def mark_as_failed(self, error_message: str):
        self.status = self.Status.FAILED
        self.error_message = error_message
        self.retry_count += 1
        self.save(update_fields=['status', 'error_message', 'retry_count'])
        NotificationLog.objects.create(
            notification=self,
            action='failed',
            details={'error': error_message}
        )

    def can_retry(self) -> bool:
        return self.status == self.Status.FAILED and self.retry_count < self.max_retries

    def schedule_next_recurrence(self):
        """Schedule the next occurrence for recurring notifications."""
        if self.recurrence == self.Recurrence.NONE or not self.scheduled_at:
            return
        delta = {
            self.Recurrence.DAILY: timezone.timedelta(days=1),
            self.Recurrence.WEEKLY: timezone.timedelta(weeks=1),
            self.Recurrence.MONTHLY: timezone.timedelta(days=30)
        }.get(self.recurrence)
        if delta:
            new_notification = Notification.objects.create(
                branch=self.branch,
                template=self.template,
                recipient=self.recipient,
                channel=self.channel,
                notification_type=self.notification_type,
                priority=self.priority,
                recurrence=self.recurrence,
                subject=self.subject,
                content=self.content,
                html_content=self.html_content,
                context_data=self.context_data,
                scheduled_at=self.scheduled_at + delta,
                max_retries=self.max_retries
            )
            new_notification.attachments.set(self.attachments.all())
            logger.info(f"Scheduled next recurrence for notification {self.id}: {new_notification.scheduled_at}")

    def __str__(self):
        recipient = self.recipient.get_full_name() if self.recipient else (
            self.context_data.get('email') or self.context_data.get('phone') or 'Unknown'
        )
        return f"{self.get_notification_type_display()} to {recipient}"

class NotificationLog(AuditableModel):
    """Log of all notification delivery attempts and results."""
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
            models.Index(fields=['notification', 'action']),
        ]

    def __str__(self):
        return f"{self.notification} - {self.get_action_display()}"

class InternalMessage(AuditableModel):
    """Internal messaging system between users."""
    class Priority(models.TextChoices):
        LOW = 'low', _('Low')
        NORMAL = 'normal', _('Normal')
        HIGH = 'high', _('High')
        URGENT = 'urgent', _('Urgent')

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_("Sender")
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        verbose_name=_("Recipient")
    )
    subject = models.CharField(
        max_length=200,
        verbose_name=_("Subject")
    )
    content = models.TextField(
        verbose_name=_("Content")
    )
    attachments = models.ManyToManyField(
        Media,
        blank=True,
        related_name='messages',
        verbose_name=_("Attachments")
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name=_("Is Read")
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Read At")
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL,
        verbose_name=_("Priority")
    )

    class Meta:
        verbose_name = _("Internal Message")
        verbose_name_plural = _("Internal Messages")
        indexes = [
            models.Index(fields=['branch', 'sender', 'recipient']),
            models.Index(fields=['is_read', 'priority']),
        ]

    def clean(self):
        super().clean()
        if not self.code or not self.code.strip():
            raise ValidationError({'code': _('Code cannot be empty.')})
        if not self.subject.strip():
            raise ValidationError({'subject': _('Subject cannot be empty.')})
        if not self.content.strip():
            raise ValidationError({'content': _('Content cannot be empty.')})
        if self.sender == self.recipient:
            raise ValidationError({'recipient': _('Sender and recipient cannot be the same.')})


    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])

    def __str__(self):
        return f"{self.code} - {self.subject} from {self.sender.get_full_name()}"

class UserNote(AuditableModel):
    """User personal notes and reminders."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name=_("User")
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name=_("Branch")
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        verbose_name=_("Code")
    )
    title = models.CharField(
        max_length=200,
        verbose_name=_("Title")
    )
    content = models.TextField(
        verbose_name=_("Content")
    )
    attachments = models.ManyToManyField(
        Media,
        blank=True,
        related_name='notes',
        verbose_name=_("Attachments")
    )
    reminder_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Reminder Date")
    )
    is_reminder_sent = models.BooleanField(
        default=False,
        verbose_name=_("Reminder Sent")
    )
    tags = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Tags")
    )
    color = models.CharField(
        max_length=7,
        default='#FFFFFF',
        verbose_name=_("Color")
    )

    class Meta:
        verbose_name = _("User Note")
        verbose_name_plural = _("User Notes")
        indexes = [
            models.Index(fields=['user', 'branch']),
            models.Index(fields=['reminder_date', 'is_reminder_sent']),
        ]

    def clean(self):
        super().clean()
        if not self.code or not self.code.strip():
            raise ValidationError({'code': _('Code cannot be empty.')})
        if not self.title.strip():
            raise ValidationError({'title': _('Title cannot be empty.')})
        if not self.content.strip():
            raise ValidationError({'content': _('Content cannot be empty.')})
        if self.reminder_date and self.reminder_date < timezone.now():
            raise ValidationError({'reminder_date': _('Reminder date cannot be in the past.')})

    def mark_reminder_sent(self):
        self.is_reminder_sent = True
        self.save(update_fields=['is_reminder_sent'])

    def __str__(self):
        return f"{self.code} - {self.title} by {self.user.get_full_name()}"