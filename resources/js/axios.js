import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Ensure key matches your login storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const selectedBranchId = localStorage.getItem('selected_branch_id');
  if (selectedBranchId && selectedBranchId !== 'all') {
    config.headers['X-Branch-Id'] = selectedBranchId;
  }
  return config;
});

export default api;