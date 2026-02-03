/**
 * Axios instance with auth token and base URL
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Important: Send cookies with requests
  headers: { 
    'Content-Type': 'application/json',
  },
});

// Ensure credentials are sent with every request
api.defaults.withCredentials = true;

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(err);
  }
);
