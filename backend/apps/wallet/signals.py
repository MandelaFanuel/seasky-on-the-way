# ========================= apps/wallet/signals.py =========================
from __future__ import annotations

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Wallet
from .utils import normalize_phone_as_wallet_address

User = get_user_model()


@receiver(post_save, sender=User)
def create_wallet_for_new_user(sender, instance, created, **kwargs):
    """
    ✅ Chaque utilisateur reçoit automatiquement un wallet
    ✅ solde initial = 200,000,000 (tests)
    ✅ address = phone normalisé
    """
    if not created:
        return

    phone = getattr(instance, "phone", None)
    address = normalize_phone_as_wallet_address(phone or "")

    # Si pas de phone, on ne crée pas (mais chez toi phone est requis à l’inscription)
    if not address:
        return

    # évite crash si wallet existe déjà
    if Wallet.objects.filter(user=instance).exists():
        return

    # ⚠️ address unique: si collision improbable, suffix automatique
    base = address
    addr = base
    i = 0
    while Wallet.objects.filter(address=addr).exists():
        i += 1
        addr = f"{base}{i}"

    w = Wallet.objects.create(
        user=instance,
        address=addr,
        provider="lumicash",
        is_active=True,
    )

    # ✅ Si admin: tu peux décider d’en faire le wallet principal
    # Ici: premier admin rencontré => wallet principal
    try:
        role = getattr(instance, "role", "")
        if role == "admin" and not Wallet.objects.filter(is_platform_wallet=True).exists():
            w.is_platform_wallet = True
            w.save(update_fields=["is_platform_wallet"])
    except Exception:
        pass
