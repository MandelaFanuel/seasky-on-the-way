// ========================= src/services/api.ts =========================
import axios, { type InternalAxiosRequestConfig, type AxiosInstance } from "axios";

// ========================= TOKEN MANAGEMENT =========================
export function getAccessToken(): string | null {
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

// ========================= URL UTILITIES =========================
function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function normalizeBaseUrl(input?: string) {
  let url = (input ?? "").trim();
  if (!url) return "";
  url = url.replace(/\/+$/, "");
  return url;
}

function normalizePath(path: string) {
  let p = (path || "").trim();
  if (!p) return p;
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  return p;
}

/**
 * ✅ Garantit que la base pointe vers /api/v1
 * - si env = https://backend.onrender.com => https://backend.onrender.com/api/v1
 * - si env = https://backend.onrender.com/api/v1 => inchangé
 */
export function resolveApiBaseUrl(): string {
  const env =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "";

  const base = normalizeBaseUrl(env);

  // DEV: on veut rester en same-origin pour profiter du proxy Vite (/api/v1 -> backend)
  if (!base) {
    if (import.meta.env.DEV) return "";
    // PROD sans env : on garde "" mais on warn
    console.warn(
      "[api] VITE_API_URL/VITE_API_BASE_URL manquant en production."
    );
    return "";
  }

  // Si l'env finit déjà par /api/v1
  if (/\/api\/v1$/i.test(base)) return base;

  // Si l'env finit par /api (rare), on ajoute /v1
  if (/\/api$/i.test(base)) return `${base}/v1`;

  // Sinon on ajoute /api/v1
  return `${base}/api/v1`;
}

/** 
 * ✅ Utile pour reconstruire les URLs media/static à partir de la base API
 * Corrige l'erreur "backend:8000/media/..."
 */
export function resolveBackendOrigin(): string {
  const apiBase = resolveApiBaseUrl();
  if (!apiBase) {
    // DEV: media/static passent aussi via proxy Vite => same-origin
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }
  return apiBase.replace(/\/api\/v1$/i, "");
}

/**
 * ✅ Fonction pour obtenir l'URL complète d'une photo
 * Gère correctement dev/prod et proxy
 */
export function getMediaUrl(mediaPath?: string): string | null {
  if (!mediaPath) return null;
  
  // Si c'est déjà une URL complète
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  
  // Normaliser le chemin
  const normalizedPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  
  // Si on est en développement, utiliser le chemin relatif (proxy Vite s'en occupera)
  if (import.meta.env.DEV) {
    return normalizedPath;
  }
  
  // En production, construire l'URL complète avec l'origine du backend
  const backendOrigin = resolveBackendOrigin();
  if (backendOrigin) {
    return `${backendOrigin}${normalizedPath}`;
  }
  
  return normalizedPath;
}

/**
 * ✅ Garantit que toutes les URLs API commencent par /api/v1
 * Sauf si ce sont déjà des URLs absolues ou des chemins media/static
 */
function ensureApiV1(url?: string): string {
  if (!url) return '';
  const u = url.trim();
  if (!u) return '';

  if (isAbsoluteUrl(u)) return u;

  const path = normalizePath(u);

  // Les chemins media et static ne doivent pas être modifiés
  if (path.startsWith("/media/") || path.startsWith("/static/")) {
    return path;
  }

  // Si ça commence déjà par /api/, ne pas modifier
  if (path.startsWith("/api/")) {
    return path;
  }

  // Sinon ajouter /api/v1
  return `/api/v1${path.startsWith('/') ? path : '/' + path}`;
}

// ========================= API INSTANCES =========================

/**
 * ✅ Instance principale pour les requêtes JSON
 */
const api: AxiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 20000,
  headers: { 
    Accept: "application/json",
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    config.headers = config.headers ?? {};

    // Avoid forcing JSON for FormData
    const isFormData =
      typeof FormData !== "undefined" &&
      typeof config.data !== "undefined" &&
      config.data instanceof FormData;

    if (!isFormData && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ne pas ajouter /api/v1 si la baseURL le contient déjà
    if (typeof config.url === "string" && config.baseURL) {
      const baseHasApiV1 = config.baseURL.includes('/api/v1');
      const urlHasApiV1 = config.url.includes('/api/v1');
      
      if (!baseHasApiV1 && !urlHasApiV1 && !config.url.startsWith('http')) {
        config.url = ensureApiV1(config.url);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ✅ Instance spéciale pour les uploads (FormData)
 * Ne définit pas de Content-Type (laissé au browser)
 */
export const apiMultipart: AxiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30000,
});

apiMultipart.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    config.headers = config.headers ?? {};

    // Supprimer Content-Type pour FormData (laissé au browser)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ne pas ajouter /api/v1 si la baseURL le contient déjà
    if (typeof config.url === "string" && config.baseURL) {
      const baseHasApiV1 = config.baseURL.includes('/api/v1');
      const urlHasApiV1 = config.url.includes('/api/v1');
      
      if (!baseHasApiV1 && !urlHasApiV1 && !config.url.startsWith('http')) {
        config.url = ensureApiV1(config.url);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ========================= RESPONSE INTERCEPTORS =========================

// Intercepteur commun pour les erreurs
const setupResponseInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("[api] Session expirée ou non autorisée");
      }
      
      if (error.code === "ECONNABORTED") {
        console.error("[api] Timeout: le serveur ne répond pas");
      }
      
      return Promise.reject(error);
    }
  );
};

setupResponseInterceptors(api);
setupResponseInterceptors(apiMultipart);

// ========================= EXPORTS =========================
export default api;