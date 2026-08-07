import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SidebarLayout from './components/SidebarLayout';
import { ToastContainer } from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import AdminDashboard from './pages/AdminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CashierDashboard from './pages/CashierDashboard';
import Medicines from './pages/Medicines';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import PrescriptionSales from './pages/PrescriptionSales';
import RetailSales from './pages/RetailSales';
import StockMovements from './pages/StockMovements';
import LowStock from './pages/LowStock';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function ProtectedRoute({ children, roles, title }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-sky-500 font-semibold text-lg">
                Loading EthioPharmacy....
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return <SidebarLayout pageTitle={title}>{children}</SidebarLayout>;
}

function DashboardRouter() {
    const { user } = useAuth();
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'pharmacist') return <PharmacistDashboard />;
    return <CashierDashboard />;
}

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-sky-500 font-semibold text-lg">
                Loading EthioPharmacy....
            </div>
        );
    }

    return (
        <Routes>
            {/* Public landing & auth pages */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

            {/* Dashboard Router */}
            <Route path="/dashboard" element={
                <ProtectedRoute title="Dashboard"><DashboardRouter /></ProtectedRoute>
            } />

            {/* Admin-only: User management */}
            <Route path="/users" element={
                <ProtectedRoute roles={['admin']} title="User Management"><Users /></ProtectedRoute>
            } />

            {/* Account pages */}
            <Route path="/profile" element={
                <ProtectedRoute title="User Profile"><Profile /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute title="Account Settings"><Settings /></ProtectedRoute>
            } />

            {/* Operations & Inventory */}
            <Route path="/medicines" element={
                <ProtectedRoute roles={['admin', 'pharmacist', 'cashier']} title="Medicines Catalog"><Medicines /></ProtectedRoute>
            } />
            <Route path="/inventory" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="Stock Inventory"><Inventory /></ProtectedRoute>
            } />
            <Route path="/categories" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="Medicine Categories"><Categories /></ProtectedRoute>
            } />
            <Route path="/suppliers" element={
                <ProtectedRoute roles={['admin']} title="Suppliers Directory"><Suppliers /></ProtectedRoute>
            } />
            <Route path="/purchase-orders" element={
                <ProtectedRoute roles={['admin']} title="Purchase Orders"><PurchaseOrders /></ProtectedRoute>
            } />

            {/* Sales Routes */}
            <Route path="/prescription-sales" element={
                <ProtectedRoute roles={['admin', 'pharmacist', 'cashier']} title="Prescription Sales"><PrescriptionSales /></ProtectedRoute>
            } />
            <Route path="/retail-sales" element={
                <ProtectedRoute roles={['admin', 'cashier']} title="Retail Point of Sale"><RetailSales /></ProtectedRoute>
            } />
            {/* Redirect legacy /sales path to prescription-sales */}
            <Route path="/sales" element={<Navigate to="/prescription-sales" replace />} />

            {/* Reports & Tracking */}
            <Route path="/stock-movements" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="Stock Movements"><StockMovements /></ProtectedRoute>
            } />
            <Route path="/low-stock" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="Low Stock Alerts"><LowStock /></ProtectedRoute>
            } />
            <Route path="/reports" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="System Reports"><Reports /></ProtectedRoute>
            } />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
        </Routes>
    );
}

function RootApp() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
            <ToastContainer />
        </AuthProvider>
    );
}

const container = document.getElementById('app');

if (container) {
    createRoot(container).render(<React.StrictMode><RootApp /></React.StrictMode>);
}