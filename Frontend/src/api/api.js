import axios from 'axios'
import { clearSession, clearToken, getToken, saveToken } from '@/utils/auth'

/**
 * Endpoints that should trigger a full logout + redirect on 401.
 * Public endpoints (KDS, customer menu) must NOT redirect on 401.
 */
const PROTECTED_ENDPOINTS = ['/user', '/me', '/logout']

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

// ── REQUEST: add auth token ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE: normalize errors ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const { response, config } = error

    // Network / timeout — no response at all
    if (!response) {
      return Promise.reject({
        message: 'Network error — check your connection.',
        errors:  {},
      })
    }

    const { status, data } = response
    const requestUrl = config?.url ?? ''

    if (status === 401) {
      // Only redirect to /login when a protected endpoint returns 401.
      // Public pages (/chef, /menu/:token) may call endpoints that return
      // 401 legitimately — we must NOT redirect those.
      const isProtected = PROTECTED_ENDPOINTS.some((ep) =>
        requestUrl.includes(ep)
      )

      if (isProtected && !config?._retry) {
        config._retry = true
        return api.post('/refresh')
          .then((res) => {
            const newToken = res.data.token
            if (newToken) {
              saveToken(newToken)
            }
            return api(config)
          })
          .catch(() => {
            clearToken()
            clearSession()
            if (window.location.pathname !== '/login') {
              window.location.replace('/login')
            }
            return Promise.reject({ message: 'Unauthenticated.', errors: {} })
          })
      }

      if (isProtected) {
        clearToken()
        clearSession()
        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
      }

      return Promise.reject({ message: 'Unauthenticated.', errors: {} })
    }

    if (status === 403) {
      return Promise.reject({
        message: data?.message ?? 'Forbidden.',
        errors:  {},
      })
    }

    // Laravel validation errors
    if (status === 422) {
      return Promise.reject({
        message: data?.message ?? 'Validation failed.',
        errors: data?.errors ?? {},
      })
    }

    if (status >= 500) {
      return Promise.reject({
        message: 'Server error — try again later.',
        errors:  {},
      })
    }

    return Promise.reject({
      message: data?.message ?? 'An error occurred.',
      errors: data?.errors ?? {},
    })
  }
)

export default api
