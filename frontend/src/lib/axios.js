import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

let baseURL = process.env.NEXT_PUBLIC_API_URL;

// If no API URL is provided, default to /api for relative proxying via Next.js rewrites
if (!baseURL) {
  baseURL = typeof window === 'undefined' ? 'http://localhost:5000/api' : '/api';
}

// Auto-append /api if missing from an absolute URL
if (baseURL && !baseURL.endsWith('/api') && baseURL.startsWith('http')) {
  baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL,
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    // In Next.js client side, we can get token from local storage
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (e) {
          console.error("Error parsing auth storage", e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration (401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - trigger logout
      if (typeof window !== 'undefined') {
        useAuthStore.getState().logout();
        // Optional: Redirect to login or show message
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
