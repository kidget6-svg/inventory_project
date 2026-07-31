import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Pill, FolderTree, Truck, ShoppingCart, DollarSign, ArrowLeftRight, AlertTriangle, BarChart3, Menu, X, LogOut, Users, Package } from 'lucide-react';

const adminMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'Management' },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/medicines', label: 'Medicines', icon: Pill },
    { to: '/categories', label: 'Categories', icon: FolderTree },
    { to: '/suppliers', label: 'Suppliers', icon: Truck },
    { section: 'Operations' },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { to: '/sales', label: 'Sales', icon: DollarSign },
    { to: '/stock-movements', label: 'Stock Movements', icon: ArrowLeftRight },
    { section: 'Reports' },
    { to: '/low-stock', label: 'Low Stock Alert', icon: AlertTriangle },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const pharmacistMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'Inventory' },
    { to: '/medicines', label: 'Medicines', icon: Pill },
    { to: '/categories', label: 'Categories', icon: FolderTree },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/stock-movements', label: 'Stock Movements', icon: ArrowLeftRight },
    { section: 'Alerts' },
    { to: '/low-stock', label: 'Low Stock Alert', icon: AlertTriangle },
    { section: 'Reports' },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const cashierMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'Sales' },
    { to: '/sales', label: 'Sales', icon: DollarSign },
    { to: '/medicines', label: 'Medicines', icon: Pill },
];

const menuByRole = { admin: adminMenu, pharmacist: pharmacistMenu, cashier: cashierMenu };

function getMenu(role) {
    return menuByRole[role] || cashierMenu;
}

const roleBadgeStyle = {
    admin: 'bg-sky-100 text-sky-800',
    pharmacist: 'bg-emerald-100 text-emerald-800',
    cashier: 'bg-amber-100 text-amber-800',
};

export default function SidebarLayout({ children, pageTitle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const menu = getMenu(user?.role);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-sky-50/50">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 bg-sky-500 text-white p-2.5 rounded-xl text-lg md:hidden shadow-lg hover:bg-sky-600 transition-colors"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <aside className={`fixed top-0 left-0 w-64 h-screen bg-white shadow-md z-40 flex flex-col overflow-hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-5 border-b border-sky-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center">
                            <Pill size={20} className="text-sky-500" />
                        </div>
                        <div>
                            <div className="text-base font-bold text-gray-900 tracking-tight">PharmaSys</div>
                            <div className="text-[10px] text-gray-500 font-medium">Inventory Management</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-3 overflow-y-auto">
                    {menu.map((item, i) =>
                        item.section ? (
                            <div key={i} className="px-5 pt-4 pb-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                                {item.section}
                            </div>
                        ) : (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 mx-2 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                                        isActive
                                            ? 'bg-sky-100 text-sky-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="p-4 border-t border-sky-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
                            <div className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${roleBadgeStyle[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                                {user?.role}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 md:ml-64 min-h-screen">
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-sky-200/60 px-8 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{pageTitle || 'Dashboard'}</h2>
                </div>
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
