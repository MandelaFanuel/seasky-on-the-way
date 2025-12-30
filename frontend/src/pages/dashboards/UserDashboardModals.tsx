// ========================= src/pages/dashboard/components/UserDashboardModals.tsx =========================
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField } from "@mui/material";
import { QrCodeScanner, Warning } from "@mui/icons-material";

const QRScannerModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog 
    open={open} 
    onClose={onClose} 
    maxWidth="sm" 
    fullWidth
    className="animate-scaleIn"
  >
    <DialogTitle>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <QrCodeScanner />
        <Typography variant="h6" fontWeight={700}>
          Scanner QR Code
        </Typography>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Box
          sx={{
            width: 200,
            height: 200,
            mx: "auto",
            bgcolor: "grey.100",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            border: "2px dashed",
            borderColor: "divider",
          }}
          className="animate-bounce-soft"
        >
          <Typography color="text.secondary" variant="body2">
            Zone de scan QR Code
          </Typography>
        </Box>
        <TextField fullWidth label="Ou saisir manuellement le code" variant="outlined" size="medium" sx={{ mb: 2 }} />
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button onClick={onClose} variant="outlined">
        Annuler
      </Button>
      <Button variant="contained" sx={{ background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)" }}>
        Scanner maintenant
      </Button>
    </DialogActions>
  </Dialog>
);

export default function UserDashboardModals({
  qrScannerOpen,
  onCloseQr,
  deleteDialogOpen,
  onCloseDelete,
  onConfirmDelete,
}: {
  qrScannerOpen: boolean;
  onCloseQr: () => void;

  deleteDialogOpen: boolean;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <>
      <QRScannerModal open={qrScannerOpen} onClose={onCloseQr} />

      <Dialog 
        open={deleteDialogOpen} 
        onClose={onCloseDelete} 
        maxWidth="sm" 
        fullWidth
        className="animate-scaleIn"
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Warning sx={{ color: "error.main" }} />
            <Typography variant="h6" fontWeight={700}>
              Supprimer le compte
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Note: Votre compte sera désactivé et pourra être réactivé ultérieurement en contactant le support.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onCloseDelete} variant="outlined">
            Annuler
          </Button>
          <Button variant="contained" color="error" onClick={onConfirmDelete}>
            Supprimer mon compte
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}