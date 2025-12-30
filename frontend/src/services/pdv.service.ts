// ========================= src/services/pdv.service.ts =========================
import api from "@/services/api";

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

export type PDVCreatePayload = {
  name: string;
  province?: string;
  commune?: string;
  address?: string;

  agent_user_id: number;
  partner_id?: number | null;
};

function safeJsonHeaders(extra?: Record<string, string>) {
  return { "Content-Type": "application/json", ...(extra || {}) };
}

export function normalizeListResponse<T>(data: any): { results: T[]; count: number } {
  if (Array.isArray(data)) return { results: data, count: data.length };
  if (data && typeof data === "object") {
    const results = Array.isArray((data as any).results) ? (data as any).results : [];
    const count = typeof (data as any).count === "number" ? (data as any).count : results.length;
    return { results, count };
  }
  return { results: [], count: 0 };
}

function unwrapDetailResponse<T>(data: any): T {
  if (data && typeof data === "object" && "data" in data && (data as any).data) return (data as any).data as T;
  return data as T;
}

export async function createPDV(payload: PDVCreatePayload): Promise<PDV> {
  const body: PDVCreatePayload = {
    name: payload.name?.trim(),
    province: (payload.province || "").trim() || undefined,
    commune: (payload.commune || "").trim() || undefined,
    address: (payload.address || "").trim() || undefined,
    agent_user_id: Number(payload.agent_user_id),
    partner_id: payload.partner_id ?? null,
  };

  const res = await api.post("/api/v1/pdv/", body, { headers: safeJsonHeaders() });
  return unwrapDetailResponse<PDV>(res.data);
}

export async function listPDV(params?: { page?: number; page_size?: number; search?: string }) {
  const res = await api.get("/api/v1/pdv/", { params: params || {} });
  return normalizeListResponse<PDV>(res.data);
}

export async function deletePDV(id: number) {
  const res = await api.delete(`/api/v1/pdv/${id}/`);
  return res.data;
}
