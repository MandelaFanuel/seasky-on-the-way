// ========================= src/App.tsx =========================
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import QRScan from "./pages/qrcodes/ScanPage";
import Home from "./pages/Home";
import UserProfile from "./pages/profile/UserProfile";
import Products from "./components/sections/product/Products";

import Navigation from "./components/layout/Navigation";
import { CartProvider } from "./components/sections/product/CartContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import { markHydrated } from "./store/store";

// ✅ dashboards
import DashboardRouter from "./pages/dashboards/DashboardRouter";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import UserDashboard from "./pages/dashboards/UserDashboard";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(markHydrated());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CartProvider>
        <Navigation />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected dashboards */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* QR Scan (Protected) */}
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <QRScan />
              </ProtectedRoute>
            }
          />

          {/* Alias admin (Protected aussi) */}
          <Route
            path="/admin/qr-scan"
            element={
              <ProtectedRoute>
                <QRScan />
              </ProtectedRoute>
            }
          />

          {/* Other protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </div>
  );
}

export default App;
