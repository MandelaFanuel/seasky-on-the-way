// ========================= src/services/adminApi.ts =========================
import axios, { type InternalAxiosRequestConfig } from "axios";

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

  // absolute => untouched
  if (isAbsoluteUrl(u)) return u;

  const path = normalizePath(u);

  // If already targets /api/* or /media/static => untouched
  if (path.startsWith("/api/") || path.startsWith("/media/") || path.startsWith("/static/")) {
    return path;
  }

  // default => /api/v1/...
  return normalizePath(`/api/v1${path}`);
}

export const adminApi = axios.create({
  // ✅ same-origin: in DEV it hits http://localhost:5173/... then Vite proxy forwards to backend
  baseURL: "",
  timeout: 20000,
  headers: { Accept: "application/json" },
});

adminApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    config.headers = config.headers ?? {};

    // Avoid forcing JSON for FormData
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

export default adminApi;
