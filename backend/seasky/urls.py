# ========================= seasky/urls.py =========================
"""
URLs principales de la plateforme SeaSky.
"""

import os

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.utils import timezone

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


# ========================= HEALTH CHECK VIEW =========================
def health_check(request):
    """
    Vérification de santé de l'application.
    GET /api/health/
    GET /api/v1/health/ (optionnel)
    """
    return JsonResponse(
        {
            "status": "healthy",
            "service": "SeaSky API",
            "version": getattr(settings, "APP_VERSION", os.getenv("APP_VERSION", "1.0.0"))
            if hasattr(settings, "APP_VERSION")
            else os.getenv("APP_VERSION", "1.0.0"),
            "environment": getattr(settings, "ENVIRONMENT", os.getenv("ENVIRONMENT", "development"))
            if hasattr(settings, "ENVIRONMENT")
            else os.getenv("ENVIRONMENT", "development"),
            "debug_mode": settings.DEBUG,
            "timestamp": timezone.now().isoformat(),
        }
    )


# ========================= API ROOT VIEW =========================
def api_root(request):
    """
    Point d'entrée de l'API avec documentation.
    GET /api/
    """
    base_url = request.build_absolute_uri("/")

    return JsonResponse(
        {
            "message": "Bienvenue sur l'API SeaSky",
            "version": getattr(settings, "APP_VERSION", os.getenv("APP_VERSION", "1.0.0"))
            if hasattr(settings, "APP_VERSION")
            else os.getenv("APP_VERSION", "1.0.0"),
            "description": "Plateforme de livraison de produits laitiers",
            "authentication": "JWT Bearer Token",
            "documentation": {
                "swagger": f"{base_url}api/schema/swagger-ui/",
                "redoc": f"{base_url}api/schema/redoc/",
                "schema": f"{base_url}api/schema/",
            },
            "endpoints": {
                "v1": f"{base_url}api/v1/",
                "health": f"{base_url}api/health/",
                "admin": f"{base_url}admin/",
            },
            "contact": "support@seasky.bi",
        }
    )


urlpatterns = [
    # ========================= ADMIN =========================
    path("admin/", admin.site.urls),

    # ========================= API ROOT + HEALTH =========================
    path("api/", api_root, name="api-root"),
    path("api/health/", health_check, name="health-check"),

    # ========================= API DOCUMENTATION =========================
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # ========================= API VERSION 1 (UNIFIÉE) =========================
    path("api/v1/", include("apps.api.urls")),

    # Health v1 (optionnel)
    path("api/v1/health/", health_check, name="api-v1-health-check"),
]


# ========================= Serve media/static conditionally =========================
# - En dev (settings.DEBUG) on sert media/static automatiquement.
# - En prod, on sert media/static seulement si SERVE_MEDIA=true (variable d'env)
if settings.DEBUG:
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # Fallback temporaire: si on veut que Django serve les fichiers en prod
    # set SERVE_MEDIA=true dans les env du service (Render) ; recommandé uniquement temporaire
    serve_media_flag = os.getenv("SERVE_MEDIA", "").strip().lower()
    if serve_media_flag in ("1", "true", "yes", "on"):
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# ========================= ADMIN SITE CUSTOMIZATION =========================
admin.site.site_header = "🌊 SeaSky Administration"
admin.site.site_title = "SeaSky Platform"
admin.site.index_title = "Tableau de bord"