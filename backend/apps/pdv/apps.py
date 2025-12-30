# ========================= apps/pdv/apps.py =========================
from django.apps import AppConfig


class PdvConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.pdv'
    label = 'pdv'