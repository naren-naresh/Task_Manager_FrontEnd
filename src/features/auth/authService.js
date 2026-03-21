import { apiClient } from '../../services/api.js';

const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const login = async (userData) => {
  const response = await apiClient.post('/auth/login', userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const logout = async () => {
  await apiClient.post('/auth/logout'); // adjust path if needed

  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const authService = { register, login, logout };