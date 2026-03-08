import api from './api'

export const loginApi = ({ email, password }) => {
  return api.post('/login', { email, password })
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