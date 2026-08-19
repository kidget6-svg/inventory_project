import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../axios';
import { useAuth } from './AuthContext';

const BranchContext = createContext(null);

export function BranchProvider({ children }) {
    const { user } = useAuth();
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [selectedBranchId, setSelectedBranchIdState] = useState(() => {
        return localStorage.getItem('selected_branch_id') || 'all';
    });
    const [branchRefreshKey, setBranchRefreshKey] = useState(0);

    // Fetch available branches
    const loadBranches = useCallback(async () => {
        if (!user) return;
        setLoadingBranches(true);
        try {
            const res = await api.get('/branches', { params: { per_page: -1 } });
            let list = [];
            if (Array.isArray(res.data)) {
                list = res.data;
            } else if (res.data && Array.isArray(res.data.data)) {
                list = res.data.data;
            }
            setBranches(list);
        } catch (err) {
            console.error('Failed to load branches:', err);
        } finally {
            setLoadingBranches(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadBranches();
        }
    }, [user, loadBranches]);

    // If user is not admin, they are bound to their assigned branch
    useEffect(() => {
        if (user && user.role !== 'admin') {
            const userBranchId = user.branch_id ? String(user.branch_id) : 'all';
            setSelectedBranchIdState(userBranchId);
            localStorage.setItem('selected_branch_id', userBranchId);
        }
    }, [user]);

    const setSelectedBranchId = (id) => {
        const strId = String(id);
        setSelectedBranchIdState(strId);
        localStorage.setItem('selected_branch_id', strId);
        setBranchRefreshKey(prev => prev + 1);
        // Dispatch custom event for immediate multi-component re-fetch
        window.dispatchEvent(new CustomEvent('branchChanged', { detail: { branchId: strId } }));
    };

    const selectedBranch = selectedBranchId === 'all'
        ? { id: 'all', name: 'All Branches', location_type: 'all' }
        : branches.find(b => String(b.id) === String(selectedBranchId)) || { id: selectedBranchId, name: 'Selected Branch' };

    return (
        <BranchContext.Provider value={{
            branches,
            loadingBranches,
            selectedBranchId,
            selectedBranch,
            setSelectedBranchId,
            loadBranches,
            branchRefreshKey,
        }}>
            {children}
        </BranchContext.Provider>
    );
}

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};
