import { api } from './axios.js';

export const bannerApi = {
  getActive: () => api.get('/banner/active'),
  upload: (formData) =>
    api.post('/admin/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/admin/banner/${id}`),
};
