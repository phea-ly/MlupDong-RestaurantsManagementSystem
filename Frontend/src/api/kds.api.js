// src/api/kds.api.js
// Uses its own axios instance — NOT the shared api.js that has the 401→/login interceptor

import axios from 'axios'

const apiBase = import.meta.env.VITE_API_URL ?? '/api'

const kdsHttp = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
  // No auth token needed — KDS endpoints are public
})

export const kdsApi = {
  getActiveOrders() {
    return kdsHttp.get('/kds/orders')
  },
  updateOrderStatus(id, status) {
    return kdsHttp.patch(`/kds/orders/${id}/status`, { status })
  },
}

export function connectKdsStream(onEvent, onError, onOpen) {
  const base = apiBase
  const es = new EventSource(`${base}/kds/stream`)
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
