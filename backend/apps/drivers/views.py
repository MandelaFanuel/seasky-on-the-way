# apps/drivers/views.py

"""
Views pour la gestion des chauffeurs.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from django.db.models import Count, Sum, Avg, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from django_filters import rest_framework as filters

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Driver, DriverAvailability, DriverDocument, DriverPerformance
from .serializers import (
    DriverSerializer,
    DriverCreateSerializer,
    DriverAvailabilitySerializer,
    DriverDocumentSerializer,
    DriverPerformanceSerializer,
)
from .utils import DriverAnalytics, DriverStatusManager

logger = logging.getLogger(__name__)


class DriverFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=Driver.STATUS)
    transport_mode = filters.ChoiceFilter(choices=Driver.MODES)
    is_verified = filters.BooleanFilter()
    license_valid = filters.BooleanFilter(method="filter_license_valid")
    insurance_valid = filters.BooleanFilter(method="filter_insurance_valid")
    available = filters.BooleanFilter(method="filter_available")
    hire_date_range = filters.DateFromToRangeFilter(field_name="hire_date")
    zone = filters.CharFilter(field_name="assigned_zone", lookup_expr="icontains")

    class Meta:
        model = Driver
        fields = [
            "status",
            "transport_mode",
            "is_verified",
            "license_valid",
            "insurance_valid",
            "available",
            "hire_date_range",
            "zone",
        ]

    def filter_license_valid(self, queryset, name, value):
        today = timezone.localdate()
        if value:
            return queryset.filter(Q(license_expiry__isnull=False) & Q(license_expiry__gte=today))
        return queryset.filter(Q(license_expiry__isnull=True) | Q(license_expiry__lt=today))

    def filter_insurance_valid(self, queryset, name, value):
        today = timezone.localdate()
        if value:
            return queryset.filter(Q(insurance_expiry__isnull=False) & Q(insurance_expiry__gte=today))
        return queryset.filter(Q(insurance_expiry__isnull=True) | Q(insurance_expiry__lt=today))

    def filter_available(self, queryset, name, value):
        available_driver_ids = DriverAvailability.objects.filter(is_available=value).values_list("driver_id", flat=True)
        return queryset.filter(id__in=available_driver_ids)


class DriverViewSet(viewsets.ModelViewSet):
    """
    ✅ STRICT: Toute gestion Drivers = ADMIN ONLY
    """
    queryset = (
        Driver.objects.all()
        .select_related("user", "availability")
        .prefetch_related("documents", "performances")
    )
    serializer_class = DriverSerializer
    filter_backends = [filters.DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DriverFilter
    parser_classes = [JSONParser, MultiPartParser, FormParser]  # ✅ safe

    search_fields = [
        "driver_code",
        "user__username",
        "user__full_name",
        "user__phone",
        "user__email",
        "vehicle_registration",
        "license_number",
        "assigned_zone",
    ]
    ordering_fields = [
        "driver_code",
        "created_at",
        "updated_at",
        "hire_date",
        "base_salary",
        "commission_rate",
    ]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return DriverCreateSerializer
        return DriverSerializer

    def get_permissions(self):
        return [IsAuthenticated(), IsAdminUser()]

    # ✅ IMPORTANT: Retourner les credentials à l'admin après création
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        # Le serializer peut générer un mot de passe si absent.
        # On le récupère AVANT la réponse et on le renvoie UNE SEULE FOIS.
        raw_password = serializer.validated_data.get("password") or request.data.get("password")

        driver = serializer.save()

        driver_data = DriverSerializer(driver, context={"request": request}).data

        credentials = {
            "username": getattr(driver.user, "username", None),
            "phone": getattr(driver.user, "phone", None),
            "email": getattr(driver.user, "email", None),
            "role": getattr(driver.user, "role", None),
            "account_type": getattr(driver.user, "account_type", None),
            "password": raw_password,  # ✅ montré uniquement à l'admin dans cette réponse
            "login_hint": "Connexion possible avec username OU téléphone + mot de passe",
        }

        headers = self.get_success_headers(driver_data)
        return Response(
            {
                "success": True,
                "message": "Chauffeur créé avec succès",
                "driver": driver_data,
                "credentials": credentials,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @action(detail=False, methods=["get"])
    def stats(self, request):
        stats = DriverAnalytics.get_all_drivers_stats()

        today = timezone.localdate()
        thirty_days_ago = today - timedelta(days=30)

        recent = DriverPerformance.objects.filter(period_end__gte=thirty_days_ago).aggregate(
            total_collections=Sum("collections_count"),
            total_deliveries=Sum("deliveries_count"),
            total_collections_volume=Sum("collections_volume"),
            total_deliveries_volume=Sum("deliveries_volume"),
            avg_rating=Avg("rating"),
        )

        total_volume = float((recent["total_collections_volume"] or 0) + (recent["total_deliveries_volume"] or 0))

        stats.update(
            {
                "recent_performance": {
                    "total_collections": recent["total_collections"] or 0,
                    "total_deliveries": recent["total_deliveries"] or 0,
                    "total_volume": total_volume,
                    "avg_rating": float(recent["avg_rating"] or 0),
                },
                "documents_expiring_soon": DriverDocument.objects.filter(
                    expiry_date__gte=today,
                    expiry_date__lte=today + timedelta(days=30),
                ).count(),
                "available_now": DriverAvailability.objects.filter(is_available=True).count(),
            }
        )
        return Response(stats)

    @action(detail=True, methods=["get"])
    def performance(self, request, pk=None):
        driver = self.get_object()
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        performance = DriverAnalytics.get_driver_performance(driver.id, start_date, end_date)
        return Response(performance)

    @action(detail=True, methods=["post"])
    def update_availability(self, request, pk=None):
        driver = self.get_object()
        serializer = DriverAvailabilitySerializer(driver.availability, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info("Driver %s availability updated by=%s", driver.driver_code, request.user.username)
            return Response({"success": True, "message": "Disponibilité mise à jour", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        driver = self.get_object()
        if driver.is_verified:
            return Response({"success": False, "message": "Ce chauffeur est déjà vérifié"}, status=400)
        driver.is_verified = True
        driver.verification_date = timezone.now()
        driver.save(update_fields=["is_verified", "verification_date", "updated_at"])
        return Response({"success": True, "message": "Chauffeur vérifié", "driver": DriverSerializer(driver).data})

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        driver = self.get_object()
        driver.status = "inactive"
        driver.save(update_fields=["status", "updated_at"])
        if hasattr(driver, "availability") and driver.availability:
            driver.availability.is_available = False
            driver.availability.save(update_fields=["is_available", "last_updated"])
        return Response({"success": True, "message": "Chauffeur suspendu", "driver": DriverSerializer(driver).data})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        driver = self.get_object()
        driver.status = "active"
        driver.save(update_fields=["status", "updated_at"])
        return Response({"success": True, "message": "Chauffeur activé", "driver": DriverSerializer(driver).data})

    @action(detail=False, methods=["get"])
    def available(self, request):
        transport_mode = request.query_params.get("transport_mode")
        zone = request.query_params.get("zone")

        drivers = DriverStatusManager.get_available_drivers(transport_mode)

        if zone:
            drivers = drivers.filter(assigned_zone__icontains=zone)

        page = self.paginate_queryset(drivers)
        if page is not None:
            serializer = DriverSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = DriverSerializer(drivers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def export(self, request):
        from django.http import HttpResponse
        import csv

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="drivers_export.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "Code",
                "Nom",
                "Téléphone",
                "Email",
                "Mode Transport",
                "Statut",
                "Permis",
                "Assurance",
                "Zone",
                "Salaire Base",
                "Commission",
                "Embauché le",
                "Vérifié",
            ]
        )

        for driver in self.get_queryset():
            writer.writerow(
                [
                    driver.driver_code,
                    driver.user.full_name or "",
                    driver.user.phone or "",
                    driver.user.email or "",
                    driver.get_transport_mode_display(),
                    driver.get_status_display(),
                    "Valide" if driver.license_is_valid else "Expiré",
                    "Valide" if driver.insurance_is_valid else "Expiré",
                    driver.assigned_zone or "",
                    driver.base_salary,
                    driver.commission_rate,
                    driver.hire_date.strftime("%Y-%m-%d") if driver.hire_date else "",
                    "Oui" if driver.is_verified else "Non",
                ]
            )
        return response

    @action(detail=False, methods=["post"])
    def bulk_actions(self, request):
        action_type = request.data.get("action")
        driver_ids = request.data.get("driver_ids", [])

        if not action_type or not driver_ids:
            return Response({"success": False, "message": "Action et IDs requis"}, status=400)

        drivers = Driver.objects.filter(id__in=driver_ids)

        if action_type == "verify":
            drivers.update(is_verified=True, verification_date=timezone.now())
            message = f"{drivers.count()} chauffeurs vérifiés"

        elif action_type == "suspend":
            drivers.update(status="inactive")
            DriverAvailability.objects.filter(driver__in=drivers).update(is_available=False)
            message = f"{drivers.count()} chauffeurs suspendus"

        elif action_type == "activate":
            drivers.update(status="active")
            message = f"{drivers.count()} chauffeurs activés"

        elif action_type == "delete":
            count = drivers.count()
            drivers.delete()
            message = f"{count} chauffeurs supprimés"

        else:
            return Response({"success": False, "message": "Action non reconnue"}, status=400)

        logger.info("Bulk action=%s by=%s count=%s", action_type, request.user.username, len(driver_ids))
        return Response({"success": True, "message": message, "count": len(driver_ids)})

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        today = timezone.localdate()
        last_7_days = [today - timedelta(days=i) for i in range(7)]

        hire_timeline = (
            Driver.objects.annotate(month=TruncMonth("hire_date"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        performance_by_mode = (
            DriverPerformance.objects.values("driver__transport_mode")
            .annotate(
                avg_efficiency=Avg("efficiency_score"),
                avg_rating=Avg("rating"),
                collections_volume=Sum("collections_volume"),
                deliveries_volume=Sum("deliveries_volume"),
            )
            .order_by("-avg_efficiency")
        )

        availability_trend = []
        for day in reversed(last_7_days):
            available_count = DriverAvailability.objects.filter(last_updated__date=day, is_available=True).count()
            availability_trend.append(
                {
                    "date": day.strftime("%Y-%m-%d"),
                    "available": available_count,
                    "total": Driver.objects.filter(created_at__date__lte=day).count(),
                }
            )

        top_performers = self._get_top_performers()
        documents_status = self._get_documents_status()

        performance_by_mode_list = []
        for row in performance_by_mode:
            total_volume = float((row.get("collections_volume") or 0) + (row.get("deliveries_volume") or 0))
            performance_by_mode_list.append(
                {
                    "driver__transport_mode": row.get("driver__transport_mode"),
                    "avg_efficiency": float(row.get("avg_efficiency") or 0),
                    "avg_rating": float(row.get("avg_rating") or 0),
                    "total_volume": total_volume,
                }
            )

        return Response(
            {
                "hire_timeline": list(hire_timeline),
                "performance_by_mode": performance_by_mode_list,
                "availability_trend": availability_trend,
                "top_performers": top_performers,
                "documents_status": documents_status,
            }
        )

    def _get_top_performers(self, limit=5):
        start = timezone.now() - timedelta(days=30)

        rows = (
            DriverPerformance.objects.filter(period_end__gte=start)
            .values("driver_id", "driver__driver_code", "driver__user__full_name")
            .annotate(
                total_score=Avg("efficiency_score"),
                collections_volume=Sum("collections_volume"),
                deliveries_volume=Sum("deliveries_volume"),
            )
            .order_by("-total_score")[:limit]
        )

        out = []
        for r in rows:
            total_volume = float((r.get("collections_volume") or 0) + (r.get("deliveries_volume") or 0))
            out.append(
                {
                    "driver_id": r["driver_id"],
                    "driver__driver_code": r["driver__driver_code"],
                    "driver__user__full_name": r["driver__user__full_name"],
                    "total_score": float(r.get("total_score") or 0),
                    "total_volume": total_volume,
                }
            )
        return out

    def _get_documents_status(self):
        today = timezone.localdate()
        return {
            "expired": DriverDocument.objects.filter(expiry_date__lt=today).count(),
            "expiring_soon": DriverDocument.objects.filter(
                expiry_date__gte=today, expiry_date__lte=today + timedelta(days=30)
            ).count(),
            "valid": DriverDocument.objects.filter(expiry_date__gt=today + timedelta(days=30)).count(),
            "without_expiry": DriverDocument.objects.filter(expiry_date__isnull=True).count(),
        }


class DriverDocumentViewSet(viewsets.ModelViewSet):
    queryset = DriverDocument.objects.all().select_related("driver", "verified_by")
    serializer_class = DriverDocumentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["file_name", "description", "driver__driver_code"]
    ordering_fields = ["uploaded_at", "expiry_date"]
    ordering = ["-uploaded_at"]

    def get_queryset(self):
        queryset = super().get_queryset()

        driver_id = self.request.query_params.get("driver_id")
        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)

        doc_type = self.request.query_params.get("document_type")
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)

        verified = self.request.query_params.get("verified")
        if verified is not None:
            queryset = queryset.filter(is_verified=str(verified).lower() == "true")

        expired = self.request.query_params.get("expired")
        if expired is not None:
            today = timezone.localdate()
            if str(expired).lower() == "true":
                queryset = queryset.filter(expiry_date__lt=today)
            else:
                queryset = queryset.filter(Q(expiry_date__gte=today) | Q(expiry_date__isnull=True))

        return queryset

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        document = self.get_object()
        if document.is_verified:
            return Response({"success": False, "message": "Déjà vérifié"}, status=400)

        document.is_verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save(update_fields=["is_verified", "verified_by", "verified_at"])
        return Response({"success": True, "message": "Document vérifié", "document": self.get_serializer(document).data})

    @action(detail=False, methods=["get"])
    def expiring_soon(self, request):
        today = timezone.localdate()
        threshold = today + timedelta(days=30)

        documents = DriverDocument.objects.filter(expiry_date__gte=today, expiry_date__lte=threshold).select_related("driver")
        page = self.paginate_queryset(documents)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)


class DriverAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = DriverAvailability.objects.all().select_related("driver", "driver__user")
    serializer_class = DriverAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["is_available"]
    ordering_fields = ["last_updated"]
    ordering = ["-last_updated"]

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        available_drivers = self.queryset.filter(is_available=True).count()

        by_transport = (
            Driver.objects.values("transport_mode")
            .annotate(
                total=Count("id"),
                available=Count("availability", filter=Q(availability__is_available=True)),
            )
            .order_by("-total")
        )

        recent_updates = self.queryset.order_by("-last_updated")[:10]

        with_location = self.queryset.filter(
            location_lat__isnull=False,
            location_lng__isnull=False,
        ).values("driver_id", "location_lat", "location_lng", "driver__driver_code")

        return Response(
            {
                "available_drivers": available_drivers,
                "total_drivers": Driver.objects.count(),
                "by_transport": list(by_transport),
                "recent_updates": DriverAvailabilitySerializer(recent_updates, many=True).data,
                "locations": list(with_location),
            }
        )

    @action(detail=False, methods=["post"])
    def update_location(self, request):
        driver_id = request.data.get("driver_id")
        lat = request.data.get("lat")
        lng = request.data.get("lng")

        if not driver_id or lat is None or lng is None:
            return Response({"success": False, "message": "driver_id, lat et lng requis"}, status=400)

        try:
            availability = DriverAvailability.objects.get(driver_id=driver_id)
            availability.location_lat = lat
            availability.location_lng = lng
            availability.last_location_update = timezone.now()
            availability.save(update_fields=["location_lat", "location_lng", "last_location_update", "last_updated"])
            return Response({"success": True, "message": "Localisation mise à jour", "data": self.get_serializer(availability).data})
        except DriverAvailability.DoesNotExist:
            return Response({"success": False, "message": "Chauffeur non trouvé"}, status=404)


class DriverPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DriverPerformance.objects.all().select_related("driver", "driver__user")
    serializer_class = DriverPerformanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["driver"]
    ordering_fields = ["period_end", "efficiency_score", "rating"]
    ordering = ["-period_end"]

    @action(detail=False, methods=["get"])
    def leaderboard(self, request):
        period = request.query_params.get("period", "monthly")
        if period == "weekly":
            start_date = timezone.now() - timedelta(days=7)
        elif period == "quarterly":
            start_date = timezone.now() - timedelta(days=90)
        else:
            start_date = timezone.now() - timedelta(days=30)

        rows = (
            DriverPerformance.objects.filter(period_end__gte=start_date)
            .values("driver_id", "driver__driver_code", "driver__user__full_name")
            .annotate(
                total_efficiency=Avg("efficiency_score"),
                total_rating=Avg("rating"),
                collections_volume=Sum("collections_volume"),
                deliveries_volume=Sum("deliveries_volume"),
                earnings_sum=Sum("earnings"),
                commission_sum=Sum("commission"),
            )
            .order_by("-total_efficiency")[:20]
        )

        out = []
        for r in rows:
            total_volume = float((r.get("collections_volume") or 0) + (r.get("deliveries_volume") or 0))
            total_earnings = float((r.get("earnings_sum") or 0) + (r.get("commission_sum") or 0))
            out.append(
                {
                    "driver_id": r["driver_id"],
                    "driver__driver_code": r["driver__driver_code"],
                    "driver__user__full_name": r["driver__user__full_name"],
                    "total_efficiency": float(r.get("total_efficiency") or 0),
                    "total_rating": float(r.get("total_rating") or 0),
                    "total_volume": total_volume,
                    "total_earnings": total_earnings,
                }
            )
        return Response(out)
