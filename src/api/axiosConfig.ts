import axios from 'axios';

const defaultApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const host = window.location.hostname.toLowerCase();

    if (host === 'www.shadowscan.me' || host === 'shadowscan.me') {
      return 'https://shadowscan.duckdns.org/api';
    }

    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: defaultApiBaseUrl(),
  timeout: 45000, // 45 second timeout for long-running OSINT tools
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor - attach auth token + CSRF
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['x-csrf-token'] = 'osint-csrf-protection';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and network errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auto-logout on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry401) {
      originalRequest._retry401 = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry once on network failure / timeout (ERR_NETWORK_CHANGED, ERR_FAILED)
    if (!error.response && !originalRequest._retried) {
      originalRequest._retried = true;
      await new Promise((r) => setTimeout(r, 1500));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
