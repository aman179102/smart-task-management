import axios from 'axios';
import type { User, TaskFormData, Task, DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Re-export types for backward compatibility
export type { User, TaskFormData, Task, DashboardStats };

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Task API
export const taskAPI = {
  getTasks: (params?: { status?: string; priority?: string }) =>
    api.get('/tasks', { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (task: TaskFormData) => api.post('/tasks', task),
  updateTask: (id: string, task: Partial<TaskFormData>) =>
    api.put(`/tasks/${id}`, task),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  getDashboardStats: () => api.get('/tasks/stats/dashboard'),
};

export default api;
