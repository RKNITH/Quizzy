import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quizbattle_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message;
      if (message === 'Token expired' || message === 'Invalid or expired token') {
        localStorage.removeItem('quizbattle_token');
        localStorage.removeItem('quizbattle_user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

// ─── Quiz API ──────────────────────────────────────────────────────────────────
export const quizAPI = {
  getAll: (params = {}) => api.get('/quizzes', { params }),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  generateAI: (data) => api.post('/quizzes/ai/generate', data),
  getCategories: () => api.get('/quizzes/categories'),
  seed: () => api.get('/quizzes/seed'),
};

// ─── Room API ──────────────────────────────────────────────────────────────────
export const roomAPI = {
  create: (data) => api.post('/rooms', data),
  join: (data) => api.post('/rooms/join', data),
  getById: (id) => api.get(`/rooms/${id}`),
  start: (id) => api.post(`/rooms/${id}/start`),
  finish: (id) => api.post(`/rooms/${id}/finish`),
  submitAnswer: (roomId, data) => api.post(`/rooms/${roomId}/answer`, data),
  skipQuestion: (roomId, data) => api.post(`/rooms/${roomId}/skip`, data),
  getLeaderboard: (id) => api.get(`/rooms/${id}/leaderboard`),
  getGlobalLeaderboard: (params) => api.get('/rooms/leaderboard/global', { params }),
};

// ─── History API ───────────────────────────────────────────────────────────────
export const historyAPI = {
  getAll: (params = {}) => api.get('/history', { params }),
  getById: (id) => api.get(`/history/${id}`),
  getSuggestion: (id) => api.post(`/history/${id}/suggestion`),
  delete: (id) => api.delete(`/history/${id}`),
};

export default api;