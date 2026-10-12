import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// Dev proxy target — where the Laravel backend is running.
// Override with:  VITE_DEV_PROXY="http://127.0.0.1:8000" npm run dev
const backend = process.env.VITE_DEV_PROXY || 'http://127.0.0.1:8000';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        proxy: {
            '/api': { target: backend, changeOrigin: true },
            '/sanctum': { target: backend, changeOrigin: true },
            '/storage': { target: backend, changeOrigin: true },
        },
    },
});