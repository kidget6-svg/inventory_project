import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
    { section: 'Management' },
    { to: '/medicines', label: 'Medicines', icon: '\u{1F48A}' },
    { to: '/categories', label: 'Categories', icon: '\u{1F4C1}' },
    { to: '/suppliers', label: 'Suppliers', icon: '\u{1F4E6}' },
    { section: 'Operations' },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: '\u{1F4C4}' },
    { to: '/sales', label: 'Sales', icon: '\u{1F4B0}' },
    { to: '/stock-movements', label: 'Stock Movements', icon: '\u{1F4CB}' },
    { section: 'Reports' },
    { to: '/low-stock', label: 'Low Stock Alert', icon: '\u{26A0}' },
    { to: '/reports', label: 'Reports', icon: '\u{1F4C8}' },
];

const pharmacistMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
    { section: 'Inventory' },
    { to: '/medicines', label: 'Medicines', icon: '\u{1F48A}' },
    { to: '/categories', label: 'Categories', icon: '\u{1F4C1}' },
    { to: '/stock-movements', label: 'Stock Movements', icon: '\u{1F4CB}' },
    { section: 'Alerts' },
    { to: '/low-stock', label: 'Low Stock Alert', icon: '\u{26A0}' },
    { section: 'Reports' },
    { to: '/reports', label: 'Reports', icon: '\u{1F4C8}' },
];

const cashierMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
    { section: 'Sales' },
    { to: '/sales', label: 'Sales', icon: '\u{1F4B0}' },
    { to: '/medicines', label: 'Medicines', icon: '\u{1F48A}' },
];

const menuByRole = { admin: adminMenu, pharmacist: pharmacistMenu, cashier: cashierMenu };

function getMenu(role) {
    return menuByRole[role] || cashierMenu;
}

const roleColors = {
    admin: 'bg-blue-100 text-blue-700',
    pharmacist: 'bg-green-100 text-green-700',
    cashier: 'bg-orange-100 text-orange-600',
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
        <div className="flex min-h-screen">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 bg-blue-500 text-white p-2.5 rounded-lg text-lg md:hidden"
            >
                &#9776;
            </button>

            <aside className={`fixed top-0 left-0 w-64 h-screen bg-white shadow-md z-40 flex flex-col overflow-hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-5 border-b border-blue-100 text-center">
                    <div className="text-xl font-bold text-blue-700 flex items-center justify-center gap-2">
                        <span className="text-2xl">{'\u{1F48A}'}</span>
                        <span>PharmaSys</span>
                    </div>
                    {user && (
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                            {user.role}
                        </span>
                    )}
                </div>

                <nav className="flex-1 py-4 overflow-y-auto">
                    {menu.map((item, i) =>
                        item.section ? (
                            <div key={i} className="px-5 pt-4 pb-1 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                                {item.section}
                            </div>
                        ) : (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-5 py-2.5 text-sm font-medium border-l-3 transition-all ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border-l-blue-500'
                                            : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600 border-l-transparent'
                                    }`
                                }
                            >
                                <span className="w-5 text-center text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="p-4 border-t border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-700 truncate">{user?.name}</div>
                            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 md:ml-64">
                <div className="bg-white px-8 py-4 shadow-sm flex items-center justify-between">
                    <h2 className="text-xl font-bold text-blue-700">{pageTitle}</h2>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </main>

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
