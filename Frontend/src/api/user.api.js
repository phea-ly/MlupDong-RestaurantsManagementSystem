<<<<<<< HEAD
import api from './api'

<<<<<<< HEAD
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
=======
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
=======
export { default } from './api'
>>>>>>> 0662d3b81fcaf3c26c949bdb09290af9959f3eab
