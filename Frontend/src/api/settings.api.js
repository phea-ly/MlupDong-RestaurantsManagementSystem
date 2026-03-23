import api from './api'

const settingsApi = {

  get: () =>
    api.get('/app-settings'),

  update: (payload) =>
    api.put('/app-settings', payload, {
      headers: payload instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    }),
}

export default settingsApi
