// ========================= src/components/qr/ScanResultDialog.tsx =========================
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack, Chip, alpha } from "@mui/material";
import { QrCode2, ContentCopy, CheckCircle } from "@mui/icons-material";

type Props = {
  open: boolean;
  raw: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ScanResultDialog({ open, raw, onClose, onConfirm }: Props) {
  const copy = async () => {
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>Résultat du Scan</DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: "#f8fafc" }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid rgba(11,86,140,0.12)",
            boxShadow: "0 12px 40px rgba(10,52,95,0.08)",
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: alpha("#0B568C", 0.08),
                }}
              >
                <QrCode2 sx={{ color: "#0B568C" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, color: "#1A4F75" }}>Code détecté</Typography>
                <Typography variant="body2" sx={{ color: "#335F7A", fontWeight: 600 }}>
                  Tu peux confirmer l’opération associée à ce QR.
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<CheckCircle />}
              label="Scan OK"
              variant="outlined"
              sx={{
                width: "fit-content",
                fontWeight: 800,
                borderRadius: 2,
                borderColor: alpha("#4CAF50", 0.35),
                color: "#2E7D32",
                background: alpha("#4CAF50", 0.06),
              }}
            />

            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha("#0B568C", 0.04),
                border: `1px solid ${alpha("#0B568C", 0.12)}`,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#0A345F",
                fontWeight: 700,
              }}
            >
              {raw || "-"}
            </Box>

            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={copy}
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
              Copier
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 800 }}>
          Fermer
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            fontWeight: 900,
            background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
            "&:hover": { background: "linear-gradient(135deg, #0B568C 0%, #0A345F 100%)" },
          }}
          disabled={!raw}
        >
          Confirmer l’opération
        </Button>
      </DialogActions>
    </Dialog>
  );
}
