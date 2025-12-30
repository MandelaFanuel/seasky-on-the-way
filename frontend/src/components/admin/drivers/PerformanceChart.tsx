// ========================= src/components/admin/drivers/PerformanceChart.tsx =========================
import React from "react";
import { Box, Typography, Divider } from "@mui/material";

export default function PerformanceChart({ data }: { data: any }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        (Placeholder) Performance globale — tu peux brancher des charts Recharts ici.
      </Typography>
      <Divider sx={{ my: 2 }} />
      <pre style={{ margin: 0, fontSize: 12, overflowX: "auto" }}>
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </Box>
  );
}
