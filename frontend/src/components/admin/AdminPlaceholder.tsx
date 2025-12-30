// ========================= src/components/admin/AdminPlaceholder.tsx =========================
import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Construction, ArrowBack } from "@mui/icons-material";

interface AdminPlaceholderProps {
  title: string;
  message: string;
  onBack?: () => void;
}

export default function AdminPlaceholder({ title, message, onBack }: AdminPlaceholderProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
      p={4}
    >
      <Construction sx={{ fontSize: 80, color: "text.secondary", mb: 3 }} />
      <Typography variant="h5" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: "600px" }}>
        {message}
      </Typography>
      {onBack && (
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ mt: 2 }}
        >
          Retour au tableau de bord
        </Button>
      )}
    </Box>
  );
}