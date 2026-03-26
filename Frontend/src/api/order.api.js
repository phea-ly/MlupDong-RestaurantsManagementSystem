// src/api/order.api.js
// Public axios instance — no JWT needed for customer QR menu and KDS screen

import axios from 'axios'

const publicHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
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

  // PATCH /kds/orders/{id}/status
  updateStatus: (id, status) =>
    publicHttp.patch(`/kds/orders/${id}/status`, { status }),
}

// ── Waiter/Authenticated: order management ──────────────────────────────────
import api from './api'
export const order = {
  getAll: () => api.get('/orders'),
  create: (payload) => api.post('/orders', payload),
  update: (id, payload) => api.patch(`/orders/${id}`, payload),
  delete: (id) => api.delete(`/orders/${id}`),
}