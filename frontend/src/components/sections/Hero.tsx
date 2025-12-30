import React, { useEffect, useState } from "react";
import Container from "../../components/layout/Container";
import { Link } from "react-router-dom";

type StatItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const Hero: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const possibleImagePaths = [
    "/images/seasky8.webp",
    "/src/assets/images/seasky8.webp",
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
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

  // ✅ Stats (tu peux ajuster)
  const stats: StatItem[] = [
    {
      label: "Partenariats",
      value: "120+",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4m-2 0h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z" />
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
        {/* ✅ Zone 2 colonnes + scroll au milieu (positionné en bas) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-16 lg:py-20">
          {/* Texte */}
          <div className="text-left">
            <div className="animate-fade-in-up mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A345F] to-[#0B568C] text-white rounded-full px-5 py-2.5 mb-8 shadow-md">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <span className="text-xs font-medium tracking-wider">LAIT 100% BURUNDAIS - QUALITÉ PREMIUM</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-[#1A4F75]">
                <span className="block">L&apos;Excellence</span>
                <span className="bg-gradient-to-r from-[#0B568C] to-[#27B1E4] bg-clip-text text-transparent">
                  Laitière
                </span>
                <span className="block">à Votre Portée</span>
              </h1>
            </div>

            <p
              className="animate-fade-in-up text-lg text-[#335F7A] mb-10 max-w-2xl leading-relaxed font-light"
              style={{ animationDelay: "0.2s" }}
            >
              Découvrez le lait le plus pur des plateaux burundais, soigneusement collecté, traité avec expertise et livré
              avec passion pour enrichir votre quotidien. SeaSky On The Way, la solution sur le chômage pour les jeunes au
              Burundi, plus de chômage, réveillez-vous et venez travailler avec nous.
            </p>

            <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 mb-10" style={{ animationDelay: "0.4s" }}>
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white px-8 py-4 rounded-full font-semibold hover:from-[#0A345F] hover:to-[#0B568C] transition-all duration-300 flex items-center gap-2 group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Rejoignez nous maintenant
                <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                to="/register"
                className="border-2 border-[#0B568C] text-[#0B568C] px-8 py-4 rounded-full font-semibold hover:bg-[#0B568C] hover:text-white transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Devenez Livreur
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <div className="flex items-center gap-3 text-[#487F9A] bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 max-w-md shadow-sm border border-white">
                <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Disponible dans toutes les provinces du Burundi.</span>
              </div>
            </div>
          </div>

          {/* Image + Stats en dessous */}
          <div className="relative">
            {/* Image card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20">
              <div
                className="relative w-full h-[520px] lg:h-[620px] bg-cover bg-center rounded-2xl"
                style={{
                  backgroundImage: imageLoaded ? `url(${imageUrl})` : "none",
                  backgroundColor: "#487F9A",
                }}
              >
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#487F9A]/80 rounded-2xl">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2" />
                      <p>Chargement de l&apos;image...</p>
                    </div>
                  </div>
                )}

                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#487F9A] rounded-2xl">
                    <div className="text-white text-center p-4">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="font-semibold">Image non disponible</p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A345F]/30 rounded-2xl" />
              </div>
            </div>

            {/* ✅ Stats BAR: en dessous de l'image (pas dessus) */}
            <div className="mt-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/85 backdrop-blur-md border border-white rounded-2xl p-4 shadow-lg">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#0B568C]/10 text-[#0B568C] flex items-center justify-center">
                      {s.icon}
                    </div>
                    <div className="leading-tight">
                      <div className="text-[#0A345F] font-bold">{s.value}</div>
                      <div className="text-xs text-[#335F7A]">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Scroll indicator: centré entre les 2 colonnes, en bas */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 bottom-6 z-10 flex-col items-center">
            <div className="text-xs tracking-widest text-[#0B568C] font-semibold uppercase mb-2">
              Scroll
            </div>

            <div className="h-11 w-7 rounded-full border-2 border-[#0B568C]/50 flex items-start justify-center p-1 bg-white/40 backdrop-blur-sm">
              <div className="w-[4px] h-[14px] rounded-full bg-[#0B568C] animate-bounce" />
            </div>


            <div className="mt-2 text-[11px] text-[#335F7A] opacity-80">
              Découvrir plus
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
