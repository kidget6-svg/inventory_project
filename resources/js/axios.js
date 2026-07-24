import axios from 'axios';

const getCsrfToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
};

export const refreshCsrfToken = async () => {
    try {
        const response = await axios.get('/csrf-token', { withCredentials: true });
        const token = response?.data?.token;

        if (token) {
            const meta = document.querySelector('meta[name="csrf-token"]');
            if (meta) {
                meta.setAttribute('content', token);
            }
        }

        return token;
    } catch (error) {
        return getCsrfToken();
    }
};

const api = axios.create({
    baseURL: '/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = getCsrfToken();
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
        config.headers['X-XSRF-TOKEN'] = token;
    }
    return config;
});

export default api;
