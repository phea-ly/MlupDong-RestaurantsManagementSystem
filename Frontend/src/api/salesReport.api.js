import api from './api'

const salesReportApi = {

  getSummary: (params) =>
    api.get('/sales-report/summary', { params }),


  getChart: (params) =>
    api.get('/sales-report/chart', { params }),


  getCategories: (params) =>
    api.get('/sales-report/categories', { params }),


  getOrders: (params) =>
    api.get('/sales-report/orders', { params }),
}

export default salesReportApi