import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useBranch } from '../context/BranchContext';
import {
    LayoutDashboard, Pill, FolderTree, Truck, ShoppingCart, DollarSign,
    ArrowLeftRight, BarChart3, Menu, X, LogOut, Users,
    Package, PanelLeftClose, PanelLeft, ChevronDown, UserCircle, Settings,
    ShoppingBag, FileText, ShieldCheck, Warehouse, Building2, Boxes,
    Bell, ClipboardList, Store, GitBranch, Moon, Sun, Check, Globe, RefreshCw
} from 'lucide-react';

const menuItems = [
    // Main
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permissions: ['dashboard.view'] },

    // Product Management
    { section: 'Product Management' },
    { to: '/categories', label: 'Categories & Shelves', icon: FolderTree, permissions: ['categories.view'] },
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

export default function SidebarLayout({ children, pageTitle }) {
    const { user, logout, hasAnyPermission } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLanguage, t } = useLanguage();
    const { branches, selectedBranchId, selectedBranch, setSelectedBranchId } = useBranch();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [branchMenuOpen, setBranchMenuOpen] = useState(false);
    const [sidebarBranchOpen, setSidebarBranchOpen] = useState(false);
    const accountMenuRef = useRef(null);
    const branchMenuRef = useRef(null);
    const sidebarBranchRef = useRef(null);

    const isAdmin = user?.role === 'admin';
    const menu = buildMenu(menuItems, hasAnyPermission, user?.role || 'guest');
    const branchName = isAdmin ? selectedBranch?.name : (user?.branch?.name || 'Assigned Branch');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
                setAccountMenuOpen(false);
            }
            if (branchMenuRef.current && !branchMenuRef.current.contains(e.target)) {
                setBranchMenuOpen(false);
            }
            if (sidebarBranchRef.current && !sidebarBranchRef.current.contains(e.target)) {
                setSidebarBranchOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-64';
    const mainMargin = collapsed ? 'md:ml-20' : 'md:ml-64';
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    const getBranchIconElement = (locationType, size = 14) => {
        if (locationType === 'warehouse') return <Warehouse size={size} className="text-sky-500 shrink-0" />;
        if (locationType === 'all') return <Building2 size={size} className="text-purple-500 shrink-0" />;
        return <Store size={size} className="text-emerald-500 shrink-0" />;
    };

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
                className={`fixed top-0 left-0 w-64 ${sidebarWidth} h-screen bg-[#E3F2FD] dark:bg-gray-800 border-r border-sky-200 dark:border-gray-700 z-40 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                                    {isAdmin ? (
                                        <span className="inline-flex items-center gap-1 font-medium text-sky-700 dark:text-sky-300">
                                            <GitBranch size={12} className="text-purple-500" />
                                            Admin Portal
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 font-medium truncate">
                                            {getBranchIconElement(user?.branch?.location_type)}
                                            {user?.branch?.name || 'Assigned Branch'}
                                        </span>
                                    )}
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

                {/* Branch Switcher (Top of Sidebar - for Admins) */}
                {isAdmin && (
                    <div className="relative px-3 py-2.5 border-b border-sky-200 dark:border-gray-700" ref={sidebarBranchRef}>
                        <button
                            onClick={() => setSidebarBranchOpen(!sidebarBranchOpen)}
                            className={`w-full flex items-center ${
                                collapsed ? 'justify-center h-10 w-10 mx-auto' : 'justify-between px-3 py-2'
                            } rounded-xl text-xs font-semibold bg-white dark:bg-gray-700/90 text-gray-800 dark:text-gray-200 border border-sky-200 dark:border-gray-600 hover:bg-sky-50 dark:hover:bg-gray-700 shadow-sm transition-all`}
                            title={`Active Branch: ${selectedBranch.name}`}
                        >
                            <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : 'min-w-0'}`}>
                                {getBranchIconElement(selectedBranch.location_type, collapsed ? 18 : 15)}
                                {!collapsed && (
                                    <span className="truncate">{selectedBranch.name}</span>
                                )}
                            </div>
                            {!collapsed && (
                                <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform duration-200 ${sidebarBranchOpen ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {sidebarBranchOpen && (
                            <div className={`absolute ${
                                collapsed ? 'left-full top-2 ml-2' : 'left-3 right-3 top-full mt-1.5'
                            } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-sky-100'} rounded-xl shadow-xl border py-1.5 z-50 min-w-[210px] max-h-72 overflow-y-auto`}>
                                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                    Switch Branch
                                </div>
                                <button
                                    onClick={() => { setSelectedBranchId('all'); setSidebarBranchOpen(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium ${
                                        selectedBranchId === 'all'
                                            ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-sky-50/60 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Building2 size={14} className="text-purple-500 shrink-0" />
                                        <span className="truncate">All Branches</span>
                                    </div>
                                    {selectedBranchId === 'all' && <Check size={14} className="text-sky-600 shrink-0" />}
                                </button>
                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                                {branches.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => { setSelectedBranchId(b.id); setSidebarBranchOpen(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium ${
                                            String(selectedBranchId) === String(b.id)
                                                ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 font-semibold'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-sky-50/60 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {getBranchIconElement(b.location_type, 14)}
                                            <span className="truncate">{b.name}</span>
                                        </div>
                                        {String(selectedBranchId) === String(b.id) && <Check size={14} className="text-sky-600 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                            {isAdmin ? selectedBranch.name : (user?.branch?.name || 'No Branch')}
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
                                    {t(item.section)}
                                </div>
                            )
                        ) : (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                title={collapsed ? t(item.label) : undefined}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 mx-2 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${collapsed ? 'md:justify-center md:px-0 md:mx-3' : ''
                                    } ${isActive
                                        ? 'bg-sky-500 text-white shadow-sm'
                                        : 'text-gray-800 dark:text-gray-200 hover:bg-sky-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <item.icon size={18} className="shrink-0" />
                                {!collapsed && <span>{t(item.label)}</span>}
                            </NavLink>
                        )
                    )}
                </nav>

                {/* Theme & Language Toggles - Bottom of Sidebar */}
                {!collapsed && (
                    <div className="p-4 border-t border-sky-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? (
                                <Sun size={20} className="text-amber-500" />
                            ) : (
                                <Moon size={20} className="text-sky-600" />
                            )}
                        </button>
                        <button
                            onClick={toggleLanguage}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors flex items-center gap-1.5"
                            title="Switch Language (English / አማርኛ)"
                        >
                            <Globe size={16} className="text-sky-500" />
                            <span>{lang === 'en' ? 'አማ' : 'EN'}</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${mainMargin} min-h-screen transition-all duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* Top Bar */}
                <div className={`sticky top-0 z-30 ${isDark ? 'bg-gray-800/80 backdrop-blur-md border-gray-700' : 'bg-white/80 backdrop-blur-md border-sky-200/60'} border-b px-6 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
                            {pageTitle || 'Dashboard'}
                        </h2>
                        
                        {/* Branch Indicator in Header */}
                        {isAdmin ? (
                            <div className="relative" ref={branchMenuRef}>
                                <button
                                    onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700 hover:bg-sky-100 transition-colors"
                                >
                                    {getBranchIconElement(selectedBranch.location_type, 13)}
                                    <span className="hidden sm:inline">Branch:</span>
                                    <span>{selectedBranch.name}</span>
                                    <ChevronDown size={13} className={`transition-transform ${branchMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {branchMenuOpen && (
                                    <div className={`absolute left-0 mt-2 w-60 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-sky-100'} rounded-xl shadow-xl border py-1.5 z-50`}>
                                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 dark:border-gray-700">
                                            Switch Branch View
                                        </div>
                                        <button
                                            onClick={() => { setSelectedBranchId('all'); setBranchMenuOpen(false); }}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium ${
                                                selectedBranchId === 'all' ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Globe size={14} className="text-purple-500" />
                                                <span>All Branches (Global)</span>
                                            </div>
                                            {selectedBranchId === 'all' && <Check size={14} className="text-sky-600" />}
                                        </button>
                                        {branches.map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => { setSelectedBranchId(b.id); setBranchMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium ${
                                                    String(selectedBranchId) === String(b.id) ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getBranchIconElement(b.location_type, 14)}
                                                    <span>{b.name}</span>
                                                </div>
                                                {String(selectedBranchId) === String(b.id) && <Check size={14} className="text-sky-600" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : user?.branch && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 rounded-full border border-sky-200 dark:border-sky-800">
                                {getBranchIconElement(user.branch.location_type, 12)}
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