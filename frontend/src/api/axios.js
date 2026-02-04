/**
 * Axios instance with auth token and base URL
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'auth_token';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to requests (works cross-origin; cookies don't with Netlify→Render)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
