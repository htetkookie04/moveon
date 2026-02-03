import { api } from './axios.js';

export const entriesApi = {
  list: (params) => api.get('/entries', { params }),
  history: (params) => api.get('/entries/history', { params }),
  create: (data) => api.post('/entries', data),
  delete: (id) => api.delete(`/entries/${id}`),
};
