// src/api/kds.api.js
// Uses its own axios instance — NOT the shared api.js that has the 401→/login interceptor
import api from './api'

export const kdsApi = {
  getActiveOrders() {
    return api.get('/kds/orders')
  },
  updateOrderStatus(id, status) {
    return api.patch(`/kds/orders/${id}/status`, { status })
  },
}

export function connectKdsStream(onEvent, onError, onOpen) {
  const es = new EventSource(`${api}/kds/stream`)
  es.onopen = () => {
    onOpen?.()
  }
  es.onmessage = (e) => {
    try { onEvent(JSON.parse(e.data)) } catch { /* ignore parse errors */ }
  }
  es.onerror = (err) => {
    onError?.(err)
  }
  return es
}
