import api from './api'

export const settingsApi = {
  get() {
    return api.get('/app-settings')
  },
  update(payload) {
    const isFormData = payload instanceof FormData
    return api.put('/app-settings', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
  },
}
