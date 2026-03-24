// src/api/order.api.js
// Public axios instance — no JWT needed for customer QR menu and KDS screen

import axios from 'axios'

const publicHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
})

// ── Customer: resolve table from QR token ──────────────────────────────────
export const tableApi = {
  // GET /tables/by-token/{token}
  // Returns: { table_id, table_number, qr_code_url, ... }
  getByToken: (token) =>
    publicHttp.get(`/tables/by-token/${token}`),
}

// ── Customer: place order from QR menu ────────────────────────────────────
export const customerOrderApi = {
  // POST /customer/orders
  // Body: { table_id, order_type, special_instructions?, items: [{menu_item_id, quantity, note?}] }
  placeOrder: (payload) =>
    publicHttp.post('/customer/orders', payload),
}

// ── KDS: kitchen display ──────────────────────────────────────────────────
export const kdsApi = {
  // GET /kds/orders — all non-cancelled orders
  getActiveOrders: () =>
    publicHttp.get('/kds/orders'),

  // PATCH /kds/orders/{id}/status — body: { status: 'received' | 'confirmed' | ... }
  updateStatus: (id, status) =>
    publicHttp.patch(`/kds/orders/${id}/status`, { status }),
}