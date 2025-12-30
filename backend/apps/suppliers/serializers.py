# ========================= apps/suppliers/serializers.py =========================
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Supplier

User = get_user_model()


class SupplierSerializer(serializers.ModelSerializer):
    # ------------------ CHAMPS UTILISATEUR ------------------
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    # ------------------ CHAMP ÉTENDU ------------------
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(account_type="fournisseur"),
        write_only=True,
        source="user",
    )

    class Meta:
        model = Supplier
        fields = [
            "id",
            "user_id", "username", "full_name", "phone", "email",
            "type", "province", "commune", "address",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_user_id(self, value):
        if value.account_type != "fournisseur":
            raise serializers.ValidationError("L'utilisateur doit être un fournisseur")
        return value

    def create(self, validated_data):
        user = validated_data.get("user")
        if Supplier.objects.filter(user=user).exists():
            raise serializers.ValidationError("Un fournisseur existe déjà pour cet utilisateur")
        return super().create(validated_data)
