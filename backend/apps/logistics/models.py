# ========================= apps/logistics/models.py =========================
from django.db import models
from django.utils import timezone
from django.conf import settings

from apps.suppliers.models import Supplier
from apps.drivers.models import Driver
from apps.pdv.models import PointDeVente
from apps.qr.models import QRScan  # lien scan (optionnel)


class Collection(models.Model):
    STATUS = (
        ("recorded", "Recorded"),
        ("synced", "Synced"),
        ("paid_partial", "Paid partial"),
        ("paid_full", "Paid full"),
    )

    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT)

    quantity_liters = models.DecimalField(max_digits=10, decimal_places=2)
    value_amount = models.DecimalField(max_digits=12, decimal_places=2)

    collected_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS, default="recorded")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="collections_created",
    )
    qr_scan = models.ForeignKey(
        QRScan,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="collections",
    )

    class Meta:
        ordering = ("-collected_at",)

    def __str__(self):
        return f"Collection#{self.pk} supplier={self.supplier_id} driver={self.driver_id} liters={self.quantity_liters}"


class Delivery(models.Model):
    """
    Livraison du stock HQ -> PDV via chauffeur.
    Confirmée par l’agent PDV (scan QR chauffeur).
    """
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT)
    pdv = models.ForeignKey(PointDeVente, on_delete=models.PROTECT)

    quantity_liters = models.DecimalField(max_digits=10, decimal_places=2)

    delivered_at = models.DateTimeField(default=timezone.now)

    # ✅ confirmation par agent
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="pdv_deliveries_confirmed",
    )
    confirmed_at = models.DateTimeField(null=True, blank=True)

    # ✅ trace QR scan
    qr_scan = models.ForeignKey(
        QRScan,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="deliveries",
    )

    class Meta:
        ordering = ("-delivered_at",)
        indexes = [
            models.Index(fields=["delivered_at"]),
            models.Index(fields=["pdv"]),
            models.Index(fields=["driver"]),
        ]

    def __str__(self):
        return f"Delivery#{self.pk} driver={self.driver_id} pdv={self.pdv_id} liters={self.quantity_liters}"


class Attendance(models.Model):
    TYPES = (("start_shift", "Début de tournée"), ("arrival_pdv", "Arrivée PDV"))
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT)
    pdv = models.ForeignKey(PointDeVente, null=True, blank=True, on_delete=models.SET_NULL)
    checkin_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=TYPES, default="start_shift")
