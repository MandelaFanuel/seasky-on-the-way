// ========================= src/components/admin/drivers/DriverMap.tsx =========================
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from "@mui/material";

type Props = {
  open: boolean;
  driver: any;
  onClose: () => void;
};

export default function DriverMap({ open, driver, onClose }: Props) {
  const lat = driver?.availability?.location_lat;
  const lng = driver?.availability?.location_lng;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Localisation</DialogTitle>
      <DialogContent dividers>
        {!lat || !lng ? (
          <Alert severity="info">Aucune localisation disponible pour ce chauffeur.</Alert>
        ) : (
          <iframe
            title="map"
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
