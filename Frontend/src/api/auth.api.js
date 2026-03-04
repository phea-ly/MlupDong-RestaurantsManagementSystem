import client from './client'

export const loginApi = (data) => {
  return client.post('/auth/login', data)
}

export const registerApi = (data) => {
  return client.post('/auth/register', data)
}

export const meApi = () => {
  return client.get('/auth/me')
}

export const logoutApi = () => {
  return client.post('/auth/logout')
}
