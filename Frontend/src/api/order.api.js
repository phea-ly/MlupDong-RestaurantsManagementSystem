// src/api/order.api.js
import api from '@/api/api'

// ── Public (no JWT) ─────────────────────────────────────────────────
import axios from 'axios'

const publicHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
})

export const tableApi = {
  // GET /api/tables/by-token/:token  — no auth needed (customer scan)
  getByToken: (token) => publicHttp.get(`/tables/by-token/${token}`),
}

export const orderApi = {
  getAll:    ()           => api.get('/orders'),
  getOne:    (id)         => api.get(`/orders/${id}`),
  create:    (payload)    => api.post('/orders', payload),
  update:    (id, payload) => api.patch(`/orders/${id}`, payload),
  delete:    (id)         => api.delete(`/orders/${id}`),
}

export const orderItemApi = {
  create: (payload) => api.post('/order-items', payload),
  update: (id, payload) => api.patch(`/order-items/${id}`, payload),
  delete: (id)         => api.delete(`/order-items/${id}`),
}

// Alias used in KdsView + OrderView
export const kdsApi = {
  getActiveOrders: () => api.get('/orders'),
  updateStatus:    (id, status) =>
    api.patch(`/orders/${id}`, { order_status: status }),
}