# ========================= apps/wallet/admin.py =========================
from django.contrib import admin
from .models import Wallet, WalletTransaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "address", "balance", "is_platform_wallet", "is_active", "created_at")
    search_fields = ("address", "user__username", "user__phone", "user__full_name")
    list_filter = ("is_platform_wallet", "is_active", "provider")


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "tx_type", "status", "amount", "provider", "provider_tx_id", "created_at")
    search_fields = ("wallet__address", "wallet__user__username", "provider_tx_id", "reference")
    list_filter = ("tx_type", "status", "provider")
