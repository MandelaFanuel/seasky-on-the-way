# ========================= apps/drivers/utils.py =========================
"""
Utils pour la gestion des chauffeurs et génération de codes.
"""

from __future__ import annotations

import secrets
import string
from datetime import datetime

from django.utils import timezone


class DriverCodeGenerator:
    """
    Générateur de codes uniques pour les chauffeurs.
    Format: CH_ANNEE_HEX
    Exemple: CH_2025_A3B7C9
    """

    @staticmethod
    def generate_hex_code(length: int = 6) -> str:
        hex_chars = string.digits + "ABCDEF"
        return "".join(secrets.choice(hex_chars) for _ in range(length))

    @staticmethod
    def generate_driver_code() -> str:
        current_year = datetime.now().year
        hex_part = DriverCodeGenerator.generate_hex_code(6)
        return f"CH_{current_year}_{hex_part}"

    @staticmethod
    def generate_unique_driver_code() -> str:
        from .models import Driver

        max_attempts = 10
        for _ in range(max_attempts):
            code = DriverCodeGenerator.generate_driver_code()
            if not Driver.objects.filter(driver_code=code).exists():
                return code

        timestamp = int(timezone.now().timestamp())
        return f"CH_{datetime.now().year}_{timestamp:08X}"

    @staticmethod
    def validate_driver_code(code: str) -> bool:
        if not code or not isinstance(code, str):
            return False

        parts = code.split("_")
        if len(parts) != 3:
            return False

        if parts[0] != "CH":
            return False

        try:
            year = int(parts[1])
            current_year = datetime.now().year
            if year < 2020 or year > current_year:
                return False
        except ValueError:
            return False

        hex_part = parts[2]
        if len(hex_part) != 6:
            return False

        valid_hex_chars = set(string.digits + "ABCDEF")
        if not all(c in valid_hex_chars for c in hex_part):
            return False

        return True


class DriverStatusManager:
    """
    Gestionnaire des statuts et disponibilités des chauffeurs.
    """

    @staticmethod
    def get_active_drivers():
        from .models import Driver

        # ✅ ton CustomUser a account_status
        return Driver.objects.filter(user__is_active=True, user__account_status="active")

    @staticmethod
    def get_available_drivers(transport_mode=None):
        from .models import Driver, DriverAvailability

        available_driver_ids = DriverAvailability.objects.filter(is_available=True).values_list("driver_id", flat=True)

        queryset = Driver.objects.filter(
            id__in=available_driver_ids,
            user__is_active=True,
            user__account_status="active",
        )

        if transport_mode:
            queryset = queryset.filter(transport_mode=transport_mode)

        return queryset

    @staticmethod
    def update_driver_availability(driver_id, is_available: bool, location=None):
        """
        location peut être:
        - None
        - tuple(lat, lng)
        - dict {"lat":..., "lng":...}
        """
        from .models import DriverAvailability

        lat = None
        lng = None
        if isinstance(location, (tuple, list)) and len(location) == 2:
            lat, lng = location
        elif isinstance(location, dict):
            lat = location.get("lat") or location.get("latitude")
            lng = location.get("lng") or location.get("longitude")

        defaults = {"is_available": is_available}

        if lat is not None and lng is not None:
            defaults.update(
                {
                    "location_lat": lat,
                    "location_lng": lng,
                    "last_location_update": timezone.now(),
                }
            )

        availability, _ = DriverAvailability.objects.update_or_create(driver_id=driver_id, defaults=defaults)
        return availability


class DriverAnalytics:
    """
    Analytics et statistiques pour les chauffeurs.
    """

    @staticmethod
    def get_driver_performance(driver_id, start_date=None, end_date=None):
        from django.db.models import Sum, Count
        from apps.logistics.models import Collection, Delivery, Attendance  # ✅ FIX

        if not start_date:
            start_date = timezone.now() - timezone.timedelta(days=30)
        if not end_date:
            end_date = timezone.now()

        collections = Collection.objects.filter(
            driver_id=driver_id,
            collected_at__range=[start_date, end_date],
        ).aggregate(
            total_collections=Count("id"),
            total_liters=Sum("quantity_liters"),
            total_value=Sum("value_amount"),
        )

        deliveries = Delivery.objects.filter(
            driver_id=driver_id,
            delivered_at__range=[start_date, end_date],
        ).aggregate(
            total_deliveries=Count("id"),
            delivered_liters=Sum("quantity_liters"),
        )

        pdvs_visited = Attendance.objects.filter(
            driver_id=driver_id,
            checkin_at__range=[start_date, end_date],
        ).values("pdv").distinct().count()

        return {
            "collections": {
                "count": collections["total_collections"] or 0,
                "liters": float(collections["total_liters"] or 0),
                "value": float(collections["total_value"] or 0),
            },
            "deliveries": {
                "count": deliveries["total_deliveries"] or 0,
                "liters": float(deliveries["delivered_liters"] or 0),
            },
            "pdvs_visited": pdvs_visited,
            "period": {"start": start_date, "end": end_date},
        }

    @staticmethod
    def get_all_drivers_stats():
        from django.db.models import Count
        from .models import Driver, DriverAvailability

        total_drivers = Driver.objects.count()
        active_drivers = Driver.objects.filter(user__is_active=True).count()
        available_now = DriverAvailability.objects.filter(is_available=True).count()
        verified = Driver.objects.filter(is_verified=True).count()

        by_transport = Driver.objects.values("transport_mode").annotate(count=Count("id")).order_by("-count")
        by_status = Driver.objects.values("status").annotate(count=Count("id")).order_by("-count")

        return {
            "total": total_drivers,
            "active": active_drivers,
            "available": available_now,
            "verified": verified,
            "byTransport": list(by_transport),
            "byStatus": list(by_status),
        }
