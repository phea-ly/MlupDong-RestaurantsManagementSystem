import api from './api'

// ── Menu Items ───
export const menuItemApi = {
  getAll: () =>
    api.get('/menu-items'),

  getOne: (id) =>
    api.get(`/menu-items/${id}`),

  create: (payload) => {
    const isFormData = payload instanceof FormData
    return api.post('/menu-items', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
  },

  update: (id, payload) => {
    const isFormData = payload instanceof FormData
    if (isFormData) {
      payload.append('_method', 'PUT')
      return api.post(`/menu-items/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.put(`/menu-items/${id}`, payload)
  },

  destroy: (id) =>
    api.delete(`/menu-items/${id}`),

  toggleStatus: (id, status) =>
    api.patch(`/menu/${id}/availability`, { status }),
}

// ── Categories ────
export const categoryApi = {
  getAll: () =>
    api.get('/categories'),

  getOne: (id) =>
    api.get(`/categories/${id}`),

  create: (payload) =>
    api.post('/categories', payload),

  update: (id, payload) =>
    api.put(`/categories/${id}`, payload),

  destroy: (id) =>
    api.delete(`/categories/${id}`),
}