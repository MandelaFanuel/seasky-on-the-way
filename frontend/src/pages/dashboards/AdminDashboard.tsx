// ========================= src/pages/dashboards/AdminDashboard.tsx =========================
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
  Chip,
  Stack,
  Button,
  useMediaQuery,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
  Avatar,
} from "@mui/material";
import {
  AdminPanelSettings,
  Dashboard as DashboardIcon,
  TrendingUp,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Store as StoreIcon,
  SupportAgent as SupportAgentIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptLongIcon,
  PendingActions as PendingActionsIcon,
  QueryStats as QueryStatsIcon,
  Bolt as BoltIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import DriverDashboard, { DriverDashboardHandle } from "../../components/admin/drivers/DriverDashboard";
import AgentDashboard, { AgentDashboardHandle } from "../../components/admin/dashboard/AgentDashboard";
import PDVDashboard, { PDVDashboardHandle } from "../../components/admin/dashboard/PDVDashboard";

import AdminProfilePanel, { AdminProfilePanelHandle } from "../../components/admin/dashboard/AdminProfilePanel";
import AdminUsersList, { AdminUsersListHandle } from "../../components/admin/dashboard/AdminUsersList";
import RealtimeActivityDashboard, { RealtimeActivityDashboardHandle } from "../../components/admin/dashboard/RealtimeActivityDashboard";
import OrdersDashboard, { OrdersDashboardHandle } from "../../components/admin/dashboard/OrdersDashboard";
import DriverRequestsDashboard, { DriverRequestsDashboardHandle } from "../../components/admin/drivers/DriverRequestsDashboard";
import ReportsDashboard, { ReportsDashboardHandle } from "../../components/admin/dashboard/ReportsDashboard";

// ✅ Import pour la gestion des URLs des médias
import { getMediaUrl } from "@/services/api";

type AdminTab =
  | "overview"
  | "profile"
  | "users"
  | "drivers"
  | "agents"
  | "pdv"
  | "realtime"
  | "orders"
  | "driver_requests"
  | "reports";

type AdminUser = {
  id?: number;
  username?: string;
  email?: string;
  photo?: string;
  role?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  full_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
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

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");
  const isSmallMobile = useMediaQuery("(max-width:600px)");

  const contentRef = useRef<HTMLDivElement>(null);

  const profileRef = useRef<AdminProfilePanelHandle>(null);
  const usersRef = useRef<AdminUsersListHandle>(null);
  const driverRef = useRef<DriverDashboardHandle>(null);
  const agentRef = useRef<AgentDashboardHandle>(null);
  const pdvRef = useRef<PDVDashboardHandle>(null);
  const realtimeRef = useRef<RealtimeActivityDashboardHandle>(null);
  const ordersRef = useRef<OrdersDashboardHandle>(null);
  const requestsRef = useRef<DriverRequestsDashboardHandle>(null);
  const reportsRef = useRef<ReportsDashboardHandle>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [childLoading, setChildLoading] = useState(false);

  // ✅ État pour stocker les données du profil admin
  const [adminData, setAdminData] = useState<AdminUser | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrollTop = contentRef.current.scrollTop;

      if (scrollTop < lastScrollTop && scrollTop > 200) setShowBackToTop(true);
      else if (scrollTop > lastScrollTop || scrollTop <= 200) setShowBackToTop(false);

      if (scrollTop > 100) setIsHeaderExpanded(false);
      else setIsHeaderExpanded(true);

      setLastScrollTop(scrollTop);
    };

    const el = contentRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [lastScrollTop]);

  const handleOpenCreateFromParent = useCallback(() => {
    if (activeTab === "drivers") driverRef.current?.openCreate();
    if (activeTab === "agents") agentRef.current?.openCreate();
    if (activeTab === "pdv") pdvRef.current?.openCreate();
    if (activeTab === "orders") ordersRef.current?.openCreate?.();
    if (activeTab === "driver_requests") requestsRef.current?.openCreate?.();
    if (isMobile) setMobileMenuOpen(false);
  }, [activeTab, isMobile]);

  const handleRefreshFromParent = useCallback(async () => {
    if (activeTab === "overview") await realtimeRef.current?.refresh?.();
    if (activeTab === "profile") await profileRef.current?.refresh?.();
    if (activeTab === "users") await usersRef.current?.refresh?.();
    if (activeTab === "drivers") await driverRef.current?.refresh();
    if (activeTab === "agents") await agentRef.current?.refresh();
    if (activeTab === "pdv") await pdvRef.current?.refresh();
    if (activeTab === "realtime") await realtimeRef.current?.refresh?.();
    if (activeTab === "orders") await ordersRef.current?.refresh?.();
    if (activeTab === "driver_requests") await requestsRef.current?.refresh?.();
    if (activeTab === "reports") await reportsRef.current?.refresh?.();
    if (isMobile) setMobileMenuOpen(false);
  }, [activeTab, isMobile]);

  const handleTabChange = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    if (isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  // ✅ Callback pour recevoir les données mises à jour du profil
  const handleProfileUpdate = useCallback((data: AdminUser) => {
    setAdminData(data);
    // Stocker aussi dans localStorage pour persistance entre sessions
    if (data) {
      localStorage.setItem('admin_profile_data', JSON.stringify(data));
    }
  }, []);

  // ✅ Charger les données du profil depuis localStorage au démarrage
  useEffect(() => {
    const savedData = localStorage.getItem('admin_profile_data');
    if (savedData) {
      try {
        setAdminData(JSON.parse(savedData));
      } catch (e) {
        console.error("Erreur lors du parsing des données admin:", e);
      }
    }
  }, []);

  const headerHeight = useMemo(() => {
    if (isMobile) return isHeaderExpanded ? 180 : 140;
    return isHeaderExpanded ? 200 : 160;
  }, [isHeaderExpanded, isMobile]);

  const createLabel = useMemo(() => {
    if (activeTab === "drivers") return "Nouveau Chauffeur";
    if (activeTab === "agents") return "Nouvel Agent";
    if (activeTab === "pdv") return "Nouveau PDV";
    return "Créer";
  }, [activeTab]);

  const createIcon = useMemo(() => {
    if (activeTab === "drivers") return <PersonAddIcon />;
    if (activeTab === "agents") return <SupportAgentIcon />;
    if (activeTab === "pdv") return <StoreIcon />;
    return <PersonAddIcon />;
  }, [activeTab]);

  const canCreate = useMemo(() => {
    return activeTab === "drivers" || activeTab === "agents" || activeTab === "pdv";
  }, [activeTab]);

  const sectionLabel = useMemo(() => {
    const map: Record<AdminTab, string> = {
      overview: "Aperçu",
      profile: "Profil Admin",
      users: "Utilisateurs",
      drivers: "Chauffeurs",
      agents: "Agents",
      pdv: "Points de vente",
      realtime: "Activité temps réel",
      orders: "Commandes en attente",
      driver_requests: "Demandes livreur",
      reports: "Rapports",
    };
    return map[activeTab] || "Admin";
  }, [activeTab]);

  const tabItems = useMemo(() => [
    { value: "overview", label: "Aperçu", icon: <DashboardIcon /> },
    { value: "profile", label: "Profil", icon: <PersonIcon /> },
    { value: "users", label: "Utilisateurs", icon: <PeopleIcon /> },
    { value: "drivers", label: "Chauffeurs", icon: <PersonAddIcon /> },
    { value: "agents", label: "Agents", icon: <SupportAgentIcon /> },
    { value: "pdv", label: "PDV", icon: <StoreIcon /> },
    { value: "realtime", label: "Temps réel", icon: <BoltIcon /> },
    { value: "orders", label: "Commandes", icon: <ReceiptLongIcon /> },
    { value: "driver_requests", label: "Demandes livreur", icon: <PendingActionsIcon /> },
    { value: "reports", label: "Rapports", icon: <QueryStatsIcon /> },
  ], []);

  // ✅ URL de la photo de profil
  const adminPhotoUrl = useMemo(() => {
    if (adminData?.photo) {
      return getMediaUrl(adminData.photo);
    }
    return null;
  }, [adminData?.photo]);

  // ✅ Initiales pour l'avatar
  const adminInitials = useMemo(() => {
    return safeInitials(adminData?.full_name || adminData?.username);
  }, [adminData]);

  // Mobile Menu Drawer
  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 350 },
          backgroundColor: "white",
          backgroundImage: "none",
          boxShadow: theme.shadows[16],
        },
      }}
    >
      <Box sx={{ p: 2, backgroundColor: theme.palette.primary.main, color: "white" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography component="h2" variant="h6" fontWeight={700}>
            Menu Admin
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Navigation rapide
        </Typography>
      </Box>
      
      <List sx={{ p: 2 }}>
        {/* Affichage de la photo dans le menu mobile */}
        {adminData && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.primary.light, 0.05), borderRadius: 2, textAlign: 'center' }}>
            <Avatar
              src={adminPhotoUrl || undefined}
              sx={{
                width: 64,
                height: 64,
                margin: '0 auto 10px',
                bgcolor: adminPhotoUrl ? "transparent" : theme.palette.primary.main,
                color: "white",
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              {adminInitials}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              {adminData.full_name || "Administrateur"}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              @{adminData.username || "admin"} • {adminData.role || "admin"}
            </Typography>
          </Box>
        )}

        {/* Boutons d'action */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.primary.light, 0.05), borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: theme.palette.primary.dark }}>
            Actions rapides
          </Typography>
          <Stack spacing={1}>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={createIcon}
                onClick={handleOpenCreateFromParent}
                fullWidth
                size="medium"
                sx={{
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                }}
              >
                {createLabel}
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshFromParent}
              fullWidth
              size="medium"
              disabled={childLoading}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                borderWidth: 2,
                borderColor: "#0B568C",
                color: "#0B568C",
              }}
            >
              {childLoading ? "Chargement..." : "Actualiser"}
            </Button>

            <Button
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => {
                window.location.href = "/admin/qr-scan";
                setMobileMenuOpen(false);
              }}
              fullWidth
              size="medium"
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
              }}
            >
              Scanner QR Code
            </Button>
          </Stack>
        </Box>

        {/* Section navigation */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, px: 1, color: theme.palette.primary.dark }}>
          Navigation
        </Typography>
        {tabItems.map((item) => (
          <ListItemButton
            key={item.value}
            selected={activeTab === item.value}
            onClick={() => handleTabChange(item.value as AdminTab)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              backgroundColor: activeTab === item.value ? alpha(theme.palette.primary.main, 0.1) : "transparent",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.value ? theme.palette.primary.main : "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                fontWeight: activeTab === item.value ? 700 : 500,
                color: activeTab === item.value ? theme.palette.primary.main : "inherit",
              }}
            />
            {activeTab === item.value && (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.primary.main }} />
            )}
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.light, 0.03) }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 1 }}>
          Section active :
        </Typography>
        <Chip
          label={sectionLabel}
          sx={{
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.dark,
            fontWeight: 700,
          }}
        />
      </Box>
    </Drawer>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: alpha(theme.palette.primary.light, 0.02),
        position: "relative",
        mt: { xs: 8, sm: 10, md: 14 },
      }}
    >
      {/* HEADER FIXED */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          zIndex: 40,
          backdropFilter: "blur(10px)",
          background: alpha("#FFFFFF", 0.92),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 1.5, sm: 2, md: 2.5 }, transition: "all 0.3s ease" }}>
          {/* En-tête principal */}
          <Box
            sx={{
              mb: 1.5,
              transition: "all 0.3s ease",
              transform: isHeaderExpanded ? "none" : isMobile ? "scale(0.98)" : "scale(0.97)",
              opacity: isHeaderExpanded ? 1 : 0.9,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              {/* Logo, photo et titre */}
              <Stack direction="row" alignItems="center" spacing={2}>
                {/* ✅ Avatar avec la photo de profil */}
                <Avatar
                  src={adminPhotoUrl || undefined}
                  sx={{
                    width: isHeaderExpanded ? { xs: 48, md: 56 } : { xs: 40, md: 48 },
                    height: isHeaderExpanded ? { xs: 48, md: 56 } : { xs: 40, md: 48 },
                    bgcolor: adminPhotoUrl ? "transparent" : theme.palette.primary.main,
                    color: "white",
                    fontWeight: 700,
                    fontSize: isHeaderExpanded ? { xs: "1.2rem", md: "1.4rem" } : { xs: "1rem", md: "1.2rem" },
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  {adminInitials}
                </Avatar>

                <Box>
                  <Typography
                    component="h1"
                    sx={{
                      color: theme.palette.primary.dark,
                      mb: isHeaderExpanded ? 0.5 : 0.25,
                      transition: "all 0.3s ease",
                      fontSize: isHeaderExpanded 
                        ? { xs: "1.25rem", sm: "1.5rem", md: "2.125rem" } 
                        : { xs: "1.125rem", sm: "1.25rem", md: "1.5rem" },
                      fontWeight: 800,
                    }}
                  >
                    Tableau de Bord Administrateur
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: isHeaderExpanded ? 500 : 400,
                      transition: "all 0.3s ease",
                      fontSize: isHeaderExpanded 
                        ? { xs: "0.875rem", md: "1rem" } 
                        : { xs: "0.75rem", md: "0.875rem" },
                    }}
                  >
                    Gestion système • Utilisateurs • PDV • Commandes • Rapports • Temps réel
                    {adminData?.full_name && ` • Connecté: ${adminData.full_name}`}
                  </Typography>
                </Box>
              </Stack>

              {/* Boutons header - Desktop seulement */}
              {!isMobile && (
                <Box display="flex" gap={1.5} flexWrap="wrap">
                  {canCreate && (
                    <Button
                      variant="contained"
                      startIcon={createIcon}
                      onClick={handleOpenCreateFromParent}
                      size={isSmallMobile ? "small" : "medium"}
                      sx={{
                        borderRadius: "50px",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
                        boxShadow: "0 8px 24px rgba(11, 86, 140, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #0A345F 0%, #0B568C 100%)",
                          boxShadow: "0 12px 32px rgba(10, 52, 95, 0.6)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {createLabel}
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefreshFromParent}
                    size={isSmallMobile ? "small" : "medium"}
                    disabled={childLoading}
                    sx={{
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderWidth: 2,
                      borderColor: "#0B568C",
                      color: "#0B568C",
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        borderWidth: 2,
                        borderColor: "#0A345F",
                        backgroundColor: alpha("#0B568C", 0.05),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {childLoading ? "Chargement..." : "Actualiser"}
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={() => (window.location.href = "/admin/qr-scan")}
                    size={isSmallMobile ? "small" : "medium"}
                    sx={{
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
                      boxShadow: "0 8px 24px rgba(11, 86, 140, 0.35)",
                      "&:hover": { transform: "translateY(-2px)" },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    >
                    Scanner
                  </Button>
                </Box>
              )}

              {/* Menu hamburger pour mobile */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

            {/* Tabs - Desktop seulement */}
            {!isMobile && (
              <Box sx={{ mt: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ 
                    "& .MuiTab-root": { 
                      textTransform: "none", 
                      fontWeight: 800,
                      minHeight: 48,
                      fontSize: "0.9rem",
                    },
                    "& .MuiTab-root.Mui-selected": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <Tab value="overview" label="Aperçu" icon={<DashboardIcon />} iconPosition="start" />
                  <Tab value="profile" label="Profil" icon={<PersonIcon />} iconPosition="start" />
                  <Tab value="users" label="Utilisateurs" icon={<PeopleIcon />} iconPosition="start" />
                  <Tab value="drivers" label="Chauffeurs" icon={<PersonAddIcon />} iconPosition="start" />
                  <Tab value="agents" label="Agents" icon={<SupportAgentIcon />} iconPosition="start" />
                  <Tab value="pdv" label="PDV" icon={<StoreIcon />} iconPosition="start" />
                  <Tab value="realtime" label="Temps réel" icon={<BoltIcon />} iconPosition="start" />
                  <Tab value="orders" label="Commandes" icon={<ReceiptLongIcon />} iconPosition="start" />
                  <Tab value="driver_requests" label="Demandes livreur" icon={<PendingActionsIcon />} iconPosition="start" />
                  <Tab value="reports" label="Rapports" icon={<QueryStatsIcon />} iconPosition="start" />
                </Tabs>
              </Box>
            )}

            {isHeaderExpanded && !isMobile && (
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5, mt: 2 }}>
                <Chip
                  icon={<DashboardIcon sx={{ fontSize: 16 }} />}
                  label="Vue d'ensemble"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.dark,
                    fontWeight: 700,
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
                    fontWeight: 700,
                    px: 1.5,
                    py: 1,
                  }}
                />
                <Chip
                  label={`Section: ${sectionLabel}`}
                  sx={{
                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                    color: theme.palette.warning.dark,
                    fontWeight: 700,
                    px: 1.5,
                    py: 1,
                  }}
                />
              </Stack>
            )}

            {/* Indicateur de section pour mobile */}
            {isMobile && isHeaderExpanded && (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Chip
                  label={sectionLabel}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.dark,
                    fontWeight: 700,
                  }}
                />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {sectionLabel} • {new Date().toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Menu mobile */}
      {renderMobileMenu()}

      {/* CONTENU SCROLLABLE */}
      <Box
        ref={contentRef}
        sx={{
          height: "100vh",
          overflow: "auto",
          pt: `${headerHeight}px`,
          px: { xs: 2, sm: 3, md: 4 },
          pb: 4,
        }}
      >
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: theme.shadows[2],
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: "box-shadow 0.3s ease",
            "&:hover": { boxShadow: theme.shadows[4] },
          }}
        >
          {activeTab === "overview" && (
            <RealtimeActivityDashboard ref={realtimeRef} onLoadingChange={(l) => setChildLoading(l)} mode="overview" />
          )}

          {activeTab === "profile" && (
            <AdminProfilePanel 
              ref={profileRef} 
              onLoadingChange={(l) => setChildLoading(l)} 
              onProfileUpdate={handleProfileUpdate} // ✅ Passage du callback
            />
          )}

          {activeTab === "users" && <AdminUsersList ref={usersRef} onLoadingChange={(l) => setChildLoading(l)} />}

          {activeTab === "drivers" && <DriverDashboard ref={driverRef} onLoadingChange={(l) => setChildLoading(l)} />}

          {activeTab === "agents" && <AgentDashboard ref={agentRef} onLoadingChange={(l) => setChildLoading(l)} />}

          {activeTab === "pdv" && <PDVDashboard ref={pdvRef} onLoadingChange={(l) => setChildLoading(l)} />}

          {activeTab === "realtime" && (
            <RealtimeActivityDashboard ref={realtimeRef} onLoadingChange={(l) => setChildLoading(l)} mode="full" />
          )}

          {activeTab === "orders" && <OrdersDashboard ref={ordersRef} onLoadingChange={(l) => setChildLoading(l)} />}

          {activeTab === "driver_requests" && (
            <DriverRequestsDashboard ref={requestsRef} onLoadingChange={(l) => setChildLoading(l)} />
          )}

          {activeTab === "reports" && <ReportsDashboard ref={reportsRef} onLoadingChange={(l) => setChildLoading(l)} />}
        </Paper>

        {/* Footer */}
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <DashboardIcon sx={{ fontSize: 14 }} />
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Accès restreint • Version administrateur
          </Typography>
        </Box>
      </Box>

      {/* Bouton retour en haut */}
      {showBackToTop && (
        <Button
          variant="contained"
          size="small"
          onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            borderRadius: 3,
            minWidth: "auto",
            width: 40,
            height: 40,
            backgroundColor: theme.palette.primary.main,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            "&:hover": { backgroundColor: theme.palette.primary.dark, transform: "translateY(-2px)" },
            zIndex: 9999,
          }}
        >
          ↑
        </Button>
      )}

      {/* Bouton flottant pour mobile */}
      {isMobile && canCreate && (
        <Button
          variant="contained"
          startIcon={createIcon}
          onClick={handleOpenCreateFromParent}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
            borderRadius: "50px",
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.5,
            background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
            boxShadow: "0 8px 24px rgba(11, 86, 140, 0.4)",
            zIndex: 9998,
            display: { xs: "flex", md: "none" },
          }}
        >
          {createLabel}
        </Button>
      )}
    </Box>
  );
}