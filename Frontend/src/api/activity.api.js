import api from './api'

const activityApi = {

  getAll: (params = {}) =>
    api.get('/activity-logs', { params }),


  getSummary: () =>
    api.get('/activity-logs/summary'),


  getById: (id) =>
    api.get(`/activity-logs/${id}`),


  remove: (id) =>
    api.delete(`/activity-logs/${id}`),


  clear: (beforeDate = null) =>
    api.delete('/activity-logs', {
      data: beforeDate ? { before_date: beforeDate } : {},
    }),
}

export default activityApi