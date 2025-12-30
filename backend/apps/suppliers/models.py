# ========================= apps/suppliers/models.py =========================
from django.db import models
from django.conf import settings


class Supplier(models.Model):
    TYPES = (("individuel", "Individuel"), ("entreprise", "Entreprise"))
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supplier")
    type = models.CharField(max_length=20, choices=TYPES, default="individuel")
    province = models.CharField(max_length=100, blank=True)
    commune = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=200, blank=True)


    def __str__(self):
        return f"Supplier({self.user_id})"