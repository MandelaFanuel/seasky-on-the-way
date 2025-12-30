// src/components/admin/dashboard/CredentialsDialog.tsx
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  Alert,
  Snackbar,
  alpha,
  useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type Credentials = {
  username?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
  account_type?: string | null;
  password?: string | null;
  login_hint?: string | null;
};

type Props = {
  open: boolean;
  title?: string;
  credentials: Credentials | null;
  onClose: () => void;
};

export default function CredentialsDialog({ open, title, credentials, onClose }: Props) {
  const theme = useTheme();
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  const lines = useMemo(() => {
    const c = credentials || {};
    return [
      ["Nom d'utilisateur", c.username || "-"],
      ["Téléphone", c.phone || "-"],
      ["Email", c.email || "-"],
      ["Rôle", c.role || "-"],
      ["Account type", c.account_type || "-"],
      ["Mot de passe", c.password || "-"],
    ] as Array<[string, string]>;
  }, [credentials]);

  const copyText = useMemo(() => {
    const c = credentials || {};
    return (
      `IDENTIFIANTS DE CONNEXION\n` +
      `Username: ${c.username || "-"}\n` +
      `Téléphone: ${c.phone || "-"}\n` +
      `Email: ${c.email || "-"}\n` +
      `Rôle: ${c.role || "-"}\n` +
      `Account type: ${c.account_type || "-"}\n` +
      `Mot de passe: ${c.password || "-"}\n\n` +
      `${c.login_hint || "Connexion avec username OU téléphone + mot de passe"}`
    );
  }, [credentials]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setSnack({ open: true, msg: "Identifiants copiés ✅" });
    } catch {
      setSnack({ open: true, msg: "Impossible de copier (permissions navigateur)." });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900, color: "#1A4F75" }}>
          {title || "Identifiants de connexion"}
        </DialogTitle>

        <DialogContent dividers>
          <Alert
            severity="info"
            sx={{
              mb: 2,
              borderRadius: 2,
              fontWeight: 800,
              backgroundColor: alpha("#0B568C", 0.06),
              color: "#0B568C",
            }}
          >
            Ces identifiants sont affichés <b>une seule fois</b>. Copie-les et transmets-les au chauffeur/agent.
          </Alert>

          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(11,86,140,0.12)",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
            }}
          >
            {lines.map(([k, v], idx) => (
              <Box key={k} sx={{ py: 1 }}>
                <Box display="flex" justifyContent="space-between" gap={2} alignItems="center">
                  <Typography sx={{ fontWeight: 900, color: "#335F7A", fontSize: "0.9rem" }}>
                    {k}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: k === "Mot de passe" ? "#0B568C" : "#1A4F75",
                      fontFamily: k === "Mot de passe" ? "monospace" : "inherit",
                    }}
                  >
                    {String(v)}
                  </Typography>
                </Box>
                {idx < lines.length - 1 && <Divider sx={{ mt: 1.2 }} />}
              </Box>
            ))}
          </Paper>

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: "#487F9A", fontWeight: 800 }}>
              {credentials?.login_hint || "Connexion avec username OU téléphone + mot de passe"}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} sx={{ fontWeight: 900, textTransform: "none" }}>
            Fermer
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: "50px",
              px: 3,
              background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
              boxShadow: "0 8px 24px rgba(11, 86, 140, 0.35)",
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            Copier
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack({ open: false, msg: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack({ open: false, msg: "" })}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: 3, fontWeight: 900 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
