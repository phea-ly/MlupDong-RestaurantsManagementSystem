import api from './api'

export const orderApi = {
  getAll: () =>
    api.get('/orders'),

  getOne: (id) =>
    api.get(`/orders/${id}`),

  create: (payload) =>
    api.post('/orders', payload),

  update: (id, payload) =>
    api.put(`/orders/${id}`, payload),

  destroy: (id) =>
    api.delete(`/orders/${id}`),
}
