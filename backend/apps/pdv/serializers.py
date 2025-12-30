# ========================= apps/pdv/serializers.py =========================
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from .models import PointDeVente, PDVStock, PDVSale

User = get_user_model()


class PDVStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDVStock
        fields = ["current_liters", "last_event_at", "updated_at"]


class PDVSerializer(serializers.ModelSerializer):
    # ------------------ AGENT ------------------
    agent_username = serializers.CharField(source="agent_user.username", read_only=True)
    agent_full_name = serializers.CharField(source="agent_user.full_name", read_only=True)
    agent_phone = serializers.CharField(source="agent_user.phone", read_only=True)
    agent_code = serializers.CharField(source="agent_user.agent_code", read_only=True)

    # ------------------ PARTENAIRE ------------------
    partner_username = serializers.CharField(source="partner.username", read_only=True, allow_null=True)
    partner_full_name = serializers.CharField(source="partner.full_name", read_only=True, allow_null=True)

    # ------------------ IDS (write) ------------------
    agent_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="agent"),
        write_only=True,
        source="agent_user",
    )
    partner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="partenaire"),
        write_only=True,
        required=False,
        allow_null=True,
        source="partner",
    )

    stock = PDVStockSerializer(read_only=True)

    class Meta:
        model = PointDeVente
        fields = [
            "id",
            "name",
            "code",  # ✅ NOUVEAU (read-only côté UI)
            "province",
            "commune",
            "address",
            "agent_user_id",
            "agent_username",
            "agent_full_name",
            "agent_phone",
            "agent_code",
            "partner_id",
            "partner_username",
            "partner_full_name",
            "stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "stock", "code"]

    def validate_agent_user_id(self, value):
        if value.role != "agent":
            raise serializers.ValidationError(_("L'utilisateur doit être un agent"))
        return value

    def validate_partner_id(self, value):
        if value and value.role != "partenaire":
            raise serializers.ValidationError(_("Le partenaire doit avoir le rôle 'partenaire'"))
        return value

    def validate(self, data):
        name = data.get("name")
        commune = data.get("commune")
        if name and commune:
            qs = PointDeVente.objects.filter(name=name, commune=commune)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"name": f"Un point de vente avec ce nom existe déjà dans la commune {commune}"}
                )
        return data

    def create(self, validated_data):
        pdv = super().create(validated_data)
        PDVStock.objects.get_or_create(pdv=pdv)  # ✅ stock auto
        return pdv


class PDVSaleCreateSerializer(serializers.Serializer):
    pdv_id = serializers.IntegerField(min_value=1)
    liters_sold = serializers.DecimalField(max_digits=12, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["liters_sold"] <= 0:
            raise serializers.ValidationError({"liters_sold": _("Quantité invalide")})
        return attrs


class PDVSaleSerializer(serializers.ModelSerializer):
    pdv_name = serializers.CharField(source="pdv.name", read_only=True)
    pdv_code = serializers.CharField(source="pdv.code", read_only=True)
    pdv_province = serializers.CharField(source="pdv.province", read_only=True)
    pdv_commune = serializers.CharField(source="pdv.commune", read_only=True)

    sold_by_username = serializers.CharField(source="sold_by.username", read_only=True)
    sold_by_full_name = serializers.CharField(source="sold_by.full_name", read_only=True)

    class Meta:
        model = PDVSale
        fields = [
            "id",
            "pdv",
            "pdv_name",
            "pdv_code",
            "pdv_province",
            "pdv_commune",
            "liters_sold",
            "sold_by",
            "sold_by_username",
            "sold_by_full_name",
            "sold_at",
            "notes",
        ]
        read_only_fields = ["sold_by", "sold_at"]
