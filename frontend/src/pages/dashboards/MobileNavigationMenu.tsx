// ========================= src/pages/dashboard/components/MobileNavigationMenu.tsx =========================
import React from "react";
import {
  SwipeableDrawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Box,
  Divider,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  AccountBalanceWallet,
  LocalShipping,
  Store,
  Person,
  Notifications,
  Settings,
  QrCodeScanner,
  ContactSupport,
  ReceiptLong,
  Message,
  Logout,
  Home,
  History,
} from "@mui/icons-material";

interface MobileNavigationMenuProps {
  open: boolean;
  onClose: () => void;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  onNavigate: (path: string) => void;
  notificationsCount: number;
}

const MobileNavigationMenu: React.FC<MobileNavigationMenuProps> = ({
  open,
  onClose,
  activeTab,
  setActiveTab,
  onNavigate,
  notificationsCount,
}) => {
  const theme = useTheme();

  const mainMenuItems = [
    { icon: <DashboardIcon />, label: "Tableau de bord", value: 0 },
    { icon: <AccountBalanceWallet />, label: "Portefeuille", value: 1 },
    { icon: <LocalShipping />, label: "Commandes", value: 2 },
    { icon: <Store />, label: "Points de vente", value: 3 },
    { icon: <Person />, label: "Profil", value: 4 },
  ];

  const quickActions = [
    { icon: <Home />, label: "Accueil", action: () => onNavigate("/") },
    { icon: <QrCodeScanner />, label: "Scanner QR", action: () => onNavigate("/scan") },
    { icon: <ContactSupport />, label: "Support", action: () => onNavigate("/support") },
    { icon: <ReceiptLong />, label: "Documents", action: () => onNavigate("/documents") },
    { icon: <Message />, label: "Messages", action: () => onNavigate("/messages") },
    { icon: <Settings />, label: "Paramètres", action: () => onNavigate("/settings") },
    { icon: <History />, label: "Historique", action: () => onNavigate("/history") },
  ];

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      sx={{
        "& .MuiDrawer-paper": {
          width: 280,
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          borderRight: "1px solid rgba(11, 86, 140, 0.1)",
          marginTop: 10,
        },
      }}
    >
      <Box sx={{ p: 3, background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)", color: "white" }} className="animate-fadeInDown">
        <Typography variant="h6" fontWeight={700}>
          Navigation
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Menu principal
        </Typography>
      </Box>

      <List sx={{ py: 2 }}>
        {mainMenuItems.map((item, index) => (
          <ListItemButton
            key={item.value}
            selected={activeTab === item.value}
            onClick={() => {
              setActiveTab(item.value);
              onClose();
            }}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              },
            }}
            className="animate-fadeInLeft"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ListItemIcon sx={{ color: activeTab === item.value ? theme.palette.primary.main : "#487F9A" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: activeTab === item.value ? 700 : 500,
                color: activeTab === item.value ? theme.palette.primary.dark : "#1A4F75",
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" fontWeight={700} color="#335F7A" sx={{ mb: 2, display: "block" }}>
          ACTIONS RAPIDES
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
          {quickActions.map((action, index) => (
            <Box
              key={action.label}
              onClick={() => {
                action.action();
                onClose();
              }}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "white",
                border: "1px solid rgba(11, 86, 140, 0.1)",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  transform: "translateY(-2px)",
                },
              }}
              className="animate-scaleIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1,
                }}
              >
                <Box sx={{ color: theme.palette.primary.main }}>{action.icon}</Box>
              </Box>
              <Typography variant="caption" fontWeight={600} color="#1A4F75">
                {action.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <List sx={{ py: 2 }}>
        <ListItemButton
          sx={{ mx: 1, borderRadius: 2 }}
          onClick={() => {
            onNavigate("/notifications");
            onClose();
          }}
          className="animate-fadeInRight"
        >
          <ListItemIcon>
            <Badge badgeContent={notificationsCount} color="error">
              <Notifications />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Notifications" primaryTypographyProps={{ fontWeight: 600, color: "#1A4F75" }} />
        </ListItemButton>

        <ListItemButton
          sx={{ mx: 1, borderRadius: 2, mt: 1 }}
          onClick={() => {
            onNavigate("/logout");
            onClose();
          }}
          className="animate-fadeInRight"
          style={{ animationDelay: "100ms" }}
        >
          <ListItemIcon>
            <Logout color="error" />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontWeight: 600, color: "#F44336" }} />
        </ListItemButton>
      </List>

      <Box sx={{ mt: "auto", p: 3, borderTop: "1px solid rgba(11, 86, 140, 0.1)" }}>
        <Typography variant="caption" color="#487F9A" sx={{ display: "block", textAlign: "center" }}>
          © {new Date().getFullYear()} SeaSky
        </Typography>
        <Typography variant="caption" color="#487F9A" sx={{ display: "block", textAlign: "center" }}>
          Version 2.0.0
        </Typography>
      </Box>
    </SwipeableDrawer>
  );
};

export default MobileNavigationMenu;
