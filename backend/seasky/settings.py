"""
Django settings for SeaSky Platform.
JWT-first API (no cookies), Docker-ready, Vite-ready.
Compatible django-storages / boto3 / Pillow (S3 optional via USE_S3).
"""

from __future__ import annotations

import os
import sys
import logging
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# ========================= PATH CONFIGURATION =========================
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "apps"))

# ========================= ENVIRONMENT LOADING =========================
ENV_FILE = BASE_DIR / ".env"
IS_RENDER = bool(os.getenv("RENDER")) or bool(os.getenv("RENDER_SERVICE_ID"))

# En local: charge .env
if ENV_FILE.exists() and not IS_RENDER:
    load_dotenv(ENV_FILE, override=False)

# ========================= HELPERS =========================
def _split_csv(env_value: str) -> list[str]:
    return [o.strip() for o in (env_value or "").split(",") if o.strip()]


def _bool_env(name: str, default: bool = False) -> bool:
    v = (os.getenv(name, "") or "").strip().lower()
    if v in ("1", "true", "yes", "on", "t"):
        return True
    if v in ("0", "false", "no", "off", "f"):
        return False
    return default


# ========================= APP META =========================
APP_NAME = os.getenv("APP_NAME", "SeaSky API")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production" if IS_RENDER else "development")

# ========================= SECURITY CONFIGURATION =========================
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-dev-key-change-in-production-2025")

# ✅ IMPORTANT: sur Render on force DEBUG=False par défaut (même si DJANGO_DEBUG oublié)
DEBUG = _bool_env("DJANGO_DEBUG", default=False if IS_RENDER else True)

# ✅ Render/Proxy HTTPS headers
# (actif en prod et sur render)
if IS_RENDER or not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ========================= HOST CONFIGURATION =========================
DEFAULT_ALLOWED_HOSTS = "127.0.0.1,localhost,0.0.0.0,backend,.onrender.com,seasky-backend.onrender.com"
ALLOWED_HOSTS_STRING = os.getenv("ALLOWED_HOSTS", DEFAULT_ALLOWED_HOSTS)
ALLOWED_HOSTS = _split_csv(ALLOWED_HOSTS_STRING)

APPEND_SLASH = True

# ========================= APPLICATION DEFINITION =========================
AUTH_USER_MODEL = "accounts.CustomUser"

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "drf_spectacular",
    "corsheaders",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",  # ✅ requis si tu utilises blacklist()
    "django_filters",
    "django_redis",
    "channels",
    "storages",  # ✅ django-storages (boto3 backend)
]

if DEBUG and _bool_env("ENABLE_DEBUG_TOOLBAR", default=True):
    THIRD_PARTY_APPS.append("debug_toolbar")

LOCAL_APPS = [
    "apps.accounts.apps.AccountsConfig",
    "apps.suppliers",
    "apps.drivers",
    "apps.pdv",
    "apps.qr",
    "apps.logistics",
    "apps.api",
    "apps.wallet",
    "apps.adminpanel",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ========================= MIDDLEWARE CONFIGURATION =========================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    # ✅ CORS DOIT être avant CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

if DEBUG and "debug_toolbar" in INSTALLED_APPS:
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")

# ========================= URL & TEMPLATE CONFIGURATION =========================
ROOT_URLCONF = "seasky.urls"

WSGI_APPLICATION = "seasky.wsgi.application"
ASGI_APPLICATION = "seasky.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
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

# ========================= DATABASE CONFIGURATION =========================
try:
    import dj_database_url  # type: ignore
except Exception:
    dj_database_url = None  # type: ignore

DATABASE_URL = (os.getenv("DATABASE_URL", "") or "").strip()

if DATABASE_URL and dj_database_url:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=not DEBUG,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB", "seasky"),
            "USER": os.getenv("POSTGRES_USER", "fanuel045"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", "414141"),
            "HOST": os.getenv("POSTGRES_HOST", "db"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
            "CONN_MAX_AGE": 600,
        }
    }

# ========================= CACHE & REDIS =========================
REDIS_LOCATION = os.getenv("REDIS_URL", "redis://redis:6379/1")

redis_options = {
    "CLIENT_CLASS": "django_redis.client.DefaultClient",
    "CONNECTION_POOL_KWARGS": {"max_connections": 100},
}

try:
    import hiredis  # noqa: F401
    redis_options["PARSER_CLASS"] = "redis.connection.HiredisParser"
except Exception:
    pass

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_LOCATION,
        "OPTIONS": redis_options,
        "KEY_PREFIX": "seasky",
    }
}

# ✅ Channels Redis layer
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [os.getenv("REDIS_URL", "redis://redis:6379/0")]},
    }
}

# ========================= AUTHENTICATION =========================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ========================= INTERNATIONALIZATION =========================
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = os.getenv("DJANGO_TIME_ZONE", "Africa/Bujumbura")
USE_I18N = True
USE_L10N = True
USE_TZ = True

# ========================= STATIC & MEDIA FILES =========================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

_static_dir = BASE_DIR / "static"
STATICFILES_DIRS = [_static_dir] if _static_dir.exists() else []

# WhiteNoise: static collectstatic
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = str(BASE_DIR / "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ========================= STORAGE (LOCAL / S3) =========================
USE_S3 = _bool_env("USE_S3", default=False)

if USE_S3:
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME", "")
    AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME", "") or None
    AWS_S3_ENDPOINT_URL = os.getenv("AWS_S3_ENDPOINT_URL", "") or None
    AWS_S3_CUSTOM_DOMAIN = os.getenv("AWS_S3_CUSTOM_DOMAIN", "") or None

    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = _bool_env("AWS_QUERYSTRING_AUTH", default=False)
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": os.getenv("AWS_S3_CACHE_CONTROL", "max-age=86400")}

    AWS_LOCATION_MEDIA = (os.getenv("AWS_LOCATION_MEDIA", "media") or "media").strip().strip("/")
    AWS_LOCATION_STATIC = (os.getenv("AWS_LOCATION_STATIC", "static") or "static").strip().strip("/")

    AWS_S3_FILE_OVERWRITE = False

    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
            "OPTIONS": {
                "bucket_name": AWS_STORAGE_BUCKET_NAME,
                "location": AWS_LOCATION_MEDIA,
                "default_acl": None,
                "querystring_auth": AWS_QUERYSTRING_AUTH,
            },
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }

    if AWS_S3_CUSTOM_DOMAIN:
        MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION_MEDIA}/"
    else:
        if AWS_STORAGE_BUCKET_NAME:
            MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{AWS_LOCATION_MEDIA}/"

# ========================= REST FRAMEWORK (JWT FIRST) =========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly"
    ],

    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": int(os.getenv("PAGINATION_PAGE_SIZE", "20")),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": (
        ["rest_framework.renderers.JSONRenderer", "rest_framework.renderers.BrowsableAPIRenderer"]
        if DEBUG
        else ["rest_framework.renderers.JSONRenderer"]
    ),
}

# ========================= JWT =========================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("ACCESS_TOKEN_LIFETIME_MINUTES", "1440"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("REFRESH_TOKEN_LIFETIME_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": os.getenv("JWT_ALGORITHM", "HS256"),
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ========================= CORS / CSRF (DIRECT RENDER) =========================
from corsheaders.defaults import default_headers, default_methods  # noqa: E402

# ✅ JWT-first (pas de cookies requis) => credentials pas nécessaires
# (tu peux laisser True si tu utilises session/admin cross-site, mais pour l’API JWT c’est mieux False)
CORS_ALLOW_CREDENTIALS = _bool_env("CORS_ALLOW_CREDENTIALS", default=False)

# ✅ Origins explicites (idéal pour prod)
# Mets ici ton/tes domaines Vercel "stables" (prod)
DEFAULT_CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # ✅ Exemple (mets ton domaine prod exact si tu en as un fixe)
    # "https://seasky-on-the-way-scvm.vercel.app",
]
CORS_ALLOWED_ORIGINS = _split_csv(os.getenv("CORS_ALLOWED_ORIGINS", "")) or DEFAULT_CORS_ALLOWED_ORIGINS

# ✅ Autorise aussi tous les preview vercel: *.vercel.app
CORS_ALLOWED_ORIGIN_REGEXES = _split_csv(os.getenv("CORS_ALLOWED_ORIGIN_REGEXES", "")) or [
    r"^https://.*\.vercel\.app$",
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = list(default_methods)
CORS_EXPOSE_HEADERS = ["Authorization", "Content-Type"]

# ✅ Optionnel mais propre: limite cors aux URLs API uniquement
CORS_URLS_REGEX = r"^/api/.*$"

# ✅ CSRF: même si JWT n’en a pas besoin, Django admin/session peut en dépendre
_env_csrf = _split_csv(os.getenv("CSRF_TRUSTED_ORIGINS", ""))
_default_csrf = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://seasky-backend.onrender.com",
    # ✅ autorise les domaines vercel (preview + prod)
    "https://*.vercel.app",
]
CSRF_TRUSTED_ORIGINS = _env_csrf or _default_csrf

CSRF_COOKIE_SAMESITE = os.getenv("CSRF_COOKIE_SAMESITE", "Lax")
SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")

if not DEBUG:
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True

# ========================= SPECTACULAR =========================
SPECTACULAR_SETTINGS = {
    "TITLE": APP_NAME,
    "DESCRIPTION": "Plateforme de gestion et livraison de produits laitiers",
    "VERSION": APP_VERSION,
    "SERVE_INCLUDE_SCHEMA": False,
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True,
        "deepLinking": True,
        "displayOperationId": True,
        "filter": True,
    },
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": r"/api/v[0-9]",
}

# ========================= LOGGING =========================
LOG_TO_FILE = _bool_env("LOG_TO_FILE", default=False)
(BASE_DIR / "logs").mkdir(exist_ok=True)

handlers: dict = {
    "console": {
        "level": "DEBUG" if DEBUG else "INFO",
        "class": "logging.StreamHandler",
        "formatter": "verbose" if DEBUG else "simple",
    }
}

if LOG_TO_FILE:
    handlers["file"] = {
        "level": "INFO",
        "class": "logging.handlers.RotatingFileHandler",
        "filename": str(BASE_DIR / "logs" / "django.log"),
        "maxBytes": 10 * 1024 * 1024,
        "backupCount": 5,
        "formatter": "verbose",
    }

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} {module}.{funcName}:{lineno} - {message}",
            "style": "{",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "simple": {"format": "{levelname} {message}", "style": "{"},
    },
    "handlers": handlers,
    "loggers": {
        "django": {
            "handlers": ["console"] + (["file"] if LOG_TO_FILE else []),
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": True,
        },
        "apps": {
            "handlers": ["console"] + (["file"] if LOG_TO_FILE else []),
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}

# ========================= EMAIL =========================
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = _bool_env("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@seasky.bi")

# ========================= FILE UPLOADS =========================
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", "5242880"))
DATA_UPLOAD_MAX_MEMORY_SIZE = FILE_UPLOAD_MAX_MEMORY_SIZE

# ========================= SECURITY HEADERS (PROD) =========================
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ========================= DEBUG TOOLBAR =========================
if DEBUG and "debug_toolbar" in INSTALLED_APPS:
    DEBUG_TOOLBAR_CONFIG = {"SHOW_TOOLBAR_CALLBACK": lambda request: True}
    INTERNAL_IPS = ["127.0.0.1", "localhost"]

# ========================= OTHER HELPERS =========================
SERVE_MEDIA = _bool_env("SERVE_MEDIA", default=False)

# End of settings.py
