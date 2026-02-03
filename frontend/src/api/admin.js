import { api } from './axios.js';

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  toggleActive: (id) => api.patch(`/admin/users/${id}/active`),
  getNotices: () => api.get('/admin/notices'),
  createNotice: (data) => api.post('/admin/notices', data),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}`),
};
