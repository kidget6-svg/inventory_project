// resources/js/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { refreshCsrfToken } from '../axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        refreshCsrfToken();
        
        // Check if user is logged in
        api.get('/user')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        try {
            await refreshCsrfToken();
            
            // Use '/login' NOT '/api/login'
            const response = await api.post('/login', { email, password });
            
            // Store token if using Sanctum
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
            }
            
            setUser(response.data.user || response.data);
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    };

    const register = async (data) => {
        try {
            await refreshCsrfToken();
            
            const config = data instanceof FormData 
                ? { headers: { 'Content-Type': undefined } } 
                : {};
                
            // Use '/register' NOT '/api/register'
            const response = await api.post('/register', data, config);
            return response.data;
        } catch (error) {
            console.error('Register error:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Use '/logout' NOT '/api/logout'
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            await refreshCsrfToken();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};