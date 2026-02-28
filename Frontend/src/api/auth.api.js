import client from './client'

export const loginApi = (data) => {
  return client.post('/login', data)
}