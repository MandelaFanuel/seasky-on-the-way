// ========================= src/components/admin/drivers/DriverDetails.tsx =========================
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Divider,
  Box,
} from "@mui/material";

type Props = {
  open: boolean;
  driver: any;
  onClose: () => void;
  onVerify: () => void;
  onSuspend: () => void;
  onActivate: () => void;
  onDelete: () => void;
};

export default function DriverDetails({
  open,
  driver,
  onClose,
  onVerify,
  onSuspend,
  onActivate,
  onDelete,
}: Props) {
  if (!driver) return null;

  const fmtDate = (v: any) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleDateString("fr-FR");
    } catch {
      return String(v);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>Détails chauffeur</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {driver.full_name || driver.username}{" "}
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                {driver.driver_code ? `(${driver.driver_code})` : ""}
              </Box>
            </Typography>
          </Box>

          <Box>
            <Chip label={driver.status || "-"} sx={{ mr: 1 }} variant="outlined" />
            <Chip label={driver.transport_mode || "-"} sx={{ mr: 1 }} variant="outlined" />
            <Chip
              label={driver.is_verified ? "Vérifié" : "Non vérifié"}
              color={driver.is_verified ? "success" : "warning"}
              variant="outlined"
            />
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography><b>Téléphone:</b> {driver.phone || "-"}</Typography>
              <Typography><b>Email:</b> {driver.email || "-"}</Typography>
              <Typography><b>Zone:</b> {driver.assigned_zone || "-"}</Typography>
              <Typography><b>Date d'embauche:</b> {fmtDate(driver.hire_date)}</Typography>
              <Typography><b>PDV:</b> {driver.can_be_pdv ? "Oui" : "Non"}</Typography>
            </Box>

            <Box>
              <Typography><b>Salaire:</b> {driver.base_salary ?? "-"}</Typography>
              <Typography><b>Commission:</b> {driver.commission_rate ?? "-"}%</Typography>
              <Typography><b>Capacité:</b> {driver.max_capacity ?? "-"} L</Typography>
              <Typography><b>Score perf:</b> {driver.performance_score ?? "-"}</Typography>
            </Box>
          </Box>

          {(driver.license_number || driver.license_expiry || driver.insurance_number || driver.insurance_expiry) && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                  Permis & Assurance
                </Typography>

                <Typography>
                  <b>Permis:</b> {driver.license_number || "-"} • Exp: {fmtDate(driver.license_expiry)}
                </Typography>
                <Typography>
                  <b>Assurance:</b> {driver.insurance_number || "-"} • Exp: {fmtDate(driver.insurance_expiry)}
                </Typography>
              </Box>
            </>
          )}

          {(driver.vehicle_type || driver.vehicle_registration) && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                  Véhicule
                </Typography>
                <Typography><b>Type:</b> {driver.vehicle_type || "-"}</Typography>
                <Typography><b>Immatriculation:</b> {driver.vehicle_registration || "-"}</Typography>
              </Box>
            </>
          )}

          {driver.notes && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Notes
                </Typography>
                <Typography color="text.secondary">{driver.notes}</Typography>
              </Box>
            </>
          )}

          {driver.availability && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Disponibilité
                </Typography>
                <Typography>
                  <b>Disponible:</b> {driver.availability.is_available ? "Oui" : "Non"}
                </Typography>
                <Typography>
                  <b>Localisation:</b>{" "}
                  {driver.availability.location_lat && driver.availability.location_lng
                    ? `${driver.availability.location_lat}, ${driver.availability.location_lng}`
                    : "Non disponible"}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>

        {!driver.is_verified && (
          <Button variant="contained" color="success" onClick={onVerify}>
            Vérifier
          </Button>
        )}

        {driver.status === "active" ? (
          <Button variant="contained" color="warning" onClick={onSuspend}>
            Suspendre
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={onActivate}>
            Activer
          </Button>
        )}

        <Button variant="outlined" color="error" onClick={onDelete}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
