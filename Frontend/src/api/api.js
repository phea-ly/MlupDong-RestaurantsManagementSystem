// src/api/api.js
import axios from 'axios'
import { clearSession } from '@/utils/auth'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

// Response: normalise errors + handle 401
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const { response } = error

    if (!response) {
      return Promise.reject({
        message: 'Network error — check your connection.',
        errors:  {},
      })
    }

    const { status, data } = response

    // Expired / invalid token → wipe session and go to login
    if (status === 401) {
      clearSession()
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
      return Promise.reject({ message: 'Unauthenticated.', errors: {} })
    }

    // Forbidden
    if (status === 403) {
      return Promise.reject({ message: data?.message ?? 'Forbidden.', errors: {} })
    }

    // Laravel validation errors
    if (status === 422) {
      return Promise.reject({
        message: data?.message ?? 'Validation failed.',
        errors:  data?.errors  ?? {},
      })
    }

    // Server error
    if (status >= 500) {
      return Promise.reject({ message: 'Server error — try again later.', errors: {} })
    }

    return Promise.reject({
      message: data?.message ?? 'An error occurred.',
      errors:  data?.errors  ?? {},
    })
  }
)

export default api
