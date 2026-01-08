mon cher j'ai cette page: // ========================= src/pages/dashboards/DoctorDashboardPage.tsx =========================
import React, { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Dashboard as DashboardIcon,
  PeopleAlt,
  Message,
  Event,
  ReceiptLong,
  SwapHoriz,
  Settings,
  HelpOutline,
  NotificationsNone,
  Download,
  Add,
  Search,
  FilterList,
  MoreHoriz,
} from "@mui/icons-material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";

type StatCard = {
  label: string;
  value: string | number;
  delta: string;
};

type Appointment = {
  id: string;
  name: string;
  reason: string;
  whenLabel: string; // Today / Tomorrow
  time: string;
  avatarUrl?: string;
};

type Patient = {
  id: string;
  name: string;
  gender: "Male" | "Female";
  dob: string;
  ageLabel: string;
  department: string;
  patientId: string;
  avatarUrl?: string;
};

const chartData = [
  { month: "Jan", hospitalized: 100, outpatients: 110 },
  { month: "Feb", hospitalized: 120, outpatients: 125 },
  { month: "Mar", hospitalized: 130, outpatients: 98 },
  { month: "Apr", hospitalized: 140, outpatients: 120 },
  { month: "May", hospitalized: 170, outpatients: 145 },
  { month: "Jun", hospitalized: 150, outpatients: 160 },
];

const stats: StatCard[] = [
  { label: "Total Patients", value: 579, delta: "+15%" },
  { label: "Total Appointment", value: 54, delta: "+10%" },
  { label: "Total Income", value: "$8,399.24", delta: "+28%" },
  { label: "Total Treatments", value: 112, delta: "+12%" },
];

const appointments: Appointment[] = [
  { id: "a1", name: "Brooklyn Simmons", reason: "Allergy Testing", whenLabel: "Tomorrow", time: "10:30" },
  { id: "a2", name: "Courtney Henry", reason: "Routine Lab Tests", whenLabel: "Tomorrow", time: "10:00" },
  { id: "a3", name: "Sarah Miller Olivia", reason: "Chronic Disease Management", whenLabel: "Today", time: "15:00" },
  { id: "a4", name: "Esther Howard", reason: "Allergy Testing", whenLabel: "Today", time: "14:00" },
  { id: "a5", name: "Arlene McCoy", reason: "Routine Lab Tests", whenLabel: "Today", time: "11:30" },
  { id: "a6", name: "Jane Cooper", reason: "Acute Illness", whenLabel: "Today", time: "10:00" },
];

const patients: Patient[] = [
  {
    id: "p1",
    name: "Brooklyn Simmons",
    gender: "Male",
    dob: "1995-03-18",
    ageLabel: "29 years old",
    department: "Cardiology",
    patientId: "#OM123AA",
  },
  {
    id: "p2",
    name: "Anthony Johnson",
    gender: "Male",
    dob: "1997-03-18",
    ageLabel: "27 years old",
    department: "Cardiology",
    patientId: "#AT456BB",
  },
  {
    id: "p3",
    name: "Sarah Miller Olivia",
    gender: "Female",
    dob: "1987-03-18",
    ageLabel: "35 years old",
    department: "Oncology",
    patientId: "#EA789CC",
  },
];

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function StatCardItem({ item }: { item: StatCard }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
          {item.label}
        </Typography>
        <Chip
          size="small"
          label={item.delta}
          sx={(t) => ({
            fontWeight: 700,
            bgcolor: alpha(t.palette.success.main, 0.12),
            color: t.palette.success.main,
            borderRadius: 999,
          })}
        />
      </Stack>

      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.3 }}>
        {item.value}
      </Typography>

      <Box sx={{ mt: "auto" }}>
        <Button size="small" sx={{ px: 0, textTransform: "none" }}>
          See details →
        </Button>
      </Box>
    </Paper>
  );
}

function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      <Stack direction="row" alignItems="center" gap={1}>
        {right}
        <IconButton size="small">
          <MoreHoriz fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export default function DoctorDashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All status" | "Active" | "Inactive">("All status");

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const okSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q);
      // demo filter
      const okStatus = status === "All status" ? true : status === "Active";
      return okSearch && okStatus;
    });
  }, [search, status]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (t) => alpha(t.palette.grey[200], 0.6),
        p: isMobile ? 1 : 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1320,
          mx: "auto",
          display: "flex",
          gap: 2,
        }}
      >
        {/* ================= Sidebar ================= */}
        <Paper
          variant="outlined"
          sx={{
            width: 280,
            borderRadius: 4,
            overflow: "hidden",
            display: isMobile ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Stack direction="row" alignItems="center" gap={1.2}>
              <Box
                sx={(t) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  bgcolor: alpha(t.palette.success.main, 0.14),
                  display: "grid",
                  placeItems: "center",
                })}
              >
                <Box
                  sx={(t) => ({
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    bgcolor: t.palette.success.main,
                  })}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.3 }}>
                Medisight
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ p: 1.2 }}>
            <List disablePadding>
              {[
                { icon: <DashboardIcon />, label: "Dashboard", active: true },
                { icon: <PeopleAlt />, label: "Patients" },
                { icon: <Message />, label: "Message" },
                { icon: <Event />, label: "Appointments" },
                { icon: <ReceiptLong />, label: "Billing" },
                { icon: <SwapHoriz />, label: "Transactions" },
              ].map((it) => (
                <ListItemButton
                  key={it.label}
                  sx={(t) => ({
                    borderRadius: 3,
                    mb: 0.5,
                    bgcolor: it.active ? alpha(t.palette.primary.main, 0.08) : "transparent",
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
                  <ListItemText
                    primary={it.label}
                    primaryTypographyProps={{ fontWeight: it.active ? 900 : 700 }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>

          <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
              Tools
            </Typography>
          </Box>

          <Box sx={{ p: 1.2, pt: 0 }}>
            <List disablePadding>
              {[
                { icon: <Settings />, label: "Settings" },
                { icon: <HelpOutline />, label: "Chat & Support" },
                { icon: <HelpOutline />, label: "Help Center" },
              ].map((it) => (
                <ListItemButton key={it.label} sx={{ borderRadius: 3, mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
                  <ListItemText primary={it.label} primaryTypographyProps={{ fontWeight: 700 }} />
                </ListItemButton>
              ))}
            </List>
          </Box>

          <Box sx={{ mt: "auto", p: 1.5 }}>
            <Paper
              variant="outlined"
              sx={(t) => ({
                p: 1.5,
                borderRadius: 4,
                bgcolor: alpha(t.palette.success.main, 0.05),
              })}
            >
              <Stack direction="row" gap={1.2} alignItems="center">
                <Box
                  sx={(t) => ({
                    width: 40,
                    height: 40,
                    borderRadius: 3,
                    bgcolor: alpha(t.palette.success.main, 0.12),
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    color: t.palette.success.main,
                  })}
                >
                  👑
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Upgrade to premium</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Upgrade your account to premium to get more features
                  </Typography>
                </Box>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 1.2, borderRadius: 3, textTransform: "none", fontWeight: 900 }}
              >
                Upgrade plan
              </Button>
            </Paper>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Stack direction="row" gap={1.1} alignItems="center">
                <Avatar sx={{ width: 36, height: 36 }}>RF</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>Robert Fox</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    robertfox@mail.com
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small">
                <MoreHoriz fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* ================= Main ================= */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Top bar */}
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: isMobile ? 1.5 : 2,
              mb: 2,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 900 }}>
                  ☀️ Good Morning, Dr. Robert!
                </Typography>
              </Box>

              <Stack direction="row" alignItems="center" gap={1}>
                <IconButton>
                  <Badge color="error" variant="dot">
                    <NotificationsNone />
                  </Badge>
                </IconButton>
              </Stack>
            </Stack>
          </Paper>

          {/* Page header row */}
          <Stack
            direction={isMobile ? "column" : "row"}
            alignItems={isMobile ? "stretch" : "center"}
            justifyContent="space-between"
            gap={1.5}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Overview of all of your patients and your income
              </Typography>
            </Box>

            <Stack direction="row" gap={1} justifyContent={isMobile ? "flex-start" : "flex-end"}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: theme.palette.success.main,
                  "&:hover": { bgcolor: theme.palette.success.dark },
                }}
              >
                Create new
              </Button>
            </Stack>
          </Stack>

          {/* Stat cards */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {stats.map((s) => (
              <Grid key={s.label} item xs={12} sm={6} lg={3}>
                <StatCardItem item={s} />
              </Grid>
            ))}
          </Grid>

          {/* Overview + Appointment list */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} lg={8}>
              <Paper variant="outlined" sx={{ borderRadius: 4, p: 2, height: "100%" }}>
                <SectionHeader
                  title="Overview"
                  right={
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Stack direction="row" alignItems="center" gap={0.7}>
                        <Box
                          sx={(t) => ({
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            bgcolor: t.palette.success.main,
                          })}
                        />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                          Hospitalized patients
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" gap={0.7}>
                        <Box
                          sx={(t) => ({
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            bgcolor: alpha(t.palette.success.main, 0.35),
                          })}
                        />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                          Outpatients
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                />

                <Box sx={{ height: 280, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ReTooltip />
                      <Line
                        type="monotone"
                        dataKey="hospitalized"
                        stroke={theme.palette.success.main}
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="outpatients"
                        stroke={alpha(theme.palette.success.main, 0.35)}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper variant="outlined" sx={{ borderRadius: 4, p: 2, height: "100%" }}>
                <SectionHeader title="Appointment list" />
                <Stack gap={1.2} sx={{ mt: 1 }}>
                  {appointments.map((a) => (
                    <Box key={a.id}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                        <Stack direction="row" alignItems="center" gap={1.2} sx={{ minWidth: 0 }}>
                          <Avatar sx={{ width: 36, height: 36, fontWeight: 900 }}>
                            {initials(a.name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 900 }} noWrap>
                              {a.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                              {a.reason}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                            {a.whenLabel}
                          </Typography>
                          <Typography sx={{ fontWeight: 900 }}>{a.time}</Typography>
                        </Box>
                      </Stack>
                      <Divider sx={{ mt: 1.2 }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Patient list */}
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2 }}>
            <SectionHeader
              title="Patient list"
              right={
                <Stack direction="row" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
                  >
                    Filter
                  </Button>
                  <Select
                    size="small"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    sx={{ borderRadius: 3, fontWeight: 800, minWidth: 120 }}
                  >
                    <MenuItem value="All status">All status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </Stack>
              }
            />

            <Stack
              direction={isMobile ? "column" : "row"}
              alignItems={isMobile ? "stretch" : "center"}
              justifyContent="space-between"
              gap={1.5}
              sx={{ mb: 2 }}
            >
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                size="small"
                sx={{ maxWidth: isMobile ? "100%" : 340 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                Showing {filteredPatients.length} of {patients.length}
              </Typography>
            </Stack>

            {/* Table (simple, clean) */}
            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ minWidth: 860 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "36px 260px 120px 160px 140px 170px 140px",
                    gap: 1,
                    px: 1,
                    py: 1,
                    color: "text.secondary",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  <Box />
                  <Box>Name</Box>
                  <Box>Gender</Box>
                  <Box>Date of Birth</Box>
                  <Box>Age</Box>
                  <Box>Department</Box>
                  <Box>Patient ID</Box>
                </Box>

                <Divider />

                {filteredPatients.map((p) => (
                  <React.Fragment key={p.id}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "36px 260px 120px 160px 140px 170px 140px",
                        gap: 1,
                        px: 1,
                        py: 1.25,
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Box
                          sx={(t) => ({
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `1px solid ${alpha(t.palette.text.primary, 0.15)}`,
                          })}
                        />
                      </Box>

                      <Stack direction="row" alignItems="center" gap={1.2} sx={{ minWidth: 0 }}>
                        <Avatar sx={{ width: 34, height: 34, fontWeight: 900 }}>
                          {initials(p.name)}
                        </Avatar>
                        <Typography noWrap sx={{ fontWeight: 900 }}>
                          {p.name}
                        </Typography>
                      </Stack>

                      <Typography sx={{ fontWeight: 700 }}>{p.gender}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{p.dob}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{p.ageLabel}</Typography>

                      <Chip
                        size="small"
                        label={p.department}
                        sx={(t) => ({
                          width: "fit-content",
                          fontWeight: 900,
                          borderRadius: 999,
                          bgcolor: alpha(t.palette.primary.main, 0.08),
                        })}
                      />

                      <Typography sx={{ fontWeight: 900 }}>{p.patientId}</Typography>
                    </Box>
                    <Divider />
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
 alors je veux que tu adapte mes fichiers  a ce design textuellement:// ========================= src/pages/dashboard/UserDashboard.tsx =========================
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Button,
  useMediaQuery,
  Paper,
  Typography,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import api from "../../services/api";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";

import UserDashboardHeader from "./UserDashboardHeader";
import UserDashboardContent from "./UserDashboardContent";
import UserDashboardModals from "./UserDashboardModals";
import MobileNavigationMenu from "./MobileNavigationMenu";
import Footer from "../../components/sections/Footer";

// ✅ IMPORT: Composant UserProfile intégré directement
import UserProfile from "../profile/UserProfile";

type ActivityItem = {
  id: number;
  action?: string;
  activity_type?: string;
  details?: any;
  ip_address?: string;
  created_at?: string;
  icon?: string;
};

type Order = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address?: string;
};

type WalletType = {
  id: number;
  balance: number;
  account_number: string;
  phone_number: string;
  status: string;
  currency: string;
};

const toAbsoluteMediaUrl = (maybeUrl?: string | null): string | null => {
  const v = (maybeUrl || "").trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("blob:")) return v;

  const apiBase =
    (import.meta as any)?.env?.VITE_API_BASE_URL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    "http://localhost:8000/api/v1";

  const baseUrl = String(apiBase).replace(/\/+$/, "").replace("/api/v1", "");
  return `${baseUrl}${v.startsWith("/") ? "" : "/"}${v}`;
};

const getUserAvatarUrl = (u: any): string | null => {
  return (
    toAbsoluteMediaUrl(u?.photo_url) ||
    toAbsoluteMediaUrl(u?.photo) ||
    toAbsoluteMediaUrl(u?.profile_picture_url) ||
    toAbsoluteMediaUrl(u?.profile_picture) ||
    null
  );
};

export default function UserDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const auth = useSelector((state: RootState) => state.auth);
  const user = (auth as any)?.user;

  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(!isMobile);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // ✅ Mode édition profil
  const [isProfileEditMode, setIsProfileEditMode] = useState<boolean>(false);

  // ✅ Avatar local (mise à jour immédiate après upload depuis UserProfile)
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);

  // ✅ Snackbar pour notifications (conservé pour d'autres usages)
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // ✅ Avatar URL mémo : priorité à l'override après save, sinon user backend.
  const avatarUrl = useMemo(() => {
    return avatarOverride || getUserAvatarUrl(user);
  }, [user, avatarOverride]);

  const [wallet, setWallet] = useState<WalletType>({
    id: 1,
    balance: 1250.75,
    account_number: user?.phone || "250700000000",
    phone_number: user?.phone || "+257 61 234 567",
    status: "active",
    currency: "BIF",
  });

  useEffect(() => {
    setWallet((prev) => ({
      ...prev,
      account_number: user?.phone || prev.account_number,
      phone_number: user?.phone || prev.phone_number,
    }));
  }, [user?.phone]);

  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: "Nouvelle commande", message: "Commande #0012 confirmée", time: "2 min", read: false },
    { id: 2, title: "Paiement reçu", message: "Reçu de 50,000 BIF", time: "1h", read: true },
    { id: 3, title: "Livraison en cours", message: "Votre colis est en route", time: "3h", read: false },
  ]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const title = useMemo(() => {
    const name = user?.full_name || user?.username || "Collaborateur";
    return `${greeting}, ${String(name).split(" ")[0]}`;
  }, [user, greeting]);

  const handleGoProfile = () => {
    setActiveTab(4);
    setIsProfileEditMode(true);
  };

  // ✅ Quand on change d'onglet, si on quitte le profil => on désactive l'édition
  useEffect(() => {
    if (activeTab !== 4 && isProfileEditMode) {
      setIsProfileEditMode(false);
    }
  }, [activeTab, isProfileEditMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrollTop = contentRef.current.scrollTop;

      if (isMobile) {
        if (scrollTop > 50) {
          setIsHeaderExpanded(false);
          if (scrollTop > 200) setShowBackToTop(true);
        } else {
          setIsHeaderExpanded(true);
          setShowBackToTop(false);
        }
      } else {
        if (scrollTop > 100) {
          setIsHeaderExpanded(false);
          if (scrollTop > 300) setShowBackToTop(true);
        } else {
          setIsHeaderExpanded(true);
          setShowBackToTop(false);
        }
      }
    };

    const el = contentRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [isMobile]);

  useEffect(() => {
    setIsHeaderExpanded(!isMobile);
  }, [isMobile]);

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setLoading(!showRefresh);
      setError(null);

      const [activityRes, ordersRes] = await Promise.all([api.get("/me/activity/"), api.get("/orders/")]);

      setActivities(activityRes?.data?.results || activityRes?.data || []);
      setOrders(ordersRes?.data?.results || ordersRes?.data || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError("Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false);
  };

  // ✅ Callback déclenché quand UserProfile sauvegarde une nouvelle photo
  const handleAvatarUpdated = useCallback((newUrl: string | null) => {
    setAvatarOverride(newUrl ? toAbsoluteMediaUrl(newUrl) : null);
    
    // Afficher une notification de succès
    setSnackbar({
      open: true,
      message: "Photo de profil mise à jour avec succès !",
      severity: 'success'
    });
    
    // Recharger les données pour synchronisation
    loadData(true);
  }, []);

  // ✅ Toggle édition côté dashboard
  const toggleProfileEditMode = useCallback(() => {
    setIsProfileEditMode((prev) => !prev);
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" className="animate-fadeIn">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const isOnProfileTab = activeTab === 4;

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: alpha(theme.palette.primary.light, 0.02),
        position: "relative",
        mt: isMobile ? 8 : 12,
      }}
      className="animate-scaleIn"
    >
      <UserDashboardHeader
        title={title}
        user={{ 
          ...(user || {}), 
          avatarUrl,
          role: user?.role || "chauffeur",
          kyc_status: user?.kyc_status || "verified"
        }} // ✅ Photo dans le bloc "Bonjour" (affichage seulement)
        theme={theme}
        isMobile={isMobile}
        isHeaderExpanded={isHeaderExpanded}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
        notifications={notifications}
        onGoSettings={() => navigate("/settings")}
        onGoProfile={handleGoProfile}
        ordersCount={orders.length}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        // ✅ Pas de onUploadPhoto - la photo ne se modifie pas depuis le header
      />

      <Box
        ref={contentRef}
        sx={{
          height: "100vh",
          overflow: "auto",
          pt: isMobile ? (isHeaderExpanded ? "180px" : "120px") : (isHeaderExpanded ? "250px" : "200px"),
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          pb: isMobile ? 8 : 4,
          WebkitOverflowScrolling: "touch",
        }}
        className="mobile-optimized-scroll"
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 14,
              mb: 4,
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(244, 67, 54, 0.15)",
              border: "1px solid rgba(244, 67, 54, 0.2)",
              backgroundColor: "rgba(244, 67, 54, 0.05)",
              "& .MuiAlert-icon": { fontSize: 28 },
            }}
            onClose={() => setError(null)}
            className="animate-fadeInUp"
          >
            {error}
          </Alert>
        )}

        {/* ✅ Bloc de mode édition */}
        {isOnProfileTab && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: { xs: 2, md: 2.5 },
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              background: isProfileEditMode
                ? "linear-gradient(135deg, rgba(39,177,228,0.10) 0%, rgba(11,86,140,0.06) 100%)"
                : "linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)",
            }}
            className="animate-fadeIn"
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", md: "row" },
                marginTop: 12,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
                  {isProfileEditMode ? "Mode édition activé" : "Mode lecture"}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                  {isProfileEditMode
                    ? "Vous pouvez modifier vos informations et votre photo dans la section Profil. Un seul bouton 'Enregistrer' pour sauvegarder toutes vos modifications."
                    : "Activez l'édition pour mettre à jour votre profil et vos documents."}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                <Button
                  variant={isProfileEditMode ? "contained" : "outlined"}
                  onClick={toggleProfileEditMode}
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    fontWeight: 800,
                    textTransform: "none",
                    background: isProfileEditMode
                      ? "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)"
                      : undefined,
                  }}
                >
                  {isProfileEditMode ? "Désactiver l'édition" : "Activer l'édition"}
                </Button>

                <Button
                  variant="text"
                  onClick={() => {
                    setIsProfileEditMode(false);
                    setActiveTab(0);
                    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  sx={{ borderRadius: 999, px: 1.5, fontWeight: 800, textTransform: "none" }}
                >
                  Quitter le profil
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {activeTab === 4 ? (
          <UserProfile
            isInDashboard={true}
            externalEditMode={isProfileEditMode}
            onEditModeChange={setIsProfileEditMode}
            onRequestToggleEditMode={toggleProfileEditMode}
            onAvatarUpdated={handleAvatarUpdated}
          />
        ) : (
          <UserDashboardContent
            activeTab={activeTab}
            orders={orders}
            wallet={wallet}
            activities={activities}
            notifications={notifications}
            onOpenQr={() => setQrScannerOpen(true)}
            onOpenDelete={() => setDeleteDialogOpen(true)}
            onNavigate={(path) => navigate(path)}
            isMobile={isMobile}
          />
        )}

        <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Footer />
        </Box>
      </Box>

      <MobileNavigationMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={navigate}
        notificationsCount={notifications.filter((n) => !n.read).length}
      />

      {showBackToTop && (
        <Button
          variant="contained"
          size="small"
          onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: isMobile ? 80 : 24,
            right: isMobile ? 16 : 24,
            borderRadius: "50%",
            minWidth: "auto",
            width: isMobile ? 44 : 40,
            height: isMobile ? 44 : 40,
            background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
            boxShadow: "0 8px 24px rgba(11, 86, 140, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)",
              transform: "translateY(-2px)",
            },
            zIndex: 9998,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="animate-fadeIn"
        >
          ↑
        </Button>
      )}

      <UserDashboardModals
        qrScannerOpen={qrScannerOpen}
        onCloseQr={() => setQrScannerOpen(false)}
        deleteDialogOpen={deleteDialogOpen}
        onCloseDelete={() => setDeleteDialogOpen(false)}
        onConfirmDelete={() => handleDeleteAccount()}
      />

      {/* ✅ Snackbar pour notifications générales */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
} et // ========================= src/pages/dashboard/components/UserDashboardContent.tsx =========================
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Stack,
  Divider,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  ArrowForward,
  LocalShipping,
  AccountBalanceWallet,
  TrendingUp,
  Notifications,
  QrCodeScanner,
  Store,
  ContactSupport,
  ReceiptLong,
  Message,
  Payment,
  AccountBalance,
  AccessTime,
  Visibility,
  VisibilityOff,
  Add,
  Star,
} from "@mui/icons-material";

// ✅ CORRECTION : Import du composant UserProfile depuis le bon chemin
import UserProfile from "../profile/UserProfile";

type ActivityItem = {
  id: number;
  action?: string;
  activity_type?: string;
  details?: any;
  created_at?: string;
};

type Order = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address?: string;
};

type WalletType = {
  id: number;
  balance: number;
  account_number: string;
  phone_number: string;
  status: string;
  currency: string;
};

interface Props {
  activeTab: number;
  orders: Order[];
  wallet: WalletType;
  activities: ActivityItem[];
  notifications: any[];
  onOpenQr: () => void;
  onOpenDelete: () => void;
  onNavigate: (path: string) => void;
  isMobile?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  onClick,
  delay = 0,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
  delay?: number;
}) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        border: "1px solid rgba(11, 86, 140, 0.1)",
        overflow: "hidden",
        "&:hover": {
          transform: onClick ? "translateY(-8px)" : "none",
          boxShadow: onClick
            ? "0 20px 40px rgba(10, 52, 95, 0.15)"
            : "0 8px 32px rgba(10, 52, 95, 0.1)",
        },
      }}
      onClick={onClick}
      className="animate-fadeInUp"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <CardContent sx={{ p: 3, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60px",
            height: "60px",
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
            borderRadius: "0 0 0 100%",
          }}
        />
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: "0.7rem",
                display: "block",
                mb: 1,
                color: "#335F7A",
                background: alpha("#0B568C", 0.08),
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                width: "fit-content",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h2"
              sx={{
                mb: 0.5,
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "2.5rem" },
                background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "#487F9A",
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
              ml: 2,
            }}
            className="animate-bounce-soft"
          >
            <Box sx={{ color: "white", fontSize: { xs: 24, md: 28 } }}>{icon}</Box>
          </Box>
        </Box>

        {trend && trend !== "neutral" && (
          <Box display="flex" alignItems="center" sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: trend === "up" ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                mr: 1,
              }}
            >
              {trend === "up" ? <ArrowForward sx={{ fontSize: 16, color: "#4CAF50", transform: "rotate(-45deg)" }} /> : null}
            </Box>
            <Typography variant="caption" fontWeight={700} color={trend === "up" ? "#4CAF50" : "#F44336"}>
              {trend === "up" ? "+12%" : "-5%"} ce mois
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const WalletCard = ({ wallet, isMobile = false }: { wallet: WalletType; isMobile?: boolean }) => {
  const [showBalance, setShowBalance] = useState(true);
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
        color: "white",
        borderRadius: 3,
        boxShadow: "0 12px 40px rgba(11, 86, 140, 0.25)",
        position: "relative",
        overflow: "hidden",
        mb: 3,
      }}
      className="animate-scaleIn"
    >
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <CardContent sx={{ p: { xs: 2, md: 3 }, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                fontWeight: 500,
                display: "block",
                mb: 1,
                fontSize: { xs: "0.7rem", md: "0.75rem" },
              }}
            >
              SOLDE DISPONIBLE
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h3" fontWeight={900} fontSize={{ xs: "1.75rem", md: "2.25rem" }}>
                {showBalance ? `${wallet.balance.toFixed(2)} ${wallet.currency}` : "••••••"}
              </Typography>
              <IconButton size="small" onClick={() => setShowBalance(!showBalance)} sx={{ color: "white", opacity: 0.8, ml: 1 }}>
                {showBalance ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
          <AccountBalanceWallet sx={{ fontSize: { xs: 40, md: 48 }, opacity: 0.3 }} />
        </Box>

        <Divider sx={{ my: 2, opacity: 0.2, bgcolor: "white" }} />

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 2, mb: 2.5 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mb: 0.5, fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
              Numéro de compte
            </Typography>
            <Typography variant="body1" fontWeight={700} fontSize={{ xs: "0.9rem", md: "1rem" }}>
              {wallet.account_number}
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mb: 0.5, fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
              Téléphone
            </Typography>
            <Typography variant="body1" fontWeight={700} fontSize={{ xs: "0.9rem", md: "1rem" }}>
              {wallet.phone_number}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Payment />}
            size="medium"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              borderRadius: 2,
              flex: 1,
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
            className="animate-fadeInLeft"
          >
            Recharger
          </Button>
          <Button
            variant="contained"
            startIcon={<AccountBalance />}
            size="medium"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              borderRadius: 2,
              flex: 1,
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
            className="animate-fadeInRight"
          >
            Transférer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const ActivityIcon = ({ type }: { type?: string }) => {
  const iconStyle = { fontSize: 20 };
  switch (type?.toLowerCase()) {
    case "delivery":
      return <LocalShipping sx={iconStyle} />;
    case "collection":
      return null; // Removed Inventory import
    case "login":
      return null; // Removed Security import
    case "error":
      return null; // Removed ErrorIcon import
    case "payment":
      return <Payment sx={iconStyle} />;
    default:
      return null; // Removed History import
  }
};

const QuickActionCard = ({
  icon,
  title,
  subtitle,
  onClick,
  color = "#0B568C",
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  color?: string;
  delay?: number;
}) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      height: "100%",
      "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      },
    }}
    onClick={onClick}
    className="animate-scaleIn"
    style={{ animationDelay: `${delay * 100}ms` }}
  >
    <CardContent sx={{ p: 3, textAlign: "center" }}>
      <Box
        sx={{
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          borderRadius: 2,
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
        }}
        className="animate-bounce-soft"
      >
        <Box sx={{ color: "white", fontSize: { xs: 24, md: 28 } }}>{icon}</Box>
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 1, color: "#1A4F75", fontSize: { xs: "1rem", md: "1.125rem" } }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#487F9A", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

export default function UserDashboardContent({
  activeTab,
  orders,
  wallet,
  activities,
  notifications,
  onOpenQr,
  onOpenDelete,
  onNavigate,
  isMobile = false,
}: Props) {
  const theme = useTheme();

  return (
    <>
      {/* Tab 0: Tableau de bord */}
      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 6 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                marginTop: { xs: 4, md: 16 },
              }}
            >
              <Box
                sx={{
                  flex: "1 1 220px",
                  minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
                  maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 12px)" },
                }}
              >
                <StatCard title="Commandes" value={orders.length} icon={<LocalShipping />} color="#0B568C" subtitle="Ce mois" trend="up" delay={0} />
              </Box>

              <Box
                sx={{
                  flex: "1 1 220px",
                  minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
                  maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 12px)" },
                }}
              >
                <StatCard title="Activités" value={activities.length} icon={<TrendingUp />} color="#FF9800" subtitle="30 derniers jours" trend="up" delay={1} />
              </Box>

              <Box
                sx={{
                  flex: "1 1 220px",
                  minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
                  maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 12px)" },
                }}
              >
                <StatCard
                  title="Notifications"
                  value={notifications.filter((n) => !n.read).length}
                  icon={<Notifications />}
                  color="#9C27B0"
                  subtitle="Non lues"
                  trend="neutral"
                  delay={2}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: "#1A4F75", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
              Actions Rapides
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                gap: 3,
              }}
            >
              {[
                { icon: <LocalShipping />, title: "Nouvelle Commande", subtitle: "Créez une nouvelle commande", onClick: () => onNavigate("/new-order"), color: "#0B568C" },
                { icon: <QrCodeScanner />, title: "Scanner QR", subtitle: "Scanner un code QR", onClick: onOpenQr, color: "#27B1E4" },
                { icon: <Store />, title: "Points de Vente", subtitle: "Voir les points de vente", onClick: () => onNavigate("/points-of-sale"), color: "#FF9800" },
                { icon: <ContactSupport />, title: "Support", subtitle: "Contacter le support", onClick: () => onNavigate("/contact"), color: "#4CAF50" },
                { icon: <ReceiptLong />, title: "Documents", subtitle: "Mes documents", onClick: () => onNavigate("/documents"), color: "#9C27B0" },
                { icon: <Message />, title: "Messages", subtitle: "Voir mes messages", onClick: () => onNavigate("/messages"), color: "#F44336" },
              ].map((action, index) => (
                <QuickActionCard
                  key={index}
                  icon={action.icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  onClick={action.onClick}
                  color={action.color}
                  delay={index}
                />
              ))}
            </Box>
          </Box>

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
              border: "1px solid rgba(11, 86, 140, 0.1)",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
              overflow: "hidden",
            }}
            className="animate-fadeInUp"
          >
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
                background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: { xs: "1.25rem", md: "1.5rem" }, mb: 1 }}>
                    Activités Récentes
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#335F7A", fontWeight: 400, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                    Historique de vos dernières actions
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => onNavigate("/activity")}
                  sx={{
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderWidth: 2,
                    borderColor: "#0B568C",
                    color: "#0B568C",
                    px: 3,
                    py: 1,
                    fontSize: { xs: "0.8rem", md: "0.875rem" },
                    "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                  }}
                >
                  Voir tout
                </Button>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <List>
                {activities.slice(0, 5).map((activity, index) => (
                  <ListItem
                    key={activity.id}
                    sx={{
                      px: 0,
                      py: 2,
                      borderBottom: "1px solid rgba(11, 86, 140, 0.05)",
                      "&:last-child": { borderBottom: "none" },
                    }}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: { xs: 40, md: 48 },
                          height: { xs: 40, md: 48 },
                          bgcolor: "white",
                          color: "#0B568C",
                          border: "2px solid rgba(11, 86, 140, 0.1)",
                        }}
                      >
                        <ActivityIcon type={activity.activity_type} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A4F75", fontSize: { xs: "0.9rem", md: "1rem" } }}>
                          {activity.action || activity.activity_type}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ color: "#487F9A", mb: 0.5, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            {activity.details ? JSON.stringify(activity.details) : "Pas de détails"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#335F7A", fontWeight: 600, fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
                            {activity.created_at && new Date(activity.created_at).toLocaleString("fr-FR")}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Card>
        </>
      )}

      {/* Tab 1: Portefeuille */}
      {activeTab === 1 && (
        <Box sx={{ marginTop: { xs: 4, md: 16 } }}>
          <WalletCard wallet={wallet} isMobile={isMobile} />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, mt: 4 }}>
            <Card
              sx={{
                flex: 1,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                border: "1px solid rgba(11, 86, 140, 0.1)",
                background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
              }}
              className="animate-fadeInLeft"
            >
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
                }}
              >
                <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                  Transactions Récentes
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <List>
                  {[
                    { id: 1, type: "Recharge", amount: 100000, date: "15/03/2024", status: "success" },
                    { id: 2, type: "Paiement", amount: -25000, date: "14/03/2024", status: "success" },
                    { id: 3, type: "Transfert", amount: -50000, date: "13/03/2024", status: "pending" },
                  ].map((tx, index) => (
                    <ListItem
                      key={tx.id}
                      sx={{
                        px: 0,
                        py: 2,
                        borderBottom: "1px solid rgba(11, 86, 140, 0.05)",
                        "&:last-child": { borderBottom: "none" },
                      }}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: { xs: 40, md: 48 },
                            height: { xs: 40, md: 48 },
                            bgcolor: tx.amount > 0 ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                            color: tx.amount > 0 ? "#4CAF50" : "#F44336",
                          }}
                        >
                          {tx.amount > 0 ? "+" : "-"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A4F75", fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            {tx.type}
                          </Typography>
                        }
                        secondary={<Typography variant="body2" sx={{ color: "#487F9A", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>{tx.date}</Typography>}
                      />
                      <Typography variant="h6" fontWeight={800} color={tx.amount > 0 ? "success.main" : "error.main"} fontSize={{ xs: "0.9rem", md: "1rem" }}>
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()} {wallet.currency}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Card>

            <Box sx={{ width: { xs: "100%", md: "35%" } }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  mb: 3,
                }}
                className="animate-fadeInRight"
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
                    background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
                  }}
                >
                  <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                    Actions
                  </Typography>
                </Box>
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<Payment />}
                      fullWidth
                      sx={{
                        py: { xs: 1.25, md: 2 },
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                        "&:hover": { background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)" },
                      }}
                    >
                      Recharger le portefeuille
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AccountBalance />}
                      fullWidth
                      sx={{
                        py: { xs: 1.25, md: 2 },
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#0B568C",
                        color: "#0B568C",
                        "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                      }}
                    >
                      Transférer de l'argent
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowForward />}
                      fullWidth
                      sx={{
                        py: { xs: 1.25, md: 2 },
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#487F9A",
                        color: "#487F9A",
                        "&:hover": { borderWidth: 2, borderColor: "#335F7A", backgroundColor: alpha("#487F9A", 0.05) },
                      }}
                    >
                      Exporter l'historique
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      {/* Tab 2: Commandes */}
      {activeTab === 2 && (
        <Box sx={{ marginTop: { xs: 4, md: 16 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 3,
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: "#1A4F75", mb: 1, fontSize: { xs: "1.5rem", md: "2rem" } }}>
                Mes Commandes
              </Typography>
              <Typography variant="body1" sx={{ color: "#487F9A", fontSize: { xs: "0.9rem", md: "1rem" } }}>
                Suivez l'état de vos commandes en cours et passées
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => onNavigate("/new-order")}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 },
                background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                boxShadow: "0 8px 24px rgba(11, 86, 140, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)",
                  boxShadow: "0 12px 32px rgba(10, 52, 95, 0.6)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                fontSize: { xs: "0.8rem", md: "0.875rem" },
              }}
              className="animate-bounce-soft"
            >
              Nouvelle commande
            </Button>
          </Box>

          <Box sx={{ display: "grid", gap: 3 }}>
            {orders.map((order, index) => (
              <Card
                key={order.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 12px 40px rgba(10, 52, 95, 0.15)" },
                }}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "flex-start", md: "center" },
                      justifyContent: "space-between",
                      gap: 3,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ color: "#1A4F75", mb: 1, fontSize: { xs: "1rem", md: "1.125rem" } }}>
                        Commande #{order.order_number}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#487F9A", mb: 1, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                        {order.delivery_address || "Adresse non spécifiée"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#335F7A", display: "block", fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
                        {new Date(order.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: { xs: "flex-start", md: "flex-end" },
                        gap: 2,
                        width: { xs: "100%", md: "auto" },
                      }}
                    >
                      <Chip
                        label={order.status}
                        size="medium"
                        sx={{
                          fontWeight: 800,
                          borderRadius: 2,
                          fontSize: { xs: "0.7rem", md: "0.75rem" },
                          backgroundColor:
                            order.status === "delivered"
                              ? alpha("#4CAF50", 0.1)
                              : order.status === "pending"
                              ? alpha("#FF9800", 0.1)
                              : order.status === "cancelled"
                              ? alpha("#F44336", 0.1)
                              : alpha("#0B568C", 0.1),
                          color:
                            order.status === "delivered"
                              ? "#4CAF50"
                              : order.status === "pending"
                              ? "#FF9800"
                              : order.status === "cancelled"
                              ? "#F44336"
                              : "#0B568C",
                        }}
                      />

                      <Typography variant="h5" fontWeight={900} sx={{ color: "#1A4F75", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                        {order.total_amount.toLocaleString()} {wallet.currency}
                      </Typography>

                      <Button
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        onClick={() => onNavigate(`/orders/${order.id}`)}
                        sx={{
                          borderRadius: "50px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderWidth: 2,
                          borderColor: "#0B568C",
                          color: "#0B568C",
                          px: 3,
                          py: 1,
                          fontSize: { xs: "0.8rem", md: "0.875rem" },
                          "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                        }}
                      >
                        Voir détails
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Tab 3: Points de vente */}
      {activeTab === 3 && (
        <Box sx={{ marginTop: { xs: 4, md: 10 } }}>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#1A4F75", mb: 4, fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Points de Vente
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: { xs: 3, md: 4 },
            }}
          >
            {[
              { id: 1, name: "Supermarché Buja", address: "Bujumbura Mairie", status: "ouvert", rating: 4.5 },
              { id: 2, name: "Magasin Gitega", address: "Gitega Centre", status: "ouvert", rating: 4.2 },
              { id: 3, name: "Boutique Ngozi", address: "Ngozi Ville", status: "fermé", rating: 4.0 },
              { id: 4, name: "Epicerie Kayanza", address: "Kayanza Centre", status: "ouvert", rating: 4.3 },
              { id: 5, name: "Boutique Muyinga", address: "Muyinga Ville", status: "ouvert", rating: 4.1 },
              { id: 6, name: "Superette Rumonge", address: "Rumonge Port", status: "fermé", rating: 3.9 },
            ].map((pdv, index) => (
              <Card
                key={pdv.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(10, 52, 95, 0.15)" },
                }}
                onClick={() => onNavigate(`/points-of-sale/${pdv.id}`)}
                className="animate-scaleIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: { xs: 50, md: 60 },
                        height: { xs: 50, md: 60 },
                        bgcolor: "white",
                        color: "#0B568C",
                        border: "2px solid rgba(11, 86, 140, 0.1)",
                        boxShadow: "0 4px 12px rgba(11, 86, 140, 0.1)",
                      }}
                    >
                      <Store sx={{ fontSize: { xs: 24, md: 28 } }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ color: "#1A4F75", fontSize: { xs: "1rem", md: "1.125rem" } }}>
                        {pdv.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#487F9A", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                        {pdv.address}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Chip
                      label={pdv.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        fontSize: { xs: "0.7rem", md: "0.75rem" },
                        backgroundColor: pdv.status === "ouvert" ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                        color: pdv.status === "ouvert" ? "#4CAF50" : "#F44336",
                      }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Star sx={{ fontSize: { xs: 14, md: 16 }, color: "#FF9800" }} />
                      <Typography variant="body2" fontWeight={700} sx={{ color: "#1A4F75", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                        {pdv.rating}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    sx={{
                      mt: 2,
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderWidth: 2,
                      borderColor: "#0B568C",
                      color: "#0B568C",
                      py: { xs: 0.75, md: 1 },
                      fontSize: { xs: "0.8rem", md: "0.875rem" },
                      "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                    }}
                  >
                    Voir détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Tab 4: Profil - Affiche le composant UserProfile avec prop isInDashboard */}
      {activeTab === 4 && (
        <Box
          sx={{
            marginTop: { xs: 4, md: 0 },
            width: "100%",
          }}
        >
          {/* ✅ CORRECTION : Utilisation de UserProfile au lieu de UserProfileView */}
          <UserProfile isInDashboard={true} />
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: `1px dashed ${alpha("#487F9A", 0.3)}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
        className="animate-fadeIn"
      >
        <Typography
          variant="caption"
          sx={{
            color: "#487F9A",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: { xs: "0.7rem", md: "0.75rem" },
          }}
        >
          <AccessTime sx={{ fontSize: { xs: 12, md: 14 } }} />
          Système sécurisé • Données actualisées en temps réel
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#487F9A",
            fontSize: { xs: "0.7rem", md: "0.75rem" },
          }}
        >
          © {new Date().getFullYear()} SeaSky • support@seasky.com
        </Typography>
      </Box>
    </>
  );
} et // ========================= src/pages/dashboard/components/UserDashboardHeader.tsx =========================
import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Badge,
  Tabs,
  Tab,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Notifications,
  Refresh,
  AccessTime,
  Dashboard as DashboardIcon,
  AccountBalanceWallet,
  LocalShipping,
  Store,
  Person,
  Settings,
  Edit,
  Speed,
  TrendingUp,
  Star,
  Menu as MenuIcon,
} from "@mui/icons-material";

type HeaderProps = {
  title: string;
  user: any;
  theme: any;
  isMobile?: boolean;
  isHeaderExpanded: boolean;

  activeTab: number;
  setActiveTab: (v: number) => void;

  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;

  notifications: any[];
  ordersCount: number;

  onGoSettings: () => void;
  onGoProfile: () => void;
  onOpenMobileMenu?: () => void;
};

function getInitials(name?: string) {
  const n = String(name || "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[1]?.[0] : "";
  return (a + b).toUpperCase();
}

function toStr(v: any, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function toAbsoluteMediaUrl(maybeUrl?: string | null): string | undefined {
  const v = (maybeUrl || "").trim();
  if (!v) return undefined;
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("blob:")) return v;

  const apiBase =
    (import.meta as any)?.env?.VITE_API_BASE_URL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    "http://localhost:8000/api/v1";

  const baseUrl = String(apiBase).replace(/\/+$/, "").replace("/api/v1", "");
  return `${baseUrl}${v.startsWith("/") ? "" : "/"}${v}`;
}

function pickProfilePhotoUrl(u: any): string | undefined {
  const raw =
    toStr(u?.avatarUrl) ||
    toStr(u?.photo_url) ||
    toStr(u?.photo) ||
    toStr(u?.profile_picture_url) ||
    toStr(u?.profile_picture) ||
    toStr(u?.profile_photo_url) ||
    toStr(u?.avatar_url) ||
    toStr(u?.image_url) ||
    "";

  return raw ? toAbsoluteMediaUrl(raw) : undefined;
}

export default function UserDashboardHeader({
  title,
  user,
  theme,
  isMobile = false,
  isHeaderExpanded,
  activeTab,
  setActiveTab,
  lastUpdated,
  refreshing,
  onRefresh,
  notifications,
  ordersCount,
  onGoSettings,
  onGoProfile,
  onOpenMobileMenu,
}: HeaderProps) {
  const avatarSrc = useMemo(() => pickProfilePhotoUrl(user), [user]);
  const displayName = useMemo(() => user?.full_name || user?.username || "Utilisateur", [user]);
  const unreadCount = useMemo(() => (notifications || []).filter((n) => !n?.read).length, [notifications]);

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        zIndex: 40,
        backdropFilter: "blur(10px)",
        background: alpha("#FFFFFF", 0.92),
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
      className="animate-fadeInDown"
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.5, sm: 2.5 },
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            mb: 1.5,
            transition: "all 0.3s ease",
            transform: isHeaderExpanded ? "none" : isMobile ? "scale(0.95)" : "scale(0.97)",
            opacity: isHeaderExpanded ? 1 : isMobile ? 0.85 : 0.9,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* ✅ Title Zone avec Avatar dans le bloc "Bonjour" */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {isMobile && onOpenMobileMenu && (
                <IconButton
                  onClick={onOpenMobileMenu}
                  sx={{
                    mr: 1,
                    color: theme.palette.primary.main,
                  }}
                  className="animate-fadeInLeft"
                >
                  <MenuIcon />
                </IconButton>
              )}

              {/* ✅ Avatar positionné à gauche du titre "Bonjour" - AFFICHAGE SEULEMENT */}
              <Tooltip title="Voir mon profil">
                <Avatar
                  src={avatarSrc}
                  onClick={onGoProfile}
                  sx={{
                    width: isHeaderExpanded ? (isMobile ? 44 : 52) : isMobile ? 36 : 44,
                    height: isHeaderExpanded ? (isMobile ? 44 : 52) : isMobile ? 36 : 44,
                    borderRadius: "999px",
                    cursor: "pointer",
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 14px 32px rgba(0,0,0,0.18)",
                    },
                  }}
                >
                  {getInitials(displayName)}
                </Avatar>
              </Tooltip>

              {/* ✅ Titre et sous-titre */}
              <Box className={isHeaderExpanded ? "animate-fadeInUp" : ""}>
                <Typography
                  variant={isHeaderExpanded ? (isMobile ? "h5" : "h4") : isMobile ? "h6" : "h5"}
                  fontWeight={800}
                  sx={{
                    color: theme.palette.primary.dark,
                    mb: isHeaderExpanded ? (isMobile ? 0.25 : 0.5) : isMobile ? 0 : 0.25,
                    transition: "all 0.3s ease",
                    fontSize: isMobile ? (isHeaderExpanded ? "1.25rem" : "1.1rem") : undefined,
                  }}
                >
                  {isMobile ? title.split(",")[0] : title}
                </Typography>

                {(!isMobile || isHeaderExpanded) && (
                  <Typography
                    variant={isHeaderExpanded ? (isMobile ? "body2" : "body1") : "body2"}
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: isHeaderExpanded ? 500 : 400,
                      transition: "all 0.3s ease",
                      fontSize: isMobile ? "0.8rem" : undefined,
                    }}
                  >
                    Gérez votre compte, vos commandes et vos finances
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* ✅ Right Actions */}
            <Box display="flex" gap={1.5} flexWrap="wrap" className="animate-fadeInRight">
              {!isMobile && (
                <Tooltip title="Notifications">
                  <IconButton>
                    <Badge badgeContent={unreadCount} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {!isMobile && (
                <Tooltip title="Paramètres">
                  <IconButton onClick={onGoSettings}>
                    <Settings />
                  </IconButton>
                </Tooltip>
              )}

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onRefresh}
                disabled={refreshing}
                sx={{
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: "#0B568C",
                  color: "#0B568C",
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 0.75 : 1,
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "#0A345F",
                    backgroundColor: alpha("#0B568C", 0.05),
                  },
                }}
                className={refreshing ? "animate-rotate" : ""}
              >
                {refreshing ? "..." : isMobile ? "Rafraîchir" : "Actualiser"}
              </Button>
            </Box>
          </Box>

          {/* ✅ Summary card avec Avatar + Name (Bloc "Kismart John") */}
          {isHeaderExpanded && (!isMobile || activeTab === 0) && (
            <Paper
              sx={{
                p: isMobile ? 1.5 : 2,
                mt: isMobile ? 1 : 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                display: isMobile && activeTab !== 0 ? "none" : "block",
              }}
              className="animate-fadeInUp"
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {/* ✅ Avatar dans le bloc summary - AFFICHAGE SEULEMENT */}
                  <Avatar
                    sx={{
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      animation: isMobile ? "bounce-soft 2s ease-in-out infinite" : "none",
                      cursor: "pointer",
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    }}
                    src={avatarSrc}
                    onClick={onGoProfile}
                  >
                    {getInitials(displayName)}
                  </Avatar>

                  <Box>
                    <Typography variant={isMobile ? "body1" : "subtitle1"} fontWeight={700}>
                      {displayName}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                      <Chip
                        label={user?.role || "Utilisateur"}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                      />
                      <Chip
                        label={user?.kyc_status === "verified" ? "KYC Vérifié" : "KYC En attente"}
                        size="small"
                        color={user?.kyc_status === "verified" ? "success" : "default"}
                        variant="outlined"
                        sx={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                      />
                      {lastUpdated && !isMobile && (
                        <Chip
                          icon={<AccessTime fontSize="small" />}
                          label={`Maj: ${lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {!isMobile && (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={onGoProfile}
                    sx={{
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                      boxShadow: "0 8px 24px rgba(11, 86, 140, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)",
                        boxShadow: "0 12px 32px rgba(10, 52, 95, 0.4)",
                      },
                    }}
                    className="animate-bounce-soft"
                  >
                    Mon Profil
                  </Button>
                )}
              </Box>
            </Paper>
          )}

          {/* ✅ Tabs */}
          <Box sx={{ mt: 2 }} className="animate-fadeIn">
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                "& .MuiTabs-scrollButtons": { width: 32, color: theme.palette.primary.main },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  minHeight: 48,
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  minWidth: isMobile ? 100 : 120,
                  transition: "all 0.2s",
                  "&.Mui-selected": { transform: "translateY(-2px)" },
                },
              }}
            >
              <Tab
                icon={isMobile ? <DashboardIcon /> : undefined}
                label={isMobile ? "Tableau" : "Tableau de bord"}
                className={activeTab === 0 ? "animate-bounce-soft" : ""}
              />
              <Tab icon={isMobile ? <AccountBalanceWallet /> : undefined} label={isMobile ? "Portefeuille" : "Portefeuille"} />
              <Tab icon={isMobile ? <LocalShipping /> : undefined} label={isMobile ? "Commandes" : "Commandes"} />
              <Tab icon={isMobile ? <Store /> : undefined} label={isMobile ? "Points" : "Points de vente"} />
              <Tab icon={isMobile ? <Person /> : undefined} label="Profil" />
            </Tabs>
          </Box>

          {/* ✅ Extra chips */}
          {isHeaderExpanded && !isMobile && (
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5, mt: 2 }} className="animate-fadeInUp">
              <Chip
                icon={<Speed sx={{ fontSize: 16 }} />}
                label="Vue d'ensemble"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.dark,
                  fontWeight: 600,
                  px: 1.5,
                  py: 1,
                }}
              />
              <Chip
                icon={<TrendingUp sx={{ fontSize: 16 }} />}
                label="Performance"
                sx={{
                  backgroundColor: alpha(theme.palette.success.main, 0.08),
                  color: theme.palette.success.dark,
                  fontWeight: 600,
                  px: 1.5,
                  py: 1,
                }}
              />
              <Chip
                icon={<Star sx={{ fontSize: 16 }} />}
                label={`${ordersCount} commandes`}
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.08),
                  color: theme.palette.warning.dark,
                  fontWeight: 600,
                  px: 1.5,
                  py: 1,
                }}
              />
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
} et // ========================= src/pages/profile/UserProfile.tsx =========================
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Cropper from "react-easy-crop";

import { RootState, updateProfile } from "../../store/store";
import { getCurrentUser, updateUserProfile, type UserProfile as ApiUserProfile } from "../../api/client";

import AlertBanner from "../../components/ui/AlertBanner";
import Navigation from "../../components/layout/Navigation";

// Forms
import RegisterPersonalInfoForm from "../../components/auth/RegisterPersonalInfoForm";
import RegisterAddressForm from "../../components/auth/RegisterAddressForm";
import RegisterIdentityVerificationForm from "../../components/auth/RegisterIdentityVerificationForm";
import RegisterBusinessDocuments from "../../components/auth/RegisterBusinessDocuments";
import RegisterDeliveryInfo from "../../components/auth/RegisterDeliveryInfo";
import RegisterBoutiqueInfoForm from "../../components/auth/RegisterBoutiqueInfoForm";

// Types
import {
  ExtendedUserRegistrationData,
  FormValidationErrors,
  InputChangeHandler,
  FileChangeHandler,
  ArrayChangeHandler,
  CheckboxChangeHandler,
  RegistrationStepProps,
} from "../../pages/types/auth.types";

// ✅ Importer depuis userProfileParts.tsx
import {
  PersonalInfoDisplay,
  AddressDisplay,
  IdentityDisplay,
  BoutiqueDisplay,
  DeliveryDisplay,
  BusinessDisplay,
  StatusBadge,
  VerifiedBadge,
} from "./userProfileParts";

// ✅ Import des styles d'animation du Dashboard
import "../../styles/animations.css";

// Constantes KYC
const KYC_WINDOW_MS = 72 * 60 * 60 * 1000; // 72h

// ✅ Couleurs projet (palette de votre application)
const BRAND = {
  primary: "#0B568C",
  primaryDark: "#1A4F75",
  accent: "#27B1E4",
  accentLight: "#4FC3F7",
  secondary: "#335F7A",
  text: "#1A202C",
  muted: "#718096",
  light: "#F7FAFC",
  panel: "rgba(255, 255, 255, 0.95)",
  border: "rgba(226, 232, 240, 0.8)",
  success: "#38A169",
  warning: "#D69E2E",
  error: "#E53E3E",
  info: "#3182CE",
  bgA: "rgba(11, 86, 140, 0.04)",
  bgB: "rgba(39, 177, 228, 0.04)",
  ring: "rgba(39, 177, 228, 0.35)",
};

interface UserDocumentItem {
  id: number;
  document_type: string;
  file: string;
  file_name?: string;
  description?: string;
  uploaded_at?: string;
  verified?: boolean;
  expiry_date?: string | null;
  file_type?: "image" | "pdf" | "other";
  file_url?: string;
  category?: "kyc" | "kyb";
}

type UserData = ApiUserProfile & {
  documents?: UserDocumentItem[];
  account_type?: string;
  role?: string;
  kyc_status?: string;
  account_status?: string;
  account_type_label?: string;
  account_category?: string | null;
  account_category_label?: string | null;

  // ⚠️ IMPORTANT: une seule source pour la photo de profil : "photo"
  // On garde les autres champs en lecture seulement pour compat backend éventuel,
  // mais on NE les utilise pas pour afficher/mettre à jour si "photo" existe.
  photo_url?: string;
  photo?: string;

  avatar_url?: string; // legacy
  created_at?: string;
  date_joined?: string;

  client_type?: string;
  supplier_type?: string;
  merchant_type?: string;
  delivery_type?: string;
  boutique_type?: string;

  bookings_count?: number;
  orders_count?: number;
  invoices_count?: number;
  giftcards_count?: number;
  reviews_count?: number;
  rating?: number;

  [key: string]: any;
};

type DocsModalTabType = "kyc" | "kyb" | "all";

// ------------------------- Utils -------------------------
function toStr(v: any, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function toBool(v: any, fallback = false): boolean {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return Boolean(v);
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(s)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(s)) return false;
  }
  return fallback;
}

function toArr(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === "") return [];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [v];
    }
  }
  return [v];
}

function safeDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function pickAccountCreatedAt(u: any): Date | null {
  return safeDate(u?.created_at) || safeDate(u?.date_joined) || null;
}

/**
 * ✅ UNE SEULE PHOTO DE PROFIL
 * Priorité stricte:
 * 1) photo_url (si backend renvoie déjà l'URL absolue)
 * 2) photo (chemin media relatif ou absolu)
 * 3) (compat) profile_picture_url / avatar_url / etc. seulement si photo absent
 */
function pickProfilePhotoUrl(u: any): string {
  const direct = toStr(u?.photo_url) || toStr(u?.photo);
  if (direct) return direct;

  // fallback legacy (si ton backend ancien)
  return (
    toStr(u?.profile_photo_url) ||
    toStr(u?.profile_picture_url) ||
    toStr(u?.profile_picture) ||
    toStr(u?.avatar_url) ||
    toStr(u?.image_url) ||
    ""
  );
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / (3600 * 24));
  const hours = Math.floor((total % (3600 * 24)) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}j ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatDateOnly(v?: string) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString();
}

function getFileType(filename: string): "image" | "pdf" | "other" {
  if (!filename) return "other";
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) return "image";
  return "other";
}

function getAbsoluteFileUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://") || fileUrl.startsWith("blob:")) return fileUrl;

  const apiBase =
    (import.meta as any)?.env?.VITE_API_BASE_URL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    "http://localhost:8000/api/v1";

  const baseUrl = String(apiBase).replace(/\/+$/, "").replace("/api/v1", "");
  return `${baseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

function getInitials(name?: string) {
  const n = String(name || "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[1]?.[0] : "";
  return (a + b).toUpperCase();
}

// ------------------------- Crop helpers -------------------------
type Area = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Crop failed"));
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

function blobToFile(blob: Blob, filename: string) {
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

// ========================= Composant principal =========================
export default function UserProfile({
  isInDashboard = false,
  onEditModeChange,
  externalEditMode, // ✅ contrôlé par UserDashboard (source de vérité)
  onAvatarUpdated, // ✅ callback pour mettre à jour l'avatar instantanément dans le dashboard
  onRequestToggleEditMode, // ✅ demandé au parent quand le profil veut changer l'état
}: {
  isInDashboard?: boolean;
  onEditModeChange?: (editMode: boolean) => void;
  externalEditMode?: boolean;
  onAvatarUpdated?: (url: string | null) => void;
  onRequestToggleEditMode?: () => void;
}) {
  type ProfileSection =
    | "personal"
    | "address"
    | "identity"
    | "boutique"
    | "delivery"
    | "business"
    | "documents"
    | "activity";

  const [activeSection, setActiveSection] = useState<ProfileSection>("personal");
  const [activeTab, setActiveTab] = useState<string>("personal");

  const [formData, setFormData] = useState<ExtendedUserRegistrationData>({
    account_type: "client",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    password2: "",
    full_name: "",
    phone: "",
    role: "",
    nationality: "",
    gender: "" as any,
    date_of_birth: "",
    accepted_terms: true,
    address_line: "",
    province: "",
    commune: "",
    colline_or_quartier: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    id_type: "" as any,
    id_number: "",
    id_issue_date: "",
    id_expiry_date: "",
    id_no_expiry: false,
    boutique_type: "" as any,
    boutique_services: [],
    delivery_vehicle: "" as any,
    vehicle_registration: "",
    preferred_delivery_time: "",
    delivery_instructions: "",
    business_name: "",
    business_entity_type: "" as any,
    business_registration_number: "",
    business_tax_id: "",
    business_doc_expiry_date: "",
    lumicash_msisdn: "",
    accepted_contract: false,
    client_type: "" as any,
    supplier_type: "" as any,
    merchant_type: "" as any,
    delivery_type: "" as any,
    id_front_image: null,
    id_back_image: null,
    passport_photo: null,
    business_document: null,
    photo: null, // ✅ UNIQUE: photo de profil
    signature: null,
  } as ExtendedUserRegistrationData);

  const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ✅ Preview locale (blob) uniquement; si vide => URL serveur
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const [userDocuments, setUserDocuments] = useState<UserDocumentItem[]>([]);

  // ✅ Modals
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsModalTab, setDocsModalTab] = useState<DocsModalTabType>("kyc");
  const [isSavingDocs, setIsSavingDocs] = useState(false);

  // ✅ Crop modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rawPhotoName, setRawPhotoName] = useState<string>("profile.jpg");

  // ✅ Notes/Activité
  const [noteText, setNoteText] = useState<string>("");
  const [pinnedNote, setPinnedNote] = useState<string>(
    "Note importante : Veuillez compléter votre profil KYC dans les 72 heures suivant votre inscription pour débloquer toutes les fonctionnalités."
  );

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ------------------------- EDIT MODE (source unique) -------------------------
  // ✅ local fallback si pas contrôlé par le parent
  const [internalEditMode, setInternalEditMode] = useState<boolean>(false);

  // ✅ mode effectif = parent si fourni, sinon interne
  const editModeEffective = typeof externalEditMode === "boolean" ? externalEditMode : internalEditMode;

  // ✅ Suivi des modifications pour activer le bouton Enregistrer
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // ✅ Initial data pour comparer les modifications
  const [initialData, setInitialData] = useState<ExtendedUserRegistrationData | null>(null);

  // ✅ Notifier le parent lorsque le mode effectif change
  useEffect(() => {
    onEditModeChange?.(editModeEffective);
  }, [editModeEffective, onEditModeChange]);

  // ✅ si navigation state utilisé ailleurs
  useEffect(() => {
    const state = location.state as { editMode?: boolean } | null;
    if (state?.editMode) {
      if (typeof externalEditMode === "boolean") onRequestToggleEditMode?.();
      else setInternalEditMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayUser = useMemo(() => {
    return {
      ...(user || {}),
      ...(formData || {}),
      full_name: (formData as any)?.full_name || (user as any)?.full_name || "",
      email: (formData as any)?.email || (user as any)?.email || "",
      phone: (formData as any)?.phone || (user as any)?.phone || "",
      account_type: (formData as any)?.account_type || (user as any)?.account_type || "",
      account_type_label: (formData as any)?.account_type_label || (user as any)?.account_type_label || "",
      account_category_label: (formData as any)?.account_category_label || (user as any)?.account_category_label || "",
      kyc_status: (formData as any)?.kyc_status || (user as any)?.kyc_status || "",
      rating: (user as any)?.rating ?? (formData as any)?.rating ?? 4.8,
      reviews_count: (user as any)?.reviews_count ?? (formData as any)?.reviews_count ?? 12,
    } as any;
  }, [user, formData]);

  // ✅ URL serveur de la photo (unique)
  const serverPhotoUrl = useMemo(() => {
    const raw = pickProfilePhotoUrl(displayUser);
    return raw ? getAbsoluteFileUrl(raw) : "";
  }, [displayUser]);

  // ✅ Avatar final affiché (preview blob si présent, sinon serveur)
  const effectivePhotoUrl = useMemo(() => {
    return profilePhotoPreview || serverPhotoUrl || "";
  }, [profilePhotoPreview, serverPhotoUrl]);

  // ✅ Vérifier s'il y a des modifications non sauvegardées
  useEffect(() => {
    if (!editModeEffective || !initialData) {
      setHasUnsavedChanges(false);
      return;
    }

    // Vérifier les modifications dans les champs de formulaire
    const fieldsToCheck = [
      "full_name", "phone", "email", "gender", "date_of_birth", "nationality",
      "address_line", "province", "commune", "colline_or_quartier",
      "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship",
      "business_name", "business_entity_type", "business_registration_number", "business_tax_id", "business_doc_expiry_date",
      "boutique_type", "boutique_services", "delivery_vehicle", "vehicle_registration",
      "preferred_delivery_time", "delivery_instructions", "lumicash_msisdn",
      "id_type", "id_number", "id_issue_date", "id_expiry_date", "id_no_expiry",
      "client_type", "supplier_type", "merchant_type", "delivery_type"
    ];

    let hasChanges = false;

    // Vérifier les champs de formulaire
    for (const field of fieldsToCheck) {
      const currentValue = (formData as any)[field];
      const initialValue = (initialData as any)[field];
      
      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        if (JSON.stringify(currentValue.sort()) !== JSON.stringify(initialValue.sort())) {
          hasChanges = true;
          break;
        }
      } else if (currentValue !== initialValue) {
        hasChanges = true;
        break;
      }
    }

    // Vérifier la photo
    if (!hasChanges) {
      const hasPhotoChanged = (formData as any).photo !== null;
      hasChanges = hasPhotoChanged;
    }

    // Vérifier les documents KYC
    if (!hasChanges) {
      const kycFields = ["id_front_image", "id_back_image", "passport_photo"];
      for (const field of kycFields) {
        if ((formData as any)[field] !== null) {
          hasChanges = true;
          break;
        }
      }
    }

    // Vérifier les documents KYB
    if (!hasChanges) {
      if ((formData as any).business_document !== null) {
        hasChanges = true;
      }
    }

    setHasUnsavedChanges(hasChanges);
  }, [formData, initialData, editModeEffective]);

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview && profilePhotoPreview.startsWith("blob:")) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

  useEffect(() => {
    return () => {
      if (cropImageSrc && cropImageSrc.startsWith("blob:")) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  // ------------------------- KYC / Locking -------------------------
  const kycStartDate = useMemo(() => {
    if (accountCreatedAt) return accountCreatedAt;
    return new Date(nowTs);
  }, [accountCreatedAt, nowTs]);

  const kycDeadline = useMemo(() => new Date(kycStartDate.getTime() + KYC_WINDOW_MS), [kycStartDate]);
  const kycRemainingMs = useMemo(() => Math.max(0, kycDeadline.getTime() - nowTs), [kycDeadline, nowTs]);
  const deadlinePassed = useMemo(() => kycRemainingMs <= 0, [kycRemainingMs]);

  const backendKycStatus = (displayUser?.kyc_status || "unverified") as string;
  const globalLocked = useMemo(() => backendKycStatus === "verified", [backendKycStatus]);

  // ------------------------- Documents grouping -------------------------
  const kycDocs = useMemo(() => {
    const docs = userDocuments || [];
    return docs
      .filter((d) =>
        ["id_card", "passport", "proof_of_address", "selfie", "id_front", "id_back", "passport_photo"].includes(
          String(d.document_type || "").toLowerCase()
        )
      )
      .map((doc) => ({
        ...doc,
        file_type: getFileType(doc.file || doc.file_name || ""),
        file_url: getAbsoluteFileUrl(doc.file),
        category: "kyc" as const,
      }));
  }, [userDocuments]);

  const kybDocs = useMemo(() => {
    const docs = userDocuments || [];
    return docs
      .filter(
        (d) =>
          !["id_card", "passport", "proof_of_address", "selfie", "id_front", "id_back", "passport_photo"].includes(
            String(d.document_type || "").toLowerCase()
          )
      )
      .map((doc) => ({
        ...doc,
        file_type: getFileType(doc.file || doc.file_name || ""),
        file_url: getAbsoluteFileUrl(doc.file),
        category: "kyb" as const,
      }));
  }, [userDocuments]);

  const allDocs = useMemo(() => {
    return (userDocuments || []).map((doc) => {
      const isKyc =
        ["id_card", "passport", "proof_of_address", "selfie", "id_front", "id_back", "passport_photo"].includes(
          String(doc.document_type || "").toLowerCase()
        ) === true;
      return {
        ...doc,
        file_type: getFileType(doc.file || doc.file_name || ""),
        file_url: getAbsoluteFileUrl(doc.file),
        category: isKyc ? ("kyc" as const) : ("kyb" as const),
      };
    });
  }, [userDocuments]);

  const accountType = useMemo(() => toStr(displayUser?.account_type || ""), [displayUser?.account_type]);
  const kybRequired = useMemo(() => ["fournisseur", "partenaire", "entreprise"].includes(accountType), [accountType]);

  const kycSubmitted = useMemo(() => (kycDocs || []).length > 0, [kycDocs]);
  const kybSubmitted = useMemo(() => (kybDocs || []).length > 0, [kybDocs]);

  const computedAccountBlocked = useMemo(() => {
    if (!user?.id) return false;
    if (!deadlinePassed) return false;

    const kycOk = kycSubmitted;
    const kybOk = !kybRequired ? true : kybSubmitted;

    return !(kycOk && kybOk);
  }, [user?.id, deadlinePassed, kycSubmitted, kybRequired, kybSubmitted]);

  const accountBlocked = useMemo(() => {
    if (globalLocked) return false;
    return computedAccountBlocked;
  }, [globalLocked, computedAccountBlocked]);

  const docsLocked = useMemo(() => {
    if (globalLocked) return true;
    if (deadlinePassed) return true;
    return false;
  }, [globalLocked, deadlinePassed]);

  const showKycZone = useMemo(() => {
    if (!user?.id) return false;
    return !globalLocked;
  }, [user?.id, globalLocked]);

  const effectiveKycStatus = useMemo(() => {
    if (globalLocked) return "verified";
    if (!deadlinePassed) return backendKycStatus || "unverified";
    return kycSubmitted ? "verified" : "blocked";
  }, [globalLocked, deadlinePassed, backendKycStatus, kycSubmitted]);

  const effectiveKybStatus = useMemo(() => {
    if (!kybRequired) return "not_required";
    if (globalLocked) return "verified";
    if (!deadlinePassed) return "pending";
    return kybSubmitted ? "verified" : "blocked";
  }, [kybRequired, globalLocked, deadlinePassed, kybSubmitted]);

  const kycStatusLabel = useMemo(() => {
    if (effectiveKycStatus === "verified") return "KYC Vérifié";
    if (effectiveKycStatus === "pending") return "KYC En Attente";
    if (effectiveKycStatus === "rejected") return "KYC Rejeté";
    if (effectiveKycStatus === "blocked") return "KYC Incomplet (Compte bloqué)";
    return "KYC Incomplet";
  }, [effectiveKycStatus]);

  const kybStatusLabel = useMemo(() => {
    if (!kybRequired) return "KYB Non Requis";
    if (effectiveKybStatus === "verified") return "KYB Vérifié";
    if (effectiveKybStatus === "blocked") return "KYB Incomplet (Compte bloqué)";
    return docsLocked ? "KYB (lecture seule)" : "KYB En Attente";
  }, [kybRequired, effectiveKybStatus, docsLocked]);

  const kycDeadlineMessage = useMemo(() => {
    const uname =
      (displayUser?.username && String(displayUser.username)) ||
      (displayUser?.full_name && String(displayUser.full_name)) ||
      "utilisateur";
    return `Hello ${uname}, vous disposez de 72 heures après votre inscription pour mettre à jour vos documents KYC/KYB. Après ce délai, aucune modification ne sera possible.`;
  }, [displayUser?.username, displayUser?.full_name]);

  // ------------------------- API load -------------------------
  const loadUserProfile = async (): Promise<void> => {
    try {
      setIsLoadingProfile(true);

      const userData: UserData = await getCurrentUser();
      dispatch(updateProfile(userData as any));

      const createdAt = pickAccountCreatedAt(userData);
      if (createdAt) setAccountCreatedAt(createdAt);

      const docs = Array.isArray(userData.documents) ? userData.documents : [];
      setUserDocuments(
        docs.map((doc) => ({
          ...doc,
          file_type: getFileType(doc.file || doc.file_name || ""),
        }))
      );

      // ✅ Photo profil unique: on ne garde qu'une seule source
      const pRaw = pickProfilePhotoUrl(userData);
      const pUrl = pRaw ? getAbsoluteFileUrl(pRaw) : "";

      // ✅ Important: on ne remplace PAS un preview blob par une url serveur pendant l'édition,
      // sauf si aucun blob n'existe
      setProfilePhotoPreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return pUrl || "";
      });

      const profileData: ExtendedUserRegistrationData = {
        account_type: ((userData.account_type ?? "client") as any) ?? "client",
        username: toStr(userData.username),
        email: toStr(userData.email),
        role: toStr(userData.role),
        password: "",
        confirm_password: "",
        password2: "",
        full_name: toStr((userData as any).full_name),
        phone: toStr((userData as any).phone),
        gender: (userData as any).gender as any,
        date_of_birth: toStr((userData as any).date_of_birth),
        nationality: toStr((userData as any).nationality),

        id_type: (userData as any).id_type as any,
        id_number: toStr((userData as any).id_number),
        id_issue_date: toStr((userData as any).id_issue_date),
        id_expiry_date: toStr((userData as any).id_expiry_date),
        id_no_expiry: toBool((userData as any).id_no_expiry, false),

        address_line: toStr((userData as any).address_line),
        province: toStr((userData as any).province),
        commune: toStr((userData as any).commune),
        colline_or_quartier: toStr((userData as any).colline_or_quartier),

        emergency_contact_name: toStr((userData as any).emergency_contact_name),
        emergency_contact_phone: toStr((userData as any).emergency_contact_phone),
        emergency_contact_relationship: toStr((userData as any).emergency_contact_relationship),

        business_name: toStr((userData as any).business_name),
        business_entity_type: (userData as any).business_entity_type as any,
        business_registration_number: toStr((userData as any).business_registration_number),
        business_tax_id: toStr((userData as any).business_tax_id),
        business_doc_expiry_date: toStr((userData as any).business_doc_expiry_date),

        boutique_type: (userData as any).boutique_type as any,
        boutique_services: toArr((userData as any).boutique_services),

        delivery_vehicle: (userData as any).delivery_vehicle as any,
        vehicle_registration: toStr((userData as any).vehicle_registration),
        preferred_delivery_time: toStr((userData as any).preferred_delivery_time),
        delivery_instructions: toStr((userData as any).delivery_instructions),

        lumicash_msisdn: toStr((userData as any).lumicash_msisdn),

        accepted_terms: true,
        accepted_contract: toBool((userData as any).accepted_contract, false),

        client_type: (userData as any).client_type as any,
        supplier_type: (userData as any).supplier_type as any,
        merchant_type: (userData as any).merchant_type as any,
        delivery_type: (userData as any).delivery_type as any,

        id_front_image: null,
        id_back_image: null,
        passport_photo: null,
        business_document: null,
        photo: null, // ✅ on ne hydrate jamais un File depuis backend
        signature: null,

        kyc_status: ((userData as any).kyc_status as any) ?? undefined,
        account_status: ((userData as any).account_status as any) ?? undefined,
        account_type_label: (userData as any).account_type_label,
        account_category: (userData as any).account_category,
        account_category_label: (userData as any).account_category_label,
      } as any;

      setFormData(profileData);
      
      // ✅ Sauvegarder les données initiales pour la comparaison
      setInitialData(profileData);

      // ✅ IMPORTANT: remonter l'URL au Dashboard (header) si demandé
      // On envoie l'URL absolue de la photo au parent (Dashboard)
      if (onAvatarUpdated) {
        const photoUrl = pRaw ? getAbsoluteFileUrl(pRaw) : null;
        onAvatarUpdated(photoUrl);
      }
    } catch (error: any) {
      setErrorMessage("Erreur lors du chargement du profil: " + (error?.message || "Erreur inconnue"));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ------------------------- handlers -------------------------
  const handleInputChange: InputChangeHandler = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev: ExtendedUserRegistrationData) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if ((formErrors as any)[name]) {
      setFormErrors((prev: FormValidationErrors) => {
        const newErrors = { ...(prev as any) };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const startCropFromFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setRawPhotoName(file.name || "profile.jpg");
    setCropImageSrc((prevSrc) => {
      if (prevSrc && prevSrc.startsWith("blob:")) URL.revokeObjectURL(prevSrc);
      return url;
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropModalOpen(true);
  };

  const handleFileChange: FileChangeHandler = (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const file = files[0];

    // Photo uniquement (crop) => "photo" UNIQUE
    if (name === "photo") {
      try {
        startCropFromFile(file);
        return;
      } catch {
        // fallback
        setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: file }));
        const url = URL.createObjectURL(file);
        setProfilePhotoPreview((prevUrl) => {
          if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
          return url;
        });
        return;
      }
    }

    // autres fichiers
    setFormData((prev: ExtendedUserRegistrationData) => ({
      ...prev,
      [name]: file,
    }));

    if ((formErrors as any)[name]) {
      setFormErrors((prev: FormValidationErrors) => {
        const newErrors = { ...(prev as any) };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleArrayChange: ArrayChangeHandler = (name: string, value: string[]) => {
    setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange: CheckboxChangeHandler = (name: string, checked: boolean) => {
    setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: checked }));
  };

  // ------------------------- edit rules -------------------------
  const isReadOnlyThisTab = useMemo(() => {
    if (globalLocked) return true;
    if (accountBlocked) return true;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return true;
    return !editModeEffective;
  }, [activeTab, editModeEffective, globalLocked, accountBlocked, docsLocked]);

  const allowEditThisTab = useMemo(() => {
    if (globalLocked) return false;
    if (accountBlocked) return false;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return false;
    return editModeEffective;
  }, [globalLocked, accountBlocked, activeTab, docsLocked, editModeEffective]);

  // ------------------------- Docs modal -------------------------
  const openDocsModal = async (tab: DocsModalTabType) => {
    await loadUserProfile();
    setDocsModalTab(tab);
    setDocsModalOpen(true);
  };

  const closeDocsModal = () => setDocsModalOpen(false);

  const docsEditableInModal = useMemo(() => {
    if (globalLocked) return false;
    if (accountBlocked) return false;
    if (docsLocked) return false;
    if (docsModalTab === "kyb" && !kybRequired) return false;
    return editModeEffective;
  }, [globalLocked, accountBlocked, docsLocked, docsModalTab, kybRequired, editModeEffective]);

  const saveDocsFromModal = async () => {
    if (!docsEditableInModal) {
      setErrorMessage("Modification désactivée (délai expiré ou compte verrouillé).");
      return;
    }

    setIsSavingDocs(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const fd = new FormData();

      if (docsModalTab === "kyc") {
        const f1 = (formData as any).id_front_image;
        const f2 = (formData as any).id_back_image;
        const f3 = (formData as any).passport_photo;

        if (f1 instanceof File) fd.append("id_front_image", f1);
        if (f2 instanceof File) fd.append("id_back_image", f2);
        if (f3 instanceof File) fd.append("passport_photo", f3);

        const idType = (formData as any).id_type;
        const idNumber = (formData as any).id_number;
        if (idType) fd.append("id_type", String(idType));
        if (idNumber) fd.append("id_number", String(idNumber));
      }

      if (docsModalTab === "kyb") {
        const b1 = (formData as any).business_document;
        if (b1 instanceof File) fd.append("business_document", b1);

        const bname = (formData as any).business_name;
        if (bname) fd.append("business_name", String(bname));
      }

      if ([...fd.keys()].length === 0) {
        setErrorMessage("Sélectionnez au moins un fichier à envoyer.");
        return;
      }

      await updateUserProfile(fd);
      await loadUserProfile();

      setSuccessMessage(docsModalTab === "kyc" ? "Documents KYC mis à jour !" : "Documents KYB mis à jour !");
    } catch (e: any) {
      setErrorMessage(e?.message || "Erreur lors de la mise à jour des documents");
    } finally {
      setIsSavingDocs(false);
    }
  };

  // ------------------------- Crop -------------------------
  const onCropComplete = (_: any, croppedPixels: any) => {
    if (!croppedPixels) return;
    setCroppedAreaPixels({
      x: croppedPixels.x,
      y: croppedPixels.y,
      width: croppedPixels.width,
      height: croppedPixels.height,
    });
  };

  const applyCroppedPhoto = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) {
        setCropModalOpen(false);
        return;
      }

      const blob = await getCroppedBlob(cropImageSrc, croppedAreaPixels);
      const finalFile = blobToFile(blob, rawPhotoName || "profile.jpg");

      // ✅ la seule photo de profil: "photo"
      setFormData((prev) => ({ ...prev, photo: finalFile } as any));

      const newPreviewUrl = URL.createObjectURL(finalFile);
      setProfilePhotoPreview((prevUrl) => {
        if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
        return newPreviewUrl;
      });

      setCropModalOpen(false);
    } catch (e) {
      setErrorMessage("Impossible de recadrer l'image. Réessayez avec une autre photo.");
      setCropModalOpen(false);
    }
  };

  // ------------------------- save profil -------------------------
  const handleSave = async (): Promise<void> => {
    if (accountBlocked) {
      setErrorMessage("Votre compte est bloqué car le délai est expiré. Les documents ne peuvent plus être modifiés.");
      return;
    }
    if (globalLocked) {
      setErrorMessage("Votre KYC est validé. Le profil est verrouillé.");
      return;
    }
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) {
      setErrorMessage("Le délai est terminé. Les documents ne peuvent plus être modifiés ni supprimés.");
      return;
    }
    if (!editModeEffective) {
      setErrorMessage("Le mode édition n'est pas activé. Utilisez le bouton dans le Dashboard.");
      return;
    }
    if (!hasUnsavedChanges) {
      setErrorMessage("Aucune modification à enregistrer.");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFormErrors({});

    try {
      const updateData = new FormData();

      const fieldsToUpdate = [
        "full_name",
        "phone",
        "email",
        "gender",
        "date_of_birth",
        "nationality",
        "address_line",
        "province",
        "commune",
        "colline_or_quartier",
        "emergency_contact_name",
        "emergency_contact_phone",
        "emergency_contact_relationship",
        "business_name",
        "business_entity_type",
        "business_registration_number",
        "business_tax_id",
        "business_doc_expiry_date",
        "boutique_type",
        "boutique_services",
        "delivery_vehicle",
        "vehicle_registration",
        "preferred_delivery_time",
        "delivery_instructions",
        "lumicash_msisdn",
        "id_type",
        "id_number",
        "id_issue_date",
        "id_expiry_date",
        "id_no_expiry",
        "client_type",
        "supplier_type",
        "merchant_type",
        "delivery_type",
      ];

      fieldsToUpdate.forEach((key) => {
        const value = (formData as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) updateData.append(key, JSON.stringify(value));
          else updateData.append(key, String(value));
        }
      });

      // ✅ PHOTO UNIQUE: "photo" uniquement
      const photo = (formData as any).photo;
      if (photo instanceof File) updateData.append("photo", photo);

      const signature = (formData as any).signature;
      if (signature instanceof File) updateData.append("signature", signature);

      // ✅ KYC docs (si onglet identity)
      if (activeTab === "identity" && !docsLocked) {
        const f1 = (formData as any).id_front_image;
        const f2 = (formData as any).id_back_image;
        const f3 = (formData as any).passport_photo;
        if (f1 instanceof File) updateData.append("id_front_image", f1);
        if (f2 instanceof File) updateData.append("id_back_image", f2);
        if (f3 instanceof File) updateData.append("passport_photo", f3);
      }

      // ✅ KYB docs
      if (activeTab === "business" && !docsLocked) {
        const b1 = (formData as any).business_document;
        if (b1 instanceof File) updateData.append("business_document", b1);
      }

      await updateUserProfile(updateData);

      // ✅ Recharge profil (documents + url photo)
      await loadUserProfile();

      // ✅ IMPORTANT: après save, on prend l'URL "photo" unique et on remonte au dashboard
      const after = await getCurrentUser();
      const newPhotoRaw = pickProfilePhotoUrl(after);
      const newPhotoAbs = newPhotoRaw ? getAbsoluteFileUrl(newPhotoRaw) : null;
      
      if (onAvatarUpdated) {
        onAvatarUpdated(newPhotoAbs);
      }

      // ✅ si on avait un blob preview, on le remplace par l'url serveur fraîche
      if (newPhotoAbs) {
        setProfilePhotoPreview((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return newPhotoAbs;
        });
      }

      // ✅ Réinitialiser les modifications
      setHasUnsavedChanges(false);
      
      setSuccessMessage("Profil mis à jour avec succès !");
    } catch (error: any) {
      if (error?.payload?.errors) {
        const backendErrors: FormValidationErrors = {};
        Object.entries(error.payload.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) (backendErrors as any)[field] = (messages as any[]).join(", ");
          else (backendErrors as any)[field] = String(messages);
        });
        setFormErrors(backendErrors);
      }
      setErrorMessage(error?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- Toggle edit mode -------------------------
  const toggleEditMode = () => {
    if (typeof externalEditMode === "boolean") {
      onRequestToggleEditMode?.();
    } else {
      setInternalEditMode((v) => !v);
    }
  };

  // ------------------------- UI réutilisable -------------------------
  const ActionButton = ({
    children,
    onClick,
    variant = "outline",
    disabled,
    className = "",
    type = "button",
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "outline" | "primary" | "accent";
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit";
  }) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border";

    if (variant === "primary") {
      return (
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          className={`${base} ${className} text-white hover:opacity-95`}
          style={{
            borderColor: "transparent",
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {children}
        </button>
      );
    }

    if (variant === "accent") {
      return (
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          className={`${base} ${className} text-white hover:opacity-95`}
          style={{
            borderColor: "transparent",
            background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentLight} 100%)`,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {children}
        </button>
      );
    }

    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${className} bg-white hover:bg-gray-50`}
        style={{
          borderColor: BRAND.border,
          color: BRAND.text,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {children}
      </button>
    );
  };

  const MenuItem = ({ item, active, onClick }: { item: any; active: boolean; onClick: () => void }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
          active ? "bg-white shadow-sm ring-2" : "hover:bg-gray-50/80"
        }`}
        style={{
          background: active ? BRAND.panel : "transparent",
          borderColor: active ? BRAND.accent : "transparent",
          outline: active ? `2px solid ${BRAND.ring}` : "none",
          outlineOffset: active ? 2 : 0,
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: active
              ? `linear-gradient(135deg, ${BRAND.primary}15 0%, ${BRAND.accent}15 100%)`
              : `linear-gradient(135deg, ${BRAND.light} 0%, #FFFFFF 100%)`,
            color: active ? BRAND.primary : BRAND.muted,
            border: `1px solid ${active ? BRAND.accent + "30" : BRAND.border}`,
          }}
        >
          {item.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold truncate ${active ? "text-gray-900" : "text-gray-700"}`}>
              {item.label}
            </span>
            {item.badge && (
              <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {item.badge}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 truncate" style={{ color: BRAND.muted }}>
            {item.description}
          </p>
        </div>
      </button>
    );
  };

  const DocumentCard = ({ doc, category }: { doc: any; category: "kyc" | "kyb" }) => {
    const isImage = doc.file_type === "image";
    const isPDF = doc.file_type === "pdf";

    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-between gap-3">
          <span className="truncate">{doc.document_type || "Document"}</span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                category === "kyc" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
              }`}
            >
              {category.toUpperCase()}
            </span>
            {doc.verified ? <VerifiedBadge label="Validé" /> : <StatusBadge tone="yellow" label="En attente" />}
          </div>
        </div>
        <div className="p-4">
          {isImage && doc.file_url ? (
            <div className="rounded-xl border border-gray-200 overflow-hidden mb-3 bg-gray-100">
              <img src={doc.file_url} alt={doc.document_type || "Document"} className="w-full h-48 object-cover" />
            </div>
          ) : isPDF ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100">
                  <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8M8 17h8" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">Document PDF</div>
                  <div className="text-xs text-gray-500">Cliquez pour ouvrir</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">Document</div>
                  <div className="text-xs text-gray-500">Fichier téléchargeable</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">{doc.uploaded_at && `Uploadé: ${formatDateOnly(doc.uploaded_at)}`}</div>
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: BRAND.primary + "30", color: BRAND.primary }}
            >
              Ouvrir
            </a>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------- Section Documents -------------------------
  const renderDocumentsSection = () => {
    if (allDocs.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
            <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun document</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore soumis de documents.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ActionButton variant="primary" onClick={() => openDocsModal("kyc")}>
              Ajouter des documents KYC
            </ActionButton>
            {kybRequired && (
              <ActionButton variant="outline" onClick={() => openDocsModal("kyb")}>
                Ajouter des documents KYB
              </ActionButton>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Documents KYC</h4>
              <StatusBadge
                tone={kycDocs.length > 0 ? "green" : "yellow"}
                label={kycDocs.length > 0 ? `${kycDocs.length} doc(s)` : "Aucun"}
              />
            </div>
            <div className="space-y-2">
              {kycDocs.length > 0 ? (
                kycDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="truncate">{doc.document_type || "Document"}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {doc.verified ? "Vérifié" : "En attente"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">Aucun document KYC</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Documents KYB</h4>
              <StatusBadge
                tone={kybDocs.length > 0 ? "green" : kybRequired ? "yellow" : "gray"}
                label={kybRequired ? `${kybDocs.length} doc(s)` : "Non requis"}
              />
            </div>
            <div className="space-y-2">
              {kybDocs.length > 0 ? (
                kybDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="truncate">{doc.document_type || "Document"}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {doc.verified ? "Vérifié" : "En attente"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  {kybRequired ? "Aucun document KYB" : "KYB non requis pour votre profil"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Tous vos documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} category={doc.category || "kyc"} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ------------------------- Render form content -------------------------
  const renderFormBlock = (): React.ReactNode => {
    if (isLoadingProfile) {
      return (
        <div className="flex justify-center items-center py-14">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: BRAND.primary }} />
            <p className="text-sm" style={{ color: BRAND.muted }}>
              Chargement de votre profil...
            </p>
          </div>
        </div>
      );
    }

    if (!editModeEffective) {
      switch (activeTab) {
        case "personal":
          return <PersonalInfoDisplay formData={formData} />;
        case "address":
          return <AddressDisplay formData={formData} />;
        case "identity":
          return <IdentityDisplay formData={formData} />;
        case "boutique":
          return <BoutiqueDisplay formData={formData} />;
        case "delivery":
          return <DeliveryDisplay formData={formData} />;
        case "business":
          return <BusinessDisplay formData={formData} />;
        case "documents":
          return renderDocumentsSection();
        default:
          return (
            <div className="text-center py-10 text-sm" style={{ color: BRAND.muted }}>
              Sélectionnez une section.
            </div>
          );
      }
    }

    const commonProps: RegistrationStepProps = {
      formData,
      formErrors,
      onInputChange: handleInputChange,
      onFileChange: handleFileChange,
      onArrayChange: handleArrayChange,
      onCheckboxChange: handleCheckboxChange,
      mode: "profile" as const,
    };

    switch (activeTab) {
      case "personal":
        return <RegisterPersonalInfoForm {...commonProps} />;
      case "address":
        return <RegisterAddressForm {...commonProps} />;
      case "identity":
        return <RegisterIdentityVerificationForm {...commonProps} />;
      case "boutique":
        return <RegisterBoutiqueInfoForm {...commonProps} />;
      case "delivery":
        return <RegisterDeliveryInfo {...commonProps} />;
      case "business":
        return <RegisterBusinessDocuments {...commonProps} />;
      case "documents":
        return renderDocumentsSection();
      default:
        return (
          <div className="text-center py-10 text-sm" style={{ color: BRAND.muted }}>
            Sélectionnez une section.
          </div>
        );
    }
  };

  // ------------------------- Menu items (latéral) -------------------------
  const menuItems = useMemo(() => {
    return [
      {
        id: "personal" as ProfileSection,
        label: "Informations Personnelles",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        description: "Nom, email, téléphone, etc.",
      },
      {
        id: "address" as ProfileSection,
        label: "Adresse",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        description: "Adresse complète et contacts",
      },
      {
        id: "identity" as ProfileSection,
        label: "Vérification KYC",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        description: "Documents d'identité",
        badge: kycStatusLabel,
      },
      ...(accountType === "commercant"
        ? [
            {
              id: "boutique" as ProfileSection,
              label: "Boutique",
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M3 7h18M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-4h14l2 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M9 11v6M15 11v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              description: "Informations de boutique",
            },
          ]
        : []),
      ...(accountType === "livreur"
        ? [
            {
              id: "delivery" as ProfileSection,
              label: "Livraison",
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 17h4V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 17h6v-4a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="18" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              description: "Informations de livraison",
            },
          ]
        : []),
      ...(["fournisseur", "partenaire", "entreprise"].includes(accountType)
        ? [
            {
              id: "business" as ProfileSection,
              label: "Documents Entreprise",
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              ),
              description: "Documents KYB",
              badge: kybStatusLabel,
            },
          ]
        : []),
      {
        id: "documents" as ProfileSection,
        label: "Documents",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        description: "Tous vos documents",
        badge: allDocs.length > 0 ? `${allDocs.length} doc(s)` : "Aucun",
      },
      {
        id: "activity" as ProfileSection,
        label: "Activité",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        description: "Historique d'activité",
      },
    ];
  }, [accountType, kycStatusLabel, kybStatusLabel, allDocs.length]);

  // Ne pas afficher la Navigation si on est dans le dashboard
  const shouldShowNavigation = !isInDashboard && !location.pathname.includes("/dashboard");

  // ========================= RENDER =========================
  return (
    <>
      {shouldShowNavigation && <Navigation />}

      {/* ✅ Modal docs */}
      {docsModalOpen && (
        <div className="fixed inset-0 z-[10050] animate-fadeIn">
          <div className="absolute inset-0 bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && closeDocsModal()} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-scaleIn">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-extrabold text-gray-900">
                      {docsModalTab === "kyc" ? "Documents KYC" : docsModalTab === "kyb" ? "Documents KYB" : "Tous les documents"}
                    </h3>
                    {docsLocked ? <StatusBadge tone="red" label="Lecture seule" /> : <StatusBadge tone="blue" label="Éditable" />}
                  </div>
                  <p className="text-sm mt-1 text-gray-600">
                    {docsLocked
                      ? "Le délai est terminé. Vous pouvez consulter les fichiers soumis."
                      : "Vous pouvez consulter et mettre à jour vos fichiers tant que le délai n'est pas expiré."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border" style={{ borderColor: BRAND.border }}>
                    <button
                      onClick={() => setDocsModalTab("kyc")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        docsModalTab === "kyc" ? "text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                      style={{
                        background:
                          docsModalTab === "kyc"
                            ? `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`
                            : "transparent",
                        borderRadius: docsModalTab === "kyc" ? "0.375rem" : "0",
                      }}
                    >
                      KYC
                    </button>
                    <button
                      onClick={() => setDocsModalTab("kyb")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        docsModalTab === "kyb" ? "text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                      style={{
                        background:
                          docsModalTab === "kyb"
                            ? `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentLight} 100%)`
                            : "transparent",
                        borderRadius: docsModalTab === "kyb" ? "0.375rem" : "0",
                      }}
                    >
                      KYB
                    </button>
                    <button
                      onClick={() => setDocsModalTab("all")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        docsModalTab === "all" ? "text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                      style={{
                        background: docsModalTab === "all" ? `linear-gradient(135deg, #38A169 0%, #48BB78 100%)` : "transparent",
                        borderRadius: docsModalTab === "all" ? "0.375rem" : "0",
                      }}
                    >
                      Tous
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={closeDocsModal}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                    style={{ borderColor: "rgba(11,86,140,0.2)" }}
                    aria-label="Fermer"
                  >
                    <svg className="w-5 h-5" style={{ color: BRAND.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M18 6L6 18" strokeLinecap="round" />
                      <path d="M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-5 max-h-[70vh] overflow-y-auto">
                {docsModalTab === "kyc" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kycDocs.length === 0 ? (
                      <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
                        <div className="text-sm font-semibold text-gray-600 mb-2">Aucun document KYC</div>
                      </div>
                    ) : (
                      kycDocs.map((doc) => <DocumentCard key={doc.id} doc={doc} category="kyc" />)
                    )}
                  </div>
                )}

                {docsModalTab === "kyb" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kybDocs.length === 0 ? (
                      <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
                        <div className="text-sm font-semibold text-gray-600 mb-2">
                          {kybRequired ? "Aucun document KYB" : "KYB Non Requis"}
                        </div>
                      </div>
                    ) : (
                      kybDocs.map((doc) => <DocumentCard key={doc.id} doc={doc} category="kyb" />)
                    )}
                  </div>
                )}

                {docsModalTab === "all" && renderDocumentsSection()}
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <ActionButton variant="outline" onClick={loadUserProfile} disabled={isLoadingProfile} className="text-xs">
                  Actualiser
                </ActionButton>

                {docsModalTab !== "all" && docsEditableInModal && (
                  <ActionButton variant="primary" onClick={saveDocsFromModal} disabled={isSavingDocs}>
                    {isSavingDocs ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </ActionButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal crop photo */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[10000] animate-fadeIn">
          <div className="absolute inset-0 bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && setCropModalOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white animate-scaleIn">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Ajuster la photo</h3>
                  <p className="text-sm mt-1 text-gray-600">Glissez pour déplacer l'image, puis zoomez pour ajuster.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                  style={{ borderColor: "rgba(11,86,140,0.2)" }}
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" style={{ color: BRAND.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6L6 18" strokeLinecap="round" />
                    <path d="M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="px-5 sm:px-6 py-5">
                <div
                  className="relative w-full h-[340px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 touch-none"
                  style={{ touchAction: "none" }}
                >
                  <Cropper
                    image={cropImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    restrictPosition={false}
                  />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Zoom</span>
                    <span className="text-xs font-semibold text-gray-600">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <ActionButton
                  variant="outline"
                  onClick={() => {
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setCropModalOpen(false);
                  }}
                >
                  Annuler
                </ActionButton>

                <ActionButton variant="primary" onClick={applyCroppedPhoto}>
                  Appliquer
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================= PAGE PRINCIPALE ========================= */}
      <div
        className={`${isInDashboard ? "min-h-[calc(100vh-80px)]" : "min-h-screen"}`}
        style={{
          background: isInDashboard ? "#FFFFFF" : `linear-gradient(135deg, ${BRAND.bgA} 0%, ${BRAND.bgB} 100%)`,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          marginTop: isInDashboard ? 0 : 80,
        }}
      >
        <div className={`${isInDashboard ? "w-full px-4 py-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"}`}>
          {/* Alerts */}
          <div className="mb-6 space-y-3">
            {successMessage && <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage("")} />}
            {errorMessage && <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage("")} />}
          </div>

          {/* Zone d'alerte KYC */}
          {showKycZone && (
            <div className="mb-6" style={{ marginTop: isInDashboard ? 0 : 0 }}>
              <div
                className="rounded-2xl p-4 border bg-gradient-to-r from-red-50 to-orange-50 shadow-sm"
                style={{ borderColor: "rgba(239,68,68,0.25)" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">{kycDeadlineMessage}</p>
                      {!globalLocked && !accountBlocked && kycRemainingMs > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 py-1.5 font-mono text-sm font-bold text-red-700 shadow-sm animate-pulse">
                            {formatDuration(kycRemainingMs)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className={`${isInDashboard ? "lg:col-span-3 xl:col-span-2" : "lg:col-span-4"}`}>
              <div className="space-y-6">
                <div className="rounded-2xl p-5 shadow-sm border bg-white" style={{ borderColor: BRAND.border }}>
                  {/* ✅ SEUL ET UNIQUE BLOC PHOTO DE PROFIL */}
                  <div className="mb-5 pb-5 border-b" style={{ borderColor: BRAND.border }}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-full overflow-hidden border-2 bg-gray-100"
                          style={{ borderColor: "rgba(11,86,140,0.25)" }}
                        >
                          {effectivePhotoUrl ? (
                            <img src={effectivePhotoUrl} alt="Photo de profil" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: BRAND.primary }}>
                              {getInitials(displayUser?.full_name || displayUser?.username)}
                            </div>
                          )}
                        </div>

                        {editModeEffective && (
                          <label
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "rgba(11,86,140,0.2)" }}
                            title="Changer la photo"
                          >
                            <input
                              type="file"
                              name="photo"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e as any)}
                            />
                            <svg className="w-4 h-4" style={{ color: BRAND.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </label>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-extrabold truncate" style={{ color: BRAND.text }}>
                          {displayUser?.full_name || displayUser?.username || "Utilisateur"}
                        </div>
                        <div className="text-xs truncate" style={{ color: BRAND.muted }}>
                          {displayUser?.email || ""}
                        </div>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <StatusBadge
                            tone={effectiveKycStatus === "verified" ? "green" : effectiveKycStatus === "blocked" ? "red" : "yellow"}
                            label={kycStatusLabel}
                          />
                          {kybRequired && (
                            <StatusBadge
                              tone={effectiveKybStatus === "verified" ? "green" : effectiveKybStatus === "blocked" ? "red" : "yellow"}
                              label={kybStatusLabel}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: BRAND.muted }}>
                    Navigation
                  </h3>
                  <div className="space-y-2">
                    {menuItems.map((item) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        active={activeSection === item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setActiveTab(item.id);
                        }}
                      />
                    ))}
                  </div>

                  {/* Actions docs */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
                    <div className="grid grid-cols-2 gap-2">
                      <ActionButton variant="outline" onClick={() => openDocsModal("kyc")} disabled={!user?.id} className="text-xs">
                        Voir KYC
                      </ActionButton>
                      <ActionButton
                        variant="outline"
                        onClick={() => openDocsModal("kyb")}
                        disabled={!user?.id || !kybRequired}
                        className="text-xs"
                      >
                        Voir KYB
                      </ActionButton>
                    </div>
                    <div className="mt-3">
                      <ActionButton
                        variant="accent"
                        onClick={() => openDocsModal("all")}
                        disabled={!user?.id || allDocs.length === 0}
                        className="w-full text-xs"
                      >
                        Voir tous ({allDocs.length})
                      </ActionButton>
                    </div>
                  </div>

                  {/* ✅ SEUL ET UNIQUE BOUTON ENREGISTRER */}
                  {editModeEffective && (
                    <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
                      <ActionButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={isLoading || isLoadingProfile || globalLocked || accountBlocked || !allowEditThisTab || !hasUnsavedChanges}
                        className="w-full justify-center"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                              <path d="M17 21v-8H7v8" />
                              <path d="M7 3v5h8" />
                            </svg>
                            Enregistrer les modifications
                          </>
                        )}
                      </ActionButton>
                      
                      {/* Indicateur visuel des modifications */}
                      {hasUnsavedChanges && (
                        <div className="mt-2 text-xs text-center font-medium" style={{ color: BRAND.primary }}>
                          ✓ Modifications non sauvegardées
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle mode édition */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
                    <ActionButton
                      variant={editModeEffective ? "primary" : "outline"}
                      onClick={() => {
                        toggleEditMode();
                      }}
                      className="w-full justify-center"
                    >
                      {editModeEffective ? "Désactiver l'édition" : "Activer l'édition"}
                    </ActionButton>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <main className={`${isInDashboard ? "lg:col-span-9 xl:col-span-10" : "lg:col-span-8"}`}>
              <div className="rounded-2xl shadow-sm border bg-white overflow-hidden" style={{ borderColor: BRAND.border }}>
                <div
                  className="px-5 sm:px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ borderColor: BRAND.border }}
                >
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: BRAND.text }}>
                      {menuItems.find((m) => m.id === activeSection)?.label || "Informations"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
                      {menuItems.find((m) => m.id === activeSection)?.description || "Gérez vos informations personnelles"}
                    </p>
                    {editModeEffective && (
                      <div className="mt-2">
                        <StatusBadge tone="blue" label="Mode édition activé" />
                      </div>
                    )}
                  </div>

                  {/* ✅ PAS DE BOUTON ENREGISTRER ICI - SEULEMENT DANS LA SIDEBAR */}
                </div>

                <div className="p-5 sm:p-6">
                  <div className={["animate-fadeIn", isReadOnlyThisTab ? "pointer-events-none select-none opacity-95" : ""].join(" ")}>
                    {renderFormBlock()}
                  </div>

                  {/* ✅ PAS DE SECTION ENREGISTRER ICI - TOUT EST DANS LA SIDEBAR */}
                </div>
              </div>

              {activeSection === "activity" && (
                <div className="mt-6 rounded-2xl shadow-sm border bg-white overflow-hidden" style={{ borderColor: BRAND.border }}>
                  <div className="px-5 sm:px-6 py-4 border-b" style={{ borderColor: BRAND.border }}>
                    <h3 className="text-lg font-bold" style={{ color: BRAND.text }}>
                      Notes et Activité
                    </h3>
                  </div>
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: BRAND.border }}>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Ajoutez une note interne..."
                        className="w-full min-h-[100px] px-4 py-3 text-sm outline-none resize-none"
                        style={{ color: BRAND.text }}
                      />
                      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between" style={{ borderColor: BRAND.border }}>
                        <span className="text-xs font-medium" style={{ color: BRAND.muted }}>
                          Note interne visible uniquement par l'équipe
                        </span>
                        <ActionButton
                          variant="accent"
                          onClick={() => {
                            if (noteText.trim()) {
                              setPinnedNote(noteText);
                              setNoteText("");
                            }
                          }}
                          className="text-xs"
                        >
                          Épingler
                        </ActionButton>
                      </div>
                    </div>

                    {pinnedNote && (
                      <div
                        className="rounded-xl border overflow-hidden"
                        style={{
                          borderColor: "rgba(245, 158, 11, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(252, 211, 77, 0.05) 100%)",
                        }}
                      >
                        <div
                          className="px-4 py-3 border-b flex items-center justify-between"
                          style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}
                        >
                          <span className="text-sm font-semibold" style={{ color: "#92400E" }}>
                            Note épinglée
                          </span>
                          <button
                            onClick={() => setPinnedNote("")}
                            className="text-xs font-medium px-3 py-1 rounded-lg border hover:bg-white transition-colors"
                            style={{ borderColor: "rgba(245, 158, 11, 0.3)", color: "#92400E" }}
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="px-4 py-3 text-sm leading-relaxed" style={{ color: "#78350F" }}>
                          {pinnedNote}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!user?.id && (
                <div className="mt-8 rounded-2xl shadow-sm border bg-white p-8 text-center" style={{ borderColor: BRAND.border }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: BRAND.text }}>
                    Vous n'êtes pas connecté
                  </h3>
                  <p className="text-sm mb-6" style={{ color: BRAND.muted }}>
                    Connectez-vous ou créez un compte pour accéder à votre profil.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <ActionButton variant="primary" onClick={() => navigate("/register")}>
                      Créer un compte
                    </ActionButton>
                    <ActionButton variant="outline" onClick={() => navigate("/login")}>
                      Se connecter
                    </ActionButton>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
} et // ========================= src/pages/dashboard/components/UserDashboardContent.tsx =========================
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Stack,
  Divider,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  ArrowForward,
  LocalShipping,
  AccountBalanceWallet,
  TrendingUp,
  Notifications,
  QrCodeScanner,
  Store,
  ContactSupport,
  ReceiptLong,
  Message,
  Payment,
  AccountBalance,
  AccessTime,
  Visibility,
  VisibilityOff,
  Phone,
  Email,
  Delete,
  Description,
  History,
  Inventory,
  Security,
  Error as ErrorIcon,
  Add,
  Star,
} from "@mui/icons-material";

// Import du composant UserProfileView adapté
import UserProfileView from "../../pages/profile/UserProfileView";

type ActivityItem = {
  id: number;
  action?: string;
  activity_type?: string;
  details?: any;
  created_at?: string;
};

type Order = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address?: string;
};

type WalletType = {
  id: number;
  balance: number;
  account_number: string;
  phone_number: string;
  status: string;
  currency: string;
};

interface Props {
  activeTab: number;
  orders: Order[];
  wallet: WalletType;
  activities: ActivityItem[];
  notifications: any[];
  onOpenQr: () => void;
  onOpenDelete: () => void;
  onNavigate: (path: string) => void;
  isMobile?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  onClick,
  delay = 0,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
  delay?: number;
}) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        border: "1px solid rgba(11, 86, 140, 0.1)",
        overflow: "hidden",
        "&:hover": {
          transform: onClick ? "translateY(-8px)" : "none",
          boxShadow: onClick
            ? "0 20px 40px rgba(10, 52, 95, 0.15)"
            : "0 8px 32px rgba(10, 52, 95, 0.1)",
        },
      }}
      onClick={onClick}
      className="animate-fadeInUp"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <CardContent sx={{ p: 3, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60px",
            height: "60px",
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
            borderRadius: "0 0 0 100%",
          }}
        />
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: "0.7rem",
                display: "block",
                mb: 1,
                color: "#335F7A",
                background: alpha("#0B568C", 0.08),
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                width: "fit-content",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h2"
              sx={{
                mb: 0.5,
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "2.5rem" },
                background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "#487F9A",
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
              ml: 2,
            }}
            className="animate-bounce-soft"
          >
            <Box sx={{ color: "white", fontSize: { xs: 24, md: 28 } }}>{icon}</Box>
          </Box>
        </Box>

        {trend && trend !== "neutral" && (
          <Box display="flex" alignItems="center" sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: trend === "up" ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                mr: 1,
              }}
            >
              {trend === "up" ? <ArrowForward sx={{ fontSize: 16, color: "#4CAF50", transform: "rotate(-45deg)" }} /> : null}
            </Box>
            <Typography variant="caption" fontWeight={700} color={trend === "up" ? "#4CAF50" : "#F44336"}>
              {trend === "up" ? "+12%" : "-5%"} ce mois
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const WalletCard = ({ wallet, isMobile = false }: { wallet: WalletType; isMobile?: boolean }) => {
  const [showBalance, setShowBalance] = useState(true);
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
        color: "white",
        borderRadius: 3,
        boxShadow: "0 12px 40px rgba(11, 86, 140, 0.25)",
        position: "relative",
        overflow: "hidden",
        mb: 3,
        marginTop:10
      }}
      className="animate-scaleIn"
    >
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <CardContent sx={{ p: { xs: 2, md: 3 }, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                fontWeight: 500,
                display: "block",
                mb: 1,
                fontSize: { xs: "0.7rem", md: "0.75rem" },
              }}
            >
              SOLDE DISPONIBLE
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h3" fontWeight={900} fontSize={{ xs: "1.75rem", md: "2.25rem" }}>
                {showBalance ? `${wallet.balance.toFixed(2)} ${wallet.currency}` : "••••••"}
              </Typography>
              <IconButton size="small" onClick={() => setShowBalance(!showBalance)} sx={{ color: "white", opacity: 0.8, ml: 1 }}>
                {showBalance ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
          <AccountBalanceWallet sx={{ fontSize: { xs: 40, md: 48 }, opacity: 0.3 }} />
        </Box>

        <Divider sx={{ my: 2, opacity: 0.2, bgcolor: "white" }} />

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 2, mb: 2.5 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mb: 0.5, fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
              Numéro de compte
            </Typography>
            <Typography variant="body1" fontWeight={700} fontSize={{ xs: "0.9rem", md: "1rem" }}>
              {wallet.account_number}
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mb: 0.5, fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
              Téléphone
            </Typography>
            <Typography variant="body1" fontWeight={700} fontSize={{ xs: "0.9rem", md: "1rem" }}>
              {wallet.phone_number}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Payment />}
            size="medium"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              borderRadius: 2,
              flex: 1,
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
            className="animate-fadeInLeft"
          >
            Recharger
          </Button>
          <Button
            variant="contained"
            startIcon={<AccountBalance />}
            size="medium"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              borderRadius: 2,
              flex: 1,
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
            className="animate-fadeInRight"
          >
            Transférer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const ActivityIcon = ({ type }: { type?: string }) => {
  const iconStyle = { fontSize: 20 };
  switch (type?.toLowerCase()) {
    case "delivery":
      return <LocalShipping sx={iconStyle} />;
    case "collection":
      return <Inventory sx={iconStyle} />;
    case "login":
      return <Security sx={iconStyle} />;
    case "error":
      return <ErrorIcon sx={iconStyle} />;
    case "payment":
      return <Payment sx={iconStyle} />;
    default:
      return <History sx={iconStyle} />;
  }
};

const QuickActionCard = ({
  icon,
  title,
  subtitle,
  onClick,
  color = "#0B568C",
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  color?: string;
  delay?: number;
}) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      height: "100%",
      "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      },
    }}
    onClick={onClick}
    className="animate-scaleIn"
    style={{ animationDelay: `${delay * 100}ms` }}
  >
    <CardContent sx={{ p: 3, textAlign: "center" }}>
      <Box
        sx={{
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          borderRadius: 2,
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
        }}
        className="animate-bounce-soft"
      >
        <Box sx={{ color: "white", fontSize: { xs: 24, md: 28 } }}>{icon}</Box>
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 1, color: "#1A4F75", fontSize: { xs: "1rem", md: "1.125rem" } }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#487F9A", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

export default function UserDashboardContent({
  activeTab,
  orders,
  wallet,
  activities,
  notifications,
  onOpenQr,
  onOpenDelete,
  onNavigate,
  isMobile = false,
}: Props) {
  const theme = useTheme();

  return (
    <>
      {/* Tab 0: Tableau de bord */}
      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 6 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                marginTop: { xs: 4, md: 16 },
              }}
            >
              <Box
                sx={{
                  flex: "1 1 220px",
                  minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
                  maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 12px)" },
                }}
              >
                <StatCard title="Commandes" value={orders.length} icon={<LocalShipping />} color="#0B568C" subtitle="Ce mois" trend="up" delay={0} />
              </Box>

              <Box
                sx={{
                  flex: "1 1 220px",
                  minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
                  maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 12px)" },
                }}
              >
                <StatCard title="Activités" value={activities.length} icon={<TrendingUp />} color="#FF9800" subtitle="30 derniers jours" trend="up" delay={1} />
              </Box>

              <Box
                sx={{
                  flex: "1 1 220px",
                  minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "220px" },
                  maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 12px)" },
                }}
              >
                <StatCard
                  title="Notifications"
                  value={notifications.filter((n) => !n.read).length}
                  icon={<Notifications />}
                  color="#9C27B0"
                  subtitle="Non lues"
                  trend="neutral"
                  delay={2}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: "#1A4F75", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
              Actions Rapides
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                gap: 3,
              }}
            >
              {[
                { icon: <LocalShipping />, title: "Nouvelle Commande", subtitle: "Créez une nouvelle commande", onClick: () => onNavigate("/new-order"), color: "#0B568C" },
                { icon: <QrCodeScanner />, title: "Scanner QR", subtitle: "Scanner un code QR", onClick: onOpenQr, color: "#27B1E4" },
                { icon: <Store />, title: "Points de Vente", subtitle: "Voir les points de vente", onClick: () => onNavigate("/points-of-sale"), color: "#FF9800" },
                { icon: <ContactSupport />, title: "Support", subtitle: "Contacter le support", onClick: () => onNavigate("/contact"), color: "#4CAF50" },
                { icon: <ReceiptLong />, title: "Documents", subtitle: "Mes documents", onClick: () => onNavigate("/documents"), color: "#9C27B0" },
                { icon: <Message />, title: "Messages", subtitle: "Voir mes messages", onClick: () => onNavigate("/messages"), color: "#F44336" },
              ].map((action, index) => (
                <QuickActionCard
                  key={index}
                  icon={action.icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  onClick={action.onClick}
                  color={action.color}
                  delay={index}
                />
              ))}
            </Box>
          </Box>

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
              border: "1px solid rgba(11, 86, 140, 0.1)",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
              overflow: "hidden",
            }}
            className="animate-fadeInUp"
          >
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
                background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: { xs: "1.25rem", md: "1.5rem" }, mb: 1 }}>
                    Activités Récentes
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#335F7A", fontWeight: 400, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                    Historique de vos dernières actions
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => onNavigate("/activity")}
                  sx={{
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderWidth: 2,
                    borderColor: "#0B568C",
                    color: "#0B568C",
                    px: 3,
                    py: 1,
                    fontSize: { xs: "0.8rem", md: "0.875rem" },
                    "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                  }}
                >
                  Voir tout
                </Button>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <List>
                {activities.slice(0, 5).map((activity, index) => (
                  <ListItem
                    key={activity.id}
                    sx={{
                      px: 0,
                      py: 2,
                      borderBottom: "1px solid rgba(11, 86, 140, 0.05)",
                      "&:last-child": { borderBottom: "none" },
                    }}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: { xs: 40, md: 48 },
                          height: { xs: 40, md: 48 },
                          bgcolor: "white",
                          color: "#0B568C",
                          border: "2px solid rgba(11, 86, 140, 0.1)",
                        }}
                      >
                        <ActivityIcon type={activity.activity_type} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A4F75", fontSize: { xs: "0.9rem", md: "1rem" } }}>
                          {activity.action || activity.activity_type}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ color: "#487F9A", mb: 0.5, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            {activity.details ? JSON.stringify(activity.details) : "Pas de détails"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#335F7A", fontWeight: 600, fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
                            {activity.created_at && new Date(activity.created_at).toLocaleString("fr-FR")}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Card>
        </>
      )}

      {/* Tab 1: Portefeuille */}
      {activeTab === 1 && (
        <Box sx={{ marginTop: { xs: 4, md: 16 } }}>
          <WalletCard wallet={wallet} isMobile={isMobile} />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, mt: 4 }}>
            <Card
              sx={{
                flex: 1,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                border: "1px solid rgba(11, 86, 140, 0.1)",
                background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
              }}
              className="animate-fadeInLeft"
            >
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
                }}
              >
                <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                  Transactions Récentes
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <List>
                  {[
                    { id: 1, type: "Recharge", amount: 100000, date: "15/03/2024", status: "success" },
                    { id: 2, type: "Paiement", amount: -25000, date: "14/03/2024", status: "success" },
                    { id: 3, type: "Transfert", amount: -50000, date: "13/03/2024", status: "pending" },
                  ].map((tx, index) => (
                    <ListItem
                      key={tx.id}
                      sx={{
                        px: 0,
                        py: 2,
                        borderBottom: "1px solid rgba(11, 86, 140, 0.05)",
                        "&:last-child": { borderBottom: "none" },
                      }}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: { xs: 40, md: 48 },
                            height: { xs: 40, md: 48 },
                            bgcolor: tx.amount > 0 ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                            color: tx.amount > 0 ? "#4CAF50" : "#F44336",
                          }}
                        >
                          {tx.amount > 0 ? "+" : "-"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A4F75", fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            {tx.type}
                          </Typography>
                        }
                        secondary={<Typography variant="body2" sx={{ color: "#487F9A", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>{tx.date}</Typography>}
                      />
                      <Typography variant="h6" fontWeight={800} color={tx.amount > 0 ? "success.main" : "error.main"} fontSize={{ xs: "0.9rem", md: "1rem" }}>
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()} {wallet.currency}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Card>

            <Box sx={{ width: { xs: "100%", md: "35%" } }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  mb: 3,
                }}
                className="animate-fadeInRight"
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderBottom: "1px solid rgba(11, 86, 140, 0.1)",
                    background: "linear-gradient(135deg, rgba(11, 86, 140, 0.05) 0%, rgba(11, 86, 140, 0.02) 100%)",
                  }}
                >
                  <Typography variant="h5" sx={{ color: "#1A4F75", fontWeight: 800, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                    Actions
                  </Typography>
                </Box>
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<Payment />}
                      fullWidth
                      sx={{
                        py: { xs: 1.25, md: 2 },
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                        "&:hover": { background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)" },
                      }}
                    >
                      Recharger le portefeuille
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AccountBalance />}
                      fullWidth
                      sx={{
                        py: { xs: 1.25, md: 2 },
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#0B568C",
                        color: "#0B568C",
                        "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                      }}
                    >
                      Transférer de l'argent
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowForward />}
                      fullWidth
                      sx={{
                        py: { xs: 1.25, md: 2 },
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#487F9A",
                        color: "#487F9A",
                        "&:hover": { borderWidth: 2, borderColor: "#335F7A", backgroundColor: alpha("#487F9A", 0.05) },
                      }}
                    >
                      Exporter l'historique
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      {/* Tab 2: Commandes */}
      {activeTab === 2 && (
        <Box sx={{ marginTop: { xs: 4, md: 16 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 3,
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: "#1A4F75", mb: 1, fontSize: { xs: "1.5rem", md: "2rem" } }}>
                Mes Commandes
              </Typography>
              <Typography variant="body1" sx={{ color: "#487F9A", fontSize: { xs: "0.9rem", md: "1rem" } }}>
                Suivez l'état de vos commandes en cours et passées
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => onNavigate("/new-order")}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 },
                background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                boxShadow: "0 8px 24px rgba(11, 86, 140, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)",
                  boxShadow: "0 12px 32px rgba(10, 52, 95, 0.6)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                fontSize: { xs: "0.8rem", md: "0.875rem" },
              }}
              className="animate-bounce-soft"
            >
              Nouvelle commande
            </Button>
          </Box>

          <Box sx={{ display: "grid", gap: 3 }}>
            {orders.map((order, index) => (
              <Card
                key={order.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 12px 40px rgba(10, 52, 95, 0.15)" },
                }}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "flex-start", md: "center" },
                      justifyContent: "space-between",
                      gap: 3,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ color: "#1A4F75", mb: 1, fontSize: { xs: "1rem", md: "1.125rem" } }}>
                        Commande #{order.order_number}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#487F9A", mb: 1, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                        {order.delivery_address || "Adresse non spécifiée"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#335F7A", display: "block", fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
                        {new Date(order.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: { xs: "flex-start", md: "flex-end" },
                        gap: 2,
                        width: { xs: "100%", md: "auto" },
                      }}
                    >
                      <Chip
                        label={order.status}
                        size="medium"
                        sx={{
                          fontWeight: 800,
                          borderRadius: 2,
                          fontSize: { xs: "0.7rem", md: "0.75rem" },
                          backgroundColor:
                            order.status === "delivered"
                              ? alpha("#4CAF50", 0.1)
                              : order.status === "pending"
                              ? alpha("#FF9800", 0.1)
                              : order.status === "cancelled"
                              ? alpha("#F44336", 0.1)
                              : alpha("#0B568C", 0.1),
                          color:
                            order.status === "delivered"
                              ? "#4CAF50"
                              : order.status === "pending"
                              ? "#FF9800"
                              : order.status === "cancelled"
                              ? "#F44336"
                              : "#0B568C",
                        }}
                      />

                      <Typography variant="h5" fontWeight={900} sx={{ color: "#1A4F75", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                        {order.total_amount.toLocaleString()} {wallet.currency}
                      </Typography>

                      <Button
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        onClick={() => onNavigate(`/orders/${order.id}`)}
                        sx={{
                          borderRadius: "50px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderWidth: 2,
                          borderColor: "#0B568C",
                          color: "#0B568C",
                          px: 3,
                          py: 1,
                          fontSize: { xs: "0.8rem", md: "0.875rem" },
                          "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                        }}
                      >
                        Voir détails
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Tab 3: Points de vente */}
      {activeTab === 3 && (
        <Box sx={{ marginTop: { xs: 4, md: 10 } }}>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#1A4F75", mb: 4, fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Points de Vente
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: { xs: 3, md: 4 },
            }}
          >
            {[
              { id: 1, name: "Supermarché Buja", address: "Bujumbura Mairie", status: "ouvert", rating: 4.5 },
              { id: 2, name: "Magasin Gitega", address: "Gitega Centre", status: "ouvert", rating: 4.2 },
              { id: 3, name: "Boutique Ngozi", address: "Ngozi Ville", status: "fermé", rating: 4.0 },
              { id: 4, name: "Epicerie Kayanza", address: "Kayanza Centre", status: "ouvert", rating: 4.3 },
              { id: 5, name: "Boutique Muyinga", address: "Muyinga Ville", status: "ouvert", rating: 4.1 },
              { id: 6, name: "Superette Rumonge", address: "Rumonge Port", status: "fermé", rating: 3.9 },
            ].map((pdv, index) => (
              <Card
                key={pdv.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(10, 52, 95, 0.1)",
                  border: "1px solid rgba(11, 86, 140, 0.1)",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(10, 52, 95, 0.15)" },
                }}
                onClick={() => onNavigate(`/points-of-sale/${pdv.id}`)}
                className="animate-scaleIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: { xs: 50, md: 60 },
                        height: { xs: 50, md: 60 },
                        bgcolor: "white",
                        color: "#0B568C",
                        border: "2px solid rgba(11, 86, 140, 0.1)",
                        boxShadow: "0 4px 12px rgba(11, 86, 140, 0.1)",
                      }}
                    >
                      <Store sx={{ fontSize: { xs: 24, md: 28 } }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ color: "#1A4F75", fontSize: { xs: "1rem", md: "1.125rem" } }}>
                        {pdv.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#487F9A", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                        {pdv.address}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Chip
                      label={pdv.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        fontSize: { xs: "0.7rem", md: "0.75rem" },
                        backgroundColor: pdv.status === "ouvert" ? alpha("#4CAF50", 0.1) : alpha("#F44336", 0.1),
                        color: pdv.status === "ouvert" ? "#4CAF50" : "#F44336",
                      }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Star sx={{ fontSize: { xs: 14, md: 16 }, color: "#FF9800" }} />
                      <Typography variant="body2" fontWeight={700} sx={{ color: "#1A4F75", fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                        {pdv.rating}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    sx={{
                      mt: 2,
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderWidth: 2,
                      borderColor: "#0B568C",
                      color: "#0B568C",
                      py: { xs: 0.75, md: 1 },
                      fontSize: { xs: "0.8rem", md: "0.875rem" },
                      "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
                    }}
                  >
                    Voir détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Tab 4: Profil - MODIFIÉ pour afficher le composant UserProfileView adapté */}
      {activeTab === 4 && (
        <Box
          sx={{
            marginTop: { xs: 4, md: 0 },
            width: "100%",
          }}
        >
          {/* Utilisation du composant UserProfileView adapté au style dashboard */}
          <UserProfileView isInDashboard={true} />
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: `1px dashed ${alpha("#487F9A", 0.3)}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
        className="animate-fadeIn"
      >
        <Typography
          variant="caption"
          sx={{
            color: "#487F9A",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: { xs: "0.7rem", md: "0.75rem" },
          }}
        >
          <AccessTime sx={{ fontSize: { xs: 12, md: 14 } }} />
          Système sécurisé • Données actualisées en temps réel
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#487F9A",
            fontSize: { xs: "0.7rem", md: "0.75rem" },
          }}
        >
          © {new Date().getFullYear()} SeaSky • support@seasky.com
        </Typography>
      </Box>
    </>
  );
}

// Helpers
function userSafe(v: any, fallback: string) {
  return typeof v === "string" && v.trim() ? v : fallback;
}
function userFriendlyUpper(v: string) {
  return (v || "").toUpperCase();
}
function userFieldValue(obj: any, field: string) {
  try {
    return obj?.[field];
  } catch {
    return undefined;
  }
} et // ========================= src/pages/profile/UserProfilePage.tsx =========================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, CircularProgress, Alert, alpha, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { RootState } from "../../store/store";

// ✅ réutilise tes composants Dashboard (même design/animations)
import UserDashboardHeader from "../../pages/dashboards/UserDashboardHeader";
import MobileNavigationMenu from "../../pages/dashboards/MobileNavigationMenu";

// ✅ le vrai contenu profil (découpé)
import UserProfileView from "./UserProfileView";

export default function UserProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const auth = useSelector((state: RootState) => state.auth);
  const user = (auth as any)?.user;

  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // On "force" l'onglet Profil (index 4 comme dans ton UserDashboard)
  const [activeTab, setActiveTab] = useState(4);

  const [error, setError] = useState<string | null>(null);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(!isMobile);

  const [notifications] = useState<any[]>([
    { id: 1, title: "Profil", message: "Mettez à jour vos informations", time: "—", read: false },
  ]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const title = useMemo(() => {
    const name = user?.full_name || user?.username || "Collaborateur";
    return `${greeting}, ${String(name).split(" ")[0]}`;
  }, [user, greeting]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrollTop = contentRef.current.scrollTop;

      if (isMobile) {
        if (scrollTop > 50) {
          setIsHeaderExpanded(false);
          if (scrollTop > 200) setShowBackToTop(true);
        } else {
          setIsHeaderExpanded(true);
          setShowBackToTop(false);
        }
      } else {
        if (scrollTop > 100) {
          setIsHeaderExpanded(false);
          if (scrollTop > 300) setShowBackToTop(true);
        } else {
          setIsHeaderExpanded(true);
          setShowBackToTop(false);
        }
      }
    };

    const el = contentRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [isMobile]);

  useEffect(() => {
    setIsHeaderExpanded(!isMobile);
  }, [isMobile]);

  const loading = false;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" className="animate-fadeIn">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: alpha(theme.palette.primary.light, 0.02),
        position: "relative",
        mt: isMobile ? 8 : 12,
      }}
      className="animate-scaleIn"
    >
      <UserDashboardHeader
        title={title}
        user={user}
        theme={theme}
        isMobile={isMobile}
        isHeaderExpanded={isHeaderExpanded}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lastUpdated={null}
        refreshing={false}
        onRefresh={() => {
          contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }}
        notifications={notifications}
        onGoSettings={() => navigate("/settings")}
        onGoProfile={() => setActiveTab(4)}
        ordersCount={0}
        onOpenMobileMenu={() => {}}
      />

      <Box
        ref={contentRef}
        sx={{
          height: "100vh",
          overflow: "auto",
          pt: isMobile ? (isHeaderExpanded ? "180px" : "120px") : (isHeaderExpanded ? "250px" : "200px"),
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          pb: isMobile ? 8 : 4,
          WebkitOverflowScrolling: "touch",
        }}
        className="mobile-optimized-scroll"
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 14,
              mb: 4,
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(244, 67, 54, 0.15)",
              border: "1px solid rgba(244, 67, 54, 0.2)",
              backgroundColor: "rgba(244, 67, 54, 0.05)",
              "& .MuiAlert-icon": { fontSize: 28 },
            }}
            onClose={() => setError(null)}
            className="animate-fadeInUp"
          >
            {error}
          </Alert>
        )}

        {/* ✅ Ton profil, mais rendu "dans" le dashboard */}
        <UserProfileView isInDashboard />
      </Box>

      <MobileNavigationMenu
        open={false}
        onClose={() => {}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={navigate}
        notificationsCount={notifications.filter((n) => !n.read).length}
      />

      {showBackToTop && (
        <button
          onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: isMobile ? 80 : 24,
            right: isMobile ? 16 : 24,
            borderRadius: "9999px",
            width: isMobile ? 44 : 40,
            height: isMobile ? 44 : 40,
            background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
            boxShadow: "0 8px 24px rgba(11, 86, 140, 0.4)",
            color: "#fff",
            zIndex: 9998,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="animate-fadeIn"
          aria-label="Back to top"
          title="Retour en haut"
        >
          ↑
        </button>
      )}
    </Box>
  );
} et // ========================= src/pages/profile/userProfileParts.tsx =========================
import React from "react";
import { SeaSkyColors } from "../../styles/colors";
import Cropper from "react-easy-crop";
import type { ExtendedUserRegistrationData } from "../../pages/types/auth.types";

// ------------------------- Types -------------------------
export interface ProfileTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed?: boolean;
}

export interface UserDocumentItem {
  id: number;
  document_type: string;
  file: string;
  file_name?: string;
  description?: string;
  uploaded_at?: string;
  verified?: boolean;
  expiry_date?: string | null;
}

export type Area = { x: number; y: number; width: number; height: number };

// ------------------------- Utils -------------------------
export function toStr(v: any, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

export function toBool(v: any, fallback = false): boolean {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return Boolean(v);
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(s)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(s)) return false;
  }
  return fallback;
}

export function toArr(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === "") return [];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [v];
    }
  }
  return [v];
}

export function safeDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function initialsFrom(user?: { full_name?: string; username?: string }) {
  const name = (user?.full_name || user?.username || "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / (3600 * 24));
  const hours = Math.floor((total % (3600 * 24)) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}j ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function pickPhotoUrl(u: any): string {
  return (
    toStr(u?.photo_url) ||
    toStr(u?.avatar_url) ||
    toStr(u?.photo) ||
    toStr(u?.profile_photo_url) ||
    toStr(u?.image_url) ||
    ""
  );
}

export function pickAccountCreatedAt(u: any): Date | null {
  return safeDate(u?.created_at) || safeDate(u?.date_joined) || null;
}

export function hasValue(v: any) {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

export function isPdfUrl(url: string) {
  const u = (url || "").toLowerCase();
  return u.includes(".pdf") || u.startsWith("data:application/pdf");
}

export function guessDocLabel(doc: UserDocumentItem): string {
  const type = toStr(doc?.document_type);
  const name = toStr(doc?.file_name);
  const desc = toStr(doc?.description);
  return desc || name || type || "Document";
}

export function getAccountSubtypeLabel(u: any): string {
  const fromBackend = toStr(u?.account_category_label).trim();
  if (fromBackend) return fromBackend;

  const accountType = toStr(u?.account_type).toLowerCase();
  if (accountType === "client") return toStr(u?.client_type).trim() || "";
  if (accountType === "fournisseur") return toStr(u?.supplier_type).trim() || "";
  if (accountType === "livreur") return toStr(u?.delivery_type).trim() || "";
  if (accountType === "commercant") return toStr(u?.boutique_type).trim() || "";
  return "";
}

export function getAccountTypeLabel(u: any): string {
  const backendLabel = toStr(u?.account_type_label).trim();
  if (backendLabel) return backendLabel.toUpperCase();
  const t = toStr(u?.account_type).trim();
  return t ? t.toUpperCase() : "";
}

export function formatLabelTitleCase(s: string) {
  const v = (s || "").trim();
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export function formatGender(v: any) {
  const g = toStr(v).trim().toLowerCase();
  if (!g) return "";
  if (["m", "male", "homme"].includes(g)) return "Homme";
  if (["f", "female", "femme"].includes(g)) return "Femme";
  return toStr(v);
}

export function formatDateFr(v: any) {
  const s = toStr(v).trim();
  if (!s) return "";
  const d = safeDate(s);
  if (!d) return s;
  try {
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return s;
  }
}

// ------------------------- Crop helpers -------------------------
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

export async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Crop failed"));
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

export function blobToFile(blob: Blob, filename: string) {
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

// ------------------------- UI atoms -------------------------
export function StatusBadge({
  tone,
  label,
  rightIcon,
}: {
  tone: "green" | "yellow" | "red" | "blue" | "gray";
  label: string;
  rightIcon?: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border backdrop-blur-sm";

  const styles: Record<string, string> = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    yellow: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-sky-50 border-sky-200 text-sky-800",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  return (
    <span className={`${base} ${styles[tone]}`}>
      {label}
      {rightIcon ? <span className="opacity-95">{rightIcon}</span> : null}
    </span>
  );
}

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  const steel = SeaSkyColors.steelBlue || "#335F7A";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm border text-white"
      style={{ backgroundColor: steel, borderColor: steel }}
    >
      <span>{label}</span>
      <svg className="h-3.5 w-3.5" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 4l6 7 9-2 3 9 9 3-2 9 7 6-7 6 2 9-9 3-3 9-9-2-6 7-6-7-9 2-3-9-9-3 2-9-7-6 7-6-2-9 9-3 3-9 9 2 6-7z"
          fill="#E4F5FB"
        />
        <path d="M26.5 35.5l-6-6 3-3 3 3 14-14 3 3-17 17z" fill="#1A4F75" />
      </svg>
    </span>
  );
}

export function StepStateBadge({ completed }: { completed: boolean }) {
  return completed ? <VerifiedBadge label="✓" /> : <StatusBadge tone="red" label="•" />;
}

export function DocPreviewCard({
  title,
  url,
  meta,
}: {
  title: string;
  url?: string;
  meta?: React.ReactNode;
}) {
  if (!url) return null;
  const pdf = isPdfUrl(url);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-shadow duration-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-between gap-3">
        <span className="truncate">{title}</span>
        {meta ? <span className="shrink-0">{meta}</span> : null}
      </div>

      <div className="p-4">
        {pdf ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(228,245,251,0.9)" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: SeaSkyColors.brandBlue }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8M8 17h8" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate">PDF</div>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold underline"
                  style={{ color: SeaSkyColors.brandBlue }}
                >
                  Ouvrir
                </a>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={url}
            alt={title}
            className="w-full h-40 object-cover rounded-xl border border-gray-200"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

export function PhoneCallButton({ phone }: { phone?: string }) {
  const clean = (phone || "").trim();
  if (!clean) return null;

  return (
    <a
      href={`tel:${clean}`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-xl border shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5"
      style={{
        borderColor: SeaSkyColors.brandBlue,
        backgroundColor: "rgba(228,245,251,0.9)",
        color: SeaSkyColors.brandBlue,
      }}
      title="Appeler"
      aria-label="Appeler"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.11a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

// Buttons
export function HeroPrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-4 py-2" : "px-5 py-2.5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white rounded-full font-semibold",
        "hover:from-[#1A4F75] hover:to-[#0B568C]",
        "transition-all duration-200 flex items-center gap-2 group shadow hover:shadow-md transform hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "justify-center",
        padding,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function HeroOutlineButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-4 py-2" : "px-5 py-2.5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "border-2 border-[#0B568C] text-[#0B568C] rounded-full font-semibold",
        "hover:bg-[#0B568C] hover:text-white",
        "transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow transform hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "justify-center",
        padding,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function InlineCountdown({ remainingMs }: { remainingMs: number }) {
  return (
    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-red-700 shadow-sm">
      {formatDuration(remainingMs)}
    </span>
  );
}

export function ProfileStepCard({
  label,
  completed,
  active,
  onClick,
  disabled,
}: {
  label: string;
  completed: boolean;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const steel = SeaSkyColors.steelBlue || "#335F7A";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 w-full border ${
        active ? "bg-white shadow-sm ring-2 ring-[#27B1E4]/50" : "bg-white/80 backdrop-blur-sm hover:shadow-sm"
      } ${disabled ? "opacity-50 cursor-not-allowed hover:shadow-none" : ""}`}
      style={{ borderColor: active ? SeaSkyColors.brandBlue : "#E5E7EB" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: completed ? "rgba(51,95,122,0.12)" : active ? "rgba(39,177,228,0.15)" : "rgba(243,244,246,0.8)",
          color: completed ? steel : active ? SeaSkyColors.brandBlue : SeaSkyColors.gray,
        }}
      >
        {completed ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="text-sm font-bold">{label.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold truncate" style={{ color: active ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue }}>
            {label}
          </span>
          <StepStateBadge completed={Boolean(completed)} />
        </div>
      </div>
    </button>
  );
}

// ------------------------- Data Display Components -------------------------
export function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: SeaSkyColors.steelBlue }}>
        {label}
      </div>
      <div className="text-sm font-medium" style={{ color: SeaSkyColors.inkBlue }}>
        {value || "—"}
      </div>
    </div>
  );
}

export function PersonalInfoDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Nom Complet" value={toStr((formData as any).full_name)} />
      <DataField label="Nom d'utilisateur" value={toStr((formData as any).username)} />
      <DataField label="Email" value={toStr((formData as any).email)} />
      <DataField label="Téléphone" value={toStr((formData as any).phone)} />
      <DataField label="Genre" value={formatGender((formData as any).gender)} />
      <DataField label="Date de naissance" value={formatDateFr((formData as any).date_of_birth)} />
      <DataField label="Nationalité" value={toStr((formData as any).nationality)} />
      <DataField label="Numéro Lumicash" value={toStr((formData as any).lumicash_msisdn)} />
    </div>
  );
}

export function AddressDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Adresse" value={toStr((formData as any).address_line)} />
      <DataField label="Province" value={toStr((formData as any).province)} />
      <DataField label="Commune" value={toStr((formData as any).commune)} />
      <DataField label="Colline/Quartier" value={toStr((formData as any).colline_or_quartier)} />
      <DataField label="Contact d'urgence" value={toStr((formData as any).emergency_contact_name)} />
      <DataField label="Tél d'urgence" value={toStr((formData as any).emergency_contact_phone)} />
      <DataField label="Relation" value={toStr((formData as any).emergency_contact_relationship)} />
    </div>
  );
}

export function IdentityDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Type de pièce" value={toStr((formData as any).id_type)} />
      <DataField label="Numéro" value={toStr((formData as any).id_number)} />
      <DataField label="Date d'émission" value={formatDateFr((formData as any).id_issue_date)} />
      <DataField label="Date d'expiration" value={formatDateFr((formData as any).id_expiry_date)} />
      <DataField label="Pas d'expiration" value={(formData as any).id_no_expiry ? "Oui" : "Non"} />
    </div>
  );
}

export function BoutiqueDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  const services = (formData as any).boutique_services;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Type de boutique" value={toStr((formData as any).boutique_type)} />
      <DataField label="Services" value={Array.isArray(services) ? services.join(", ") : ""} />
      <DataField label="Horaires préférés" value={toStr((formData as any).preferred_delivery_time)} />
      <DataField label="Instructions de livraison" value={toStr((formData as any).delivery_instructions)} />
    </div>
  );
}

export function DeliveryDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Véhicule" value={toStr((formData as any).delivery_vehicle)} />
      <DataField label="Immatriculation" value={toStr((formData as any).vehicle_registration)} />
      <DataField label="Horaire préféré" value={toStr((formData as any).preferred_delivery_time)} />
      <DataField label="Instructions" value={toStr((formData as any).delivery_instructions)} />
    </div>
  );
}

export function BusinessDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Nom de l'entreprise" value={toStr((formData as any).business_name)} />
      <DataField label="Type d'entité" value={toStr((formData as any).business_entity_type)} />
      <DataField label="Numéro d'enregistrement" value={toStr((formData as any).business_registration_number)} />
      <DataField label="Numéro fiscal" value={toStr((formData as any).business_tax_id)} />
      <DataField label="Date d'expiration" value={formatDateFr((formData as any).business_doc_expiry_date)} />
    </div>
  );
}

// ------------------------- Dashboard Profile Header -------------------------
export function DashboardProfileHeader({
  user,
  profilePhotoPreview,
  initialsFrom,
  accountTypeLabel,
  accountSubtypeLabel,
  kycStatusLabel,
  kycTone,
  isEditingAnything,
  toggleEditAll,
  isLoading,
  handleSave,
  allowEditThisTab,
  editMode,
  activeTab,
}: {
  user: any;
  profilePhotoPreview: string;
  initialsFrom: (user?: { full_name?: string; username?: string }) => string;
  accountTypeLabel: string;
  accountSubtypeLabel: string;
  kycStatusLabel: string;
  kycTone: "green" | "yellow" | "red" | "blue" | "gray";
  isEditingAnything: boolean;
  toggleEditAll: () => void;
  isLoading: boolean;
  handleSave: () => Promise<void>;
  allowEditThisTab: boolean;
  editMode: Record<string, boolean>;
  activeTab: string;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden mb-6 animate-fadeIn">
      <div className="px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white">
                {profilePhotoPreview ? (
                  <img src={profilePhotoPreview} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  initialsFrom(user || undefined)
                )}
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-[#1A4F75] mb-1">
                {user?.full_name || user?.username || "Mon Profil"}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {user?.account_type && (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#F0F7FF] text-[#0B568C] text-xs font-semibold">
                    {accountTypeLabel}
                  </span>
                )}
                {accountSubtypeLabel && (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#E4F5FB] text-[#27B1E4] text-xs font-semibold">
                    {accountSubtypeLabel}
                  </span>
                )}
                <StatusBadge tone={kycTone} label={kycStatusLabel} />
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#487F9A]">
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {user.email}
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.11a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <HeroOutlineButton
              onClick={toggleEditAll}
              size="sm"
              disabled={editMode[activeTab] ? false : false}
              className="min-w-[120px]"
            >
              {isEditingAnything ? "Annuler" : "Modifier"}
            </HeroOutlineButton>

            <HeroPrimaryButton
              onClick={handleSave}
              disabled={isLoading || !allowEditThisTab}
              size="sm"
              className="min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </span>
              ) : (
                "Enregistrer"
              )}
            </HeroPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------- Modal documents (KYC/KYB) -------------------------
export function DocumentsModal({
  open,
  onClose,
  kycDocs,
  kybDocs,
  active,
  setActive,
  docsLocked,
  onGoEditKyc,
  onGoEditKyb,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  kycDocs: UserDocumentItem[];
  kybDocs: UserDocumentItem[];
  active: "kyc" | "kyb";
  setActive: (v: "kyc" | "kyb") => void;
  docsLocked: boolean;
  onGoEditKyc: () => void;
  onGoEditKyb: () => void;
  onRefresh: () => Promise<void> | void;
}) {
  if (!open) return null;

  const tabBtn = (id: "kyc" | "kyb", label: string, count: number) => {
    const isActive = active === id;
    return (
      <button
        type="button"
        onClick={() => setActive(id)}
        className={[
          "px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200",
          isActive ? "bg-white shadow-sm" : "bg-gray-50 hover:bg-white",
        ].join(" ")}
        style={{
          borderColor: isActive ? SeaSkyColors.brandBlue : "#E5E7EB",
          color: isActive ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue,
        }}
      >
        {label} <span className="ml-2 text-xs font-extrabold">({count})</span>
      </button>
    );
  };

  const list = active === "kyc" ? kycDocs : kybDocs;
  const title = active === "kyc" ? "Documents KYC (Identité)" : "Documents KYB (Entreprise)";
  const emptyLabel = active === "kyc" ? "Aucun document KYC" : "Aucun document KYB";

  const docMeta = (d: UserDocumentItem) => {
    if (docsLocked) return <VerifiedBadge label="Validated" />;
    return d.verified ? <VerifiedBadge label="Verified" /> : <StatusBadge tone="yellow" label="En attente" />;
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-extrabold" style={{ color: SeaSkyColors.inkBlue }}>
                  Mes documents
                </h3>
                <p className="text-sm mt-1" style={{ color: SeaSkyColors.steelBlue }}>
                  {docsLocked
                    ? "Lecture seule : délai terminé / documents verrouillés."
                    : "Vous pouvez encore modifier avant la fin du délai."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50"
                style={{ borderColor: "rgba(11,86,140,0.2)" }}
                aria-label="Fermer"
                title="Fermer"
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: SeaSkyColors.brandBlue }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M18 6L6 18" strokeLinecap="round" />
                  <path d="M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {tabBtn("kyc", "KYC", kycDocs.length)}
              {tabBtn("kyb", "KYB", kybDocs.length)}

              <div className="ml-auto flex flex-wrap gap-2 w-full sm:w-auto">
                <HeroOutlineButton size="sm" onClick={() => onRefresh?.()}>
                  Actualiser
                </HeroOutlineButton>

                {!docsLocked && active === "kyc" ? (
                  <HeroOutlineButton
                    size="sm"
                    onClick={() => {
                      onClose();
                      onGoEditKyc();
                    }}
                  >
                    Modifier KYC
                  </HeroOutlineButton>
                ) : null}

                {!docsLocked && active === "kyb" ? (
                  <HeroOutlineButton
                    size="sm"
                    onClick={() => {
                      onClose();
                      onGoEditKyb();
                    }}
                  >
                    Modifier KYB
                  </HeroOutlineButton>
                ) : null}
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5 max-h-[70vh] overflow-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="font-bold" style={{ color: SeaSkyColors.inkBlue }}>
                {title}
              </div>
              {docsLocked ? <StatusBadge tone="red" label="Lecture seule" /> : <StatusBadge tone="blue" label="Éditable" />}
            </div>

            {list.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                <div className="text-sm font-semibold text-gray-600">{emptyLabel}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {list.map((d) => (
                  <DocPreviewCard key={d.id} title={guessDocLabel(d)} url={toStr(d.file)} meta={docMeta(d)} />
                ))}
              </div>
            )}
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div className="text-xs" style={{ color: SeaSkyColors.steelBlue }}>
              Astuce: après modification, fermez puis rouvrez le modal (ou cliquez "Actualiser").
            </div>
            <HeroPrimaryButton size="sm" onClick={onClose}>
              Fermer
            </HeroPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------- Crop modal -------------------------
export function CropPhotoModal({
  open,
  onClose,
  cropImageSrc,
  crop,
  setCrop,
  zoom,
  setZoom,
  onCropComplete,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  cropImageSrc: string;
  crop: { x: number; y: number };
  setCrop: (v: { x: number; y: number }) => void;
  zoom: number;
  setZoom: (v: number) => void;
  onCropComplete: (a: any, b: any) => void;
  onApply: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      <div
        className="absolute inset-0 bg-black/50"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold" style={{ color: SeaSkyColors.inkBlue }}>
                Ajuster la photo
              </h3>
              <p className="text-sm mt-1" style={{ color: SeaSkyColors.steelBlue }}>
                Glissez pour déplacer l'image, puis zoomez pour ajuster.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50"
              style={{ borderColor: "rgba(11,86,140,0.2)" }}
              aria-label="Fermer"
            >
              <svg
                className="w-5 h-5"
                style={{ color: SeaSkyColors.brandBlue }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M18 6L6 18" strokeLinecap="round" />
                <path d="M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-5 sm:px-6 py-5">
            <div
              className="relative w-full h-[340px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 touch-none"
              style={{ touchAction: "none" }}
            >
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition={false}
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: SeaSkyColors.inkBlue }}>
                  Zoom
                </span>
                <span className="text-xs font-semibold" style={{ color: SeaSkyColors.steelBlue }}>
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full mt-2"
              />

              <div className="mt-3 text-xs" style={{ color: SeaSkyColors.steelBlue }}>
                Astuce: maintenez le clic gauche et glissez pour déplacer.
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <HeroOutlineButton size="sm" onClick={onClose}>
              Annuler
            </HeroOutlineButton>

            <HeroPrimaryButton size="sm" onClick={onApply}>
              Appliquer
            </HeroPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
} et // ========================= src/pages/profile/UserProfileUI.tsx =========================
import React from "react";
import { SeaSkyColors } from "../../styles/colors";

// ------------------------- Badges et Boutons -------------------------
export function StatusBadge({
  tone,
  label,
  rightIcon,
}: {
  tone: "green" | "yellow" | "red" | "blue" | "gray";
  label: string;
  rightIcon?: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border backdrop-blur-sm transition-all duration-200";

  const styles: Record<string, string> = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    yellow: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-sky-50 border-sky-200 text-sky-800",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  return (
    <span className={`${base} ${styles[tone]} animate-fadeIn`}>
      {label}
      {rightIcon ? <span className="opacity-95">{rightIcon}</span> : null}
    </span>
  );
}

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  const steel = SeaSkyColors.steelBlue || "#335F7A";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm border text-white animate-fadeIn"
      style={{ backgroundColor: steel, borderColor: steel }}
    >
      <span>{label}</span>
      <svg className="h-3.5 w-3.5" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 4l6 7 9-2 3 9 9 3-2 9 7 6-7 6 2 9-9 3-3 9-9-2-6 7-6-7-9 2-3-9-9-3 2-9-7-6 7-6-2-9 9-3 3-9 9 2 6-7z"
          fill="#E4F5FB"
        />
        <path d="M26.5 35.5l-6-6 3-3 3 3 14-14 3 3-17 17z" fill="#1A4F75" />
      </svg>
    </span>
  );
}

export function StepStateBadge({ completed }: { completed: boolean }) {
  return completed ? <VerifiedBadge label="✓" /> : <StatusBadge tone="red" label="•" />;
}

export function PhoneCallButton({ phone }: { phone?: string }) {
  const clean = (phone || "").trim();
  if (!clean) return null;

  return (
    <a
      href={`tel:${clean}`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-xl border shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5 animate-fadeIn"
      style={{
        borderColor: SeaSkyColors.brandBlue,
        backgroundColor: "rgba(228,245,251,0.9)",
        color: SeaSkyColors.brandBlue,
      }}
      title="Appeler"
      aria-label="Appeler"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.11a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

export function HeroPrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-4 py-2" : "px-5 py-2.5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white rounded-full font-semibold",
        "hover:from-[#1A4F75] hover:to-[#0B568C]",
        "transition-all duration-200 flex items-center gap-2 group shadow hover:shadow-md transform hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "justify-center animate-fadeIn",
        padding,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function HeroOutlineButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-4 py-2" : "px-5 py-2.5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "border-2 border-[#0B568C] text-[#0B568C] rounded-full font-semibold",
        "hover:bg-[#0B568C] hover:text-white",
        "transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow transform hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "justify-center animate-fadeIn",
        padding,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function InlineCountdown({ remainingMs }: { remainingMs: number }) {
  return (
    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-red-700 shadow-sm animate-pulse">
      {formatDuration(remainingMs)}
    </span>
  );
}

export function ProfileStepCard({
  label,
  completed,
  active,
  onClick,
  disabled,
}: {
  label: string;
  completed: boolean;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const steel = SeaSkyColors.steelBlue || "#335F7A";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 w-full border ${
        active ? "bg-white shadow-sm ring-2 ring-[#27B1E4]/50" : "bg-white/80 backdrop-blur-sm hover:shadow-sm"
      } ${disabled ? "opacity-50 cursor-not-allowed hover:shadow-none" : ""} animate-fadeIn`}
      style={{ borderColor: active ? SeaSkyColors.brandBlue : "#E5E7EB" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          background: completed ? "rgba(51,95,122,0.12)" : active ? "rgba(39,177,228,0.15)" : "rgba(243,244,246,0.8)",
          color: completed ? steel : active ? SeaSkyColors.brandBlue : SeaSkyColors.gray,
        }}
      >
        {completed ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="text-sm font-bold">{label.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-sm font-bold truncate"
            style={{ color: active ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue }}
          >
            {label}
          </span>
          <StepStateBadge completed={Boolean(completed)} />
        </div>
      </div>
    </button>
  );
}

// ------------------------- Utils -------------------------
function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / (3600 * 24));
  const hours = Math.floor((total % (3600 * 24)) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}j ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
} et // ========================= src/pages/profile/UserProfileView.tsx =========================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { RootState, updateProfile } from "../../store/store";
import { getCurrentUser, updateUserProfile, type UserProfile as ApiUserProfile } from "../../api/client";

import AlertBanner from "../../components/ui/AlertBanner";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

// Forms
import RegisterPersonalInfoForm from "../../components/auth/RegisterPersonalInfoForm";
import RegisterAddressForm from "../../components/auth/RegisterAddressForm";
import RegisterIdentityVerificationForm from "../../components/auth/RegisterIdentityVerificationForm";
import RegisterBusinessDocuments from "../../components/auth/RegisterBusinessDocuments";
import RegisterDeliveryInfo from "../../components/auth/RegisterDeliveryInfo";
import RegisterBoutiqueInfoForm from "../../components/auth/RegisterBoutiqueInfoForm";

// Types
import {
  ExtendedUserRegistrationData,
  FormValidationErrors,
  InputChangeHandler,
  FileChangeHandler,
  ArrayChangeHandler,
  CheckboxChangeHandler,
  RegistrationStepProps,
} from "../../pages/types/auth.types";

import { SeaSkyColors } from "../../styles/colors";

import {
  // types
  Area,
  ProfileTab,
  UserDocumentItem,
  // utils
  toStr,
  toBool,
  toArr,
  safeDate,
  initialsFrom,
  pickPhotoUrl,
  pickAccountCreatedAt,
  hasValue,
  getAccountSubtypeLabel,
  getAccountTypeLabel,
  formatLabelTitleCase,
  // crop
  getCroppedBlob,
  blobToFile,
  // UI/components
  StatusBadge,
  VerifiedBadge,
  StepStateBadge,
  PhoneCallButton,
  HeroPrimaryButton,
  HeroOutlineButton,
  InlineCountdown,
  ProfileStepCard,
  PersonalInfoDisplay,
  AddressDisplay,
  IdentityDisplay,
  BoutiqueDisplay,
  DeliveryDisplay,
  BusinessDisplay,
  DashboardProfileHeader,
  DocumentsModal,
  CropPhotoModal,
} from "./userProfileParts";

// Constantes KYC
const KYC_WINDOW_MS = 72 * 60 * 60 * 1000; // 72h

type UserData = ApiUserProfile & {
  documents?: UserDocumentItem[];
  account_type?: string;
  role?: string;
  kyc_status?: string;
  account_status?: string;
  account_type_label?: string;
  account_category?: string | null;
  account_category_label?: string | null;
  photo_url?: string;
  photo?: string;
  avatar_url?: string;
  created_at?: string;
  date_joined?: string;
  client_type?: string;
  supplier_type?: string;
  merchant_type?: string;
  delivery_type?: string;
  boutique_type?: string;
  [key: string]: any;
};

export default function UserProfileView({ isInDashboard = false }: { isInDashboard?: boolean }) {
  const [activeTab, setActiveTab] = useState<string>("personal");

  // ✅ FIX: on inclut genre + date_of_birth dans l'état initial pour éviter "non affiché"
  const [formData, setFormData] = useState<ExtendedUserRegistrationData>({
    account_type: "client",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    password2: "",
    full_name: "",
    phone: "",
    role: "",
    nationality: "",
    gender: "" as any,
    date_of_birth: "",
    accepted_terms: true,
    // ✅ CORRECTION: Ajout de tous les champs manquants
    address_line: "",
    province: "",
    commune: "",
    colline_or_quartier: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    id_type: "" as any,
    id_number: "",
    id_issue_date: "",
    id_expiry_date: "",
    id_no_expiry: false,
    boutique_type: "" as any,
    boutique_services: [],
    delivery_vehicle: "" as any,
    vehicle_registration: "",
    preferred_delivery_time: "",
    delivery_instructions: "",
    business_name: "",
    business_entity_type: "" as any,
    business_registration_number: "",
    business_tax_id: "",
    business_doc_expiry_date: "",
    lumicash_msisdn: "",
    accepted_contract: false,
    client_type: "" as any,
    supplier_type: "" as any,
    merchant_type: "" as any,
    delivery_type: "" as any,
    id_front_image: null,
    id_back_image: null,
    passport_photo: null,
    business_document: null,
    photo: null,
    signature: null,
  } as ExtendedUserRegistrationData);

  const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    personal: false,
    address: false,
    identity: false,
    boutique: false,
    delivery: false,
    business: false,
  });

  const [userDocuments, setUserDocuments] = useState<UserDocumentItem[]>([]);

  // ✅ modal documents
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsModalTab, setDocsModalTab] = useState<"kyc" | "kyb">("kyc");

  // ✅ crop modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rawPhotoName, setRawPhotoName] = useState<string>("profile.jpg");

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview && profilePhotoPreview.startsWith("blob:")) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

  useEffect(() => {
    return () => {
      if (cropImageSrc && cropImageSrc.startsWith("blob:")) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  // ------------------------- KYC / Locking -------------------------
  const kycStartDate = useMemo(() => {
    if (accountCreatedAt) return accountCreatedAt;
    return new Date(nowTs);
  }, [accountCreatedAt, nowTs]);

  const kycDeadline = useMemo(() => new Date(kycStartDate.getTime() + KYC_WINDOW_MS), [kycStartDate]);
  const kycRemainingMs = useMemo(() => Math.max(0, kycDeadline.getTime() - nowTs), [kycDeadline, nowTs]);

  const backendKycStatus = (user?.kyc_status || "unverified") as string;
  const globalLocked = useMemo(() => backendKycStatus === "verified", [backendKycStatus]);

  const docsLocked = useMemo(() => {
    if (globalLocked) return true;
    if (kycRemainingMs <= 0) return true;
    return false;
  }, [globalLocked, kycRemainingMs]);

  const accountBlocked = useMemo(() => {
    if (globalLocked) return false;
    return kycRemainingMs <= 0 && backendKycStatus !== "verified";
  }, [globalLocked, kycRemainingMs, backendKycStatus]);

  const showKycZone = useMemo(() => {
    if (!user?.id) return false;
    return !globalLocked;
  }, [user?.id, globalLocked]);

  const kycTone: "green" | "yellow" | "red" | "gray" | "blue" =
    backendKycStatus === "verified"
      ? "green"
      : backendKycStatus === "pending"
      ? "yellow"
      : backendKycStatus === "rejected"
      ? "red"
      : accountBlocked
      ? "red"
      : "blue";

  const kycStatusLabel =
    backendKycStatus === "verified"
      ? "KYC Vérifié"
      : backendKycStatus === "pending"
      ? "KYC En Attente"
      : backendKycStatus === "rejected"
      ? "KYC Rejeté"
      : accountBlocked
      ? "KYC Incomplet (Compte bloqué)"
      : "KYC Incomplet";

  const kycDeadlineMessage = useMemo(() => {
    const uname = user?.username ? String(user.username) : "utilisateur";
    return `Monsieur ${uname}, vous disposez de 72 heures après votre inscription pour mettre à jour vos documents KYC/KYB. Après ce délai, aucune modification ne sera possible.`;
  }, [user?.username]);

  // ------------------------- Documents grouping -------------------------
  const kycDocs = useMemo(() => {
    const docs = userDocuments || [];
    return docs.filter((d) =>
      ["id_card", "passport", "proof_of_address", "selfie"].includes(String(d.document_type || "").toLowerCase())
    );
  }, [userDocuments]);

  const kybDocs = useMemo(() => {
    const docs = userDocuments || [];
    return docs.filter(
      (d) => !["id_card", "passport", "proof_of_address", "selfie"].includes(String(d.document_type || "").toLowerCase())
    );
  }, [userDocuments]);

  // ------------------------- Completion -------------------------
  const stepCompletion = useMemo(() => {
    const personalRequiredKeys: Array<keyof ExtendedUserRegistrationData> = ["full_name", "nationality"];
    const personalOk =
      personalRequiredKeys.every((k) => hasValue((formData as any)[k])) &&
      (hasValue((formData as any).phone) || hasValue((formData as any).email));

    const addressRequiredKeys: Array<keyof ExtendedUserRegistrationData> = ["address_line", "province", "commune"];
    const addressOk = addressRequiredKeys.every((k) => hasValue((formData as any)[k]));

    const hasIdNumber = hasValue((formData as any).id_number);
    const hasIdType = hasValue((formData as any).id_type);

    const kycDocsOk =
      kycDocs.length > 0 ||
      (formData as any).passport_photo instanceof File ||
      (formData as any).id_front_image instanceof File;

    const kycFormOk = hasIdType && hasIdNumber && kycDocsOk;

    const boutiqueOk =
      user?.account_type === "commercant"
        ? hasValue((formData as any).boutique_type) &&
          Array.isArray((formData as any).boutique_services) &&
          (formData as any).boutique_services.length > 0
        : true;

    const deliveryOk =
      user?.account_type === "livreur"
        ? hasValue((formData as any).delivery_vehicle) && hasValue((formData as any).vehicle_registration)
        : true;

    const businessOk =
      ["fournisseur", "partenaire", "entreprise"].includes(user?.account_type || "")
        ? hasValue((formData as any).business_name) &&
          hasValue((formData as any).business_entity_type) &&
          hasValue((formData as any).business_registration_number) &&
          hasValue((formData as any).business_tax_id)
        : true;

    return { personalOk, addressOk, kycFormOk, boutiqueOk, deliveryOk, businessOk };
  }, [formData, user?.account_type, kycDocs]);

  // ------------------------- API load -------------------------
  const loadUserProfile = async (): Promise<void> => {
    try {
      setIsLoadingProfile(true);

      const userData: UserData = await getCurrentUser();
      dispatch(updateProfile(userData as any));

      const createdAt = pickAccountCreatedAt(userData);
      if (createdAt) setAccountCreatedAt(createdAt);

      const docs = Array.isArray(userData.documents) ? userData.documents : [];
      setUserDocuments(docs);

      const pUrl = pickPhotoUrl(userData);
      setProfilePhotoPreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return pUrl;
      });

      const profileData: ExtendedUserRegistrationData = {
        account_type: ((userData.account_type ?? "client") as any) ?? "client",
        username: toStr(userData.username),
        email: toStr(userData.email),
        role: toStr(userData.role),
        password: "",
        confirm_password: "",
        password2: "",
        full_name: toStr((userData as any).full_name),
        phone: toStr((userData as any).phone),

        // ✅ CORRECTION: Ces champs sont maintenant correctement initialisés
        gender: toStr((userData as any).gender) as any || "",
        date_of_birth: toStr((userData as any).date_of_birth),

        nationality: toStr((userData as any).nationality),

        id_type: toStr((userData as any).id_type) as any || "",
        id_number: toStr((userData as any).id_number),
        id_issue_date: toStr((userData as any).id_issue_date),
        id_expiry_date: toStr((userData as any).id_expiry_date),
        id_no_expiry: toBool((userData as any).id_no_expiry, false),

        address_line: toStr((userData as any).address_line),
        province: toStr((userData as any).province),
        commune: toStr((userData as any).commune),
        colline_or_quartier: toStr((userData as any).colline_or_quartier),

        emergency_contact_name: toStr((userData as any).emergency_contact_name),
        emergency_contact_phone: toStr((userData as any).emergency_contact_phone),
        emergency_contact_relationship: toStr((userData as any).emergency_contact_relationship),

        business_name: toStr((userData as any).business_name),
        business_entity_type: toStr((userData as any).business_entity_type) as any || "",
        business_registration_number: toStr((userData as any).business_registration_number),
        business_tax_id: toStr((userData as any).business_tax_id),
        business_doc_expiry_date: toStr((userData as any).business_doc_expiry_date),

        boutique_type: toStr((userData as any).boutique_type) as any || "",
        boutique_services: toArr((userData as any).boutique_services),

        delivery_vehicle: toStr((userData as any).delivery_vehicle) as any || "",
        vehicle_registration: toStr((userData as any).vehicle_registration),
        preferred_delivery_time: toStr((userData as any).preferred_delivery_time),
        delivery_instructions: toStr((userData as any).delivery_instructions),

        lumicash_msisdn: toStr((userData as any).lumicash_msisdn),

        accepted_terms: true,
        accepted_contract: toBool((userData as any).accepted_contract, false),

        // ✅ CORRECTION: Ajout des champs de type utilisateur
        client_type: toStr((userData as any).client_type) as any || "",
        supplier_type: toStr((userData as any).supplier_type) as any || "",
        merchant_type: toStr((userData as any).merchant_type) as any || "",
        delivery_type: toStr((userData as any).delivery_type) as any || "",

        // files (new upload only)
        id_front_image: null,
        id_back_image: null,
        passport_photo: null,
        business_document: null,
        photo: null,
        signature: null,

        kyc_status: ((userData as any).kyc_status as any) ?? undefined,
        account_status: ((userData as any).account_status as any) ?? undefined,

        account_type_label: (userData as any).account_type_label,
        account_category: (userData as any).account_category,
        account_category_label: (userData as any).account_category_label,
      } as any;

      setFormData(profileData);

      setEditMode({
        personal: false,
        address: false,
        identity: false,
        boutique: false,
        delivery: false,
        business: false,
      });
    } catch (error: any) {
      setErrorMessage("Erreur lors du chargement du profil: " + (error?.message || "Erreur inconnue"));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ------------------------- handlers -------------------------
  const handleInputChange: InputChangeHandler = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev: ExtendedUserRegistrationData) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if ((formErrors as any)[name]) {
      setFormErrors((prev: FormValidationErrors) => {
        const newErrors = { ...(prev as any) };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange: FileChangeHandler = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      if (name === "photo") {
        try {
          const url = URL.createObjectURL(file);

          setRawPhotoName(file.name || "profile.jpg");
          setCropImageSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) URL.revokeObjectURL(prevSrc);
            return url;
          });

          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setCroppedAreaPixels(null);
          setCropModalOpen(true);

          return;
        } catch {
          setFormData((prev: ExtendedUserRegistrationData) => ({
            ...prev,
            [name]: file,
          }));
          const url = URL.createObjectURL(file);
          setProfilePhotoPreview((prevUrl) => {
            if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
            return url;
          });
        }
        return;
      }

      setFormData((prev: ExtendedUserRegistrationData) => ({
        ...prev,
        [name]: file,
      }));

      if ((formErrors as any)[name]) {
        setFormErrors((prev: FormValidationErrors) => {
          const newErrors = { ...(prev as any) };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleArrayChange: ArrayChangeHandler = (name: string, value: string[]) => {
    setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange: CheckboxChangeHandler = (name: string, checked: boolean) => {
    setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: checked }));
  };

  // ------------------------- edit rules -------------------------
  const isReadOnlyThisTab = useMemo(() => {
    if (globalLocked) return true;
    if (accountBlocked) return true;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return true;
    return !editMode[activeTab];
  }, [activeTab, editMode, globalLocked, accountBlocked, docsLocked]);

  const allowEditThisTab = useMemo(() => {
    if (globalLocked) return false;
    if (accountBlocked) return false;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return false;
    return true;
  }, [globalLocked, accountBlocked, activeTab, docsLocked]);

  const hideFileInputs = useMemo(() => {
    if (globalLocked || accountBlocked) return true;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return true;
    return !editMode[activeTab];
  }, [activeTab, editMode, globalLocked, accountBlocked, docsLocked]);

  const isEditingAnything = useMemo(() => Object.values(editMode).some(Boolean), [editMode]);

  const enableEditAll = () => {
    if (globalLocked) return;
    if (accountBlocked) return;

    setEditMode((prev) => ({
      ...prev,
      personal: true,
      address: true,
      boutique: true,
      delivery: true,
      identity: !docsLocked ? true : prev.identity,
      business: !docsLocked ? true : prev.business,
    }));

    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 30);
  };

  const cancelEditAll = () => {
    setFormErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setEditMode({
      personal: false,
      address: false,
      identity: false,
      boutique: false,
      delivery: false,
      business: false,
    });
    loadUserProfile();
  };

  const toggleEditAll = () => {
    if (isEditingAnything) cancelEditAll();
    else enableEditAll();
  };

  const canPickProfilePhoto = useMemo(() => {
    if (globalLocked || accountBlocked) return false;
    if (activeTab !== "personal") return false;
    return Boolean(editMode.personal);
  }, [globalLocked, accountBlocked, activeTab, editMode.personal]);

  const openProfilePhotoPicker = () => {
    if (!canPickProfilePhoto) return;
    photoInputRef.current?.click();
  };

  const handleReactivate = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setActiveTab("identity");
    setEditMode((prev) => ({ ...prev, identity: true }));
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const openDocsModal = async (tab: "kyc" | "kyb") => {
    await loadUserProfile();
    setDocsModalTab(tab);
    setDocsModalOpen(true);
  };

  // ✅ crop callbacks
  const onCropComplete = (_: any, croppedPixels: any) => {
    if (!croppedPixels) return;
    setCroppedAreaPixels({
      x: croppedPixels.x,
      y: croppedPixels.y,
      width: croppedPixels.width,
      height: croppedPixels.height,
    });
  };

  const applyCroppedPhoto = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) {
        setCropModalOpen(false);
        return;
      }

      const blob = await getCroppedBlob(cropImageSrc, croppedAreaPixels);
      const finalFile = blobToFile(blob, rawPhotoName || "profile.jpg");

      setFormData((prev) => ({ ...prev, photo: finalFile } as any));

      const newPreviewUrl = URL.createObjectURL(finalFile);
      setProfilePhotoPreview((prevUrl) => {
        if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
        return newPreviewUrl;
      });

      setCropModalOpen(false);
    } catch (e) {
      setErrorMessage("Impossible de recadrer l'image. Réessayez avec une autre photo.");
      setCropModalOpen(false);
    }
  };

  // ------------------------- save -------------------------
  const handleSave = async (): Promise<void> => {
    if (accountBlocked) {
      setErrorMessage("Votre compte est bloqué car le délai est expiré. Les documents ne peuvent plus être modifiés.");
      return;
    }
    if (globalLocked) {
      setErrorMessage("Votre KYC est validé. Le profil est verrouillé.");
      return;
    }
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) {
      setErrorMessage("Le délai est terminé. Les documents ne peuvent plus être modifiés ni supprimés.");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFormErrors({});

    try {
      const updateData = new FormData();

      const fieldsToUpdate = [
        "full_name",
        "phone",
        "email",
        "gender",
        "date_of_birth",
        "nationality",
        "address_line",
        "province",
        "commune",
        "colline_or_quartier",
        "emergency_contact_name",
        "emergency_contact_phone",
        "emergency_contact_relationship",
        "business_name",
        "business_entity_type",
        "business_registration_number",
        "business_tax_id",
        "business_doc_expiry_date",
        "boutique_type",
        "boutique_services",
        "delivery_vehicle",
        "vehicle_registration",
        "preferred_delivery_time",
        "delivery_instructions",
        "lumicash_msisdn",
        "id_type",
        "id_number",
        "id_issue_date",
        "id_expiry_date",
        "id_no_expiry",
        "client_type",
        "supplier_type",
        "merchant_type",
        "delivery_type",
      ];

      fieldsToUpdate.forEach((key) => {
        const value = (formData as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof File) updateData.append(key, value);
          else if (Array.isArray(value)) updateData.append(key, JSON.stringify(value));
          else updateData.append(key, String(value));
        }
      });

      if (editMode.personal) {
        const photo = (formData as any).photo;
        if (photo instanceof File) updateData.append("photo", photo);

        const signature = (formData as any).signature;
        if (signature instanceof File) updateData.append("signature", signature);
      }

      if (activeTab === "identity" && editMode.identity && !docsLocked) {
        const f1 = (formData as any).id_front_image;
        const f2 = (formData as any).id_back_image;
        const f3 = (formData as any).passport_photo;
        if (f1 instanceof File) updateData.append("id_front_image", f1);
        if (f2 instanceof File) updateData.append("id_back_image", f2);
        if (f3 instanceof File) updateData.append("passport_photo", f3);
      }

      if (activeTab === "business" && editMode.business && !docsLocked) {
        const b1 = (formData as any).business_document;
        if (b1 instanceof File) updateData.append("business_document", b1);
      }

      await updateUserProfile(updateData);
      await loadUserProfile();

      setSuccessMessage("Profil mis à jour avec succès !");

      if (activeTab === "identity") {
        setDocsModalTab("kyc");
        setDocsModalOpen(true);
      } else if (activeTab === "business") {
        setDocsModalTab("kyb");
        setDocsModalOpen(true);
      }
    } catch (error: any) {
      if (error?.payload?.errors) {
        const backendErrors: FormValidationErrors = {};
        Object.entries(error.payload.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) (backendErrors as any)[field] = messages.join(", ");
          else (backendErrors as any)[field] = String(messages);
        });
        setFormErrors(backendErrors);
      }
      setErrorMessage(error?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- Tabs -------------------------
  const tabs: ProfileTab[] = useMemo(() => {
    const baseTabs: ProfileTab[] = [
      {
        id: "personal",
        label: "Profil Personnel",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).personalOk,
      },
      {
        id: "address",
        label: "Adresse",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).addressOk,
      },
      {
        id: "identity",
        label: "Vérification KYC",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        completed: (stepCompletion as any).kycFormOk || globalLocked,
      },
    ];

    if (user?.account_type === "commercant") {
      baseTabs.push({
        id: "boutique",
        label: "Boutique",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h18M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-4h14l2 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 11v6M15 11v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).boutiqueOk,
      });
    }

    if (user?.account_type === "livreur") {
      baseTabs.push({
        id: "delivery",
        label: "Livraison",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 17h4V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 17h6v-4a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).deliveryOk,
      });
    }

    if (["fournisseur", "partenaire", "entreprise"].includes(user?.account_type || "")) {
      baseTabs.push({
        id: "business",
        label: "Documents Entreprise",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).businessOk,
      });
    }

    return baseTabs;
  }, [user?.account_type, stepCompletion, globalLocked]);

  // ------------------------- Render tab content -------------------------
  const renderTabContent = (): React.ReactNode => {
    if (isLoadingProfile) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm" style={{ color: SeaSkyColors.steelBlue }}>
              Chargement de votre profil...
            </p>
          </div>
        </div>
      );
    }

    if (!editMode[activeTab]) {
      switch (activeTab) {
        case "personal":
          return <PersonalInfoDisplay formData={formData} />;
        case "address":
          return <AddressDisplay formData={formData} />;
        case "identity":
          return <IdentityDisplay formData={formData} />;
        case "boutique":
          return <BoutiqueDisplay formData={formData} />;
        case "delivery":
          return <DeliveryDisplay formData={formData} />;
        case "business":
          return <BusinessDisplay formData={formData} />;
        default:
          return (
            <div className="text-center py-10 text-sm" style={{ color: SeaSkyColors.steelBlue }}>
              Sélectionnez une section à modifier
            </div>
          );
      }
    }

    const commonProps: RegistrationStepProps = {
      formData,
      formErrors,
      onInputChange: handleInputChange,
      onFileChange: handleFileChange,
      onArrayChange: handleArrayChange,
      onCheckboxChange: handleCheckboxChange,
      mode: "profile" as const,
    };

    switch (activeTab) {
      case "personal":
        return <RegisterPersonalInfoForm {...commonProps} />;
      case "address":
        return <RegisterAddressForm {...commonProps} />;
      case "identity":
        return <RegisterIdentityVerificationForm {...commonProps} />;
      case "boutique":
        return <RegisterBoutiqueInfoForm {...commonProps} />;
      case "delivery":
        return <RegisterDeliveryInfo {...commonProps} />;
      case "business":
        return <RegisterBusinessDocuments {...commonProps} />;
      default:
        return (
          <div className="text-center py-10 text-sm" style={{ color: SeaSkyColors.steelBlue }}>
            Sélectionnez une section à modifier
          </div>
        );
    }
  };

  // ------------------------- UI -------------------------
  const accountSubtypeLabel = useMemo(() => formatLabelTitleCase(getAccountSubtypeLabel(user)), [user]);
  const accountTypeLabel = useMemo(() => getAccountTypeLabel(user), [user]);

  return (
    <>
      <DocumentsModal
        open={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        kycDocs={kycDocs}
        kybDocs={kybDocs}
        active={docsModalTab}
        setActive={setDocsModalTab}
        docsLocked={docsLocked}
        onRefresh={loadUserProfile}
        onGoEditKyc={() => {
          setActiveTab("identity");
          setEditMode((p) => ({ ...p, identity: true }));
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
        }}
        onGoEditKyb={() => {
          setActiveTab("business");
          setEditMode((p) => ({ ...p, business: true }));
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
        }}
      />

      <CropPhotoModal
        open={cropModalOpen}
        onClose={() => {
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setCropModalOpen(false);
        }}
        cropImageSrc={cropImageSrc}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        onCropComplete={onCropComplete}
        onApply={applyCroppedPhoto}
      />

      {/* ========================= Profil avec style Dashboard ========================= */}
      <div className="w-full">
        {/* Header du profil avec style Dashboard */}
        <DashboardProfileHeader
          user={user}
          profilePhotoPreview={profilePhotoPreview}
          initialsFrom={initialsFrom}
          accountTypeLabel={accountTypeLabel}
          accountSubtypeLabel={accountSubtypeLabel}
          kycStatusLabel={kycStatusLabel}
          kycTone={kycTone}
          isEditingAnything={isEditingAnything}
          toggleEditAll={toggleEditAll}
          isLoading={isLoading}
          handleSave={handleSave}
          allowEditThisTab={allowEditThisTab}
          editMode={editMode}
          activeTab={activeTab}
        />

        {/* Alerts */}
        <div className="mb-6 space-y-4">
          {successMessage && <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage("")} />}
          {errorMessage && <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage("")} />}
        </div>

        {/* Zone d'alerte KYC */}
        {showKycZone && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">{kycDeadlineMessage}</p>
                  {!globalLocked && !accountBlocked && kycRemainingMs > 0 && (
                    <div className="mt-2">
                      <InlineCountdown remainingMs={kycRemainingMs} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglets de navigation */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const disabledTab = accountBlocked ? tab.id !== "identity" : false;

                const handleTabClick = async () => {
                  if (disabledTab) return;

                  if (tab.id === "business") {
                    setActiveTab("business");
                    await openDocsModal("kyb");
                    return;
                  }

                  if (tab.id === "identity" && docsModalOpen) {
                    setDocsModalTab("kyc");
                  }

                  setActiveTab(tab.id);
                };

                return (
                  <button
                    key={tab.id}
                    onClick={handleTabClick}
                    disabled={disabledTab}
                    className={[
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 shrink-0",
                      "bg-white/80 backdrop-blur-sm border shadow-sm hover:shadow transform hover:-translate-y-0.5",
                      isActive ? "ring-2 ring-[#27B1E4]/50 bg-white" : "border-white/30",
                      disabledTab ? "opacity-50 cursor-not-allowed hover:shadow-none hover:transform-none" : "",
                    ].join(" ")}
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: tab.completed ? "rgba(51,95,122,0.12)" : isActive ? "rgba(39,177,228,0.15)" : "rgba(243,244,246,0.8)",
                        color: tab.completed ? (SeaSkyColors.steelBlue || "#335F7A") : SeaSkyColors.brandBlue,
                      }}
                    >
                      {tab.icon}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold truncate" style={{ color: isActive ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue }}>
                          {tab.label}
                        </span>
                        <StepStateBadge completed={Boolean(tab.completed)} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
              <div className="px-6 py-5 border-b border-white/60 bg-white/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold" style={{ color: SeaSkyColors.inkBlue }}>
                      {tabs.find((t) => t.id === activeTab)?.label || "Section"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: SeaSkyColors.steelBlue }}>
                      {globalLocked
                        ? "Profil verrouillé après validation."
                        : accountBlocked
                        ? "Compte bloqué. Délai expiré."
                        : editMode[activeTab]
                        ? "Vous êtes en mode édition. Modifiez les champs ci-dessous."
                        : "Cliquez sur « Modifier » pour éditer cette section."}
                    </p>

                    {(activeTab === "identity" || activeTab === "business") && docsLocked && !globalLocked && (
                      <div className="mt-3">
                        <StatusBadge tone="red" label="Docs verrouillés (délai terminé)" />
                      </div>
                    )}
                  </div>

                  {isEditingAnything ? (
                    <div className="flex justify-start sm:justify-end">
                      <HeroOutlineButton size="sm" onClick={toggleEditAll} disabled={globalLocked || accountBlocked}>
                        Annuler
                      </HeroOutlineButton>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="px-6 py-6">
                <div
                  className={[
                    "relative",
                    isReadOnlyThisTab ? "pointer-events-none select-none opacity-95" : "",
                    hideFileInputs
                      ? "[&_input[type=file]]:hidden **:data-upload:hidden **:data-file-upload:hidden [&_.file-upload]:hidden"
                      : "",
                  ].join(" ")}
                >
                  {renderTabContent()}
                </div>

                <div className="mt-8 pt-6 border-t border-white/80">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <HeroOutlineButton onClick={loadUserProfile} disabled={isLoading || isLoadingProfile} size="sm">
                      Actualiser
                    </HeroOutlineButton>

                    <HeroPrimaryButton onClick={handleSave} disabled={isLoading || isLoadingProfile || globalLocked || !allowEditThisTab} size="sm">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Enregistrement...
                        </span>
                      ) : (
                        "Enregistrer"
                      )}
                    </HeroPrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: SeaSkyColors.inkBlue }}>
                Progression du Profil
              </h3>

              <div className="space-y-3">
                {tabs.map((tab) => (
                  <ProfileStepCard
                    key={tab.id}
                    label={tab.label}
                    completed={tab.completed || false}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={accountBlocked ? tab.id !== "identity" : globalLocked}
                  />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/80">
                <div className="text-sm font-semibold mb-3" style={{ color: SeaSkyColors.steelBlue }}>
                  Documents (KYC/KYB)
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <StatusBadge tone="gray" label={`KYC: ${kycDocs.length}`} />
                  <StatusBadge tone="gray" label={`KYB: ${kybDocs.length}`} />
                  {docsLocked ? <StatusBadge tone="red" label="Verrouillé" /> : <StatusBadge tone="blue" label="Éditable" />}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <HeroOutlineButton size="sm" onClick={() => openDocsModal("kyc")} disabled={!user?.id}>
                    Voir KYC
                  </HeroOutlineButton>
                  <HeroOutlineButton size="sm" onClick={() => openDocsModal("kyb")} disabled={!user?.id}>
                    Voir KYB
                  </HeroOutlineButton>
                </div>

                <p className="text-xs mt-3" style={{ color: SeaSkyColors.steelBlue }}>
                  Si le délai est terminé, les documents s'affichent en lecture seule avec le badge "Validated".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}, alors adapte ces fichiers au design du fichier que je t'ai donne, fais le de maniereprofessionnelle et propre, je veux donc des fihiers complets, entiermeent complets