// ========================= src/services/qr.service.ts =========================
import api from "@/services/api";

/**
 * QR module endpoints (à adapter si tes routes backend diffèrent)
 * - POST /api/v1/deliveries/confirm-from-scan/
 * - POST /api/v1/pdv/report-sale/
 */

export type ConfirmFromScanPayload = {
  qr_data: string; // contenu brut du QR (token / json / code)
  pdv_id?: number;
  note?: string;
};

export type ConfirmFromScanResponse = {
  ok?: boolean;
  message?: string;
  delivery_id?: number;
  stock_event_id?: number;
  payload?: any; // backend peut renvoyer un objet plus riche
};

export async function confirmFromScan(payload: ConfirmFromScanPayload): Promise<ConfirmFromScanResponse> {
  const { data } = await api.post("/api/v1/deliveries/confirm-from-scan/", payload);
  return data;
}

export type ReportSalePayload = {
  pdv_id: number;
  liters: number;
  note?: string;
  qr_data?: string; // optionnel si vente issue d'un scan
};

export type ReportSaleResponse = {
  ok?: boolean;
  message?: string;
  sale_id?: number;
  stock?: any;
};

export async function reportSale(payload: ReportSalePayload): Promise<ReportSaleResponse> {
  const { data } = await api.post("/api/v1/pdv/report-sale/", payload);
  return data;
}
