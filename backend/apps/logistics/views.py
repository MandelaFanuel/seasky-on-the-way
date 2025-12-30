# ========================= apps/logistics/views.py =========================
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Collection, Delivery, Attendance
from .serializers import (
    CollectionSerializer,
    DeliverySerializer,
    AttendanceSerializer,
    DeliveryConfirmFromScanSerializer,
)

from apps.qr.models import QRToken, QRScan
from apps.drivers.models import Driver
from apps.pdv.models import PointDeVente, PDVStock


def is_admin_user(user) -> bool:
    return bool(user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "admin"))


def is_agent_user(user) -> bool:
    return bool(user and getattr(user, "role", "") == "agent")


class CollectionViewSet(viewsets.ModelViewSet):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Collection.objects.all().select_related(
            "supplier", "supplier__user", "driver", "driver__user", "created_by", "qr_scan"
        )

        if is_admin_user(user):
            return qs

        if hasattr(user, "supplier"):
            return qs.filter(supplier=user.supplier)

        if hasattr(user, "driver"):
            return qs.filter(driver=user.driver)

        return qs.none()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, "supplier"):
            raise PermissionDenied("Seul un fournisseur peut enregistrer une collecte.")
        serializer.save(context={"request": self.request})


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all().select_related("driver", "driver__user", "pdv", "confirmed_by", "qr_scan")
    serializer_class = DeliverySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if is_admin_user(user):
            return qs

        # Agent: deliveries de son PDV
        if is_agent_user(user):
            pdv = PointDeVente.objects.filter(agent_user=user).first()
            if not pdv:
                return qs.none()
            return qs.filter(pdv=pdv)

        # Chauffeur: deliveries qui le concernent (si tu veux)
        if hasattr(user, "driver"):
            return qs.filter(driver=user.driver)

        return qs.none()

    @action(detail=False, methods=["post"], url_path="confirm-from-scan")
    def confirm_from_scan(self, request):
        """
        Agent PDV confirme réception:
        - scan QR chauffeur (token purpose=delivery recommandé)
        - saisit litres
        -> Delivery créée + Stock PDV augmente
        """
        if not is_agent_user(request.user) and not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)

        ser = DeliveryConfirmFromScanSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        code = ser.validated_data["code"]
        pdv_id = ser.validated_data["pdv_id"]
        qty = ser.validated_data["quantity_liters"]

        # Agent ne peut confirmer que pour son PDV
        if is_agent_user(request.user):
            pdv = PointDeVente.objects.filter(id=pdv_id, agent_user=request.user).select_related("stock").first()
            if not pdv:
                return Response({"detail": "PDV introuvable ou non autorisé."}, status=404)
        else:
            pdv = PointDeVente.objects.filter(id=pdv_id).select_related("stock").first()
            if not pdv:
                return Response({"detail": "PDV introuvable."}, status=404)

        # Token QR
        token = QRToken.objects.filter(code=code).first()
        if not token:
            return Response({"detail": "Token QR introuvable."}, status=404)

        if not token.is_valid():
            return Response({"detail": "Token QR expiré ou déjà utilisé."}, status=400)

        # On attend un QR pour chauffeur
        if token.subject_type != "driver":
            return Response({"detail": "Ce QR ne correspond pas à un chauffeur."}, status=400)

        # (Optionnel) On recommande purpose=delivery, mais on n'interdit pas pour ne pas casser tes usages
        # if token.purpose != "delivery":
        #     return Response({"detail": "QR non prévu pour une livraison (purpose=delivery)."}, status=400)

        driver = Driver.objects.select_related("user").filter(id=token.subject_id).first()
        if not driver:
            return Response({"detail": "Chauffeur introuvable."}, status=404)

        # Trace scan
        scan = QRScan.objects.create(
            token=token,
            scanned_by=request.user,
            ip=request.META.get("REMOTE_ADDR"),
            ua=request.META.get("HTTP_USER_AGENT", "") or "",
        )

        if token.one_time:
            token.used_at = timezone.now()
            token.save(update_fields=["used_at"])

        delivery = Delivery.objects.create(
            driver=driver,
            pdv=pdv,
            quantity_liters=qty,
            delivered_at=timezone.now(),
            confirmed_by=request.user,
            confirmed_at=timezone.now(),
            qr_scan=scan,
        )

        stock, _ = PDVStock.objects.get_or_create(pdv=pdv)
        stock.increase(qty, event_time=timezone.now())

        return Response(
            {
                "success": True,
                "message": "Réception confirmée. Stock PDV mis à jour.",
                "delivery": DeliverySerializer(delivery, context={"request": request}).data,
                "stock": {
                    "pdv_id": pdv.id,
                    "pdv_name": pdv.name,
                    "province": pdv.province,
                    "commune": pdv.commune,
                    "current_liters": str(stock.current_liters),
                    "last_event_at": stock.last_event_at,
                },
                "driver": {
                    "id": driver.id,
                    "driver_code": driver.driver_code,
                    "name": driver.user.full_name or driver.user.username,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related("driver", "pdv")
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
