# apps/drivers/serializers.py

from __future__ import annotations

import secrets
import string

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .models import Driver, DriverAvailability, DriverDocument, DriverPerformance
from .utils import DriverCodeGenerator

User = get_user_model()


def generate_strong_password(length: int = 12) -> str:
    """
    Génère un mot de passe fort:
    - au moins 1 minuscule, 1 majuscule, 1 chiffre
    - longueur >= 10 recommandée
    """
    length = max(10, int(length or 12))
    alphabet = string.ascii_letters + string.digits
    # base random
    pw = "".join(secrets.choice(alphabet) for _ in range(length))
    # s'assurer diversité minimale
    if not any(c.islower() for c in pw):
        pw = "a" + pw[1:]
    if not any(c.isupper() for c in pw):
        pw = "A" + pw[1:]
    if not any(c.isdigit() for c in pw):
        pw = "7" + pw[1:]
    return pw


# ========================= DOCUMENTS =========================
class DriverDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les documents des chauffeurs."""

    file_url = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True, allow_null=True)
    verified_by_username = serializers.CharField(source="verified_by.username", read_only=True)

    class Meta:
        model = DriverDocument
        fields = [
            "id",
            "driver",
            "document_type",
            "file",
            "file_url",
            "file_name",
            "description",
            "expiry_date",
            "is_verified",
            "verified_by",
            "verified_by_username",
            "verified_at",
            "notes",
            "uploaded_at",
            "is_expired",
            "days_until_expiry",
        ]
        read_only_fields = ["uploaded_at", "is_expired", "days_until_expiry"]

    def get_file_url(self, obj):
        if not obj.file:
            return None
        try:
            url = obj.file.url
        except Exception:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def validate(self, data):
        expiry_date = data.get("expiry_date")
        if expiry_date and expiry_date < timezone.now().date():
            raise serializers.ValidationError(
                {"expiry_date": "La date d'expiration ne peut pas être dans le passé."}
            )
        return data


# ========================= DISPONIBILITÉ =========================
class DriverAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer pour la disponibilité des chauffeurs."""

    driver_code = serializers.CharField(source="driver.driver_code", read_only=True)
    driver_name = serializers.CharField(source="driver.user.full_name", read_only=True)
    driver_status = serializers.CharField(source="driver.status", read_only=True)

    class Meta:
        model = DriverAvailability
        fields = [
            "id",
            "driver",
            "driver_code",
            "driver_name",
            "driver_status",
            "is_available",
            "location_lat",
            "location_lng",
            "last_location_update",
            "current_speed",
            "battery_level",
            "odometer",
            "next_maintenance",
            "last_updated",
        ]
        read_only_fields = ["last_updated"]

    def validate_location_lat(self, value):
        if value is not None and (value < -90 or value > 90):
            raise serializers.ValidationError("La latitude doit être entre -90 et 90.")
        return value

    def validate_location_lng(self, value):
        if value is not None and (value < -180 or value > 180):
            raise serializers.ValidationError("La longitude doit être entre -180 et 180.")
        return value


# ========================= PERFORMANCE =========================
class DriverPerformanceSerializer(serializers.ModelSerializer):
    """Serializer pour les performances des chauffeurs."""

    driver_code = serializers.CharField(source="driver.driver_code", read_only=True)
    driver_name = serializers.CharField(source="driver.user.full_name", read_only=True)
    total_volume = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_activities = serializers.IntegerField(read_only=True)
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = DriverPerformance
        fields = [
            "id",
            "driver",
            "driver_code",
            "driver_name",
            "period_start",
            "period_end",
            "collections_count",
            "collections_volume",
            "deliveries_count",
            "deliveries_volume",
            "distance_traveled",
            "fuel_consumption",
            "earnings",
            "commission",
            "rating",
            "incidents",
            "complaints",
            "efficiency_score",
            "notes",
            "calculated_at",
            "total_volume",
            "total_activities",
            "total_earnings",
        ]
        read_only_fields = ["calculated_at"]


# ========================= DRIVER (MODEL SERIALIZER) =========================
class DriverSerializer(serializers.ModelSerializer):
    # ------------------ CHAMPS UTILISATEUR ------------------
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    qr_code = serializers.CharField(source="user.qr_code", read_only=True)

    # ------------------ CHAMPS CALCULÉS ------------------
    is_available = serializers.BooleanField(read_only=True)
    license_is_valid = serializers.BooleanField(read_only=True)
    insurance_is_valid = serializers.BooleanField(read_only=True)
    performance_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    # ------------------ RELATIONS ------------------
    availability = DriverAvailabilitySerializer(read_only=True)
    documents = DriverDocumentSerializer(many=True, read_only=True)
    latest_performance = serializers.SerializerMethodField()

    # ------------------ CHAMP ÉTENDU ------------------
    # NOTE: on garde account_type="livreur" ici pour compatibilité,
    # mais l'affichage du rôle est corrigé via role="chauffeur" à la création.
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(account_type="livreur"),
        write_only=True,
        source="user",
        required=False,
    )

    class Meta:
        model = Driver
        fields = [
            "id",
            "driver_code",
            "user_id",
            "username",
            "full_name",
            "phone",
            "email",
            "qr_code",
            "transport_mode",
            "can_be_pdv",
            "status",
            "license_number",
            "license_expiry",
            "vehicle_type",
            "vehicle_registration",
            "insurance_number",
            "insurance_expiry",
            "hire_date",
            "base_salary",
            "commission_rate",
            "assigned_zone",
            "max_capacity",
            "notes",
            "is_verified",
            "verification_date",
            "created_at",
            "updated_at",
            "is_available",
            "license_is_valid",
            "insurance_is_valid",
            "performance_score",
            "availability",
            "documents",
            "latest_performance",
        ]
        read_only_fields = [
            "created_at",
            "updated_at",
            "driver_code",
            "verification_date",
            "is_available",
            "license_is_valid",
            "insurance_is_valid",
            "performance_score",
            "availability",
            "documents",
            "latest_performance",
        ]

    def validate_user_id(self, value):
        # On garde la contrainte "livreur" côté account_type si ton système l'utilise déjà.
        if getattr(value, "account_type", None) != "livreur":
            raise serializers.ValidationError("L'utilisateur doit être de type 'livreur' (compte technique chauffeur).")

        if Driver.objects.filter(user=value).exists():
            raise serializers.ValidationError("Un chauffeur existe déjà pour cet utilisateur")

        return value

    def validate_transport_mode(self, value):
        valid_modes = dict(Driver.MODES).keys() if hasattr(Driver, "MODES") else []
        if valid_modes and value not in valid_modes:
            raise serializers.ValidationError(
                f"Mode de transport invalide. Choisissez parmi: {', '.join(valid_modes)}"
            )
        return value

    def validate_commission_rate(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Le taux de commission doit être entre 0 et 100%")
        return value

    def validate_max_capacity(self, value):
        if value < 0:
            raise serializers.ValidationError("La capacité maximale ne peut pas être négative")
        return value

    def get_latest_performance(self, obj):
        performance = obj.performances.order_by("-period_end").first()
        return DriverPerformanceSerializer(performance).data if performance else None


# ========================= DRIVER CREATE (FULL FLOW) =========================
class DriverCreateSerializer(serializers.Serializer):
    """
    Serializer pour la création complète d'un chauffeur.
    Inclut la création de l'utilisateur et du chauffeur.
    """

    # ------------------ Informations utilisateur ------------------
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=30, required=True)
    full_name = serializers.CharField(max_length=150, required=True)

    # ✅ password peut être omis: on le génère
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # ------------------ Informations chauffeur ------------------
    transport_mode = serializers.ChoiceField(
        choices=Driver.MODES,
        default="vehicule",
        required=False,
    )

    license_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    license_expiry = serializers.DateField(required=False, allow_null=True)
    vehicle_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    vehicle_registration = serializers.CharField(max_length=50, required=False, allow_blank=True)
    insurance_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    insurance_expiry = serializers.DateField(required=False, allow_null=True)

    hire_date = serializers.DateField(required=False, default=timezone.localdate)

    base_salary = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        default=0,
        min_value=0,
    )

    commission_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        default=0,
        min_value=0,
        max_value=100,
    )

    assigned_zone = serializers.CharField(max_length=100, required=False, allow_blank=True)

    max_capacity = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        default=0,
        min_value=0,
    )

    notes = serializers.CharField(required=False, allow_blank=True)
    can_be_pdv = serializers.BooleanField(required=False, default=False)

    class Meta:
        fields = [
            "username",
            "email",
            "phone",
            "full_name",
            "password",
            "confirm_password",
            "transport_mode",
            "license_number",
            "license_expiry",
            "vehicle_type",
            "vehicle_registration",
            "insurance_number",
            "insurance_expiry",
            "hire_date",
            "base_salary",
            "commission_rate",
            "assigned_zone",
            "max_capacity",
            "notes",
            "can_be_pdv",
        ]

    def validate(self, data):
        # ✅ Si password non fourni -> génération
        pw = (data.get("password") or "").strip()
        cpw = (data.get("confirm_password") or "").strip()

        if not pw and not cpw:
            generated = generate_strong_password(12)
            data["password"] = generated
            data["confirm_password"] = generated
        else:
            if not pw:
                raise serializers.ValidationError({"password": "Mot de passe requis (ou laisser vide pour génération automatique)."})
            if not cpw:
                raise serializers.ValidationError({"confirm_password": "Confirmation requise."})
            if pw != cpw:
                raise serializers.ValidationError({"confirm_password": "Les mots de passe ne correspondent pas."})

        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError({"username": "Ce nom d'utilisateur est déjà utilisé."})

        if User.objects.filter(phone=data["phone"]).exists():
            raise serializers.ValidationError({"phone": "Ce numéro de téléphone est déjà utilisé."})

        email = (data.get("email") or "").strip()
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Cet email est déjà utilisé."})

        today = timezone.localdate()

        if data.get("license_expiry") and data["license_expiry"] < today:
            raise serializers.ValidationError(
                {"license_expiry": "La date d'expiration du permis ne peut pas être dans le passé."}
            )

        if data.get("insurance_expiry") and data["insurance_expiry"] < today:
            raise serializers.ValidationError(
                {"insurance_expiry": "La date d'expiration de l'assurance ne peut pas être dans le passé."}
            )

        if data.get("hire_date") and data["hire_date"] > today:
            raise serializers.ValidationError({"hire_date": "La date d'embauche ne peut pas être dans le futur."})

        return data

    def create(self, validated_data):
        """
        IMPORTANT:
        - On garde account_type="livreur" si ton système actuel repose dessus.
        - MAIS on corrige le champ role pour l'affichage dans la liste utilisateurs.
        """
        # 1) Créer l'utilisateur
        user = User.objects.create_user(
            username=validated_data["username"],
            email=(validated_data.get("email") or "").strip() or None,
            phone=validated_data["phone"],
            full_name=validated_data["full_name"],
            account_type="livreur",   # ✅ compat
            role="chauffeur",         # ✅ FIX
            password=validated_data["password"],
            accepted_terms=True,
        )

        # 2) Créer le chauffeur
        driver = Driver.objects.create(
            user=user,
            driver_code=DriverCodeGenerator.generate_unique_driver_code(),
            transport_mode=validated_data.get("transport_mode", "vehicule"),
            license_number=validated_data.get("license_number", "") or "",
            license_expiry=validated_data.get("license_expiry"),
            vehicle_type=validated_data.get("vehicle_type", "") or "",
            vehicle_registration=validated_data.get("vehicle_registration", "") or "",
            insurance_number=validated_data.get("insurance_number", "") or "",
            insurance_expiry=validated_data.get("insurance_expiry"),
            hire_date=validated_data.get("hire_date") or timezone.localdate(),
            base_salary=validated_data.get("base_salary", 0),
            commission_rate=validated_data.get("commission_rate", 0),
            assigned_zone=validated_data.get("assigned_zone", "") or "",
            max_capacity=validated_data.get("max_capacity", 0),
            notes=validated_data.get("notes", "") or "",
            can_be_pdv=validated_data.get("can_be_pdv", False),
            is_verified=True,
            verification_date=timezone.now(),
        )

        # 3) Garantir availability
        DriverAvailability.objects.get_or_create(driver=driver)

        return driver

    def to_representation(self, instance):
        return DriverSerializer(instance, context=self.context).data
