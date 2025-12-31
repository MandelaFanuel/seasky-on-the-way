// ========================= src/components/admin/dashboard/PDVDashboard.tsx =========================
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
  Store as StoreIcon,
  AddBusiness as AddBusinessIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Inventory2 as Inventory2Icon,
  Person as PersonIcon,
} from "@mui/icons-material";

import PDVForm from "../pdv/PDVForm";
import { createPDV, listPDV, PDV } from "../../../services/pdv.service";

// StatCard
const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        border: "1px solid rgba(11, 86, 140, 0.1)",
        overflow: "hidden",
      }}
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
              <Typography variant="caption" sx={{ display: "block", fontSize: "0.75rem", color: "#487F9A", fontWeight: 500 }}>
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
      </CardContent>
    </Card>
  );
};

export type PDVDashboardHandle = {
  openCreate: () => void;
  refresh: () => Promise<void>;
};

interface PDVDashboardProps {
  onLoadingChange?: (loading: boolean) => void;
}

const PDVDashboard = forwardRef<PDVDashboardHandle, PDVDashboardProps>(
  function PDVDashboard({ onLoadingChange }: PDVDashboardProps, ref) {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");

    const [loading, setLoading] = useState(false);
    const [pdvs, setPdvs] = useState<PDV[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [openCreate, setOpenCreate] = useState(false);
    const [selected, setSelected] = useState<PDV | null>(null);
    const [openDetails, setOpenDetails] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [filters, setFilters] = useState({
      stock: "", // with_stock / no_stock
      search: "",
    });

    const [snack, setSnack] = useState<{
      open: boolean;
      msg: string;
      severity: "success" | "error" | "info";
    }>({ open: false, msg: "", severity: "info" });

    const showSnack = (msg: string, severity: "success" | "error" | "info" = "info") => {
      setSnack({ open: true, msg, severity });
    };

    useEffect(() => {
      onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    const fetchPDV = useCallback(
      async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) setLoading(true);
        setError(null);

        try {
          const { results, count } = await listPDV({
            page: page + 1,
            page_size: rowsPerPage,
            search: filters.search || undefined,
          });

          let filtered = results;

          if (filters.stock === "with_stock") {
            filtered = filtered.filter((p) => p.stock && p.stock.current_liters !== undefined);
          }
          if (filters.stock === "no_stock") {
            filtered = filtered.filter((p) => !p.stock || p.stock.current_liters === undefined);
          }

          setPdvs(filtered);
          setTotalCount(filters.stock ? filtered.length : count);
        } catch (e: any) {
          setPdvs([]);
          setTotalCount(0);
          setError(e?.response?.data?.detail || e?.message || "Impossible de charger la liste des PDV.");
        } finally {
          setLoading(false);
        }
      },
      [page, rowsPerPage, filters.stock, filters.search]
    );

    useEffect(() => {
      fetchPDV();
    }, [fetchPDV]);

    const handleCreatePDV = useCallback(
      async (payload: any) => {
        const created = await createPDV(payload);
        await fetchPDV();
        showSnack(`PDV créé: ${created?.name || ""}`, "success");
        return created;
      },
      [fetchPDV]
    );

    const handleManualRefresh = useCallback(async () => {
      await fetchPDV(true);
      showSnack("Données rafraîchies", "success");
    }, [fetchPDV]);

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

    const openPDVDetails = (pdv: PDV) => {
      setSelected(pdv);
      setOpenDetails(true);
    };

    const summary = useMemo(() => {
      const total = totalCount;
      const withStock = pdvs.filter((p) => p.stock && p.stock.current_liters !== undefined).length;
      const noStock = pdvs.filter((p) => !p.stock || p.stock.current_liters === undefined).length;
      const assigned = pdvs.filter((p) => !!p.agent_username || !!p.agent_full_name).length;
      return { total, withStock, noStock, assigned };
    }, [pdvs, totalCount]);

    const renderStockChip = (pdv: PDV) => {
      const hasStock = pdv.stock && pdv.stock.current_liters !== undefined;
      const color = hasStock ? "#4CAF50" : "#FF9800";
      const bg = alpha(color, 0.1);
      const label = hasStock ? `Stock: ${pdv.stock?.current_liters} L` : "Stock: Non dispo";
      const icon = hasStock ? <CheckCircleIcon /> : <WarningIcon />;

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
          <Typography variant="caption" sx={{ color, fontWeight: 800, fontSize: "0.75rem" }}>
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
                <StoreIcon sx={{ fontSize: 44, color: "#0B568C" }} />
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
                    backgroundClip: "text",marginTop: 4
                  }}
                >
                  Points de Vente (PDV)
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
                  Création et gestion des points de vente + stock
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="PDV Total" value={summary.total} icon={<StoreIcon />} color="#0B568C" subtitle="Réseau PDV" />
            </Box>
            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="Avec Stock" value={summary.withStock} icon={<Inventory2Icon />} color="#4CAF50" subtitle="Stock disponible" />
            </Box>
            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="Sans Stock" value={summary.noStock} icon={<WarningIcon />} color="#FF9800" subtitle="Non renseigné" />
            </Box>
            <Box sx={{ flex: "1 1 220px", minWidth: "220px", maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(25% - 12px)" } }}>
              <StatCard title="Assignés" value={summary.assigned} icon={<PersonIcon />} color="#27B1E4" subtitle="Avec agent" />
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
          <Typography variant="h5" sx={{ mb: 3, color: "#1A4F75", fontWeight: 900, fontSize: "1.5rem" }}>
            Recherche & Filtres
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, alignItems: { md: "flex-end" } }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Rechercher PDV (nom, province, commune...)"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#0B568C" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <FormControl size="medium" sx={{ minWidth: 180 }}>
                <InputLabel sx={{ fontWeight: 700, color: "#335F7A" }}>Stock</InputLabel>
                <Select
                  value={filters.stock}
                  label="Stock"
                  onChange={(e) => handleFilterChange("stock", e.target.value)}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "white",
                    border: "1px solid rgba(11, 86, 140, 0.1)",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="with_stock">Avec stock</MenuItem>
                  <MenuItem value="no_stock">Sans stock</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilters({ stock: "", search: "" })}
                sx={{ borderRadius: "50px", textTransform: "none", fontWeight: 700 }}
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
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #0B568C 0%, #0A345F 100%)" },
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
          <Box sx={{ p: 4, borderBottom: "1px solid rgba(11, 86, 140, 0.1)", background: alpha("#0B568C", 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 900, fontSize: "1.5rem", mb: 1 }}>
                  Liste des PDV
                </Typography>
                <Typography variant="body1" sx={{ color: "#335F7A", fontWeight: 500 }}>
                  PDV + stock + agent assigné
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#487F9A", backgroundColor: alpha("#0B568C", 0.1), px: 2, py: 0.5, borderRadius: 2 }}>
                  {pdvs.length} PDV affiché(s)
                </Typography>
                {loading && <CircularProgress size={24} sx={{ color: "#0B568C" }} />}
              </Box>
            </Box>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: alpha("#0B568C", 0.02) }}>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>PDV</TableCell>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Localisation</TableCell>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Stock</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pdvs.map((pdv) => (
                  <TableRow key={pdv.id} hover sx={{ "&:hover": { backgroundColor: alpha("#0B568C", 0.03) } }}>
                    <TableCell sx={{ py: 2.5 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "white", color: "#0B568C", border: "2px solid rgba(11,86,140,0.1)" }}>
                          {(pdv.name || "P").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={900} sx={{ color: "#1A4F75" }}>
                            {pdv.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#487F9A", fontWeight: 700 }}>
                            ID #{pdv.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Stack spacing={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOnIcon sx={{ fontSize: 18, color: "#0B568C", opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#335F7A" }}>
                            {(pdv.province || "—") + " / " + (pdv.commune || "—")}
                          </Typography>
                        </Box>
                        {pdv.address && (
                          <Typography variant="caption" sx={{ color: "#487F9A", fontWeight: 600 }}>
                            {pdv.address}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Stack spacing={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon sx={{ fontSize: 18, color: "#0B568C", opacity: 0.8 }} />
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "#335F7A" }}>
                            {pdv.agent_full_name || pdv.agent_username || "—"}
                          </Typography>
                        </Box>
                        {pdv.agent_phone && (
                          <Typography variant="caption" sx={{ color: "#487F9A", fontWeight: 700 }}>
                            {pdv.agent_phone}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>{renderStockChip(pdv)}</TableCell>

                    <TableCell align="right" sx={{ py: 2.5 }}>
                      <Tooltip title="Voir détails">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => openPDVDetails(pdv)}
                          sx={{
                            textTransform: "none",
                            borderRadius: "50px",
                            fontWeight: 800,
                            borderWidth: 2,
                            borderColor: "#0B568C",
                            color: "#0B568C",
                            "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                          }}
                        >
                          Détails
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {pdvs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 8 }}>
                      <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                        <StoreIcon sx={{ fontSize: 80, opacity: 0.2, mb: 3, color: "#0B568C" }} />
                        <Typography variant="h5" sx={{ color: "#1A4F75", mb: 2, fontWeight: 900 }}>
                          Aucun PDV trouvé
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#487F9A", mb: 4, maxWidth: 500, mx: "auto", fontWeight: 600 }}>
                          Crée ton premier PDV ou ajuste les filtres.
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<AddBusinessIcon />}
                          onClick={() => setOpenCreate(true)}
                          sx={{ borderRadius: "50px", px: 4, py: 1.5, fontWeight: 900, background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)" }}
                        >
                          Créer un PDV
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {pdvs.length > 0 && (
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
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontWeight: 800, color: "#335F7A" },
              }}
            />
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 4, borderRadius: 3 }} onClose={() => setError(null)}>
            <Typography fontWeight={900}>{error}</Typography>
          </Alert>
        )}

        {/* Modales */}
        <PDVForm open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={handleCreatePDV} />
        <PDVDetailsDialog open={openDetails} pdv={selected} onClose={() => setOpenDetails(false)} />

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={5000}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snack.severity} sx={{ borderRadius: 3, fontWeight: 800 }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
);

function PDVDetailsDialog({ open, pdv, onClose }: { open: boolean; pdv: PDV | null; onClose: () => void }) {
  if (!pdv) return null;

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
      <DialogTitle sx={{ fontWeight: 900 }}>Détails PDV</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>
              {pdv.name}{" "}
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 700 }}>
                (ID #{pdv.id})
              </Box>
            </Typography>
          </Box>

          <Box>
            <Chip label={pdv.stock?.current_liters !== undefined ? "Stock OK" : "Stock non dispo"} sx={{ mr: 1 }} variant="outlined" />
            <Chip label={pdv.agent_username || pdv.agent_full_name ? "Agent assigné" : "Sans agent"} sx={{ mr: 1 }} variant="outlined" />
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography><b>Province:</b> {pdv.province || "-"}</Typography>
              <Typography><b>Commune:</b> {pdv.commune || "-"}</Typography>
              <Typography><b>Adresse:</b> {pdv.address || "-"}</Typography>
              <Typography><b>Créé:</b> {fmt(pdv.created_at)}</Typography>
              <Typography><b>Mis à jour:</b> {fmt(pdv.updated_at)}</Typography>
            </Box>

            <Box>
              <Typography><b>Agent:</b> {pdv.agent_full_name || pdv.agent_username || "-"}</Typography>
              <Typography><b>Tél Agent:</b> {pdv.agent_phone || "-"}</Typography>
              <Typography><b>Stock (L):</b> {pdv.stock?.current_liters ?? "-"}</Typography>
              <Typography><b>Dernier event:</b> {fmt(pdv.stock?.last_event_at)}</Typography>
              <Typography><b>Stock updated:</b> {fmt(pdv.stock?.updated_at)}</Typography>
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

export default PDVDashboard;
