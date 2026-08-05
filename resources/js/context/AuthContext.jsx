// resources/js/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        
        // Skip calling /api/user if no token exists yet
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        api.get('/user')
            .then(res => setUser(res.data))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });

            const token = response.data.access_token || response.data.token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('access_token', token);
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
            const config = data instanceof FormData 
                ? { headers: { 'Content-Type': undefined } } 
                : {};
                
            const response = await api.post('/register', data, config);
            return response.data;
        } catch (error) {
            console.error('Register error:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
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