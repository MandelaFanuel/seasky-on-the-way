// ========================= src/components/admin/dashboard/AdminUsersList.tsx =========================
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  alpha,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Card,
  CardContent,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as VisibilityIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  FlashOn as FlashOnIcon,
  LocationOn as LocationOnIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ContentCopy as ContentCopyIcon,
  Key as KeyIcon,
} from "@mui/icons-material";
import adminApi from "../../../services/adminApi";

export type AdminUsersListHandle = {
  refresh: () => Promise<void>;
};

type Props = {
  onLoadingChange?: (loading: boolean) => void;
  onStatsUpdate?: (stats: any) => void;
};

type ToastState = { type: "success" | "error" | "warning" | "info"; msg: string } | null;

type UserRow = {
  id: number;
  username: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  account_type?: string | null;
  account_type_label?: string | null;
  account_category?: string | null;
  account_category_label?: string | null;
  role?: string | null;
  kyc_status?: string | null;
  account_status?: string | null;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at?: string | null;
};

type UserDoc = {
  id: number;
  document_type?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  file?: string | null;
  uploaded_at?: string | null;
};

// Composant de carte de statistiques avec styles du Hero
const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        border: "1px solid rgba(11, 86, 140, 0.1)",
        overflow: "hidden",
        "&:hover": {
          transform: onClick ? "translateY(-8px)" : "none",
          boxShadow: onClick
            ? "0 20px 40px rgba(10, 52, 95, 0.15)"
            : "0 8px 32px rgba(10, 52, 95, 0.1)",
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 }, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: { xs: "50px", md: "60px" },
            height: { xs: "50px", md: "60px" },
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(
              color,
              0.05
            )} 100%)`,
            borderRadius: "0 0 0 100%",
          }}
        />

        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: { xs: "0.65rem", md: "0.7rem" },
                display: "block",
                mb: 1,
                color: "#335F7A",
                background: alpha("#0B568C", 0.08),
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                width: "fit-content",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mb: 0.5,
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "2.5rem" },
                background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontSize: { xs: "0.7rem", md: "0.75rem" },
                  color: "#487F9A",
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
              ml: { xs: 1, md: 2 },
            }}
          >
            <Box sx={{ color: "white", fontSize: { xs: "1.5rem", md: "1.75rem" } }}>{icon}</Box>
          </Box>
        </Box>

        {trend && trend !== "neutral" && (
          <Box display="flex" alignItems="center" sx={{ mt: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor:
                  trend === "up" ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                mr: 1,
              }}
            >
              {trend === "up" ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16, color: "#F44336" }} />
              )}
            </Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color={trend === "up" ? "#4CAF50" : "#F44336"}
              sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
            >
              {trend === "up" ? "+12%" : "-5%"} ce mois
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

function initials(name?: string | null) {
  const s = (name || "").trim();
  if (!s) return "U";
  const parts = s.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function isAdminUserRow(u: UserRow) {
  const role = (u.role || "").toLowerCase();
  return Boolean(u.is_staff || u.is_superuser || role === "admin");
}

function errMsg(e: any) {
  return e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Erreur inconnue";
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const AdminUsersList = forwardRef<AdminUsersListHandle, Props>(function AdminUsersList(
  { onLoadingChange, onStatsUpdate }: Props,
  ref
) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const onLoadingRef = useRef<Props["onLoadingChange"]>(onLoadingChange);
  useEffect(() => {
    onLoadingRef.current = onLoadingChange;
  }, [onLoadingChange]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [toast, setToast] = useState<ToastState>(null);

  const [docsOpen, setDocsOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsUser, setDocsUser] = useState<UserRow | null>(null);
  const [docs, setDocs] = useState<UserDoc[]>([]);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyUser, setVerifyUser] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const doFetch = async (signal?: AbortSignal) => {
    setLoading(true);
    onLoadingRef.current?.(true);
    try {
      const params: Record<string, any> = { page: page + 1, page_size: pageSize };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await adminApi.get("/admin/users/", { params, signal });

      const payload = res.data;
      let list: UserRow[] = [];

      if (Array.isArray(payload)) list = payload;
      else list = payload?.results || [];

      // Ne jamais afficher admin dans la liste
      list = list.filter((u) => !isAdminUserRow(u));

      if (!mountedRef.current) return;

      setRows(list);

      const computedCount = Array.isArray(payload)
        ? list.length
        : (payload?.count ?? (payload?.results?.length ?? 0));

      setCount(computedCount);

      // Mettre à jour les statistiques
      if (onStatsUpdate) {
        const activeUsers = list.filter((u) => u.is_active).length;
        const verifiedUsers = list.filter((u) => u.kyc_status === "verified").length;
        const pendingUsers = list.filter((u) => u.kyc_status === "pending").length;
        
        onStatsUpdate({
          total: computedCount,
          active: activeUsers,
          verified: verifiedUsers,
          pending: pendingUsers,
        });
      }
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;

      if (!mountedRef.current) return;
      setRows([]);
      setCount(0);
      setToast({ type: "error", msg: errMsg(e) });
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      onLoadingRef.current?.(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    doFetch(controller.signal);
    return () => controller.abort();
  }, [page, pageSize, statusFilter, search]);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await doFetch();
    },
  }));

  const openKycDocs = async (u: UserRow) => {
    setDocsUser(u);
    setDocs([]);
    setDocsOpen(true);
    setDocsLoading(true);
    try {
      const res = await adminApi.get(`/admin/users/${u.id}/documents/`);
      const payload = res.data;
      const list: UserDoc[] = Array.isArray(payload) ? payload : payload?.results || [];
      if (!mountedRef.current) return;
      setDocs(list);
    } catch (e: any) {
      if (!mountedRef.current) return;
      const status = e?.response?.status;
      if (status === 404 || status === 405) {
        setToast({ type: "warning", msg: "Endpoint manquant: GET /admin/users/{id}/documents/" });
      } else {
        setToast({ type: "error", msg: errMsg(e) });
      }
      setDocs([]);
    } finally {
      if (!mountedRef.current) return;
      setDocsLoading(false);
    }
  };

  const askVerify = (u: UserRow) => {
    setVerifyUser(u);
    setVerifyOpen(true);
  };

  const doVerify = async () => {
    if (!verifyUser) return;
    setBusy(true);
    try {
      await adminApi.post(`/admin/users/${verifyUser.id}/verify_kyc/`);
      setToast({ type: "success", msg: "✅ KYC/KYB validé: statut = verified" });
      setVerifyOpen(false);
      setVerifyUser(null);
      await doFetch();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404 || status === 405) {
        setToast({ type: "warning", msg: "Endpoint manquant: POST /admin/users/{id}/verify_kyc/" });
      } else {
        setToast({ type: "error", msg: errMsg(e) });
      }
    } finally {
      setBusy(false);
    }
  };

  const summary = useMemo(() => {
    const total = count;
    const active = rows.filter((u) => u.is_active).length;
    const verified = rows.filter((u) => u.kyc_status === "verified").length;
    const pending = rows.filter((u) => u.kyc_status === "pending").length;
    return { total, active, verified, pending };
  }, [rows, count]);

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)",
        minHeight: "100vh",
        marginTop: { xs: 4, md: 8 },
        py: { xs: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header du Dashboard */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} alignItems={isMobile ? "flex-start" : "center"} justifyContent="space-between" flexWrap="wrap" gap={3}>
          <Box display="flex" alignItems="center" gap={3} flexDirection={isMobile ? "column" : "row"} width={isMobile ? "100%" : "auto"}>
            <Box
              sx={{
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                borderRadius: 3,
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 40px rgba(10, 52, 95, 0.15)",
                border: "1px solid rgba(11, 86, 140, 0.1)",
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: { xs: 32, md: 44 }, color: "#0B568C" }} />
            </Box>
            <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Typography
                variant="h1"
                sx={{
                  color: "#1A4F75",
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "3rem" },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 1.5,
                  background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Gestion des Utilisateurs
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#335F7A",
                  fontWeight: 400,
                  fontSize: { xs: "0.9rem", md: "1.25rem" },
                  maxWidth: "600px",
                }}
              >
                Supervision et administration de tous les comptes utilisateurs
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Cartes de statistiques */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Box sx={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: { xs: 2, md: 3 },
          justifyContent: { xs: "center", sm: "flex-start" }
        }}>
          <Box
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 220px" },
              minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
              maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
            }}
          >
            <StatCard
              title="Utilisateurs Total"
              value={summary.total}
              icon={<PeopleIcon />}
              color="#0B568C"
              subtitle="Tous les comptes"
              trend="up"
            />
          </Box>

          <Box
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 220px" },
              minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
              maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
            }}
          >
            <StatCard
              title="Actifs"
              value={summary.active}
              icon={<FlashOnIcon />}
              color="#27B1E4"
              subtitle="Comptes actifs"
              trend="up"
            />
          </Box>

          <Box
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 220px" },
              minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
              maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
            }}
          >
            <StatCard
              title="Vérifiés"
              value={summary.verified}
              icon={<CheckCircleIcon />}
              color="#4CAF50"
              subtitle="KYC complété"
              trend="up"
            />
          </Box>

          <Box
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 220px" },
              minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
              maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
            }}
          >
            <StatCard
              title="En attente"
              value={summary.pending || 0}
              icon={<WarningIcon />}
              color="#FF9800"
              subtitle="KYC en cours"
              trend="neutral"
            />
          </Box>
        </Box>
      </Box>

      {/* Section Filtres */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          mb: { xs: 4, md: 6 },
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
          border: "1px solid rgba(11, 86, 140, 0.1)",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #0B568C 0%, #27B1E4 100%)",
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: "#1A4F75",
            fontWeight: 800,
            fontSize: { xs: "1.25rem", md: "1.5rem" },
          }}
        >
          Recherche & Filtres
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: { md: "flex-end" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Rechercher utilisateur (nom, username, email, téléphone...)"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(10, 52, 95, 0.05)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "#0B568C",
                    boxShadow: "0 8px 24px rgba(11, 86, 140, 0.1)",
                  },
                  "&.Mui-focused": {
                    borderColor: "#0B568C",
                    boxShadow: "0 0 0 3px rgba(11, 86, 140, 0.1)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#0B568C" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              flex: { xs: "1 1 auto", md: "0 0 auto" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: { xs: "100%", sm: 160 } }}>
              <InputLabel sx={{ fontWeight: 600, color: "#335F7A" }}>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => {
                  setPage(0);
                  setStatusFilter(e.target.value as any);
                }}
                sx={{
                  borderRadius: 3,
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(10, 52, 95, 0.05)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  "&:hover": { borderColor: "#0B568C" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="active">Actifs</MenuItem>
                <MenuItem value="inactive">Inactifs</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setPage(0);
                setSearch("");
                setStatusFilter("all");
              }}
              size={isMobile ? "small" : "medium"}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                borderWidth: 2,
                borderColor: "#335F7A",
                color: "#335F7A",
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.5 },
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  borderColor: "#1A4F75",
                  backgroundColor: alpha("#335F7A", 0.05),
                  borderWidth: 2,
                },
              }}
            >
              Réinitialiser
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Table des utilisateurs */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
          border: "1px solid rgba(11, 86, 140, 0.1)",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          overflowX: "auto",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
            background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
          }}
        >
          <Box display="flex" flexDirection={isMobile ? "column" : "row"} alignItems={isMobile ? "flex-start" : "center"} justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h5" sx={{ 
                color: "#1A4F75", 
                fontWeight: 800, 
                fontSize: { xs: "1.1rem", md: "1.5rem" }, 
                mb: 1 
              }}>
                Liste des Utilisateurs
              </Typography>
              <Typography variant="body1" sx={{ 
                color: "#335F7A", 
                fontWeight: 400,
                fontSize: { xs: "0.875rem", md: "1rem" }
              }}>
                Gérez et supervisez tous les comptes utilisateurs de la plateforme
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mt={isMobile ? 1 : 0}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#487F9A",
                  backgroundColor: alpha("#0B568C", 0.1),
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: { xs: "0.75rem", md: "0.875rem" }
                }}
              >
                {rows.length} utilisateur(s) affiché(s)
              </Typography>
              {loading && <CircularProgress size={24} sx={{ color: "#0B568C" }} />}
            </Box>
          </Box>
        </Box>

        <Box sx={{ overflowX: "auto", minHeight: 400 }}>
          <Table sx={{ minWidth: isMobile ? 800 : "auto" }}>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
                  borderBottom: "2px solid rgba(11, 86, 140, 0.1)",
                }}
              >
                <TableCell sx={{ 
                  fontWeight: 800, 
                  py: { xs: 2, md: 3 }, 
                  fontSize: { xs: "0.85rem", md: "0.95rem" }, 
                  color: "#1A4F75", 
                  borderBottom: "none",
                  minWidth: 180 
                }}>
                  Utilisateur
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  py: { xs: 2, md: 3 }, 
                  fontSize: { xs: "0.85rem", md: "0.95rem" }, 
                  color: "#1A4F75", 
                  borderBottom: "none",
                  minWidth: 180 
                }}>
                  Contact
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  py: { xs: 2, md: 3 }, 
                  fontSize: { xs: "0.85rem", md: "0.95rem" }, 
                  color: "#1A4F75", 
                  borderBottom: "none",
                  minWidth: 140 
                }}>
                  Type de Compte
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  py: { xs: 2, md: 3 }, 
                  fontSize: { xs: "0.85rem", md: "0.95rem" }, 
                  color: "#1A4F75", 
                  borderBottom: "none",
                  minWidth: 120 
                }}>
                  Statut
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  py: { xs: 2, md: 3 }, 
                  fontSize: { xs: "0.85rem", md: "0.95rem" }, 
                  color: "#1A4F75", 
                  borderBottom: "none",
                  minWidth: 120 
                }}>
                  KYC
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  py: { xs: 2, md: 3 }, 
                  fontSize: { xs: "0.85rem", md: "0.95rem" }, 
                  color: "#1A4F75", 
                  borderBottom: "none",
                  minWidth: 120 
                }}>
                  Création
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 800, 
                  py: { xs: 2, md: 3 }, 
                  fontSize: { xs: "0.85rem", md: "0.95rem" }, 
                  color: "#1A4F75", 
                  borderBottom: "none",
                  minWidth: 150 
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((u) => {
                const kyc = (u.kyc_status || "").toLowerCase();
                const isVerified = kyc === "verified";
                const isActive = !!u.is_active;

                const statusConfig = isActive
                  ? { color: "#4CAF50", bgColor: alpha("#4CAF50", 0.1), label: "Actif", icon: <CheckCircleIcon /> }
                  : { color: "#F44336", bgColor: alpha("#F44336", 0.1), label: "Inactif", icon: <BlockIcon /> };

                const kycConfig = {
                  verified: { color: "#4CAF50", bgColor: alpha("#4CAF50", 0.1), label: "Vérifié", icon: <VerifiedUserIcon /> },
                  pending: { color: "#FF9800", bgColor: alpha("#FF9800", 0.1), label: "En attente", icon: <WarningIcon /> },
                  rejected: { color: "#F44336", bgColor: alpha("#F44336", 0.1), label: "Rejeté", icon: <BlockIcon /> },
                  default: { color: "#487F9A", bgColor: alpha("#487F9A", 0.1), label: "Non soumis", icon: <PersonIcon /> },
                };

                const config = kycConfig[kyc as keyof typeof kycConfig] || kycConfig.default;

                return (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(11, 86, 140, 0.03)",
                        transform: "translateY(-2px)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      borderBottom: "1px solid rgba(11, 86, 140, 0.05)",
                    }}
                  >
                    <TableCell sx={{ py: { xs: 1.5, md: 2.5 } }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            width: { xs: 40, md: 48 },
                            height: { xs: 40, md: 48 },
                            bgcolor: "white",
                            color: "#0B568C",
                            fontWeight: 700,
                            fontSize: { xs: "1rem", md: "1.2rem" },
                            boxShadow: "0 8px 24px rgba(11, 86, 140, 0.15)",
                            border: "2px solid rgba(11, 86, 140, 0.1)",
                          }}
                        >
                          {initials(u.full_name || u.username)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            color: "#1A4F75", 
                            fontSize: { xs: "0.9rem", md: "1rem" }, 
                            fontWeight: 700 
                          }}>
                            {u.full_name || u.username || "-"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#487F9A",
                              backgroundColor: alpha("#0B568C", 0.1),
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              display: "inline-block",
                              fontWeight: 600,
                              fontSize: { xs: "0.65rem", md: "0.7rem" },
                            }}
                          >
                            @{u.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1.5, md: 2.5 } }}>
                      <Stack spacing={1.5}>
                        {u.email && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: "#335F7A",
                              fontSize: { xs: "0.8rem", md: "0.875rem" }
                            }}>
                              {u.email}
                            </Typography>
                          </Box>
                        )}
                        {u.phone && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ 
                              color: "#487F9A", 
                              fontWeight: 500,
                              fontSize: { xs: "0.75rem", md: "0.875rem" }
                            }}>
                              {u.phone}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1.5, md: 2.5 } }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: alpha("#0B568C", 0.1),
                          border: `1px solid ${alpha("#0B568C", 0.2)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#0B568C",
                            fontWeight: 700,
                            fontSize: { xs: "0.7rem", md: "0.75rem" },
                            textTransform: "capitalize",
                          }}
                        >
                          {u.account_type_label || u.account_type || "Standard"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1.5, md: 2.5 } }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: statusConfig.bgColor,
                          border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
                        }}
                      >
                        <Box sx={{ color: statusConfig.color, display: "flex" }}>
                          {statusConfig.icon}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: statusConfig.color,
                            fontWeight: 700,
                            fontSize: { xs: "0.7rem", md: "0.75rem" },
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {statusConfig.label}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1.5, md: 2.5 } }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: config.bgColor,
                          border: `1px solid ${alpha(config.color, 0.2)}`,
                        }}
                      >
                        <Box sx={{ color: config.color, display: "flex" }}>
                          {config.icon}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: config.color,
                            fontWeight: 700,
                            fontSize: { xs: "0.7rem", md: "0.75rem" },
                          }}
                        >
                          {config.label}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1.5, md: 2.5 } }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#487F9A",
                          fontWeight: 600,
                          display: "block",
                          fontSize: { xs: "0.75rem", md: "0.875rem" }
                        }}
                      >
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "-"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#335F7A",
                          fontWeight: 500,
                          display: "block",
                          fontSize: { xs: "0.7rem", md: "0.875rem" }
                        }}
                      >
                        {u.created_at ? new Date(u.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : ""}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ py: { xs: 1.5, md: 2.5 } }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                        <Tooltip title="Voir documents KYC">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DescriptionIcon />}
                            onClick={() => openKycDocs(u)}
                            sx={{
                              textTransform: "none",
                              borderRadius: "50px",
                              fontWeight: 600,
                              px: { xs: 1, md: 2 },
                              py: 0.5,
                              borderWidth: 2,
                              borderColor: "#0B568C",
                              color: "#0B568C",
                              fontSize: { xs: "0.75rem", md: "0.875rem" },
                              "&:hover": {
                                borderWidth: 2,
                                borderColor: "#0A345F",
                                backgroundColor: alpha("#0B568C", 0.05),
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            KYC
                          </Button>
                        </Tooltip>
                        <Tooltip title={isVerified ? "Déjà vérifié" : "Valider KYC"}>
                          <span>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<VerifiedUserIcon />}
                              disabled={isVerified || busy}
                              onClick={() => askVerify(u)}
                              sx={{
                                textTransform: "none",
                                borderRadius: "50px",
                                fontWeight: 600,
                                px: { xs: 1, md: 2 },
                                py: 0.5,
                                background: isVerified
                                  ? alpha("#4CAF50", 0.5)
                                  : "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
                                boxShadow: "0 8px 24px rgba(11, 86, 140, 0.3)",
                                fontSize: { xs: "0.75rem", md: "0.875rem" },
                                "&:hover": {
                                  background: isVerified
                                    ? alpha("#4CAF50", 0.5)
                                    : "linear-gradient(135deg, #0B568C 0%, #0A345F 100%)",
                                  boxShadow: "0 12px 32px rgba(10, 52, 95, 0.4)",
                                  transform: "translateY(-1px)",
                                },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            >
                              {isVerified ? "Vérifié" : "Valider"}
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 8 }}>
                    <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                      <PeopleIcon sx={{ fontSize: { xs: 60, md: 80 }, opacity: 0.2, mb: 3, color: "#0B568C" }} />
                      <Typography variant="h5" sx={{ 
                        color: "#1A4F75", 
                        mb: 2, 
                        fontWeight: 800, 
                        fontSize: { xs: "1.25rem", md: "1.75rem" } 
                      }}>
                        Aucun utilisateur trouvé
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: "#487F9A", 
                        mb: 4, 
                        maxWidth: 500, 
                        mx: "auto", 
                        fontWeight: 400, 
                        fontSize: { xs: "0.875rem", md: "1rem" } 
                      }}>
                        Ajustez vos filtres de recherche pour afficher des utilisateurs
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        {rows.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={count}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setPage(0);
              setPageSize(parseInt(e.target.value, 10));
            }}
            labelRowsPerPage="Lignes par page :"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{
              borderTop: "1px solid rgba(11, 86, 140, 0.1)",
              background: "linear-gradient(135deg, rgba(11, 86, 140, 0.02) 0%, transparent 100%)",
              "& .MuiTablePagination-toolbar": { 
                minHeight: 68, 
                px: { xs: 2, md: 3 },
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" }
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { 
                fontWeight: 600, 
                color: "#335F7A",
                fontSize: { xs: "0.875rem", md: "1rem" }
              },
              "& .MuiTablePagination-actions button": {
                color: "#0B568C",
                "&:hover": { backgroundColor: alpha("#0B568C", 0.1) },
              },
            }}
          />
        )}
      </Paper>

      {/* Dialog des documents KYC */}
      <Dialog open={docsOpen} onClose={() => setDocsOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: "#1A4F75",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            p: { xs: 2, md: 3 },
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: { xs: 36, md: 44 },
                height: { xs: 36, md: 44 },
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: alpha("#0B568C", 0.1),
                border: `1px solid ${alpha("#0B568C", 0.18)}`,
              }}
            >
              <DescriptionIcon sx={{ color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} />
            </Box>
            <Box>
              <Typography sx={{ 
                fontWeight: 900, 
                color: "#1A4F75",
                fontSize: { xs: "1rem", md: "1.25rem" }
              }}>
                Documents KYC/KYB
              </Typography>
              <Typography variant="caption" sx={{ 
                color: "#487F9A", 
                fontWeight: 700,
                fontSize: { xs: "0.75rem", md: "0.875rem" }
              }}>
                {docsUser?.full_name || docsUser?.username || "Utilisateur"}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setDocsOpen(false)} size={isMobile ? "small" : "medium"}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
          {docsLoading ? (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={18} sx={{ color: "#0B568C" }} />
              <Typography variant="body2" sx={{ color: "#335F7A", fontSize: { xs: "0.875rem", md: "1rem" } }}>
                Chargement des documents...
              </Typography>
            </Stack>
          ) : docs.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#487F9A", fontSize: { xs: "0.875rem", md: "1rem" } }}>
              Aucun document trouvé (ou endpoint manquant).
            </Typography>
          ) : (
            <Stack spacing={1.2}>
              {docs.map((d) => {
                const url = (d.file_url || d.file || "") as string;
                return (
                  <Paper
                    key={d.id}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      borderRadius: 2,
                      border: `1px solid ${alpha("#0B568C", 0.12)}`,
                      background: alpha("#0B568C", 0.02),
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.2}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography fontWeight={900} sx={{ 
                          color: "#1A4F75",
                          fontSize: { xs: "0.875rem", md: "1rem" }
                        }}>
                          {d.document_type || "Document"}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: "#487F9A",
                          fontSize: { xs: "0.75rem", md: "0.875rem" }
                        }}>
                          {d.file_name || "—"} • {d.uploaded_at ? new Date(d.uploaded_at).toLocaleString("fr-FR") : "—"}
                        </Typography>
                      </Box>

                      {url ? (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            borderRadius: "50px",
                            textTransform: "none",
                            fontWeight: 800,
                            borderWidth: 2,
                            borderColor: "#0B568C",
                            color: "#0B568C",
                            fontSize: { xs: "0.75rem", md: "0.875rem" },
                            "&:hover": {
                              borderWidth: 2,
                              borderColor: "#0A345F",
                              backgroundColor: alpha("#0B568C", 0.05),
                            },
                          }}
                        >
                          Ouvrir
                        </Button>
                      ) : (
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            backgroundColor: alpha("#F44336", 0.1),
                            border: `1px solid ${alpha("#F44336", 0.2)}`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#F44336",
                              fontWeight: 700,
                              fontSize: { xs: "0.7rem", md: "0.75rem" },
                            }}
                          >
                            URL manquante
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}

          <Divider sx={{ my: 2 }} />

          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              backgroundColor: alpha("#0B568C", 0.05),
              border: `1px solid ${alpha("#0B568C", 0.2)}`,
              fontSize: { xs: "0.875rem", md: "1rem" }
            }}
          >
            Si tu vois "endpoint manquant", ajoute côté backend: <b>GET /api/v1/admin/users/&lt;id&gt;/documents/</b>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDocsOpen(false)}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "#0B568C",
              color: "#0B568C",
              px: { xs: 2, md: 3 },
              py: { xs: 0.5, md: 1 },
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0A345F",
                backgroundColor: alpha("#0B568C", 0.05),
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog validation KYC */}
      <Dialog open={verifyOpen} onClose={() => setVerifyOpen(false)} maxWidth="xs" fullWidth fullScreen={isMobile}>
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: "#1A4F75",
            p: { xs: 2, md: 3 },
            fontSize: { xs: "1rem", md: "1.25rem" }
          }}
        >
          Valider KYC/KYB
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="body2" sx={{ 
            color: "#335F7A", 
            fontWeight: 600, 
            mb: 2,
            fontSize: { xs: "0.875rem", md: "1rem" }
          }}>
            Confirmer la validation pour <b>{verifyUser?.full_name || verifyUser?.username || ""}</b> ?
          </Typography>

          <Alert
            severity="info"
            sx={{
              mt: 2,
              fontWeight: 700,
              backgroundColor: alpha("#0B568C", 0.05),
              border: `1px solid ${alpha("#0B568C", 0.2)}`,
              fontSize: { xs: "0.875rem", md: "1rem" }
            }}
          >
            Après validation, le statut devient <b>verified</b> et le badge devient vert.
          </Alert>

          <Alert
            severity="warning"
            sx={{
              mt: 2,
              fontWeight: 700,
              backgroundColor: alpha("#FF9800", 0.05),
              border: `1px solid ${alpha("#FF9800", 0.2)}`,
              fontSize: { xs: "0.875rem", md: "1rem" }
            }}
          >
            Endpoint requis: <b>POST /api/v1/admin/users/&lt;id&gt;/verify_kyc/</b>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          <Button
            variant="outlined"
            onClick={() => setVerifyOpen(false)}
            disabled={busy}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "#0B568C",
              color: "#0B568C",
              px: { xs: 2, md: 3 },
              py: { xs: 0.5, md: 1 },
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0A345F",
                backgroundColor: alpha("#0B568C", 0.05),
              },
            }}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            onClick={doVerify}
            disabled={busy}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
              px: { xs: 2, md: 3 },
              py: { xs: 0.5, md: 1 },
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            {busy ? "Traitement..." : "Valider"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      {toast && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: isMobile ? "center" : "right" }}
          sx={{ 
            bottom: { xs: 90, md: 32 } // Éviter le bouton flottant sur mobile
          }}
        >
          <Alert
            severity={toast.type}
            sx={{
              borderRadius: 3,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              fontWeight: 600,
              fontSize: { xs: "0.875rem", md: "0.95rem" },
              alignItems: "center",
              border: `1px solid ${
                toast.type === "success"
                  ? alpha("#4CAF50", 0.2)
                  : toast.type === "error"
                  ? alpha("#F44336", 0.2)
                  : toast.type === "warning"
                  ? alpha("#FF9800", 0.2)
                  : alpha("#0B568C", 0.2)
              }`,
              minWidth: { xs: 280, md: 300 },
              "& .MuiAlert-icon": { fontSize: { xs: 24, md: 28 } },
            }}
            elevation={12}
          >
            {toast.msg}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
});

export default AdminUsersList;