import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => Promise.reject(error));

// Handle 401 errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// API Endpoints
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const addTransaction = (data) => API.post('/transactions/', data);
export const getTransactions = (params = {}) => API.get('/transactions/', { params });

export const uploadReceipt = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/transactions/upload-receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadPDF = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/transactions/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
