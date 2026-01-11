# backend/apps/accounts/apps.py
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    label = "accounts"
    verbose_name = "Gestion des comptes"

    def ready(self):
        # Import des signaux si nécessaire
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass
