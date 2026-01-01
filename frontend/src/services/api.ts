// ========================= src/services/api.ts =========================
import axios, { type InternalAxiosRequestConfig } from "axios";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeBaseUrl(input?: string) {
  let url = (input ?? "").trim();

  // ✅ IMPORTANT:
  // - Browser/Vercel: use same-origin => "" (or "/")
  // - Docker/local server can use VITE_API_URL_BASE if provided
  if (!url) {
    if (isBrowser()) return ""; // same-origin
    return "http://backend:8000";
  }

  // allow relative "/api"
  if (url.startsWith("/")) return url.replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(url) && /^[a-zA-Z0-9.-]+:\d+/.test(url)) {
    url = `http://${url}`;
  }

  return url.replace(/\/+$/, "");
}

/**
 * ✅ base host like:
 * - Browser/Vercel: VITE_API_URL_BASE="" (default)
 * - Browser/local:  VITE_API_URL_BASE="http://localhost:8000"
 * - Docker:         VITE_API_URL_BASE="http://backend:8000"
 * baseURL MUST NOT include "/api/v1"
 */
const API_HOST = normalizeBaseUrl((import.meta as any).env?.VITE_API_URL_BASE);
const API_PREFIX = "/api/v1";

const api = axios.create({
  baseURL: API_HOST || undefined,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

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

  if (path.startsWith("/api/") || path.startsWith("/media/") || path.startsWith("/static/")) {
    return path;
  }

  return normalizePath(`${API_PREFIX}${path}`);
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    config.headers = config.headers ?? {};

    const isFormData =
      typeof FormData !== "undefined" &&
      typeof config.data !== "undefined" &&
      config.data instanceof FormData;

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

export default api;
