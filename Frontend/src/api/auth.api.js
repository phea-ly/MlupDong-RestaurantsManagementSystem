<<<<<<< HEAD
=======
import api from './api'

export const loginApi = (data) => {
  return api.post('/auth/login', data)
}

export const registerApi = (data) => {
  return api.post('/auth/register', data)
}

export const meApi = () => {
  return api.get('/auth/me')
}

export const logoutApi = () => {
  return api.post('/auth/logout')
}
>>>>>>> e159202bdfe4d65fb2d1c3f48c42c4cdacd9d8f2
