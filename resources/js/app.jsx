import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SidebarLayout from './components/SidebarLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CashierDashboard from './pages/CashierDashboard';
import Medicines from './pages/Medicines';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Sales from './pages/Sales';
import StockMovements from './pages/StockMovements';
import LowStock from './pages/LowStock';
import Reports from './pages/Reports';

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen text-blue-500 text-lg">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
    return <SidebarLayout>{children}</SidebarLayout>;
}

function DashboardRouter() {
    const { user } = useAuth();
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'pharmacist') return <PharmacistDashboard />;
    return <CashierDashboard />;
}

function App() {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen text-blue-500 text-lg">Loading...</div>;

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

            <Route path="/dashboard" element={
                <ProtectedRoute><DashboardRouter /></ProtectedRoute>
            } />

            <Route path="/medicines" element={
                <ProtectedRoute roles={['admin','pharmacist']}><Medicines /></ProtectedRoute>
            } />
            <Route path="/categories" element={
                <ProtectedRoute roles={['admin','pharmacist']}><Categories /></ProtectedRoute>
            } />
            <Route path="/suppliers" element={
                <ProtectedRoute roles={['admin']}><Suppliers /></ProtectedRoute>
            } />
            <Route path="/purchase-orders" element={
                <ProtectedRoute roles={['admin']}><PurchaseOrders /></ProtectedRoute>
            } />
            <Route path="/sales" element={
                <ProtectedRoute roles={['admin','cashier']}><Sales /></ProtectedRoute>
            } />
            <Route path="/stock-movements" element={
                <ProtectedRoute roles={['admin','pharmacist']}><StockMovements /></ProtectedRoute>
            } />
            <Route path="/low-stock" element={
                <ProtectedRoute roles={['admin','pharmacist']}><LowStock /></ProtectedRoute>
            } />
            <Route path="/reports" element={
                <ProtectedRoute roles={['admin','pharmacist']}><Reports /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
    );
}

function RootApp() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AuthProvider>
    );
}

const container = document.getElementById('app');

if (container) {
    createRoot(container).render(<React.StrictMode><RootApp /></React.StrictMode>);
}
