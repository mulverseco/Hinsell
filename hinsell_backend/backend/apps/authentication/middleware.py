"""
Authentication middleware for enhanced security and audit logging.
Provides comprehensive request tracking and security features.
"""
import logging
import json
import time
from typing import Optional, Dict, Any
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.conf import settings
from django.utils.functional import SimpleLazyObject
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from user_agents import parse
import ipaddress

logger = logging.getLogger(__name__)
User = get_user_model()


class SecurityMiddleware(MiddlewareMixin):
    """
    Enhanced security middleware with comprehensive protection features.
    """
    
    RATE_LIMIT_REQUESTS = 100
    RATE_LIMIT_WINDOW = 3600
    
    MAX_FAILED_ATTEMPTS = 5
    LOCKOUT_DURATION = 1800
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request: HttpRequest) -> Optional[HttpResponse]:
        """
        Process incoming request for security checks.
        """
        client_ip = self.get_client_ip(request)
        request.client_ip = client_ip
        
        if self.is_ip_blocked(client_ip):
            logger.warning(f"Blocked request from blacklisted IP: {client_ip}")
            return JsonResponse(
                {'error': 'Access denied'}, 
                status=403
            )
        
        if self.is_rate_limited(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JsonResponse(
                {'error': 'Rate limit exceeded'}, 
                status=429
            )
        
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        request.user_agent_parsed = parse(user_agent)

        if self.is_suspicious_user_agent(user_agent):
            logger.warning(f"Suspicious user agent detected: {user_agent}")
        
        request.start_time = time.time()
        
        return None
    
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """
        Process response and add security headers.
        """
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        if settings.DEBUG:
            response['X-Debug-Mode'] = 'true'
        
        if hasattr(settings, 'CORS_ALLOW_ALL_ORIGINS') and settings.CORS_ALLOW_ALL_ORIGINS:
            response['Access-Control-Allow-Origin'] = '*'
        
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            response['X-Response-Time'] = f"{duration:.3f}s"
        
        return response
    
    def get_client_ip(self, request: HttpRequest) -> str:
        """
        Get the real client IP address.
        """
        forwarded_headers = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
        ]
        
        for header in forwarded_headers:
            ip = request.META.get(header)
            if ip:
                ip = ip.split(',')[0].strip()
                if self.is_valid_ip(ip):
                    return ip
        
        return request.META.get('REMOTE_ADDR', '127.0.0.1')
    
    def is_valid_ip(self, ip: str) -> bool:
        """
        Validate IP address format.
        """
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False
    
    def is_ip_blocked(self, ip: str) -> bool:
        """
        Check if IP is in blacklist.
        """
        blocked_ips = cache.get('blocked_ips', set())
        return ip in blocked_ips
    
    def is_rate_limited(self, ip: str) -> bool:
        """
        Check if IP has exceeded rate limit.
        """
        cache_key = f"rate_limit:{ip}"
        current_requests = cache.get(cache_key, 0)
        
        if current_requests >= self.RATE_LIMIT_REQUESTS:
            return True
        
        cache.set(
            cache_key, 
            current_requests + 1, 
            timeout=self.RATE_LIMIT_WINDOW
        )
        
        return False
    
    def is_suspicious_user_agent(self, user_agent: str) -> bool:
        """
        Check for suspicious user agent patterns.
        """
        suspicious_patterns = [
            'bot', 'crawler', 'spider', 'scraper',
            'curl', 'wget', 'python-requests',
            'sqlmap', 'nikto', 'nmap'
        ]
        
        user_agent_lower = user_agent.lower()
        return any(pattern in user_agent_lower for pattern in suspicious_patterns)


class AuditLoggingMiddleware(MiddlewareMixin):
    """
    Middleware for comprehensive audit logging of all requests.
    """
    
    SENSITIVE_FIELDS = {
        'password', 'token', 'secret', 'key', 'authorization',
        'cookie', 'session', 'csrf', 'api_key'
    }
    
    EXCLUDED_URLS = {
        '/health/', '/api/schema/', '/static/', '/media/'
    }
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request: HttpRequest) -> None:
        """
        Log incoming request details.
        """
        if any(request.path.startswith(url) for url in self.EXCLUDED_URLS):
            return
        
        request_data = {
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'ip_address': getattr(request, 'client_ip', ''),
            'timestamp': timezone.now().isoformat(),
        }
        
        if hasattr(request, 'user') and request.user.is_authenticated:
            request_data['user_id'] = request.user.id
            request_data['username'] = request.user.username
        
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if request.content_type == 'application/json':
                    body_data = json.loads(request.body.decode('utf-8'))
                    request_data['body'] = self.sanitize_data(body_data)
                else:
                    request_data['body'] = self.sanitize_data(dict(request.POST))
            except (json.JSONDecodeError, UnicodeDecodeError):
                request_data['body'] = '<binary_data>'
        
        request._audit_data = request_data
    
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """
        Log response details and create audit log entry.
        """
        if any(request.path.startswith(url) for url in self.EXCLUDED_URLS):
            return response
        
        if not hasattr(request, '_audit_data'):
            return response
        
        request._audit_data.update({
            'status_code': response.status_code,
            'response_time': getattr(response, 'X-Response-Time', ''),
        })
        
        self.create_audit_log_async(request._audit_data, request)
        
        return response
    
    def sanitize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Remove sensitive information from data.
        """
        if not isinstance(data, dict):
            return data
        
        sanitized = {}
        for key, value in data.items():
            key_lower = key.lower()
            
            if any(sensitive in key_lower for sensitive in self.SENSITIVE_FIELDS):
                sanitized[key] = '<redacted>'
            elif isinstance(value, dict):
                sanitized[key] = self.sanitize_data(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self.sanitize_data(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        
        return sanitized
    
    def create_audit_log_async(self, audit_data: Dict[str, Any], request: HttpRequest):
        """
        Create audit log entry asynchronously.
        """
        try:
            from apps.authentication.tasks import create_audit_log_entry
            create_audit_log_entry.delay(audit_data, request.path)
        except ImportError:
            self.create_audit_log_sync(audit_data, request)
    
    def create_audit_log_sync(self, audit_data: Dict[str, Any], request: HttpRequest):
        """
        Create audit log entry synchronously.
        """
        try:
            from apps.authentication.models import AuditLog
            from apps.organization.models import Branch
    
            user = None
            branch = None
            
            if hasattr(request, 'user') and request.user.is_authenticated:
                user = request.user
                branch = getattr(user, 'default_branch', None)
            
            if not branch:
                branch = Branch.objects.filter(is_primary=True).first()
            
            if branch:
                action_type = self.determine_action_type(request)
                
                AuditLog.objects.create(
                    branch=branch,
                    user=user,
                    action_type=action_type,
                    username=audit_data.get('username', ''),
                    ip_address=audit_data.get('ip_address', ''),
                    user_agent=audit_data.get('user_agent', ''),
                    device_type=self.get_device_type(audit_data.get('user_agent', '')),
                    screen_name=request.path,
                    details=audit_data,
                    login_status='success' if 200 <= audit_data.get('status_code', 0) < 400 else 'failed'
                )
                
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
    
    def determine_action_type(self, request: HttpRequest) -> str:
        """
        Determine action type based on request.
        """
        if 'login' in request.path:
            return 'login'
        elif 'logout' in request.path:
            return 'logout'
        elif request.method in ['POST', 'PUT', 'PATCH']:
            return 'data_modification'
        elif request.method == 'DELETE':
            return 'data_modification'
        else:
            return 'data_access'
    
    def get_device_type(self, user_agent: str) -> str:
        """
        Determine device type from user agent.
        """
        if not user_agent:
            return 'Unknown'
        
        user_agent_lower = user_agent.lower()
        
        if any(mobile in user_agent_lower for mobile in ['mobile', 'android', 'iphone']):
            return 'Mobile'
        elif any(tablet in user_agent_lower for tablet in ['tablet', 'ipad']):
            return 'Tablet'
        else:
            return 'Desktop'


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to handle JWT authentication for API requests.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()
        super().__init__(get_response)
    
    def process_request(self, request: HttpRequest) -> None:
        """
        Authenticate user using JWT token.
        """
        if self.should_skip_auth(request.path):
            return
        
        try:
            auth_result = self.jwt_auth.authenticate(request)
            if auth_result:
                user, token = auth_result
                request.user = user
                request.auth = token
                
                self.update_user_activity(user, request)
            else:
                request.user = SimpleLazyObject(lambda: User.get_anonymous())
                
        except (InvalidToken, TokenError) as e:
            logger.warning(f"JWT authentication failed: {str(e)}")
            request.user = SimpleLazyObject(lambda: User.get_anonymous())
        except Exception as e:
            logger.error(f"Unexpected error in JWT authentication: {str(e)}")
            request.user = SimpleLazyObject(lambda: User.get_anonymous())
    
    def should_skip_auth(self, path: str) -> bool:
        """
        Check if authentication should be skipped for this path.
        """
        skip_paths = [
            '/health/',
            '/api/schema/',
            '/api/docs/',
            '/api/redoc/',
            '/static/',
            '/media/',
            '/admin/',
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/token/',
        ]
        
        return any(path.startswith(skip_path) for skip_path in skip_paths)
    
    def update_user_activity(self, user: User, request: HttpRequest): # type: ignore
        """
        Update user's last activity information.
        """
        try:
            user.last_login = timezone.now()
            user.last_login_ip = getattr(request, 'client_ip', '')
            user.last_login_device = str(getattr(request, 'user_agent_parsed', ''))
            
            user.save(update_fields=['last_login', 'last_login_ip', 'last_login_device'])
            
        except Exception as e:
            logger.error(f"Failed to update user activity: {str(e)}")


class BranchContextMiddleware(MiddlewareMixin):
    """
    Middleware to set branch context for multi-branch operations.
    """
    
    def process_request(self, request: HttpRequest) -> None:
        """
        Set branch context based on user or request headers.
        """
        branch = None
        
        branch_id = request.META.get('HTTP_X_BRANCH_ID')
        if branch_id:
            try:
                from apps.organization.models import Branch
                branch = Branch.objects.get(id=branch_id, is_active=True)
            except Branch.DoesNotExist:
                pass
        
        if not branch and hasattr(request, 'user') and request.user.is_authenticated:
            branch = getattr(request.user, 'default_branch', None)
        
        request.branch = branch
        
        if branch:
            from django.utils import timezone
            import threading
            
            if not hasattr(threading.current_thread(), 'branch'):
                threading.current_thread().branch = branch


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware for detailed request/response logging.
    """
    
    def process_request(self, request: HttpRequest) -> None:
        """
        Log incoming request.
        """
        if settings.DEBUG:
            logger.debug(f"Incoming request: {request.method} {request.path}")
    
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """
        Log response.
        """
        if settings.DEBUG:
            logger.debug(
                f"Response: {request.method} {request.path} -> {response.status_code}"
            )
        
        return response
