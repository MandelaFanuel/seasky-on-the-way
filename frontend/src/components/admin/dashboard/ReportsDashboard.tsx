// ========================= src/components/admin/dashboard/ReportsDashboard.tsx =========================
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Box, Paper, Typography, alpha, Stack, Button, Alert, Snackbar } from "@mui/material";
import { QueryStats as StatsIcon, Refresh as RefreshIcon, Download as DownloadIcon } from "@mui/icons-material";

export type ReportsDashboardHandle = {
  refresh: () => Promise<void>;
};

type Props = {
  onLoadingChange?: (loading: boolean) => void;
};

const ReportsDashboard = forwardRef<ReportsDashboardHandle, Props>(function ReportsDashboard({ onLoadingChange }, ref) {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({
    open: false,
    msg: "",
    severity: "info",
  });

  const showSnack = (msg: string, severity: "success" | "error" | "info" = "info") => setSnack({ open: true, msg, severity });

  const fetchReports = async () => {
    setLoading(true);
    onLoadingChange?.(true);
    try {
      // TODO: API réelle: getReportsSummary()
      await new Promise((r) => setTimeout(r, 250));
      showSnack("Rapports chargés", "success");
    } catch (e: any) {
      showSnack(e?.message || "Impossible de charger les rapports", "error");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await fetchReports();
    },
  }));

  return (
    <Box sx={{ background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)", minHeight: "calc(100vh - 240px)", py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3 }} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginTop:8
            }}
          >
            Rapports & Analytique
          </Typography>
          <Typography sx={{ color: "#335F7A", fontWeight: 600 }}>
            Exports + statistiques (à brancher)
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchReports}
            disabled={loading}
            sx={{ borderRadius: "50px", textTransform: "none", fontWeight: 900, borderWidth: 2, borderColor: "#0B568C", color: "#0B568C" }}
          >
            Actualiser
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => showSnack("Export: à connecter API (CSV/PDF)", "info")}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
            }}
          >
            Exporter
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)", border: "1px solid rgba(11,86,140,0.1)", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)" }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <StatsIcon sx={{ color: "#0B568C" }} />
          <Typography fontWeight={900} sx={{ color: "#1A4F75", fontSize: "1.25rem" }}>
            Tableau de rapports
          </Typography>
        </Stack>

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Ici tu peux afficher: ventes par PDV, stock, commissions agents, commandes/jour, chauffeurs actifs, incidents, etc.
        </Alert>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 3, fontWeight: 900 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default ReportsDashboard;
