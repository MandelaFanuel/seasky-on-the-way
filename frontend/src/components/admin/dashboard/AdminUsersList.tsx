// ========================= src/components/admin/dashboard/AdminUsersList.tsx =========================
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  alpha,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import api from "../../../services/api";

export type AdminUsersListHandle = {
  refresh: () => Promise<void>;
  openCreate?: () => void; // ✅ AdminDashboard l'appelle déjà
};

type Props = {
  onLoadingChange?: (loading: boolean) => void;
};

type ToastState = { type: "success" | "error" | "warning" | "info"; msg: string } | null;

type UserRow = {
  id: number;
  username: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  account_type?: string | null;
  account_type_label?: string | null;
  account_category?: string | null;
  account_category_label?: string | null;
  role?: string | null;
  kyc_status?: string | null;
  account_status?: string | null;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at?: string | null;
};

type UserDoc = {
  id: number;
  document_type?: string | null;
  file_name?: string | null;
  file_url?: string | null; // idéal
  file?: string | null; // fallback
  uploaded_at?: string | null;
};

function initials(name?: string | null) {
  const s = (name || "").trim();
  if (!s) return "U";
  const parts = s.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function isAdminUserRow(u: UserRow) {
  const role = (u.role || "").toLowerCase();
  return Boolean(u.is_staff || u.is_superuser || role === "admin");
}

function statusChip(theme: any, u: UserRow) {
  const isActive = !!u.is_active;
  const accountStatus = (u.account_status || "").toLowerCase();
  const blocked =
    accountStatus.includes("block") ||
    accountStatus.includes("suspend") ||
    accountStatus.includes("disable") ||
    accountStatus.includes("inactive");

  if (!isActive || blocked) {
    return (
      <Chip
        icon={<BlockIcon sx={{ fontSize: 16 }} />}
        label="Bloqué / Inactif"
        sx={{
          fontWeight: 800,
          backgroundColor: alpha(theme.palette.error.main, 0.08),
          color: theme.palette.error.dark,
        }}
        size="small"
      />
    );
  }

  return (
    <Chip
      icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
      label="Actif"
      sx={{
        fontWeight: 800,
        backgroundColor: alpha(theme.palette.success.main, 0.08),
        color: theme.palette.success.dark,
      }}
      size="small"
    />
  );
}

function kycChip(theme: any, kyc?: string | null) {
  const v = (kyc || "").toLowerCase();
  if (v === "verified") {
    return (
      <Chip
        icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
        label="verified"
        size="small"
        sx={{
          fontWeight: 900,
          backgroundColor: alpha(theme.palette.success.main, 0.10),
          color: theme.palette.success.dark,
        }}
      />
    );
  }
  if (v === "pending") {
    return (
      <Chip
        label="pending"
        size="small"
        sx={{
          fontWeight: 900,
          backgroundColor: alpha(theme.palette.warning.main, 0.10),
          color: theme.palette.warning.dark,
        }}
      />
    );
  }
  if (v === "rejected") {
    return (
      <Chip
        label="rejected"
        size="small"
        sx={{
          fontWeight: 900,
          backgroundColor: alpha(theme.palette.error.main, 0.10),
          color: theme.palette.error.dark,
        }}
      />
    );
  }
  return (
    <Chip
      label={(kyc || "—").toString()}
      size="small"
      sx={{
        fontWeight: 900,
        backgroundColor: alpha(theme.palette.secondary.main, 0.08),
        color: theme.palette.text.primary,
      }}
    />
  );
}

function errMsg(e: any) {
  return e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Erreur inconnue";
}

const AdminUsersList = forwardRef<AdminUsersListHandle, Props>(function AdminUsersList({ onLoadingChange }, ref) {
  const theme = useTheme();

  const onLoadingRef = useRef<Props["onLoadingChange"]>(onLoadingChange);
  useEffect(() => {
    onLoadingRef.current = onLoadingChange;
  }, [onLoadingChange]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [toast, setToast] = useState<ToastState>(null);

  // ---------------------------
  // KYC Docs modal
  // ---------------------------
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsUser, setDocsUser] = useState<UserRow | null>(null);
  const [docs, setDocs] = useState<UserDoc[]>([]);

  const openKycDocs = async (u: UserRow) => {
    setDocsUser(u);
    setDocs([]);
    setDocsOpen(true);
    setDocsLoading(true);
    try {
      const res = await api.get(`/admin/users/${u.id}/documents/`);
      const payload = res.data;
      const list: UserDoc[] = Array.isArray(payload) ? payload : payload?.results || [];
      if (!mountedRef.current) return;
      setDocs(list);
    } catch (e: any) {
      if (!mountedRef.current) return;
      const status = e?.response?.status;
      if (status === 404 || status === 405) {
        setToast({ type: "warning", msg: "Endpoint manquant: GET /admin/users/{id}/documents/" });
      } else {
        setToast({ type: "error", msg: errMsg(e) });
      }
      setDocs([]);
    } finally {
      if (!mountedRef.current) return;
      setDocsLoading(false);
    }
  };

  // ---------------------------
  // Verify modal
  // ---------------------------
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyUser, setVerifyUser] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const askVerify = (u: UserRow) => {
    setVerifyUser(u);
    setVerifyOpen(true);
  };

  const doVerify = async () => {
    if (!verifyUser) return;
    setBusy(true);
    try {
      await api.post(`/admin/users/${verifyUser.id}/verify_kyc/`);
      setToast({ type: "success", msg: "✅ KYC/KYB validé: statut = verified" });
      setVerifyOpen(false);
      setVerifyUser(null);
      await doFetch();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404 || status === 405) {
        setToast({ type: "warning", msg: "Endpoint manquant: POST /admin/users/{id}/verify_kyc/" });
      } else {
        setToast({ type: "error", msg: errMsg(e) });
      }
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------
  // CRUD modal
  // ---------------------------
  const [crudOpen, setCrudOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<"create" | "edit">("create");
  const [crudUser, setCrudUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    role: "",
    account_type: "",
  });

  const openCreate = () => {
    setCrudMode("create");
    setCrudUser(null);
    setForm({ username: "", email: "", full_name: "", phone: "", role: "", account_type: "" });
    setCrudOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setCrudMode("edit");
    setCrudUser(u);
    setForm({
      username: u.username || "",
      email: (u.email || "") as any,
      full_name: (u.full_name || "") as any,
      phone: (u.phone || "") as any,
      role: (u.role || "") as any,
      account_type: (u.account_type || "") as any,
    });
    setCrudOpen(true);
  };

  const saveCrud = async () => {
    setBusy(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        role: form.role.trim(),
        account_type: form.account_type.trim(),
      };

      if (crudMode === "create") {
        await api.post("/admin/users/", payload);
        setToast({ type: "success", msg: "✅ Utilisateur créé" });
      } else {
        if (!crudUser?.id) throw new Error("Utilisateur invalide");
        await api.patch(`/admin/users/${crudUser.id}/`, payload);
        setToast({ type: "success", msg: "✅ Utilisateur modifié" });
      }

      setCrudOpen(false);
      await doFetch();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404 || status === 405) {
        setToast({
          type: "warning",
          msg: "CRUD backend non disponible (POST/PATCH). Active un ModelViewSet côté Django.",
        });
      } else {
        setToast({ type: "error", msg: errMsg(e) });
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async (u: UserRow) => {
    setBusy(true);
    try {
      await api.delete(`/admin/users/${u.id}/`);
      setToast({ type: "success", msg: "✅ Utilisateur supprimé" });
      await doFetch();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404 || status === 405) {
        setToast({
          type: "warning",
          msg: "CRUD backend non disponible (DELETE). Active un ModelViewSet côté Django.",
        });
      } else {
        setToast({ type: "error", msg: errMsg(e) });
      }
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------
  // Fetch
  // ---------------------------
  const doFetch = async (signal?: AbortSignal) => {
    setLoading(true);
    onLoadingRef.current?.(true);
    try {
      const params: Record<string, any> = { page: page + 1, page_size: pageSize };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("/admin/users/", { params, signal });

      const payload = res.data;
      let list: UserRow[] = [];

      if (Array.isArray(payload)) {
        list = payload;
      } else {
        list = payload?.results || [];
      }

      // ✅ Ne jamais afficher admin dans la liste (même si backend renvoie)
      list = list.filter((u) => !isAdminUserRow(u));

      if (!mountedRef.current) return;

      setRows(list);

      const computedCount = Array.isArray(payload)
        ? list.length
        : (payload?.count ?? (payload?.results?.length ?? 0));

      setCount(computedCount);
    } catch (e: any) {
      // ignore abort
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;

      if (!mountedRef.current) return;
      setRows([]);
      setCount(0);
      setToast({
        type: "error",
        msg: e?.response?.data?.detail || e?.message || "Erreur lors du chargement des utilisateurs",
      });
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      onLoadingRef.current?.(false);
    }
  };

  // ✅ Fetch only when inputs change (NO infinite loop)
  useEffect(() => {
    const controller = new AbortController();
    doFetch(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter, search]);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await doFetch();
    },
    openCreate: () => openCreate(),
  }));

  const headerRight = useMemo(() => {
    return (
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
        <TextField
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          placeholder="Rechercher (username, nom, email, téléphone...)"
          size="small"
          sx={{ minWidth: { xs: "100%", sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            label="Statut"
            value={statusFilter}
            onChange={(e) => {
              setPage(0);
              setStatusFilter(e.target.value as any);
            }}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="active">Actifs</MenuItem>
            <MenuItem value="inactive">Bloqués / Inactifs</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={openCreate}
          disabled={loading}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            fontWeight: 800,
            borderWidth: 2,
            borderColor: "#0B568C",
            color: "#0B568C",
            "&:hover": {
              borderWidth: 2,
              borderColor: "#0A345F",
              backgroundColor: alpha("#0B568C", 0.05),
            },
          }}
        >
          Ajouter
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => doFetch()}
          disabled={loading}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            fontWeight: 800,
            borderWidth: 2,
            borderColor: "#0B568C",
            color: "#0B568C",
            "&:hover": {
              borderWidth: 2,
              borderColor: "#0A345F",
              backgroundColor: alpha("#0B568C", 0.05),
            },
          }}
        >
          Actualiser
        </Button>
      </Stack>
    );
  }, [loading, search, statusFilter, theme.palette.text.secondary]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            background: alpha(theme.palette.primary.light, 0.04),
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AdminPanelSettingsIcon sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.primary.dark }} marginTop={10}>
                  Liste des utilisateurs
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  Tous les comptes (actifs, bloqués, désactivés) • Recherche + filtre statut • Validation KYC/KYB (admin)
                </Typography>
              </Box>
            </Stack>

            {headerRight}
          </Stack>

          <Stack direction="row" spacing={1.2} sx={{ mt: 2, flexWrap: "wrap" }}>
            <Chip
              label={`Total: ${count}`}
              sx={{
                fontWeight: 900,
                backgroundColor: alpha(theme.palette.info.main, 0.08),
                color: theme.palette.info.dark,
              }}
            />
            <Chip
              label={`Filtre: ${statusFilter === "all" ? "Tous" : statusFilter === "active" ? "Actifs" : "Inactifs"}`}
              sx={{
                fontWeight: 900,
                backgroundColor: alpha(theme.palette.warning.main, 0.08),
                color: theme.palette.warning.dark,
              }}
            />
          </Stack>
        </Box>

        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.shadows[1],
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 900 }}>Utilisateur</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Compte</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Rôle</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>KYC</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Créé le</TableCell>
                  {/* ✅ NOUVEAU: Actions (sans casser le design) */}
                  <TableCell sx={{ fontWeight: 900 }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
                        <CircularProgress size={18} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Chargement...
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, py: 2 }}>
                        Aucun utilisateur trouvé.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  rows.map((u) => {
                    const kyc = (u.kyc_status || "").toLowerCase();
                    const isVerified = kyc === "verified";

                    return (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: theme.palette.primary.dark,
                                fontWeight: 900,
                              }}
                            >
                              {initials(u.full_name || u.username)}
                            </Avatar>

                            <Box>
                              <Typography fontWeight={900} sx={{ lineHeight: 1.2 }}>
                                {u.full_name || u.username}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                @{u.username} • {u.email || "—"} • {u.phone || "—"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.3}>
                            <Typography fontWeight={800} sx={{ fontSize: 13 }}>
                              {u.account_type_label || u.account_type || "—"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {u.account_category_label || u.account_category || ""}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={<PersonIcon sx={{ fontSize: 16 }} />}
                            label={u.role || "—"}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.dark,
                            }}
                          />
                        </TableCell>

                        <TableCell>{statusChip(theme, u)}</TableCell>

                        <TableCell>{kycChip(theme, u.kyc_status)}</TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                            {u.created_at ? new Date(u.created_at).toLocaleString("fr-FR") : "—"}
                          </Typography>
                        </TableCell>

                        {/* ✅ Actions: KYC + Valider + CRUD */}
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DescriptionIcon sx={{ fontSize: 18 }} />}
                              onClick={() => openKycDocs(u)}
                              sx={{
                                borderRadius: "50px",
                                textTransform: "none",
                                fontWeight: 800,
                                borderWidth: 2,
                                borderColor: "#0B568C",
                                color: "#0B568C",
                                "&:hover": {
                                  borderWidth: 2,
                                  borderColor: "#0A345F",
                                  backgroundColor: alpha("#0B568C", 0.05),
                                },
                              }}
                            >
                              KYC
                            </Button>

                            <Tooltip title={isVerified ? "Déjà vérifié" : "Valider le KYC/KYB"}>
                              <span>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<VerifiedUserIcon sx={{ fontSize: 18 }} />}
                                  disabled={isVerified || busy}
                                  onClick={() => askVerify(u)}
                                  sx={{
                                    borderRadius: "50px",
                                    textTransform: "none",
                                    fontWeight: 900,
                                    background: isVerified
                                      ? alpha(theme.palette.success.main, 0.25)
                                      : "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                                    boxShadow: "none",
                                    "&:hover": { transform: isVerified ? "none" : "translateY(-1px)" },
                                  }}
                                >
                                  Valider
                                </Button>
                              </span>
                            </Tooltip>

                            <IconButton
                              size="small"
                              onClick={() => openEdit(u)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => deleteUser(u)}
                              disabled={busy}
                              sx={{ color: theme.palette.error.main }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <TablePagination
              component="div"
              count={count}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPage(0);
                setPageSize(parseInt(e.target.value, 10));
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </Box>
        </Paper>
      </Stack>

      {/* ------------------------ KYC DOCS MODAL ------------------------ */}
      <Dialog open={docsOpen} onClose={() => setDocsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          Documents KYC/KYB — {docsUser?.full_name || docsUser?.username || ""}
        </DialogTitle>
        <DialogContent dividers>
          {docsLoading ? (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Chargement des documents...
              </Typography>
            </Stack>
          ) : docs.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Aucun document trouvé (ou endpoint manquant).
            </Typography>
          ) : (
            <Stack spacing={1.2}>
              {docs.map((d) => {
                const url = (d.file_url || d.file || "") as string;
                return (
                  <Paper
                    key={d.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      background: alpha(theme.palette.primary.light, 0.02),
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.2}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography fontWeight={900}>{d.document_type || "Document"}</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {d.file_name || "—"} •{" "}
                          {d.uploaded_at ? new Date(d.uploaded_at).toLocaleString("fr-FR") : "—"}
                        </Typography>
                      </Box>

                      {url ? (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            borderRadius: "50px",
                            textTransform: "none",
                            fontWeight: 800,
                            borderWidth: 2,
                            borderColor: "#0B568C",
                            color: "#0B568C",
                            "&:hover": {
                              borderWidth: 2,
                              borderColor: "#0A345F",
                              backgroundColor: alpha("#0B568C", 0.05),
                            },
                          }}
                        >
                          Ouvrir
                        </Button>
                      ) : (
                        <Chip
                          label="URL manquante"
                          size="small"
                          sx={{
                            fontWeight: 900,
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                            color: theme.palette.error.dark,
                          }}
                        />
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}

          <Divider sx={{ my: 2 }} />

          <Alert severity="info" sx={{ fontWeight: 700 }}>
            Si tu vois “endpoint manquant”, ajoute côté backend:
            <b> GET /api/v1/admin/users/&lt;id&gt;/documents/</b>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setDocsOpen(false)}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "#0B568C",
              color: "#0B568C",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0A345F",
                backgroundColor: alpha("#0B568C", 0.05),
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------ VERIFY MODAL ------------------------ */}
      <Dialog open={verifyOpen} onClose={() => setVerifyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Valider KYC/KYB</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
            Confirmer la validation pour{" "}
            <b>{verifyUser?.full_name || verifyUser?.username || ""}</b> ?
          </Typography>

          <Alert severity="info" sx={{ mt: 2, fontWeight: 700 }}>
            Après validation, le statut devient <b>verified</b> et le badge devient vert.
          </Alert>

          <Alert severity="warning" sx={{ mt: 2, fontWeight: 700 }}>
            Endpoint requis: <b>POST /api/v1/admin/users/&lt;id&gt;/verify_kyc/</b>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setVerifyOpen(false)}
            disabled={busy}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "#0B568C",
              color: "#0B568C",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0A345F",
                backgroundColor: alpha("#0B568C", 0.05),
              },
            }}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            onClick={doVerify}
            disabled={busy}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            {busy ? "Traitement..." : "Valider"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------ CRUD MODAL ------------------------ */}
      <Dialog open={crudOpen} onClose={() => setCrudOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {crudMode === "create" ? "Créer un utilisateur" : "Modifier l'utilisateur"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Nom complet"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Téléphone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Rôle"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              size="small"
              fullWidth
              placeholder="client, agent..."
            />
            <TextField
              label="Type de compte"
              value={form.account_type}
              onChange={(e) => setForm((p) => ({ ...p, account_type: e.target.value }))}
              size="small"
              fullWidth
              placeholder="client, entreprise..."
            />

            <Alert severity="info" sx={{ fontWeight: 700 }}>
              Si ton backend est en ReadOnly, POST/PATCH/DELETE renverront 405.  
              Endpoints requis: <b>POST /admin/users/</b>, <b>PATCH /admin/users/&lt;id&gt;/</b>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setCrudOpen(false)}
            disabled={busy}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "#0B568C",
              color: "#0B568C",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0A345F",
                backgroundColor: alpha("#0B568C", 0.05),
              },
            }}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            onClick={saveCrud}
            disabled={busy}
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            {busy ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar TS-safe */}
      {toast && (
        <Snackbar
          open={true}
          autoHideDuration={3500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ fontWeight: 700 }}>
            {toast.msg}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
});

export default AdminUsersList;
