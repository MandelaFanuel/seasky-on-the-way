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

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

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

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [childLoading, setChildLoading] = useState(false);

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
    // ✅ On garde la logique existante, mais "users" ne doit plus ouvrir de création
    if (activeTab === "drivers") driverRef.current?.openCreate();
    if (activeTab === "agents") agentRef.current?.openCreate();
    if (activeTab === "pdv") pdvRef.current?.openCreate();
    if (activeTab === "orders") ordersRef.current?.openCreate?.();
    if (activeTab === "driver_requests") requestsRef.current?.openCreate?.();
  }, [activeTab]);

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
  }, [activeTab]);

  const headerHeight = useMemo(() => (isHeaderExpanded ? 200 : 160), [isHeaderExpanded]);

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

  // ✅ "users" retiré: admin ne peut pas créer des utilisateurs
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

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: alpha(theme.palette.primary.light, 0.02),
        position: "relative",
        mt: 14,
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
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 2.5 }, transition: "all 0.3s ease" }}>
          <Box
            sx={{
              mb: 1.5,
              transition: "all 0.3s ease",
              transform: isHeaderExpanded ? "none" : "scale(0.97)",
              opacity: isHeaderExpanded ? 1 : 0.9,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: isHeaderExpanded ? 56 : 48,
                    height: isHeaderExpanded ? 56 : 48,
                    borderRadius: isHeaderExpanded ? 3 : 2,
                    backgroundColor: alpha(theme.palette.primary.main, isHeaderExpanded ? 0.1 : 0.08),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <AdminPanelSettings
                    sx={{
                      fontSize: isHeaderExpanded ? 32 : 26,
                      color: theme.palette.primary.main,
                      transition: "all 0.3s ease",
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant={isHeaderExpanded ? "h4" : "h5"}
                    fontWeight={800}
                    sx={{
                      color: theme.palette.primary.dark,
                      mb: isHeaderExpanded ? 0.5 : 0.25,
                      transition: "all 0.3s ease",
                    }}
                  >
                    Tableau de Bord Administrateur
                  </Typography>
                  <Typography
                    variant={isHeaderExpanded ? "body1" : "body2"}
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: isHeaderExpanded ? 500 : 400,
                      transition: "all 0.3s ease",
                    }}
                  >
                    Gestion système • Utilisateurs • PDV • Commandes • Rapports • Temps réel
                  </Typography>
                </Box>
              </Stack>

              {/* Boutons header */}
              <Box display="flex" gap={1.5} flexWrap="wrap">
                {canCreate && (
                  <Button
                    variant="contained"
                    startIcon={createIcon}
                    onClick={handleOpenCreateFromParent}
                    size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
            </Box>

            {/* Tabs */}
            <Box sx={{ mt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 800 } }}
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

            {isHeaderExpanded && (
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
          </Box>
        </Box>
      </Box>

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

          {activeTab === "profile" && <AdminProfilePanel ref={profileRef} onLoadingChange={(l) => setChildLoading(l)} />}

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
    </Box>
  );
}
