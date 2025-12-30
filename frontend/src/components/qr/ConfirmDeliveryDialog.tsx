// ========================= src/components/qr/ConfirmDeliveryDialog.tsx =========================
import React, { useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Box, Stack, TextField, Typography, InputAdornment } from "@mui/material";
import { LocalShipping, Numbers, Notes, QrCode2 } from "@mui/icons-material";
import { confirmFromScan } from "@/services/qr.service";

type Props = {
  open: boolean;
  raw: string | null;
  onClose: () => void;
  onSuccess?: (resp: any) => void;
};

export default function ConfirmDeliveryDialog({ open, raw, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [pdvId, setPdvId] = useState<string>("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!raw && (!pdvId.trim() || Number.isFinite(Number(pdvId.trim()))), [raw, pdvId]);

  const submit = async () => {
    if (!raw) return;
    setLoading(true);
    setErr(null);

    try {
      const payload = {
        qr_data: raw,
        pdv_id: pdvId.trim() ? Number(pdvId.trim()) : undefined,
        note: note.trim() || undefined,
      };

      const resp = await confirmFromScan(payload);
      onSuccess?.(resp);
      onClose();
      setPdvId("");
      setNote("");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || "Impossible de confirmer via scan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>Confirmer une Livraison via QR</DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: "#f8fafc" }}>
        <Stack spacing={2.2}>
          <Alert severity="info">
            Appel API: <b>POST /api/v1/deliveries/confirm-from-scan/</b>
          </Alert>

          {err && <Alert severity="error">{err}</Alert>}

          <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "white", border: "1px solid #e5e7eb" }}>
            <Stack spacing={2}>
              <TextField
                label="QR détecté"
                value={raw || ""}
                fullWidth
                multiline
                minRows={3}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCode2 fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="PDV ID (optionnel)"
                value={pdvId}
                onChange={(e) => setPdvId(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Numbers fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText="Si ton backend associe le scan à un PDV, renseigne son ID (sinon laisse vide)."
              />

              <TextField
                label="Note (optionnel)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Notes fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box display="flex" alignItems="center" gap={1}>
                <LocalShipping sx={{ color: "#0B568C" }} />
                <Typography sx={{ color: "#335F7A", fontWeight: 700 }}>
                  Confirme la livraison / mouvement stock lié à ce QR.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", fontWeight: 800 }}>
          Annuler
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={submit}
          disabled={!canSubmit || loading}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            fontWeight: 900,
            background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
            "&:hover": { background: "linear-gradient(135deg, #0B568C 0%, #0A345F 100%)" },
          }}
        >
          {loading ? "Confirmation..." : "Confirmer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
