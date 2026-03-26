import api from './api'

const staffApi = {

  getAll: () =>
    api.get('/staffs'),


  getById: (id) =>
    api.get(`/staffs/${id}`),


  create: (data) =>
    api.post('/staffs', data),


  update: (id, data) =>
    api.put(`/staffs/${id}`, data),


  remove: (id) =>
    api.delete(`/staffs/${id}`),
}

export default staffApi