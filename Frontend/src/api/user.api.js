import client from './api'

export const getUsers = (params = {}) => {
  return client.get('/users', { params })
}

export const createUser = (payload) => {
  return client.post('/users', payload)
}

export const updateUser = (userId, payload) => {
  return client.put(`/users/${userId}`, payload)
}

export const deleteUser = (userId) => {
  return client.delete(`/users/${userId}`)
}
