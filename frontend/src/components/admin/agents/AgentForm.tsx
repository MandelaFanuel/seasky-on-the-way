// ========================= src/components/admin/agents/AgentForm.tsx =========================
import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import { Person, Phone, Email, Key } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
};

type FormState = {
  username: string;
  email: string;
  phone: string;
  full_name: string;
  password: string;
  confirm_password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function parseAxiosDrfErrors(err: any): { global?: string; fields?: Record<string, string> } {
  const data = err?.response?.data;

  if (!data || typeof data !== "object") {
    return { global: err?.message || "Erreur inconnue" };
  }

  if (typeof data.detail === "string") return { global: data.detail };

  const fields: Record<string, string> = {};
  Object.keys(data).forEach((k) => {
    const v = (data as any)[k];
    if (Array.isArray(v)) fields[k] = String(v[0]);
    else if (typeof v === "string") fields[k] = v;
    else fields[k] = JSON.stringify(v);
  });

  return { global: (data as any).message || (data as any).error, fields };
}

export default function AgentForm({ open, onClose, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState<FormState>(() => ({
    username: "",
    email: "",
    phone: "",
    full_name: "",
    password: "",
    confirm_password: "",
  }));

  const canSubmit = useMemo(() => {
    return (
      form.username.trim() &&
      form.phone.trim() &&
      form.password &&
      form.confirm_password &&
      form.password === form.confirm_password
    );
  }, [form]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGlobalError(null);
  };

  const resetForm = () => {
    setErrors({});
    setGlobalError(null);
    setForm({
      username: "",
      email: "",
      phone: "",
      full_name: "",
      password: "",
      confirm_password: "",
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setGlobalError(null);
    setErrors({});

    try {
      const payload = {
        username: form.username.trim(),
        full_name: form.full_name.trim() || undefined,
        phone: form.phone.trim(),
        email: (form.email || "").trim() || undefined,
        password: form.password,
        confirm_password: form.confirm_password,
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
      setGlobalError(parsed.global || "Erreur: vérifie les champs (unicité username/phone/email, mot de passe...).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>Nouvel Agent</DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: "#f8fafc" }}>
        <Stack spacing={2.2}>
          <Alert severity="info">
            Création via <b>/api/v1/agents/</b> • champs: username, full_name, phone, email, password, confirm_password
          </Alert>

          {globalError && <Alert severity="error">{globalError}</Alert>}

          <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "white", border: "1px solid #e5e7eb" }}>
            <Stack spacing={2}>
              <TextField
                label="Nom d'utilisateur *"
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Nom complet (optionnel)"
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                error={!!errors.full_name}
                helperText={errors.full_name}
                fullWidth
              />

              <TextField
                label="Téléphone *"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email (optionnel)"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Divider />

              <TextField
                label="Mot de passe *"
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirmer mot de passe *"
                type="password"
                value={form.confirm_password}
                onChange={(e) => setField("confirm_password", e.target.value)}
                error={!!errors.confirm_password}
                helperText={
                  errors.confirm_password ||
                  (form.confirm_password && form.password !== form.confirm_password ? "Les mots de passe ne correspondent pas." : "")
                }
                fullWidth
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
