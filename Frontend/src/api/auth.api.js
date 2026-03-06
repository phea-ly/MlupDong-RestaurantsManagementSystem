import api from './api'

export const loginApi = (data) => {
  return api.post('/login', data)
}

export const registerApi = (data) => {
  return api.post('/register', data)
}

export const meApi = () => {
  return api.get('/user')
}

export const logoutApi = () => {
  return api.post('/logout')
}
