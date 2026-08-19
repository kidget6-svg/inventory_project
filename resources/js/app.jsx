import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BranchProvider } from './context/BranchContext';
import SidebarLayout from './components/SidebarLayout';
import { ToastContainer } from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import RolesPermissions from './pages/RolesPermissions';
import AdminDashboard from './pages/AdminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CashierDashboard from './pages/CashierDashboard';
import Medicines from './pages/Medicines';
import StockManagement from './pages/StockManagement';
import WarehousePage from './pages/Warehouse';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import PrescriptionSales from './pages/PrescriptionSales';
import CashierPrescriptionSales from './pages/CashierPrescriptionSales';
import RetailSales from './pages/RetailSales';
import RetailOTCSales from './pages/RetailOTCSales';
import Sales from './pages/Sales';
import SalesCheckout from './pages/SalesCheckout';
import RetailProducts from './pages/RetailProducts';
import StockMovements from './pages/StockMovements';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ReceiptPage from './pages/ReceiptPage';
import SalesHistory from './pages/SalesHistory';
import Branches from './pages/Branches';

function ProtectedRoute({ children, permissions, title }) {
    const { user, loading, hasAnyPermission } = useAuth();

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

    if (user?.role === 'admin') {
        return <SidebarLayout pageTitle={title}>{children}</SidebarLayout>;
    }

    if (permissions && !hasAnyPermission(permissions)) {
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

function SalesRedirect() {
    const { hasPermission } = useAuth();
    if (hasPermission('prescription-sales.view') || hasPermission('retail-otc-sales.view') || hasPermission('retail-pos.view')) return <Navigate to="/sales" replace />;
    return <Navigate to="/dashboard" replace />;
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

            {/* Administration: Users & Roles */}
            <Route path="/users" element={
                <ProtectedRoute permissions={['users.view']} title="User Management"><Users /></ProtectedRoute>
            } />
            <Route path="/roles" element={
                <ProtectedRoute permissions={['roles.manage']} title="Roles & Permissions"><RolesPermissions /></ProtectedRoute>
            } />
            <Route path="/branches" element={
                <ProtectedRoute title="Branch Management"><Branches /></ProtectedRoute>
            } />

            {/* Account pages */}
            <Route path="/profile" element={
                <ProtectedRoute title="User Profile"><Profile /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute title="Account Settings"><Settings /></ProtectedRoute>
            } />

            {/* Product Management & Operations */}
            <Route path="/medicines" element={
                <ProtectedRoute permissions={['medicines.view']} title="Medicines"><Medicines /></ProtectedRoute>
            } />
            <Route path="/inventory" element={
                <ProtectedRoute permissions={['inventory.view']} title="Stock Inventory"><StockManagement /></ProtectedRoute>
            } />
            <Route path="/categories" element={
                <ProtectedRoute permissions={['categories.view']} title="Medicine Categories"><Categories /></ProtectedRoute>
            } />
            <Route path="/suppliers" element={
                <ProtectedRoute permissions={['suppliers.view']} title="Suppliers Directory"><Suppliers /></ProtectedRoute>
            } />
            <Route path="/purchase-orders" element={
                <ProtectedRoute permissions={['purchase-orders.view']} title="Purchase Orders"><PurchaseOrders /></ProtectedRoute>
            } />
            <Route path="/retail-products" element={
                <ProtectedRoute permissions={['retail-products.view']} title="Retail & OTC Products"><RetailProducts /></ProtectedRoute>
            } />

            {/* Sales Routes */}
            <Route path="/sales" element={
                <ProtectedRoute permissions={['prescription-sales.view', 'retail-otc-sales.view', 'retail-pos.view']} title="Sales"><Sales /></ProtectedRoute>
            } />
            <Route path="/sales-checkout" element={
                <ProtectedRoute permissions={['prescription-checkout.view', 'retail-pos.view']} title="Sales Checkout"><SalesCheckout /></ProtectedRoute>
            } />

            {/* Legacy sales routes (kept for compatibility, no sidebar links) */}
            <Route path="/prescription-sales" element={
                <ProtectedRoute permissions={['prescription-sales.view']} title="Prescription Sales"><PrescriptionSales /></ProtectedRoute>
            } />
            <Route path="/prescription-sales-cashier" element={
                <ProtectedRoute permissions={['prescription-checkout.view']} title="Prescription Checkout"><CashierPrescriptionSales /></ProtectedRoute>
            } />
            <Route path="/retail-otc-sales" element={
                <ProtectedRoute permissions={['retail-otc-sales.view']} title="Retail & OTC Sales"><RetailOTCSales /></ProtectedRoute>
            } />
            <Route path="/retail-sales" element={
                <ProtectedRoute permissions={['retail-pos.view']} title="Retail Point of Sale"><RetailSales /></ProtectedRoute>
            } />
            <Route path="/sales-legacy" element={<ProtectedRoute><SalesRedirect /></ProtectedRoute>} />

            {/* Receipt Page */}
            <Route path="/receipt/:id" element={
                <ProtectedRoute permissions={['sales.receipt']} title="Receipt"><ReceiptPage /></ProtectedRoute>
            } />

            {/* Sales History */}
            <Route path="/sales-history" element={
                <ProtectedRoute permissions={['sales.view']} title="Sales History"><SalesHistory /></ProtectedRoute>
            } />

            {/* Reports & Tracking */}
            <Route path="/stock-movements" element={
                <ProtectedRoute permissions={['inventory.view']} title="Stock Movements"><StockMovements /></ProtectedRoute>
            } />
            <Route path="/warehouse" element={
                <ProtectedRoute permissions={['inventory.view']} title="Warehouse"><WarehousePage /></ProtectedRoute>
            } />

            <Route path="/reports" element={
                <ProtectedRoute permissions={['reports.view']} title="System Reports"><Reports /></ProtectedRoute>
            } />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
        </Routes>
    );
}

function RootApp() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BranchProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                    <ToastContainer />
                </BranchProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

const container = document.getElementById('app');

if (container) {
    createRoot(container).render(<React.StrictMode><RootApp /></React.StrictMode>);
}
