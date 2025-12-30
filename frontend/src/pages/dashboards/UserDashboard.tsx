// ========================= src/pages/dashboard/UserDashboard.tsx =========================
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Box, CircularProgress, Alert, alpha, useTheme, Button, useMediaQuery } from "@mui/material";
import api from "../../services/api";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";

import UserDashboardHeader from "./UserDashboardHeader";
import UserDashboardContent from "./UserDashboardContent";
import UserDashboardModals from "./UserDashboardModals";
import MobileNavigationMenu from "./MobileNavigationMenu";
import Footer from "../../components/sections/Footer";

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
  const [wallet, setWallet] = useState<WalletType>({
    id: 1,
    balance: 1250.75,
    account_number: user?.phone || "250700000000",
    phone_number: user?.phone || "+257 61 234 567",
    status: "active",
    currency: "BIF",
  });

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
    return `${greeting}, ${name.split(" ")[0]}`;
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

  if (loading && !refreshing) {
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
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
        notifications={notifications}
        onGoSettings={() => navigate("/settings")}
        onGoProfile={() => setActiveTab(4)} // Active l'onglet Profil (index 4)
        ordersCount={orders.length}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
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
        onConfirmDelete={handleDeleteAccount}
      />
    </Box>
  );
  <Footer/>
}