// ========================= src/components/ProtectedRoute.tsx =========================
import React, { ReactNode, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import { RootState, setUser, logout, markHydrated } from "../store/store";
import { getCurrentUser } from "../api/client";
import LoadingSpinner from "./ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);

  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!auth.accessToken) {
          dispatch(markHydrated());
          setLoading(false);
          return;
        }

        const userData = await getCurrentUser();
        dispatch(setUser(userData));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Token invalide ou expiré:", error);
        dispatch(logout());
      } finally {
        dispatch(markHydrated());
        setLoading(false);
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.accessToken, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
