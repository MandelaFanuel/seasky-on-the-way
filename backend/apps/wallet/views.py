# ========================= apps/wallet/views.py =========================
from __future__ import annotations

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.views import is_admin_user  # ✅ réutilise ton helper

from .models import Wallet, WalletTransaction
from .serializers import (
    WalletSerializer,
    WalletTransactionSerializer,
    WalletTransferSerializer,
)


class WalletViewSet(viewsets.ModelViewSet):
    """
    - Admin: peut voir tous les wallets, le wallet principal, faire transferts internes
    - User normal: peut voir SON wallet seulement
    """
    permission_classes = [IsAuthenticated]
    queryset = Wallet.objects.all().select_related("user")
    serializer_class = WalletSerializer

    def get_queryset(self):
        user = self.request.user
        if is_admin_user(user):
            qs = self.queryset
            search = (self.request.query_params.get("search") or "").strip()
            if search:
                qs = qs.filter(
                    Q(address__icontains=search)
                    | Q(user__username__icontains=search)
                    | Q(user__full_name__icontains=search)
                    | Q(user__phone__icontains=search)
                )
            return qs.order_by("-created_at")

        return self.queryset.filter(user=user)

    @action(detail=False, methods=["get"], url_path="my-wallet")
    def my_wallet(self, request):
        w = Wallet.objects.filter(user=request.user).select_related("user").first()
        if not w:
            return Response({"detail": "Wallet introuvable."}, status=404)
        return Response(WalletSerializer(w, context={"request": request}).data)

    @action(detail=False, methods=["get"], url_path="platform")
    def platform_wallet(self, request):
        if not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)
        w = Wallet.objects.filter(is_platform_wallet=True).select_related("user").first()
        if not w:
            return Response({"detail": "Aucun wallet principal défini."}, status=404)
        return Response(WalletSerializer(w, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="set-platform")
    def set_platform(self, request, pk=None):
        if not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)

        Wallet.objects.filter(is_platform_wallet=True).update(is_platform_wallet=False)
        w = self.get_object()
        w.is_platform_wallet = True
        w.save(update_fields=["is_platform_wallet"])
        return Response({"success": True, "message": "Wallet principal mis à jour.", "wallet": WalletSerializer(w).data})

    @action(detail=True, methods=["get"], url_path="transactions")
    def transactions(self, request, pk=None):
        w = self.get_object()
        if (not is_admin_user(request.user)) and (w.user_id != request.user.id):
            return Response({"detail": "Accès refusé."}, status=403)

        qs = WalletTransaction.objects.filter(wallet=w).select_related("wallet", "wallet__user", "created_by")
        return Response(
            {
                "count": qs.count(),
                "results": WalletTransactionSerializer(qs[:300], many=True, context={"request": request}).data,
            }
        )

    @action(detail=True, methods=["post"], url_path="transfer")
    def transfer(self, request, pk=None):
        if not is_admin_user(request.user):
            return Response({"detail": "Seul l'admin peut faire des transferts internes."}, status=403)

        from_wallet = self.get_object()

        ser = WalletTransferSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        to_wallet_id = ser.validated_data["to_wallet_id"]
        amount = ser.validated_data["amount"]
        reason = ser.validated_data.get("reason", "")

        to_wallet = Wallet.objects.filter(pk=to_wallet_id).first()
        if not to_wallet:
            return Response({"detail": "Wallet destination introuvable."}, status=404)

        try:
            out_tx, in_tx = from_wallet.transfer_to(to_wallet, amount, reason=reason, created_by=request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        return Response(
            {
                "success": True,
                "message": "Transfert effectué.",
                "out_tx": WalletTransactionSerializer(out_tx).data,
                "in_tx": WalletTransactionSerializer(in_tx).data,
                "from_wallet": WalletSerializer(Wallet.objects.get(pk=from_wallet.pk)).data,
                "to_wallet": WalletSerializer(Wallet.objects.get(pk=to_wallet.pk)).data,
            },
            status=status.HTTP_201_CREATED,
        )
