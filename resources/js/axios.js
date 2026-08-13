import axios from 'axios';
import { toast } from 'react-hot-toast';

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
  return config;
});

// ─────────────────────────────────────────────────────────────
// 403 Response Interceptor
// ─────────────────────────────────────────────────────────────
// When the Laravel backend returns a 403 Forbidden response we
// redirect the user to a dedicated /403 page that explains what
// happened.  This ensures that even if the frontend *display* logic
// is tampered with, the server-side permission check always wins.
// ─────────────────────────────────────────────────────────────
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 403 && !isRedirecting) {
      isRedirecting = true;
      const message = error.response?.data?.message || 'You do not have permission to perform this action.';
      // Only show toast if the user is currently on a page (not already navigating)
      if (window.location.pathname !== '/403') {
        toast.error(message, { id: 'forbidden-403' });
      }
      // Use replace to avoid polluting browser history
      window.history.replaceState(null, '', '/403');
      // Trigger a manual navigation in React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
      // Reset flag after a short delay so multiple rapid 403s don't stack
      setTimeout(() => { isRedirecting = false; }, 1500);
    }

    return Promise.reject(error);
  }
);

export default api;
