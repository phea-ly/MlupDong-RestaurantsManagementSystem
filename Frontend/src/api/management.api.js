import api from './api'

export const getStaffsApi = () => api.get('/staffs')
export const getTablesApi = () => api.get('/tables')
export const getMenuItemsApi = () => api.get('/menu-items')
export const getCategoriesApi = () => api.get('/categories')
export const createMenuItemApi = (payload) => api.post('/menu-items', payload)
export const updateMenuItemApi = (id, payload) => api.put(`/menu-items/${id}`, payload)
export const deleteMenuItemApi = (id) => api.delete(`/menu-items/${id}`)
export const getOrdersApi = () => api.get('/orders')
export const getOrderItemsApi = () => api.get('/order-items')
export const getPaymentsApi = () => api.get('/payments')
export const getDiscountsApi = () => api.get('/discounts')
