import api from "./api";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// ── Unauthenticated instance for customer-facing requests ──────────────────
// Does NOT attach JWT and does NOT redirect to /login on 401.
// Used for: resolving QR token, placing orders as a customer.
const publicHttp = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── KDS instance (no auth — KDS routes are public in routes/api.php) ───────
const kdsHttp = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Customer order API (no auth needed) ────────────────────────────────────
export const orderApi = {
  create: (payload) => publicHttp.post("/orders", payload),
  getOne: (id)      => publicHttp.get(`/orders/${id}`),
  getAll: ()        => publicHttp.get("/orders"),
};

// ── Public table API ───────────────────────────────────────────────────────
export const tableApi = {
  // Resolves QR token → { table_id, table_number, ... }
  getByToken: (token) => publicHttp.get(`/tables/by-token/${token}`),
};

// ── KDS API ────────────────────────────────────────────────────────────────
export const kdsApi = {
  getActiveOrders:   ()           => kdsHttp.get("/kds/orders"),
  updateOrderStatus: (id, status) => kdsHttp.patch(`/kds/orders/${id}/status`, { order_status: status }),
};

// ── SSE stream ─────────────────────────────────────────────────────────────
export function connectKdsStream(onEvent, onError, onOpen) {
  const es = new EventSource(`${BASE_URL}/kds/stream`);

  es.onopen    = () => onOpen?.();
  es.onmessage = (e) => {
    try { onEvent(JSON.parse(e.data)); } catch { /* ignore malformed frames */ }
  };
  es.onerror   = (err) => onError?.(err);

  return es;
}