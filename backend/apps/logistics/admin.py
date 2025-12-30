# ========================= apps/logistics/admin.py =========================
from django.contrib import admin
from .models import Collection, Delivery, Attendance


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("id", "supplier", "driver", "quantity_liters", "value_amount", "status", "collected_at")
    search_fields = ("supplier__user__username", "driver__user__username")


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ("id", "driver", "pdv", "quantity_liters", "delivered_at")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("id", "driver", "pdv", "type", "checkin_at")