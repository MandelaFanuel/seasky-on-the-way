// ========================= src/components/admin/dashboard/AgentDashboard.tsx =========================
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
  Chip,
} from "@mui/material";

import {
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  FlashOn as FlashOnIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  VerifiedUser as VerifiedUserIcon,
  Block as BlockIcon,
} from "@mui/icons-material";

import AgentForm from "../agents/AgentForm";
import { createAgent, listAgents, Agent } from "@/services/agents.service";

// StatCard (même style que tes dashboards)
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
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
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
                backgroundColor: trend === "up" ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                mr: 1,
              }}
            >
              {trend === "up" ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16, color: "#F44336" }} />
              )}
            </Box>
            <Typography variant="caption" fontWeight={700} color={trend === "up" ? "#4CAF50" : "#F44336"}>
              {trend === "up" ? "+12%" : "-5%"} ce mois
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export type AgentDashboardHandle = {
  openCreate: () => void;
  refresh: () => Promise<void>;
};

interface AgentDashboardProps {
  onLoadingChange?: (loading: boolean) => void;
}

const AgentDashboard = forwardRef<AgentDashboardHandle, AgentDashboardProps>(
  function AgentDashboard({ onLoadingChange }: AgentDashboardProps, ref) {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");

    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [openCreate, setOpenCreate] = useState(false);
    const [selected, setSelected] = useState<Agent | null>(null);
    const [openDetails, setOpenDetails] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [filters, setFilters] = useState({
      status: "", // active/inactive
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

    useEffect(() => {
      onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    const fetchAgents = useCallback(
      async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) setLoading(true);
        setError(null);

        try {
          const { results, count } = await listAgents({
            page: page + 1,
            page_size: rowsPerPage,
            search: filters.search || undefined,
          });

          let filtered = results;

          if (filters.status) {
            const wantActive = filters.status === "active";
            filtered = filtered.filter((u) => Boolean(u?.is_active) === wantActive);
          }

          setAgents(filtered);
          setTotalCount(filters.status ? filtered.length : count);
        } catch (e: any) {
          setAgents([]);
          setTotalCount(0);
          setError(e?.response?.data?.detail || e?.message || "Impossible de charger la liste des agents.");
        } finally {
          setLoading(false);
        }
      },
      [page, rowsPerPage, filters.status, filters.search]
    );

    useEffect(() => {
      fetchAgents();
    }, [fetchAgents]);

    const handleCreateAgent = useCallback(
      async (payload: any) => {
        const created = await createAgent(payload);
        await fetchAgents();
        showSnack(`Agent créé: ${created?.full_name || created?.username || ""}`, "success");
        return created;
      },
      [fetchAgents]
    );

    const handleManualRefresh = useCallback(async () => {
      await fetchAgents(true);
      showSnack("Données rafraîchies", "success");
    }, [fetchAgents]);

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

    const openAgentDetails = (agent: Agent) => {
      setSelected(agent);
      setOpenDetails(true);
    };

    const summary = useMemo(() => {
      const total = totalCount;
      const active = agents.filter((a) => a?.is_active === true).length;
      const inactive = agents.filter((a) => a?.is_active === false).length;
      const verified = agents.filter((a) => a?.is_verified === true || a?.is_staff === true).length;
      return { total, active, inactive, verified };
    }, [agents, totalCount]);

    const renderStatusChip = (isActive: boolean) => {
      const color = isActive ? "#0B568C" : "#F44336";
      const bg = alpha(color, 0.1);
      const label = isActive ? "Actif" : "Inactif";
      const icon = isActive ? <CheckCircleIcon /> : <BlockIcon />;

      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: bg,
            border: `1px solid ${alpha(color, 0.2)}`,
          }}
        >
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
          <Typography
            variant="caption"
            sx={{
              color,
              fontWeight: 700,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Typography>
        </Box>
      );
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

    return (
      <Box
        sx={{
          background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)",
          minHeight: "100vh",
          marginTop: 4,
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 6 }} marginTop={4}>
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
                <PeopleIcon sx={{ fontSize: 44, color: "#0B568C" }} />
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
                  Gestion des Agents
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
                  Ajout et suivi des agents du système
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Stat cards */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="Agents Total" value={summary.total} icon={<PeopleIcon />} color="#0B568C" subtitle="Utilisateurs agent" trend="up" />
            </Box>

            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="Actifs" value={summary.active} icon={<FlashOnIcon />} color="#27B1E4" subtitle="Accès autorisé" trend="up" />
            </Box>

            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="Inactifs" value={summary.inactive} icon={<BlockIcon />} color="#F44336" subtitle="Accès suspendu" trend="down" />
            </Box>

            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="Vérifiés" value={summary.verified} icon={<VerifiedUserIcon />} color="#4CAF50" subtitle="Staff/verified" trend="neutral" />
            </Box>
          </Box>
        </Box>

        {/* Filtres */}
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
          <Typography variant="h5" sx={{ mb: 3, color: "#1A4F75", fontWeight: 800, fontSize: "1.5rem" }}>
            Recherche & Filtres
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, alignItems: { md: "flex-end" } }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Rechercher (username, nom, téléphone, email...)"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "white",
                    boxShadow: "0 4px 12px rgba(10, 52, 95, 0.05)",
                    border: "1px solid rgba(11, 86, 140, 0.1)",
                    transition: "all 0.3s",
                    "&:hover": { borderColor: "#0B568C", boxShadow: "0 8px 24px rgba(11, 86, 140, 0.1)" },
                    "&.Mui-focused": { borderColor: "#0B568C", boxShadow: "0 0 0 3px rgba(11, 86, 140, 0.1)" },
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

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, flex: { xs: "1 1 auto", md: "0 0 auto" } }}>
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
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilters({ status: "", search: "" })}
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
                  "&:hover": { borderColor: "#1A4F75", backgroundColor: alpha("#335F7A", 0.05), borderWidth: 2 },
                }}
              >
                Réinitialiser
              </Button>

              <Button
                variant="contained"
                onClick={handleManualRefresh}
                disabled={loading}
                sx={{
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
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
                {loading ? "Chargement..." : "Actualiser"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Table */}
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
                  Liste des Agents
                </Typography>
                <Typography variant="body1" sx={{ color: "#335F7A", fontWeight: 400 }}>
                  Gestion des agents (création + suivi)
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
                  {agents.length} agent(s) affiché(s)
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
                    Agent
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Contact
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Statut
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Code
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, py: 3, fontSize: "0.95rem", color: "#1A4F75", borderBottom: "none" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {agents.map((agent) => (
                  <TableRow
                    key={agent.id || agent.username}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "rgba(11, 86, 140, 0.03)" },
                      borderBottom: "1px solid rgba(11, 86, 140, 0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <TableCell sx={{ py: 2.5 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          badgeContent={
                            agent.is_staff || agent.is_verified ? (
                              <Box
                                sx={{
                                  backgroundColor: "#4CAF50",
                                  color: "white",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                                  border: "2px solid white",
                                }}
                              >
                                ✓
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
                            {(agent.full_name || agent.username || "A").charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: "#1A4F75", fontSize: "1rem", fontWeight: 800 }}>
                            {agent.full_name || agent.username || "-"}
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
                              fontWeight: 700,
                              fontSize: "0.7rem",
                            }}
                          >
                            @{agent.username || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Stack spacing={1.3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon sx={{ fontSize: 16, color: "#0B568C", opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#335F7A" }}>
                            {agent.phone || "-"}
                          </Typography>
                        </Box>
                        {agent.email && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <EmailIcon sx={{ fontSize: 16, color: "#0B568C", opacity: 0.8 }} />
                            <Typography variant="caption" sx={{ color: "#487F9A", fontWeight: 600 }}>
                              {agent.email}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>{renderStatusChip(Boolean(agent.is_active))}</TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      {agent.agent_code ? (
                        <Chip label={agent.agent_code} size="small" sx={{ fontWeight: 800 }} />
                      ) : (
                        <Chip label="—" size="small" variant="outlined" />
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ py: 2.5 }}>
                      <Tooltip title="Voir détails">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => openAgentDetails(agent)}
                          sx={{
                            textTransform: "none",
                            borderRadius: "50px",
                            fontWeight: 700,
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
                            transition: "all 0.25s ease",
                          }}
                        >
                          Détails
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {agents.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 8 }}>
                      <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                        <PeopleIcon sx={{ fontSize: 80, opacity: 0.2, mb: 3, color: "#0B568C" }} />
                        <Typography variant="h5" sx={{ color: "#1A4F75", mb: 2, fontWeight: 900, fontSize: "1.75rem" }}>
                          Aucun agent trouvé
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#487F9A", mb: 4, maxWidth: 500, mx: "auto", fontWeight: 500 }}>
                          Ajoute ton premier agent ou ajuste les filtres.
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
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                            boxShadow: "0 12px 32px rgba(11, 86, 140, 0.4)",
                            "&:hover": { background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)", transform: "translateY(-2px)" },
                            transition: "all 0.25s ease",
                          }}
                        >
                          Ajouter un agent
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {agents.length > 0 && (
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
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontWeight: 700, color: "#335F7A" },
                "& .MuiTablePagination-actions button": { color: "#0B568C", "&:hover": { backgroundColor: alpha("#0B568C", 0.1) } },
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
            <Typography fontWeight={800}>{error}</Typography>
          </Alert>
        )}

        {/* Modales */}
        <AgentForm open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={handleCreateAgent} />

        <AgentDetailsDialog open={openDetails} agent={selected} onClose={() => setOpenDetails(false)} />

        {/* Snackbar */}
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
              fontWeight: 700,
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

function AgentDetailsDialog({ open, agent, onClose }: { open: boolean; agent: Agent | null; onClose: () => void }) {
  if (!agent) return null;

  const fmt = (v: any) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleString("fr-FR");
    } catch {
      return String(v);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>Détails Agent</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>
              {agent.full_name || agent.username}{" "}
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {agent.username ? `(@${agent.username})` : ""}
              </Box>
            </Typography>
          </Box>

          <Box>
            <Chip label={agent.is_active ? "Actif" : "Inactif"} sx={{ mr: 1 }} variant="outlined" />
            <Chip label={String(agent.role || "agent")} sx={{ mr: 1 }} variant="outlined" />
            <Chip
              label={agent.is_staff || agent.is_verified ? "Vérifié/Staff" : "Standard"}
              color={agent.is_staff || agent.is_verified ? "success" : "warning"}
              variant="outlined"
            />
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography><b>Téléphone:</b> {agent.phone || "-"}</Typography>
              <Typography><b>Email:</b> {agent.email || "-"}</Typography>
              <Typography><b>Code:</b> {agent.agent_code || "-"}</Typography>
              <Typography><b>Date joined:</b> {fmt(agent.date_joined || agent.created_at)}</Typography>
              <Typography><b>Dernier login:</b> {fmt(agent.last_login)}</Typography>
            </Box>

            <Box>
              <Typography><b>ID:</b> {agent.id ?? "-"}</Typography>
              <Typography><b>is_staff:</b> {String(Boolean(agent.is_staff))}</Typography>
              <Typography><b>is_superuser:</b> {String(Boolean(agent.is_superuser))}</Typography>
              <Typography><b>is_active:</b> {String(Boolean(agent.is_active))}</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AgentDashboard;
