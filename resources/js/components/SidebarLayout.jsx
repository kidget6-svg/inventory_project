import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Pill, FolderTree, Truck, ShoppingCart, DollarSign, 
    ArrowLeftRight, AlertTriangle, BarChart3, Menu, X, LogOut, Users, 
    Package, PanelLeftClose, PanelLeft, ChevronDown, UserCircle, Settings,
    ShoppingBag, FileText
} from 'lucide-react';

const adminMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'Product Management' },
    { to: '/medicines', label: 'Medicines', icon: Pill },
    { to: '/retail-products', label: 'Retail & OTC Products', icon: Package },
    { to: '/categories', label: 'Categories', icon: FolderTree },
    { to: '/suppliers', label: 'Suppliers', icon: Truck },
    { section: 'Administration' },
    { to: '/users', label: 'Users', icon: Users },
    { section: 'Operations' },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { to: '/stock-movements', label: 'Stock Movements', icon: ArrowLeftRight },
    { section: 'Reports' },
    { to: '/low-stock', label: 'Low Stock Alert', icon: AlertTriangle },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/sales-history', label: 'Sales History', icon: FileText },
];

const pharmacistMenu = [
    { section: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'Sales Queue' },
    { to: '/prescription-sales', label: 'Prescription Sales', icon: FileText },
    { to: '/retail-otc-sales', label: 'Retail & OTC Sales', icon: ShoppingBag },
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
    { section: 'Point of Sale' },
    { to: '/prescription-sales-cashier', label: 'Prescription Checkout', icon: FileText },
    { to: '/retail-sales', label: 'Retail Sales', icon: ShoppingBag },
    { to: '/medicines', label: 'Medicines', icon: Pill },
];

const menuByRole = { 
    admin: adminMenu, 
    pharmacist: pharmacistMenu, 
    cashier: cashierMenu 
};

function getMenu(role) {
    return menuByRole[role] || cashierMenu;
}

const roleBadgeStyle = {
    admin: 'bg-sky-100 text-sky-700',
    pharmacist: 'bg-emerald-100 text-emerald-700',
    cashier: 'bg-amber-100 text-amber-700',
};

export default function SidebarLayout({ children, pageTitle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);
    const menu = getMenu(user?.role);

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

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 bg-sky-500 text-white p-2.5 rounded-xl text-lg md:hidden shadow-lg hover:bg-sky-600 transition-colors"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 w-64 ${sidebarWidth} h-screen bg-[#E3F2FD] border-r border-sky-200 z-40 flex flex-col overflow-hidden transition-all duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}
            >
                <div className="p-5 border-b border-sky-200 flex items-center justify-between">
                    <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'md:justify-center md:w-full' : ''}`}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xl ring-2 ring-sky-400/70 bg-white transform hover:scale-105 transition-transform duration-200">
                            <img src="/images/sidebar.png" alt="EthioPharmacy" className="w-10 h-10 object-contain" />
                        </div>
                        {!collapsed && (
                            <div className="min-w-0">
                                <div className="text-base font-bold text-gray-900 tracking-tight truncate">EthioPharmacy</div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`hidden md:flex shrink-0 items-center justify-center w-7 h-7 rounded-lg text-gray-600 hover:bg-sky-200 hover:text-gray-900 transition-colors ${
                            collapsed ? 'md:absolute md:top-4 md:right-[-14px] bg-[#E3F2FD] border border-sky-200' : ''
                        }`}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                    </button>
                </div>

                <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                    {menu.map((item, i) =>
                        item.section ? (
                            collapsed ? (
                                <div key={`sec-${i}`} className="mx-3 mt-4 mb-1.5 border-t border-sky-200" />
                            ) : (
                                <div key={`sec-${i}`} className="px-5 pt-4 pb-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
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
                                    `flex items-center gap-3 mx-2 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                                        collapsed ? 'md:justify-center md:px-0 md:mx-3' : ''
                                    } ${
                                        isActive
                                            ? 'bg-sky-500 text-white shadow-sm'
                                            : 'text-gray-800 hover:bg-sky-200 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon size={18} className="shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        )
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${mainMargin} min-h-screen transition-all duration-300`}>
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-sky-200/60 px-8 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{pageTitle || 'Dashboard'}</h2>

                    <div className="relative" ref={accountMenuRef}>
                        <button
                            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-sky-50 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                {userInitial}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'User'}</div>
                                <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${roleBadgeStyle[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                                    {user?.role || 'Guest'}
                                </div>
                            </div>
                            <ChevronDown size={16} className={`text-gray-500 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {accountMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-sky-100 py-2 z-50">
                                <div className="px-4 py-2 border-b border-sky-100 mb-1">
                                    <div className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</div>
                                    <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                                </div>
                                <button
                                    onClick={() => { setAccountMenuOpen(false); navigate('/profile'); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition-colors"
                                >
                                    <UserCircle size={16} />
                                    Profile
                                </button>
                                <button
                                    onClick={() => { setAccountMenuOpen(false); navigate('/settings'); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition-colors"
                                >
                                    <Settings size={16} />
                                    Settings
                                </button>
                                <div className="border-t border-sky-100 mt-1 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" 
                    onClick={() => setSidebarOpen(false)} 
                />
            )}
        </div>
    );
}