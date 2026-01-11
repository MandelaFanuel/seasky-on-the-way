# ========================= apps/drivers/admin.py =========================
from django.contrib import admin, messages
from django.utils import timezone
from django.utils.html import format_html
from django.urls import reverse, path
from django.shortcuts import redirect
from django.contrib.admin import SimpleListFilter
from django.utils.translation import gettext_lazy as _

from .models import Driver, DriverAvailability, DriverDocument, DriverPerformance
from .utils import DriverCodeGenerator


class LicenseExpiryFilter(SimpleListFilter):
    title = _("Validité du permis")
    parameter_name = "license_status"

    def lookups(self, request, model_admin):
        return (("valid", _("Valide")), ("expired", _("Expiré")), ("missing", _("Non renseigné")))

    def queryset(self, request, queryset):
        today = timezone.localdate()
        if self.value() == "valid":
            return queryset.filter(license_expiry__isnull=False, license_expiry__gte=today)
        if self.value() == "expired":
            return queryset.filter(license_expiry__isnull=False, license_expiry__lt=today)
        if self.value() == "missing":
            return queryset.filter(license_expiry__isnull=True)
        return queryset


class InsuranceExpiryFilter(SimpleListFilter):
    title = _("Validité de l'assurance")
    parameter_name = "insurance_status"

    def lookups(self, request, model_admin):
        return (("valid", _("Valide")), ("expired", _("Expiré")), ("missing", _("Non renseigné")))

    def queryset(self, request, queryset):
        today = timezone.localdate()
        if self.value() == "valid":
            return queryset.filter(insurance_expiry__isnull=False, insurance_expiry__gte=today)
        if self.value() == "expired":
            return queryset.filter(insurance_expiry__isnull=False, insurance_expiry__lt=today)
        if self.value() == "missing":
            return queryset.filter(insurance_expiry__isnull=True)
        return queryset


class DriverDocumentInline(admin.TabularInline):
    model = DriverDocument
    extra = 0
    fields = ["document_type", "file", "file_name", "expiry_date", "is_verified", "verified_at"]
    readonly_fields = ["verified_at"]
    classes = ["collapse"]


class DriverAvailabilityInline(admin.StackedInline):
    model = DriverAvailability
    extra = 0
    fields = ["is_available", "location_lat", "location_lng", "last_location_update"]
    readonly_fields = ["last_location_update"]
    classes = ["collapse"]


class DriverPerformanceInline(admin.TabularInline):
    model = DriverPerformance
    extra = 0
    fields = ["period_start", "period_end", "collections_count", "deliveries_count", "efficiency_score"]
    readonly_fields = fields
    classes = ["collapse"]
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = [
        "driver_code",
        "driver_name",
        "phone",
        "transport_mode_display",
        "status_display",
        "license_status",
        "insurance_status",
        "verification_status",
        "hire_date",
        "action_buttons",
    ]

    list_filter = [
        "status",
        "transport_mode",
        "is_verified",
        LicenseExpiryFilter,
        InsuranceExpiryFilter,
        "hire_date",
        "created_at",
    ]

    search_fields = [
        "driver_code",
        "user__username",
        "user__full_name",
        "user__phone",
        "user__email",
        "license_number",
        "vehicle_registration",
        "assigned_zone",
    ]

    list_per_page = 50
    list_select_related = ["user"]
    date_hierarchy = "created_at"
    ordering = ["-created_at"]

    actions = ["verify_drivers", "suspend_drivers", "activate_drivers", "export_drivers_csv"]

    inlines = [DriverAvailabilityInline, DriverDocumentInline, DriverPerformanceInline]

    fieldsets = (
        (_("Informations de base"), {"fields": ("driver_code", "user", "status", "transport_mode", "can_be_pdv", "is_verified", "verification_date")}),
        (_("Informations professionnelles"), {"fields": ("hire_date", "base_salary", "commission_rate", "assigned_zone", "max_capacity", "notes"), "classes": ("collapse",)}),
        (_("Documents et permis"), {"fields": ("license_number", "license_expiry", "vehicle_type", "vehicle_registration", "insurance_number", "insurance_expiry"), "classes": ("collapse",)}),
        (_("Métadonnées"), {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    readonly_fields = ["driver_code", "created_at", "updated_at", "verification_date"]
    autocomplete_fields = ["user"]

    def driver_name(self, obj):
        return obj.user.full_name or obj.user.username

    driver_name.short_description = _("Nom")
    driver_name.admin_order_field = "user__full_name"

    def phone(self, obj):
        return obj.user.phone

    phone.short_description = _("Téléphone")
    phone.admin_order_field = "user__phone"

    def transport_mode_display(self, obj):
        return obj.get_transport_mode_display()

    transport_mode_display.short_description = _("Mode de transport")

    def status_display(self, obj):
        colors = {
            "active": "green",
            "inactive": "red",
            "on_duty": "blue",
            "off_duty": "orange",
            "on_break": "goldenrod",
            "on_leave": "purple",
        }
        color = colors.get(obj.status, "gray")
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.get_status_display())

    status_display.short_description = _("Statut")

    def license_status(self, obj):
        if not obj.license_expiry:
            return format_html('<span style="color: gray;">{}</span>', _("Non renseigné"))
        today = timezone.localdate()
        if obj.license_expiry >= today:
            days_left = (obj.license_expiry - today).days
            if days_left > 30:
                return format_html('<span style="color: green;">✓ {}</span>', _("Valide"))
            return format_html('<span style="color: orange;">⚠ {}</span>', _("Expire bientôt"))
        return format_html('<span style="color: red;">✗ {}</span>', _("Expiré"))

    license_status.short_description = _("Permis")

    def insurance_status(self, obj):
        if not obj.insurance_expiry:
            return format_html('<span style="color: gray;">{}</span>', _("Non renseigné"))
        today = timezone.localdate()
        if obj.insurance_expiry >= today:
            days_left = (obj.insurance_expiry - today).days
            if days_left > 30:
                return format_html('<span style="color: green;">✓ {}</span>', _("Valide"))
            return format_html('<span style="color: orange;">⚠ {}</span>', _("Expire bientôt"))
        return format_html('<span style="color: red;">✗ {}</span>', _("Expiré"))

    insurance_status.short_description = _("Assurance")

    def verification_status(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: green; font-weight: bold;">✓ {}</span>', _("Vérifié"))
        return format_html('<span style="color: orange; font-weight: bold;">✗ {}</span>', _("Non vérifié"))

    verification_status.short_description = _("Vérification")

    def action_buttons(self, obj):
        links = []

        # ✅ FIX: noms corrects (admin:drivers_driver_<custom_name>)
        verify_url = reverse("admin:drivers_driver_driver_verify", args=[obj.pk])
        suspend_url = reverse("admin:drivers_driver_driver_suspend", args=[obj.pk])
        activate_url = reverse("admin:drivers_driver_driver_activate", args=[obj.pk])

        if not obj.is_verified:
            links.append(
                f'<a href="{verify_url}" class="button" '
                f'style="background:#4CAF50;color:#fff;padding:5px 10px;border-radius:3px;text-decoration:none;">✓ Vérifier</a>'
            )

        if obj.status == "active":
            links.append(
                f'<a href="{suspend_url}" class="button" '
                f'style="background:#f44336;color:#fff;padding:5px 10px;border-radius:3px;text-decoration:none;">⏸ Suspendre</a>'
            )
        elif obj.status == "inactive":
            links.append(
                f'<a href="{activate_url}" class="button" '
                f'style="background:#2196F3;color:#fff;padding:5px 10px;border-radius:3px;text-decoration:none;">▶ Activer</a>'
            )

        perf_url = reverse("admin:drivers_driverperformance_changelist") + f"?driver__id__exact={obj.pk}"
        links.append(
            f'<a href="{perf_url}" class="button" '
            f'style="background:#9C27B0;color:#fff;padding:5px 10px;border-radius:3px;text-decoration:none;">📊 Stats</a>'
        )

        return format_html(" ".join(links))

    action_buttons.short_description = _("Actions")

    def verify_drivers(self, request, queryset):
        updated = queryset.update(is_verified=True, verification_date=timezone.now())
        self.message_user(request, f"{updated} chauffeur(s) vérifié(s).", messages.SUCCESS)

    def suspend_drivers(self, request, queryset):
        updated = queryset.update(status="inactive")
        DriverAvailability.objects.filter(driver__in=queryset).update(is_available=False)
        self.message_user(request, f"{updated} chauffeur(s) suspendu(s).", messages.WARNING)

    def activate_drivers(self, request, queryset):
        updated = queryset.update(status="active")
        self.message_user(request, f"{updated} chauffeur(s) activé(s).", messages.SUCCESS)

    def export_drivers_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="drivers_export.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "Code",
                "Nom",
                "Téléphone",
                "Email",
                "Mode Transport",
                "Statut",
                "Permis",
                "Expiration Permis",
                "Assurance",
                "Expiration Assurance",
                "Zone",
                "Salaire",
                "Commission",
                "Date Embauche",
                "Vérifié",
            ]
        )

        for driver in queryset.select_related("user"):
            writer.writerow(
                [
                    driver.driver_code,
                    driver.user.full_name or "",
                    driver.user.phone or "",
                    driver.user.email or "",
                    driver.get_transport_mode_display(),
                    driver.get_status_display(),
                    driver.license_number or "",
                    driver.license_expiry.strftime("%Y-%m-%d") if driver.license_expiry else "",
                    driver.insurance_number or "",
                    driver.insurance_expiry.strftime("%Y-%m-%d") if driver.insurance_expiry else "",
                    driver.assigned_zone or "",
                    driver.base_salary,
                    driver.commission_rate,
                    driver.hire_date.strftime("%Y-%m-%d") if driver.hire_date else "",
                    "Oui" if driver.is_verified else "Non",
                ]
            )

        return response

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("<int:driver_id>/verify/", self.admin_site.admin_view(self.verify_view), name="driver_verify"),
            path("<int:driver_id>/suspend/", self.admin_site.admin_view(self.suspend_view), name="driver_suspend"),
            path("<int:driver_id>/activate/", self.admin_site.admin_view(self.activate_view), name="driver_activate"),
        ]
        return custom_urls + urls

    def verify_view(self, request, driver_id):
        driver = Driver.objects.get(pk=driver_id)
        driver.is_verified = True
        driver.verification_date = timezone.now()
        driver.save(update_fields=["is_verified", "verification_date", "updated_at"])
        self.message_user(request, f"Chauffeur {driver.driver_code} vérifié.", messages.SUCCESS)
        return redirect(reverse("admin:drivers_driver_changelist"))

    def suspend_view(self, request, driver_id):
        driver = Driver.objects.get(pk=driver_id)
        driver.status = "inactive"
        driver.save(update_fields=["status", "updated_at"])
        DriverAvailability.objects.filter(driver=driver).update(is_available=False)
        self.message_user(request, f"Chauffeur {driver.driver_code} suspendu.", messages.WARNING)
        return redirect(reverse("admin:drivers_driver_changelist"))

    def activate_view(self, request, driver_id):
        driver = Driver.objects.get(pk=driver_id)
        driver.status = "active"
        driver.save(update_fields=["status", "updated_at"])
        self.message_user(request, f"Chauffeur {driver.driver_code} activé.", messages.SUCCESS)
        return redirect(reverse("admin:drivers_driver_changelist"))

    def save_model(self, request, obj, form, change):
        if not obj.driver_code:
            obj.driver_code = DriverCodeGenerator.generate_unique_driver_code()
        super().save_model(request, obj, form, change)
        DriverAvailability.objects.get_or_create(driver=obj)
