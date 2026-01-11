# ========================= apps/adminpanel/views.py =========================
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import UserActivityLog
from apps.accounts.views import is_admin_user
from apps.drivers.models import Driver, DriverAvailability, DriverDocument, DriverPerformance
from apps.pdv.models import PointDeVente, PDVSale, PDVStock
from apps.logistics.models import Collection, Delivery
from apps.wallet.models import Wallet, WalletTransaction

from .serializers import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminBlockUserSerializer,
)

User = get_user_model()


class AdminDashboardViewSet(viewsets.GenericViewSet):
    """
    Base: /api/v1/admin-dashboard/
    Tout ici est ADMIN ONLY.
    """
    permission_classes = [IsAuthenticated]

    def _deny_if_not_admin(self, request):
        if not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)
        return None

    @action(detail=False, methods=["get"], url_path="overview")
    def overview(self, request):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        today = timezone.localdate()
        start_day = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

        users_by_type = list(
            User.objects.values("account_type").annotate(count=Count("id")).order_by("-count")
        )
        users_by_role = list(
            User.objects.values("role").annotate(count=Count("id")).order_by("-count")
        )

        drivers_total = Driver.objects.count()
        drivers_verified = Driver.objects.filter(is_verified=True).count()
        drivers_available = DriverAvailability.objects.filter(is_available=True).count()

        pdv_total = PointDeVente.objects.count()
        pdv_stock_sum = PDVStock.objects.aggregate(total=Sum("current_liters")).get("total") or 0

        deliveries_today = Delivery.objects.filter(delivered_at__gte=start_day).count()
        collections_today = Collection.objects.filter(collected_at__gte=start_day).count()
        sales_today = PDVSale.objects.filter(sold_at__gte=start_day).count()

        blocked_accounts = User.objects.filter(is_active=False).count()

        wallet_total = Wallet.objects.count()
        tx_today = WalletTransaction.objects.filter(created_at__gte=start_day).count()

        return Response(
            {
                "timestamp": timezone.now().isoformat(),
                "users": {
                    "total": User.objects.count(),
                    "blocked": blocked_accounts,
                    "by_account_type": users_by_type,
                    "by_role": users_by_role,
                },
                "drivers": {
                    "total": drivers_total,
                    "verified": drivers_verified,
                    "available_now": drivers_available,
                    "documents_expiring_soon": DriverDocument.objects.filter(
                        expiry_date__gte=today, expiry_date__lte=today + timezone.timedelta(days=30)
                    ).count(),
                },
                "pdv": {
                    "total": pdv_total,
                    "stock_total_liters": float(pdv_stock_sum),
                    "sales_today": sales_today,
                },
                "logistics": {
                    "deliveries_today": deliveries_today,
                    "collections_today": collections_today,
                },
                "wallet": {
                    "wallets_total": wallet_total,
                    "transactions_today": tx_today,
                    "platform_wallet": Wallet.objects.filter(is_platform_wallet=True).values("id", "address", "balance").first(),
                },
            }
        )

    # -------------------- USERS MANAGEMENT --------------------
    @action(detail=False, methods=["get"], url_path="users")
    def users(self, request):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        qs = User.objects.all().order_by("-created_at")

        account_type = (request.query_params.get("account_type") or "").strip()
        role = (request.query_params.get("role") or "").strip()
        active = request.query_params.get("active")

        if account_type:
            qs = qs.filter(account_type=account_type)
        if role:
            qs = qs.filter(role=role)
        if active is not None:
            qs = qs.filter(is_active=str(active).lower() == "true")

        search = (request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(full_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
            )

        data = AdminUserListSerializer(qs[:500], many=True, context={"request": request}).data
        return Response({"count": qs.count(), "results": data})

    @action(detail=False, methods=["get"], url_path="users/(?P<user_id>[^/.]+)")
    def user_detail(self, request, user_id=None):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "User introuvable."}, status=404)
        return Response(AdminUserDetailSerializer(user, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="users/(?P<user_id>[^/.]+)/set-active")
    def set_user_active(self, request, user_id=None):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "User introuvable."}, status=404)

        ser = AdminBlockUserSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        is_active = ser.validated_data["is_active"]
        reason = ser.validated_data.get("reason", "")

        user.is_active = bool(is_active)
        user.save(update_fields=["is_active"])

        UserActivityLog.objects.create(
            user=request.user,
            action="admin_set_user_active",
            details={"target_user_id": user.id, "is_active": user.is_active, "reason": reason},
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", "") or "",
        )

        return Response(
            {"success": True, "message": "Statut utilisateur mis à jour.", "user": AdminUserListSerializer(user).data},
            status=status.HTTP_200_OK,
        )

    # -------------------- EMPLOYEES LISTS --------------------
    @action(detail=False, methods=["get"], url_path="employees")
    def employees(self, request):
        """
        employés = agents + chauffeurs + (autres plus tard)
        """
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        agents = User.objects.filter(role="agent").order_by("-created_at")[:300]
        drivers = Driver.objects.select_related("user").order_by("-created_at")[:300]

        return Response(
            {
                "agents": AdminUserListSerializer(agents, many=True, context={"request": request}).data,
                "drivers": [
                    {
                        "id": d.id,
                        "driver_code": d.driver_code,
                        "status": d.status,
                        "transport_mode": d.transport_mode,
                        "is_verified": d.is_verified,
                        "user": AdminUserListSerializer(d.user, context={"request": request}).data,
                    }
                    for d in drivers
                ],
            }
        )

    # -------------------- PDV REAL-TIME --------------------
    @action(detail=False, methods=["get"], url_path="pdv")
    def pdv(self, request):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        qs = PointDeVente.objects.all().select_related("agent_user", "partner", "stock").order_by("-created_at")

        province = (request.query_params.get("province") or "").strip()
        if province:
            qs = qs.filter(province__icontains=province)

        commune = (request.query_params.get("commune") or "").strip()
        if commune:
            qs = qs.filter(commune__icontains=commune)

        data = []
        for p in qs[:500]:
            stock = getattr(p, "stock", None)
            data.append(
                {
                    "id": p.id,
                    "name": p.name,
                    "code": p.code,
                    "province": p.province,
                    "commune": p.commune,
                    "address": p.address,
                    "agent": {
                        "id": p.agent_user_id,
                        "username": getattr(p.agent_user, "username", None),
                        "full_name": getattr(p.agent_user, "full_name", None),
                        "phone": getattr(p.agent_user, "phone", None),
                        "agent_code": getattr(p.agent_user, "agent_code", None),
                    },
                    "stock": {
                        "current_liters": str(getattr(stock, "current_liters", "0")),
                        "last_event_at": getattr(stock, "last_event_at", None),
                        "updated_at": getattr(stock, "updated_at", None),
                    }
                    if stock
                    else None,
                    "created_at": p.created_at,
                }
            )

        return Response({"count": qs.count(), "results": data})

    # -------------------- LOGISTICS --------------------
    @action(detail=False, methods=["get"], url_path="deliveries")
    def deliveries(self, request):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        qs = Delivery.objects.all().select_related("driver", "driver__user", "pdv", "confirmed_by").order_by("-delivered_at")

        pdv_id = request.query_params.get("pdv_id")
        if pdv_id:
            qs = qs.filter(pdv_id=pdv_id)

        return Response(
            {
                "count": qs.count(),
                "results": [
                    {
                        "id": d.id,
                        "quantity_liters": str(d.quantity_liters),
                        "delivered_at": d.delivered_at,
                        "pdv": {"id": d.pdv_id, "name": d.pdv.name, "code": d.pdv.code},
                        "driver": {"id": d.driver_id, "driver_code": d.driver.driver_code, "name": d.driver.user.full_name or d.driver.user.username},
                        "confirmed_by": getattr(d.confirmed_by, "username", None),
                        "confirmed_at": d.confirmed_at,
                    }
                    for d in qs[:500]
                ],
            }
        )

    @action(detail=False, methods=["get"], url_path="collections")
    def collections(self, request):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        qs = Collection.objects.all().select_related("supplier", "supplier__user", "driver", "driver__user").order_by("-collected_at")

        return Response(
            {
                "count": qs.count(),
                "results": [
                    {
                        "id": c.id,
                        "quantity_liters": str(c.quantity_liters),
                        "value_amount": str(c.value_amount),
                        "collected_at": c.collected_at,
                        "status": c.status,
                        "supplier": {"id": c.supplier_id, "name": c.supplier.user.full_name or c.supplier.user.username},
                        "driver": {"id": c.driver_id, "driver_code": c.driver.driver_code, "name": c.driver.user.full_name or c.driver.user.username},
                    }
                    for c in qs[:500]
                ],
            }
        )

    # -------------------- DRIVERS REPORTS --------------------
    @action(detail=False, methods=["get"], url_path="drivers/leaderboard")
    def drivers_leaderboard(self, request):
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny

        start = timezone.now() - timezone.timedelta(days=30)
        rows = (
            DriverPerformance.objects.filter(period_end__gte=start)
            .values("driver_id", "driver__driver_code", "driver__user__full_name")
            .annotate(avg_efficiency=Sum("efficiency_score") / Count("id"))
            .order_by("-avg_efficiency")[:20]
        )
        return Response({"results": list(rows)})

    # -------------------- NOTIFICATIONS / MESSAGES (stub prêt) --------------------
    @action(detail=False, methods=["get"], url_path="notifications")
    def notifications(self, request):
        """
        ✅ Pour l’instant stub.
        Quand tu me donnes ton futur model Notification/Message, on branche.
        """
        deny = self._deny_if_not_admin(request)
        if deny:
            return deny
        return Response({"count": 0, "results": []})
