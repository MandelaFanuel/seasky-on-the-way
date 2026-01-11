# ========================= apps/pdv/admin.py =========================
from django.contrib import admin
from .models import PointDeVente, PDVStock, PDVSale


@admin.register(PointDeVente)
class PDVAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "province", "commune", "agent_user", "partner", "created_at")
    search_fields = ("name", "province", "commune", "agent_user__username", "agent_user__full_name")
    list_filter = ("province", "commune")


@admin.register(PDVStock)
class PDVStockAdmin(admin.ModelAdmin):
    list_display = ("id", "pdv", "current_liters", "last_event_at", "updated_at")
    search_fields = ("pdv__name", "pdv__province", "pdv__commune")


@admin.register(PDVSale)
class PDVSaleAdmin(admin.ModelAdmin):
    list_display = ("id", "pdv", "liters_sold", "sold_by", "sold_at")
    search_fields = ("pdv__name", "sold_by__username", "sold_by__full_name")
    list_filter = ("sold_at",)
