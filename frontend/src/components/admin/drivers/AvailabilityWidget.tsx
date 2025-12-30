// ========================= src/components/admin/drivers/AvailabilityWidget.tsx =========================
import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress, Alert } from "@mui/material";
import api from "../../../services/api";

export default function AvailabilityWidget() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/drivers/stats/");
      setData(res.data);
      setError(null);
    } catch (e: any) {
      setError("Impossible de charger la disponibilité.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 15000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const available = data?.available ?? data?.available_now ?? 0;
  const total = data?.total ?? data?.count ?? 0;

  return (
    <Box>
      <Typography variant="h6" fontWeight={800}>
        {available} / {total}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Chauffeurs disponibles
      </Typography>
    </Box>
  );
}
