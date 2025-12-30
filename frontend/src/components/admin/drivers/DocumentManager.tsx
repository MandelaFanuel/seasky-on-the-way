// ========================= src/components/admin/drivers/DocumentManager.tsx =========================
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import api from "../../../services/api";

type Props = {
  open: boolean;
  driver: any;
  onClose: () => void;
};

export default function DocumentManager({ open, driver, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDocs = async () => {
    if (!driver?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/v1/drivers/${driver.id}/`);
      const documents = res.data?.documents;
      setDocs(Array.isArray(documents) ? documents : []);
    } catch (e: any) {
      setError("Impossible de charger les documents.");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, driver?.id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>Documents du chauffeur</DialogTitle>

      <DialogContent dividers>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {docs.map((d) => (
            <ListItem key={d.id ?? `${d.document_type}-${d.file_name}-${d.uploaded_at}`} divider>
              <ListItemText
                primary={`${d.document_type || "Document"} — ${d.file_name || "Sans nom"}`}
                secondary={`Exp: ${d.expiry_date || "N/A"} | Upload: ${d.uploaded_at || "N/A"}`}
              />
              <Chip
                label={d.is_verified ? "Vérifié" : "Non vérifié"}
                color={d.is_verified ? "success" : "warning"}
                variant="outlined"
              />
            </ListItem>
          ))}

          {docs.length === 0 && !loading && (
            <ListItem>
              <ListItemText primary="Aucun document." />
            </ListItem>
          )}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        <Button variant="contained" onClick={loadDocs}>
          Actualiser
        </Button>
      </DialogActions>
    </Dialog>
  );
}
