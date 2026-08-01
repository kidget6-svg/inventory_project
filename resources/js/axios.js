// resources/js/axios.js

import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// CSRF Token management
let csrfToken = null;

export const refreshCsrfToken = async () => {
    try {
        const response = await axios.get('/csrf-token', {
            withCredentials: true,
        });
        csrfToken = response.data.token;
        return csrfToken;
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        return null;
    }
};

// Add Bearer Token and CSRF token to requests
api.interceptors.request.use(async (config) => {
    // 1. Attach Bearer Token from localStorage if available
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.method === 'get') {
        return config;
    }

    if (config.url.includes('/login') || config.url.includes('/register')) {
        return config;
    }

    if (!csrfToken) {
        await refreshCsrfToken();
    }

    if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for 419 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419) {
            await refreshCsrfToken();
            const config = error.config;
            if (csrfToken) {
                config.headers['X-CSRF-TOKEN'] = csrfToken;
            }
            return api(config);
        }
        return Promise.reject(error);
    }
);

export default api;