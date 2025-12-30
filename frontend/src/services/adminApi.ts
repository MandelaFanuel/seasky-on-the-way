// ========================= src/services/adminApi.ts =========================
import axios from "axios";

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
  (config: { headers: { [x: string]: string; Authorization?: any; }; data: any; url: string | undefined; }) => {
    const token = getAccessToken();
    config.headers = config.headers ?? {};

    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

    if (!config.headers["Content-Type"] && !isFormData) {
      config.headers["Content-Type"] = "application/json";
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (typeof config.url === "string") {
      config.url = ensureApiV1(config.url);
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

export default adminApi;
