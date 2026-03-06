import client from './api'

export const getUsers = () => {
  return client.get('/users')
}