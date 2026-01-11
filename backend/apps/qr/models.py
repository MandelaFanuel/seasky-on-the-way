# ========================= apps/qr/models.py =========================
from django.conf import settings
from django.db import models
from django.utils import timezone


class QRToken(models.Model):
    SUBJECT_TYPES = (("driver", "Driver"), ("pdv", "PointDeVente"), ("supplier", "Supplier"))
    PURPOSES = (("checkin", "Check-in"), ("collection", "Collection"), ("delivery", "Delivery"))

    code = models.CharField(max_length=64, unique=True)
    subject_type = models.CharField(max_length=20, choices=SUBJECT_TYPES)
    subject_id = models.PositiveIntegerField()
    purpose = models.CharField(max_length=20, choices=PURPOSES)

    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    one_time = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return (self.used_at is None) and (self.expires_at > timezone.now())

    def __str__(self):
        return f"{self.code} ({self.subject_type}:{self.subject_id})"


class QRScan(models.Model):
    token = models.ForeignKey(QRToken, on_delete=models.CASCADE, related_name="scans")

    # ✅ FIX: utiliser AUTH_USER_MODEL (au lieu de 'accounts.User')
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="qr_scans",
    )

    scanned_at = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    ua = models.CharField(max_length=300, blank=True, default="")

    class Meta:
        ordering = ("-scanned_at",)

    def __str__(self):
        return f"Scan #{self.pk} - {self.token.code}"
