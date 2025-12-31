// ========================= src/services/adminApi.ts =========================
import axios, { type InternalAxiosRequestConfig } from "axios";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeBaseUrl(input?: string) {
  let url = (input ?? "").trim();

  // ✅ Default
  if (!url) {
    const host = isBrowser() ? window.location.hostname || "localhost" : "localhost";
    url = `http://${host}:8000`;
  }

  // allow protocol-less like "backend:8000"
  if (!/^https?:\/\//i.test(url) && /^[a-zA-Z0-9.-]+:\d+/.test(url)) {
    url = `http://${url}`;
  }

  return url.replace(/\/+$/, "");
}

const API_HOST = normalizeBaseUrl((import.meta as any).env?.VITE_API_URL_BASE);
const API_PREFIX = "/api/v1";

function getAccessToken(): string | null {
  try {
    return (
      localStorage.getItem("seasky_access_token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      null
    );
  } catch {
    return null;
  }
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function normalizePath(path: string) {
  let p = (path || "").trim();
  if (!p) return p;
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  return p;
}

function ensureApiV1(url?: string) {
  if (!url) return url;
  const u = url.trim();
  if (!u) return u;

  if (isAbsoluteUrl(u)) return u;

  const path = normalizePath(u);

  // Si on vise déjà /api/*, /media/*, /static/* on ne touche pas
  if (path.startsWith("/api/") || path.startsWith("/media/") || path.startsWith("/static/")) {
    return path;
  }

  return normalizePath(`${API_PREFIX}${path}`);
}

export const adminApi = axios.create({
  baseURL: API_HOST,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

adminApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    // AxiosHeaders (v1) ou objet simple : on protège les deux cas
    config.headers = config.headers ?? {};

    // FormData: ne pas forcer Content-Type (le browser met le boundary)
    const isFormData =
      typeof FormData !== "undefined" &&
      typeof config.data !== "undefined" &&
      config.data instanceof FormData;

    // Forcer JSON uniquement si pas déjà défini et pas FormData
    // ⚠️ headers peut être AxiosHeaders => on utilise set si disponible
    const hasSet = typeof (config.headers as any).set === "function";
    const hasGet = typeof (config.headers as any).get === "function";

    const currentContentType = hasGet
      ? (config.headers as any).get("Content-Type")
      : (config.headers as any)["Content-Type"];

    if (!currentContentType && !isFormData) {
      if (hasSet) (config.headers as any).set("Content-Type", "application/json");
      else (config.headers as any)["Content-Type"] = "application/json";
    }

    if (token) {
      if (hasSet) (config.headers as any).set("Authorization", `Bearer ${token}`);
      else (config.headers as any).Authorization = `Bearer ${token}`;
    }

    if (typeof config.url === "string") {
      config.url = ensureApiV1(config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApi;
