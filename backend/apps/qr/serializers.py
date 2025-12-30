# ========================= apps/qr/serializers.py =========================
from django.utils import timezone
from rest_framework import serializers

from .models import QRScan, QRToken


class QRTokenGenerateSerializer(serializers.Serializer):
    subject_type = serializers.ChoiceField(choices=[c[0] for c in QRToken.SUBJECT_TYPES])
    subject_id = serializers.IntegerField(min_value=1)
    purpose = serializers.ChoiceField(choices=[c[0] for c in QRToken.PURPOSES], default="checkin")
    ttl_minutes = serializers.IntegerField(default=5, min_value=1, max_value=1440)
    one_time = serializers.BooleanField(default=True)

    def validate_subject_id(self, value):
        subject_type = self.initial_data.get("subject_type")

        if subject_type == "driver":
            from apps.drivers.models import Driver
            if not Driver.objects.filter(id=value).exists():
                raise serializers.ValidationError(f"Driver avec l'ID {value} n'existe pas")

        elif subject_type == "pdv":
            from apps.pdv.models import PointDeVente
            if not PointDeVente.objects.filter(id=value).exists():
                raise serializers.ValidationError(f"PointDeVente avec l'ID {value} n'existe pas")

        elif subject_type == "supplier":
            from apps.suppliers.models import Supplier
            if not Supplier.objects.filter(id=value).exists():
                raise serializers.ValidationError(f"Supplier avec l'ID {value} n'existe pas")

        return value


class QRTokenSerializer(serializers.ModelSerializer):
    is_active = serializers.SerializerMethodField()
    ttl_seconds = serializers.SerializerMethodField()
    scans_count = serializers.SerializerMethodField()

    class Meta:
        model = QRToken
        fields = [
            "id", "code", "subject_type", "subject_id", "purpose",
            "expires_at", "used_at", "one_time", "created_at",
            "is_active", "ttl_seconds", "scans_count",
        ]
        read_only_fields = ["code", "created_at"]

    def get_is_active(self, obj):
        if obj.used_at:
            return False
        return obj.expires_at > timezone.now()

    def get_ttl_seconds(self, obj):
        if obj.used_at or obj.expires_at <= timezone.now():
            return 0
        return int((obj.expires_at - timezone.now()).total_seconds())

    def get_scans_count(self, obj):
        return obj.scans.count()


class QRScanSerializer(serializers.ModelSerializer):
    token_code = serializers.CharField(source="token.code", read_only=True)
    token_subject_type = serializers.CharField(source="token.subject_type", read_only=True)
    token_subject_id = serializers.IntegerField(source="token.subject_id", read_only=True)

    scanned_by = serializers.PrimaryKeyRelatedField(read_only=True)
    scanned_by_username = serializers.CharField(source="scanned_by.username", read_only=True)
    scanned_by_full_name = serializers.CharField(source="scanned_by.full_name", read_only=True)

    class Meta:
        model = QRScan
        fields = [
            "id",
            "token", "token_code", "token_subject_type", "token_subject_id",
            "scanned_by", "scanned_by_username", "scanned_by_full_name",
            "scanned_at", "ip", "ua",
        ]
        read_only_fields = [
            "scanned_by", "scanned_at", "ip", "ua",
            "token_code", "token_subject_type", "token_subject_id",
            "scanned_by_username", "scanned_by_full_name",
        ]


class QRScanCreateSerializer(serializers.Serializer):
    """
    ✅ compat:
    - frontend existant envoie: { qr_data: "..." }
    - backend attendait: { code: "..." }
    => on accepte les deux.
    """
    code = serializers.CharField(max_length=200, required=False, allow_blank=True)
    qr_data = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate(self, attrs):
        value = (attrs.get("code") or attrs.get("qr_data") or "").strip()
        if len(value) < 8:
            raise serializers.ValidationError("Code QR invalide")
        attrs["code"] = value
        return attrs
