# ========================= apps/adminpanel/serializers.py =========================
from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer, UserDetailSerializer

User = get_user_model()


class AdminUserListSerializer(UserSerializer):
    """Même base que UserSerializer, plus quelques champs utiles dashboard."""
    pass


class AdminUserDetailSerializer(UserDetailSerializer):
    pass


class AdminBlockUserSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, default="")
