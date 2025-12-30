"""
Django settings for SeaSky Platform.
JWT-first API (no cookies), Docker-ready, Vite-ready.
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

# Add apps directory to Python path (so "apps.xxx" imports work)
sys.path.insert(0, str(BASE_DIR / "apps"))

# ========================= ENVIRONMENT LOADING =========================
ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE, override=True)

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

# ========================= SECURITY CONFIGURATION =========================
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-dev-key-change-in-production-2025")
DEBUG = _bool_env("DJANGO_DEBUG", default=True)

# ========================= HOST CONFIGURATION =========================
ALLOWED_HOSTS_STRING = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost,0.0.0.0,backend")
ALLOWED_HOSTS = _split_csv(ALLOWED_HOSTS_STRING)

# IMPORTANT: éviter les comportements bizarres de redirect POST -> / (APPEND_SLASH)
# Si tu utilises déjà des URLs avec / final, tu peux laisser True.
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
    "django_filters",
    "django_redis",
    # "rest_framework_simplejwt.token_blacklist"  # active seulement si tu blacklist refresh tokens
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

    # CORS doit être avant CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",

    # CSRF reste pour admin / forms server-side.
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
# ✅ Supporte: Docker/local (POSTGRES_*) + Prod (DATABASE_URL Render/Railway/Fly…)
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
            ssl_require=not DEBUG,  # SSL en prod, pas en dev
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB", "seasky"),   # ✅ corrigé
            "USER": os.getenv("POSTGRES_USER", "fanuel045"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", "414141"),
            "HOST": os.getenv("POSTGRES_HOST", "db"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
            "CONN_MAX_AGE": 600,
        }
    }

if DATABASE_URL and not dj_database_url:
    print("⚠️ DATABASE_URL fourni mais dj-database-url n'est pas installé. Ajoute-le pour prod.")


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

# ========================= AUTHENTICATION =========================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ========================= INTERNATIONALIZATION =========================
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = os.getenv("TIME_ZONE", "Africa/Bujumbura")
USE_I18N = True
USE_L10N = True
USE_TZ = True

# ========================= STATIC & MEDIA FILES =========================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

_static_dir = BASE_DIR / "static"
STATICFILES_DIRS = [_static_dir] if _static_dir.exists() else []

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ========================= REST FRAMEWORK (JWT FIRST) =========================
REST_FRAMEWORK = {
    # ✅ JWT only (évite CSRF/session)
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # NE PAS mettre SessionAuthentication ici (source classique de 403 CSRF)
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
        [
            "rest_framework.renderers.JSONRenderer",
            "rest_framework.renderers.BrowsableAPIRenderer",
        ]
        if DEBUG
        else [
            "rest_framework.renderers.JSONRenderer",
        ]
    ),
}

# ========================= JWT =========================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("ACCESS_TOKEN_LIFETIME_MINUTES", "1440"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("REFRESH_TOKEN_LIFETIME_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,  # mets True + active token_blacklist app si tu veux vraiment blacklist
    "UPDATE_LAST_LOGIN": True,

    "ALGORITHM": os.getenv("JWT_ALGORITHM", "HS256"),
    "SIGNING_KEY": SECRET_KEY,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",

    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ========================= CORS / CSRF =========================
from corsheaders.defaults import default_headers, default_methods  # noqa: E402

# Ton SPA utilise JWT Bearer, pas de cookies
CORS_ALLOW_CREDENTIALS = False

# CORS exact origins
CORS_ALLOWED_ORIGINS = _split_csv(os.getenv("CORS_ALLOWED_ORIGINS", "")) or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Regex origins (utile pour Vercel preview URLs)
CORS_ALLOWED_ORIGIN_REGEXES = _split_csv(os.getenv("CORS_ALLOWED_ORIGIN_REGEXES", "")) or [
    r"^https://.*\.vercel\.app$",
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
    "content-type",
    "x-requested-with",
]
CORS_ALLOW_METHODS = list(default_methods)

CORS_EXPOSE_HEADERS = ["Authorization", "Content-Type"]

# CSRF trusted origins (utile pour admin/browsable API si tu y accèdes depuis Vercel)
CSRF_TRUSTED_ORIGINS = _split_csv(os.getenv("CSRF_TRUSTED_ORIGINS", "")) or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

CSRF_COOKIE_SAMESITE = os.getenv("CSRF_COOKIE_SAMESITE", "Lax")
SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")

if not DEBUG:
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True

# ========================= SPECTACULAR =========================
SPECTACULAR_SETTINGS = {
    "TITLE": os.getenv("APP_NAME", "SeaSky API"),
    "DESCRIPTION": "Plateforme de gestion et livraison de produits laitiers",
    "VERSION": os.getenv("APP_VERSION", "1.0.0"),
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
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ========================= DEBUG TOOLBAR =========================
if DEBUG and "debug_toolbar" in INSTALLED_APPS:
    DEBUG_TOOLBAR_CONFIG = {"SHOW_TOOLBAR_CALLBACK": lambda request: True}
    INTERNAL_IPS = ["127.0.0.1", "localhost"]
