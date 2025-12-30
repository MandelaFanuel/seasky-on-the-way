// ========================= src/pages/profile/UserProfilePage.tsx =========================
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
}