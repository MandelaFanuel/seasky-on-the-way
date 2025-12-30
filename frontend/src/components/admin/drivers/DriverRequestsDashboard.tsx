// ========================= src/components/admin/dashboard/DriverRequestsDashboard.tsx =========================
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  alpha,
  Stack,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import {
  PendingActions as PendingIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

export type DriverRequestsDashboardHandle = {
  refresh: () => Promise<void>;
  openCreate?: () => void;
};

type Props = {
  onLoadingChange?: (loading: boolean) => void;
};

const DriverRequestsDashboard = forwardRef<DriverRequestsDashboardHandle, Props>(function DriverRequestsDashboard({ onLoadingChange }, ref) {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({
    open: false,
    msg: "",
    severity: "info",
  });

  const showSnack = (msg: string, severity: "success" | "error" | "info" = "info") => setSnack({ open: true, msg, severity });

  const fetchRequests = async () => {
    setLoading(true);
    onLoadingChange?.(true);
    try {
      // TODO: remplacer par API: listDriverRequestsPending()
      await new Promise((r) => setTimeout(r, 320));
      setRequests([
        { id: 501, user: "kado", full_name: "Kado N.", phone: "+257 ...", status: "pending", created_at: new Date().toISOString() },
        { id: 502, user: "alice", full_name: "Alice K.", phone: "+257 ...", status: "pending", created_at: new Date().toISOString() },
      ]);
      showSnack("Demandes chargées", "success");
    } catch (e: any) {
      showSnack(e?.message || "Impossible de charger les demandes", "error");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await fetchRequests();
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
            Demandes “Devenir Livreur”
          </Typography>
          <Typography sx={{ color: "#335F7A", fontWeight: 600 }}>
            Validation / refus des demandes (à brancher API)
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRequests}
          disabled={loading}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            fontWeight: 900,
            borderWidth: 2,
            borderColor: "#0B568C",
            color: "#0B568C",
            "&:hover": { borderWidth: 2, backgroundColor: alpha("#0B568C", 0.05) },
          }}
        >
          {loading ? "Chargement..." : "Rafraîchir"}
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)", border: "1px solid rgba(11,86,140,0.1)", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)" }}>
        <Box sx={{ p: 4, borderBottom: "1px solid rgba(11,86,140,0.1)", background: alpha("#0B568C", 0.03) }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PendingIcon sx={{ color: "#0B568C" }} />
            <Typography fontWeight={900} sx={{ color: "#1A4F75", fontSize: "1.25rem" }}>
              Liste des demandes
            </Typography>
            {loading && <CircularProgress size={18} />}
          </Stack>
        </Box>

        {requests.length === 0 && !loading ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Aucune demande à afficher.
            </Alert>
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: alpha("#0B568C", 0.02) }}>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Demande</TableCell>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Utilisateur</TableCell>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Téléphone</TableCell>
                  <TableCell sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Statut</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, py: 3, color: "#1A4F75" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} hover sx={{ "&:hover": { backgroundColor: alpha("#0B568C", 0.03) } }}>
                    <TableCell sx={{ py: 2.5, fontWeight: 900, color: "#1A4F75" }}>#{r.id}</TableCell>
                    <TableCell sx={{ py: 2.5, fontWeight: 800, color: "#335F7A" }}>{r.full_name || r.user}</TableCell>
                    <TableCell sx={{ py: 2.5, fontWeight: 700, color: "#335F7A" }}>{r.phone || "-"}</TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip label={r.status} sx={{ fontWeight: 900, backgroundColor: alpha("#FF9800", 0.1), color: "#FF9800" }} />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2.5 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => showSnack("Refus: à connecter API", "info")}
                          sx={{ textTransform: "none", borderRadius: "50px", fontWeight: 900, borderWidth: 2, borderColor: "#F44336", color: "#F44336" }}
                        >
                          Refuser
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckIcon />}
                          onClick={() => showSnack("Validation: à connecter API", "info")}
                          sx={{ textTransform: "none", borderRadius: "50px", fontWeight: 900, background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)" }}
                        >
                          Approuver
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 3, fontWeight: 900 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default DriverRequestsDashboard;
