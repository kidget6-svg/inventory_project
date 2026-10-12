import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { useBranch } from '../context/BranchContext';
import { useTheme } from '../context/ThemeContext';
import {
    Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw,
    Search, X, ChevronLeft, ChevronRight, Package, Pill, ShoppingCart,
    ArrowLeftRight, Calendar, Filter, SlidersHorizontal, CheckCheck,
    Eye, ExternalLink, Clock, Building2, Warehouse, Store,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

const READ_KEY = 'alerts_read_ids';      // localStorage key for read IDs
const PER_PAGE = 20;

const PRIORITY_CONFIG = {
    critical: {
        label: 'Critical',
        icon: AlertCircle,
        dot: 'bg-red-500',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        border: 'border-l-red-500',
        bg: 'bg-red-50/60 dark:bg-red-900/10',
        text: 'text-red-600 dark:text-red-400',
    },
    warning: {
        label: 'Warning',
        icon: AlertTriangle,
        dot: 'bg-amber-500',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        border: 'border-l-amber-500',
        bg: 'bg-amber-50/60 dark:bg-amber-900/10',
        text: 'text-amber-600 dark:text-amber-400',
    },
    info: {
        label: 'Info',
        icon: Info,
        dot: 'bg-sky-500',
        badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
        border: 'border-l-sky-500',
        bg: 'bg-sky-50/40 dark:bg-sky-900/10',
        text: 'text-sky-600 dark:text-sky-400',
    },
};

const TYPE_LABELS = {
    out_of_stock:     'Out of Stock',
    expired:          'Expired',
    low_stock:        'Low Stock',
    expiring_soon:    'Expiring Soon',
    pending_purchase: 'Pending Purchase',
    pending_transfer: 'Pending Transfer',
};

const DATE_RANGES = [
    { key: '', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last_7', label: 'Last 7 Days' },
    { key: 'last_30', label: 'Last 30 Days' },
];

const SORT_OPTIONS = [
    { key: 'newest', label: 'Newest First' },
    { key: 'oldest', label: 'Oldest First' },
    { key: 'priority', label: 'Highest Priority' },
    { key: 'unread', label: 'Unread First' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Local read-state helpers
// ─────────────────────────────────────────────────────────────────────────────

function getReadIds() {
    try {
        return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'));
    } catch {
        return new Set();
    }
}

function markReadInStorage(id) {
    const ids = getReadIds();
    ids.add(id);
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

function markAllReadInStorage(ids) {
    const existing = getReadIds();
    ids.forEach(id => existing.add(id));
    localStorage.setItem(READ_KEY, JSON.stringify([...existing]));
}

// ─────────────────────────────────────────────────────────────────────────────
//  Time helpers
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(iso) {
    if (!iso) return '';
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diff = Math.max(0, now - then);
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Location icon
// ─────────────────────────────────────────────────────────────────────────────

function LocationIcon({ type, size = 13 }) {
    if (type === 'warehouse') return <Warehouse size={size} className="text-sky-500 shrink-0" />;
    if (type === 'all') return <Building2 size={size} className="text-purple-500 shrink-0" />;
    return <Store size={size} className="text-emerald-500 shrink-0" />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Alert type icon
// ─────────────────────────────────────────────────────────────────────────────

function AlertTypeIcon({ type, priority, size = 16 }) {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.info;
    const Icon = cfg.icon;
    return <Icon size={size} className={cfg.text} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Skeleton row
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Summary Card
// ─────────────────────────────────────────────────────────────────────────────

function SummaryCard({ label, value, icon: Icon, color }) {
    return (
        <div className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}>
            <div className="shrink-0">
                <Icon size={22} />
            </div>
            <div>
                <div className="text-2xl font-bold leading-none">{value ?? '—'}</div>
                <div className="text-xs font-medium mt-0.5 opacity-80">{label}</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Alert Details Drawer
// ─────────────────────────────────────────────────────────────────────────────

function AlertDrawer({ alert, onClose, onNavigate, isDark }) {
    if (!alert) return null;

    const cfg = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.info;
    const Icon = cfg.icon;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Drawer */}
            <div className={`fixed right-0 top-0 h-full w-full sm:w-96 z-50 shadow-2xl flex flex-col ${isDark ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Icon size={18} className={cfg.text} />
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alert Details</span>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Priority badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                        <Icon size={12} />
                        {cfg.label}
                    </div>

                    {/* Title & message */}
                    <div>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.title}</div>
                        <p className={`mt-1 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{alert.message}</p>
                    </div>

                    {/* Fields */}
                    <div className={`rounded-xl border divide-y ${isDark ? 'border-gray-700 divide-gray-700' : 'border-gray-100 divide-gray-100'}`}>
                        {alert.medicine_name && (
                            <DrawerRow label="Medicine" value={alert.medicine_name} isDark={isDark} />
                        )}
                        {alert.extra?.quantity !== undefined && (
                            <DrawerRow label="Current Stock" value={`${alert.extra.quantity} units`} isDark={isDark} />
                        )}
                        {alert.extra?.reorder_level !== undefined && (
                            <DrawerRow label="Reorder Level" value={`${alert.extra.reorder_level} units`} isDark={isDark} />
                        )}
                        {alert.extra?.batch_number && (
                            <DrawerRow label="Batch Number" value={alert.extra.batch_number} isDark={isDark} />
                        )}
                        {alert.extra?.expiry_date && (
                            <DrawerRow
                                label="Expiry Date"
                                value={new Date(alert.extra.expiry_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                isDark={isDark}
                            />
                        )}
                        {alert.extra?.days_until_expiry !== undefined && (
                            <DrawerRow label="Days Until Expiry" value={`${alert.extra.days_until_expiry} days`} isDark={isDark} />
                        )}
                        {alert.extra?.supplier && (
                            <DrawerRow label="Supplier" value={alert.extra.supplier} isDark={isDark} />
                        )}
                        {alert.extra?.status && (
                            <DrawerRow label="Status" value={<span className="capitalize">{alert.extra.status}</span>} isDark={isDark} />
                        )}
                        {alert.extra?.from && (
                            <DrawerRow label="From" value={alert.extra.from} isDark={isDark} />
                        )}
                        {alert.extra?.to && (
                            <DrawerRow label="To" value={alert.extra.to} isDark={isDark} />
                        )}
                        {alert.location && (
                            <DrawerRow
                                label={alert.location_type === 'warehouse' ? 'Warehouse' : 'Branch'}
                                value={
                                    <span className="flex items-center gap-1.5">
                                        <LocationIcon type={alert.location_type} size={12} />
                                        {alert.location}
                                    </span>
                                }
                                isDark={isDark}
                            />
                        )}
                        <DrawerRow label="Created" value={formatDateTime(alert.created_at)} isDark={isDark} />
                    </div>
                </div>

                {/* Footer */}
                <div className={`px-5 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                        onClick={() => { onNavigate(alert); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        <ExternalLink size={15} />
                        {alert.type === 'pending_purchase' ? 'Open Purchase Orders' :
                         alert.type === 'pending_transfer' ? 'Open Stock Movements' :
                         'Open Medicines'}
                    </button>
                </div>
            </div>
        </>
    );
}

function DrawerRow({ label, value, isDark }) {
    return (
        <div className="flex items-start justify-between px-4 py-3 gap-4">
            <span className={`text-xs font-medium shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
            <span className={`text-xs font-semibold text-right ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{value}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Alerts Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Alerts() {
    const navigate = useNavigate();
    const { selectedBranchId, selectedBranch, branchRefreshKey } = useBranch();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // ── State ────────────────────────────────────────────────────────────────
    const [alerts, setAlerts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1, from: 0, to: 0 });

    // ── Read state (localStorage) ─────────────────────────────────────────────
    const [readIds, setReadIds] = useState(() => getReadIds());

    // ── Filters ───────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // all|unread|critical|warning|read
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);

    const [drawerAlert, setDrawerAlert] = useState(null);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const typeDropRef = useRef(null);
    const dateDropRef = useRef(null);
    const sortDropRef = useRef(null);

    // ── Debounce search ───────────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    // ── Close dropdowns on outside click ─────────────────────────────────────
    useEffect(() => {
        function handleClick(e) {
            if (typeDropRef.current && !typeDropRef.current.contains(e.target)) setTypeDropdownOpen(false);
            if (dateDropRef.current && !dateDropRef.current.contains(e.target)) setDateDropdownOpen(false);
            if (sortDropRef.current && !sortDropRef.current.contains(e.target)) setSortDropdownOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // ── Build query params ────────────────────────────────────────────────────
    const buildParams = useCallback(() => {
        const params = { page, per_page: PER_PAGE, sort };
        if (debouncedSearch) params.search = debouncedSearch;
        if (typeFilter !== 'all') params.type = typeFilter;
        if (dateRange) params.date_range = dateRange;

        // Map filter tabs to priority param
        if (filterTab === 'critical') params.priority = 'critical';
        else if (filterTab === 'warning') params.priority = 'warning';

        return params;
    }, [page, sort, debouncedSearch, typeFilter, dateRange, filterTab]);

    // ── Fetch alerts ──────────────────────────────────────────────────────────
    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/alerts', { params: buildParams() });
            let items = res.data?.data ?? [];

            // Apply client-side read filter
            if (filterTab === 'unread') {
                items = items.filter(a => !readIds.has(a.id));
            } else if (filterTab === 'read') {
                items = items.filter(a => readIds.has(a.id));
            }

            setAlerts(items.map(a => ({ ...a, is_read: readIds.has(a.id) })));
            setMeta(res.data?.meta ?? { total: items.length, current_page: 1, last_page: 1, from: 1, to: items.length });
        } catch (err) {
            console.error('Failed to load alerts:', err);
            setError('Unable to load alerts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [buildParams, filterTab, readIds]);

    const fetchSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const res = await api.get('/alerts/summary');
            setSummary(res.data);
        } catch {
            setSummary(null);
        } finally {
            setSummaryLoading(false);
        }
    }, []);

    // ── Refetch on branch / filter change ────────────────────────────────────
    useEffect(() => {
        setPage(1);
        setAlerts([]);
    }, [branchRefreshKey, selectedBranchId]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts, branchRefreshKey]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary, branchRefreshKey]);

    // ── Computed unread count ─────────────────────────────────────────────────
    const totalUnread = summary ? Math.max(0, (summary.total ?? 0) - readIds.size) : 0;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAlertClick = (alert) => {
        // Mark as read
        if (!readIds.has(alert.id)) {
            markReadInStorage(alert.id);
            setReadIds(getReadIds());
        }
        // Open drawer
        setDrawerAlert(alert);
    };

    const handleNavigate = (alert) => {
        navigate(alert.navigate_to);
    };

    const handleMarkAllRead = () => {
        const allIds = alerts.map(a => a.id);
        markAllReadInStorage(allIds);
        setReadIds(getReadIds());
        setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    };

    const handleRefresh = () => {
        setReadIds(getReadIds());
        fetchAlerts();
        fetchSummary();
    };

    const handleFilterTab = (tab) => {
        setFilterTab(tab);
        setPage(1);
    };

    // ── Derived state ─────────────────────────────────────────────────────────
    const hasUnread = alerts.some(a => !a.is_read && !readIds.has(a.id));

    // ── Classes ────────────────────────────────────────────────────────────────
    const cardBase = isDark
        ? 'bg-gray-800 border border-gray-700 text-white'
        : 'bg-white border border-gray-200 text-gray-900';

    const inputBase = isDark
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500'
        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-sky-400';

    const dropdownBase = isDark
        ? 'bg-gray-800 border-gray-700 shadow-xl'
        : 'bg-white border-gray-100 shadow-xl';

    // ─────────────────────────────────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5">
            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alerts</h1>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Monitor important inventory, stock, purchasing, and system notifications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {(hasUnread || totalUnread > 0) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                        >
                            <CheckCheck size={15} />
                            Mark All as Read
                        </button>
                    )}
                    <button
                        onClick={handleRefresh}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${
                            isDark
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Summary Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard
                    label="Total Alerts"
                    value={summaryLoading ? '…' : (summary?.total ?? 0)}
                    icon={Bell}
                    color={isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-200 text-gray-700'}
                />
                <SummaryCard
                    label="Unread"
                    value={summaryLoading ? '…' : totalUnread}
                    icon={Eye}
                    color={isDark
                        ? 'bg-sky-900/30 border-sky-700 text-sky-300'
                        : 'bg-sky-50 border-sky-200 text-sky-700'}
                />
                <SummaryCard
                    label="Critical"
                    value={summaryLoading ? '…' : (summary?.critical ?? 0)}
                    icon={AlertCircle}
                    color={isDark
                        ? 'bg-red-900/30 border-red-800 text-red-300'
                        : 'bg-red-50 border-red-200 text-red-700'}
                />
                <SummaryCard
                    label="Warning"
                    value={summaryLoading ? '…' : (summary?.warning ?? 0)}
                    icon={AlertTriangle}
                    color={isDark
                        ? 'bg-amber-900/30 border-amber-800 text-amber-300'
                        : 'bg-amber-50 border-amber-200 text-amber-700'}
                />
            </div>

            {/* ── Filters ───────────────────────────────────────────────────── */}
            <div className={`rounded-2xl border p-4 space-y-3 ${cardBase}`}>
                {/* Search */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search alerts by name, medicine, branch, type…"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border transition-colors outline-none ${inputBase}`}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter tabs + dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Tab filters */}
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'unread', label: 'Unread' },
                        { key: 'critical', label: 'Critical' },
                        { key: 'warning', label: 'Warning' },
                        { key: 'read', label: 'Read' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterTab(tab.key)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                filterTab === tab.key
                                    ? 'bg-sky-500 text-white'
                                    : isDark
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}

                    <div className="flex-1" />

                    {/* Alert Type dropdown */}
                    <div className="relative" ref={typeDropRef}>
                        <button
                            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                                typeFilter !== 'all'
                                    ? 'bg-sky-500 text-white border-sky-500'
                                    : isDark
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Filter size={12} />
                            {typeFilter !== 'all' ? TYPE_LABELS[typeFilter] : 'Alert Type'}
                            {typeFilter !== 'all' && (
                                <span
                                    onClick={e => { e.stopPropagation(); setTypeFilter('all'); }}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X size={11} />
                                </span>
                            )}
                        </button>
                        {typeDropdownOpen && (
                            <div className={`absolute right-0 top-full mt-1.5 w-48 rounded-xl border py-1.5 z-20 ${dropdownBase}`}>
                                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setTypeFilter(key); setTypeDropdownOpen(false); setPage(1); }}
                                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                                            typeFilter === key
                                                ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300'
                                                : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date Range dropdown */}
                    <div className="relative" ref={dateDropRef}>
                        <button
                            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                                dateRange
                                    ? 'bg-sky-500 text-white border-sky-500'
                                    : isDark
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Calendar size={12} />
                            {dateRange ? DATE_RANGES.find(d => d.key === dateRange)?.label : 'Date'}
                            {dateRange && (
                                <span
                                    onClick={e => { e.stopPropagation(); setDateRange(''); }}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X size={11} />
                                </span>
                            )}
                        </button>
                        {dateDropdownOpen && (
                            <div className={`absolute right-0 top-full mt-1.5 w-40 rounded-xl border py-1.5 z-20 ${dropdownBase}`}>
                                {DATE_RANGES.map(d => (
                                    <button
                                        key={d.key}
                                        onClick={() => { setDateRange(d.key); setDateDropdownOpen(false); setPage(1); }}
                                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                                            dateRange === d.key
                                                ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300'
                                                : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort dropdown */}
                    <div className="relative" ref={sortDropRef}>
                        <button
                            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                                isDark
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <SlidersHorizontal size={12} />
                            {SORT_OPTIONS.find(s => s.key === sort)?.label ?? 'Sort'}
                        </button>
                        {sortDropdownOpen && (
                            <div className={`absolute right-0 top-full mt-1.5 w-44 rounded-xl border py-1.5 z-20 ${dropdownBase}`}>
                                {SORT_OPTIONS.map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => { setSort(s.key); setSortDropdownOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                                            sort === s.key
                                                ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300'
                                                : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Alert List ────────────────────────────────────────────────── */}
            <div className={`rounded-2xl border overflow-hidden ${cardBase}`}>
                {/* Error */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <AlertCircle size={40} className="text-red-400" />
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading */}
                {!error && loading && (
                    <div>
                        {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                )}

                {/* Empty */}
                {!error && !loading && alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                            <CheckCircle2 size={32} className="text-green-500" />
                        </div>
                        <div className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            You're all caught up
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {selectedBranch?.id === 'all'
                                ? 'No alerts at this time.'
                                : `No alerts for ${selectedBranch?.name ?? 'this branch'}.`}
                        </p>
                    </div>
                )}

                {/* Alert rows */}
                {!error && !loading && alerts.length > 0 && (
                    <div>
                        {alerts.map((alert, idx) => {
                            const isRead = readIds.has(alert.id);
                            const cfg = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.info;
                            const Icon = cfg.icon;

                            return (
                                <button
                                    key={alert.id}
                                    onClick={() => handleAlertClick(alert)}
                                    className={`w-full text-left border-l-4 transition-all duration-150 ${cfg.border} ${
                                        idx < alerts.length - 1
                                            ? `border-b ${isDark ? 'border-b-gray-700' : 'border-b-gray-100'}`
                                            : ''
                                    } ${
                                        isRead
                                            ? isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50/70'
                                            : cfg.bg + ' ' + (isDark ? 'hover:brightness-110' : 'hover:brightness-95')
                                    } group`}
                                >
                                    <div className="flex items-start gap-4 px-5 py-4">
                                        {/* Unread dot */}
                                        <div className="mt-1.5 shrink-0">
                                            {!isRead
                                                ? <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                : <div className="w-2 h-2 rounded-full bg-transparent border border-gray-300 dark:border-gray-600" />
                                            }
                                        </div>

                                        {/* Icon */}
                                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                                            <Icon size={15} className={cfg.text} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                                <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>
                                                    {TYPE_LABELS[alert.type] || alert.type}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${cfg.badge}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className={`text-sm leading-snug ${
                                                isRead
                                                    ? isDark ? 'text-gray-400 font-normal' : 'text-gray-500 font-normal'
                                                    : isDark ? 'text-gray-100 font-medium' : 'text-gray-800 font-semibold'
                                            }`}>
                                                {alert.message}
                                            </p>
                                            {/* Location */}
                                            {alert.location && (
                                                <div className={`flex items-center gap-1 mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    <LocationIcon type={alert.location_type} size={11} />
                                                    {alert.location}
                                                </div>
                                            )}
                                        </div>

                                        {/* Time + view button */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {timeAgo(alert.created_at)}
                                            </span>
                                            <span className={`text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${cfg.text}`}>
                                                <Eye size={11} /> View
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Pagination ────────────────────────────────────────────────── */}
            {!loading && !error && meta.total > PER_PAGE && (
                <div className={`flex flex-wrap items-center justify-between gap-3 px-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="text-xs">
                        Showing {meta.from}–{meta.to} of {meta.total} alerts
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={meta.current_page <= 1}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                isDark
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                            let pg;
                            if (meta.last_page <= 5) {
                                pg = i + 1;
                            } else if (meta.current_page <= 3) {
                                pg = i + 1;
                            } else if (meta.current_page >= meta.last_page - 2) {
                                pg = meta.last_page - 4 + i;
                            } else {
                                pg = meta.current_page - 2 + i;
                            }
                            return (
                                <button
                                    key={pg}
                                    onClick={() => setPage(pg)}
                                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                                        pg === meta.current_page
                                            ? 'bg-sky-500 text-white'
                                            : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {pg}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                            disabled={meta.current_page >= meta.last_page}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                isDark
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Alert Details Drawer ──────────────────────────────────────── */}
            {drawerAlert && (
                <AlertDrawer
                    alert={drawerAlert}
                    onClose={() => setDrawerAlert(null)}
                    onNavigate={handleNavigate}
                    isDark={isDark}
                />
            )}
        </div>
    );
}
