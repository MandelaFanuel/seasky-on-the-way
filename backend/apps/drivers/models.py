# ========================= apps/drivers/models.py =========================
from __future__ import annotations

from datetime import date
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


class Driver(models.Model):
    """Modèle pour les chauffeurs."""

    MODES = (
        ("vehicule", "Véhicule"),
        ("velo", "Vélo"),
        ("pied", "À pied"),
        ("moto", "Moto"),
        ("camion", "Camion"),
    )

    STATUS = (
        ("active", "Actif"),
        ("inactive", "Inactif"),
        ("on_duty", "En service"),
        ("off_duty", "Hors service"),
        ("on_break", "En pause"),
        ("on_leave", "En congé"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="driver",
    )

    driver_code = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name="Code chauffeur",
        help_text="Code unique du chauffeur (format: CH_ANNEE_HEX)",
        blank=True,
        default="",
    )

    transport_mode = models.CharField(
        max_length=20,
        choices=MODES,
        default="vehicule",
        verbose_name="Mode de transport",
    )

    can_be_pdv = models.BooleanField(
        default=False,
        verbose_name="Peut être PDV",
        help_text="Peut servir comme point de vente",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="active",
        verbose_name="Statut",
        db_index=True,
    )

    license_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Numéro de permis")
    license_expiry = models.DateField(blank=True, null=True, verbose_name="Date d'expiration du permis")

    vehicle_type = models.CharField(max_length=100, blank=True, null=True, verbose_name="Type de véhicule")
    vehicle_registration = models.CharField(max_length=50, blank=True, null=True, verbose_name="Immatriculation")

    insurance_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Numéro d'assurance")
    insurance_expiry = models.DateField(blank=True, null=True, verbose_name="Date d'expiration de l'assurance")

    hire_date = models.DateField(default=timezone.localdate, verbose_name="Date d'embauche")

    base_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        verbose_name="Salaire de base",
        validators=[MinValueValidator(0)],
    )

    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default="0.00",
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Taux de commission (%)",
    )

    assigned_zone = models.CharField(max_length=100, blank=True, null=True, verbose_name="Zone assignée")

    max_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        validators=[MinValueValidator(0)],
        verbose_name="Capacité maximale (litres)",
    )

    notes = models.TextField(blank=True, null=True, verbose_name="Notes")

    is_verified = models.BooleanField(default=False, verbose_name="Vérifié", db_index=True)
    verification_date = models.DateTimeField(blank=True, null=True, verbose_name="Date de vérification")

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Chauffeur"
        verbose_name_plural = "Chauffeurs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["driver_code"]),
            models.Index(fields=["status"]),
            models.Index(fields=["transport_mode"]),
            models.Index(fields=["is_verified"]),
        ]

    def __str__(self):
        name = getattr(self.user, "full_name", None) or getattr(self.user, "username", "")
        return f"{self.driver_code or 'NO_CODE'} - {name}"

    def save(self, *args, **kwargs):
        from .utils import DriverCodeGenerator

        if not self.driver_code:
            self.driver_code = DriverCodeGenerator.generate_unique_driver_code()

        if self.is_verified and not self.verification_date:
            self.verification_date = timezone.now()

        super().save(*args, **kwargs)

        # ✅ toujours garantir availability
        DriverAvailability.objects.get_or_create(driver=self)

    @property
    def is_available(self) -> bool:
        availability = getattr(self, "availability", None)
        return bool(availability and availability.is_available)

    @property
    def license_is_valid(self) -> bool:
        if not self.license_expiry:
            return False
        return self.license_expiry >= timezone.localdate()

    @property
    def insurance_is_valid(self) -> bool:
        if not self.insurance_expiry:
            return False
        return self.insurance_expiry >= timezone.localdate()

    @property
    def performance_score(self) -> Decimal:
        try:
            from .utils import DriverAnalytics
            performance = DriverAnalytics.get_driver_performance(self.id)

            collections_score = int(performance.get("collections", {}).get("count", 0)) * 10
            delivery_score = int(performance.get("deliveries", {}).get("count", 0)) * 5
            pdv_score = int(performance.get("pdvs_visited", 0)) * 2

            total_score = collections_score + delivery_score + pdv_score
            score = Decimal(min(total_score / 10, 100))
            return score
        except Exception:
            return Decimal("0.00")


class DriverAvailability(models.Model):
    """
    Disponibilité et localisation en temps réel des chauffeurs.
    """

    driver = models.OneToOneField(Driver, on_delete=models.CASCADE, related_name="availability")

    is_available = models.BooleanField(default=True, verbose_name="Disponible")

    location_lat = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        verbose_name="Latitude",
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )

    location_lng = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        verbose_name="Longitude",
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )

    last_location_update = models.DateTimeField(blank=True, null=True, verbose_name="Dernière mise à jour localisation")

    current_speed = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Vitesse (km/h)",
        validators=[MinValueValidator(0)],
    )

    battery_level = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Batterie (%)",
    )

    odometer = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Kilométrage",
        validators=[MinValueValidator(0)],
    )

    next_maintenance = models.DateField(blank=True, null=True, verbose_name="Prochaine maintenance")

    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Disponibilité chauffeur"
        verbose_name_plural = "Disponibilités chauffeurs"

    def __str__(self):
        return f"Disponibilité de {self.driver.driver_code}"

    @property
    def location(self):
        if self.location_lat is not None and self.location_lng is not None:
            return (float(self.location_lat), float(self.location_lng))
        return None

    def update_location(self, lat: Decimal, lng: Decimal, speed: Decimal | None = None):
        self.location_lat = lat
        self.location_lng = lng
        self.last_location_update = timezone.now()
        if speed is not None:
            self.current_speed = speed
        self.save(
            update_fields=[
                "location_lat",
                "location_lng",
                "last_location_update",
                "current_speed",
                "last_updated",
            ]
        )


class DriverDocument(models.Model):
    DOCUMENT_TYPES = (
        ("license", "Permis de conduire"),
        ("insurance", "Assurance"),
        ("vehicle_registration", "Carte grise"),
        ("identity", "Pièce d'identité"),
        ("contract", "Contrat de travail"),
        ("medical", "Certificat médical"),
        ("other", "Autre"),
    )

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name="documents")

    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES, verbose_name="Type de document")

    file = models.FileField(
        upload_to="driver_documents/%Y/%m/%d/",
        verbose_name="Fichier",
        blank=True,
        null=True,
    )

    file_name = models.CharField(max_length=255, blank=True, default="", verbose_name="Nom du fichier")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    expiry_date = models.DateField(blank=True, null=True, verbose_name="Date d'expiration")

    is_verified = models.BooleanField(default=False, verbose_name="Vérifié")

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="verified_driver_documents",
        verbose_name="Vérifié par",
    )

    verified_at = models.DateTimeField(blank=True, null=True, verbose_name="Date de vérification")

    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    uploaded_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        verbose_name = "Document chauffeur"
        verbose_name_plural = "Documents chauffeurs"
        ordering = ["-uploaded_at"]
        indexes = [
            models.Index(fields=["document_type"]),
            models.Index(fields=["is_verified"]),
            models.Index(fields=["expiry_date"]),
        ]

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.driver.driver_code}"

    def save(self, *args, **kwargs):
        if not self.file_name and self.file:
            try:
                self.file_name = self.file.name.split("/")[-1]
            except Exception:
                self.file_name = self.file.name or ""

        if self.is_verified and not self.verified_at:
            self.verified_at = timezone.now()

        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        if not self.expiry_date:
            return False
        return self.expiry_date < timezone.localdate()

    @property
    def days_until_expiry(self):
        if not self.expiry_date:
            return None
        delta = self.expiry_date - date.today()
        return delta.days if delta.days >= 0 else None


class DriverPerformance(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name="performances")

    period_start = models.DateField(verbose_name="Début de période")
    period_end = models.DateField(verbose_name="Fin de période")

    collections_count = models.IntegerField(default=0, verbose_name="Nombre de collectes")
    collections_volume = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        verbose_name="Volume collecté (L)",
        validators=[MinValueValidator(0)],
    )

    deliveries_count = models.IntegerField(default=0, verbose_name="Nombre de livraisons")
    deliveries_volume = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        verbose_name="Volume livré (L)",
        validators=[MinValueValidator(0)],
    )

    distance_traveled = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        verbose_name="Distance parcourue (km)",
        validators=[MinValueValidator(0)],
    )

    fuel_consumption = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        verbose_name="Consommation carburant (L)",
        validators=[MinValueValidator(0)],
    )

    earnings = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        verbose_name="Gains",
        validators=[MinValueValidator(0)],
    )

    commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default="0.00",
        verbose_name="Commission",
        validators=[MinValueValidator(0)],
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default="0.0",
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note",
    )

    incidents = models.IntegerField(default=0, verbose_name="Incidents", validators=[MinValueValidator(0)])
    complaints = models.IntegerField(default=0, verbose_name="Réclamations", validators=[MinValueValidator(0)])

    efficiency_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default="0.00",
        verbose_name="Score d'efficacité",
        validators=[MinValueValidator(0)],
    )

    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    calculated_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        verbose_name = "Performance chauffeur"
        verbose_name_plural = "Performances chauffeurs"
        ordering = ["-period_end"]
        constraints = [
            models.UniqueConstraint(fields=["driver", "period_start", "period_end"], name="uniq_driver_period"),
        ]
        indexes = [
            models.Index(fields=["period_start", "period_end"]),
        ]

    def __str__(self):
        return f"Performance de {self.driver.driver_code} - {self.period_start} à {self.period_end}"

    @property
    def total_volume(self):
        return (self.collections_volume or Decimal("0.00")) + (self.deliveries_volume or Decimal("0.00"))

    @property
    def total_activities(self):
        return int(self.collections_count or 0) + int(self.deliveries_count or 0)

    @property
    def total_earnings(self):
        return (self.earnings or Decimal("0.00")) + (self.commission or Decimal("0.00"))
