# ========================= apps/accounts/permissions.py =========================
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """
    Autorise uniquement :
    - superuser
    - staff
    - user.role == "admin"
    Compatible avec CustomUser (SeaSky)
    """
    message = "Accès administrateur requis."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        # Sécurité maximale
        try:
            role = (getattr(user, "role", "") or "").lower()
        except Exception:
            role = ""

        return bool(
            user.is_superuser
            or user.is_staff
            or role == "admin"
        )


class IsAdminOrStaff(BasePermission):
    """
    Alias explicite (lisible dans les ViewSets)
    """
    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        try:
            role = (getattr(user, "role", "") or "").lower()
        except Exception:
            role = ""

        return bool(
            user.is_superuser
            or user.is_staff
            or role == "admin"
        )


class ReadOnly(BasePermission):
    """
    Autorise uniquement les méthodes SAFE (GET, HEAD, OPTIONS)
    """
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
