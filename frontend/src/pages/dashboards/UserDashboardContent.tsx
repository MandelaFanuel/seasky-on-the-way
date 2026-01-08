// ========================= src/pages/dashboard/components/UserDashboardContent.tsx =========================
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
}