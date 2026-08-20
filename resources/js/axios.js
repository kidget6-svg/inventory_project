import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    // NOTE: Do NOT set 'Content-Type' here.
    // When sending JSON, axios sets it automatically.
    // When sending FormData (image uploads), the browser must set
    // 'multipart/form-data; boundary=...' automatically — a hardcoded
    // 'application/json' default would override it and break file uploads.
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