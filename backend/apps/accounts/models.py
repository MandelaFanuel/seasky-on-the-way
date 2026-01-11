# ========================= apps/accounts/models.py =========================
from __future__ import annotations

from datetime import date
import uuid
import secrets

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


# =============================================================================
# CUSTOM USER MODEL
# =============================================================================
class CustomUser(AbstractUser):
    """
    Modèle utilisateur principal de la plateforme SeaSky
    Compatible avec AUTH_USER_MODEL = "accounts.CustomUser"
    """

    # -------------------------------------------------------------------------
    # Rôles applicatifs
    # -------------------------------------------------------------------------
    class Roles(models.TextChoices):
        ADMIN = "admin", _("Administrateur")
        FOURNISSEUR = "fournisseur", _("Fournisseur")
        LIVREUR = "livreur", _("Livreur")
        COMMERCANT = "commercant", _("Commerçant")
        PARTENAIRE = "partenaire", _("Partenaire")
        AGENT = "agent", _("Agent")
        CLIENT = "client", _("Client")

    # -------------------------------------------------------------------------
    # Types de compte
    # -------------------------------------------------------------------------
    class AccountTypes(models.TextChoices):
        CLIENT = "client", _("Client")
        FOURNISSEUR = "fournisseur", _("Fournisseur")
        COMMERCANT = "commercant", _("Commerçant/Boutique")
        LIVREUR = "livreur", _("Livreur")
        PARTENAIRE = "partenaire", _("Partenaire")
        ENTREPRISE = "entreprise", _("Entreprise")

    # Sous-types
    class ClientTypes(models.TextChoices):
        INDIVIDUEL = "individuel", _("Individuel")
        FAMILLE = "famille", _("Famille")

    class SupplierTypes(models.TextChoices):
        INDIVIDUEL = "individuel", _("Individuel")
        ENTREPRISE = "entreprise", _("Entreprise")

    class DeliveryTypes(models.TextChoices):
        INDIVIDUEL = "individuel", _("Individuel")
        ENTREPRISE = "entreprise", _("Entreprise")
        BOUTIQUE = "boutique", _("Boutique")

    class MerchantTypes(models.TextChoices):
        BOUTIQUE = "boutique", _("Boutique")

    # Genres
    class Genders(models.TextChoices):
        MALE = "male", _("Masculin")
        FEMALE = "female", _("Féminin")
        OTHER = "other", _("Autre")

    # Pièces d'identité
    class IdTypes(models.TextChoices):
        CNI = "cni", _("Carte Nationale d'Identité")
        PASSPORT = "passport", _("Passeport")
        DRIVING_LICENSE = "driving_license", _("Permis de conduire")
        RESIDENCE_CARD = "residence_card", _("Carte de résidence")
        OTHER = "other", _("Autre")

    # Types d'entité commerciale
    class BusinessEntityTypes(models.TextChoices):
        INDIVIDUAL = "individual", _("Individuel")
        COMPANY = "company", _("Société")
        COOPERATIVE = "cooperative", _("Coopérative")
        ASSOCIATION = "association", _("Association")
        OTHER = "other", _("Autre")

    # ✅ Types de boutique (COMMERÇANT) — seulement: boutique / restaurant / supermarché
    class BoutiqueTypes(models.TextChoices):
        BOUTIQUE = "boutique", _("Boutique")
        RESTAURANT = "restaurant", _("Restaurant")
        SUPERMARCHE = "supermarche", _("Supermarché")

    # Véhicules de livraison
    class DeliveryVehicles(models.TextChoices):
        MOTORCYCLE = "motorcycle", _("Moto")
        BICYCLE = "bicycle", _("Vélo")
        CAR = "car", _("Voiture")
        TRUCK = "truck", _("Camion")
        WALKING = "walking", _("À pied")

    # -------------------------------------------------------------------------
    # Profil principal
    # -------------------------------------------------------------------------
    account_type = models.CharField(
        max_length=20,
        choices=AccountTypes.choices,
        default=AccountTypes.CLIENT,
        db_index=True,
        verbose_name=_("Type de compte"),
    )

    client_type = models.CharField(
        max_length=20,
        choices=ClientTypes.choices,
        null=True,
        blank=True,
        verbose_name=_("Type de client"),
    )

    supplier_type = models.CharField(
        max_length=20,
        choices=SupplierTypes.choices,
        null=True,
        blank=True,
        verbose_name=_("Type de fournisseur"),
    )

    delivery_type = models.CharField(
        max_length=20,
        choices=DeliveryTypes.choices,
        null=True,
        blank=True,
        verbose_name=_("Type de livreur"),
    )

    merchant_type = models.CharField(
        max_length=20,
        choices=MerchantTypes.choices,
        default=MerchantTypes.BOUTIQUE,
        null=True,
        blank=True,
        verbose_name=_("Type de commerçant"),
    )

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.CLIENT,
        db_index=True,
        verbose_name=_("Rôle"),
    )

    full_name = models.CharField(max_length=150, blank=True, verbose_name=_("Nom complet"))

    phone = models.CharField(max_length=30, unique=True, null=True, blank=True, verbose_name=_("Téléphone"))

    qr_code = models.CharField(max_length=100, unique=True, null=True, blank=True, verbose_name=_("Code QR"))

    # ✅ NOUVEAU: Matricule agent (AG + année + hex)
    agent_code = models.CharField(
        max_length=32,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        verbose_name=_("Matricule Agent"),
    )

    # -------------------------------------------------------------------------
    # Informations personnelles
    # -------------------------------------------------------------------------
    gender = models.CharField(max_length=10, choices=Genders.choices, null=True, blank=True, verbose_name=_("Genre"))

    date_of_birth = models.DateField(null=True, blank=True, verbose_name=_("Date de naissance"))

    nationality = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Nationalité"))

    job_title = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Profession"))

    # -------------------------------------------------------------------------
    # Pièce d'identité
    # -------------------------------------------------------------------------
    id_type = models.CharField(max_length=20, choices=IdTypes.choices, null=True, blank=True, verbose_name=_("Type de pièce d'identité"))
    id_number = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("Numéro de pièce"))
    id_issue_date = models.DateField(null=True, blank=True, verbose_name=_("Date d'émission"))
    id_expiry_date = models.DateField(null=True, blank=True, verbose_name=_("Date d'expiration"))
    id_no_expiry = models.BooleanField(default=False, verbose_name=_("Pas de date d'expiration"))
    id_document_name = models.CharField(max_length=200, null=True, blank=True, verbose_name=_("Nom du document"))

    # -------------------------------------------------------------------------
    # Adresse
    # -------------------------------------------------------------------------
    address_line = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("Adresse"))
    province = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Province"))
    commune = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Commune"))
    colline_or_quartier = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Colline/Quartier"))

    # -------------------------------------------------------------------------
    # Contact d'urgence
    # -------------------------------------------------------------------------
    emergency_contact_name = models.CharField(max_length=150, null=True, blank=True, verbose_name=_("Nom du contact d'urgence"))
    emergency_contact_phone = models.CharField(max_length=30, null=True, blank=True, verbose_name=_("Téléphone du contact d'urgence"))
    emergency_contact_relationship = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Relation avec le contact"))

    # -------------------------------------------------------------------------
    # Entreprise
    # -------------------------------------------------------------------------
    business_name = models.CharField(max_length=200, null=True, blank=True, verbose_name=_("Nom de l'entreprise"))
    business_entity_type = models.CharField(max_length=20, choices=BusinessEntityTypes.choices, null=True, blank=True, verbose_name=_("Type d'entité commerciale"))
    business_registration_number = models.CharField(max_length=100, null=True, blank=True, unique=True, verbose_name=_("Numéro d'immatriculation"))
    business_tax_id = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Numéro fiscal"))
    business_doc_expiry_date = models.DateField(null=True, blank=True, verbose_name=_("Date d'expiration des documents"))

    # -------------------------------------------------------------------------
    # Boutique
    # -------------------------------------------------------------------------
    boutique_type = models.CharField(max_length=20, choices=BoutiqueTypes.choices, null=True, blank=True, verbose_name=_("Type de boutique"))
    boutique_services = models.JSONField(default=list, null=True, blank=True, verbose_name=_("Services proposés"))

    # -------------------------------------------------------------------------
    # Livraison
    # -------------------------------------------------------------------------
    delivery_vehicle = models.CharField(max_length=20, choices=DeliveryVehicles.choices, null=True, blank=True, verbose_name=_("Véhicule de livraison"))
    vehicle_registration = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("Immatriculation du véhicule"))

    # -------------------------------------------------------------------------
    # Préférences client
    # -------------------------------------------------------------------------
    preferred_delivery_time = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Horaire de livraison préféré"))
    delivery_instructions = models.TextField(null=True, blank=True, verbose_name=_("Instructions de livraison"))

    # -------------------------------------------------------------------------
    # Paiement
    # -------------------------------------------------------------------------
    lumicash_msisdn = models.CharField(max_length=30, null=True, blank=True, verbose_name=_("Numéro Lumicash"))

    # -------------------------------------------------------------------------
    # Acceptations
    # -------------------------------------------------------------------------
    accepted_terms = models.BooleanField(default=False, verbose_name=_("Conditions générales acceptées"))
    accepted_contract = models.BooleanField(default=False, verbose_name=_("Contrat accepté"))

    # -------------------------------------------------------------------------
    # Médias
    # -------------------------------------------------------------------------
    photo = models.ImageField(upload_to="user_photos/%Y/%m/%d/", null=True, blank=True, verbose_name=_("Photo de profil"))
    signature = models.ImageField(upload_to="user_signatures/%Y/%m/%d/", null=True, blank=True, verbose_name=_("Signature"))

    # -------------------------------------------------------------------------
    # KYC & statuts
    # -------------------------------------------------------------------------
    kyc_status = models.CharField(
        max_length=20,
        default="pending",
        choices=[("pending", _("En attente")), ("verified", _("Vérifié")), ("rejected", _("Rejeté")), ("exempted", _("Exempté"))],
        db_index=True,
        verbose_name=_("Statut KYC"),
    )
    kyc_verified_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de vérification KYC"))

    account_status = models.CharField(
        max_length=20,
        default="active",
        choices=[("active", _("Actif")), ("pending_kyc", _("En attente KYC")), ("suspended", _("Suspendu")), ("deactivated", _("Désactivé"))],
        db_index=True,
        verbose_name=_("Statut du compte"),
    )

    last_login_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Dernière connexion"))

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Date de mise à jour"))

    # -------------------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------------------
    @staticmethod
    def _gen_agent_code() -> str:
        year = timezone.now().year
        return f"AG{year}{secrets.token_hex(3).upper()}"

    def save(self, *args, **kwargs):
        # QR only for livreur (existant)
        if not self.qr_code and self.account_type == self.AccountTypes.LIVREUR:
            self.qr_code = f"QR_{uuid.uuid4().hex[:16]}"

        # full_name (existant)
        if not self.full_name and (self.first_name or self.last_name):
            self.full_name = f"{self.first_name} {self.last_name}".strip()

        # ✅ Matricule Agent
        if self.role == self.Roles.AGENT and not self.agent_code:
            for _ in range(10):
                code = self._gen_agent_code()
                if not CustomUser.objects.filter(agent_code=code).exists():
                    self.agent_code = code
                    break

        super().save(*args, **kwargs)

    @property
    def display_name(self) -> str:
        return self.full_name or self.username or f"user#{self.pk}"

    def get_kyc_documents_required(self):
        required = []
        if self.account_type == self.AccountTypes.CLIENT:
            if self.id_type:
                required.append(self.get_id_type_display())
        elif self.account_type == self.AccountTypes.FOURNISSEUR:
            required.extend(["CNI/Passeport", "Certificat d'immatriculation"])
        elif self.account_type == self.AccountTypes.COMMERCANT:
            required.extend(["CNI/Passeport", "Permis de commerce"])
        elif self.account_type == self.AccountTypes.LIVREUR:
            required.extend(["CNI/Passeport", "Permis de conduire"])
        elif self.account_type in (self.AccountTypes.PARTENAIRE, self.AccountTypes.ENTREPRISE):
            required.extend(["CNI/Passeport", "Certificat d'immatriculation", "Contrat"])
        return required

    class Meta:
        verbose_name = _("Utilisateur")
        verbose_name_plural = _("Utilisateurs")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["account_type", "role"]),
            models.Index(fields=["kyc_status"]),
            models.Index(fields=["account_status"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
            models.Index(fields=["agent_code"]),
        ]


# =============================================================================
# DOCUMENTS UTILISATEUR
# =============================================================================
class UserDocument(models.Model):
    class DocumentTypes(models.TextChoices):
        ID_CARD = "id_card", _("Carte d'identité")
        PASSPORT = "passport", _("Passeport")
        DRIVING_LICENSE = "driving_license", _("Permis de conduire")
        BUSINESS_REGISTRATION = "business_registration", _("Certificat d'immatriculation")
        TAX_CERTIFICATE = "tax_certificate", _("Certificat fiscal")
        TRADE_LICENSE = "trade_license", _("Permis de commerce")
        PROOF_OF_ADDRESS = "proof_of_address", _("Justificatif de domicile")
        CONTRACT = "contract", _("Contrat")
        OTHER = "other", _("Autre")

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="documents", verbose_name=_("Utilisateur"))
    document_type = models.CharField(max_length=50, choices=DocumentTypes.choices, verbose_name=_("Type de document"))
    file = models.FileField(upload_to="user_documents/%Y/%m/%d/", verbose_name=_("Fichier"))

    file_name = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("Nom du fichier"))
    file_size = models.IntegerField(null=True, blank=True, verbose_name=_("Taille du fichier (KB)"))
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"))

    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de téléchargement"))

    verified = models.BooleanField(default=False, verbose_name=_("Vérifié"))
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de vérification"))

    expiry_date = models.DateField(null=True, blank=True, verbose_name=_("Date d'expiration"))
    verification_notes = models.TextField(null=True, blank=True, verbose_name=_("Notes de vérification"))

    @property
    def is_expired(self):
        if not self.expiry_date:
            return False
        return self.expiry_date < date.today()

    @property
    def days_until_expiry(self):
        if not self.expiry_date:
            return None
        delta = self.expiry_date - date.today()
        return delta.days if delta.days >= 0 else None

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = _("Document utilisateur")
        verbose_name_plural = _("Documents utilisateur")


# =============================================================================
# JOURNAL D'ACTIVITÉ
# =============================================================================
class UserActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_logs", verbose_name=_("Utilisateur"))
    action = models.CharField(max_length=100, verbose_name=_("Action"))
    details = models.JSONField(default=dict, verbose_name=_("Détails"))

    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name=_("Adresse IP"))
    user_agent = models.TextField(null=True, blank=True, verbose_name=_("User Agent"))

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Journal d'activité")
        verbose_name_plural = _("Journaux d'activité")
