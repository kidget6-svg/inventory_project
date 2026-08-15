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
import RolesPermissions from './pages/RolesPermissions';
import AdminDashboard from './pages/AdminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CashierDashboard from './pages/CashierDashboard';
import PurchasingStaffDashboard from './pages/PurchasingStaffDashboard';
import Medicines from './pages/Medicines';
// 🗑️ REMOVED: Inventory - Merged into StockManagement
import StockManagement from './pages/StockManagement'; // 🆕 NEW
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import PrescriptionSales from './pages/PrescriptionSales';
import CashierPrescriptionSales from './pages/CashierPrescriptionSales';
import RetailSales from './pages/RetailSales';
import RetailOTCSales from './pages/RetailOTCSales';
import RetailProducts from './pages/RetailProducts';
import StockMovements from './pages/StockMovements';
// 🗑️ REMOVED: LowStock - Merged into StockManagement
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ReceiptPage from './pages/ReceiptPage';
import SalesHistory from './pages/SalesHistory';
// 🆕 NEW PAGES
import Warehouse from './pages/Warehouse';
import Branches from './pages/Branches';
import AuditLogs from './pages/AuditLogs';
import StockMovementCreate from './pages/StockMovementCreate';
import StockMovementView from './pages/StockMovementView';
import PurchaseOrderCreate from './pages/PurchaseOrderCreate';
import PurchaseOrderEdit from './pages/PurchaseOrderEdit';
import PurchaseOrderView from './pages/PurchaseOrderView';

function ProtectedRoute({ children, permissions, roles, title }) {
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

    // Role-based guard (e.g. roles={['admin', 'purchasing_staff']})
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Permission-based guard
    if (permissions && !hasAnyPermission(permissions)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <SidebarLayout pageTitle={title}>{children}</SidebarLayout>;
}

function DashboardRouter() {
    const { user } = useAuth();
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'pharmacist') return <PharmacistDashboard />;
    if (user?.role === 'purchasing_staff') return <PurchasingStaffDashboard />;
    return <CashierDashboard />;
}

function SalesRedirect() {
    const { hasPermission } = useAuth();
    if (hasPermission('sales.prescription')) return <Navigate to="/prescription-sales" replace />;
    if (hasPermission('sales.retail')) return <Navigate to="/retail-sales" replace />;
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
            {/* ============================================================
                PUBLIC ROUTES
            ============================================================ */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

            {/* ============================================================
                DASHBOARD (Role-based)
            ============================================================ */}
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

            {/* ============================================================
                ACCOUNT PAGES
            ============================================================ */}
            <Route path="/profile" element={
                <ProtectedRoute title="User Profile"><Profile /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute title="Account Settings"><Settings /></ProtectedRoute>
            } />

            {/* ============================================================
                PRODUCT MANAGEMENT
            ============================================================ */}
            <Route path="/medicines" element={
                <ProtectedRoute permissions={['medicines.view']} title="Medicines"><Medicines /></ProtectedRoute>
            } />
            <Route path="/categories" element={
                <ProtectedRoute permissions={['categories.view']} title="Medicine Categories"><Categories /></ProtectedRoute>
            } />
            <Route path="/suppliers" element={
                <ProtectedRoute permissions={['suppliers.view']} title="Suppliers Directory"><Suppliers /></ProtectedRoute>
            } />
            <Route path="/retail-products" element={
                <ProtectedRoute permissions={['retail-products.view']} title="Retail & OTC Products"><RetailProducts /></ProtectedRoute>
            } />

            {/* ============================================================
                WAREHOUSE & INVENTORY (NEW)
            ============================================================ */}
            <Route path="/warehouse" element={
                <ProtectedRoute roles={['admin']} title="Warehouse"><Warehouse /></ProtectedRoute>
            } />

            {/* 🆕 Stock Management - Replaces Inventory + LowStock */}
            <Route path="/stock-management" element={
                <ProtectedRoute roles={['admin', 'pharmacist', 'cashier']} title="Stock Management"><StockManagement /></ProtectedRoute>
            } />

            <Route path="/stock-movements" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="Stock Movements"><StockMovements /></ProtectedRoute>
            } />
            <Route path="/stock-movements/create" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="Create Stock Movement"><StockMovementCreate /></ProtectedRoute>
            } />
            <Route path="/stock-movements/:id" element={
                <ProtectedRoute roles={['admin', 'pharmacist']} title="Stock Movement Details"><StockMovementView /></ProtectedRoute>
            } />

            {/* ============================================================
                BRANCHES (NEW)
            ============================================================ */}
            <Route path="/branches" element={
                <ProtectedRoute roles={['admin']} title="Branches"><Branches /></ProtectedRoute>
            } />

            {/* ============================================================
                PURCHASE ORDERS
            ============================================================ */}
            <Route path="/purchase-orders" element={
                <ProtectedRoute roles={['admin', 'purchasing_staff']} title="Purchase Orders"><PurchaseOrders /></ProtectedRoute>
            } />
            <Route path="/purchase-orders/create" element={
                <ProtectedRoute roles={['admin', 'purchasing_staff']} title="Create Purchase Order"><PurchaseOrderCreate /></ProtectedRoute>
            } />
            <Route path="/purchase-orders/:id" element={
                <ProtectedRoute roles={['admin', 'purchasing_staff']} title="Purchase Order Details"><PurchaseOrderView /></ProtectedRoute>
            } />
            <Route path="/purchase-orders/:id/edit" element={
                <ProtectedRoute roles={['admin', 'purchasing_staff']} title="Edit Purchase Order"><PurchaseOrderEdit /></ProtectedRoute>
            } />

            {/* ============================================================
                SALES
            ============================================================ */}
            <Route path="/prescription-sales" element={
                <ProtectedRoute permissions={['sales.prescription']} title="Prescription Sales"><PrescriptionSales /></ProtectedRoute>
            } />
            <Route path="/prescription-sales-cashier" element={
                <ProtectedRoute permissions={['sales.checkout']} title="Prescription Checkout"><CashierPrescriptionSales /></ProtectedRoute>
            } />
            <Route path="/retail-otc-sales" element={
                <ProtectedRoute permissions={['sales.retail']} title="Retail & OTC Sales"><RetailOTCSales /></ProtectedRoute>
            } />
            <Route path="/retail-sales" element={
                <ProtectedRoute permissions={['sales.retail']} title="Retail Point of Sale"><RetailSales /></ProtectedRoute>
            } />

            {/* Permission-based redirect for legacy /sales path */}
            <Route path="/sales" element={<ProtectedRoute><SalesRedirect /></ProtectedRoute>} />

            {/* ============================================================
                RECEIPT & SALES HISTORY
            ============================================================ */}
            <Route path="/receipt/:id" element={
                <ProtectedRoute permissions={['sales.receipt']} title="Receipt"><ReceiptPage /></ProtectedRoute>
            } />
            <Route path="/sales-history" element={
                <ProtectedRoute permissions={['sales.view']} title="Sales History"><SalesHistory /></ProtectedRoute>
            } />

            <Route path="/reports" element={
                <ProtectedRoute permissions={['reports.view']} title="System Reports"><Reports /></ProtectedRoute>
            } />

            {/* ============================================================
                AUDIT LOGS (NEW - Admin Only)
            ============================================================ */}
            <Route path="/audit-logs" element={
                <ProtectedRoute roles={['admin']} title="Audit Logs"><AuditLogs /></ProtectedRoute>
            } />

            {/* ============================================================
                LEGACY REDIRECTS
                Redirect old paths to new ones
            ============================================================ */}
            {/* Inventory → StockManagement */}
            <Route path="/inventory" element={
                <Navigate to="/stock-management" replace />
            } />
            {/* LowStock → StockManagement */}
            <Route path="/low-stock" element={
                <Navigate to="/stock-management" replace />
            } />

            {/* ============================================================
                FALLBACK - 404 Not Found
            ============================================================ */}
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
