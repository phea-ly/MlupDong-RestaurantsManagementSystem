import api from './api'

const dashboardApi = {

  getSummary: (period = 'today') =>
    api.get('/sales-report/summary', { params: { period } }),


  getChart: (period = '7days') =>
    api.get('/sales-report/chart', {
      params: { period: period === '7days' ? 'last7days' : period }
    }),


  getCategories: (period = 'last7days') =>
    api.get('/sales-report/categories', { params: { period } }),


  getRecentOrders: () =>
    api.get('/sales-report/orders', { params: { period: 'today', per_page: 5 } }),


  getBestSelling: () =>
    api.get('/dashboard/best-selling'),


  getPeakHours: () =>
    api.get('/dashboard/peak-hours'),


  getOrderSummary: () =>
    api.get('/dashboard/order-summary'),
}

export default dashboardApi