# ========================= apps/accounts/admin.py =========================
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .models import CustomUser, UserDocument, UserActivityLog

# ✅ AJOUT (sans casser) : importer Driver si l'app existe
try:
    from apps.drivers.models import Driver
except Exception:
    Driver = None  # fallback safe


def _model_field_names(model_cls) -> set[str]:
    """
    Retourne tous les noms de champs/concrètement utilisables dans l'admin.
    (inclut relations, mais on filtre ensuite si besoin).
    """
    names = set()
    for f in model_cls._meta.get_fields():
        names.add(f.name)
        # certains champs ont aussi un attname (ex: user_id)
        if hasattr(f, "attname"):
            names.add(f.attname)
    return names


def _keep_existing(model_cls, fields):
    """
    Garde seulement les champs qui existent sur model_cls.
    """
    existing = _model_field_names(model_cls)
    return tuple([f for f in fields if f in existing])


def _filter_fieldsets(model_cls, fieldsets):
    """
    Filtre dynamiquement les fieldsets pour éviter admin.E035 si un champ n'existe pas.
    """
    existing = _model_field_names(model_cls)
    cleaned = []
    for title, opts in fieldsets:
        fields = opts.get("fields", ())
        fields = tuple([f for f in fields if f in existing])
        if fields:
            new_opts = dict(opts)
            new_opts["fields"] = fields
            cleaned.append((title, new_opts))
    return tuple(cleaned)


# ✅ AJOUT (sans casser) : Inline Driver (chauffeur interne) dans l’admin CustomUser
if Driver:
    class DriverInline(admin.StackedInline):
        model = Driver
        extra = 0
        can_delete = True
        classes = ("collapse",)  # pro: section repliable
else:
    DriverInline = None


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin personnalisé pour le modèle CustomUser (robuste aux champs manquants)."""

    # Base fieldsets "souhaités"
    _FIELDSETS = (
        (None, {"fields": ("username", "password")}),
        (_("Informations personnelles"), {
            "fields": (
                "full_name", "email", "phone", "secondary_phone",
                "date_of_birth", "gender", "nationality", "photo",
            )
        }),
        (_("Type de compte"), {
            "fields": (
                "account_type", "client_type", "supplier_type",
                "delivery_type", "merchant_type", "role",
            )
        }),
        (_("Pièce d'identité (KYC)"), {
            "fields": (
                "id_type", "id_number", "id_issue_date",
                "id_expiry_date", "id_no_expiry", "id_document_name",
            )
        }),
        (_("Adresse"), {
            "fields": ("address_line", "province", "commune", "colline_or_quartier")
        }),
        (_("Contact d'urgence"), {
            "fields": (
                "emergency_contact_name", "emergency_contact_phone",
                "emergency_contact_relationship",
            )
        }),
        (_("Entreprise"), {
            "fields": (
                "business_name", "business_entity_type",
                "business_registration_number", "business_tax_id",
                "business_doc_expiry_date", "job_title",
            )
        }),
        (_("Boutique"), {"fields": ("boutique_type", "boutique_services")}),
        (_("Livraison"), {"fields": ("delivery_vehicle", "vehicle_registration", "qr_code")}),
        (_("Préférences client"), {"fields": ("preferred_delivery_time", "delivery_instructions")}),
        (_("Paiement"), {"fields": ("lumicash_msisdn", "lumicash_linked")}),
        (_("Statuts"), {"fields": ("kyc_status", "account_status")}),
        (_("Acceptations"), {
            "fields": (
                "accepted_terms", "terms_accepted_at",
                "accepted_contract", "contract_accepted_at",
            )
        }),
        (_("Permissions"), {
            "fields": (
                "is_active", "is_staff", "is_superuser",
                "groups", "user_permissions",
            )
        }),
        (_("Dates importantes"), {
            "fields": (
                "last_login",       # champ Django natif
                "last_login_at",    # custom si tu l'as
                "created_at",
                "updated_at",
                "kyc_verified_at",
            ),
        }),
    )

    _ADD_FIELDSETS = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username", "email", "phone",
                "password1", "password2",
                "account_type", "role", "full_name",
                "is_staff", "is_superuser",
            ),
        }),
    )

    _LIST_DISPLAY = (
        "username", "email", "phone", "full_name",
        "account_type", "role",
        "kyc_status", "account_status",
        "is_active", "created_at",
    )

    _LIST_FILTER = (
        "account_type", "role", "kyc_status", "account_status",
        "is_active", "is_staff", "is_superuser", "created_at",
    )

    _SEARCH_FIELDS = ("username", "email", "phone", "full_name", "id_number")
    _ORDERING = ("-created_at",)

    _READONLY_FIELDS = (
        "created_at", "updated_at",
        "last_login",
        "last_login_at",
        "kyc_verified_at",
        "terms_accepted_at",
        "contract_accepted_at",
    )

    # BONUS UX
    filter_horizontal = ("groups", "user_permissions")

    # ✅ AJOUT: inline Driver (si dispo) sans toucher au reste
    if DriverInline:
        inlines = [DriverInline]

    def __init__(self, model, admin_site):
        # Filtrer selon les champs réellement présents
        self.fieldsets = _filter_fieldsets(CustomUser, self._FIELDSETS)
        self.add_fieldsets = _filter_fieldsets(CustomUser, self._ADD_FIELDSETS)

        self.list_display = _keep_existing(CustomUser, self._LIST_DISPLAY) or ("username", "email", "is_active")
        self.list_filter = _keep_existing(CustomUser, self._LIST_FILTER)
        self.search_fields = _keep_existing(CustomUser, self._SEARCH_FIELDS)
        self.readonly_fields = _keep_existing(CustomUser, self._READONLY_FIELDS)

        # ordering / date_hierarchy seulement si champ présent
        existing = _model_field_names(CustomUser)
        if all(o.lstrip("-") in existing for o in self._ORDERING):
            self.ordering = self._ORDERING
        else:
            self.ordering = ("-id",)

        self.date_hierarchy = "created_at" if "created_at" in existing else None
        self.list_per_page = 50
        super().__init__(model, admin_site)


@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    """Admin pour les documents utilisateur (robuste aux champs manquants)."""

    _LIST_DISPLAY = (
        "user", "document_type", "file_name", "verified",
        "uploaded_at", "expiry_date", "is_expired_display",
    )
    _LIST_FILTER = (
        "document_type", "verified", "uploaded_at",
        "expiry_date", "user__account_type",
    )
    _SEARCH_FIELDS = (
        "user__username", "user__email", "user__full_name",
        "file_name", "description",
    )
    _READONLY_FIELDS = ("uploaded_at", "verified_at", "file_size", "is_expired_display")
    _ORDERING = ("-uploaded_at",)

    def __init__(self, model, admin_site):
        existing = _model_field_names(UserDocument)

        # champs calculés possibles
        self.list_display = tuple([f for f in self._LIST_DISPLAY if (f in existing) or (f == "is_expired_display")]) or ("id",)
        self.list_filter = tuple([f for f in self._LIST_FILTER if f in existing or "__" in f])
        self.search_fields = self._SEARCH_FIELDS  # search_fields peut contenir relations, ok
        self.readonly_fields = tuple([f for f in self._READONLY_FIELDS if (f in existing) or (f == "is_expired_display")])

        if all(o.lstrip("-") in existing for o in self._ORDERING):
            self.ordering = self._ORDERING
        else:
            self.ordering = ("-id",)

        self.date_hierarchy = "uploaded_at" if "uploaded_at" in existing else None
        self.list_per_page = 50
        super().__init__(model, admin_site)

    @admin.display(boolean=True, description=_("Expiré"))
    def is_expired_display(self, obj):
        # supporte soit méthode is_expired (property), soit champ bool
        val = getattr(obj, "is_expired", None)
        return bool(val() if callable(val) else val)


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """Admin pour les journaux d'activité (robuste aux champs manquants)."""

    _LIST_DISPLAY = ("user", "activity_type", "action", "created_at", "ip_address")
    _LIST_FILTER = ("activity_type", "created_at", "user__account_type")
    _SEARCH_FIELDS = ("user__username", "user__email", "user__full_name", "action", "ip_address")
    _READONLY_FIELDS = ("created_at",)
    _ORDERING = ("-created_at",)

    def __init__(self, model, admin_site):
        existing = _model_field_names(UserActivityLog)

        self.list_display = _keep_existing(UserActivityLog, self._LIST_DISPLAY) or ("id",)
        self.list_filter = tuple([f for f in self._LIST_FILTER if f in existing or "__" in f])
        self.search_fields = self._SEARCH_FIELDS
        self.readonly_fields = _keep_existing(UserActivityLog, self._READONLY_FIELDS)

        if all(o.lstrip("-") in existing for o in self._ORDERING):
            self.ordering = self._ORDERING
        else:
            self.ordering = ("-id",)

        self.date_hierarchy = "created_at" if "created_at" in existing else None
        self.list_per_page = 100
        super().__init__(model, admin_site)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
