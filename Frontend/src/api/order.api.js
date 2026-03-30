import api from './api'
// ── Customer: resolve table from QR token ──────────────────────────────────
export const tableApi = {
  // GET /tables/by-token/{token}
  // Returns: { table_id, table_number, qr_code_url, ... }
  getByToken: (token) =>
    api.get(`/tables/by-token/${token}`),
}

// ── Customer: place order from QR menu ────────────────────────────────────
export const customerOrderApi = {
  // POST /customer/orders
  // Body: { table_id, order_type, special_instructions?, items: [{menu_item_id, quantity, note?}] }
  placeOrder: (payload) =>
    api.post('/customer/orders', payload),
}

// ── KDS: kitchen display ──────────────────────────────────────────────────
export const kdsApi = {
  // GET /kds/orders — all non-cancelled orders
  getActiveOrders: () =>
    api.get('/kds/orders'),

  // PATCH /kds/orders/{id}/status
  updateStatus: (id, status) =>
    api.patch(`/kds/orders/${id}/status`, { status }),
}


export const order = {
  getAll: () => api.get('/orders'),
  create: (payload) => api.post('/orders', payload),
  update: (id, payload) => api.patch(`/orders/${id}`, payload),
  delete: (id) => api.delete(`/orders/${id}`),
}
