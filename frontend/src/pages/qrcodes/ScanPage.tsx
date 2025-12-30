// ========================= src/pages/qr/ScanPage.tsx =========================
import React, { useMemo, useState } from "react";
import { Box, Typography, Paper, Stack, Button, Alert, Snackbar, alpha } from "@mui/material";
import { QrCode2, LocalShipping, Refresh } from "@mui/icons-material";

import QRCodeScanner from "../../components/qr/QRCodeScaner";
import ScanResultDialog from "@/components/qr/ScanResultDialog";
import ConfirmDeliveryDialog from "@/components/qr/ConfirmDeliveryDialog";

export default function ScanPage() {
  const [raw, setRaw] = useState<string | null>(null);
  const [openResult, setOpenResult] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({
    open: false,
    msg: "",
    severity: "info",
  });

  const showSnack = (msg: string, severity: "success" | "error" | "info" = "info") => setSnack({ open: true, msg, severity });

  const header = useMemo(
    () => ({
      title: "Scanner QR Code",
      subtitle: "Scan → confirmation immédiate (livraison / stock / opération).",
    }),
    []
  );

  const onDetected = (value: string) => {
    setRaw(value);
    setOpenResult(true);
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)",
        minHeight: "100vh",
        py: 4,
        px: { xs: 2, md: 4 },
        mt: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
              <QrCode2 sx={{ fontSize: 44, color: "#0B568C" }} />
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
                {header.title}
              </Typography>
              <Typography variant="h6" sx={{ color: "#335F7A", fontWeight: 400, fontSize: { xs: "1rem", md: "1.25rem" } }}>
                {header.subtitle}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setRaw(null);
                showSnack("Prêt pour un nouveau scan", "info");
              }}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 900,
                borderWidth: 2,
                borderColor: "#0B568C",
                color: "#0B568C",
                "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
              }}
            >
              Nouveau scan
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Info */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
          border: "1px solid rgba(11, 86, 140, 0.1)",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        }}
      >
        <Alert severity="info" sx={{ borderRadius: 2.5 }}>
          Astuce: sur PC, si la caméra ne scanne pas, utilise la <b>saisie manuelle</b>. Sur téléphone (Chrome), le scan est fluide.
        </Alert>
      </Paper>

      {/* Scanner */}
      <QRCodeScanner onDetected={onDetected} />

      {/* Dialog résultat */}
      <ScanResultDialog
        open={openResult}
        raw={raw}
        onClose={() => setOpenResult(false)}
        onConfirm={() => {
          setOpenResult(false);
          setOpenConfirm(true);
        }}
      />

      {/* Dialog confirmation (livraison / stock) */}
      <ConfirmDeliveryDialog
        open={openConfirm}
        raw={raw}
        onClose={() => setOpenConfirm(false)}
        onSuccess={(resp) => {
          showSnack(resp?.message || "Confirmation effectuée", "success");
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          sx={{
            borderRadius: 3,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            fontWeight: 800,
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
