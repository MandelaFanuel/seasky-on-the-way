# ========================= apps/qr/admin.py =========================
from django.contrib import admin
from .models import QRToken, QRScan


@admin.register(QRToken)
class QRTokenAdmin(admin.ModelAdmin):
    list_display = ("code", "subject_type", "subject_id", "purpose", "expires_at", "used_at", "one_time")
    search_fields = ("code",)


@admin.register(QRScan)
class QRScanAdmin(admin.ModelAdmin):
    list_display = ("id", "token", "scanned_by", "scanned_at", "ip")