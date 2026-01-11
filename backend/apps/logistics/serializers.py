# ========================= apps/logistics/serializers.py =========================
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from .models import Collection, Delivery, Attendance
from apps.drivers.models import Driver
from apps.pdv.models import PointDeVente, PDVStock
from apps.qr.models import QRScan


class CollectionSerializer(serializers.ModelSerializer):
    supplier_name = serializers.SerializerMethodField()
    supplier_username = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()
    driver_username = serializers.SerializerMethodField()

    driver_id = serializers.IntegerField(write_only=True, required=True, min_value=1)
    qr_scan_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Collection
        fields = [
            "id",
            "supplier",
            "supplier_name",
            "supplier_username",
            "driver",
            "driver_name",
            "driver_username",
            "driver_id",
            "quantity_liters",
            "value_amount",
            "collected_at",
            "status",
            "created_by",
            "qr_scan",
            "qr_scan_id",
        ]
        read_only_fields = ["id", "supplier", "driver", "created_by", "qr_scan"]

    def get_supplier_name(self, obj):
        try:
            return obj.supplier.user.full_name or obj.supplier.user.username
        except Exception:
            return None

    def get_supplier_username(self, obj):
        try:
            return obj.supplier.user.username
        except Exception:
            return None

    def get_driver_name(self, obj):
        try:
            return obj.driver.user.full_name or obj.driver.user.username
        except Exception:
            return None

    def get_driver_username(self, obj):
        try:
            return obj.driver.user.username
        except Exception:
            return None

    def validate(self, attrs):
        q = attrs.get("quantity_liters")
        v = attrs.get("value_amount")
        if q is None or float(q) <= 0:
            raise serializers.ValidationError({"quantity_liters": _("Quantité invalide")})
        if v is None or float(v) < 0:
            raise serializers.ValidationError({"value_amount": _("Valeur invalide")})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        if not hasattr(request.user, "supplier"):
            raise serializers.ValidationError({"detail": _("Seul un fournisseur peut enregistrer une collecte.")})

        driver_id = validated_data.pop("driver_id")
        qr_scan_id = validated_data.pop("qr_scan_id", None)

        try:
            driver = Driver.objects.select_related("user").get(id=driver_id)
        except Driver.DoesNotExist:
            raise serializers.ValidationError({"driver_id": _("Driver introuvable")})

        qr_scan = None
        if qr_scan_id:
            qr_scan = QRScan.objects.filter(id=qr_scan_id).first()

        collection = Collection.objects.create(
            supplier=request.user.supplier,
            driver=driver,
            created_by=request.user,
            qr_scan=qr_scan,
            **validated_data,
        )
        return collection


class DeliverySerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.user.full_name", read_only=True)
    driver_code = serializers.CharField(source="driver.driver_code", read_only=True)
    pdv_name = serializers.CharField(source="pdv.name", read_only=True)
    pdv_province = serializers.CharField(source="pdv.province", read_only=True)
    pdv_commune = serializers.CharField(source="pdv.commune", read_only=True)

    confirmed_by_username = serializers.CharField(source="confirmed_by.username", read_only=True)
    confirmed_by_full_name = serializers.CharField(source="confirmed_by.full_name", read_only=True)

    class Meta:
        model = Delivery
        fields = [
            "id",
            "driver", "driver_name", "driver_code",
            "pdv", "pdv_name", "pdv_province", "pdv_commune",
            "quantity_liters",
            "delivered_at",
            "confirmed_by", "confirmed_by_username", "confirmed_by_full_name",
            "confirmed_at",
            "qr_scan",
        ]
        read_only_fields = ["confirmed_by", "confirmed_at", "qr_scan", "delivered_at"]


class DeliveryConfirmFromScanSerializer(serializers.Serializer):
    """
    Agent PDV confirme réception stock.
    - code/qr_data: QR code chauffeur (token)
    - pdv_id: PDV qui reçoit
    - quantity_liters: litres reçus
    """
    code = serializers.CharField(required=False, allow_blank=True)
    qr_data = serializers.CharField(required=False, allow_blank=True)  # alias frontend
    pdv_id = serializers.IntegerField(min_value=1)
    quantity_liters = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, attrs):
        code = (attrs.get("code") or attrs.get("qr_data") or "").strip()
        if len(code) < 8:
            raise serializers.ValidationError({"code": _("QR code invalide")})

        if attrs["quantity_liters"] <= 0:
            raise serializers.ValidationError({"quantity_liters": _("Quantité invalide")})

        pdv_id = attrs["pdv_id"]
        if not PointDeVente.objects.filter(id=pdv_id).exists():
            raise serializers.ValidationError({"pdv_id": _("Point de vente introuvable")})

        attrs["code"] = code
        return attrs


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"
