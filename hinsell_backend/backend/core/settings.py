from pathlib import Path
from decimal import Decimal
import environ
from django.core.management.utils import get_random_secret_key
from django.core.exceptions import ImproperlyConfigured

env = environ.Env(
    DEBUG=(bool, False),
    DEVELOPMENT_MODE=(bool, False),
    USE_S3=(bool, False),
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent


ENVIRONMENT = env("ENVIRONMENT", default="development")
DEVELOPMENT_MODE = env("DEVELOPMENT_MODE", default=(ENVIRONMENT == "development"))
DEBUG = env("DEBUG", default=DEVELOPMENT_MODE)


SECRET_KEY = env("DJANGO_SECRET_KEY", default=get_random_secret_key())

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[
    "127.0.0.1",
    "localhost",
    "backend",
])


SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=3600 if not DEVELOPMENT_MODE else 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", default=not DEVELOPMENT_MODE)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=not DEVELOPMENT_MODE)
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=not DEVELOPMENT_MODE)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=not DEVELOPMENT_MODE)
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=not DEVELOPMENT_MODE)
CSRF_TRUSTED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])

if not DEVELOPMENT_MODE:
    CSP_DEFAULT_SRC = ("'self'",)
    CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "https://trusted.cdn.com")
    CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "https://trusted.cdn.com")
    CSP_IMG_SRC = ("'self'", "data:", "https://trusted.cdn.com")
    CSP_CONNECT_SRC = ("'self'", "https://api.example.com")


CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
])

if DEVELOPMENT_MODE:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOW_CREDENTIALS = True


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "drf_yasg",
    "corsheaders",
    "rest_framework",
    "rest_framework_api_key",
    "djoser",
    "phonenumber_field",
    "django_filters",
    "django_celery_beat",
    "django_celery_results",
    
    "apps.authentication",
    "apps.core_apps.services",
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
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "apps/core_apps/services/templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"


DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.postgresql',
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST"),
        "PORT": env("POSTGRES_PORT", default=5432),
        "OPTIONS": {
            # "sslmode": env("PGSSLMODE", default="disable"),
            "connect_timeout": env.int("PGCONNECT_TIMEOUT", default=10),
            # "application_name": env("PGAPPNAME", default="pharsy_backend"),
            # "options": env("PGOPTIONS", default="-c search_path=public"),
            # "client_encoding": env("PGCLIENT_ENCODING", default="UTF8"),
            # "keepalives_idle": env.int("PGKEEPALIVES_IDLE", default=60),
            # "keepalives_interval": env.int("PGKEEPALIVES_INTERVAL", default=10),
            # "keepalives_count": env.int("PGKEEPALIVES_COUNT", default=5),
            # "sslrootcert": env("PGSSLROOTCERT", default=None),
        },
    }
}



AUTH_USER_MODEL = "authentication.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"



REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.authentication.authentication.CustomJWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
        "rest_framework_api_key.permissions.HasAPIKey",
    ],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
    ],
    'DEFAULT_THROTTLE_CLASSES': [],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "1000/day"
    },
}


DJOSER = {
    "PASSWORD_RESET_CONFIRM_URL": "password-reset/{uid}/{token}",
    "SEND_ACTIVATION_EMAIL": False,
    "ACTIVATION_URL": "verify-email/{uid}/{token}",
    "USER_CREATE_PASSWORD_RETYPE": True,
    "PASSWORD_RESET_CONFIRM_RETYPE": True,
    "TOKEN_MODEL": None,
    "SERIALIZERS": {
        'current_user': 'apps.authentication.serializers.UserPublicSerializer',
        'user': 'apps.authentication.serializers.UserPublicSerializer',
    },
    'PERMISSIONS': {
        'user': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
    },
}


from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Extend access token to 1 day
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # Extend refresh token to 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'AUTH_HEADER_TYPES': ('JWT', 'Bearer'),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    
    'JTI_CLAIM': 'jti',
}

# ======================
#  COOKIE SETTINGS
# ======================
SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_AGE = 60 * 60 * 24 * 30  # 30 days
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=not DEVELOPMENT_MODE)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "None"

# Auth cookie settings
AUTH_COOKIE_DOMAIN = env("DOMAIN", default="localhost:3000")
AUTH_COOKIE = "access"
AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
AUTH_COOKIE_SECURE = env.bool("AUTH_COOKIE_SECURE", default=not DEVELOPMENT_MODE)
AUTH_COOKIE_HTTP_ONLY = True
AUTH_COOKIE_PATH = "/"
AUTH_COOKIE_SAMESITE = "None"

# ======================
#  CELERY & REDIS
# ======================
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://redis:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://redis:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
CELERY_TASK_RESULT_EXPIRES = 3600
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True


CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_CACHE_URL", default="redis://redis:6379/0"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        'CONFIG': {
            "hosts": [env("REDIS_CACHE_URL", default="redis://redis:6379/0")],
            'capacity': 1500,  
            'expiry': 10,
        },
    },
}


# Accounts Receivable Settings
FIELD_ENCRYPTION_KEY= env("FIELD_ENCRYPTION_KEY", default="G1P_GZswCQENFKRzpjBy-r9NVKm0N-fXrLHpmdaB3Go=")

EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default=f"{env('SITE_NAME', default='Safer')} <{EMAIL_HOST_USER}>")
SUPPORT_EMAIL = env("SUPPORT_EMAIL", default=EMAIL_HOST_USER)


# whatsapp settings
WHATSAPP_API_URL = env("WHATSAPP_API_URL", default='https://graph.facebook.com/v22.0/715408964983021/messages') 
WHATSAPP_API_TOKEN = env("WHATSAPP_API_TOKEN")

# Twilio
TWILIO_ACCOUNT_SID = env("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = env("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = env("TWILIO_FROM_NUMBER")

#  LOGGING CONFIGURATION
LOGGING_DIR = BASE_DIR / "logs"
try:
    LOGGING_DIR.mkdir(parents=True, exist_ok=True)
except OSError as e:
    raise ImproperlyConfigured(f"Unable to create log directory: {e}")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOGGING_DIR / "django.log",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "file"],
            "level": "ERROR",
            "propagate": False,
        },
        "apps": {
            "handlers": ["console", "file"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
        'boto3': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'botocore': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        's3transfer': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'channels': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Domain and site settings
DOMAIN = env("DOMAIN", default="localhost:3000")

# Notification Settings
NOTIFICATION_RETENTION_DAYS = 90
ENABLE_EMAIL_RATE_LIMITING = True
ENABLE_SMS_RATE_LIMITING = True
SITE_NAME = env("SITE_NAME", default="Pharsy")
SITE_URL = env("SITE_URL", default="http://localhost:3000")

# Firebase settings
FIREBASE_CREDENTIALS = {
    "type": "service_account",
    "project_id": "safar-671ee",
    "private_key_id": "43e8e07771c22ec1465e719669f48cdeb279c195",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/R2nUasHLp23s\n0N8G6bqqqRVlVCGLoLdqw4q+JPBhmEtIhPncfTt5inkRjSLtN2VLvbXK8/TTMQQa\ntNjkcPs7IWNR13nTfCVLfSkNpmDipWEY44g2phdkpwNOZ17HP8EfL4v1KkQPJN2d\nonn2u4bflwGNd39v5TzT7ADAszUZLOmcMxgQP7P+sO/kxGR4D2Hl4lAf6RImws9R\n9S7WhHnfGRpoB6qG19DJ1IRQQ2NgnO39g03r32wIn/u99qsW0GVJ8qI/b9x9h6KS\n4C4LnSHA49oEeL9r6pTxmdAB7CnFUNjttfKB4flQfg7fwgMrC3G486yL7hsokL/L\nkdMIYOljAgMBAAECggEAFdHbrLOQ795ll8Ir7unytU0cd7alLPxkb/VmelJUaY2p\n6NfieNiAVFkLfokPFuhe0ckOV9yEbSMGSNWgeE67Gf+xCMD/0LQ0vOvGJxx3qOMc\ntG4gN7uyp3S119fK5AfNy/TsjkcIBII8FaNXLmIt/IuJTc3355fK3JHrdA/9WqWm\nLEDQy7Nx/0DhprwDzT/5BL239Y/okb61iueczXnI523CW3dvi46IKkFBVl2H2TwM\nPAiJTnp6BvitNQQRCgWU8oHoAgIVz1z8DA8TMAIblHNAfQUGuBWsIkVxURhsq8ia\nghIPSN2junbneTw3rziSA/bHsvaHg7wfA8qhsojIQQKBgQD13f0rcgMCKWyf3bDG\n04lQgQaNKngq6qGZjwemgzZNkR3VT3zee3pw3/L0duvVf7SMuIE5AQy+go0CRvMw\nFeFSKgvBPVbLeDJSXgnDT3ARKJ92VzZY2s3FEyd+RpVOHSH8gLaTpaOD80C5bJ4d\n56BYT3WbqEN4X1Nm3FFoWOaKCwKBgQDHKX57vFzTKWfk7dEZAsSWGFWkcE8in7uZ\n+CuXN9KLDCTZHsgOpakhJ1UuEHGAxYRXIYGOceJpiUTTdz5x5Fqh+6TFwPb3fpgs\n+A1eTVJV0Jo9Cp9GwFq3N0mEDOot1TP8y+ZCIhFf2ynRRHGG6LwB1aw8qRp09cSU\ny08Fj3qNCQKBgQCAFxHRc4lrs+cadmWlgAlWvpGKM+j8+tYL6T8kGdHNoV+4hLva\nMNw+N/4cLGR7CxgmA+2WpBxemCccW5hQoeWMZ8lN+EXipREaZlGRxi3tUouZHKB8\ntClllbAKkn0wf+733JrB2xaQJMfAknzhuY2I1ITB/myAJrGNshRbV41rtwKBgF6a\nDSSFUqpS7rDFbh8tO2f4YyXa2xwdN6VpRntr3qyBtjcT8f9THUVMQ5+/28pJCBXD\nKqEY420x8OlpqNW8nHh46cmtYSIqleo2YVM78zIkBj+cfg/DatPAhUEeSVZAAZPA\n3rznJc2ccv6ePjbQ8g0FC+08ff60hw4OjJidkJ7RAoGAd346O7toJQlq4iIRQI3b\nD2gjtmQ/Hqx+QomGZCkJu+KlfwArJD6CYs2yVSBqRzxZC6whlan4anz/b7j53DKy\n8PRaXFVFNUmQtxe+E5qkJdW4oXbff6PdO4Iqwpqw/LpzZKg5EQJ8AhMPSwvxNYhf\n+3Z1ZDA7myS8fpmHYZRo88s=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@safar-671ee.iam.gserviceaccount.com",
    "client_id": "100262175898074849890",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40safar-671ee.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}


PHONENUMBER_DEFAULT_REGION = "YE"
PHONENUMBER_DB_FORMAT = "E164"

# ======================
#  ENVIRONMENT SPECIFIC
# ======================
if DEVELOPMENT_MODE:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ]