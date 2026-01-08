import logging

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.pagination import PageNumberPagination

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserActivityLog, UserDocument
from .serializers import (
    LoginSerializer,
    PasswordChangeSerializer,
    UserDetailSerializer,
    UserDocumentSerializer,
    UserProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
    AgentCreateSerializer,
    AdminUserWriteSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()


# ========================= Helpers =========================
def _client_ip(request) -> str:
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    return x_forwarded_for.split(",")[0].strip() if x_forwarded_for else request.META.get("REMOTE_ADDR", "")


def _user_agent(request) -> str:
    return request.META.get("HTTP_USER_AGENT", "")


def _tokens_for_user(user) -> dict:
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    return {"refresh": str(refresh), "access": access_token}


def is_admin_user(user) -> bool:
    return bool(user and (user.is_superuser or user.is_staff or getattr(user, "role", "") == "admin"))


def _get_user_with_documents(user_id: int):
    try:
        qs = User.objects.filter(pk=user_id)
        try:
            qs = qs.prefetch_related("documents")
        except Exception:
            pass
        return qs.first()
    except Exception:
        return None


class IsAdminOrStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and is_admin_user(request.user))


# ========================= Pagination =========================
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


# ========================= Me =========================
class MeViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == "update_profile":
            return UserProfileUpdateSerializer
        return UserDetailSerializer

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=["get"])
    def profile(self, request):
        logger.info("[Me] profile read user=%s", request.user.username)
        fresh_user = _get_user_with_documents(request.user.id) or request.user
        return Response(UserDetailSerializer(fresh_user, context={"request": request}).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["put", "patch"])
    def update_profile(self, request):
        partial = request.method.upper() == "PATCH"
        logger.info("[Me] profile update user=%s partial=%s", request.user.username, partial)

        serializer = UserProfileUpdateSerializer(
            request.user, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            if is_admin_user(user):
                if getattr(user, "kyc_status", None) != "verified":
                    user.kyc_status = "verified"
                    user.save(update_fields=["kyc_status"])
        except Exception:
            pass

        try:
            user.refresh_from_db()
        except Exception:
            pass

        UserActivityLog.objects.create(
            user=request.user,
            action="profile_updated",
            details={"updated_fields": list(request.data.keys()), "user_id": user.id},
            ip_address=_client_ip(request),
            user_agent=_user_agent(request),
        )

        fresh_user = _get_user_with_documents(user.id) or user
        return Response(UserDetailSerializer(fresh_user, context={"request": request}).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def change_password(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        UserActivityLog.objects.create(
            user=request.user,
            action="password_changed",
            ip_address=_client_ip(request),
            user_agent=_user_agent(request),
        )

        return Response(
            {
                "message": _("Mot de passe changé avec succès"),
                "user": UserDetailSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def activity(self, request):
        qs = UserActivityLog.objects.filter(user=request.user).order_by("-created_at")[:200]
        data = [
            {
                "id": x.id,
                "action": getattr(x, "action", None),
                "activity_type": getattr(x, "activity_type", None),
                "details": getattr(x, "details", None),
                "ip_address": getattr(x, "ip_address", None),
                "created_at": getattr(x, "created_at", None),
            }
            for x in qs
        ]
        return Response({"count": len(data), "results": data}, status=status.HTTP_200_OK)


# ========================= Auth (JWT) =========================
class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == "register":
            return RegisterSerializer
        if self.action == "login":
            return LoginSerializer
        return super().get_serializer_class()

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=["post"], permission_classes=[AllowAny], authentication_classes=[])
    def register(self, request):
        logger.info("[Auth] Registration attempt from IP=%s", _client_ip(request))

        serializer = RegisterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = serializer.save()

            UserActivityLog.objects.create(
                user=user,
                action="registration_completed",
                details={
                    "account_type": getattr(user, "account_type", None),
                    "supplier_type": getattr(user, "supplier_type", None),
                    "delivery_type": getattr(user, "delivery_type", None),
                    "merchant_type": getattr(user, "merchant_type", None),
                    "kyc_status": getattr(user, "kyc_status", None),
                    "email": getattr(user, "email", None),
                    "username": getattr(user, "username", None),
                    "ip": _client_ip(request),
                },
                ip_address=_client_ip(request),
                user_agent=_user_agent(request),
            )

        try:
            payload = RegisterSerializer(user, context={"request": request}).data
            if not isinstance(payload, dict) or "tokens" not in payload:
                tokens = _tokens_for_user(user)
                payload = {
                    "success": True,
                    "message": _("✅ Inscription réussie !"),
                    "user": UserDetailSerializer(user, context={"request": request}).data,
                    "tokens": tokens,
                    "access": tokens["access"],
                    "refresh": tokens["refresh"],
                }
        except Exception as e:
            logger.exception("RegisterSerializer representation error: %s", e)
            tokens = _tokens_for_user(user)
            payload = {
                "success": True,
                "message": _("✅ Inscription réussie !"),
                "user": UserDetailSerializer(user, context={"request": request}).data,
                "tokens": tokens,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
            }

        return Response(payload, status=status.HTTP_201_CREATED)

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=["post"], permission_classes=[AllowAny], authentication_classes=[])
    def login(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        try:
            user.last_login_at = timezone.now()
            user.save(update_fields=["last_login_at"])
        except Exception:
            pass

        tokens = _tokens_for_user(user)

        UserActivityLog.objects.create(
            user=user,
            action="login_success",
            details={"login_method": "password"},
            ip_address=_client_ip(request),
            user_agent=_user_agent(request),
        )

        fresh_user = _get_user_with_documents(user.id) or user

        return Response(
            {
                "success": True,
                "message": _("Connexion réussie"),
                "user": UserDetailSerializer(fresh_user, context={"request": request}).data,
                "tokens": tokens,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
            },
            status=status.HTTP_200_OK,
        )

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=["post"], permission_classes=[AllowAny], authentication_classes=[])
    def refresh(self, request):
        refresh_token = request.data.get("refresh") or request.data.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "refresh token requis"}, status=400)

        try:
            refresh = RefreshToken(refresh_token)
            access = str(refresh.access_token)
            return Response(
                {"success": True, "access": access, "tokens": {"access": access, "refresh": str(refresh)}},
                status=200,
            )
        except TokenError:
            return Response({"detail": "refresh token invalide ou expiré"}, status=401)
        except Exception:
            return Response({"detail": "Impossible de rafraîchir le token"}, status=400)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout(self, request):
        refresh_token = request.data.get("refresh") or request.data.get("refresh_token")

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        UserActivityLog.objects.create(
            user=request.user,
            action="logout",
            ip_address=_client_ip(request),
            user_agent=_user_agent(request),
        )

        return Response({"success": True, "message": _("Déconnexion réussie")}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout_all(self, request):
        UserActivityLog.objects.create(
            user=request.user,
            action="logout_all_devices",
            details={"message": "Logout all devices requested"},
            ip_address=_client_ip(request),
            user_agent=_user_agent(request),
        )
        return Response({"success": True, "message": _("Déconnexion de tous les appareils effectuée")}, status=status.HTTP_200_OK)


# ========================= Documents (KYC) =========================
class UserDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserDocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return UserDocument.objects.filter(user=self.request.user).order_by("-uploaded_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        document = serializer.save(user=self.request.user)
        self._update_kyc_status(self.request.user)

        UserActivityLog.objects.create(
            user=self.request.user,
            action="document_uploaded",
            details={"document_type": document.document_type, "file_name": document.file_name, "document_id": document.id},
            ip_address=_client_ip(self.request),
            user_agent=_user_agent(self.request),
        )

    def perform_update(self, serializer):
        document = serializer.save()
        UserActivityLog.objects.create(
            user=self.request.user,
            action="document_updated",
            details={"document_type": document.document_type, "file_name": document.file_name, "document_id": document.id},
            ip_address=_client_ip(self.request),
            user_agent=_user_agent(self.request),
        )

    def perform_destroy(self, instance):
        UserActivityLog.objects.create(
            user=self.request.user,
            action="document_deleted",
            details={"document_type": instance.document_type, "file_name": instance.file_name, "document_id": instance.id},
            ip_address=_client_ip(self.request),
            user_agent=_user_agent(self.request),
        )
        instance.delete()
        self._update_kyc_status(self.request.user)

    def _update_kyc_status(self, user):
        docs = list(UserDocument.objects.filter(user=user).only("document_type"))
        user_doc_types = {d.document_type for d in docs}

        IDENTITY_DOCS = {
            UserDocument.DocumentTypes.ID_CARD,
            UserDocument.DocumentTypes.PASSPORT,
            UserDocument.DocumentTypes.DRIVING_LICENSE,
            UserDocument.DocumentTypes.OTHER,
        }

        account_type = getattr(user, "account_type", "") or ""

        def has_identity() -> bool:
            return any(t in user_doc_types for t in IDENTITY_DOCS)

        def has(doc_type: str) -> bool:
            return doc_type in user_doc_types

        if account_type == "client":
            required_ok = has_identity()
        elif account_type == "fournisseur":
            required_ok = has_identity() and has(UserDocument.DocumentTypes.BUSINESS_REGISTRATION)
        elif account_type == "livreur":
            required_ok = has_identity() and has(UserDocument.DocumentTypes.DRIVING_LICENSE)
        elif account_type == "commercant":
            required_ok = has_identity() and has(UserDocument.DocumentTypes.TRADE_LICENSE)
        elif account_type == "entreprise":
            contract_type = getattr(UserDocument.DocumentTypes, "CONTRACT", None)
            required_ok = has_identity() and has(UserDocument.DocumentTypes.BUSINESS_REGISTRATION)
            if contract_type:
                required_ok = required_ok and has(contract_type)
        else:
            required_ok = False

        user.kyc_status = "verified" if required_ok else "pending"
        user.save(update_fields=["kyc_status"])


# ========================= Admin: Agents =========================
class AgentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all().order_by("-created_at")

    def get_queryset(self):
        if not is_admin_user(self.request.user):
            return User.objects.none()
        return User.objects.filter(role="agent").order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return AgentCreateSerializer
        return UserSerializer

    def list(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)

        qs = self.get_queryset()

        search = (request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(full_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
                | Q(agent_code__icontains=search)
            )

        page = self.paginate_queryset(qs)
        if page is not None:
            data = UserSerializer(page, many=True, context={"request": request}).data
            return self.get_paginated_response(data)

        return Response(UserSerializer(qs, many=True, context={"request": request}).data, status=200)

    def create(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Seul l'administrateur peut créer un agent."}, status=403)

        ser = AgentCreateSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        agent = ser.save()

        UserActivityLog.objects.create(
            user=request.user,
            action="agent_created",
            details={"agent_id": agent.id, "agent_username": agent.username, "agent_code": getattr(agent, "agent_code", None)},
            ip_address=_client_ip(request),
            user_agent=_user_agent(request),
        )

        return Response(UserSerializer(agent, context={"request": request}).data, status=201)

    def update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({"detail": "Accès refusé."}, status=403)
        return super().destroy(request, *args, **kwargs)


# ========================= ✅ Admin Users (LIST + DOCS + VERIFY + CRUD) =========================

class AdminUsersViewSet(viewsets.ModelViewSet):
    """
    Endpoints attendus par ton frontend:
    - GET    /admin/users/
    - GET    /admin/users/<id>/
    - POST   /admin/users/
    - PATCH  /admin/users/<id>/
    - DELETE /admin/users/<id>/
    - GET    /admin/users/<id>/documents/
    - POST   /admin/users/<id>/verify_kyc/
    """
    permission_classes = [IsAuthenticated, IsAdminOrStaff]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # ✅ Base queryset
        qs = User.objects.all().order_by("-created_at", "-id")

        # ✅ Exclure admins/staff/superuser de la liste
        qs = qs.exclude(Q(is_superuser=True) | Q(is_staff=True) | Q(role__iexact="admin"))

        # ✅ Search
        search = (self.request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(full_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
                | Q(role__icontains=search)
                | Q(account_type__icontains=search)
            )

        # ✅ Status filter (frontend: all|active|inactive)
        status_param = (self.request.query_params.get("status") or "all").strip().lower()

        inactive_q = (
            Q(is_active=False)
            | Q(account_status__icontains="suspend")
            | Q(account_status__icontains="deactivated")
            | Q(account_status__icontains="inactive")
            | Q(account_status__icontains="block")
            | Q(account_status__icontains="disable")
        )

        if status_param == "active":
            qs = qs.filter(is_active=True).exclude(inactive_q)
        elif status_param == "inactive":
            qs = qs.filter(inactive_q)

        return qs

    def get_serializer_class(self):
        # ✅ GET => UserSerializer, WRITE => AdminUserWriteSerializer
        if self.action in ("create", "update", "partial_update"):
            return AdminUserWriteSerializer
        return UserSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    # ✅ IMPORTANT: rendre la liste ultra stable + logs (évite 500 silencieux)
    def list(self, request, *args, **kwargs):
        try:
            qs = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(qs)
            if page is not None:
                data = self.get_serializer(page, many=True).data
                return self.get_paginated_response(data)

            data = self.get_serializer(qs, many=True).data
            return Response({"count": len(data), "results": data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("AdminUsersViewSet.list error: %s", e)
            # ✅ En DEBUG, tu verras le traceback en logs; côté client on renvoie clean.
            return Response(
                {"detail": "Erreur serveur lors du chargement des utilisateurs."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Exception as e:
            logger.exception("AdminUsersViewSet.retrieve error: %s", e)
            return Response({"detail": "Erreur serveur."}, status=500)

    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        """
        GET /admin/users/<id>/documents/
        Retourne {"count": n, "results": [...]}
        """
        try:
            user = self.get_object()
            qs = UserDocument.objects.filter(user=user).order_by("-uploaded_at")
            data = UserDocumentSerializer(qs, many=True, context={"request": request}).data
            return Response({"count": len(data), "results": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("AdminUsersViewSet.documents error: %s", e)
            return Response({"detail": "Impossible de charger les documents."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["post"])
    def verify_kyc(self, request, pk=None):
        """
        POST /admin/users/<id>/verify_kyc/
        """
        try:
            user = self.get_object()

            user.kyc_status = "verified"
            user.kyc_verified_at = timezone.now()

            # ✅ Optionnel: si pending_kyc -> active
            if getattr(user, "account_status", "") == "pending_kyc":
                user.account_status = "active"

            # ✅ updated_at est auto_now, mais update_fields peut l’inclure sans casser
            user.save(update_fields=["kyc_status", "kyc_verified_at", "account_status", "updated_at"])

            UserActivityLog.objects.create(
                user=request.user,
                action="admin_kyc_verified",
                details={"target_user_id": user.id, "target_username": user.username},
                ip_address=_client_ip(request),
                user_agent=_user_agent(request),
            )

            return Response(
                {"success": True, "message": "KYC validé", "user": UserSerializer(user, context={"request": request}).data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.exception("AdminUsersViewSet.verify_kyc error: %s", e)
            return Response({"detail": "Impossible de valider le KYC."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_destroy(self, instance):
        try:
            UserActivityLog.objects.create(
                user=self.request.user,
                action="admin_user_deleted",
                details={"target_user_id": instance.id, "target_username": instance.username},
                ip_address=_client_ip(self.request),
                user_agent=_user_agent(self.request),
            )
        except Exception:
            pass
        instance.delete()
