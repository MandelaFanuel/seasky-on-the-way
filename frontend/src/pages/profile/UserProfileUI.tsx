// ========================= src/pages/profile/UserProfileUI.tsx =========================
import React from "react";
import { SeaSkyColors } from "../../styles/colors";

// ------------------------- Badges et Boutons -------------------------
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
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm border backdrop-blur-sm transition-all duration-200";

  const styles: Record<string, string> = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    yellow: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-sky-50 border-sky-200 text-sky-800",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  return (
    <span className={`${base} ${styles[tone]} animate-fadeIn`}>
      {label}
      {rightIcon ? <span className="opacity-95">{rightIcon}</span> : null}
    </span>
  );
}

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  const steel = SeaSkyColors.steelBlue || "#335F7A";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm border text-white animate-fadeIn"
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

export function PhoneCallButton({ phone }: { phone?: string }) {
  const clean = (phone || "").trim();
  if (!clean) return null;

  return (
    <a
      href={`tel:${clean}`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-xl border shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5 animate-fadeIn"
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
        "justify-center animate-fadeIn",
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
        "justify-center animate-fadeIn",
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
    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-red-700 shadow-sm animate-pulse">
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
      } ${disabled ? "opacity-50 cursor-not-allowed hover:shadow-none" : ""} animate-fadeIn`}
      style={{ borderColor: active ? SeaSkyColors.brandBlue : "#E5E7EB" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
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
          <span
            className="text-sm font-bold truncate"
            style={{ color: active ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue }}
          >
            {label}
          </span>
          <StepStateBadge completed={Boolean(completed)} />
        </div>
      </div>
    </button>
  );
}

// ------------------------- Utils -------------------------
function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / (3600 * 24));
  const hours = Math.floor((total % (3600 * 24)) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}j ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}