// ========================= src/api/client.ts =========================
/**
 * SeaSky Platform - API v1 Client (Docker-ready + Browser-ready)
 * ✅ JWT-first (no cookies)
 * ✅ Works in:
 *   - Browser (Vercel/Prod): /api/v1  (proxied by vercel.json) OR direct Render via VITE_API_URL
 *   - Browser (Local):       http://localhost:8000/api/v1  OR /api/v1 with Vite proxy
 *   - Docker compose:        http://backend:8000/api/v1
 * ✅ Safe URL normalization
 * ✅ Keeps real HTTP errors (403/401/400...)
 */

export type Json = Record<string, any>;

export class SeaSkyApiError extends Error {
  constructor(message: string, public status?: number, public payload?: any) {
    super(message);
    this.name = "SeaSkyApiError";
  }
}

/** Toggle debug logs: localStorage.setItem("seasky_api_debug","1") */
function isDebug() {
  try {
    return typeof window !== "undefined" && localStorage.getItem("seasky_api_debug") === "1";
  } catch {
    return false;
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * ✅ Default base URL (IMPORTANT):
 * - In browser: can be "/api/v1" (proxy) OR direct Render via VITE_API_URL
 * - In Docker: http://backend:8000/api/v1
 */
function defaultBaseUrl() {
  if (isBrowser()) return "/api/v1";
  return "http://backend:8000/api/v1";
}

function normalizeBaseUrl(input?: string) {
  let url = (input ?? "").trim();
  if (!url) url = defaultBaseUrl();

  // allow relative "/api/v1"
  if (url.startsWith("/")) return url.replace(/\/+$/, "");

  // ":8000/api/v1" -> browser: "http://localhost:8000/api/v1" or docker: "http://backend:8000/api/v1"
  if (url.startsWith(":")) {
    if (isBrowser()) url = `http://localhost${url}`;
    else url = `http://backend${url}`;
  }

  // "backend:8000/api/v1" -> add protocol
  if (!/^https?:\/\//i.test(url) && /^[a-zA-Z0-9.-]+:\d+/.test(url)) {
    url = `http://${url}`;
  }

  return url.replace(/\/+$/, "");
}

/**
 * Prefer VITE_API_URL.
 * - Vercel/Prod (robust):  VITE_API_URL=https://seasky-backend.onrender.com/api/v1
 * - Vercel/Prod (proxy):   VITE_API_URL=/api/v1
 * - Local:                 VITE_API_URL=http://localhost:8000/api/v1  (optional)
 * - Docker:                VITE_API_URL=http://backend:8000/api/v1
 */
export const API_BASE_URL = normalizeBaseUrl((import.meta as any).env?.VITE_API_URL);

export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register/",
    LOGIN: "/auth/login/",
    LOGOUT: "/auth/logout/",
    LOGOUT_ALL: "/auth/logout_all/",
    REFRESH: "/auth/refresh/",
  },
  QR: { SCAN: "/qr/scan/" },
  ME: {
    PROFILE: "/me/profile/",
    UPDATE_PROFILE: "/me/update_profile/",
    CHANGE_PASSWORD: "/me/change_password/",
  },
  DOCUMENTS: "/documents/",
  LOGISTICS: {
    COLLECTIONS: "/collections/",
    DELIVERIES: "/deliveries/",
    ATTENDANCE: "/attendance/",
    CONFIRM_DELIVERY_FROM_SCAN: "/deliveries/confirm-from-scan/",
  },
  PDV: {
    LIST: "/pdv/",
    MY: "/pdv/my-pdv/",
    REPORT_SALE: "/pdv/report-sale/",
  },
  DRIVERS: "/drivers/",
  USERS: "/users/",
} as const;

export type LoginResponse = {
  access?: string;
  refresh?: string;
  tokens?: { access?: string; refresh?: string };
  user?: any;
  message?: string;
  success?: boolean;
  detail?: string;
  error?: string;
  [k: string]: any;
};

export type RegisterResponse = {
  user?: any;
  access?: string;
  refresh?: string;
  tokens?: { access?: string; refresh?: string };
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
  [k: string]: any;
};

export type UserProfile = {
  id?: number;
  username?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  account_type?: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
  [key: string]: any;
};

export type QRScanResponse = {
  success?: boolean;
  data?: any;
  message?: string;
  token?: { code?: string; purpose?: string; ttl_seconds?: number; expires_at?: string };
  subject?: { id?: number; type?: string; name?: string; full_name?: string; username?: string };
  [key: string]: any;
};

export type Collection = {
  id?: number;
  driver_id?: number;
  supplier_id?: number;
  quantity_liters?: number;
  value_amount?: number;
  collection_date?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

export type CreateCollectionPayload = {
  scanResult?: any;
  quantity_liters: string | number;
  value_amount: string | number;
  driver_id?: number;
  supplier_id?: number;
  collection_date?: string;
  notes?: string;
  [key: string]: any;
};

export type PDVStock = {
  current_liters?: string | number;
  last_event_at?: string | null;
  updated_at?: string;
};

export type PDV = {
  id: number;
  name: string;
  province?: string;
  commune?: string;
  address?: string;
  agent_username?: string;
  agent_full_name?: string;
  agent_phone?: string;
  partner_username?: string | null;
  partner_full_name?: string | null;
  stock?: PDVStock;
  created_at?: string;
  updated_at?: string;
  [k: string]: any;
};

export type ConfirmDeliveryFromScanPayload = {
  code?: string;
  qr_data?: string;
  pdv_id: number;
  quantity_liters: string | number;
};

export type ReportSalePayload = {
  pdv_id: number;
  liters_sold: string | number;
  notes?: string;
};

class TokenStorage {
  static get access(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem("seasky_access_token") || localStorage.getItem("access_token");
  }
  static set access(token: string | null) {
    if (!isBrowser()) return;
    if (!token) {
      localStorage.removeItem("seasky_access_token");
      localStorage.removeItem("access_token");
    } else {
      localStorage.setItem("seasky_access_token", token);
      localStorage.setItem("access_token", token);
    }
  }

  static get refresh(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem("seasky_refresh_token") || localStorage.getItem("refresh_token");
  }
  static set refresh(token: string | null) {
    if (!isBrowser()) return;
    if (!token) {
      localStorage.removeItem("seasky_refresh_token");
      localStorage.removeItem("refresh_token");
    } else {
      localStorage.setItem("seasky_refresh_token", token);
      localStorage.setItem("refresh_token", token);
    }
  }

  static clear() {
    if (!isBrowser()) return;
    localStorage.removeItem("seasky_access_token");
    localStorage.removeItem("seasky_refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("savedUsername");
  }
}

function authHeader(): HeadersInit {
  const token = TokenStorage.access;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ✅ timeouts: Render peut "sleep" en free, et FormData (upload) prend plus de temps
const DEFAULT_TIMEOUT_MS = (import.meta as any).env?.PROD ? 60000 : 20000;
const UPLOAD_TIMEOUT_MS = (import.meta as any).env?.PROD ? 120000 : 30000;

function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
}

function joinUrl(base: string, path: string) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  if (base.startsWith("/")) return `${base}${safePath}`;
  return `${base}${safePath}`;
}

function fetchModeForBase(base: string): RequestMode {
  // same-origin proxy on Vercel => no CORS
  if (base.startsWith("/")) return "same-origin";
  return "cors";
}

// ✅ debug body safe (FormData/JSON)
function debugBody(body: any) {
  try {
    if (!body) return null;
    if (typeof FormData !== "undefined" && body instanceof FormData) return "[FormData]";
    if (typeof body === "string") return JSON.parse(body);
    return body;
  } catch {
    return "[unserializable]";
  }
}

export async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = joinUrl(API_BASE_URL, path);

  const headers = new Headers(opts.headers || {});
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const auth = authHeader();
  Object.entries(auth).forEach(([k, v]) => headers.set(k, String(v)));

  const timeoutMs = isFormData ? UPLOAD_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
  const { controller, clear } = withTimeout(timeoutMs);

  try {
    if (isDebug()) console.log("[SeaSky API] ->", opts.method || "GET", url, debugBody(opts.body));

    const res = await fetch(url, {
      mode: fetchModeForBase(API_BASE_URL),
      credentials: "omit",
      ...opts,
      headers,
      signal: controller.signal,
    });

    const data = await safeJson(res);

    if (!res.ok) {
      const msg = (data && (data.detail || data.message || data.error)) || `HTTP ${res.status}: ${res.statusText}`;
      if (isDebug()) console.log("[SeaSky API] <- ERR", res.status, url, data);
      throw new SeaSkyApiError(msg, res.status, data);
    }

    if (isDebug()) console.log("[SeaSky API] <- OK", res.status, url, data);
    return data as T;
  } catch (e: any) {
    if (e instanceof SeaSkyApiError) throw e;

    if (e?.name === "AbortError") {
      throw new SeaSkyApiError("Timeout: le serveur met trop de temps à répondre.", undefined, { url, timeoutMs });
    }

    throw new SeaSkyApiError("Serveur injoignable (backend down ou URL incorrecte).", undefined, {
      url,
      original: String(e?.message || e),
    });
  } finally {
    clear();
  }
}

function handleAuthResponse(res: LoginResponse | RegisterResponse) {
  const access = (res as any).access ?? (res as any).tokens?.access;
  const refresh = (res as any).refresh ?? (res as any).tokens?.refresh;
  if (access) TokenStorage.access = access;
  if (refresh) TokenStorage.refresh = refresh;
  return res;
}

export async function registerUser(payload: FormData | Json): Promise<RegisterResponse> {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const res = await request<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: isFormData ? (payload as any) : JSON.stringify(payload),
  });
  return handleAuthResponse(res) as RegisterResponse;
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  try {
    const res = await request<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (isDebug()) console.log("[SeaSky API] Login response:", res);

    if (res.detail && res.detail.includes("Identifiants invalides")) {
      throw new SeaSkyApiError("Nom d'utilisateur ou mot de passe incorrect", 403, res);
    }

    if (!res.access && !res.tokens?.access) {
      throw new SeaSkyApiError("Réponse de connexion incomplète: tokens manquants", 500, res);
    }

    return handleAuthResponse(res) as LoginResponse;
  } catch (error: any) {
    if (isDebug()) console.error("[SeaSky API] Login error:", error);

    if (error instanceof SeaSkyApiError && error.status === 403) {
      if (error.payload?.detail?.includes("Identifiants invalides")) {
        throw new SeaSkyApiError("Nom d'utilisateur ou mot de passe incorrect", 403, error.payload);
      }
      if (error.payload?.detail?.includes("compte est désactivé")) {
        throw new SeaSkyApiError("Votre compte est désactivé. Contactez l'administrateur.", 403, error.payload);
      }
    }

    throw error;
  }
}

export async function logoutUser(): Promise<{ message?: string }> {
  const refresh = TokenStorage.refresh;
  const res = await request<{ message?: string }>(ENDPOINTS.AUTH.LOGOUT, {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  TokenStorage.clear();
  return res;
}

export async function refreshToken(): Promise<LoginResponse> {
  const refresh = TokenStorage.refresh;
  if (!refresh) throw new SeaSkyApiError("No refresh token available");
  const res = await request<LoginResponse>(ENDPOINTS.AUTH.REFRESH, {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  return handleAuthResponse(res) as LoginResponse;
}

export function isAuthenticated(): boolean {
  return !!TokenStorage.access;
}

export function getAuthTokens(): { access: string | null; refresh: string | null } {
  return { access: TokenStorage.access, refresh: TokenStorage.refresh };
}

export function clearAuth(): void {
  TokenStorage.clear();
}

export async function getCurrentUser(): Promise<UserProfile> {
  return request<UserProfile>(ENDPOINTS.ME.PROFILE, { method: "GET" });
}

export function computeEffectiveRole(p?: UserProfile | null): string {
  if (!p) return "client";
  if (p.is_superuser || p.is_staff) return "admin";
  return (p.role || p.account_type || "client").toString().toLowerCase();
}

export async function scanQR(qrData: string): Promise<QRScanResponse> {
  return request<QRScanResponse>(ENDPOINTS.QR.SCAN, {
    method: "POST",
    body: JSON.stringify({ qr_data: qrData, code: qrData }),
  });
}

export async function createCollectionFromScan(payload: CreateCollectionPayload): Promise<Collection> {
  return request<Collection>(ENDPOINTS.LOGISTICS.COLLECTIONS, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserProfile(payload: FormData | Json): Promise<UserProfile> {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  return request<UserProfile>(ENDPOINTS.ME.UPDATE_PROFILE, {
    method: "PUT",
    body: isFormData ? (payload as any) : JSON.stringify(payload),
  });
}

export async function getMyPDV(): Promise<PDV> {
  return request<PDV>(ENDPOINTS.PDV.MY, { method: "GET" });
}

export async function confirmDeliveryFromScan(payload: ConfirmDeliveryFromScanPayload): Promise<any> {
  const body: any = {
    pdv_id: payload.pdv_id,
    quantity_liters: payload.quantity_liters,
  };
  if (payload.qr_data) body.qr_data = payload.qr_data;
  if (payload.code) body.code = payload.code;

  return request<any>(ENDPOINTS.LOGISTICS.CONFIRM_DELIVERY_FROM_SCAN, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function reportPDVSale(payload: ReportSalePayload): Promise<any> {
  return request<any>(ENDPOINTS.PDV.REPORT_SALE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
