import { api } from './axios.js';

export const statsApi = {
  get: (targetId) => api.get('/stats', { params: { targetId } }),
};
