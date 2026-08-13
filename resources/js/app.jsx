 import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SidebarLayout from './components/SidebarLayout';
import { ToastContainer } from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Forbidden from './pages/Forbidden';
import Users from './pages/Users';
import AdminDashboard from './pages/AdminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CashierDashboard from './pages/CashierDashboard';
import PurchasingStaffDashboard from './pages/PurchasingStaffDashboard';
import Medicines from './pages/Medicines';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import CategoryCreate from './pages/CategoryCreate';
import CategoryEdit from './pages/CategoryEdit';
import CategoryView from './pages/CategoryView';
import Suppliers from './pages/Suppliers';
import SupplierCreate from './pages/SupplierCreate';
import SupplierEdit from './pages/SupplierEdit';
import SupplierView from './pages/SupplierView';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderCreate from './pages/PurchaseOrderCreate';
import PurchaseOrderEdit from './pages/PurchaseOrderEdit';
import PurchaseOrderView from './pages/PurchaseOrderView';
import PrescriptionSales from './pages/PrescriptionSales';
import CashierPrescriptionSales from './pages/CashierPrescriptionSales';
import RetailSales from './pages/RetailSales';
import RetailOTCSales from './pages/RetailOTCSales';
import RetailProducts from './pages/RetailProducts';
import StockMovements from './pages/StockMovements';
import StockMovementCreate from './pages/StockMovementCreate';
import StockMovementView from './pages/StockMovementView';
import LowStock from './pages/LowStock';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ReceiptPage from './pages/ReceiptPage';
import SalesHistory from './pages/SalesHistory';

/**
 * ProtectedRoute — enforces authentication AND optional permission checks.
 *
 * Usage:
 *   <ProtectedRoute permission="medicines.view" title="Medicines">...</ProtectedRoute>
 *   <ProtectedRoute anyPermissions={['medicines.view', 'medicines.manage']} title="...">...</ProtectedRoute>
 *
 * When no permission prop is supplied, only authentication is required.
 * Unauthorized users are redirected to /403 (Forbidden page).
 *
 * NOTE: This is defence-in-depth.  The backend Laravel middleware
 * (CheckPermission) always enforces permissions server-side.
 */
function ProtectedRoute({ children, permission, anyPermissions, allPermissions, title }) {
    const { user, loading, can, canAny, canAll } = useAuth();

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

    // Single permission check
    if (permission && !can(permission)) {
        return <Navigate to="/403" replace />;
    }

    // Any-of permission check
    if (anyPermissions && !canAny(anyPermissions)) {
        return <Navigate to="/403" replace />;
    }

    // All-of permission check
    if (allPermissions && !canAll(allPermissions)) {
        return <Navigate to="/403" replace />;
    }

    return <SidebarLayout pageTitle={title}>{children}</SidebarLayout>;
}

/**
 * DashboardRouter — renders the correct dashboard component based on
 * the user's role / permissions.
 */
function DashboardRouter() {
    const { user, can } = useAuth();

    if (user?.role === 'admin')       return <AdminDashboard />;
    if (user?.role === 'pharmacist')  return <PharmacistDashboard />;
    if (user?.role === 'cashier')     return <CashierDashboard />;
    if (user?.role === 'purchasing_staff') return <PurchasingStaffDashboard />;

    // Fallback: if role doesn't match any known dashboard, check permissions
    if (can('reports.view') || can('medicines.view') || can('inventory.view')) {
        return <PharmacistDashboard />;
    }
    if (can('sales.view') || can('retail_sales.manage')) {
        return <CashierDashboard />;
    }
    if (can('purchase_orders.view') || can('purchasing_history.view')) {
        return <PurchasingStaffDashboard />;
    }

    // No recognised role — redirect to 403
    return <Navigate to="/403" replace />;
}

/**
 * SalesRedirect — routes users to the appropriate sales page based
 * on their role / permissions.
 */
function SalesRedirect() {
    const { user, can } = useAuth();

    if (user?.role === 'pharmacist')           return <Navigate to="/prescription-sales" replace />;
    if (user?.role === 'cashier')              return <Navigate to="/retail-sales" replace />;
    // Purchasing staff and admin don't have sales access
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

            {/* 403 Forbidden page (publicly accessible so the redirect works) */}
            <Route path="/403" element={<Forbidden />} />

            {/* Dashboard Router */}
            <Route path="/dashboard" element={
                <ProtectedRoute title="Dashboard"><DashboardRouter /></ProtectedRoute>
            } />

            {/* Admin-only: User management */}
            <Route path="/users" element={
                <ProtectedRoute permission="users.manage" title="User Management"><Users /></ProtectedRoute>
            } />

            {/* Account pages */}
            <Route path="/profile" element={
                <ProtectedRoute title="User Profile"><Profile /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute title="Account Settings"><Settings /></ProtectedRoute>
            } />

            {/* ── Product Management & Operations ── */}

            {/* Medicines — admin, pharmacist (manage); cashier, purchasing_staff (view) */}
            <Route path="/medicines" element={
                <ProtectedRoute anyPermissions={['medicines.view', 'medicines.manage']} title="Medicines"><Medicines /></ProtectedRoute>
            } />

            {/* Inventory — admin, pharmacist */}
            <Route path="/inventory" element={
                <ProtectedRoute anyPermissions={['inventory.view', 'stock_movements.manage']} title="Stock Inventory"><Inventory /></ProtectedRoute>
            } />

            {/* Categories — admin, pharmacist */}
            <Route path="/categories" element={
                <ProtectedRoute anyPermissions={['categories.view', 'categories.manage']} title="Medicine Categories"><Categories /></ProtectedRoute>
            } />
            <Route path="/categories/create" element={
                <ProtectedRoute permission="categories.manage" title="Create Category"><CategoryCreate /></ProtectedRoute>
            } />
            <Route path="/categories/:id/edit" element={
                <ProtectedRoute permission="categories.manage" title="Edit Category"><CategoryEdit /></ProtectedRoute>
            } />
            <Route path="/categories/:id" element={
                <ProtectedRoute anyPermissions={['categories.view', 'categories.manage']} title="Category Details"><CategoryView /></ProtectedRoute>
            } />

            {/* Suppliers — admin, purchasing_staff (manage); pharmacist (view) */}
            <Route path="/suppliers" element={
                <ProtectedRoute anyPermissions={['suppliers.view', 'suppliers.manage']} title="Suppliers Directory"><Suppliers /></ProtectedRoute>
            } />
            <Route path="/suppliers/create" element={
                <ProtectedRoute permission="suppliers.manage" title="Create Supplier"><SupplierCreate /></ProtectedRoute>
            } />
            <Route path="/suppliers/:id/edit" element={
                <ProtectedRoute permission="suppliers.manage" title="Edit Supplier"><SupplierEdit /></ProtectedRoute>
            } />
            <Route path="/suppliers/:id" element={
                <ProtectedRoute anyPermissions={['suppliers.view', 'suppliers.manage']} title="Supplier Details"><SupplierView /></ProtectedRoute>
            } />

            {/* Purchase Orders — admin, purchasing_staff */}
            <Route path="/purchase-orders" element={
                <ProtectedRoute anyPermissions={['purchase_orders.view', 'purchase_orders.manage']} title="Purchase Orders"><PurchaseOrders /></ProtectedRoute>
            } />
            <Route path="/purchase-orders/create" element={
                <ProtectedRoute permission="purchase_orders.manage" title="Create Purchase Order"><PurchaseOrderCreate /></ProtectedRoute>
            } />
            <Route path="/purchase-orders/:id/edit" element={
                <ProtectedRoute permission="purchase_orders.manage" title="Edit Purchase Order"><PurchaseOrderEdit /></ProtectedRoute>
            } />
            <Route path="/purchase-orders/:id" element={
                <ProtectedRoute anyPermissions={['purchase_orders.view', 'purchase_orders.manage']} title="Purchase Order Details"><PurchaseOrderView /></ProtectedRoute>
            } />

            {/* Retail / OTC Products — admin, pharmacist */}
            <Route path="/retail-products" element={
                <ProtectedRoute anyPermissions={['retail_products.view', 'retail_products.manage']} title="Retail & OTC Products"><RetailProducts /></ProtectedRoute>
            } />
            <Route path="/retail-products/create" element={
                <ProtectedRoute permission="retail_products.manage" title="Create Retail Product"><CategoryCreate /></ProtectedRoute>
            } />
            <Route path="/retail-products/:id/edit" element={
                <ProtectedRoute permission="retail_products.manage" title="Edit Retail Product"><CategoryEdit /></ProtectedRoute>
            } />

            {/* ══════════════════════════════════════════════
                Sales Routes
                ══════════════════════════════════════════════ */}

            {/* Prescription Sales — Pharmacist only */}
            <Route path="/prescription-sales" element={
                <ProtectedRoute permission="prescription_sales.dispatch" title="Prescription Sales"><PrescriptionSales /></ProtectedRoute>
            } />

            {/* Prescription Checkout — Cashier only */}
            <Route path="/prescription-sales-cashier" element={
                <ProtectedRoute permission="prescription_sales.checkout" title="Prescription Checkout"><CashierPrescriptionSales /></ProtectedRoute>
            } />

            {/* Retail OTC Sales — Pharmacist only */}
            <Route path="/retail-otc-sales" element={
                <ProtectedRoute permission="prescription_sales.dispatch" title="Retail & OTC Sales"><RetailOTCSales /></ProtectedRoute>
            } />

            {/* Retail Sales — Cashier only */}
            <Route path="/retail-sales" element={
                <ProtectedRoute permission="retail_sales.manage" title="Retail Point of Sale"><RetailSales /></ProtectedRoute>
            } />

            {/* Role-based redirect for legacy /sales path */}
            <Route path="/sales" element={<ProtectedRoute><SalesRedirect /></ProtectedRoute>} />

            {/* Receipt Page — anyone who can view receipts */}
            <Route path="/receipt/:id" element={
                <ProtectedRoute anyPermissions={['receipts.view', 'sales.history', 'sales.view']} title="Receipt"><ReceiptPage /></ProtectedRoute>
            } />

            {/* Sales History — admin, pharmacist, cashier */}
            <Route path="/sales-history" element={
                <ProtectedRoute anyPermissions={['sales.history', 'sales.view']} title="Sales History"><SalesHistory /></ProtectedRoute>
            } />

            {/* ══════════════════════════════════════════════
                Reports & Tracking — admin, pharmacist
                ══════════════════════════════════════════════ */}
            <Route path="/stock-movements" element={
                <ProtectedRoute anyPermissions={['stock_movements.view', 'stock_movements.manage']} title="Stock Movements"><StockMovements /></ProtectedRoute>
            } />
            <Route path="/stock-movements/create" element={
                <ProtectedRoute permission="stock_movements.manage" title="Create Stock Movement"><StockMovementCreate /></ProtectedRoute>
            } />
            <Route path="/stock-movements/:id" element={
                <ProtectedRoute anyPermissions={['stock_movements.view', 'stock_movements.manage']} title="Stock Movement Details"><StockMovementView /></ProtectedRoute>
            } />
            <Route path="/low-stock" element={
                <ProtectedRoute anyPermissions={['low_stock.view', 'low_stock.order']} title="Low Stock Alerts"><LowStock /></ProtectedRoute>
            } />
            <Route path="/reports" element={
                <ProtectedRoute permission="reports.view" title="System Reports"><Reports /></ProtectedRoute>
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
