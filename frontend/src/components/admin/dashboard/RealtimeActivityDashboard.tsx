// ========================= src/components/admin/dashboard/RealtimeActivityDashboard.tsx =========================
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  alpha,
  useTheme,
  Stack,
  Chip,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Bolt as BoltIcon,
  Refresh as RefreshIcon,
  Store as StoreIcon,
  QrCodeScanner as QrIcon,
  ReceiptLong as ReceiptIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

export type RealtimeActivityDashboardHandle = {
  refresh: () => Promise<void>;
};

type Props = {
  onLoadingChange?: (loading: boolean) => void;
  mode?: "overview" | "full";
};

const RealtimeActivityDashboard = forwardRef<RealtimeActivityDashboardHandle, Props>(function RealtimeActivityDashboard(
  { onLoadingChange, mode = "full" },
  ref
) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({
    open: false,
    msg: "",
    severity: "info",
  });

  const showSnack = (msg: string, severity: "success" | "error" | "info" = "info") => setSnack({ open: true, msg, severity });

  const fetchActivity = async () => {
    setLoading(true);
    onLoadingChange?.(true);
    try {
      // TODO: remplacer par API / WS
      await new Promise((r) => setTimeout(r, 300));

      const now = new Date().toISOString();
      setEvents([
        { type: "pdv", label: "PDV: Stock mis à jour", detail: "PDV #12 • +200L", at: now },
        { type: "order", label: "Commande en attente", detail: "Commande #8842 • 3 articles", at: now },
        { type: "scan", label: "Scan QR effectué", detail: "Agent: Jean • PDV: Gitega", at: now },
      ]);
      showSnack("Activité rafraîchie", "success");
    } catch (e: any) {
      showSnack(e?.message || "Impossible de charger l’activité", "error");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await fetchActivity();
    },
  }));

  const title = useMemo(() => (mode === "overview" ? "Aperçu en Temps Réel" : "Activité Temps Réel"), [mode]);

  const iconFor = (t: string) => {
    if (t === "pdv") return <StoreIcon sx={{ color: "#0B568C" }} />;
    if (t === "order") return <ReceiptIcon sx={{ color: "#27B1E4" }} />;
    if (t === "scan") return <QrIcon sx={{ color: "#FF9800" }} />;
    return <InfoIcon sx={{ color: "#487F9A" }} />;
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)",
        minHeight: "calc(100vh - 240px)",
        py: 4,
        px: { xs: 2, md: 4 },
        marginTop:8
      }}
    >
      <Box sx={{ mb: 3 }} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
             
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ color: "#335F7A", fontWeight: 500 }}>
            PDV • commandes • scans • opérations (branchable WebSocket / polling)
          </Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
          border: "1px solid rgba(11, 86, 140, 0.1)",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          <Chip icon={<BoltIcon />} label="LIVE" sx={{ fontWeight: 900, backgroundColor: alpha("#4CAF50", 0.12), color: "#2E7D32" }} />
          <Chip label="PDV" sx={{ fontWeight: 800, backgroundColor: alpha("#0B568C", 0.1), color: "#0B568C" }} />
          <Chip label="Commandes" sx={{ fontWeight: 800, backgroundColor: alpha("#27B1E4", 0.12), color: "#0B568C" }} />
          <Chip label="Scans" sx={{ fontWeight: 800, backgroundColor: alpha("#FF9800", 0.12), color: "#FF9800" }} />
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {loading && (
          <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={18} />
              <Typography fontWeight={800}>Chargement…</Typography>
            </Stack>
          </Alert>
        )}

        {events.length === 0 && !loading ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Aucun événement. (Quand on branche l’API/WS, ici tu verras tout en direct.)
          </Alert>
        ) : (
          <List>
            {events.map((ev, idx) => (
              <ListItem key={idx} sx={{ borderRadius: 2, mb: 1, backgroundColor: alpha("#0B568C", 0.03) }}>
                <ListItemIcon>{iconFor(ev.type)}</ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={900} sx={{ color: "#1A4F75" }}>{ev.label}</Typography>}
                  secondary={
                    <Typography sx={{ color: "#487F9A", fontWeight: 600 }}>
                      {ev.detail} • {ev.at ? new Date(ev.at).toLocaleString("fr-FR") : ""}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2.5 }} />

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Pour du vrai temps réel: Django Channels + WebSocket (recommandé). Sinon polling toutes les 5–10s.
        </Alert>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 3, fontWeight: 800 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default RealtimeActivityDashboard;
