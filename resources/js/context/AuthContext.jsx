import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { refreshCsrfToken } from '../axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        await refreshCsrfToken();
        setUser(res.data);
        return res.data;
    };

    const register = async (data) => {
        const res = await api.post('/register', data);
        await refreshCsrfToken();
        setUser(res.data);
        return res.data;
    };

    const logout = async () => {
        await api.post('/logout');
        await refreshCsrfToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
