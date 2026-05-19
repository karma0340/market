import axios from 'axios';

// Use NEXT_PUBLIC_API_URL directly (e.g. http://127.0.0.1:5000)
// and append /api if not already present.
let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
if (!baseURL.endsWith('/api')) {
  baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL,
});

export const getImageUrl = (img) => {
  if (!img) return 'https://via.placeholder.com/800';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  // Resolve relative paths by prefixing the base API URL (excluding /api)
  const baseUrlClean = baseURL.replace(/\/api$/, '');
  return `${baseUrlClean}/${img.replace(/\\/g, '/')}`;
};

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    let token = authToken;

    if (!token && typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          token = state?.token;
        } catch (e) {}
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - trigger logout
      if (typeof window !== 'undefined') {
        // Clear local token bridge
        authToken = null;
        
        // Use window.location as a fallback if dynamic import is tricky
        // But the safest way to clear the store without circular import is to clear storage
        localStorage.removeItem('auth-storage');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
