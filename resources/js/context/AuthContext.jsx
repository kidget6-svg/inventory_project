// resources/js/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/user');
            const userData = res.data;
            // Ensure permissions are always present on the user object
            userData.permissions = userData.permissions || [];
            setUser(userData);
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });

            const token = response.data.access_token || response.data.token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('access_token', token);
            }

            const userData = response.data.user || response.data;
            userData.permissions = userData.permissions || response.data.permissions || [];
            setUser(userData);
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

    // ─────────────────────────────────────────────────────────────
    // Permission helpers — available throughout the React app.
    // These provide *UI-level* permission checks (hiding buttons,
    // menu items, etc.).  Backend enforcement is done via Laravel
    // middleware, which cannot be bypassed.
    // ─────────────────────────────────────────────────────────────

    const permissions = user?.permissions || [];

    /** Check if the user has a single specific permission. */
    const can = useCallback((permission) => {
        if (!permissions.length) return false;
        return permissions.includes(permission) || permissions.includes('*');
    }, [permissions]);

    /** Check if the user has ANY of the given permissions. */
    const canAny = useCallback((perms) => {
        if (!permissions.length || !perms) return false;
        if (permissions.includes('*')) return true;
        return perms.some(p => permissions.includes(p));
    }, [permissions]);

    /** Check if the user has ALL of the given permissions. */
    const canAll = useCallback((perms) => {
        if (!permissions.length || !perms) return false;
        if (permissions.includes('*')) return true;
        return perms.every(p => permissions.includes(p));
    }, [permissions]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                permissions,
                can,
                canAny,
                canAll,
                refetchUser: fetchUser,
            }}
        >
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

/** Convenience hook for permission checks in any component. */
export const usePermission = () => {
    const { can, canAny, canAll, permissions } = useAuth();
    return { can, canAny, canAll, permissions };
};
