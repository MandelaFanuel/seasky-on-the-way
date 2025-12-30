// ========================= src/components/PublicRoute.tsx =========================
import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import { RootState } from "../store/store";
import LoadingSpinner from "./ui/LoadingSpinner";

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // ✅ ton slice = hasHydrated
  const hasHydrated = (auth as any).hasHydrated ?? false;

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
