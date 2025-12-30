// ========================= src/services/drivers.service.ts =========================
import api from "@/services/api";

export type DriverTransportMode = "vehicule" | "moto" | "velo" | "camion" | "pied";

export type DriverCreatePayload = {
  username: string;
  email?: string;
  phone: string;
  full_name: string;
  password: string;
  confirm_password: string;

  transport_mode?: DriverTransportMode;

  license_number?: string;
  license_expiry?: string | null;

  vehicle_type?: string;
  vehicle_registration?: string;

  insurance_number?: string;
  insurance_expiry?: string | null;

  hire_date?: string; // YYYY-MM-DD

  base_salary?: string | number;
  commission_rate?: string | number;
  assigned_zone?: string;
  max_capacity?: string | number;

  notes?: string;
  can_be_pdv?: boolean;

  [k: string]: any;
};

export type DriverListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
  transport_mode?: DriverTransportMode;
  is_verified?: boolean;
};

function unwrapListResponse(data: any): any[] {
  if (data && typeof data === "object" && Array.isArray((data as any).results)) return (data as any).results;
  if (Array.isArray(data)) return data;
  return [];
}

function unwrapDetailResponse(data: any): any {
  if (data && typeof data === "object" && "data" in data && (data as any).data) return (data as any).data;
  return data;
}

function safeJsonHeaders(extra?: Record<string, string>) {
  return { "Content-Type": "application/json", ...(extra || {}) };
}

// ========================= CRUD =========================
export async function createDriver(payload: DriverCreatePayload) {
  const res = await api.post("/api/v1/drivers/", payload, { headers: safeJsonHeaders() });
  return unwrapDetailResponse(res.data);
}

export async function listDrivers(params?: DriverListParams) {
  const res = await api.get("/api/v1/drivers/", { params: params || {} });
  return unwrapListResponse(res.data);
}

export async function getDriver(id: number | string) {
  const res = await api.get(`/api/v1/drivers/${id}/`);
  return unwrapDetailResponse(res.data);
}

export async function updateDriver(id: number | string, payload: Partial<DriverCreatePayload>) {
  const res = await api.patch(`/api/v1/drivers/${id}/`, payload, { headers: safeJsonHeaders() });
  return unwrapDetailResponse(res.data);
}

export async function deleteDriver(id: number | string) {
  const res = await api.delete(`/api/v1/drivers/${id}/`);
  return res.data;
}

// ========================= ACTIONS =========================
export async function verifyDriver(id: number | string) {
  const res = await api.post(`/api/v1/drivers/${id}/verify/`, null, { headers: safeJsonHeaders() });
  return unwrapDetailResponse(res.data);
}

export async function suspendDriver(id: number | string, reason?: string) {
  const body = reason ? { reason } : {};
  const res = await api.post(`/api/v1/drivers/${id}/suspend/`, body, { headers: safeJsonHeaders() });
  return unwrapDetailResponse(res.data);
}

export async function activateDriver(id: number | string) {
  const res = await api.post(`/api/v1/drivers/${id}/activate/`, null, { headers: safeJsonHeaders() });
  return unwrapDetailResponse(res.data);
}

// ========================= STATS =========================
export async function getDriversStats() {
  const res = await api.get("/api/v1/drivers/stats/");
  return unwrapDetailResponse(res.data);
}
