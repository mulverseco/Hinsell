# apps/authentication/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from apps.authentication.models import User, AuditLog, UserProfile
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _
import jwt
import pyotp

logger = Logger(__name__)

class TwoFactorRequiredException(AuthenticationFailed):
    status_code = 401
    default_detail = _('Two-factor authentication required.')
    default_code = 'two_factor_required'

class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user = User.objects.get(id=user_id, is_active=True)

            if user.is_account_locked():
                from apps.authentication.services import AuditService
                logger.warning(
                    f"Authentication failed for {user.username}: Account locked",
                    extra={'user_id': user_id, 'user_type': user.user_type}
                )
                AuditService.create_audit_log(
                    branch=user.default_branch,
                    user=user,
                    action_type=AuditLog.ActionType.LOGIN_FAILED,
                    username=user.username,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details={'reason': 'Account locked'},
                    login_status=AuditLog.LoginStatus.BLOCKED
                )
                raise AuthenticationFailed(_('Account is locked.'))

            if user.is_two_factor_enabled:
                # Check for 2FA token in request headers
                tfa_token = request.META.get('HTTP_X_TFA_TOKEN')
                if not tfa_token:
                    raise TwoFactorRequiredException()
                # Assuming TOTP-based 2FA stored in UserProfile.push_token or a dedicated field
                try:
                    profile = user.profile
                    totp = pyotp.TOTP(profile.push_token or settings.TFA_SECRET)
                    if not totp.verify(tfa_token):
                        from apps.authentication.services import AuditService
                        AuditService.create_audit_log(
                            branch=user.default_branch,
                            user=user,
                            action_type=AuditLog.ActionType.LOGIN_FAILED,
                            username=user.username,
                            ip_address=self._get_client_ip(request),
                            user_agent=request.META.get('HTTP_USER_AGENT', ''),
                            details={'reason': 'Invalid 2FA token'},
                            login_status=AuditLog.LoginStatus.FAILED
                        )
                        raise AuthenticationFailed(_('Invalid 2FA token.'))
                except UserProfile.DoesNotExist:
                    raise AuthenticationFailed(_('User profile not found for 2FA.'))

            logger.info(
                f"Successful JWT authentication for {user.username}",
                extra={'user_id': user_id, 'user_type': user.user_type}
            )
            return (user, token)
        except jwt.ExpiredSignatureError:
            logger.error("JWT token expired", extra={'token': token})
            raise AuthenticationFailed(_('Token has expired.'))
        except jwt.InvalidTokenError:
            logger.error("Invalid JWT token", extra={'token': token})
            raise AuthenticationFailed(_('Invalid token.'))
        except User.DoesNotExist:
            logger.error("User not found for JWT token", extra={'user_id': user_id})
            raise AuthenticationFailed(_('User not found.'))

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip