import axios from 'axios'
import { getToken, clearSession } from '@/utils/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://44.221.70.191/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

// ── Request interceptor: attach JWT token ───────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 Unauthorized ──────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
