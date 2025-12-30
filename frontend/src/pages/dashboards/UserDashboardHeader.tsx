// ========================= src/pages/dashboard/components/UserDashboardHeader.tsx =========================
import React from "react";
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
  Divider,
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
  onGoProfile: () => void;  // Active l'onglet Profil (index 4)
  onOpenMobileMenu?: () => void;
};

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

              <Box
                sx={{
                  width: isHeaderExpanded ? (isMobile ? 44 : 56) : (isMobile ? 36 : 48),
                  height: isHeaderExpanded ? (isMobile ? 44 : 56) : (isMobile ? 36 : 48),
                  borderRadius: isHeaderExpanded ? (isMobile ? 2 : 3) : (isMobile ? 1 : 2),
                  backgroundColor: alpha(theme.palette.primary.main, isHeaderExpanded ? 0.1 : 0.08),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                className={isHeaderExpanded ? "animate-scaleIn" : ""}
              >
                <DashboardIcon
                  sx={{
                    fontSize: isHeaderExpanded ? (isMobile ? 24 : 32) : (isMobile ? 20 : 26),
                    color: theme.palette.primary.main,
                    transition: "all 0.3s ease",
                  }}
                />
              </Box>

              <Box className={isHeaderExpanded ? "animate-fadeInUp" : ""}>
                <Typography
                  variant={isHeaderExpanded ? (isMobile ? "h5" : "h4") : (isMobile ? "h6" : "h5")}
                  fontWeight={800}
                  sx={{
                    color: theme.palette.primary.dark,
                    mb: isHeaderExpanded ? (isMobile ? 0.25 : 0.5) : (isMobile ? 0 : 0.25),
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

            <Box display="flex" gap={1.5} flexWrap="wrap" className="animate-fadeInRight">
              {!isMobile && (
                <Tooltip title="Notifications">
                  <IconButton>
                    <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error">
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
                  <Avatar
                    sx={{
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      animation: isMobile ? "bounce-soft 2s ease-in-out infinite" : "none",
                    }}
                    src={user?.photo_url}
                  >
                    {user?.full_name?.[0] || "U"}
                  </Avatar>

                  <Box>
                    <Typography variant={isMobile ? "body1" : "subtitle1"} fontWeight={700}>
                      {user?.full_name || user?.username}
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
                    onClick={onGoProfile}  // Active l'onglet Profil (index 4)
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
              <Tab
                icon={isMobile ? <AccountBalanceWallet /> : undefined}
                label={isMobile ? "Portefeuille" : "Portefeuille"}
              />
              <Tab icon={isMobile ? <LocalShipping /> : undefined} label={isMobile ? "Commandes" : "Commandes"} />
              <Tab icon={isMobile ? <Store /> : undefined} label={isMobile ? "Points" : "Points de vente"} />
              <Tab icon={isMobile ? <Person /> : undefined} label="Profil" />
            </Tabs>
          </Box>

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
}