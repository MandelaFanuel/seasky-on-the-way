# seasky/context_processors.py
"""
Custom context processors for SeaSky Platform.
"""
from django.conf import settings


def app_version(request):
    """
    Add application version to template context.
    """
    return {
        "APP_NAME": getattr(settings, "APP_NAME", "SeaSky"),
        "APP_VERSION": getattr(settings, "APP_VERSION", "1.0.0"),
        "ENVIRONMENT": getattr(settings, "ENVIRONMENT", "development"),
    }


def api_config(request):
    """
    Add API configuration to template context.
    """
    return {
        "API_BASE_URL": getattr(settings, "API_BASE_PATH", "/api/v1"),
        "SITE_URL": request.build_absolute_uri("/")[:-1],
    }