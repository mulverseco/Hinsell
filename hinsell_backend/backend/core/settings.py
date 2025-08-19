import os
from pathlib import Path
import environ
from django.core.management.utils import get_random_secret_key

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False),
    DEVELOPMENT_MODE=(bool, False),
    USE_S3=(bool, False),
    WEBSOCKET_RATE_LIMIT=(bool, True),
    WEBSOCKET_MAX_CONNECTIONS=(int, 1000),
    # Added for messaging and notification services
    MESSAGING_RATE_LIMIT_PER_MINUTE=(int, 30),
    NOTIFICATION_RATE_LIMIT_PER_MINUTE=(int, 60),
)

# ======================
# Base Configuration
# ======================
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENVIRONMENT = env('ENVIRONMENT', default='development')
DEVELOPMENT_MODE = env.bool('DEVELOPMENT_MODE', default=(ENVIRONMENT == 'development'))
DEBUG = env.bool('DEBUG', default=DEVELOPMENT_MODE)

# ======================
# Security Settings
# ======================
SECRET_KEY = env('DJANGO_SECRET_KEY', default=get_random_secret_key())
FIELD_ENCRYPTION_KEY = env('FIELD_ENCRYPTION_KEY', default="WpIhsht-vH71uh8s22Ei_hjpo5O3y88boDs9zDDIl60=")
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['127.0.0.1', 'localhost', 'backend'])
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'ws://localhost:8000',
    'ws://127.0.0.1:8000',
    'wss://backend',
])

# HTTPS Settings
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=not DEVELOPMENT_MODE)
SECURE_HSTS_SECONDS = env.int('SECURE_HSTS_SECONDS', default=3600 if not DEVELOPMENT_MODE else 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=not DEVELOPMENT_MODE)
SECURE_HSTS_PRELOAD = env.bool('SECURE_HSTS_PRELOAD', default=not DEVELOPMENT_MODE)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Cookie Settings
SESSION_COOKIE_SECURE = env.bool('SESSION_COOKIE_SECURE', default=not DEVELOPMENT_MODE)
CSRF_COOKIE_SECURE = env.bool('CSRF_COOKIE_SECURE', default=not DEVELOPMENT_MODE)
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'None' if not DEVELOPMENT_MODE else 'Lax'

AUTH_COOKIE = 'access'
AUTH_COOKIE_MAX_AGE = 604800  # 7 days
AUTH_COOKIE_SECURE = env.bool('AUTH_COOKIE_SECURE', default=not DEVELOPMENT_MODE)
AUTH_COOKIE_HTTP_ONLY = True
AUTH_COOKIE_PATH = '/'
AUTH_COOKIE_SAMESITE = 'None' if not DEVELOPMENT_MODE else 'Lax'

# Content Security Policy
if not DEVELOPMENT_MODE:
    CSP_DEFAULT_SRC = ("'self'",)
    CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "https://trusted.cdn.com")
    CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "https://trusted.cdn.com")
    CSP_IMG_SRC = ("'self'", "data:", "https://trusted.cdn.com")
    CSP_CONNECT_SRC = (
        "'self'",
        "https://api.example.com",
        "ws://backend",
        "wss://backend",
    )

# ======================
# Application Definition
# ======================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'drf_yasg',
    'rest_framework',
    'algoliasearch_django',
    'rest_framework_api_key',
    'djoser',
    'social_django',
    'phonenumber_field',
    'django_filters',
    'channels',
    'django_celery_beat',
    'django_celery_results',
    "apps.authentication",
    "apps.core_apps",
    "apps.shared",
    "apps.organization",
    "apps.reporting",
    "apps.accounting",
    "apps.inventory",
    "apps.insurance",
    "apps.hinsell",
    "apps.notifications",
    "apps.transactions",
    'apps.webhooks',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.authentication.middleware.UserActivityMiddleware',
    'apps.authentication.middleware.UserLoginTracker',
]

# ======================
# URLs and Templates
# ======================
ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'apps/core_apps/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ======================
# Database Configuration
# ======================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('PGDATABASE'),
        'USER': env('PGUSER'),
        'PASSWORD': env('PGPASSWORD'),
        'HOST': env('PGHOST'),
        'PORT': env('PGPORT', default='5432'),
        'OPTIONS': {'connect_timeout': 20},
    }
}

# ======================
# Authentication
# ======================
AUTH_USER_MODEL = 'authentication.User'
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTHENTICATION_BACKENDS = [
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]

# Social Auth
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = env('GOOGLE_AUTH_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = env('GOOGLE_AUTH_SECRET_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
]
SOCIAL_AUTH_GOOGLE_OAUTH2_EXTRA_DATA = [
    'first_name',
    'last_name',
    'email',
    'picture',
    'name',
    'given_name',
    'family_name',
]
SOCIAL_AUTH_FACEBOOK_KEY = env('FACEBOOK_AUTH_KEY')
SOCIAL_AUTH_FACEBOOK_SECRET = env('FACEBOOK_AUTH_SECRET_KEY')
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email', 'public_profile']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {'fields': 'id, name, email, picture, first_name, last_name'}
SOCIAL_AUTH_FACEBOOK_EXTRA_DATA = [
    'name',
    'email',
    'picture',
    'first_name',
    'last_name',
]

# Djoser
DJOSER = {
    'PASSWORD_RESET_CONFIRM_URL': 'password-reset/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
    'ACTIVATION_URL': 'verify-email/{uid}/{token}',
    'USER_CREATE_PASSWORD_RETYPE': True,
    'PASSWORD_RESET_CONFIRM_RETYPE': True,
    'TOKEN_MODEL': None,
    'SOCIAL_AUTH_ALLOWED_REDIRECT_URIS': env.list('REDIRECT_URLS', default=[]),
    'SERIALIZERS': {
        'current_user': 'apps.authentication.serializers.UserPublicSerializer',
        'user': 'apps.authentication.serializers.UserPublicSerializer',
    },
    'PERMISSIONS': {
        'user': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
    },
}

# ======================
# CORS Configuration
# ======================
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'ws://localhost:8000',
    'wss://backend',
])
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = DEVELOPMENT_MODE

# ======================
# REST Framework
# ======================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.authentication.authentication.CustomJWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
        'rest_framework_api_key.permissions.HasAPIKey',
    ],
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
    },
}

# ======================
# WebSocket Configuration
# ======================
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': env.list('REDIS_HOSTS', default=[env('REDIS_CACHE_URL', default='redis://redis:6379/0')]),
            'capacity': env.int('WEBSOCKET_CHANNEL_CAPACITY', default=1500),
            'expiry': env.int('WEBSOCKET_CHANNEL_EXPIRY', default=10),
            'pool': {
                'max_connections': env.int('REDIS_MAX_CONNECTIONS', default=100),
                'retry_on_timeout': True,
                'timeout': 5,
            },
            'compression': True,
        },
    },
}

# WebSocket rate limiting
WEBSOCKET_RATE_LIMIT = env.bool('WEBSOCKET_RATE_LIMIT', default=True)
WEBSOCKET_RATE_LIMIT_PER_MINUTE = env.int('WEBSOCKET_RATE_LIMIT_PER_MINUTE', default=60)
WEBSOCKET_MAX_CONNECTIONS = env.int('WEBSOCKET_MAX_CONNECTIONS', default=1000)
MESSAGING_RATE_LIMIT_PER_MINUTE = env.int('MESSAGING_RATE_LIMIT_PER_MINUTE', default=30)
NOTIFICATION_RATE_LIMIT_PER_MINUTE = env.int('NOTIFICATION_RATE_LIMIT_PER_MINUTE', default=60)

# WebSocket security
WEBSOCKET_SECURE = env.bool('WEBSOCKET_SECURE', default=not DEVELOPMENT_MODE)
WEBSOCKET_ALLOWED_ORIGINS = env.list('WEBSOCKET_ALLOWED_ORIGINS', default=[
    'ws://localhost:8000',
    'ws://127.0.0.1:8000',
    'wss://backend',
])

# Health check endpoint for WebSocket service
HEALTH_CHECK_ENDPOINT = '/health/websocket/'

# ======================
# Static and Media Files
# ======================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

if env.bool('USE_S3'):
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='us-east-1')
    AWS_S3_CUSTOM_DOMAIN = env('AWS_S3_CUSTOM_DOMAIN', default=f'{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com')
    
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_FILE_OVERWRITE = False
    AWS_S3_ADDRESSING_STYLE = 'virtual'
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    
    STATICFILES_STORAGE = 'core.storage_backends.StaticStorage'
    DEFAULT_FILE_STORAGE = 'core.storage_backends.MediaStorage'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
else:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage' if not DEVELOPMENT_MODE else 'django.contrib.staticfiles.storage.StaticFilesStorage'

FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# Allowed Media Extensions
ALLOWED_MEDIA_EXTENSIONS = {
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    'video': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    'document': ['.pdf', '.doc', '.docx', '.txt']
}

# ======================
# Celery and Redis
# ======================
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://redis:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_TASK_RESULT_EXPIRES = 3600
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_CACHE_URL', default='redis://redis:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': env.int('REDIS_MAX_CONNECTIONS', default=100),
                'retry_on_timeout': True,
            },
        },
    }
}

ALGOLIA = {
  'APPLICATION_ID': env('APPLICATION_ID', default='5E6XO5ZT4W'),
  'API_KEY': env('API_KEY', default='0feaf0462c02fc00fd672102a17e5d15')
}

# ======================
# Email Configuration
# ======================
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default=f"Hinsell <{EMAIL_HOST_USER}>")
SUPPORT_EMAIL = env('SUPPORT_EMAIL', default=EMAIL_HOST_USER)

# ======================
# Third-Party Services
# ======================
STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = env('STRIPE_WEBHOOK_SECRET')
TWILIO_ACCOUNT_SID = env('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = env('TWILIO_AUTH_TOKEN')
TWILIO_FROM_NUMBER = env('TWILIO_FROM_NUMBER')

FIREBASE_CREDENTIALS = env('FIREBASE_CREDENTIALS', default="")

# ======================
# Logging Configuration
# ======================
LOGGING_DIR = BASE_DIR / 'logs'
LOGGING_DIR.mkdir(parents=True, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {'format': '{levelname} {asctime} {module} {message}', 'style': '{'},
        'simple': {'format': '{levelname} {message}', 'style': '{'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'simple'},
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGGING_DIR / 'django.log',
            'maxBytes': 5 * 1024 * 1024,  # 5 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'websocket_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGGING_DIR / 'websocket.log',
            'maxBytes': 5 * 1024 * 1024,  # 5 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        # Added for messaging service
        'messaging_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGGING_DIR / 'messaging.log',
            'maxBytes': 5 * 1024 * 1024,  # 5 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {'handlers': ['console', 'file'], 'level': 'INFO'},
    'loggers': {
        'django': {'handlers': ['console', 'file'], 'level': 'INFO', 'propagate': False},
        'django.request': {'handlers': ['console', 'file'], 'level': 'ERROR', 'propagate': False},
        'apps': {'handlers': ['console', 'file'], 'level': 'DEBUG' if DEBUG else 'INFO', 'propagate': False},
        'boto3': {'handlers': ['console'], 'level': 'DEBUG'},
        'botocore': {'handlers': ['console'], 'level': 'DEBUG'},
        's3transfer': {'handlers': ['console'], 'level': 'DEBUG'},
        'channels': {'handlers': ['console', 'websocket_file'], 'level': 'INFO', 'propagate': False},
        'channels.server': {'handlers': ['console', 'websocket_file'], 'level': 'INFO', 'propagate': False},
        'channels.db': {'handlers': ['console', 'websocket_file'], 'level': 'INFO', 'propagate': False},
        # Added for messaging service
        'apps.messaging': {'handlers': ['console', 'messaging_file'], 'level': 'INFO', 'propagate': False},
    },
}

# ======================
# Miscellaneous Settings
# ======================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DOMAIN = env('DOMAIN', default='localhost:3000')
SITE_NAME = env('SITE_NAME', default='Hinsell')
SITE_URL = env('SITE_URL', default='http://localhost:3000')
NOTIFICATION_RETENTION_DAYS = 90
ENABLE_EMAIL_RATE_LIMITING = True
ENABLE_SMS_RATE_LIMITING = True
PHONENUMBER_DEFAULT_REGION = 'YE'
PHONENUMBER_DB_FORMAT = 'E164'

# ======================
# Uvicorn Configuration
# ======================
UVICORN_WORKERS = env.int('UVICORN_WORKERS', default=os.cpu_count() * 2 + 1)
UVICORN_PORT = env.int('UVICORN_PORT', default=8000)
UVICORN_HOST = env('UVICORN_HOST', default='0.0.0.0')
UVICORN_LOG_LEVEL = env('UVICORN_LOG_LEVEL', default='info' if not DEBUG else 'debug')
UVICORN_RELOAD = DEVELOPMENT_MODE
UVICORN_TIMEOUT_KEEP_ALIVE = env.int('UVICORN_TIMEOUT_KEEP_ALIVE', default=65)