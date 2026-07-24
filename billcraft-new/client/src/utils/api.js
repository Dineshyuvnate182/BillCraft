import axios from 'axios';

const api = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || '/api' 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bc_token');
      localStorage.removeItem('bc_user');
      window.location.href = '/login';
    }
    if (err.response?.status === 403) {
      console.warn('403 Forbidden:', err.response?.data?.error || err.message);
    }
    return Promise.reject(err);
  }
);

export default api;
