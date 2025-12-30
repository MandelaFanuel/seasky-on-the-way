# ========================= apps/wallet/serializers.py =========================
from __future__ import annotations

from rest_framework import serializers

from .models import Wallet, WalletTransaction


class WalletSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = Wallet
        fields = [
            "id",
            "user",
            "username",
            "full_name",
            "phone",
            "role",
            "address",
            "provider",
            "balance",
            "locked_balance",
            "is_active",
            "is_platform_wallet",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "address",
            "provider",
            "balance",
            "locked_balance",
            "created_at",
            "updated_at",
        ]


class WalletTransactionSerializer(serializers.ModelSerializer):
    wallet_address = serializers.CharField(source="wallet.address", read_only=True)
    username = serializers.CharField(source="wallet.user.username", read_only=True)
    full_name = serializers.CharField(source="wallet.user.full_name", read_only=True)

    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = WalletTransaction
        fields = [
            "id",
            "wallet",
            "wallet_address",
            "username",
            "full_name",
            "tx_type",
            "status",
            "amount",
            "reference",
            "meta",
            "provider",
            "provider_tx_id",
            "created_by",
            "created_by_username",
            "created_at",
        ]
        read_only_fields = ["created_at", "created_by"]


class WalletTransferSerializer(serializers.Serializer):
    to_wallet_id = serializers.IntegerField(min_value=1)
    amount = serializers.DecimalField(max_digits=18, decimal_places=2)
    reason = serializers.CharField(required=False, allow_blank=True, default="")
