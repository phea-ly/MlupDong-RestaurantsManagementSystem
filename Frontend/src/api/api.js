import axios from 'axios'

const AUTH_TOKEN_KEY = 'auth_session_token'
const AUTH_USER_KEY = 'auth_session_user'

const api = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    }

    return Promise.reject(error)
  }
)

export default api
