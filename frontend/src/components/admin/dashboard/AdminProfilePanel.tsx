// ========================= src/components/admin/dashboard/AdminProfilePanel.tsx =========================
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import axios from "axios";

import {
  Box,
  Paper,
  Typography,
  alpha,
  useTheme,
  Avatar,
  Stack,
  Button,
  Chip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  MenuItem,
  IconButton,
  Badge,
  useMediaQuery,
} from "@mui/material";

import {
  AdminPanelSettings as AdminIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  Public as PublicIcon,
  Wc as GenderIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

export type AdminProfilePanelHandle = {
  refresh: () => Promise<void>;
};

type Props = {
  onLoadingChange?: (loading: boolean) => void;
};

type Snack = {
  open: boolean;
  msg: string;
  severity: "success" | "error" | "info" | "warning";
};

type AdminUser = {
  id?: number;
  username?: string;
  email?: string;
  photo?: string; // Note: backend utilise "photo", pas "profile_picture"

  // rôle / flags
  role?: string;
  is_staff?: boolean;
  is_superuser?: boolean;

  full_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string; // YYYY-MM-DD
  nationality?: string;

  kyc_status?: string;
  last_login_at?: string;
  created_at?: string;
};

function safeInitials(name?: string) {
  const n = (name || "").trim();
  if (!n) return "A";
  return n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");
}

function normalizeBaseUrl(input?: string) {
  let url = (input ?? "").trim();
  if (!url) return "";
  url = url.replace(/\/+$/, "");
  return url;
}

function getApiBase(): string {
  const fromEnv =
    (import.meta as any)?.env?.VITE_API_BASE_URL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    "";
  const base = normalizeBaseUrl(fromEnv);
  return base || "http://localhost:8000/api/v1";
}

function getAccessToken(): string | null {
  return localStorage.getItem("access") || localStorage.getItem("access_token") || null;
}

function toFrDateTime(input?: string) {
  if (!input) return "-";
  try {
    return new Date(input).toLocaleString("fr-FR");
  } catch {
    return input;
  }
}

// Fonction pour obtenir l'URL complète de la photo de profil
const getPhotoUrl = (photo?: string): string | null => {
  if (!photo) return null;
  
  // Si c'est déjà une URL complète
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  
  // Si c'est un chemin relatif, ajouter la base URL
  const baseUrl = getApiBase().replace('/api/v1', '');
  return `${baseUrl}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

const AdminProfilePanel = forwardRef<AdminProfilePanelHandle, Props>(function AdminProfilePanel(
  { onLoadingChange },
  ref
) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  // ✅ IMPORTANT: éviter le refetch infini causé par onLoadingChange inline du parent
  const onLoadingRef = useRef<Props["onLoadingChange"]>(onLoadingChange);
  useEffect(() => {
    onLoadingRef.current = onLoadingChange;
  }, [onLoadingChange]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    nationality: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [snack, setSnack] = useState<Snack>({
    open: false,
    msg: "",
    severity: "info",
  });

  const showSnack = useCallback((msg: string, severity: Snack["severity"] = "info") => {
    setSnack({ open: true, msg, severity });
  }, []);

  // ✅ avoid setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: getApiBase(),
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    instance.interceptors.request.use((config: any) => {
      const token = getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return instance;
  }, []);

  const apiMultipart = useMemo(() => {
    const instance = axios.create({
      baseURL: getApiBase(),
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 20000,
    });

    instance.interceptors.request.use((config: any) => {
      const token = getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return instance;
  }, []);

  const isAdmin = useMemo(() => {
    return Boolean(
      admin &&
        (admin.is_superuser ||
          admin.is_staff ||
          (admin.role || "").toLowerCase() === "admin")
    );
  }, [admin]);

  // ✅ Rôle affiché: basé sur flags admin (même si role DB est "client")
  const displayRole = useMemo(() => {
    if (!admin) return "admin";
    if (admin.is_superuser || admin.is_staff) return "admin";
    const r = (admin.role || "").trim();
    return r ? r : "admin";
  }, [admin]);

  const missingFields = useMemo(() => {
    const a = admin || {};
    const missing: string[] = [];
    if (!String(a.full_name || "").trim()) missing.push("Nom complet");
    if (!String(a.phone || "").trim()) missing.push("Téléphone");
    if (!String(a.gender || "").trim()) missing.push("Genre");
    if (!String(a.date_of_birth || "").trim()) missing.push("Date de naissance");
    if (!String(a.nationality || "").trim()) missing.push("Nationalité");
    return missing;
  }, [admin]);

  const profileComplete = useMemo(() => missingFields.length === 0, [missingFields]);

  const profileCompletePreview = useMemo(() => {
    if (!editMode) return profileComplete;
    const missing: string[] = [];
    if (!form.full_name.trim()) missing.push("Nom complet");
    if (!form.phone.trim()) missing.push("Téléphone");
    if (!form.gender.trim()) missing.push("Genre");
    if (!form.date_of_birth.trim()) missing.push("Date de naissance");
    if (!form.nationality.trim()) missing.push("Nationalité");
    return missing.length === 0;
  }, [editMode, form, profileComplete]);

  const initials = useMemo(() => safeInitials(admin?.full_name || admin?.username), [admin]);

  const photoUrl = useMemo(() => {
    if (photoPreview) return photoPreview;
    if (admin?.photo) {
      return getPhotoUrl(admin.photo);
    }
    return null;
  }, [admin?.photo, photoPreview]);

  const fillFormFromAdmin = useCallback((u: AdminUser) => {
    setForm({
      full_name: u.full_name || "",
      phone: u.phone || "",
      gender: u.gender || "",
      date_of_birth: u.date_of_birth || "",
      nationality: u.nationality || "",
    });
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    onLoadingRef.current?.(true);

    const controller = new AbortController();

    try {
      const res = await api.get("/me/profile/", { signal: controller.signal as any });
      const data = (res?.data || {}) as AdminUser;

      if (!mountedRef.current) return;

      setAdmin(data);
      fillFormFromAdmin(data);
      
      // Réinitialiser la prévisualisation photo
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e: any) {
      if (!mountedRef.current) return;
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        (e?.code === "ECONNABORTED" ? "Timeout: le serveur ne répond pas (15s)" : "") ||
        e?.message ||
        "Impossible de charger le profil admin";
      showSnack(msg, "error");
      setAdmin(null);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      onLoadingRef.current?.(false);
    }
  }, [api, fillFormFromAdmin, showSnack]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await fetchProfile();
    },
  }));

  // ✅ Auto-kyc verified pour admin : UNIQUEMENT si profil complet
  const didAutoVerifyRef = useRef(false);
  useEffect(() => {
    if (!admin) return;
    if (!isAdmin) return;
    if (!profileComplete) return;
    if (didAutoVerifyRef.current) return;

    const current = (admin.kyc_status || "").toLowerCase();
    if (current === "verified") {
      didAutoVerifyRef.current = true;
      return;
    }

    didAutoVerifyRef.current = true;

    (async () => {
      try {
        await api.patch("/me/update_profile/", { kyc_status: "verified" });
        if (!mountedRef.current) return;
        setAdmin((p) => (p ? { ...p, kyc_status: "verified" } : p));
      } catch {
        // ignore
      }
    })();
  }, [admin, api, isAdmin, profileComplete]);

  const handleStartEdit = () => {
    if (admin) fillFormFromAdmin(admin);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    if (admin) fillFormFromAdmin(admin);
    setEditMode(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const validateForm = () => {
    const missing: string[] = [];
    if (!form.full_name.trim()) missing.push("Nom complet");
    if (!form.phone.trim()) missing.push("Téléphone");
    if (!form.gender.trim()) missing.push("Genre");
    if (!form.date_of_birth.trim()) missing.push("Date de naissance");
    if (!form.nationality.trim()) missing.push("Nationalité");

    if (missing.length) {
      showSnack(`Veuillez compléter: ${missing.join(", ")}`, "warning");
      return false;
    }
    return true;
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showSnack("Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.", "error");
      return;
    }

    // Validation de la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showSnack("La taille de l'image ne doit pas dépasser 5MB.", "error");
      return;
    }

    setPhotoFile(file);
    
    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    onLoadingRef.current?.(true);

    try {
      const formData = new FormData();

      // Ajouter la photo si une nouvelle a été sélectionnée
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Ajouter les autres informations du profil
      formData.append('full_name', form.full_name.trim());
      formData.append('phone', form.phone.trim());
      formData.append('gender', form.gender.trim());
      formData.append('date_of_birth', form.date_of_birth.trim());
      formData.append('nationality', form.nationality.trim());

      if (isAdmin && profileCompletePreview) {
        formData.append('kyc_status', 'verified');
      }

      // Utiliser PATCH avec FormData
      const res = await apiMultipart.patch("/me/update_profile/", formData);
      const updated = (res?.data || {}) as AdminUser;

      if (!mountedRef.current) return;

      setAdmin((p) => ({ 
        ...(p || {}), 
        ...updated,
        ...form,
        photo: updated.photo || p?.photo
      }));
      
      setEditMode(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      
      showSnack("Profil mis à jour avec succès", "success");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        (e?.code === "ECONNABORTED" ? "Timeout: le serveur ne répond pas (15s)" : "") ||
        e?.message ||
        "Échec de la mise à jour du profil";
      showSnack(msg, "error");
    } finally {
      setSaving(false);
      onLoadingRef.current?.(false);
    }
  };

  const kycLabel = useMemo(() => {
    if (!admin) return "KYC";
    if (isAdmin) return profileComplete ? "KYC: Vérifié" : "KYC: Incomplet";

    const v = (admin.kyc_status || "").toLowerCase();
    if (v === "verified") return "KYC: Vérifié";
    if (v === "pending") return "KYC: En attente";
    if (v === "rejected") return "KYC: Rejeté";
    return "KYC";
  }, [admin, isAdmin, profileComplete]);

  const kycColor = useMemo(() => {
    if (isAdmin) {
      return profileComplete
        ? { bg: alpha("#4CAF50", 0.1), fg: "#2E7D32" }
        : { bg: alpha("#FF9800", 0.12), fg: "#EF6C00" };
    }

    const v = (admin?.kyc_status || "").toLowerCase();
    if (v === "verified") return { bg: alpha("#4CAF50", 0.1), fg: "#2E7D32" };
    if (v === "pending") return { bg: alpha("#FF9800", 0.1), fg: "#EF6C00" };
    if (v === "rejected") return { bg: alpha("#F44336", 0.1), fg: "#C62828" };
    return { bg: alpha("#27B1E4", 0.12), fg: "#0B568C" };
  }, [admin, isAdmin, profileComplete]);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)",
        minHeight: "calc(100vh - 240px)",
        py: { xs: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        mt: { xs: 4, md: 8 },
      }}
    >
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 900,
            background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "1.5rem", md: "2.125rem" },
          }}
        >
          Profil Administrateur
        </Typography>
        <Typography sx={{ 
          color: "#335F7A", 
          fontWeight: 600,
          fontSize: { xs: "0.875rem", md: "1rem" }
        }}>
          Complète tes informations personnelles (KYC admin : vérifié automatiquement une fois le profil complet)
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(10, 52, 95, 0.1)",
          border: "1px solid rgba(11, 86, 140, 0.1)",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        }}
      >
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "flex-start"} flexWrap="wrap" gap={2}>
          <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems={isMobile ? "flex-start" : "center"} width={isMobile ? "100%" : "auto"}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                editMode ? (
                  <IconButton
                    onClick={triggerFileInput}
                    sx={{
                      backgroundColor: "#0B568C",
                      color: "white",
                      width: { xs: 30, md: 36 },
                      height: { xs: 30, md: 36 },
                      '&:hover': { backgroundColor: "#0A345F" }
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                ) : null
              }
            >
              <Avatar
                src={photoUrl || undefined}
                sx={{
                  width: { xs: 60, md: 72 },
                  height: { xs: 60, md: 72 },
                  bgcolor: photoUrl ? "transparent" : "white",
                  color: "#0B568C",
                  border: "2px solid rgba(11,86,140,0.15)",
                  boxShadow: "0 12px 30px rgba(11, 86, 140, 0.15)",
                  fontWeight: 900,
                  fontSize: { xs: "1.4rem", md: "1.6rem" },
                }}
              >
                {photoUrl ? '' : initials}
              </Avatar>
            </Badge>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ 
                fontWeight: 900, 
                color: "#1A4F75", 
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                mb: 0.5 
              }}>
                {admin?.full_name || "Administrateur"}
              </Typography>
              <Typography sx={{ 
                color: "#487F9A", 
                fontWeight: 800,
                fontSize: { xs: "0.875rem", md: "1rem" }
              }}>
                @{admin?.username || "admin"} • {displayRole}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                <Chip
                  icon={<AdminIcon sx={{ fontSize: 14 }} />}
                  label="Accès Admin"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 900, 
                    backgroundColor: alpha("#0B568C", 0.1), 
                    color: "#0B568C",
                    fontSize: { xs: "0.75rem", md: "0.875rem" }
                  }}
                />
                <Chip
                  icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                  label="Sécurité"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 900, 
                    backgroundColor: alpha("#27B1E4", 0.12), 
                    color: "#0B568C",
                    fontSize: { xs: "0.75rem", md: "0.875rem" }
                  }}
                />
                <Chip
                  icon={<VerifiedUserIcon sx={{ fontSize: 14 }} />}
                  label={kycLabel}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 900, 
                    backgroundColor: kycColor.bg, 
                    color: kycColor.fg,
                    fontSize: { xs: "0.75rem", md: "0.875rem" }
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          <Stack 
            direction="row" 
            spacing={1} 
            flexWrap="wrap" 
            justifyContent={isMobile ? "flex-start" : "flex-end"} 
            alignItems="center" 
            gap={1}
            sx={{ mt: isMobile ? 2 : 0 }}
          >
            {!editMode ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleStartEdit}
                disabled={loading || saving}
                size={isMobile ? "small" : "medium"}
                sx={{
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 900,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                  boxShadow: "0 8px 24px rgba(11, 86, 140, 0.35)",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
              >
                Modifier mon profil
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 900,
                    px: { xs: 2, md: 3 },
                    py: { xs: 1, md: 1.5 },
                    background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                    boxShadow: "0 8px 24px rgba(11, 86, 140, 0.35)",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={handleCancelEdit}
                  disabled={saving}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 900,
                    borderWidth: 2,
                    borderColor: alpha("#0B568C", 0.35),
                    color: "#0B568C",
                    px: { xs: 2, md: 3 },
                    py: { xs: 1, md: 1.5 },
                    "&:hover": { 
                      borderWidth: 2, 
                      backgroundColor: alpha("#0B568C", 0.05) 
                    },
                  }}
                >
                  Annuler
                </Button>
              </>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {(loading || saving) && (
          <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={18} />
              <Typography fontWeight={900} sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                {saving ? "Enregistrement du profil…" : "Chargement du profil…"}
              </Typography>
            </Stack>
          </Alert>
        )}

        {!!missingFields.length && !editMode && (
          <Alert severity="warning" sx={{ borderRadius: 2, mb: 2, fontWeight: 700, fontSize: { xs: "0.875rem", md: "1rem" } }}>
            Profil incomplet. Merci de compléter : <b>{missingFields.join(", ")}</b>.
          </Alert>
        )}

        {/* Input fichier caché pour la photo */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handlePhotoSelect}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { 
              xs: "1fr", 
              md: "1fr 1fr" 
            },
            gap: { xs: 2, md: 3 },
          }}
        >
          <Paper sx={{ 
            p: { xs: 2, md: 3 }, 
            borderRadius: 3, 
            border: "1px solid rgba(11,86,140,0.08)" 
          }}>
            <Typography fontWeight={900} sx={{ 
              color: "#1A4F75", 
              mb: 2,
              fontSize: { xs: "1rem", md: "1.125rem" }
            }}>
              Informations personnelles
            </Typography>

            <Stack spacing={2}>
              {/* Section Photo de profil en mode édition */}
              {editMode && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: "#335F7A", 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: "0.875rem", md: "0.9rem" }
                  }}>
                    Photo de profil
                  </Typography>
                  <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems={isMobile ? "flex-start" : "center"}>
                    <Avatar
                      src={photoPreview || getPhotoUrl(admin?.photo) || undefined}
                      sx={{ width: 64, height: 64 }}
                    >
                      {initials}
                    </Avatar>
                    <Stack spacing={1} sx={{ width: isMobile ? "100%" : "auto" }}>
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        onClick={triggerFileInput}
                        size="small"
                        sx={{
                          borderRadius: "50px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderWidth: 2,
                          borderColor: "#0B568C",
                          color: "#0B568C",
                          width: isMobile ? "100%" : "auto"
                        }}
                      >
                        Changer la photo
                      </Button>
                      {(photoFile || admin?.photo) && (
                        <Button
                          variant="text"
                          startIcon={<DeleteIcon />}
                          onClick={handleRemovePhoto}
                          size="small"
                          sx={{
                            borderRadius: "50px",
                            textTransform: "none",
                            fontWeight: 600,
                            color: "#F44336",
                            width: isMobile ? "100%" : "auto"
                          }}
                        >
                          Supprimer la photo
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                  <Typography variant="caption" sx={{ 
                    color: "#487F9A", 
                    display: "block", 
                    mt: 1,
                    fontSize: { xs: "0.75rem", md: "0.875rem" }
                  }}>
                    Formats supportés: JPEG, PNG, GIF, WebP. Taille max: 5MB.
                  </Typography>
                </Box>
              )}

              <TextField
                label="Nom complet **"
                value={editMode ? form.full_name : admin?.full_name || ""}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                disabled={!editMode}
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputProps={{ 
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} /> as any 
                }}
              />

              <TextField
                label="Téléphone **"
                value={editMode ? form.phone : admin?.phone || ""}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                disabled={!editMode}
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputProps={{ 
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} /> as any 
                }}
              />

              <TextField
                select
                label="Genre **"
                value={editMode ? form.gender : admin?.gender || ""}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                disabled={!editMode}
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputProps={{ 
                  startAdornment: <GenderIcon sx={{ mr: 1, color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} /> as any 
                }}
              >
                <MenuItem value="">— Sélectionner —</MenuItem>
                <MenuItem value="male">Masculin</MenuItem>
                <MenuItem value="female">Féminin</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </TextField>

              <TextField
                label="Date de naissance **"
                type="date"
                value={editMode ? form.date_of_birth : admin?.date_of_birth || ""}
                onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))}
                disabled={!editMode}
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputLabelProps={{ shrink: true }}
                InputProps={{ 
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} /> as any 
                }}
              />

              <TextField
                label="Nationalité **"
                value={editMode ? form.nationality : admin?.nationality || ""}
                onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))}
                disabled={!editMode}
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputProps={{ 
                  startAdornment: <PublicIcon sx={{ mr: 1, color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} /> as any 
                }}
              />
            </Stack>
          </Paper>

          <Paper sx={{ 
            p: { xs: 2, md: 3 }, 
            borderRadius: 3, 
            border: "1px solid rgba(11,86,140,0.08)" 
          }}>
            <Typography fontWeight={900} sx={{ 
              color: "#1A4F75", 
              mb: 2,
              fontSize: { xs: "1rem", md: "1.125rem" }
            }}>
              Compte & session
            </Typography>

            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon sx={{ color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} />
                <Typography fontWeight={800} sx={{ 
                  color: "#335F7A",
                  fontSize: { xs: "0.875rem", md: "1rem" }
                }}>
                  {admin?.email || "-"}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon sx={{ color: "#0B568C", fontSize: { xs: "1rem", md: "1.25rem" } }} />
                <Typography fontWeight={800} sx={{ 
                  color: "#335F7A",
                  fontSize: { xs: "0.875rem", md: "1rem" }
                }}>
                  Rôle: {displayRole}
                </Typography>
              </Stack>

              <Typography sx={{ 
                color: "#335F7A", 
                fontWeight: 800, 
                mt: 1,
                fontSize: { xs: "0.875rem", md: "1rem" }
              }}>
                Dernière connexion:{" "}
                <Box component="span" sx={{ color: "#487F9A" }}>
                  {admin?.last_login_at ? toFrDateTime(admin.last_login_at) : "-"}
                </Box>
              </Typography>

              <Alert severity="info" sx={{ 
                borderRadius: 2, 
                mt: 2,
                fontSize: { xs: "0.875rem", md: "1rem" }
              }}>
                <Typography fontWeight={800} sx={{ fontSize: "inherit" }}>
                  Conseil : complète ton profil pour activer automatiquement le badge KYC Admin.
                </Typography>
              </Alert>
            </Stack>
          </Paper>
        </Box>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: isMobile ? "center" : "right" }}
        sx={{ 
          bottom: { xs: 90, md: 24 } // Éviter le bouton flottant sur mobile
        }}
      >
        <Alert
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          severity={snack.severity}
          sx={{ 
            borderRadius: 3, 
            fontWeight: 900,
            fontSize: { xs: "0.875rem", md: "1rem" }
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default AdminProfilePanel;