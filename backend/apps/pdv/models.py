# ========================= apps/pdv/models.py =========================
import secrets

from django.db import models, transaction
from django.db.models import F
from django.conf import settings
from django.utils import timezone


class PointDeVente(models.Model):
    name = models.CharField(max_length=150)

    # ✅ NOUVEAU: code PDV (PDV + année + hex)
    code = models.CharField(max_length=32, unique=True, blank=True, default="", db_index=True)

    province = models.CharField(max_length=100, blank=True)
    commune = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=200, blank=True)

    agent_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pdv_agent",
    )
    partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pdv_partner",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def _gen_pdv_code() -> str:
        year = timezone.now().year
        return f"PDV{year}{secrets.token_hex(3).upper()}"

    def save(self, *args, **kwargs):
        # ✅ Génère le code si absent (sans casser l’existant)
        if not self.code:
            for _ in range(10):
                c = self._gen_pdv_code()
                if not PointDeVente.objects.filter(code=c).exists():
                    self.code = c
                    break
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["province", "commune"]),
            models.Index(fields=["name"]),
            models.Index(fields=["code"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})" if self.code else self.name


class PDVStock(models.Model):
    """
    Stock temps réel par PDV.
    Le stock est mis à jour:
      - + réception (delivery confirm)
      - - vente (sale report)
    """
    pdv = models.OneToOneField(PointDeVente, on_delete=models.CASCADE, related_name="stock")

    current_liters = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_event_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Stock PDV"
        verbose_name_plural = "Stocks PDV"

    def __str__(self):
        return f"Stock({self.pdv_id})={self.current_liters}L"

    @transaction.atomic
    def increase(self, qty, event_time=None):
        event_time = event_time or timezone.now()
        PDVStock.objects.filter(pk=self.pk).update(
            current_liters=F("current_liters") + qty,
            last_event_at=event_time,
            updated_at=timezone.now(),
        )
        self.refresh_from_db()

    @transaction.atomic
    def decrease(self, qty, event_time=None):
        event_time = event_time or timezone.now()

        locked = PDVStock.objects.select_for_update().get(pk=self.pk)
        if locked.current_liters < qty:
            raise ValueError("Stock insuffisant")
        locked.current_liters = locked.current_liters - qty
        locked.last_event_at = event_time
        locked.save(update_fields=["current_liters", "last_event_at", "updated_at"])


class PDVSale(models.Model):
    """
    Trace de vente (sortie stock).
    """
    pdv = models.ForeignKey(PointDeVente, on_delete=models.PROTECT, related_name="sales")
    liters_sold = models.DecimalField(max_digits=12, decimal_places=2)
    sold_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="pdv_sales",
    )
    sold_at = models.DateTimeField(default=timezone.now)

    notes = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["-sold_at"]
        indexes = [
            models.Index(fields=["sold_at"]),
            models.Index(fields=["pdv"]),
        ]

    def __str__(self):
        return f"Sale#{self.pk} pdv={self.pdv_id} liters={self.liters_sold}"
