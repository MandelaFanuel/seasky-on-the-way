// ========================= src/components/sections/shared/SeaSkyMilkTitleCard.tsx =========================
import React from "react";

type SeaSkyMilkTitleCardProps = {
  kicker?: string; // ex: "SeaSky Lait"
  title?: string; // ex: "LAIT 100% BURUNDAIS - QUALITÉ PREMIUM"
  badges?: string[]; // ex: ["Qualité locale", "Fraîcheur garantie", "Livraison rapide"]
  align?: "left" | "center";
  /** Ajuste les tailles selon l'endroit: hero mobile / hero desktop / page (products) */
  variant?: "hero-mobile" | "hero-desktop" | "page";
  className?: string;
};

const SeaSkyMilkTitleCard: React.FC<SeaSkyMilkTitleCardProps> = ({
  kicker = "SeaSky Lait",
  title = "LAIT 100% BURUNDAIS - QUALITÉ PREMIUM",
  badges = ["Qualité locale", "Fraîcheur garantie", "Livraison rapide"],
  align = "left",
  variant = "page",
  className = "",
}) => {
  const isCenter = align === "center";

  const paddingClass =
    variant === "hero-mobile"
      ? "px-5 py-4"
      : variant === "hero-desktop"
      ? "px-6 py-5"
      : "px-5 py-4 sm:px-6 sm:py-5";

  const kickerClass =
    variant === "hero-mobile"
      ? "text-[11px]"
      : variant === "hero-desktop"
      ? "text-xs"
      : "text-xs sm:text-sm";

  const titleClass =
    variant === "hero-mobile"
      ? "text-[clamp(1.05rem,4.4vw,1.5rem)]"
      : variant === "hero-desktop"
      ? "text-[clamp(1.2rem,2.2vw,1.65rem)]"
      : "text-[clamp(1.15rem,3.8vw,1.9rem)]";

  const badgeTextClass = variant === "hero-mobile" ? "text-[11px]" : variant === "hero-desktop" ? "text-xs" : "text-[11px] sm:text-xs";

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`relative overflow-hidden rounded-2xl border border-[#E4F5FB] bg-linear-to-r from-[#0B568C] to-[#1A4F75] ${paddingClass} shadow-lg`}
      >
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

        <div className={`relative flex flex-col ${isCenter ? "items-center text-center" : "items-start text-left"} gap-3`}>
          <div className="w-full">
            <p className={`text-white/80 font-medium tracking-wide uppercase ${kickerClass}`}>{kicker}</p>

            <h1 className={`mt-1 text-white font-extrabold leading-tight ${titleClass}`}>{title}</h1>
          </div>

          <div className={`flex flex-wrap ${isCenter ? "justify-center" : "justify-start"} gap-2 ${badgeTextClass}`}>
            {badges.map((b) => (
              <span key={b} className="rounded-full bg-white/15 px-3 py-1 text-white/90 border border-white/20">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeaSkyMilkTitleCard;
