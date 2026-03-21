import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // MANDATORY for HTTP-Only Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle Token Refreshing automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      originalRequest._retry = true;
      try {
        // Call a /refresh endpoint (to be implemented in authRoutes)
        await apiClient.post('/auth/refresh');
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('refreshError: ', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);