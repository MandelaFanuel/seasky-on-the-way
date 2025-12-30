// ========================= src/components/layout/Navigation.tsx =========================
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/store";
import type { RootState } from "../../store/store";
import Container from "./Container";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logos/seaskyLogo1.png";
import { useCart } from "../../components/sections/product/CartContext";
import { logoutUser } from "../../api/client";

// ✅ Couleurs & gradients SeaSky (THEME GLOBAL)
import { SeaSkyColors, SeaSkyGradients } from "../../styles/colors";

// ------------------------- helpers -------------------------
function toStr(v: any, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function initialsFrom(user?: { full_name?: string; username?: string }) {
  const name = (user?.full_name || user?.username || "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function pickPhotoUrl(u: any): string {
  return (
    toStr(u?.photo_url) ||
    toStr(u?.avatar_url) ||
    toStr(u?.photo) ||
    toStr(u?.profile_photo_url) ||
    toStr(u?.image_url) ||
    ""
  );
}

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProvincesOpen, setIsProvincesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ✅ Scroll direction logic
  const [showDashboardBar, setShowDashboardBar] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const dispatch = useDispatch();

  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.user;

  // ✅ photo (redux) -> s'actualise automatiquement dès que updateProfile() met à jour auth.user
  const userPhotoUrl = useMemo(() => pickPhotoUrl(user), [user]);

  const provinces = useMemo(
    () => [
      "Bujumbura Mairie",
      "Bujumbura Rural",
      "Bubanza",
      "Bururi",
      "Cankuzo",
      "Cibitoke",
      "Gitega",
      "Karusi",
      "Kayanza",
      "Kirundo",
      "Makamba",
      "Muramvya",
      "Muyinga",
      "Mwaro",
      "Ngozi",
      "Rumonge",
      "Rutana",
      "Ruyigi",
    ],
    []
  );

  const toggleMenu = () => setIsMenuOpen((p) => !p);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleProvinces = () => setIsProvincesOpen((p) => !p);
  const toggleUserMenu = () => setIsUserMenuOpen((p) => !p);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // ignore (on logout quand même)
      // eslint-disable-next-line no-console
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
      closeMenu();
    }
  };

  const handleMilkClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (window.location.pathname === "/") {
      const milkSection = document.getElementById("milk");
      if (milkSection) {
        milkSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/#milk");
      setTimeout(() => {
        window.location.href = "/#milk";
      }, 100);
    }

    closeMenu();
  };

  // ✅ Hover couleur contrôlée par SeaSkyColors (sans tailwind hardcodé)
  const hoverHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.color = SeaSkyColors.primaryBlue;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.color = SeaSkyColors.inkBlue;
    },
  };

  const hoverHandlersLight = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.color = SeaSkyColors.primaryBlue;
      (e.currentTarget as HTMLElement).style.backgroundColor = SeaSkyColors.glowLight;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.color = SeaSkyColors.inkBlue;
      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
    },
  };

  // Fermer les menus au clic en dehors (desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu") && !target.closest(".user-menu-button")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Scroll up/down => swap navbar vs dashboard bar
  useEffect(() => {
    const isDashboardRoute =
      location.pathname === "/dashboard" || location.pathname === "/admin/dashboard";

    // Si on n'est pas sur dashboard, on désactive
    if (!isDashboardRoute) {
      setShowDashboardBar(false);
      return;
    }

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastY;

          // ✅ Eviter le flicker près du top
          const pastThreshold = currentY > 120;

          if (pastThreshold) {
            if (delta < -6) {
              // scroll up
              setShowDashboardBar(true);
            } else if (delta > 6) {
              // scroll down
              setShowDashboardBar(false);
            }
          } else {
            // proche du haut => comportement normal
            setShowDashboardBar(false);
          }

          lastY = currentY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // ✅ Avatar component (photo -> sinon initiales)
  const Avatar = ({ size = 32 }: { size?: number }) => {
    const s = `${size}px`;
    return (
      <div
        className="rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-semibold border"
        style={{
          width: s,
          height: s,
          background: SeaSkyGradients.primary,
          borderColor: "rgba(255,255,255,0.35)",
        }}
      >
        {userPhotoUrl ? (
          <img
            src={userPhotoUrl}
            alt="Photo de profil"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="select-none">{initialsFrom(user || undefined)}</span>
        )}
      </div>
    );
  };

  const isAdminDashboard = location.pathname === "/admin/dashboard";
  const isUserDashboard = location.pathname === "/dashboard";
  const dashboardName = (user?.full_name || user?.username || "Utilisateur").trim();

  // ✅ Contenu de la barre "Dashboard"
  const DashboardBar = () => (
    <div className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto">
        <div className="flex items-center justify-between py-3 lg:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: 40,
                height: 40,
                background: SeaSkyGradients.primary,
              }}
            >
              <span className="text-white font-bold">S</span>
            </div>

            <div className="min-w-0">
              {isAdminDashboard ? (
                <>
                  <p
                    className="font-semibold truncate"
                    style={{ color: SeaSkyColors.dark }}
                    title="Dashboard Administrateur"
                  >
                    Dashboard Administrateur
                  </p>
                  <p className="text-sm truncate" style={{ color: SeaSkyColors.steelBlue }} title="Gestion des Chauffeurs">
                    Gestion des Chauffeurs
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="font-semibold truncate"
                    style={{ color: SeaSkyColors.dark }}
                    title={`Bonjour, ${dashboardName} 👋`}
                  >
                    Bonjour, {dashboardName} 👋
                  </p>
                  <p className="text-sm truncate" style={{ color: SeaSkyColors.steelBlue }} title="Gérez et suivez vos activités en temps réel">
                    Gérez et suivez vos activités en temps réel
                  </p>
                </>
              )}
            </div>
          </div>

          {/* à droite: avatar + lien rapide */}
          <div className="flex items-center gap-3 shrink-0">
            {auth.isAuthenticated && user ? (
              <>
                <Link
                  to={isAdminDashboard ? "/admin/dashboard" : "/dashboard"}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    borderColor: "rgba(0,0,0,0.08)",
                    color: SeaSkyColors.inkBlue,
                    backgroundColor: "rgba(255,255,255,0.7)",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = SeaSkyColors.glowLight)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.7)")}
                >
                  Ouvrir
                </Link>
                <Avatar size={34} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ si DashboardBar actif => on remplace visuellement la nav
  if (showDashboardBar && (isAdminDashboard || isUserDashboard)) {
    return <DashboardBar />;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 w-screen bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto">
        <div className="flex items-center justify-between py-3 lg:py-4">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center">
              <img src={logo} alt="SeaSky Logo" className="w-full h-full object-contain" />
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-medium" style={{ color: SeaSkyColors.steelBlue }}>
                Lait Premium
              </p>
              <p className="font-serif text-lg lg:text-xl font-bold" style={{ color: SeaSkyColors.dark }}>
                SeaSky On The Way
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 ml-8 lg:ml-12 xl:ml-16 justify-end">
            <div className="flex items-center gap-6 lg:gap-8 xl:gap-10">
              {/* Lait */}
              <a
                href="#milk"
                onClick={handleMilkClick}
                className="flex items-center gap-2 transition-colors font-medium text-sm lg:text-base"
                style={{ color: SeaSkyColors.inkBlue }}
                {...hoverHandlers}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                Lait
              </a>

              {/* Points de vente */}
              <div
                className="relative group"
                onMouseEnter={() => setIsProvincesOpen(true)}
                onMouseLeave={() => setIsProvincesOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-2 transition-colors font-medium text-sm lg:text-base"
                  style={{ color: SeaSkyColors.inkBlue }}
                  {...hoverHandlers}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Pts de vente
                  <svg className={`w-4 h-4 transition-transform ${isProvincesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProvincesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold" style={{ color: SeaSkyColors.dark }}>
                        Nos provinces
                      </h3>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {provinces.map((province, index) => (
                        <a
                          key={index}
                          href={`#${province.toLowerCase().replace(/\s+/g, "-")}`}
                          className="block px-4 py-2 text-sm transition-colors"
                          style={{ color: SeaSkyColors.inkBlue }}
                          {...hoverHandlersLight}
                        >
                          {province}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a
                href="#pharmacies"
                className="flex items-center gap-2 transition-colors font-medium text-sm lg:text-base"
                style={{ color: SeaSkyColors.inkBlue }}
                {...hoverHandlers}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                </svg>
                Pharmacies
              </a>

              <a href="#about" className="flex items-center gap-2 transition-colors font-medium text-sm lg:text-base" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlers}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                À propos
              </a>

              <a href="#contact" className="flex items-center gap-2 transition-colors font-medium text-sm lg:text-base" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlers}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contact
              </a>

              {/* Icône panier */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2 transition-colors font-medium text-sm lg:text-base"
                style={{ color: SeaSkyColors.inkBlue }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = SeaSkyColors.primaryBlue)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = SeaSkyColors.inkBlue)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>

                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Menu utilisateur */}
              {auth.isAuthenticated && user ? (
                <div className="relative user-menu">
                  <button
                    type="button"
                    onClick={toggleUserMenu}
                    className="user-menu-button flex items-center gap-2 transition-colors font-medium text-sm lg:text-base"
                    style={{ color: SeaSkyColors.inkBlue }}
                    {...hoverHandlers}
                  >
                    <Avatar size={32} />
                    <span className="hidden lg:inline">{user.full_name || user.username}</span>

                    <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold truncate" style={{ color: SeaSkyColors.dark }}>
                          {user.full_name || user.username}
                        </p>
                        <p className="text-xs truncate" style={{ color: SeaSkyColors.gray }}>
                          {user.email || user.phone}
                        </p>
                      </div>

                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: SeaSkyColors.inkBlue }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = SeaSkyColors.glowLight)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                        onClick={closeMenu}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                          Tableau de bord
                        </div>
                      </Link>

                      <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Se déconnecter
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 transition-colors font-medium text-sm lg:text-base" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlers}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Se connecter
                </Link>
              )}
            </div>
          </div>

          {/* Menu mobile (burger icon) */}
          <div className="md:hidden flex items-center gap-4">
            {/* Panier mobile */}
            <Link
              to="/cart"
              className="relative transition-colors"
              style={{ color: SeaSkyColors.inkBlue }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = SeaSkyColors.primaryBlue)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = SeaSkyColors.inkBlue)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>

              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="transition-colors focus:outline-none p-1"
              style={{ color: SeaSkyColors.inkBlue }}
              onClick={toggleMenu}
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 animate-fadeIn">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto">
            <div className="py-4">
              <div className="flex flex-col space-y-4">
                {/* Liens principaux */}
                <a href="#milk" onClick={handleMilkClick} className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlersLight}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  Lait
                </a>

                {/* Points de vente */}
                <div>
                  <button type="button" className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors w-full text-left" style={{ color: SeaSkyColors.inkBlue }} onClick={toggleProvinces}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pts de vente
                    <svg className={`w-4 h-4 ml-auto transition-transform ${isProvincesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isProvincesOpen && (
                    <div className="ml-6 mt-2 border-l-2 border-gray-200 pl-2 space-y-2">
                      {provinces.map((province, index) => (
                        <a
                          key={index}
                          href={`#${province.toLowerCase().replace(/\s+/g, "-")}`}
                          className="block py-2 px-4 text-sm rounded-lg transition-colors"
                          style={{ color: SeaSkyColors.inkBlue }}
                          {...hoverHandlersLight}
                          onClick={closeMenu}
                        >
                          {province}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <a href="#pharmacies" className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlersLight} onClick={closeMenu}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  </svg>
                  Pharmacies
                </a>

                <a href="#about" className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlersLight} onClick={closeMenu}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  À propos
                </a>

                <a href="#contact" className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlersLight} onClick={closeMenu}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Contact
                </a>

                {/* Panier mobile */}
                <Link to="/cart" className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlersLight} onClick={closeMenu}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Panier ({getTotalItems()})
                </Link>

                {/* User mobile */}
                {auth.isAuthenticated && user ? (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar size={40} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: SeaSkyColors.dark }}>
                          {user.full_name || user.username}
                        </p>
                        <p className="text-sm truncate" style={{ color: SeaSkyColors.gray }}>
                          {user.email || user.phone}
                        </p>
                      </div>
                    </div>

                    <Link to="/dashboard" className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors mb-2" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlersLight} onClick={closeMenu}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      Tableau de bord
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-red-600 font-medium py-2 px-2 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center gap-3 font-medium py-2 px-2 rounded-lg transition-colors" style={{ color: SeaSkyColors.inkBlue }} {...hoverHandlersLight} onClick={closeMenu}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;