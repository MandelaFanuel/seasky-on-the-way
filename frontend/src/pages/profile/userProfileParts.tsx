// ========================= src/pages/profile/userProfileParts.tsx =========================
import React from "react";
import { SeaSkyColors } from "../../styles/colors";
import Cropper from "react-easy-crop";
import type { ExtendedUserRegistrationData } from "../../pages/types/auth.types";

// ------------------------- Types -------------------------
export interface ProfileTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed?: boolean;
}

export interface UserDocumentItem {
  id: number;
  document_type: string;
  file: string;
  file_name?: string;
  description?: string;
  uploaded_at?: string;
  verified?: boolean;
  expiry_date?: string | null;
}

export type Area = { x: number; y: number; width: number; height: number };

// ------------------------- Utils -------------------------
export function toStr(v: any, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

export function toBool(v: any, fallback = false): boolean {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return Boolean(v);
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(s)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(s)) return false;
  }
  return fallback;
}

export function toArr(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === "") return [];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [v];
    }
  }
  return [v];
}

export function safeDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function initialsFrom(user?: { full_name?: string; username?: string }) {
  const name = (user?.full_name || user?.username || "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / (3600 * 24));
  const hours = Math.floor((total % (3600 * 24)) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}j ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function pickPhotoUrl(u: any): string {
  return (
    toStr(u?.photo_url) ||
    toStr(u?.avatar_url) ||
    toStr(u?.photo) ||
    toStr(u?.profile_photo_url) ||
    toStr(u?.image_url) ||
    ""
  );
}

export function pickAccountCreatedAt(u: any): Date | null {
  return safeDate(u?.created_at) || safeDate(u?.date_joined) || null;
}

export function hasValue(v: any) {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

export function isPdfUrl(url: string) {
  const u = (url || "").toLowerCase();
  return u.includes(".pdf") || u.startsWith("data:application/pdf");
}

export function guessDocLabel(doc: UserDocumentItem): string {
  const type = toStr(doc?.document_type);
  const name = toStr(doc?.file_name);
  const desc = toStr(doc?.description);
  return desc || name || type || "Document";
}

export function getAccountSubtypeLabel(u: any): string {
  const fromBackend = toStr(u?.account_category_label).trim();
  if (fromBackend) return fromBackend;

  const accountType = toStr(u?.account_type).toLowerCase();
  if (accountType === "client") return toStr(u?.client_type).trim() || "";
  if (accountType === "fournisseur") return toStr(u?.supplier_type).trim() || "";
  if (accountType === "livreur") return toStr(u?.delivery_type).trim() || "";
  if (accountType === "commercant") return toStr(u?.boutique_type).trim() || "";
  return "";
}

export function getAccountTypeLabel(u: any): string {
  const backendLabel = toStr(u?.account_type_label).trim();
  if (backendLabel) return backendLabel.toUpperCase();
  const t = toStr(u?.account_type).trim();
  return t ? t.toUpperCase() : "";
}

export function formatLabelTitleCase(s: string) {
  const v = (s || "").trim();
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export function formatGender(v: any) {
  const g = toStr(v).trim().toLowerCase();
  if (!g) return "";
  if (["m", "male", "homme"].includes(g)) return "Homme";
  if (["f", "female", "femme"].includes(g)) return "Femme";
  return toStr(v);
}

export function formatDateFr(v: any) {
  const s = toStr(v).trim();
  if (!s) return "";
  const d = safeDate(s);
  if (!d) return s;
  try {
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return s;
  }
}

// ------------------------- Crop helpers -------------------------
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

export async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Crop failed"));
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

export function blobToFile(blob: Blob, filename: string) {
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

// ------------------------- UI atoms -------------------------
export function StatusBadge({
  tone,
  label,
  rightIcon,
}: {
  tone: "green" | "yellow" | "red" | "blue" | "gray";
  label: string;
  rightIcon?: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border backdrop-blur-sm";

  const styles: Record<string, string> = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    yellow: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-sky-50 border-sky-200 text-sky-800",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  return (
    <span className={`${base} ${styles[tone]}`}>
      {label}
      {rightIcon ? <span className="opacity-95">{rightIcon}</span> : null}
    </span>
  );
}

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  const steel = SeaSkyColors.steelBlue || "#335F7A";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm border text-white"
      style={{ backgroundColor: steel, borderColor: steel }}
    >
      <span>{label}</span>
      <svg className="h-3.5 w-3.5" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 4l6 7 9-2 3 9 9 3-2 9 7 6-7 6 2 9-9 3-3 9-9-2-6 7-6-7-9 2-3-9-9-3 2-9-7-6 7-6-2-9 9-3 3-9 9 2 6-7z"
          fill="#E4F5FB"
        />
        <path d="M26.5 35.5l-6-6 3-3 3 3 14-14 3 3-17 17z" fill="#1A4F75" />
      </svg>
    </span>
  );
}

export function StepStateBadge({ completed }: { completed: boolean }) {
  return completed ? <VerifiedBadge label="✓" /> : <StatusBadge tone="red" label="•" />;
}

export function DocPreviewCard({
  title,
  url,
  meta,
}: {
  title: string;
  url?: string;
  meta?: React.ReactNode;
}) {
  if (!url) return null;
  const pdf = isPdfUrl(url);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-shadow duration-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-between gap-3">
        <span className="truncate">{title}</span>
        {meta ? <span className="shrink-0">{meta}</span> : null}
      </div>

      <div className="p-4">
        {pdf ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(228,245,251,0.9)" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: SeaSkyColors.brandBlue }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8M8 17h8" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate">PDF</div>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold underline"
                  style={{ color: SeaSkyColors.brandBlue }}
                >
                  Ouvrir
                </a>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={url}
            alt={title}
            className="w-full h-40 object-cover rounded-xl border border-gray-200"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

export function PhoneCallButton({ phone }: { phone?: string }) {
  const clean = (phone || "").trim();
  if (!clean) return null;

  return (
    <a
      href={`tel:${clean}`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-xl border shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5"
      style={{
        borderColor: SeaSkyColors.brandBlue,
        backgroundColor: "rgba(228,245,251,0.9)",
        color: SeaSkyColors.brandBlue,
      }}
      title="Appeler"
      aria-label="Appeler"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.11a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

// Buttons
export function HeroPrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-4 py-2" : "px-5 py-2.5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white rounded-full font-semibold",
        "hover:from-[#1A4F75] hover:to-[#0B568C]",
        "transition-all duration-200 flex items-center gap-2 group shadow hover:shadow-md transform hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "justify-center",
        padding,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function HeroOutlineButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-4 py-2" : "px-5 py-2.5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "border-2 border-[#0B568C] text-[#0B568C] rounded-full font-semibold",
        "hover:bg-[#0B568C] hover:text-white",
        "transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow transform hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "justify-center",
        padding,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function InlineCountdown({ remainingMs }: { remainingMs: number }) {
  return (
    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-red-700 shadow-sm">
      {formatDuration(remainingMs)}
    </span>
  );
}

export function ProfileStepCard({
  label,
  completed,
  active,
  onClick,
  disabled,
}: {
  label: string;
  completed: boolean;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const steel = SeaSkyColors.steelBlue || "#335F7A";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 w-full border ${
        active ? "bg-white shadow-sm ring-2 ring-[#27B1E4]/50" : "bg-white/80 backdrop-blur-sm hover:shadow-sm"
      } ${disabled ? "opacity-50 cursor-not-allowed hover:shadow-none" : ""}`}
      style={{ borderColor: active ? SeaSkyColors.brandBlue : "#E5E7EB" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: completed ? "rgba(51,95,122,0.12)" : active ? "rgba(39,177,228,0.15)" : "rgba(243,244,246,0.8)",
          color: completed ? steel : active ? SeaSkyColors.brandBlue : SeaSkyColors.gray,
        }}
      >
        {completed ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="text-sm font-bold">{label.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold truncate" style={{ color: active ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue }}>
            {label}
          </span>
          <StepStateBadge completed={Boolean(completed)} />
        </div>
      </div>
    </button>
  );
}

// ------------------------- Data Display Components -------------------------
export function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: SeaSkyColors.steelBlue }}>
        {label}
      </div>
      <div className="text-sm font-medium" style={{ color: SeaSkyColors.inkBlue }}>
        {value || "—"}
      </div>
    </div>
  );
}

export function PersonalInfoDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Nom Complet" value={toStr((formData as any).full_name)} />
      <DataField label="Nom d'utilisateur" value={toStr((formData as any).username)} />
      <DataField label="Email" value={toStr((formData as any).email)} />
      <DataField label="Téléphone" value={toStr((formData as any).phone)} />
      <DataField label="Genre" value={formatGender((formData as any).gender)} />
      <DataField label="Date de naissance" value={formatDateFr((formData as any).date_of_birth)} />
      <DataField label="Nationalité" value={toStr((formData as any).nationality)} />
      <DataField label="Numéro Lumicash" value={toStr((formData as any).lumicash_msisdn)} />
    </div>
  );
}

export function AddressDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Adresse" value={toStr((formData as any).address_line)} />
      <DataField label="Province" value={toStr((formData as any).province)} />
      <DataField label="Commune" value={toStr((formData as any).commune)} />
      <DataField label="Colline/Quartier" value={toStr((formData as any).colline_or_quartier)} />
      <DataField label="Contact d'urgence" value={toStr((formData as any).emergency_contact_name)} />
      <DataField label="Tél d'urgence" value={toStr((formData as any).emergency_contact_phone)} />
      <DataField label="Relation" value={toStr((formData as any).emergency_contact_relationship)} />
    </div>
  );
}

export function IdentityDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Type de pièce" value={toStr((formData as any).id_type)} />
      <DataField label="Numéro" value={toStr((formData as any).id_number)} />
      <DataField label="Date d'émission" value={formatDateFr((formData as any).id_issue_date)} />
      <DataField label="Date d'expiration" value={formatDateFr((formData as any).id_expiry_date)} />
      <DataField label="Pas d'expiration" value={(formData as any).id_no_expiry ? "Oui" : "Non"} />
    </div>
  );
}

export function BoutiqueDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  const services = (formData as any).boutique_services;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Type de boutique" value={toStr((formData as any).boutique_type)} />
      <DataField label="Services" value={Array.isArray(services) ? services.join(", ") : ""} />
      <DataField label="Horaires préférés" value={toStr((formData as any).preferred_delivery_time)} />
      <DataField label="Instructions de livraison" value={toStr((formData as any).delivery_instructions)} />
    </div>
  );
}

export function DeliveryDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Véhicule" value={toStr((formData as any).delivery_vehicle)} />
      <DataField label="Immatriculation" value={toStr((formData as any).vehicle_registration)} />
      <DataField label="Horaire préféré" value={toStr((formData as any).preferred_delivery_time)} />
      <DataField label="Instructions" value={toStr((formData as any).delivery_instructions)} />
    </div>
  );
}

export function BusinessDisplay({ formData }: { formData: ExtendedUserRegistrationData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DataField label="Nom de l'entreprise" value={toStr((formData as any).business_name)} />
      <DataField label="Type d'entité" value={toStr((formData as any).business_entity_type)} />
      <DataField label="Numéro d'enregistrement" value={toStr((formData as any).business_registration_number)} />
      <DataField label="Numéro fiscal" value={toStr((formData as any).business_tax_id)} />
      <DataField label="Date d'expiration" value={formatDateFr((formData as any).business_doc_expiry_date)} />
    </div>
  );
}

// ------------------------- Dashboard Profile Header -------------------------
export function DashboardProfileHeader({
  user,
  profilePhotoPreview,
  initialsFrom,
  accountTypeLabel,
  accountSubtypeLabel,
  kycStatusLabel,
  kycTone,
  isEditingAnything,
  toggleEditAll,
  isLoading,
  handleSave,
  allowEditThisTab,
  editMode,
  activeTab,
}: {
  user: any;
  profilePhotoPreview: string;
  initialsFrom: (user?: { full_name?: string; username?: string }) => string;
  accountTypeLabel: string;
  accountSubtypeLabel: string;
  kycStatusLabel: string;
  kycTone: "green" | "yellow" | "red" | "blue" | "gray";
  isEditingAnything: boolean;
  toggleEditAll: () => void;
  isLoading: boolean;
  handleSave: () => Promise<void>;
  allowEditThisTab: boolean;
  editMode: Record<string, boolean>;
  activeTab: string;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden mb-6 animate-fadeIn">
      <div className="px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white bg-gradient-to-r from-[#0B568C] to-[#27B1E4] text-white">
                {profilePhotoPreview ? (
                  <img src={profilePhotoPreview} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  initialsFrom(user || undefined)
                )}
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-[#1A4F75] mb-1">
                {user?.full_name || user?.username || "Mon Profil"}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {user?.account_type && (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#F0F7FF] text-[#0B568C] text-xs font-semibold">
                    {accountTypeLabel}
                  </span>
                )}
                {accountSubtypeLabel && (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#E4F5FB] text-[#27B1E4] text-xs font-semibold">
                    {accountSubtypeLabel}
                  </span>
                )}
                <StatusBadge tone={kycTone} label={kycStatusLabel} />
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#487F9A]">
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {user.email}
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.11a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <HeroOutlineButton
              onClick={toggleEditAll}
              size="sm"
              disabled={editMode[activeTab] ? false : false}
              className="min-w-[120px]"
            >
              {isEditingAnything ? "Annuler" : "Modifier"}
            </HeroOutlineButton>

            <HeroPrimaryButton
              onClick={handleSave}
              disabled={isLoading || !allowEditThisTab}
              size="sm"
              className="min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </span>
              ) : (
                "Enregistrer"
              )}
            </HeroPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------- Modal documents (KYC/KYB) -------------------------
export function DocumentsModal({
  open,
  onClose,
  kycDocs,
  kybDocs,
  active,
  setActive,
  docsLocked,
  onGoEditKyc,
  onGoEditKyb,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  kycDocs: UserDocumentItem[];
  kybDocs: UserDocumentItem[];
  active: "kyc" | "kyb";
  setActive: (v: "kyc" | "kyb") => void;
  docsLocked: boolean;
  onGoEditKyc: () => void;
  onGoEditKyb: () => void;
  onRefresh: () => Promise<void> | void;
}) {
  if (!open) return null;

  const tabBtn = (id: "kyc" | "kyb", label: string, count: number) => {
    const isActive = active === id;
    return (
      <button
        type="button"
        onClick={() => setActive(id)}
        className={[
          "px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200",
          isActive ? "bg-white shadow-sm" : "bg-gray-50 hover:bg-white",
        ].join(" ")}
        style={{
          borderColor: isActive ? SeaSkyColors.brandBlue : "#E5E7EB",
          color: isActive ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue,
        }}
      >
        {label} <span className="ml-2 text-xs font-extrabold">({count})</span>
      </button>
    );
  };

  const list = active === "kyc" ? kycDocs : kybDocs;
  const title = active === "kyc" ? "Documents KYC (Identité)" : "Documents KYB (Entreprise)";
  const emptyLabel = active === "kyc" ? "Aucun document KYC" : "Aucun document KYB";

  const docMeta = (d: UserDocumentItem) => {
    if (docsLocked) return <VerifiedBadge label="Validated" />;
    return d.verified ? <VerifiedBadge label="Verified" /> : <StatusBadge tone="yellow" label="En attente" />;
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-extrabold" style={{ color: SeaSkyColors.inkBlue }}>
                  Mes documents
                </h3>
                <p className="text-sm mt-1" style={{ color: SeaSkyColors.steelBlue }}>
                  {docsLocked
                    ? "Lecture seule : délai terminé / documents verrouillés."
                    : "Vous pouvez encore modifier avant la fin du délai."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50"
                style={{ borderColor: "rgba(11,86,140,0.2)" }}
                aria-label="Fermer"
                title="Fermer"
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: SeaSkyColors.brandBlue }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M18 6L6 18" strokeLinecap="round" />
                  <path d="M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {tabBtn("kyc", "KYC", kycDocs.length)}
              {tabBtn("kyb", "KYB", kybDocs.length)}

              <div className="ml-auto flex flex-wrap gap-2 w-full sm:w-auto">
                <HeroOutlineButton size="sm" onClick={() => onRefresh?.()}>
                  Actualiser
                </HeroOutlineButton>

                {!docsLocked && active === "kyc" ? (
                  <HeroOutlineButton
                    size="sm"
                    onClick={() => {
                      onClose();
                      onGoEditKyc();
                    }}
                  >
                    Modifier KYC
                  </HeroOutlineButton>
                ) : null}

                {!docsLocked && active === "kyb" ? (
                  <HeroOutlineButton
                    size="sm"
                    onClick={() => {
                      onClose();
                      onGoEditKyb();
                    }}
                  >
                    Modifier KYB
                  </HeroOutlineButton>
                ) : null}
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5 max-h-[70vh] overflow-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="font-bold" style={{ color: SeaSkyColors.inkBlue }}>
                {title}
              </div>
              {docsLocked ? <StatusBadge tone="red" label="Lecture seule" /> : <StatusBadge tone="blue" label="Éditable" />}
            </div>

            {list.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                <div className="text-sm font-semibold text-gray-600">{emptyLabel}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {list.map((d) => (
                  <DocPreviewCard key={d.id} title={guessDocLabel(d)} url={toStr(d.file)} meta={docMeta(d)} />
                ))}
              </div>
            )}
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div className="text-xs" style={{ color: SeaSkyColors.steelBlue }}>
              Astuce: après modification, fermez puis rouvrez le modal (ou cliquez "Actualiser").
            </div>
            <HeroPrimaryButton size="sm" onClick={onClose}>
              Fermer
            </HeroPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------- Crop modal -------------------------
export function CropPhotoModal({
  open,
  onClose,
  cropImageSrc,
  crop,
  setCrop,
  zoom,
  setZoom,
  onCropComplete,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  cropImageSrc: string;
  crop: { x: number; y: number };
  setCrop: (v: { x: number; y: number }) => void;
  zoom: number;
  setZoom: (v: number) => void;
  onCropComplete: (a: any, b: any) => void;
  onApply: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      <div
        className="absolute inset-0 bg-black/50"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold" style={{ color: SeaSkyColors.inkBlue }}>
                Ajuster la photo
              </h3>
              <p className="text-sm mt-1" style={{ color: SeaSkyColors.steelBlue }}>
                Glissez pour déplacer l'image, puis zoomez pour ajuster.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50"
              style={{ borderColor: "rgba(11,86,140,0.2)" }}
              aria-label="Fermer"
            >
              <svg
                className="w-5 h-5"
                style={{ color: SeaSkyColors.brandBlue }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M18 6L6 18" strokeLinecap="round" />
                <path d="M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-5 sm:px-6 py-5">
            <div
              className="relative w-full h-[340px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 touch-none"
              style={{ touchAction: "none" }}
            >
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition={false}
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: SeaSkyColors.inkBlue }}>
                  Zoom
                </span>
                <span className="text-xs font-semibold" style={{ color: SeaSkyColors.steelBlue }}>
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full mt-2"
              />

              <div className="mt-3 text-xs" style={{ color: SeaSkyColors.steelBlue }}>
                Astuce: maintenez le clic gauche et glissez pour déplacer.
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <HeroOutlineButton size="sm" onClick={onClose}>
              Annuler
            </HeroOutlineButton>

            <HeroPrimaryButton size="sm" onClick={onApply}>
              Appliquer
            </HeroPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}