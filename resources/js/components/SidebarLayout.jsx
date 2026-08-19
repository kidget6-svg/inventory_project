import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, Pill, FolderTree, Truck, ShoppingCart, DollarSign,
    ArrowLeftRight, BarChart3, Menu, X, LogOut, Users,
    Package, PanelLeftClose, PanelLeft, ChevronDown, UserCircle, Settings,
    ShoppingBag, FileText, ShieldCheck, Warehouse, Building2, Boxes,
    Bell, ClipboardList, Store, GitBranch, Moon, Sun
} from 'lucide-react';

const menuItems = [
    // Main
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permissions: ['dashboard.view'] },

    // Product Management
    { section: 'Product Management' },
    { to: '/categories', label: 'Categories', icon: FolderTree, permissions: ['categories.view'] },
    { to: '/medicines', label: 'Medicines', icon: Pill, permissions: ['medicines.view'] },
    { to: '/retail-products', label: 'Retail & OTC Products', icon: Package, permissions: ['retail-products.view'] },

    // Inventory & Warehousing
    { section: 'Inventory & Warehousing' },
    { to: '/warehouse', label: 'Warehouse', icon: Warehouse, permissions: ['warehouse.view'] },
    { to: '/branches', label: 'Branches', icon: Building2, permissions: ['branches.view'] },
    { to: '/stock-movements', label: 'Stock Movements', icon: ArrowLeftRight, permissions: ['stock-movements.view'] },
    { to: '/inventory', label: 'Stock Management', icon: Boxes, permissions: ['inventory.view'] },
    { to: '/suppliers', label: 'Suppliers', icon: Truck, permissions: ['suppliers.view'] },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, permissions: ['purchase-orders.view'] },

    // Point of Sale
    { section: 'Point of Sale' },
    { to: '/sales', label: 'Sales', icon: ShoppingCart, permissions: ['prescription-sales.view', 'retail-otc-sales.view', 'retail-pos.view'] },
    { to: '/sales-checkout', label: 'Sales Checkout', icon: DollarSign, permissions: ['prescription-checkout.view', 'retail-pos.view'] },

    // Reports & Analytics
    { section: 'Reports & Analytics' },
    { to: '/reports', label: 'Reports', icon: BarChart3, permissions: ['reports.view'] },
    { to: '/sales-history', label: 'Sales History', icon: FileText, permissions: ['sales-history.view'] },
    { to: '/alerts', label: 'Alerts', icon: Bell, permissions: ['alerts.view'] },

    // Administration
    { section: 'Administration' },
    { to: '/users', label: 'Users', icon: Users, permissions: ['users.view'] },
    { to: '/roles', label: 'Roles & Permissions', icon: ShieldCheck, permissions: ['roles.view'] },
    { to: '/audit-logs', label: 'Audit Logs', icon: ClipboardList, permissions: ['audit.view'] },
];

function buildMenu(items, hasAnyPermission, userRole) {
    const result = [];
    let pendingSections = [];

    for (const item of items) {
        if (item.section) {
            pendingSections.push(item);
        } else {
            const hasPermission = !item.permissions || hasAnyPermission(item.permissions);
            let hasRole = true;
            if (item.roles) {
                hasRole = item.roles.includes(userRole);
            }
            const allowed = hasPermission && hasRole;
            if (allowed) {
                result.push(...pendingSections);
                pendingSections = [];
                result.push(item);
            }
        }
    }
    return result;
}

const roleBadgeStyle = {
    admin: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    pharmacist: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cashier: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function getBranchDisplayName(user) {
    if (!user) return 'Loading...';
    if (user.role === 'admin') return 'All Branches';
    if (user.branch?.location_type === 'warehouse') return 'Central Warehouse';
    return user.branch?.name || 'No Branch Assigned';
}

function getBranchIcon(user) {
    if (!user) return <Building2 size={14} className="text-gray-400" />;
    if (user.role === 'admin') return <GitBranch size={14} className="text-purple-400" />;
    if (user.branch?.location_type === 'warehouse') return <Warehouse size={14} className="text-sky-400" />;
    return <Store size={14} className="text-green-400" />;
}

export default function SidebarLayout({ children, pageTitle }) {
    const { user, logout, hasAnyPermission } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);

    const menu = buildMenu(menuItems, hasAnyPermission, user?.role || 'guest');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
                setAccountMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-64';
    const mainMargin = collapsed ? 'md:ml-20' : 'md:ml-64';
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
    const branchName = getBranchDisplayName(user);
    const branchIcon = getBranchIcon(user);

    const isDark = theme === 'dark';

    return (
        <div className={`flex min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 bg-sky-500 text-white p-2.5 rounded-xl text-lg md:hidden shadow-lg hover:bg-sky-600 transition-colors"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 w-64 ${sidebarWidth} h-screen bg-[#E3F2FD] dark:bg-gray-800 border-r border-sky-200 dark:border-gray-700 z-40 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
            >
                {/* Logo & Brand */}
                <div className="p-4 border-b border-sky-200 dark:border-gray-700 flex items-center justify-between">
                    <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'md:justify-center md:w-full' : ''}`}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xl ring-2 ring-sky-400/70 bg-white dark:bg-gray-700 transform hover:scale-105 transition-transform duration-200">
                            <img src="/images/p1.png" alt="EthioPharmacy" className="w-10 h-10 object-contain" />
                        </div>
                        {!collapsed && (
                            <div className="min-w-0">
                                <div className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">EthioPharmacy</div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {branchIcon}
                                    <span className="font-medium truncate">{branchName}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`hidden md:flex shrink-0 items-center justify-center w-7 h-7 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-sky-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors ${collapsed ? 'md:absolute md:top-4 md:right-[-14px] bg-[#E3F2FD] dark:bg-gray-800 border border-sky-200 dark:border-gray-700' : ''
                            }`}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                    </button>
                </div>

                {/* User Info - Collapsed View */}
                {collapsed && (
                    <div className="flex flex-col items-center py-3 border-b border-sky-200 dark:border-gray-700">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {userInitial}
                        </div>
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 text-center font-medium truncate w-full px-2">
                            {user?.name?.split(' ')[0] || 'User'}
                        </div>
                        <div className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${roleBadgeStyle[user?.role] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {user?.role || 'Guest'}
                        </div>
                        <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate w-full px-2 text-center">
                            {branchName}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                    {menu.map((item, i) =>
                        item.section ? (
                            collapsed ? (
                                <div key={`sec-${i}`} className="mx-3 mt-4 mb-1.5 border-t border-sky-200 dark:border-gray-700" />
                            ) : (
                                <div key={`sec-${i}`} className="px-5 pt-4 pb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    {item.section}
                                </div>
                            )
                        ) : (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                title={collapsed ? item.label : undefined}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 mx-2 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${collapsed ? 'md:justify-center md:px-0 md:mx-3' : ''
                                    } ${isActive
                                        ? 'bg-sky-500 text-white shadow-sm'
                                        : 'text-gray-800 dark:text-gray-200 hover:bg-sky-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <item.icon size={18} className="shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        )
                    )}
                </nav>

                {/* Theme Toggle - Bottom of Sidebar */}
                {!collapsed && (
                    <div className="p-4 border-t border-sky-200 dark:border-gray-700">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {isDark ? (
                                <>
                                    <Sun size={18} className="text-amber-500" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={18} className="text-sky-600" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${mainMargin} min-h-screen transition-all duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* Top Bar */}
                <div className={`sticky top-0 z-30 ${isDark ? 'bg-gray-800/80 backdrop-blur-md border-gray-700' : 'bg-white/80 backdrop-blur-md border-sky-200/60'} border-b px-6 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
                            {pageTitle || 'Dashboard'}
                        </h2>
                        {user && user.role !== 'admin' && user.branch && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 rounded-full border border-sky-200 dark:border-sky-800">
                                <Store size={12} />
                                {user.branch.name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle - Top Bar (Mobile) */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors md:hidden"
                        >
                            {isDark ? (
                                <Sun size={18} className="text-amber-500" />
                            ) : (
                                <Moon size={18} className="text-sky-600" />
                            )}
                        </button>

                        {/* Account Menu */}
                        <div className="relative" ref={accountMenuRef}>
                            <button
                                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-sky-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                    {userInitial}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>
                                        {user?.name || 'User'}
                                    </div>
                                    <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${roleBadgeStyle[user?.role] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                        {user?.role || 'Guest'}
                                    </div>
                                </div>
                                <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {accountMenuOpen && (
                                <div className={`absolute right-0 mt-2 w-56 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-sky-100'} rounded-xl shadow-lg border py-2 z-50`}>
                                    <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-sky-100'} mb-1`}>
                                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                                            {user?.name || 'User'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user?.email || ''}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${roleBadgeStyle[user?.role] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                {user?.role || 'Guest'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{branchName}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setAccountMenuOpen(false); navigate('/profile'); }}
                                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-sky-50'} transition-colors`}
                                    >
                                        <UserCircle size={16} />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => { setAccountMenuOpen(false); navigate('/settings'); }}
                                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-sky-50'} transition-colors`}
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-sky-100'} mt-1 pt-1`}>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}