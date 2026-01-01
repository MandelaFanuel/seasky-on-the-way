// ========================= src/components/sections/Hero.tsx =========================
import React, { useEffect, useMemo, useState } from "react";
import Container from "../../components/layout/Container";
import { Link } from "react-router-dom";
import SeaSkyMilkTitleCard from "./shared/SeaSkyMilkTitleCard";

type StatItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const Hero: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * ✅ Auth réelle (simple & robuste)
   * - Si ton app stocke un token dans localStorage (JWT), on le détecte.
   * - Ajuste les clés si besoin: "accessToken", "token", "access"
   */
  const isAuthenticated = useMemo(() => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access") ||
        localStorage.getItem("auth_token");
      return !!token;
    } catch {
      return false;
    }
  }, []);

  const possibleImagePaths = [
    "/images/seasky8.webp", // ✅ public/images/seasky8.webp
    // "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageUrl = possibleImagePaths[currentImageIndex];

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      if (currentImageIndex < possibleImagePaths.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      } else {
        setImageError(true);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, currentImageIndex]);

  const stats: StatItem[] = [
    {
      label: "Partenariats",
      value: "120+",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 10-8 0v4m-2 0h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      label: "Fournisseurs",
      value: "300+",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      ),
    },
    {
      label: "Livreurs",
      value: "500+",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Livraisons",
      value: "10K+",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-2 7H6l-2-7m16 0H4" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#E4F5FB] to-[#D1EBF5] mt-16 md:mt-0">
      <Container>
        {/* ✅ HERO TITLE CARD (réutilisable) - Mobile */}
        <div className="lg:hidden animate-fade-in-up mb-5 flex flex-col items-center mt-10">
          <div className="relative w-full max-w-2xl">
            <SeaSkyMilkTitleCard variant="hero-mobile" align="center" />
          </div>

          {/* ✅ Titre en dessous du badge (mobile uniquement) */}
          <div className="mt-4 text-center w-full">
            <h2 className="text-3xl font-bold leading-tight text-[#1A4F75]">
              <span className="block">L&apos;Excellence</span>
              <span className="bg-gradient-to-r from-[#0B568C] to-[#27B1E4] bg-clip-text text-transparent">Laitière</span>
              <span className="block">à Votre Portée</span>
            </h2>
          </div>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center min-h-screen py-12 sm:py-16 lg:py-20">
          {/* Texte */}
          <div className="order-2 lg:order-1 text-left">
            <div className="animate-fade-in-up mb-6 sm:mb-8">
              {/* ✅ HERO TITLE CARD (réutilisable) - Desktop */}
              <div className="hidden lg:block mb-8">
                <SeaSkyMilkTitleCard variant="hero-desktop" align="left" />
              </div>

              {/* ✅ Titre desktop inchangé */}
              <h2 className="hidden lg:block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-[#1A4F75]">
                <span className="block">L&apos;Excellence</span>
                <span className="bg-gradient-to-r from-[#0B568C] to-[#27B1E4] bg-clip-text text-transparent">Laitière</span>
                <span className="block">à Votre Portée</span>
              </h2>
            </div>

            <p
              className="animate-fade-in-up text-sm sm:text-base md:text-lg text-[#335F7A] mb-6 sm:mb-8 md:mb-10 max-w-2xl leading-relaxed font-light"
              style={{ animationDelay: "0.2s" }}
            >
              Découvrez le lait le plus pur des plateaux burundais, soigneusement collecté, traité avec expertise et livré avec passion pour enrichir votre quotidien. SeaSky On The Way, la solution sur le chômage pour les jeunes au Burundi, plus de chômage, réveillez-vous et venez travailler avec nous.
            </p>

            {/* ✅ Boutons conditionnels */}
            <div
              className="animate-fade-in-up flex flex-row flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10"
              style={{ animationDelay: "0.4s" }}
            >
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="
                      bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white
                      px-3 sm:px-4 md:px-6 lg:px-8
                      py-2 sm:py-2.5 md:py-3
                      rounded-full font-semibold
                      hover:from-[#0A345F] hover:to-[#0B568C]
                      transition-all duration-300
                      flex items-center justify-center gap-2 group
                      shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                      text-xs sm:text-sm md:text-base
                      w-[180px] sm:w-auto
                    "
                  >
                    Rejoignez nous
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <Link
                    to="/register"
                    className="
                      border-2 border-[#0B568C] text-[#0B568C]
                      px-3 sm:px-4 md:px-6 lg:px-8
                      py-2 sm:py-2.5 md:py-3
                      rounded-full font-semibold
                      hover:bg-[#0B568C] hover:text-white
                      transition-all duration-300
                      flex items-center justify-center gap-2
                      shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                      text-xs sm:text-sm md:text-base
                      w-[180px] sm:w-auto
                    "
                  >
                    Devenez Livreur
                    <svg className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </>
              ) : (
                <Link
                  to="/points-de-vente"
                  className="
                    bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white
                    px-3 sm:px-4 md:px-6 lg:px-8
                    py-2 sm:py-2.5 md:py-3
                    rounded-full font-semibold
                    hover:from-[#0A345F] hover:to-[#0B568C]
                    transition-all duration-300
                    flex items-center justify-center gap-2 group
                    shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                    text-xs sm:text-sm md:text-base
                    w-[220px] sm:w-auto
                  "
                >
                  Nos points de vente
                  <svg
                    className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              )}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <div className="flex items-center gap-2 sm:gap-3 text-[#487F9A] bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 max-w-md shadow-sm border border-white">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Disponible dans toutes les provinces du Burundi.</span>
              </div>
            </div>
          </div>

          {/* Image + Stats */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20">
              <div
                className="relative w-full h-[380px] sm:h-[420px] md:h-[480px] lg:h-[620px] bg-cover bg-center rounded-2xl"
                style={{
                  backgroundImage: imageLoaded ? `url(${imageUrl})` : "none",
                  backgroundColor: "#487F9A",
                }}
              >
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#487F9A]/80 rounded-2xl">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-white mx-auto mb-2" />
                      <p className="text-xs sm:text-sm md:text-base">Chargement de l&apos;image...</p>
                    </div>
                  </div>
                )}

                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#487F9A] rounded-2xl">
                    <div className="text-white text-center p-4">
                      <svg className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="font-semibold text-xs sm:text-sm md:text-base">Image non disponible</p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A345F]/30 rounded-2xl" />
              </div>
            </div>

            <div className="mt-3 sm:mt-4 md:mt-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-white/85 backdrop-blur-md border border-white rounded-2xl p-2 sm:p-3 md:p-4 shadow-lg">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-xl bg-[#0B568C]/10 text-[#0B568C] flex items-center justify-center">
                      {React.cloneElement(s.icon as React.ReactElement, {
                        className: "h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5",
                      })}
                    </div>
                    <div className="leading-tight">
                      <div className="text-[#0A345F] font-bold text-xs sm:text-sm md:text-base">{s.value}</div>
                      <div className="text-xs text-[#335F7A]">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 bottom-6 z-10 flex-col items-center">
            <div className="text-xs tracking-widest text-[#0B568C] font-semibold uppercase mb-2">Scroll</div>
            <div className="h-11 w-7 rounded-full border-2 border-[#0B568C]/50 flex items-start justify-center p-1 bg-white/40 backdrop-blur-sm">
              <div className="w-[4px] h-[14px] rounded-full bg-[#0B568C] animate-bounce" />
            </div>
            <div className="mt-2 text-[11px] text-[#335F7A] opacity-80">Découvrir plus</div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
