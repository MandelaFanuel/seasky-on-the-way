// ========================= src/components/admin/pdv/PDVForm.tsx =========================
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Stack,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Store, LocationOn, Person, Numbers } from "@mui/icons-material";

import { listAgents, Agent } from "@/services/agents.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
};

type FormState = {
  name: string;
  province: string;
  commune: string;
  address: string;
  agent_user_id: number | "";
  partner_id: string; // optional
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function parseAxiosDrfErrors(err: any): { global?: string; fields?: Record<string, string> } {
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return { global: err?.message || "Erreur inconnue" };
  if (typeof (data as any).detail === "string") return { global: (data as any).detail };

  const fields: Record<string, string> = {};
  Object.keys(data).forEach((k) => {
    const v = (data as any)[k];
    if (Array.isArray(v)) fields[k] = String(v[0]);
    else if (typeof v === "string") fields[k] = v;
    else fields[k] = JSON.stringify(v);
  });

  return { global: (data as any).message || (data as any).error, fields };
}

export default function PDVForm({ open, onClose, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    province: "",
    commune: "",
    address: "",
    agent_user_id: "",
    partner_id: "",
  }));

  const canSubmit = useMemo(() => form.name.trim().length > 0 && !!form.agent_user_id, [form.name, form.agent_user_id]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGlobalError(null);
  };

  const resetForm = () => {
    setErrors({});
    setGlobalError(null);
    setForm({
      name: "",
      province: "",
      commune: "",
      address: "",
      agent_user_id: "",
      partner_id: "",
    });
  };

  useEffect(() => {
    if (!open) return;

    (async () => {
      setAgentsLoading(true);
      try {
        const data = await listAgents({ page: 1, page_size: 500 });
        setAgents(data.results || []);
      } catch {
        setAgents([]);
      } finally {
        setAgentsLoading(false);
      }
    })();
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    setGlobalError(null);
    setErrors({});

    try {
      const partnerId = form.partner_id.trim() ? Number(form.partner_id.trim()) : null;

      const payload = {
        name: form.name.trim(),
        province: (form.province || "").trim() || undefined,
        commune: (form.commune || "").trim() || undefined,
        address: (form.address || "").trim() || undefined,
        agent_user_id: Number(form.agent_user_id),
        partner_id: Number.isFinite(partnerId as any) ? partnerId : null,
      };

      await onSubmit(payload);

      onClose();
      resetForm();
    } catch (err: any) {
      const parsed = parseAxiosDrfErrors(err);
      if (parsed.fields) {
        const mapped: FieldErrors = {};
        Object.entries(parsed.fields).forEach(([k, v]) => ((mapped as any)[k] = v));
        setErrors(mapped);
      }
      setGlobalError(parsed.global || "Erreur: vérifie les champs (agent obligatoire, formats...).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>Créer un Point de Vente (PDV)</DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: "#f8fafc" }}>
        <Stack spacing={2.2}>
          <Alert severity="info">
            Création via <b>/api/v1/pdv/</b> • champs: name, province, commune, address, <b>agent_user_id</b>, partner_id?
          </Alert>

          {globalError && <Alert severity="error">{globalError}</Alert>}

          <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "white", border: "1px solid #e5e7eb" }}>
            <Stack spacing={2}>
              <TextField
                label="Nom du PDV *"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Store fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Province (optionnel)"
                  value={form.province}
                  onChange={(e) => setField("province", e.target.value)}
                  error={!!errors.province}
                  helperText={errors.province}
                  fullWidth
                />
                <TextField
                  label="Commune (optionnel)"
                  value={form.commune}
                  onChange={(e) => setField("commune", e.target.value)}
                  error={!!errors.commune}
                  helperText={errors.commune}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Adresse (optionnel)"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Divider />

              <FormControl fullWidth>
                <Typography variant="caption" sx={{ mb: 0.75, opacity: 0.8, fontWeight: 700 }}>
                  Agent assigné * (agent_user_id)
                </Typography>
                <Select
                  value={form.agent_user_id}
                  onChange={(e) => setField("agent_user_id", e.target.value as any)}
                  displayEmpty
                  disabled={agentsLoading}
                >
                  <MenuItem value="">
                    <em>{agentsLoading ? "Chargement des agents..." : "Sélectionner un agent"}</em>
                  </MenuItem>
                  {agents.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.full_name || a.username} {a.phone ? `— ${a.phone}` : ""}
                    </MenuItem>
                  ))}
                </Select>
                {errors.agent_user_id && (
                  <Typography variant="caption" sx={{ color: "error.main", mt: 0.5 }}>
                    {errors.agent_user_id}
                  </Typography>
                )}
              </FormControl>

              <TextField
                label="Partner ID (optionnel)"
                value={form.partner_id}
                onChange={(e) => setField("partner_id", e.target.value)}
                error={!!errors.partner_id}
                helperText={errors.partner_id || "Laisse vide si tu n’utilises pas partner_id."}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Numbers fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={resetForm} disabled={loading} sx={{ borderRadius: 2, textTransform: "none" }}>
          Réinitialiser
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900 }}
        >
          {loading ? "Création..." : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
