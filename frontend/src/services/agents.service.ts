// ========================= src/services/agents.service.ts =========================
import api from "@/services/api";

export type Agent = {
  id: number;
  username: string;
  full_name?: string;
  phone?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  agent_code?: string | null;
  date_joined?: string;
  last_login?: string;
  created_at?: string;
  [k: string]: any;
};

export type AgentCreatePayload = {
  username: string;
  email?: string;
  phone: string;
  full_name?: string;
  password: string;
  confirm_password: string;
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

/**
 * ✅ Create agent:
 * POST /api/v1/agents/
 */
export async function createAgent(payload: AgentCreatePayload): Promise<Agent> {
  const body = {
    username: payload.username?.trim(),
    full_name: (payload.full_name || "").trim() || undefined,
    phone: payload.phone?.trim(),
    email: (payload.email || "").trim() || undefined,
    password: payload.password,
    confirm_password: payload.confirm_password,
  };

  const res = await api.post("/api/v1/agents/", body, { headers: safeJsonHeaders() });
  return unwrapDetailResponse<Agent>(res.data);
}

/**
 * ✅ List agents:
 * GET /api/v1/agents/?page=&page_size=&search=
 */
export async function listAgents(params?: { page?: number; page_size?: number; search?: string }) {
  const res = await api.get("/api/v1/agents/", { params: params || {} });
  return normalizeListResponse<Agent>(res.data);
}

export async function deleteAgent(id: number) {
  const res = await api.delete(`/api/v1/agents/${id}/`);
  return res.data;
}
