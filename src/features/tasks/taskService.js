import { apiClient } from '../../services/api.js';

const getTasks = async () => {
  const response = await apiClient.get('/tasks');
  return response.data.data;
};

const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data.data;
};

const updateTask = async (id, taskData) => {
  const response = await apiClient.put(`/tasks/${id}`, taskData);
  return response.data.data;
};

const deleteTask = async (id) => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
};

const syncTasks = async (tasks) => {
  const response = await apiClient.post('/tasks/sync', { tasks });
  return response.data.data;
};

export const taskService = { getTasks, createTask, updateTask, deleteTask, syncTasks };