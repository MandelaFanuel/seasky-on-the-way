// ========================= src/components/admin/dashboard/DriverDashboard.tsx =========================
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Tooltip,
  alpha,
  useTheme,
  Avatar,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TablePagination,
  InputAdornment,
  Badge,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from "@mui/material";

import {
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  FlashOn as FlashOnIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  DirectionsCar as DirectionsCarIcon,
  TwoWheeler as TwoWheelerIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsWalk as DirectionsWalkIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Speed as SpeedIcon,
  BatteryFull as BatteryFullIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  Key as KeyIcon,
} from "@mui/icons-material";

import DriverForm from "./DriverForm";
import DriverDetails from "./DriverDetails";
import DocumentManager from "./DocumentManager";
import AvailabilityWidget from "./AvailabilityWidget";
import PerformanceChart from "./PerformanceChart";

import { createDriver, listDrivers } from "../../../services/drivers.service";

// Helper pour normaliser les données
function normalizeListResponse(data: any): { results: any[]; count: number } {
  if (Array.isArray(data)) return { results: data, count: data.length };

  if (data && typeof data === "object") {
    const results = Array.isArray(data.results) ? data.results : [];
    const count = typeof data.count === "number" ? data.count : results.length;
    return { results, count };
  }

  return { results: [], count: 0 };
}

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
      <CardContent sx={{ p: 3, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60px",
            height: "60px",
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
                fontSize: "0.7rem",
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
                fontSize: "2.5rem",
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
                  fontSize: "0.75rem",
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
              width: 56,
              height: 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
              ml: 2,
            }}
          >
            <Box sx={{ color: "white" }}>{icon}</Box>
          </Box>
        </Box>

        {trend && trend !== "neutral" && (
          <Box display="flex" alignItems="center" sx={{ mt: 3 }}>
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
            >
              {trend === "up" ? "+12%" : "-5%"} ce mois
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export type DriverDashboardHandle = {
  openCreate: () => void;
  refresh: () => Promise<void>;
};

interface DriverDashboardProps {
  onStatsUpdate?: (stats: any) => void;
  onLoadingChange?: (loading: boolean) => void;
}

type CredentialsPayload = {
  roleLabel: "Chauffeur" | "Agent";
  username?: string;
  phone?: string;
  password?: string;
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
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

const DriverDashboard = forwardRef<DriverDashboardHandle, DriverDashboardProps>(
  function DriverDashboard({ onStatsUpdate, onLoadingChange }: DriverDashboardProps, ref) {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");

    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [openCreate, setOpenCreate] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [openDocs, setOpenDocs] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [filters, setFilters] = useState({
      status: "",
      transport_mode: "",
      search: "",
    });

    const [snack, setSnack] = useState<{
      open: boolean;
      msg: string;
      severity: "success" | "error" | "info";
    }>({
      open: false,
      msg: "",
      severity: "info",
    });

    const showSnack = (msg: string, severity: "success" | "error" | "info" = "info") => {
      setSnack({ open: true, msg, severity });
    };

    // ✅ Dialog credentials (affiché après création)
    const [openCreds, setOpenCreds] = useState(false);
    const [creds, setCreds] = useState<CredentialsPayload | null>(null);

    const closeCreds = () => {
      setOpenCreds(false);
      setCreds(null);
    };

    const buildCredsText = useMemo(() => {
      if (!creds) return "";
      const lines = [
        `Identifiants de connexion — ${creds.roleLabel}`,
        "",
        creds.username ? `Nom d'utilisateur: ${creds.username}` : "",
        creds.phone ? `Téléphone: ${creds.phone}` : "",
        creds.password ? `Mot de passe: ${creds.password}` : "",
        "",
        "Connexion: utilisez soit le nom d'utilisateur, soit le téléphone, puis le mot de passe.",
      ].filter(Boolean);
      return lines.join("\n");
    }, [creds]);

    useEffect(() => {
      onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    const fetchDrivers = useCallback(
      async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) setLoading(true);
        setError(null);

        try {
          const raw = await listDrivers({
            page: page + 1,
            page_size: rowsPerPage,
            ...filters,
          } as any);

          const { results, count } = normalizeListResponse(raw);
          setDrivers(results);
          setTotalCount(count);

          if (onStatsUpdate) {
            const summary = {
              total: count,
              verified: results.filter((d) => d.is_verified).length,
              active: results.filter((d) => d.status === "active").length,
              available: results.filter((d) => Boolean(d?.availability?.is_available)).length,
            };
            onStatsUpdate(summary);
          }
        } catch (e: any) {
          setError(
            e?.response?.data?.detail || e?.message || "Impossible de charger la liste des chauffeurs."
          );
        } finally {
          setLoading(false);
        }
      },
      [page, rowsPerPage, filters, onStatsUpdate]
    );

    useEffect(() => {
      fetchDrivers();
    }, [fetchDrivers]);

    const handleCreateDriver = useCallback(
      async (payload: any) => {
        // ✅ On capture les identifiants depuis le payload (admin saisit le password)
        const capturedCreds: CredentialsPayload = {
          roleLabel: "Chauffeur",
          username: String(payload?.username || "").trim() || undefined,
          phone: String(payload?.phone || "").trim() || undefined,
          password: String(payload?.password || "").trim() || undefined,
        };

        const created = await createDriver(payload);

        await fetchDrivers();

        showSnack(
          `Chauffeur créé avec succès: ${created?.full_name || created?.username || created?.driver_code || ""}`,
          "success"
        );

        // ✅ Afficher les identifiants à l'admin (une seule fois)
        if (capturedCreds.username || capturedCreds.phone) {
          setCreds(capturedCreds);
          setOpenCreds(true);
        } else {
          // si pas de username/phone, on affiche quand même un message utile
          showSnack("Chauffeur créé, mais identifiant manquant (username/téléphone).", "info");
        }

        return created;
      },
      [fetchDrivers]
    );

    const handleManualRefresh = useCallback(async () => {
      await fetchDrivers(true);
      showSnack("Données rafraîchies avec succès", "success");
    }, [fetchDrivers]);

    useImperativeHandle(
      ref,
      () => ({
        openCreate: () => setOpenCreate(true),
        refresh: async () => {
          await handleManualRefresh();
        },
      }),
      [handleManualRefresh]
    );

    const openDriverDetails = (driver: any) => {
      setSelected(driver);
      setOpenDetails(true);
    };

    const openDriverDocs = (driver: any) => {
      setSelected(driver);
      setOpenDocs(true);
    };

    const summary = useMemo(() => {
      const total = totalCount;
      const verified = drivers.filter((d) => d.is_verified).length;
      const active = drivers.filter((d) => d.status === "active").length;
      const pending = drivers.filter((d) => d.status === "pending").length;
      const available = drivers.filter((d) => Boolean(d?.availability?.is_available)).length;
      return { total, verified, active, pending, available };
    }, [drivers, totalCount]);

    const renderStatusChip = (status: string) => {
      const statusConfig: Record<string, any> = {
        active: { color: "#0B568C", bgColor: alpha("#0B568C", 0.1), label: "Actif", icon: <CheckCircleIcon /> },
        inactive: { color: "#F44336", bgColor: alpha("#F44336", 0.1), label: "Inactif", icon: <CancelIcon /> },
        on_duty: { color: "#27B1E4", bgColor: alpha("#27B1E4", 0.1), label: "En service", icon: <SpeedIcon /> },
        off_duty: { color: "#487F9A", bgColor: alpha("#487F9A", 0.1), label: "Hors service", icon: <AccessTimeIcon /> },
        on_break: { color: "#FF9800", bgColor: alpha("#FF9800", 0.1), label: "En pause", icon: <BatteryFullIcon /> },
        on_leave: { color: "#2196F3", bgColor: alpha("#2196F3", 0.1), label: "En congé", icon: <CalendarTodayIcon /> },
        pending: { color: "#FF9800", bgColor: alpha("#FF9800", 0.1), label: "En attente", icon: <WarningIcon /> },
      };
      const config = statusConfig[status] || statusConfig.active;

      return (
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
          <Box sx={{ color: config.color, display: "flex" }}>{config.icon}</Box>
          <Typography
            variant="caption"
            sx={{
              color: config.color,
              fontWeight: 700,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {config.label}
          </Typography>
        </Box>
      );
    };

    const renderTransportIcon = (mode: string) => {
      const iconColor = "#0B568C";
      switch (mode) {
        case "vehicule":
          return <DirectionsCarIcon sx={{ color: iconColor }} />;
        case "moto":
          return <TwoWheelerIcon sx={{ color: iconColor }} />;
        case "velo":
          return <TwoWheelerIcon sx={{ color: iconColor }} />;
        case "camion":
          return <LocalShippingIcon sx={{ color: iconColor }} />;
        case "pied":
          return <DirectionsWalkIcon sx={{ color: iconColor }} />;
        default:
          return <DirectionsCarIcon sx={{ color: iconColor }} />;
      }
    };

    const handlePageChange = (_: any, newPage: number) => setPage(newPage);

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleFilterChange = (name: string, value: any) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
      setPage(0);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange("search", event.target.value);
    };

    return (
      <Box
        sx={{
          background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)",
          minHeight: "100vh",
          marginTop: 8,
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Header du Dashboard (sans les 2 boutons - déplacés au parent AdminDashboard) */}
        <Box sx={{ mb: 6 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={3}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 3,
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 40px rgba(10, 52, 95, 0.15)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                }}
              >
                <DashboardIcon sx={{ fontSize: 44, color: "#0B568C" }} />
              </Box>
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    color: "#1A4F75",
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 1.5,
                    background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Gestion des Chauffeurs
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#335F7A",
                    fontWeight: 400,
                    fontSize: { xs: "1rem", md: "1.25rem" },
                    maxWidth: "600px",
                  }}
                >
                  Suivi et supervision de votre flotte de chauffeurs
                </Typography>
              </Box>
            </Box>
            {/* 👇 ici avant il y avait les boutons, maintenant rien (déplacés au parent) */}
          </Box>
        </Box>

        {/* Cartes de statistiques */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box
              sx={{
                flex: "1 1 220px",
                minWidth: "220px",
                maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
              }}
            >
              <StatCard title="Chauffeurs Total" value={summary.total} icon={<PeopleIcon />} color="#0B568C" subtitle="Flotte totale" trend="up" />
            </Box>

            <Box
              sx={{
                flex: "1 1 220px",
                minWidth: "220px",
                maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
              }}
            >
              <StatCard title="Vérifiés" value={summary.verified} icon={<CheckCircleIcon />} color="#4CAF50" subtitle="Documents complets" trend="up" />
            </Box>

            <Box
              sx={{
                flex: "1 1 220px",
                minWidth: "220px",
                maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
              }}
            >
              <StatCard title="Actifs" value={summary.active} icon={<FlashOnIcon />} color="#27B1E4" subtitle="En service actuel" trend="up" />
            </Box>

            <Box
              sx={{
                flex: "1 1 220px",
                minWidth: "220px",
                maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" },
              }}
            >
              <StatCard title="Disponibles" value={summary.available || 0} icon={<LocationOnIcon />} color="#FF9800" subtitle="En ligne maintenant" trend="neutral" />
            </Box>
          </Box>
        </Box>

        {/* Section Filtres */}
        <Paper
          sx={{
            p: 4,
            mb: 6,
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
              fontSize: "1.5rem",
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
                placeholder="Rechercher chauffeur (nom, code, téléphone, email...)"
                value={filters.search}
                onChange={handleSearch}
                size="medium"
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
              }}
            >
              <FormControl size="medium" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ fontWeight: 600, color: "#335F7A" }}>Statut</InputLabel>
                <Select
                  value={filters.status}
                  label="Statut"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "white",
                    boxShadow: "0 4px 12px rgba(10, 52, 95, 0.05)",
                    border: "1px solid rgba(11, 86, 140, 0.1)",
                    "&:hover": { borderColor: "#0B568C" },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  }}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                  <MenuItem value="on_duty">En service</MenuItem>
                  <MenuItem value="off_duty">Hors service</MenuItem>
                  <MenuItem value="on_break">En pause</MenuItem>
                  <MenuItem value="on_leave">En congé</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="medium" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ fontWeight: 600, color: "#335F7A" }}>Transport</InputLabel>
                <Select
                  value={filters.transport_mode}
                  label="Transport"
                  onChange={(e) => handleFilterChange("transport_mode", e.target.value)}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "white",
                    boxShadow: "0 4px 12px rgba(10, 52, 95, 0.05)",
                    border: "1px solid rgba(11, 86, 140, 0.1)",
                    "&:hover": { borderColor: "#0B568C" },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  }}
                >
                  <MenuItem value="">Tous les types</MenuItem>
                  <MenuItem value="vehicule">Véhicule</MenuItem>
                  <MenuItem value="moto">Moto</MenuItem>
                  <MenuItem value="velo">Vélo</MenuItem>
                  <MenuItem value="camion">Camion</MenuItem>
                  <MenuItem value="pied">À pied</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilters({ status: "", transport_mode: "", search: "" })}
                size="medium"
                sx={{
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: "#335F7A",
                  color: "#335F7A",
                  px: 3,
                  py: 1.5,
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

        {/* Section Graphiques */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 4 }}>
            <Box sx={{ flex: { xs: "1 1 auto", lg: "1 1 70%" }, minWidth: 0 }}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  height: "100%",
                  boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                }}
              >
                <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: "1.5rem", mb: 2 }}>
                  Analyse des Performances
                </Typography>
                <Typography variant="body1" sx={{ color: "#335F7A", mb: 4, fontWeight: 400 }}>
                  Suivi des indicateurs clés de performance des chauffeurs
                </Typography>
                <PerformanceChart data={{ drivers: drivers.length }} />
              </Paper>
            </Box>

            <Box sx={{ flex: { xs: "1 1 auto", lg: "1 1 30%" }, minWidth: 0 }}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  height: "100%",
                  boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                }}
              >
                <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: "1.5rem", mb: 2 }}>
                  Disponibilité en Direct
                </Typography>
                <Typography variant="body1" sx={{ color: "#335F7A", mb: 4, fontWeight: 400 }}>
                  Suivi en temps réel des chauffeurs disponibles
                </Typography>
                <AvailabilityWidget />
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Table des chauffeurs */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
            border: "1px solid rgba(11, 86, 140, 0.1)",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        >
          <Box
            sx={{
              p: 4,
              borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
              background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: "1.5rem", mb: 1 }}>
                  Liste des Chauffeurs
                </Typography>
                <Typography variant="body1" sx={{ color: "#335F7A", fontWeight: 400 }}>
                  Gérez et surveillez tous les chauffeurs de votre flotte
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#487F9A",
                    backgroundColor: alpha("#0B568C", 0.1),
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  {drivers.length} chauffeur(s) affiché(s)
                </Typography>
                {loading && <CircularProgress size={24} sx={{ color: "#0B568C" }} />}
              </Box>
            </Box>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
                    borderBottom: "2px solid rgba(11, 86, 140, 0.1)",
                  }}
                >
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Chauffeur
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Contact
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Mode de transport
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Statut
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Vérification
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {drivers.map((driver) => (
                  <TableRow
                    key={driver.id}
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
                    <TableCell sx={{ py: 2.5 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          badgeContent={
                            driver.rating ? (
                              <Box
                                sx={{
                                  backgroundColor: "#FF9800",
                                  color: "white",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
                                  border: "2px solid white",
                                }}
                              >
                                {Number(driver.rating).toFixed(1)}
                              </Box>
                            ) : null
                          }
                        >
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: "white",
                              color: "#0B568C",
                              fontWeight: 700,
                              fontSize: "1.2rem",
                              boxShadow: "0 8px 24px rgba(11, 86, 140, 0.15)",
                              border: "2px solid rgba(11, 86, 140, 0.1)",
                            }}
                          >
                            {(driver.full_name || driver.username || "C").charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: "#1A4F75", fontSize: "1rem", fontWeight: 700 }}>
                            {driver.full_name || driver.username || "-"}
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
                              fontSize: "0.7rem",
                            }}
                          >
                            ID: {driver.driver_code || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon sx={{ fontSize: 16, color: "#0B568C", opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#335F7A" }}>
                            {driver.phone || "-"}
                          </Typography>
                        </Box>
                        {driver.email && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <EmailIcon sx={{ fontSize: 16, color: "#0B568C", opacity: 0.8 }} />
                            <Typography variant="caption" sx={{ color: "#487F9A", fontWeight: 500 }}>
                              {driver.email}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
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
                        {renderTransportIcon(driver.transport_mode)}
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#0B568C",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {driver.transport_mode
                            ? driver.transport_mode.charAt(0).toUpperCase() + driver.transport_mode.slice(1)
                            : "Non spécifié"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>{renderStatusChip(driver.status)}</TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: driver.is_verified ? alpha("#4CAF50", 0.1) : alpha("#FF9800", 0.1),
                          border: `1px solid ${
                            driver.is_verified ? alpha("#4CAF50", 0.2) : alpha("#FF9800", 0.2)
                          }`,
                        }}
                      >
                        {driver.is_verified ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
                        ) : (
                          <WarningIcon sx={{ fontSize: 16, color: "#FF9800" }} />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: driver.is_verified ? "#4CAF50" : "#FF9800",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        >
                          {driver.is_verified ? "Vérifié" : "En attente"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 2.5 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Voir détails">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => openDriverDetails(driver)}
                            sx={{
                              textTransform: "none",
                              borderRadius: "50px",
                              fontWeight: 600,
                              px: 2.5,
                              py: 1,
                              borderWidth: 2,
                              borderColor: "#0B568C",
                              color: "#0B568C",
                              "&:hover": {
                                borderWidth: 2,
                                borderColor: "#0A345F",
                                backgroundColor: alpha("#0B568C", 0.05),
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            Détails
                          </Button>
                        </Tooltip>
                        <Tooltip title="Gérer documents">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<DescriptionIcon />}
                            onClick={() => openDriverDocs(driver)}
                            sx={{
                              textTransform: "none",
                              borderRadius: "50px",
                              fontWeight: 600,
                              px: 2.5,
                              py: 1,
                              background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
                              boxShadow: "0 8px 24px rgba(11, 86, 140, 0.3)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #0B568C 0%, #0A345F 100%)",
                                boxShadow: "0 12px 32px rgba(10, 52, 95, 0.4)",
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            Documents
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {drivers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 8 }}>
                      <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                        <PeopleIcon sx={{ fontSize: 80, opacity: 0.2, mb: 3, color: "#0B568C" }} />
                        <Typography variant="h5" sx={{ color: "#1A4F75", mb: 2, fontWeight: 800, fontSize: "1.75rem" }}>
                          Aucun chauffeur trouvé
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#487F9A", mb: 4, maxWidth: 500, mx: "auto", fontWeight: 400, fontSize: "1rem" }}>
                          Commencez par ajouter votre premier chauffeur ou ajustez vos filtres de recherche
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PersonAddIcon />}
                          onClick={() => setOpenCreate(true)}
                          sx={{
                            mt: 2,
                            borderRadius: "50px",
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                            boxShadow: "0 12px 32px rgba(11, 86, 140, 0.4)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)",
                              boxShadow: "0 16px 40px rgba(10, 52, 95, 0.5)",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          Ajouter un chauffeur
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {drivers.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                borderTop: "1px solid rgba(11, 86, 140, 0.1)",
                background: "linear-gradient(135deg, rgba(11, 86, 140, 0.02) 0%, transparent 100%)",
                "& .MuiTablePagination-toolbar": { minHeight: 68, px: 3 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontWeight: 600, color: "#335F7A" },
                "& .MuiTablePagination-actions button": {
                  color: "#0B568C",
                  "&:hover": { backgroundColor: alpha("#0B568C", 0.1) },
                },
              }}
            />
          )}
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 4,
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(244, 67, 54, 0.15)",
              border: "1px solid rgba(244, 67, 54, 0.2)",
              backgroundColor: "rgba(244, 67, 54, 0.05)",
              "& .MuiAlert-icon": { fontSize: 28 },
            }}
            onClose={() => setError(null)}
          >
            <Typography fontWeight={700}>{error}</Typography>
          </Alert>
        )}

        {/* Modales */}
        <DriverForm open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={handleCreateDriver} />

        <DriverDetails
          open={openDetails}
          driver={selected}
          onClose={() => setOpenDetails(false)}
          onVerify={() => showSnack("Action de vérification: à connecter à l'API", "info")}
          onSuspend={() => showSnack("Action de suspension: à connecter à l'API", "info")}
          onActivate={() => showSnack("Action d'activation: à connecter à l'API", "info")}
          onDelete={() => showSnack("Action de suppression: à connecter à l'API", "info")}
        />

        <DocumentManager open={openDocs} driver={selected} onClose={() => setOpenDocs(false)} />

        {/* ✅ Dialog identifiants (après création chauffeur) */}
        <Dialog open={openCreds} onClose={closeCreds} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{
              fontWeight: 900,
              color: "#1A4F75",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: alpha("#0B568C", 0.1),
                  border: `1px solid ${alpha("#0B568C", 0.18)}`,
                }}
              >
                <KeyIcon sx={{ color: "#0B568C" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, color: "#1A4F75" }}>
                  Identifiants de connexion
                </Typography>
                <Typography variant="caption" sx={{ color: "#487F9A", fontWeight: 700 }}>
                  À transmettre au {creds?.roleLabel?.toLowerCase() || "compte"}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={closeCreds}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
              <Typography fontWeight={800}>
                Ces identifiants s’affichent maintenant pour que vous puissiez les communiquer.
              </Typography>
            </Alert>

            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                border: "1px solid rgba(11, 86, 140, 0.12)",
                boxShadow: "0 10px 28px rgba(10, 52, 95, 0.08)",
              }}
            >
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 140, fontWeight: 900, color: "#335F7A" }}>
                    Username
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#1A4F75" }}>
                    {creds?.username || "—"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 140, fontWeight: 900, color: "#335F7A" }}>
                    Téléphone
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#1A4F75" }}>
                    {creds?.phone || "—"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 140, fontWeight: 900, color: "#335F7A" }}>
                    Mot de passe
                  </Typography>
                  <Typography sx={{ fontWeight: 900, color: "#0B568C" }}>
                    {creds?.password || "—"}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1.2 }} />

                <Typography variant="caption" sx={{ color: "#487F9A", fontWeight: 700 }}>
                  Connexion: utilisez soit le nom d'utilisateur, soit le téléphone + mot de passe.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={async () => {
                      const ok = await copyToClipboard(buildCredsText);
                      showSnack(ok ? "Identifiants copiés !" : "Impossible de copier.", ok ? "success" : "error");
                    }}
                    sx={{
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 900,
                      px: 3,
                      background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                      boxShadow: "0 8px 24px rgba(11, 86, 140, 0.35)",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    Copier les identifiants
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={closeCreds}
                    sx={{
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 900,
                      borderWidth: 2,
                      borderColor: alpha("#0B568C", 0.35),
                      color: "#0B568C",
                      "&:hover": { borderWidth: 2, backgroundColor: alpha("#0B568C", 0.05) },
                    }}
                  >
                    Fermer
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeCreds} sx={{ fontWeight: 900, textTransform: "none" }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={5000}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ "& .MuiSnackbar-root": { bottom: { xs: 100, sm: 32 } } }}
        >
          <Alert
            severity={snack.severity}
            sx={{
              borderRadius: 3,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              fontWeight: 600,
              fontSize: "0.95rem",
              alignItems: "center",
              border: `1px solid ${
                snack.severity === "success"
                  ? alpha("#4CAF50", 0.2)
                  : snack.severity === "error"
                  ? alpha("#F44336", 0.2)
                  : alpha("#0B568C", 0.2)
              }`,
              minWidth: 300,
              "& .MuiAlert-icon": { fontSize: 28 },
            }}
            elevation={12}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
);

export default DriverDashboard;
