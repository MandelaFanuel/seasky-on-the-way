# ========================= apps/wallet/models.py =========================
from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import models, transaction
from django.db.models import F
from django.utils import timezone


def _default_initial_balance() -> Decimal:
    # ✅ 200,000,000 pour tests (modifiable plus tard via settings)
    return Decimal(str(getattr(settings, "WALLET_INITIAL_BALANCE", "200000000")))


def normalize_phone_to_wallet_address(phone: str) -> str:
    """
    Normalise un numéro en "adresse wallet".
    - digits only
    - retire le préfixe 257 si présent (option Burundi)
    Ex:
      +257 79 00 11 22 -> 79001122
      25779001122      -> 79001122
      79001122         -> 79001122
    """
    raw = (phone or "").strip()
    digits = "".join(ch for ch in raw if ch.isdigit())

    # retire "257" seulement si ça ressemble à un numéro burundais
    if digits.startswith("257") and len(digits) >= 11:
        digits = digits[3:]

    return digits


class Wallet(models.Model):
    """
    Wallet interne (future intégration Lumicash).
    ✅ address = téléphone normalisé (digits only, sans 257 si applicable)
    """

    PROVIDERS = (
        ("lumicash", "Lumicash"),
        ("internal", "Internal"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wallet",
    )

    address = models.CharField(max_length=30, unique=True, db_index=True)  # phone = address
    provider = models.CharField(max_length=30, choices=PROVIDERS, default="lumicash", db_index=True)

    balance = models.DecimalField(max_digits=18, decimal_places=2, default=_default_initial_balance)
    locked_balance = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0.00"))

    is_active = models.BooleanField(default=True, db_index=True)

    # ✅ Wallet principal plateforme (réception paiements + paiements internes)
    is_platform_wallet = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["address"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["is_platform_wallet"]),
        ]

    def __str__(self):
        return f"Wallet({self.user_id}) {self.address} bal={self.balance}"

    def save(self, *args, **kwargs):
        # ✅ auto address basé sur le téléphone user si absent
        if not self.address:
            phone = getattr(self.user, "phone", "") or ""
            self.address = normalize_phone_to_wallet_address(phone)

        # sécurité: address toujours normalisée
        self.address = normalize_phone_to_wallet_address(self.address)

        super().save(*args, **kwargs)

    @transaction.atomic
    def credit(self, amount: Decimal, *, reason: str = "", created_by=None, meta=None) -> "WalletTransaction":
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError("Amount must be > 0")

        Wallet.objects.filter(pk=self.pk).update(balance=F("balance") + amount, updated_at=timezone.now())
        self.refresh_from_db()

        return WalletTransaction.objects.create(
            wallet=self,
            tx_type=WalletTransaction.TxTypes.CREDIT,
            amount=amount,
            status=WalletTransaction.Status.SUCCESS,
            reference=reason or "credit",
            created_by=created_by,
            meta=meta or {},
            provider=self.provider,
        )

    @transaction.atomic
    def debit(self, amount: Decimal, *, reason: str = "", created_by=None, meta=None) -> "WalletTransaction":
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError("Amount must be > 0")

        locked = Wallet.objects.select_for_update().get(pk=self.pk)
        if locked.balance < amount:
            raise ValueError("Insufficient balance")

        locked.balance = locked.balance - amount
        locked.updated_at = timezone.now()
        locked.save(update_fields=["balance", "updated_at"])

        self.refresh_from_db()

        return WalletTransaction.objects.create(
            wallet=self,
            tx_type=WalletTransaction.TxTypes.DEBIT,
            amount=amount,
            status=WalletTransaction.Status.SUCCESS,
            reference=reason or "debit",
            created_by=created_by,
            meta=meta or {},
            provider=self.provider,
        )

    @transaction.atomic
    def transfer_to(self, other: "Wallet", amount: Decimal, *, reason: str = "", created_by=None, meta=None):
        """
        Transfert interne wallet -> wallet.
        """
        if other.pk == self.pk:
            raise ValueError("Cannot transfer to same wallet")

        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError("Amount must be > 0")

        # lock order stable
        first, second = (self, other) if self.pk < other.pk else (other, self)
        Wallet.objects.select_for_update().filter(pk__in=[first.pk, second.pk])

        src = Wallet.objects.get(pk=self.pk)
        dst = Wallet.objects.get(pk=other.pk)

        if src.balance < amount:
            raise ValueError("Insufficient balance")

        Wallet.objects.filter(pk=src.pk).update(balance=F("balance") - amount, updated_at=timezone.now())
        Wallet.objects.filter(pk=dst.pk).update(balance=F("balance") + amount, updated_at=timezone.now())

        out_tx = WalletTransaction.objects.create(
            wallet=self,
            tx_type=WalletTransaction.TxTypes.TRANSFER_OUT,
            amount=amount,
            status=WalletTransaction.Status.SUCCESS,
            reference=reason or "transfer_out",
            created_by=created_by,
            meta={"to_wallet_id": other.pk, **(meta or {})},
            provider=self.provider,
        )
        in_tx = WalletTransaction.objects.create(
            wallet=other,
            tx_type=WalletTransaction.TxTypes.TRANSFER_IN,
            amount=amount,
            status=WalletTransaction.Status.SUCCESS,
            reference=reason or "transfer_in",
            created_by=created_by,
            meta={"from_wallet_id": self.pk, **(meta or {})},
            provider=other.provider,
        )
        return out_tx, in_tx


class WalletTransaction(models.Model):
    class TxTypes(models.TextChoices):
        CREDIT = "credit", "Credit"
        DEBIT = "debit", "Debit"
        TRANSFER_IN = "transfer_in", "Transfer In"
        TRANSFER_OUT = "transfer_out", "Transfer Out"
        ADJUSTMENT = "adjustment", "Adjustment"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        CANCELED = "canceled", "Canceled"

    # ✅ IMPORTANT:
    # On laisse l'ID par défaut (BigAutoField / AutoField selon settings),
    # car la table existe déjà en bigint dans PostgreSQL.
    # NE PAS forcer UUID ici.

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")

    tx_type = models.CharField(max_length=20, choices=TxTypes.choices, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS, db_index=True)

    amount = models.DecimalField(max_digits=18, decimal_places=2)

    reference = models.CharField(max_length=120, blank=True, default="")
    meta = models.JSONField(default=dict, blank=True)

    provider = models.CharField(max_length=30, default="lumicash", db_index=True)
    provider_tx_id = models.CharField(max_length=120, null=True, blank=True, db_index=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="wallet_transactions_created",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["tx_type", "created_at"]),
            models.Index(fields=["provider", "provider_tx_id"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"Tx({self.tx_type}) {self.amount} status={self.status}"
