import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// src/plugins/axios.js — fix the interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-redirect on 401 if we're NOT on the login page
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)  // ← always reject so component catch can handle it
  }
)

export default api