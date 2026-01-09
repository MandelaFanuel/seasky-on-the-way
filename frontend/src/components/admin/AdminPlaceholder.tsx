// ========================= src/components/admin/AdminPlaceholder.tsx =========================
import React from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  useMediaQuery,
  useTheme 
} from "@mui/material";
import { Construction, ArrowBack } from "@mui/icons-material";

interface AdminPlaceholderProps {
  title: string;
  message: string;
  onBack?: () => void;
}

export default function AdminPlaceholder({ title, message, onBack }: AdminPlaceholderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={isMobile ? "300px" : "400px"}
      p={isMobile ? 3 : 4}
      sx={{
        background: "linear-gradient(135deg, #E4F5FB 0%, #D1EBF5 100%)",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        margin: 2,
      }}
    >
      <Construction sx={{ 
        fontSize: isMobile ? 60 : 80, 
        color: theme.palette.primary.main, 
        mb: 3,
        opacity: 0.8 
      }} />
      
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        fontWeight={700}
        align="center"
        sx={{
          background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 2,
        }}
      >
        {title}
      </Typography>
      
      <Typography 
        variant={isMobile ? "body1" : "h6"} 
        color="text.secondary" 
        align="center" 
        sx={{ 
          mb: 3, 
          maxWidth: "600px",
          lineHeight: 1.6 
        }}
      >
        {message}
      </Typography>
      
      {onBack && (
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ 
            mt: 2,
            borderRadius: "50px",
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #0B568C 0%, #27B1E4 100%)",
            boxShadow: "0 8px 24px rgba(11, 86, 140, 0.3)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 12px 32px rgba(11, 86, 140, 0.4)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Retour au tableau de bord
        </Button>
      )}
    </Box>
  );
}