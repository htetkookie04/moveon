import { api } from './axios.js';

export const targetsApi = {
  list: () => api.get('/targets'),
  create: (displayName) => api.post('/targets', { displayName }),
  delete: (id) => api.delete(`/targets/${id}`),
};
