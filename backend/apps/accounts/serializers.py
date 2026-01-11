# ========================= apps/accounts/serializers.py =========================
from __future__ import annotations

from datetime import date
import json
from typing import Any, Optional
import re  # AJOUT IMPORTANT
import secrets

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import MultipleObjectsReturned
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserDocument

User = get_user_model()


# ========================= HELPERS =========================
def _last_value(v: Any) -> Any:
    if isinstance(v, (list, tuple)) and v:
        return v[-1]
    return v


def _to_bool(v: Any) -> Optional[bool]:
    v = _last_value(v)
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return bool(v)
    if isinstance(v, str):
        s = v.strip().lower()
        if s in ("true", "1", "yes", "y", "on"):
            return True
        if s in ("false", "0", "no", "n", "off", ""):
            return False
    return None


def _normalize_phone(value: str) -> str:
    if not value:
        return ""
    cleaned = str(value).strip()
    digits = "".join(ch for ch in cleaned if ch.isdigit())
    # retire le prefix pays si déjà fourni
    if digits.startswith("257") and len(digits) >= 11:
        digits = digits[3:]
    return digits


# FONCTIONS MANQUANTES AJOUTÉES
def _looks_like_phone(value: str) -> bool:
    """
    Vérifie si la chaîne ressemble à un numéro de téléphone.
    """
    if not value:
        return False
    # Supprime tous les caractères non numériques
    digits = re.sub(r'\D', '', value)
    return len(digits) >= 8 and len(digits) <= 15


def _burundi_phone_prefix_ok(digits: str) -> bool:
    """
    Vérifie si le numéro commence par un préfixe burundais valide.
    """
    if not digits:
        return False
    burundi_prefixes = [
        "61", "62", "65", "66", "67", "68", "69",
        "71", "72", "76", "77", "78", "79", "60", "63"
    ]
    return any(digits.startswith(prefix) for prefix in burundi_prefixes)


def _issue_tokens(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


# ========================= FILE VALIDATION =========================
ALLOWED_DOC_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"}
ALLOWED_DOC_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}


def _get_extension(filename: str) -> str:
    if not filename:
        return ""
    name = filename.lower().strip()
    if "." not in name:
        return ""
    return "." + name.split(".")[-1]


def validate_upload_file(
    f,
    *,
    field_name: str,
    max_mb: int = 10,
    allow_pdf: bool = True,
    allow_images: bool = True,
):
    if not f:
        return

    size_ok = getattr(f, "size", 0) <= max_mb * 1024 * 1024
    if not size_ok:
        raise serializers.ValidationError(
            {field_name: _("La taille du fichier ne doit pas dépasser %(max)sMB") % {"max": max_mb}}
        )

    content_type = getattr(f, "content_type", None)
    filename = getattr(f, "name", "") or ""
    ext = _get_extension(filename)

    allowed_by_mime = content_type in ALLOWED_DOC_MIME_TYPES if content_type else False
    allowed_by_ext = ext in ALLOWED_DOC_EXTENSIONS if ext else False

    if not (allowed_by_mime or allowed_by_ext):
        raise serializers.ValidationError({field_name: _("Format invalide. Formats acceptés: JPG, PNG, WEBP, PDF")})

    if not allow_pdf and (content_type == "application/pdf" or ext == ".pdf"):
        raise serializers.ValidationError({field_name: _("PDF non autorisé pour ce champ.")})

    if not allow_images and (content_type and content_type.startswith("image/")):
        raise serializers.ValidationError({field_name: _("Image non autorisée pour ce champ.")})


# ========================= ACCOUNT LABELS =========================
def _account_type_label(obj) -> Optional[str]:
    try:
        return obj.get_account_type_display()
    except Exception:
        return getattr(obj, "account_type", None)


def _account_category_value(obj) -> Optional[str]:
    t = getattr(obj, "account_type", None)
    if t == "client":
        return getattr(obj, "client_type", None)
    if t == "fournisseur":
        return getattr(obj, "supplier_type", None)
    if t == "livreur":
        return getattr(obj, "delivery_type", None)
    if t == "commercant":
        return getattr(obj, "merchant_type", None) or getattr(obj, "boutique_type", None)
    return None


def _account_category_label(obj) -> Optional[str]:
    t = getattr(obj, "account_type", None)
    try:
        if t == "client" and getattr(obj, "client_type", None):
            return obj.get_client_type_display()
        if t == "fournisseur" and getattr(obj, "supplier_type", None):
            return obj.get_supplier_type_display()
        if t == "livreur" and getattr(obj, "delivery_type", None):
            return obj.get_delivery_type_display()
        if t == "commercant":
            if getattr(obj, "merchant_type", None):
                return obj.get_merchant_type_display()
            if getattr(obj, "boutique_type", None):
                return obj.get_boutique_type_display()
    except Exception:
        pass
    return _account_category_value(obj)


def _force_admin_role_if_needed(obj, rep: dict) -> dict:
    try:
        if getattr(obj, "is_superuser", False) or getattr(obj, "is_staff", False):
            rep["role"] = "admin"
    except Exception:
        pass
    return rep


# ========================= USER SERIALIZERS =========================
class UserSerializer(serializers.ModelSerializer):
    account_type_label = serializers.SerializerMethodField(read_only=True)
    account_category = serializers.SerializerMethodField(read_only=True)
    account_category_label = serializers.SerializerMethodField(read_only=True)

    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    groups = serializers.SerializerMethodField(read_only=True)

    agent_code = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "phone",
            "account_type",
            "account_type_label",
            "account_category",
            "account_category_label",
            "role",
            "client_type",
            "supplier_type",
            "delivery_type",
            "merchant_type",
            "kyc_status",
            "account_status",
            "last_login_at",
            "created_at",
            "updated_at",
            "agent_code",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
        ]
        read_only_fields = [
            "id",
            "last_login_at",
            "created_at",
            "updated_at",
            "kyc_status",
            "account_status",
            "account_type_label",
            "account_category",
            "account_category_label",
            "agent_code",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
        ]

    def get_account_type_label(self, obj):
        return _account_type_label(obj)

    def get_account_category(self, obj):
        return _account_category_value(obj)

    def get_account_category_label(self, obj):
        return _account_category_label(obj)

    def get_groups(self, obj):
        try:
            return list(obj.groups.values_list("name", flat=True))
        except Exception:
            return []

    def get_agent_code(self, obj):
        return getattr(obj, "agent_code", None)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        return _force_admin_role_if_needed(instance, rep)


# ========================= ✅ ADMIN WRITE SERIALIZER (CRUD admin/users) =========================
class AdminUserWriteSerializer(serializers.ModelSerializer):
    """
    Serializer utilisé pour CREATE/PATCH via /admin/users/
    - Ne permet pas de créer/modifier un admin/staff/superuser via cet endpoint
    - Si password non fourni => mot de passe temporaire (create)
    """
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "phone",
            "role",
            "account_type",
            "is_active",
            "password",
        ]
        read_only_fields = ["id"]

    def validate_role(self, value):
        v = (value or "").strip().lower();
        if v == "admin":
            raise serializers.ValidationError(_("Impossible de créer/modifier un admin via cet endpoint."))
        return value

    def validate_username(self, value):
        v = (value or "").strip()
        if not v:
            raise serializers.ValidationError(_("Le nom d'utilisateur est requis."))
        qs = User.objects.filter(username__iexact=v)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(_("Ce nom d'utilisateur existe déjà."))
        return v

    def validate_email(self, value):
        v = (value or "").strip()
        if not v:
            return ""
        qs = User.objects.filter(email__iexact=v)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(_("Cet email est déjà utilisé."))
        return v

    def validate_phone(self, value):
        # ✅ garde ton système existant si tu l'as
        if not value:
            return value

        # si tes helpers existent, on les utilise
        try:
            cleaned = _normalize_phone(value)
            if not _burundi_phone_prefix_ok(cleaned):
                raise serializers.ValidationError(_("Numéro burundais invalide."))
        except NameError:
            # fallback safe si helpers absents
            cleaned = str(value).strip()

        qs = User.objects.filter(phone=cleaned)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(_("Ce numéro de téléphone est déjà utilisé."))
        return cleaned

    def create(self, validated_data):
        password = (validated_data.pop("password", "") or "").strip()

        # ✅ sécurité: jamais staff/superuser via API admin users
        validated_data["is_staff"] = False
        validated_data["is_superuser"] = False

        user = User(**validated_data)

        if password:
            user.set_password(password)
        else:
            tmp = secrets.token_urlsafe(10)
            user.set_password(tmp)

        user.save()
        return user

    def update(self, instance, validated_data):
        password = (validated_data.pop("password", "") or "").strip()

        # ✅ blocage dur: pas de staff/superuser même en PATCH
        validated_data.pop("is_staff", None)
        validated_data.pop("is_superuser", None)

        # ✅ blocage dur: pas de role admin
        role = validated_data.get("role")
        if role and str(role).strip().lower() == "admin":
            raise serializers.ValidationError({"role": _("Impossible de promouvoir admin ici.")})

        for attr, val in validated_data.items():
            setattr(instance, attr, val)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class UserDocumentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)

    is_expired = serializers.SerializerMethodField(read_only=True)
    days_until_expiry = serializers.SerializerMethodField(read_only=True)

    file_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserDocument
        fields = [
            "id",
            "user",
            "user_username",
            "user_full_name",
            "document_type",
            "file",
            "file_url",
            "file_name",
            "file_size",
            "description",
            "uploaded_at",
            "verified",
            "verified_at",
            "expiry_date",
            "verification_notes",
            "is_expired",
            "days_until_expiry",
        ]
        read_only_fields = [
            "user",
            "verified",
            "verified_at",
            "uploaded_at",
            "file_size",
            "file_url",
            "is_expired",
            "days_until_expiry",
        ]

    def get_file_url(self, obj):
        if not obj.file:
            return None
        try:
            url = obj.file.url
        except Exception:
            return None

        if isinstance(url, str) and url.startswith(("http://", "https://")):
            return url

        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_is_expired(self, obj):
        exp = getattr(obj, "expiry_date", None)
        if not exp:
            return False
        try:
            today = timezone.localdate()
        except Exception:
            today = date.today()
        return exp < today

    def get_days_until_expiry(self, obj):
        exp = getattr(obj, "expiry_date", None)
        if not exp:
            return None
        try:
            today = timezone.localdate()
        except Exception:
            today = date.today()
        return (exp - today).days

    def validate(self, attrs):
        valid_types = [c[0] for c in UserDocument.DocumentTypes.choices]
        if attrs.get("document_type") not in valid_types:
            raise serializers.ValidationError({"document_type": _("Type de document invalide.")})

        f = attrs.get("file")
        if f:
            validate_upload_file(f, field_name="file", max_mb=10, allow_images=True, allow_pdf=True)
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user

        f = validated_data.get("file")
        if f:
            validated_data["file_size"] = (getattr(f, "size", 0) // 1024) if getattr(f, "size", None) else None
            if not validated_data.get("file_name"):
                validated_data["file_name"] = getattr(f, "name", "") or None

        return super().create(validated_data)


class UserDetailSerializer(serializers.ModelSerializer):
    documents = UserDocumentSerializer(many=True, read_only=True)
    photo_url = serializers.SerializerMethodField(read_only=True)
    signature_url = serializers.SerializerMethodField(read_only=True)

    account_type_label = serializers.SerializerMethodField(read_only=True)
    account_category = serializers.SerializerMethodField(read_only=True)
    account_category_label = serializers.SerializerMethodField(read_only=True)

    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    groups = serializers.SerializerMethodField(read_only=True)

    agent_code = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "gender",
            "date_of_birth",
            "nationality",
            "job_title",
            "account_type",
            "account_type_label",
            "account_category",
            "account_category_label",
            "client_type",
            "supplier_type",
            "delivery_type",
            "merchant_type",
            "role",
            "id_type",
            "id_number",
            "id_issue_date",
            "id_expiry_date",
            "id_no_expiry",
            "id_document_name",
            "address_line",
            "province",
            "commune",
            "colline_or_quartier",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relationship",
            "business_name",
            "business_entity_type",
            "business_registration_number",
            "business_tax_id",
            "business_doc_expiry_date",
            "boutique_type",
            "boutique_services",
            "delivery_vehicle",
            "vehicle_registration",
            "preferred_delivery_time",
            "delivery_instructions",
            "lumicash_msisdn",
            "accepted_terms",
            "accepted_contract",
            "photo",
            "photo_url",
            "signature",
            "signature_url",
            "qr_code",
            "kyc_status",
            "kyc_verified_at",
            "account_status",
            "last_login_at",
            "created_at",
            "updated_at",
            "documents",
            "agent_code",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
        ]
        read_only_fields = [
            "id",
            "qr_code",
            "kyc_status",
            "kyc_verified_at",
            "account_status",
            "last_login_at",
            "created_at",
            "updated_at",
            "documents",
            "photo_url",
            "signature_url",
            "account_type_label",
            "account_category",
            "account_category_label",
            "agent_code",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
        ]

    def _abs_media_url(self, file_field):
        if not file_field:
            return None
        try:
            url = file_field.url
        except Exception:
            return None

        if isinstance(url, str) and url.startswith(("http://", "https://")):
            return url

        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_photo_url(self, obj):
        return self._abs_media_url(getattr(obj, "photo", None))

    def get_signature_url(self, obj):
        return self._abs_media_url(getattr(obj, "signature", None))

    def get_account_type_label(self, obj):
        return _account_type_label(obj)

    def get_account_category(self, obj):
        return _account_category_value(obj)

    def get_account_category_label(self, obj):
        return _account_category_label(obj)

    def get_groups(self, obj):
        try:
            return list(obj.groups.values_list("name", flat=True))
        except Exception:
            return []

    def get_agent_code(self, obj):
        return getattr(obj, "agent_code", None)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        return _force_admin_role_if_needed(instance, rep)


# ========================= ✅ ADMIN: CREATE AGENT SERIALIZER =========================
class AgentCreateSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    full_name = serializers.CharField(required=False, allow_blank=True, default="")
    phone = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True, default="")

    password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})
    confirm_password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})

    def validate(self, attrs):
        username = (attrs.get("username") or "").strip()
        phone = attrs.get("phone") or ""
        email = (attrs.get("email") or "").strip()

        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": _("Les mots de passe ne correspondent pas.")})

        if not username:
            raise serializers.ValidationError({"username": _("Le nom d'utilisateur est requis.")})

        cleaned = _normalize_phone(phone)
        if not _burundi_phone_prefix_ok(cleaned):
            raise serializers.ValidationError({"phone": _("Numéro burundais invalide.")})
        attrs["phone"] = cleaned

        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": _("Ce nom d'utilisateur existe déjà.")})

        if cleaned and User.objects.filter(phone=cleaned).exists():
            raise serializers.ValidationError({"phone": _("Ce numéro de téléphone est déjà utilisé.")})

        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": _("Cet email est déjà utilisé.")})

        attrs["username"] = username
        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password")

        roles = getattr(User, "Roles", None)
        role_agent = getattr(roles, "AGENT", "agent") if roles else "agent"

        user = User(
            username=validated_data["username"],
            full_name=(validated_data.get("full_name") or "").strip(),
            phone=validated_data["phone"],
            email=(validated_data.get("email") or "").strip(),
            role=role_agent,
            account_type="client",
            is_active=True,
            accepted_terms=True,
        )
        user.set_password(password)
        user.save()
        return user


# ========================= AUTH SERIALIZERS =========================
class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=False, style={"input_type": "password"})
    password2 = serializers.CharField(write_only=True, required=False, style={"input_type": "password"})

    id_front_image = serializers.FileField(required=False, write_only=True, allow_null=True)
    id_back_image = serializers.FileField(required=False, write_only=True, allow_null=True)
    passport_photo = serializers.FileField(required=False, write_only=True, allow_null=True)
    other_doc_image = serializers.FileField(required=False, write_only=True, allow_null=True)
    proof_of_address = serializers.FileField(required=False, write_only=True, allow_null=True)
    business_document = serializers.FileField(required=False, write_only=True, allow_null=True)
    boutique_document = serializers.FileField(required=False, write_only=True, allow_null=True)

    signature = serializers.ImageField(required=False, write_only=True, allow_null=True)
    photo = serializers.ImageField(required=False, write_only=True, allow_null=True)

    boutique_services_input = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "account_type",
            "role",
            "client_type",
            "supplier_type",
            "delivery_type",
            "merchant_type",
            "username",
            "email",
            "password",
            "confirm_password",
            "password2",
            "full_name",
            "phone",
            "gender",
            "date_of_birth",
            "nationality",
            "job_title",
            "id_type",
            "id_number",
            "id_issue_date",
            "id_expiry_date",
            "id_no_expiry",
            "id_document_name",
            "address_line",
            "province",
            "commune",
            "colline_or_quartier",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relationship",
            "business_name",
            "business_entity_type",
            "business_registration_number",
            "business_tax_id",
            "business_doc_expiry_date",
            "boutique_type",
            "boutique_services",
            "boutique_services_input",
            "delivery_vehicle",
            "vehicle_registration",
            "preferred_delivery_time",
            "delivery_instructions",
            "lumicash_msisdn",
            "accepted_terms",
            "accepted_contract",
            "id_front_image",
            "id_back_image",
            "passport_photo",
            "other_doc_image",
            "proof_of_address",
            "business_document",
            "boutique_document",
            "photo",
            "signature",
            "id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": True,
                "validators": [validate_password],
                "style": {"input_type": "password"},
            },
            "account_type": {"required": True},
            "accepted_terms": {"required": True},
            "username": {"required": True, "validators": [UniqueValidator(queryset=User.objects.all())]},
            "phone": {"required": True, "validators": [UniqueValidator(queryset=User.objects.all())]},
            "email": {"required": False, "allow_blank": True, "validators": [UniqueValidator(queryset=User.objects.all())]},
            "gender": {"required": False, "allow_null": True, "allow_blank": True},
            "date_of_birth": {"required": False, "allow_null": True},
        }

    def validate(self, attrs):
        for key in (
            "role",
            "account_type",
            "client_type",
            "supplier_type",
            "delivery_type",
            "merchant_type",
            "boutique_type",
            "business_entity_type",
            "delivery_vehicle",
            "id_type",
        ):
            if key in attrs:
                attrs[key] = _last_value(attrs[key])

        if "accepted_terms" in attrs:
            attrs["accepted_terms"] = bool(_to_bool(attrs["accepted_terms"]))
        if "accepted_contract" in attrs:
            b = _to_bool(attrs["accepted_contract"])
            attrs["accepted_contract"] = bool(b) if b is not None else False
        if "id_no_expiry" in attrs:
            b = _to_bool(attrs["id_no_expiry"])
            attrs["id_no_expiry"] = bool(b) if b is not None else False

        if "password2" in attrs and "confirm_password" not in attrs:
            attrs["confirm_password"] = attrs["password2"]
        if "confirm_password" in attrs and "password2" not in attrs:
            attrs["password2"] = attrs["confirm_password"]

        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")
        if not confirm_password:
            raise serializers.ValidationError({"confirm_password": _("La confirmation du mot de passe est requise.")})
        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError({"confirm_password": _("Les mots de passe ne correspondent pas.")})

        account_type = str(attrs.get("account_type") or "").strip()

        # ✅ IMPORTANT: bloquer comptes internes à l'inscription (mais LIVREUR = cas spécial)
        if account_type == "partenaire":
            raise serializers.ValidationError({"account_type": _("Ce type de compte n'est pas autorisé à l'inscription.")})

        # ✅ RÈGLE LIVREUR:
        # - livreur simple (indépendant) => autorisé via formulaire
        # - livreur employé/chauffeur(driver) => doit être créé par admin
        if account_type == "livreur":
            delivery_type = str(attrs.get("delivery_type") or "").strip().lower()
            employee_markers = {
                "employee", "employe", "company", "company_employee",
                "driver", "driver_employee", "chauffeur", "chauffeur_employee"
            }
            if delivery_type in employee_markers:
                raise serializers.ValidationError(
                    {"delivery_type": _("Un livreur employé/chauffeur doit être enregistré par un admin (staff/superuser).")}
                )

        role = str(attrs.get("role") or "").strip().lower()
        if role == "agent":
            raise serializers.ValidationError({"role": _("Le rôle 'agent' n'est pas autorisé à l'inscription.")})

        phone = attrs.get("phone")
        if phone:
            cleaned = _normalize_phone(phone)
            if not _burundi_phone_prefix_ok(cleaned):
                raise serializers.ValidationError({"phone": _("Numéro burundais invalide.")})
            attrs["phone"] = cleaned

        boutique_services_input = attrs.pop("boutique_services_input", None)
        if boutique_services_input is not None:
            bs = _last_value(boutique_services_input)
            if isinstance(bs, str) and bs.strip():
                try:
                    parsed = json.loads(bs)
                    attrs["boutique_services"] = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    attrs["boutique_services"] = [bs]

        if "boutique_services" in attrs and isinstance(attrs["boutique_services"], str):
            raw = _last_value(attrs["boutique_services"])
            if isinstance(raw, str) and raw.strip():
                try:
                    parsed = json.loads(raw)
                    attrs["boutique_services"] = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    attrs["boutique_services"] = [raw]

        if not attrs.get("role"):
            roles = getattr(User, "Roles", None)
            role_mapping = {
                "client": getattr(roles, "CLIENT", "client") if roles else "client",
                "fournisseur": getattr(roles, "FOURNISSEUR", "fournisseur") if roles else "fournisseur",
                "commercant": getattr(roles, "COMMERCANT", "commercant") if roles else "commercant",
                "entreprise": getattr(roles, "PARTENAIRE", "partenaire") if roles else "partenaire",
                "livreur": getattr(roles, "LIVREUR", "livreur") if roles else "livreur",
            }
            attrs["role"] = role_mapping.get(account_type, getattr(roles, "CLIENT", "client") if roles else "client")

        if account_type == "client" and attrs.get("date_of_birth"):
            birth = attrs["date_of_birth"]
            if isinstance(birth, str):
                try:
                    birth = date.fromisoformat(birth)
                except ValueError:
                    raise serializers.ValidationError({"date_of_birth": _("Format de date invalide (YYYY-MM-DD).")})
            today = date.today()
            age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
            if age < 18:
                raise serializers.ValidationError({"date_of_birth": _("Vous devez avoir au moins 18 ans.")})

        if not attrs.get("accepted_terms"):
            raise serializers.ValidationError({"accepted_terms": _("Vous devez accepter les conditions générales.")})

        for fkey in (
            "id_front_image",
            "id_back_image",
            "passport_photo",
            "other_doc_image",
            "proof_of_address",
            "business_document",
            "boutique_document",
        ):
            f = attrs.get(fkey)
            if f:
                validate_upload_file(f, field_name=fkey, max_mb=10, allow_images=True, allow_pdf=True)

        # ✅ Règles business existantes (inchangées)
        if account_type == "fournisseur":
            supplier_type = attrs.get("supplier_type")
            is_supplier_company = str(supplier_type or "") == "entreprise"
            if is_supplier_company:
                if not attrs.get("business_name"):
                    raise serializers.ValidationError({"business_name": _("Le nom de l'entreprise est requis.")})
                if not attrs.get("business_entity_type"):
                    raise serializers.ValidationError({"business_entity_type": _("Le type d'entité commerciale est requis.")})
                if not attrs.get("business_registration_number"):
                    raise serializers.ValidationError({"business_registration_number": _("Le numéro d'enregistrement est requis.")})
                if not attrs.get("accepted_contract"):
                    raise serializers.ValidationError({"accepted_contract": _("Vous devez accepter le contrat de partenariat.")})
                if not attrs.get("business_document"):
                    raise serializers.ValidationError({"business_document": _("Le document d'entreprise est requis.")})

        if account_type == "commercant":
            if not attrs.get("business_name"):
                raise serializers.ValidationError({"business_name": _("Le nom commercial de la boutique est requis.")})
            if not attrs.get("boutique_type"):
                raise serializers.ValidationError({"boutique_type": _("Le type de boutique est requis.")})
            services = attrs.get("boutique_services")
            if not services or not isinstance(services, list) or len(services) == 0:
                raise serializers.ValidationError({"boutique_services": _("Sélectionnez au moins un service.")})
            if not attrs.get("boutique_document"):
                raise serializers.ValidationError({"boutique_document": _("Le document d'agrément de la boutique est requis.")})

        if account_type == "entreprise":
            if not attrs.get("accepted_contract"):
                raise serializers.ValidationError({"accepted_contract": _("Vous devez accepter le contrat SeaSky (obligatoire).")})

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        validated_data.pop("password2", None)

        id_front = validated_data.pop("id_front_image", None)
        id_back = validated_data.pop("id_back_image", None)
        passport_photo = validated_data.pop("passport_photo", None)
        other_doc_image = validated_data.pop("other_doc_image", None)
        proof_of_address = validated_data.pop("proof_of_address", None)
        business_document = validated_data.pop("business_document", None)
        boutique_document = validated_data.pop("boutique_document", None)
        signature = validated_data.pop("signature", None)
        photo = validated_data.pop("photo", None)

        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)

        user.kyc_status = "pending"
        user.account_status = "active"

        if photo:
            user.photo = photo
        if signature:
            user.signature = signature

        user.save()

        def create_document(doc_file, doc_type, description, expiry_date=None):
            if not doc_file:
                return None
            return UserDocument.objects.create(
                user=user,
                document_type=doc_type,
                file=doc_file,
                file_name=getattr(doc_file, "name", None) or description.lower().replace(" ", "_"),
                file_size=(getattr(doc_file, "size", 0) // 1024) if getattr(doc_file, "size", None) else None,
                description=description,
                expiry_date=expiry_date,
            )

        if id_front:
            create_document(id_front, UserDocument.DocumentTypes.ID_CARD, "Carte d'identité - Recto", getattr(user, "id_expiry_date", None))
        if id_back:
            create_document(id_back, UserDocument.DocumentTypes.ID_CARD, "Carte d'identité - Verso", getattr(user, "id_expiry_date", None))
        if passport_photo:
            create_document(passport_photo, UserDocument.DocumentTypes.PASSPORT, "Passeport", getattr(user, "id_expiry_date", None))
        if other_doc_image:
            create_document(other_doc_image, UserDocument.DocumentTypes.OTHER, "Autre document d'identité", getattr(user, "id_expiry_date", None))
        if proof_of_address:
            create_document(proof_of_address, UserDocument.DocumentTypes.PROOF_OF_ADDRESS, "Justificatif de domicile")
        if business_document:
            create_document(business_document, UserDocument.DocumentTypes.BUSINESS_REGISTRATION, "Document d'entreprise", getattr(user, "business_doc_expiry_date", None))
        if boutique_document:
            create_document(boutique_document, UserDocument.DocumentTypes.TRADE_LICENSE, "Document de boutique")

        return user

    def to_representation(self, instance):
        rep_user = UserSerializer(instance, context=self.context).data
        tokens = _issue_tokens(instance)
        return {"success": True, "message": _("✅ Inscription réussie !"), "user": rep_user, "tokens": tokens}


# ========================= LOGIN SERIALIZER CORRIGÉ =========================
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, help_text=_("Nom d'utilisateur / email / téléphone"))
    password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})

    def validate(self, attrs):
        request = self.context.get("request")
        identifier = (attrs.get("username") or "").strip()
        password = attrs.get("password") or ""

        if not identifier or not password:
            raise AuthenticationFailed(_("Nom d'utilisateur et mot de passe requis."))

        user = None
        
        # 1. Essayer d'abord avec username exact
        if identifier:
            try:
                # Chercher par username
                user_obj = User.objects.filter(username=identifier).first()
                if user_obj:
                    user = authenticate(request=request, username=user_obj.username, password=password)
                    
                    if not user and user_obj.email:
                        # Essayer aussi avec email si username échoue
                        user = authenticate(request=request, username=user_obj.email, password=password)
            except Exception:
                user = None

        # 2. Si échec, essayer avec email
        if not user and "@" in identifier:
            try:
                user_obj = User.objects.filter(email__iexact=identifier).first()
                if user_obj:
                    user = authenticate(request=request, username=user_obj.username, password=password)
            except MultipleObjectsReturned:
                raise AuthenticationFailed(_("Plusieurs comptes utilisent cet email. Contactez le support."))
            except Exception:
                user = None

        # 3. Si échec, essayer avec téléphone (normalisé)
        if not user and _looks_like_phone(identifier):
            digits = _normalize_phone(identifier)
            if _burundi_phone_prefix_ok(digits):
                try:
                    user_obj = User.objects.filter(phone=digits).first()
                    if user_obj:
                        user = authenticate(request=request, username=user_obj.username, password=password)
                except MultipleObjectsReturned:
                    raise AuthenticationFailed(_("Plusieurs comptes utilisent ce téléphone. Contactez le support."))
                except Exception:
                    user = None

        # 4. Dernier essai: authentification directe avec l'identifiant
        if not user:
            user = authenticate(request=request, username=identifier, password=password)

        if not user:
            raise AuthenticationFailed(_("Nom d'utilisateur ou mot de passe incorrect."))

        if not getattr(user, "is_active", True):
            raise PermissionDenied(_("Le compte est désactivé"))

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        tokens = _issue_tokens(user)
        return {
            "success": True,
            "message": _("Connexion réussie"),
            "user": UserSerializer(user, context=self.context).data,
            "tokens": tokens,
        }


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={"input_type": "password"})
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password], style={"input_type": "password"})
    confirm_password = serializers.CharField(required=True, write_only=True, style={"input_type": "password"})

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": _("Les mots de passe ne correspondent pas.")})

        user = self.context["request"].user
        if not user.check_password(data["old_password"]):
            raise serializers.ValidationError({"old_password": _("L'ancien mot de passe est incorrect.")})

        if data["old_password"] == data["new_password"]:
            raise serializers.ValidationError({"new_password": _("Le nouveau mot de passe doit être différent de l'ancien.")})

        return data

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False, allow_null=True)
    signature = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "phone",
            "email",
            "gender",
            "date_of_birth",
            "nationality",
            "job_title",
            "id_type",
            "id_number",
            "id_issue_date",
            "id_expiry_date",
            "id_no_expiry",
            "id_document_name",
            "address_line",
            "province",
            "commune",
            "colline_or_quartier",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relationship",
            "business_name",
            "business_entity_type",
            "business_registration_number",
            "business_tax_id",
            "business_doc_expiry_date",
            "boutique_type",
            "boutique_services",
            "delivery_vehicle",
            "vehicle_registration",
            "preferred_delivery_time",
            "delivery_instructions",
            "lumicash_msisdn",
            "photo",
            "signature",
        ]
        extra_kwargs = {"email": {"required": False}, "phone": {"required": False}, "boutique_services": {"required": False}}

    def validate_phone(self, value):
        if value:
            cleaned = _normalize_phone(value)
            if not _burundi_phone_prefix_ok(cleaned):
                raise serializers.ValidationError(_("Numéro de téléphone burundais invalide"))
            return cleaned
        return value


class UserKYCStatusSerializer(serializers.ModelSerializer):
    kyc_documents_required = serializers.SerializerMethodField()
    documents_uploaded = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["kyc_status", "kyc_verified_at", "account_status", "kyc_documents_required", "documents_uploaded"]
        read_only_fields = ["kyc_status", "kyc_verified_at", "account_status"]

    def get_kyc_documents_required(self, obj):
        fn = getattr(obj, "get_kyc_documents_required", None)
        return fn() if callable(fn) else []

    def get_documents_uploaded(self, obj):
        rel = getattr(obj, "documents", None)
        if rel is None:
            return []
        return list(rel.values_list("document_type", flat=True))