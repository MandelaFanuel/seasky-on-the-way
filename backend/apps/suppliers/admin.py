# ========================= apps/suppliers/admin.py =========================
from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "type", "province", "commune")
    search_fields = ("user__username", "province", "commune")