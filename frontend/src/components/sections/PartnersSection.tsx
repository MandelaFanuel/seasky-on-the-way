// ========================= src/components/sections/PartnersSection.tsx =========================
import React, { useEffect, useRef, useState } from "react";
import SectionTitle from "../../components/layout/SectionTitle";
import { Link } from "react-router-dom";

/** ✅ Badges partenaires (sans dépendances externes, design SeaSky)
 *  -> Tout en BLEU (Premium en OR comme demandé)
 */
type VerifiedTone = "blue";

const VerifiedSealIcon: React.FC<{ tone?: VerifiedTone; className?: string }> = ({ tone = "blue", className }) => {
  const sealColor = tone === "blue" ? "text-sky-600" : "text-sky-600";

  return (
    <svg className={`w-4 h-4 ${sealColor} ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.85 8.62a4 4 0 0 1 2.4-5.9 4 4 0 0 1 6.3-1.2 4 4 0 0 1 6.3 1.2 4 4 0 0 1 2.4 5.9 4 4 0 0 1 0 6.8 4 4 0 0 1-2.4 5.9 4 4 0 0 1-6.3 1.2 4 4 0 0 1-6.3-1.2 4 4 0 0 1-2.4-5.9 4 4 0 0 1 0-6.8Z"
        opacity="0.95"
      />
      <path
        fill="currentColor"
        d="M12 4.6c4.09 0 7.4 3.31 7.4 7.4s-3.31 7.4-7.4 7.4-7.4-3.31-7.4-7.4 3.31-7.4 7.4-7.4Z"
        opacity="0.18"
      />
      <path
        d="M9.2 12.1l1.8 1.8 3.9-3.9"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const VerifiedBadge: React.FC<{ tone?: VerifiedTone; label?: string }> = ({ tone = "blue", label = "Vérifié" }) => {
  const styles = "bg-sky-50 text-sky-800 border-sky-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${styles} shadow-[0_1px_0_rgba(2,132,199,0.10)]`}
    >
      <VerifiedSealIcon tone={tone} />
      {label}
    </span>
  );
};

/** ✅ Premium en OR (seul changement demandé) */
const PremiumBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-[11px] font-semibold border border-amber-200 shadow-[0_1px_0_rgba(245,158,11,0.16)]">
    <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.9L22 9.7l-5 5 1.2 7.3L12 18.7 5.8 22l1.2-7.3-5-5 7.1-0.8L12 2z" />
    </svg>
    Premium
  </span>
);

/** ✅ Pending en BLEU aussi */
const PendingBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-800 px-3 py-1 text-[11px] font-semibold border border-sky-200 shadow-[0_1px_0_rgba(2,132,199,0.10)]">
    <svg className="w-3.5 h-3.5 animate-spin-slow text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="6 6" />
    </svg>
    En validation
  </span>
);

type PartnerLevel = "premium" | "standard";

type Partner = {
  name: string;
  image: string;
  category: string;
  since: string;
  verified: boolean;
  level?: PartnerLevel;
};

type PartnersSectionProps = {
  pageReady: boolean;
};

const PartnersSection: React.FC<PartnersSectionProps> = ({ pageReady }) => {
  const [isPaused, setIsPaused] = useState(false);

  const partners: Partner[] = [
    { name: "Fanuel", image: "/images/partenaires/Fanuel2.jpg", category: "Distribution", since: "2015", verified: true, level: "premium" },
    { name: "Maison Médicale", image: "/images/partenaires/MaisonMedicale.jpg", category: "Santé & Nutrition", since: "2018", verified: true, level: "premium" },
    { name: "Polyclinique Muyinga", image: "/images/partenaires/PollyclinicMuyinga.jpg", category: "Santé & Bien-être", since: "2019", verified: false, level: "standard" },
    { name: "Roi Khaled", image: "/images/partenaires/RoisKhaled.jpg", category: "Commerce", since: "2016", verified: true, level: "premium" },
    { name: "Shem", image: "/images/partenaires/shem4.jpg", category: "Distribution", since: "2020", verified: false, level: "standard" },
    { name: "Pharmacie Umuco", image: "/images/partenaires/shem4.jpg", category: "Santé", since: "2021", verified: true, level: "standard" },
    { name: "Supermarké Tujenge", image: "/images/partenaires/shem4.jpg", category: "Commerce", since: "2017", verified: true, level: "standard" },
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fonction de défilement manuel
  const scroll = (dir: "left" | "right") => {
    if (scrollContainerRef.current) {
      setIsPaused(true);

      scrollContainerRef.current.scrollBy({
        left: dir === "left" ? -400 : 400,
        behavior: "smooth",
      });

      // Réactive le défilement automatique après 3 secondes
      setTimeout(() => setIsPaused(false), 3000);
    }
  };

  // Effet pour le défilement automatique
  useEffect(() => {
    if (!scrollContainerRef.current || isPaused || !pageReady) return;

    const container = scrollContainerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    let scrollPosition = container.scrollLeft;
    let direction = 1; // 1 pour droite, -1 pour gauche

    const autoScroll = () => {
      if (!scrollContainerRef.current || isPaused) return;

      scrollPosition += direction * 0.8; // Vitesse lente (0.8px par frame)

      // Changement de direction quand on atteint un bord
      if (scrollPosition >= scrollWidth - clientWidth) {
        direction = -1;
        scrollPosition = scrollWidth - clientWidth;
      } else if (scrollPosition <= 0) {
        direction = 1;
        scrollPosition = 0;
      }

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollPosition;
      }

      requestAnimationFrame(autoScroll);
    };

    const animationId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, pageReady]);

  return (
    <div className="mb-20">
      <SectionTitle kicker="Nos Partenaires" title="Ils Nous Font Confiance" centered />

      <div className="relative mt-12">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition border border-gray-200"
          aria-label="Défiler à gauche"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition border border-gray-200"
          aria-label="Défiler à droite"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide snap-x"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 1000)}
        >
          {partners.map((p, i) => (
            <div
              key={i}
              className="w-48 md:w-52 shrink-0 snap-start bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="h-36 md:h-40 bg-gradient-to-br from-[#0B568C] to-[#1A4F75] flex items-center justify-center transition-all duration-300 group-hover:from-[#1A4F75] group-hover:to-[#0B568C]">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-20 md:h-24 w-auto object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-[#1A4F75] leading-tight text-sm md:text-[15px] truncate">{p.name}</h3>
                  <div className="flex items-center gap-1.5 shrink-0">{p.level === "premium" ? <PremiumBadge /> : null}</div>
                </div>

                <div className="mt-2.5 flex justify-center">
                  {p.verified ? <VerifiedBadge tone="blue" label="Partner Verified" /> : <PendingBadge />}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#E4F5FB] text-[#335F7A] px-3 py-1 text-[11px] font-semibold border border-sky-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B568C]" />
                      {p.category}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-semibold text-[#5C7C95]">Depuis</span>
                    <span className="text-sm font-extrabold text-[#1A4F75] bg-white px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
                      {p.since}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/register"
            className="inline-flex items-center bg-gradient-to-r from-[#0B568C] to-[#1A4F75] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition"
          >
            Devenir Partenaire →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PartnersSection;
