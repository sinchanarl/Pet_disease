import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  // Use relative base so Vite proxy handles routing (avoids CORS issues).
  // Vite proxies /api → http://localhost:8001/api automatically.
  baseURL: '/',
  timeout: 60000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    if (error.response?.status !== 404) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
