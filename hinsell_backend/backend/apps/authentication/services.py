from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.authentication.models import User, UserProfile, AuditLog
from apps.core_apps.utils import Logger
from django.utils.translation import gettext_lazy as _

logger = Logger(__name__)

class AuthenticationService:
    @staticmethod
    def unlock_account(user: User):
        user.account_locked_until = None
        user.failed_login_attempts = 0
        user.save(update_fields=['account_locked_until', 'failed_login_attempts'])
        logger.info(f"Account unlocked for user: {user.username}", extra={'user_type': user.user_type})
        AuditService.create_audit_log(
            branch=user.default_branch,
            user=user,
            action_type=AuditLog.ActionType.ACCOUNT_UNLOCKED,
            username=user.username,
            details={'reason': 'Account unlocked by admin', 'user_type': user.user_type}
        )

    @staticmethod
    def reset_failed_logins(user: User):
        if user.failed_login_attempts > 0:
            user.failed_login_attempts = 0
            user.save(update_fields=['failed_login_attempts'])
            logger.info(f"Reset failed login attempts for user: {user.username}", 
                       extra={'user_type': user.user_type})

    @staticmethod
    def update_password(user: User, new_password: str):
        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.save(update_fields=['password', 'password_changed_at'])
        from apps.authentication.tasks import send_password_change_notification
        send_password_change_notification.delay(user.id)
        logger.info(f"Password updated for user: {user.username}", extra={'user_type': user.user_type})
        AuditService.create_audit_log(
            branch=user.default_branch,
            user=user,
            action_type=AuditLog.ActionType.PASSWORD_CHANGE,
            username=user.username,
            details={'action': 'Password updated', 'user_type': user.user_type}
        )

class LoyaltyService:
    @staticmethod
    def add_loyalty_points(user: User, points: int, reason: str = None):
        if points < 0:
            raise ValidationError(_('Points to add cannot be negative.'))
        user.loyalty_points += points
        user.save(update_fields=['loyalty_points'])
        AuditService.create_audit_log(
            branch=user.default_branch,
            user=user,
            action_type=AuditLog.ActionType.LOYALTY_POINTS_ADDED,
            username=user.username,
            details={'points': points, 'reason': reason or 'No reason provided', 'user_type': user.user_type}
        )
        logger.info(f"Added {points} loyalty points to user: {user.username}", 
                   extra={'points': points, 'reason': reason, 'user_type': user.user_type})

    @staticmethod
    def redeem_loyalty_points(user: User, points: int, coupon_id: int = None):
        if points < 0:
            raise ValidationError(_('Points to redeem cannot be negative.'))
        if points > user.loyalty_points:
            raise ValidationError(_('Insufficient loyalty points.'))
        user.loyalty_points -= points
        user.save(update_fields=['loyalty_points'])
        AuditService.create_audit_log(
            branch=user.default_branch,
            user=user,
            action_type=AuditLog.ActionType.LOYALTY_POINTS_REDEEMED,
            username=user.username,
            details={'points': points, 'coupon_id': coupon_id, 'user_type': user.user_type}
        )
        logger.info(f"Redeemed {points} loyalty points from user: {user.username}", 
                   extra={'points': points, 'coupon_id': coupon_id, 'user_type': user.user_type})

class UserProfileService:
    @staticmethod
    def withdraw_consent(profile: UserProfile, consent_type: str):
        if consent_type in profile.data_consent:
            profile.data_consent[consent_type] = False
            if consent_type == 'marketing':
                profile.marketing_opt_in = False
            if consent_type == 'data_processing':
                profile.notifications = {channel: False for channel in profile.notifications}
                profile.push_token = None
            profile.save()
            AuditService.create_audit_log(
                branch=profile.user.default_branch,
                user=profile.user,
                action_type=AuditLog.ActionType.CONSENT_UPDATED,
                username=profile.user.username,
                details={'consent_type': consent_type, 'status': 'withdrawn', 'user_type': profile.user.user_type}
            )
            logger.info(f"Withdrew {consent_type} consent for user: {profile.user.username}", 
                       extra={'consent_type': consent_type, 'user_type': profile.user.user_type})

class AuditService:
    @staticmethod
    def get_device_type(user_agent: str) -> str:
        ua = user_agent.lower()
        if any(mobile in ua for mobile in ['mobile', 'android', 'iphone', 'ipod']):
            return 'Mobile Device'
        if any(tablet in ua for tablet in ['tablet', 'ipad']):
            return 'Tablet'
        if 'windows' in ua:
            return 'Windows Desktop'
        if any(mac in ua for mac in ['macintosh', 'mac os']):
            return 'Mac Desktop'
        if 'linux' in ua:
            return 'Linux Desktop'
        return 'Unknown Device'

    @staticmethod
    def calculate_risk_score(audit_log: AuditLog) -> int:
        score = 0
        if audit_log.login_status in (AuditLog.LoginStatus.FAILED, AuditLog.LoginStatus.BLOCKED):
            score += 40
        if not audit_log.country or not audit_log.city:
            score += 20
        if audit_log.action_type in (
            AuditLog.ActionType.PERMISSION_CHANGE, AuditLog.ActionType.ACCOUNT_LOCKED,
            AuditLog.ActionType.TERMS_ACCEPTED, AuditLog.ActionType.CONSENT_UPDATED
        ):
            score += 20
        if audit_log.action_type == AuditLog.ActionType.PROFILE_DELETION:
            score += 30
        if audit_log.user and audit_log.user.user_type in [User.UserType.GUEST, User.UserType.PARTNER]:
            score += 10
        if audit_log.ip_address and audit_log.user.last_login_ip and audit_log.ip_address != audit_log.user.last_login_ip:
            score += 15
        if audit_log.details.get('new_device', False):
            score += 25
        if audit_log.user:
            recent_attempts = AuditLog.objects.filter(
                user=audit_log.user,
                action_type=AuditLog.ActionType.LOGIN_FAILED,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=10)
            ).count()
            if recent_attempts > 3:
                score += 20
        return min(score, 100)

    @staticmethod
    def determine_risk_level(score: int) -> str:
        if score >= 80:
            return AuditLog.RiskLevel.CRITICAL
        if score >= 50:
            return AuditLog.RiskLevel.HIGH
        if score >= 20:
            return AuditLog.RiskLevel.MEDIUM
        return AuditLog.RiskLevel.LOW

    @staticmethod
    def create_audit_log(branch, user, action_type, username=None, ip_address=None, user_agent='', session_id=None, details=None, login_status=AuditLog.LoginStatus.SUCCESS):
        # Skip audit log creation if no user is available during initial setup
        if user is None and action_type == AuditLog.ActionType.SYSTEM_ACCESS:
            logger.info(
                f"Skipping audit log creation during system setup - no user available",
                extra={'action_type': action_type, 'branch': branch.branch_name if branch else None}
            )
            return None
            
        audit_log = AuditLog.objects.create(
            branch=branch,
            user=user,
            action_type=action_type,
            username=username or (user.username if user else None),
            ip_address=ip_address,
            user_agent=user_agent,
            device_type=AuditService.get_device_type(user_agent),
            session_id=session_id,
            details=details or {},
            login_status=login_status
        )
        audit_log.risk_score = AuditService.calculate_risk_score(audit_log)
        audit_log.risk_level = AuditService.determine_risk_level(audit_log.risk_score)
        audit_log.save()
        if audit_log.risk_level == AuditLog.RiskLevel.CRITICAL and user:
            from apps.core_apps.services.messaging_service import MessagingService
            admins = User.objects.filter(user_type=User.UserType.ADMIN, default_branch=branch)
            messaging_service = MessagingService(branch=branch)
            for admin in admins:
                messaging_service.send_notification(
                    recipient=admin,
                    notification_type='security_alert',
                    context_data={
                        'user': user.get_full_name(),
                        'action': audit_log.get_action_type_display(),
                        'details': audit_log.details,
                        'site_name': settings.SITE_NAME
                    },
                    channel='email',
                    priority='high'
                )
        logger.info(
            f"Audit log created for action: {action_type}",
            extra={'user_type': user.user_type if user else None, 'action_type': action_type}
        )
        return audit_log
