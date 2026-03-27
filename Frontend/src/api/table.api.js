import api from './api'

const tableApi = {

  getAll: () =>
    api.get('/tables'),

  getById: (id) =>
    api.get(`/tables/${id}`),

  create: (data) =>
    api.post('/tables', data),

  update: (id, data) =>
    api.put(`/tables/${id}`, data),

  remove: (id) =>
    api.delete(`/tables/${id}`),

  generateQr: (id) =>
    api.post(`/tables/${id}/generate-qr`),

  generateAll: () =>
    api.post('/tables/generate-all'),

  downloadQrUrl: (id) => {
    const base = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')
    return `${base}/tables/${id}/download-qr`
  },

  getByToken: (token) =>
    api.get(`/tables/by-token/${token}`),
}

export default tableApi