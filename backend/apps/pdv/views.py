# ========================= apps/pdv/views.py =========================
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import PointDeVente, PDVStock, PDVSale
from .serializers import PDVSerializer, PDVSaleCreateSerializer, PDVSaleSerializer


def is_admin_user(user) -> bool:
    return bool(user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "admin"))


def is_agent_user(user) -> bool:
    return bool(user and getattr(user, "role", "") == "agent")


class PDVViewSet(viewsets.ModelViewSet):
    queryset = PointDeVente.objects.all().select_related("agent_user", "partner", "stock")
    serializer_class = PDVSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        # Admin -> tout
        if is_admin_user(user):
            return qs

        # Agent -> seulement son PDV
        if is_agent_user(user):
            return qs.filter(agent_user=user)

        # autres -> rien
        return qs.none()

    def create(self, request, *args, **kwargs):
        # ✅ Admin only
        if not is_admin_user(request.user):
            return Response({"detail": "Seul l'administrateur peut créer un point de vente."}, status=403)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Seul l'administrateur peut modifier un point de vente."}, status=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Seul l'administrateur peut modifier un point de vente."}, status=403)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Seul l'administrateur peut supprimer un point de vente."}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="my-pdv")
    def my_pdv(self, request):
        """
        Agent: récupère son PDV + stock.
        Admin: 403 (car admin peut lister /pdv/).
        """
        if not is_agent_user(request.user):
            return Response({"detail": "Réservé aux agents."}, status=403)

        pdv = (
            PointDeVente.objects.filter(agent_user=request.user)
            .select_related("agent_user", "partner", "stock")
            .first()
        )
        if not pdv:
            return Response({"detail": "Aucun point de vente assigné à cet agent."}, status=404)

        return Response(PDVSerializer(pdv, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="report-sale")
    def report_sale(self, request):
        """
        Agent: signale une vente => stock diminue + trace PDVSale.
        Payload: { pdv_id, liters_sold, notes? }
        """
        if not is_agent_user(request.user) and not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)

        ser = PDVSaleCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        pdv_id = ser.validated_data["pdv_id"]
        liters_sold = ser.validated_data["liters_sold"]
        notes = ser.validated_data.get("notes", "")

        # Agent ne peut agir que sur son PDV
        qs = PointDeVente.objects.all().select_related("stock")
        if is_agent_user(request.user):
            qs = qs.filter(agent_user=request.user)

        pdv = qs.filter(id=pdv_id).first()
        if not pdv:
            return Response({"detail": "PDV introuvable ou non autorisé."}, status=404)

        stock, _ = PDVStock.objects.get_or_create(pdv=pdv)

        try:
            stock.decrease(liters_sold)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        sale = PDVSale.objects.create(
            pdv=pdv,
            liters_sold=liters_sold,
            sold_by=request.user,
            notes=notes or "",
        )

        return Response(
            {
                "success": True,
                "message": "Vente enregistrée. Stock mis à jour.",
                "sale": PDVSaleSerializer(sale, context={"request": request}).data,
                "stock": {
                    "pdv_id": pdv.id,
                    "current_liters": str(stock.current_liters),
                    "last_event_at": stock.last_event_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )
