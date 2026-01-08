# ========================= apps/api/urls.py =========================
"""
SeaSky Platform - API v1
Unified REST API for Dairy Delivery Platform
"""
import logging
from datetime import datetime, timezone

from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    AuthViewSet,
    MeViewSet,
    UserDocumentViewSet,
    AgentViewSet,
    AdminUsersViewSet,
)
from apps.suppliers.views import SupplierViewSet
from apps.drivers.views import (
    DriverViewSet,
    DriverDocumentViewSet,
    DriverAvailabilityViewSet,
    DriverPerformanceViewSet,
)
from apps.pdv.views import PDVViewSet
from apps.logistics.views import CollectionViewSet, DeliveryViewSet, AttendanceViewSet
from apps.qr.views import QRViewSet
from apps.wallet.views import WalletViewSet
from apps.adminpanel.views import AdminDashboardViewSet

logger = logging.getLogger(__name__)

API_BRAND = "SeaSky"
API_VERSION = "1.0.0"
API_BRAND_CODE = "SSKY"
API_DESCRIPTION = "Intelligent Dairy Delivery Platform API"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _brand_headers() -> dict:
    return {
        "X-API-Brand": API_BRAND,
        "X-API-Version": API_VERSION,
        "X-API-Provider": f"{API_BRAND} Technologies",
        "X-API-Documentation": "/api/schema/swagger-ui/",
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def api_v1_root(request):
    base_url = request.build_absolute_uri("/").rstrip("/")
    client_ip = request.META.get("REMOTE_ADDR", "unknown")
    logger.info("[SeaSky API] v1 root accessed from IP=%s", client_ip)

    payload = {
        "api": {
            "name": f"{API_BRAND} Delivery Platform API",
            "brand": API_BRAND,
            "brand_code": API_BRAND_CODE,
            "version": API_VERSION,
            "description": API_DESCRIPTION,
            "provider": "SeaSky Technologies Ltd",
            "status": "operational",
            "environment": "development" if request.get_host().startswith("localhost") else "production",
        },
        "documentation": {
            "swagger_ui": f"{base_url}/api/schema/swagger-ui/",
            "redoc": f"{base_url}/api/schema/redoc/",
            "openapi_spec": f"{base_url}/api/schema/",
        },
        "authentication": {
            "type": "JWT Bearer Token",
            "endpoints": {
                "register": f"{base_url}/api/v1/auth/register",
                "login": f"{base_url}/api/v1/auth/login",
                "logout": f"{base_url}/api/v1/auth/logout",
                "logout_all": f"{base_url}/api/v1/auth/logout_all",
                "refresh": f"{base_url}/api/v1/auth/refresh",
            },
            "note": "Ces endpoints acceptent avec OU sans slash final.",
        },
        "meta": {"timestamp": _now_iso(), "timezone": "UTC"},
    }

    response = Response(payload)
    for k, v in _brand_headers().items():
        response[k] = v
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def api_health_check(request):
    response = Response(
        {
            "status": "healthy",
            "service": f"{API_BRAND} API v{API_VERSION}",
            "timestamp": _now_iso(),
            "environment": "development" if request.get_host().startswith("localhost") else "production",
        }
    )
    for k, v in _brand_headers().items():
        response[k] = v
    return response


router = DefaultRouter()
router.trailing_slash = "/?"  # accepte / et sans /

router.register(r"auth", AuthViewSet, basename="auth")
router.register(r"me", MeViewSet, basename="me")
router.register(r"documents", UserDocumentViewSet, basename="documents")

router.register(r"agents", AgentViewSet, basename="agents")
router.register(r"suppliers", SupplierViewSet, basename="suppliers")

router.register(r"drivers", DriverViewSet, basename="drivers")
router.register(r"driver-documents", DriverDocumentViewSet, basename="driver-documents")
router.register(r"driver-availability", DriverAvailabilityViewSet, basename="driver-availability")
router.register(r"driver-performance", DriverPerformanceViewSet, basename="driver-performance")

router.register(r"pdv", PDVViewSet, basename="pdv")

router.register(r"collections", CollectionViewSet, basename="collections")
router.register(r"deliveries", DeliveryViewSet, basename="deliveries")
router.register(r"attendance", AttendanceViewSet, basename="attendance")

router.register(r"qr", QRViewSet, basename="qr")
router.register(r"wallet", WalletViewSet, basename="wallet")
router.register(r"admin-dashboard", AdminDashboardViewSet, basename="admin-dashboard")

# ✅ Admin Users
router.register(r"admin/users", AdminUsersViewSet, basename="admin-users")

urlpatterns = [
    path("", api_v1_root, name="api-v1-root"),
    path("health", api_health_check, name="api-v1-health"),
    path("", include(router.urls)),
]
