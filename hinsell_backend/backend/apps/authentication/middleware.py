from django.conf import settings
from django.utils import timezone
from django.contrib.sessions.models import Session
from apps.core_apps.utils import Logger
from apps.authentication.models import AuditLog, User
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException

logger = Logger(__name__)

class LoginFailedException(APIException):
    status_code = 401
    default_detail = _('Login failed.')
    default_code = 'login_failed'

class AccountLockedException(APIException):
    status_code = 403
    default_detail = _('Account is locked.')
    default_code = 'account_locked'

class UserActivityMiddleware:
    """Middleware to track user activity and update last activity timestamp."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            logger.info(
                f"User activity recorded for {request.user.username}",
                extra={'user_id': request.user.id, 'user_type': request.user.user_type, 'path': request.path}
            )
            request.user.last_activity = timezone.now()
            request.user.save(update_fields=['last_activity'])
        return self.get_response(request)

class UserLoginTracker:
    """Middleware to track login attempts, detect new devices, and create audit logs."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated:
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            ip_address = self._get_client_ip(request)
            is_new_device = (
                user_agent != request.user.last_login_device or
                ip_address != request.user.last_login_ip
            )
            if is_new_device:
                request.user.last_login_device = user_agent
                request.user.last_login_ip = ip_address
                request.user.save(update_fields=['last_login_device', 'last_login_ip'])
                from apps.authentication.services import AuditService
                from apps.core_apps.services.messaging_service import MessagingService
                audit_log = AuditService.create_audit_log(
                    branch=request.user.default_branch,
                    user=request.user,
                    action_type=AuditLog.ActionType.LOGIN,
                    username=request.user.username,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    session_id=request.session.session_key if hasattr(request, 'session') else None,
                    details={'path': request.path, 'new_device': True},
                    login_status=AuditLog.LoginStatus.SUCCESS
                )
                if request.user.profile.can_receive_notifications('email'):
                    MessagingService(branch=request.user.default_branch).send_notification(
                        recipient=request.user,
                        notification_type='new_device',
                        context_data={
                            'full_name': request.user.get_full_name(),
                            'device': AuditService.get_device_type(user_agent),
                            'ip_address': ip_address,
                            'date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                            'site_name': settings.SITE_NAME,
                            'security_url': f"{settings.SITE_URL}/account/security"
                        },
                        channel='email',
                        priority='high'
                    )
            else:
                AuditService.create_audit_log(
                    branch=request.user.default_branch,
                    user=request.user,
                    action_type=AuditLog.ActionType.LOGIN,
                    username=request.user.username,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    session_id=request.session.session_key if hasattr(request, 'session') else None,
                    details={'path': request.path},
                    login_status=AuditLog.LoginStatus.SUCCESS
                )
        elif request.method == 'POST' and '/login/' in request.path:
            username = request.POST.get('username') or request.POST.get('email')
            if username:
                try:
                    user = User.objects.get(email=username) or User.objects.get(username=username)
                    user.failed_login_attempts += 1
                    if user.failed_login_attempts >= 5:
                        user.account_locked_until = timezone.now() + timezone.timedelta(minutes=30)
                        user.save(update_fields=['failed_login_attempts', 'account_locked_until'])
                        remaining = (user.account_locked_until - timezone.now()).total_seconds() / 60
                        self._create_audit_log(
                            request,
                            action_type=AuditLog.ActionType.ACCOUNT_LOCKED,
                            status=AuditLog.LoginStatus.BLOCKED,
                            details={'reason': 'Multiple failed login attempts', 'remaining_minutes': round(remaining)},
                            user=user
                        )
                        raise AccountLockedException(
                            detail=_('Account is locked for %(minutes)d minutes. Please reset your password or try again later.') % {'minutes': round(remaining)}
                        )
                    else:
                        user.save(update_fields=['failed_login_attempts'])
                        attempts_left = 5 - user.failed_login_attempts
                        self._create_audit_log(
                            request,
                            action_type=AuditLog.ActionType.LOGIN_FAILED,
                            status=AuditLog.LoginStatus.FAILED,
                            details={'username': username, 'reason': 'Invalid credentials', 'attempts_left': attempts_left},
                            user=user
                        )
                        if user.profile.can_receive_notifications('email') and attempts_left <= 2:
                            from apps.core_apps.services.messaging_service import MessagingService
                            MessagingService(branch=user.default_branch).send_notification(
                                recipient=user,
                                notification_type='failed_login',
                                context_data={
                                    'full_name': user.get_full_name(),
                                    'attempts_left': attempts_left,
                                    'site_name': settings.SITE_NAME,
                                    'reset_url': f"{settings.SITE_URL}/password-reset"
                                },
                                channel='email',
                                priority='high'
                            )
                        raise LoginFailedException(
                            detail=_('Incorrect email or password. %(attempts_left)d attempts left.') % {'attempts_left': attempts_left}
                        )
                except User.DoesNotExist:
                    self._create_audit_log(
                        request,
                        action_type=AuditLog.ActionType.LOGIN_FAILED,
                        status=AuditLog.LoginStatus.FAILED,
                        details={'username': username, 'reason': 'User does not exist'}
                    )
                    raise LoginFailedException(detail=_('User does not exist.'))

        return response

    def _create_audit_log(self, request, action_type, status, details, user=None):
        from apps.authentication.services import AuditService
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        session_id = request.session.session_key if hasattr(request, 'session') else None
        branch = user.default_branch if user and hasattr(user, 'default_branch') else None

        AuditService.create_audit_log(
            branch=branch,
            user=user,
            action_type=action_type,
            username=user.username if user else None,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            details=details,
            login_status=status
        )

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip