# ========================= apps/qr/views.py =========================
import logging

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import QRScan, QRToken
from .serializers import (
    QRScanCreateSerializer,
    QRScanSerializer,
    QRTokenGenerateSerializer,
    QRTokenSerializer,
)
from .utils import (
    expiry,
    generate_qr_token,
    get_subject_info_from_token,
    is_token_expired,
    log_scan_activity,
    validate_token_format,
)

logger = logging.getLogger(__name__)


class QRViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    queryset = QRToken.objects.all()
    serializer_class = QRTokenSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return QRToken.objects.all().order_by("-created_at")
        return QRToken.objects.filter(scans__scanned_by=user).distinct().order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "generate":
            return QRTokenGenerateSerializer
        if self.action == "scan":
            return QRScanCreateSerializer
        if self.action in ("my_scans",):
            return QRScanSerializer
        return QRTokenSerializer

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        token = QRToken.objects.create(
            code=generate_qr_token(),
            subject_type=data["subject_type"],
            subject_id=data["subject_id"],
            purpose=data["purpose"],
            expires_at=expiry(data.get("ttl_minutes", 5)),
            one_time=data.get("one_time", True),
        )

        return Response(
            {
                "success": True,
                "message": "Token QR généré avec succès",
                "token": QRTokenSerializer(token).data,
                "qr_data": {
                    "code": token.code,
                    "expires_at": token.expires_at,
                    "ttl_seconds": int((token.expires_at - timezone.now()).total_seconds()),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="scan")
    def scan(self, request):
        scan_serializer = self.get_serializer(data=request.data)
        scan_serializer.is_valid(raise_exception=True)
        code = scan_serializer.validated_data["code"]

        is_valid, error_msg = validate_token_format(code)
        if not is_valid:
            return Response(
                {"success": False, "error": f"Format invalide: {error_msg}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = QRToken.objects.get(code=code)
        except QRToken.DoesNotExist:
            return Response(
                {"success": False, "error": "Token QR invalide ou introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if is_token_expired(token.expires_at):
            return Response(
                {"success": False, "error": "Token QR expiré", "token": QRTokenSerializer(token).data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if token.one_time and token.used_at:
            return Response(
                {"success": False, "error": "Token QR déjà utilisé", "token": QRTokenSerializer(token).data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        scan = QRScan.objects.create(
            token=token,
            scanned_by=request.user,
            ip=request.META.get("REMOTE_ADDR"),
            ua=request.META.get("HTTP_USER_AGENT", "") or "",
        )

        if token.one_time:
            token.used_at = timezone.now()
            token.save(update_fields=["used_at"])

        subject_info = get_subject_info_from_token(token)

        logger.info(
            "QR scan log: %s",
            log_scan_activity(token, request.user, scan.ip, scan.ua),
        )

        return Response(
            {
                "success": True,
                "message": "Token QR scanné avec succès",
                "scan": QRScanSerializer(scan).data,
                "token": QRTokenSerializer(token).data,
                "subject": subject_info,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="my-scans")
    def my_scans(self, request):
        limit = int(request.query_params.get("limit", 50))
        qs_all = (
            QRScan.objects.filter(scanned_by=request.user)
            .select_related("token", "scanned_by")
            .order_by("-scanned_at")
        )
        qs = qs_all[:limit]
        return Response({"count": qs_all.count(), "scans": QRScanSerializer(qs, many=True).data})

    @action(detail=False, methods=["get"], url_path="active")
    def active_tokens(self, request):
        qs = QRToken.objects.filter(expires_at__gt=timezone.now(), used_at__isnull=True).order_by("expires_at")
        data = QRTokenSerializer(qs, many=True).data

        # enrichir la réponse sans casser la sérialisation
        now = timezone.now()
        for token_data, token_obj in zip(data, qs):
            td = token_obj.expires_at - now
            token_data["ttl_seconds"] = int(td.total_seconds()) if td.total_seconds() > 0 else 0
            token_data["expires_in"] = self._format_timedelta(td)

        return Response({"count": qs.count(), "tokens": data})

    def _format_timedelta(self, td):
        """Formate un timedelta en texte lisible."""
        total_seconds = int(td.total_seconds())
        if total_seconds <= 0:
            return "0 seconde"

        if total_seconds < 60:
            return f"{total_seconds} secondes"

        if total_seconds < 3600:
            minutes = total_seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''}"

        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        if minutes > 0:
            return f"{hours}h{minutes:02d}"
        return f"{hours} heure{'s' if hours > 1 else ''}"
