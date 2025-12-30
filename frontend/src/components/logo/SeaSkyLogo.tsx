// src/components/logo/SeaSkyLogo.tsx
import React from "react";
import seaskyLogo1 from "../../assets/logos/seaskyLogo1.png";

type Props = {
  /** Taille en px (largeur = hauteur) */
  size?: number;
  /** Classes additionnelles (ex: rounded-lg) */
  className?: string;
  /** Accessibilité / alternative text */
  alt?: string;
};

const SeaSkyLogo: React.FC<Props> = ({ size = 48, className = "seaskyLogo", alt = "SeaSky" }) => {
  return (
    <img
      src={seaskyLogo1}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{
        // backgroundColor: "transparent",
      }}
      draggable={false}
    />
  );
};

export default SeaSkyLogo;