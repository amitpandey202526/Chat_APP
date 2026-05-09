import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const role = localStorage.getItem('role');
  let token;
  if (role === 'admin') {
    token = localStorage.getItem('adminToken');
  } else if (role === 'user') {
    token = localStorage.getItem('userToken');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;