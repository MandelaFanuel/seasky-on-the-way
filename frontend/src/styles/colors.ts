// src/styles/colors.ts
export const SeaSkyColors = {
  primaryBlue: "#1E40AF",
  secondaryBlue: "#3B82F6",
  lightBlue: "#93C5FD",
  accent: "#10B981",
  white: "#FFFFFF",
  dark: "#1F2937",
  gray: "#6B7280",
  lightGray: "#F3F4F6",

  // ✅ Logo palette (si tu veux harmoniser encore plus)
  brandBlue: "#0B568C",
  steelBlue: "#335F7A",
  tealBlue: "#487F9A",
  accentSky: "#27B1E4",
  glowLight: "#E4F5FB",
  inkBlue: "#1A4F75"
};

export const SeaSkyGradients = {
  // ✅ Gradient principal du site (boutons)
  primary: `linear-gradient(135deg, ${SeaSkyColors.primaryBlue}, ${SeaSkyColors.secondaryBlue})`,

  // Variante logo
  logo: `linear-gradient(135deg, ${SeaSkyColors.brandBlue}, ${SeaSkyColors.accentSky})`,

  // Danger (KYC)
  danger: "linear-gradient(135deg, #DC2626, #EF4444)"
};