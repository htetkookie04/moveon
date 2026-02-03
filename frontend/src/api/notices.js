/**
 * Notice API - user notices + unread count
 */
import { api } from './axios.js';

export const noticesApi = {
  getNotices: (params) => api.get('/notices', { params }),
  getUnreadCount: () => api.get('/notices/unread-count'),
  markRead: (id) => api.post(`/notices/${id}/read`),
  markAllRead: () => api.post('/notices/read-all'),
};
