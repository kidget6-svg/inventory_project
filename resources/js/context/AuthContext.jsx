import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        api.get('/user')
            .then(res => {
                setUser(res.data);
            })
            .catch(err => {
                console.error('Failed to fetch user:', err.response?.data || err.message);
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
            const response = await api.post('/register', data);
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

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'super_admin') return true;
        return user.permissions?.includes(permission) || false;
    };

    const hasAnyPermission = (permissions) => {
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'super_admin') return true;
        return permissions?.some(p => user.permissions?.includes(p)) || false;
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout,
            hasPermission,
            hasAnyPermission
        }}>
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