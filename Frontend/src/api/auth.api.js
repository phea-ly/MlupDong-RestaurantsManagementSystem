import api from './api'

export const loginApi          = (credentials) => api.post('/login',          credentials)
export const logoutApi         = ()             => api.post('/logout')
export const fetchApi          = ()             => api.get('/user')
export const updateApi         = (data)         => api.post('/user',           data)
export const updatePasswordApi = (data)         => api.put('/user/password',   data)

// Generic HTTP helpers
export const getApi    = (url)       => api.get(url)
export const postApi   = (url, data) => api.post(url, data)
export const putApi    = (url, data) => api.put(url, data)
export const patchApi  = (url, data) => api.patch(url, data)
export const deleteApi = (url)       => api.delete(url)

export default {
  loginApi, logoutApi, fetchApi, updateApi, updatePasswordApi,
  getApi, postApi, putApi, patchApi, deleteApi,
}