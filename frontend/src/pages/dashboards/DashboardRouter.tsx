// ========================= src/pages/dashboards/DashboardRouter.tsx =========================
import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

function isAdmin(user: any): boolean {
  if (!user) return false;
  if (user.is_superuser === true) return true;
  if (user.is_staff === true) return true;

  const role = String(user.role || "").toLowerCase();
  if (["admin", "super_admin", "staff"].includes(role)) return true;

  return false;
}

export default function DashboardRouter() {
  const location = useLocation();
  const auth = useSelector((state: RootState) => state.auth);
  const user = (auth as any)?.user;

  const to = useMemo(() => (isAdmin(user) ? "/dashboard/admin" : "/dashboard/user"), [user]);

  return <Navigate to={to} replace state={{ from: location.pathname || location }} />;
}
