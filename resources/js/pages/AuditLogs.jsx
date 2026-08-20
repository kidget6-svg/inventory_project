import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import {
    ClipboardList, Search, Filter, Calendar, User as UserIcon,
    Eye, Download, Printer, RefreshCw, ChevronDown, ChevronLeft, ChevronRight,
    Activity, Users, Package, DollarSign, Settings,
    AlertCircle, CheckCircle, XCircle, Clock, FileText, Hash, Tag,
    ArrowUpRight, ArrowDownRight, X, SlidersHorizontal, List, History, MapPin,
    ArrowRight,
} from 'lucide-react';

// ── Actual audit actions stored by the system (mirrors AuditLog model constants) ──
const ACTION_TYPES = [
    'create', 'update', 'delete', 'approve', 'reject', 'stock_adjust',
    'sale_complete', 'user_login', 'user_logout', 'password_change', 'transfer', 'receive',
];

const actionConfig = {
    create: { label: 'Created', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    update: { label: 'Updated', color: 'bg-blue-100 text-blue-700', icon: ArrowUpRight },
    delete: { label: 'Deleted', color: 'bg-red-100 text-red-700', icon: XCircle },
    approve: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    reject: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    stock_adjust: { label: 'Stock Adjust', color: 'bg-amber-100 text-amber-700', icon: Activity },
    sale_complete: { label: 'Sale Complete', color: 'bg-purple-100 text-purple-700', icon: DollarSign },
    user_login: { label: 'Login', color: 'bg-sky-100 text-sky-700', icon: UserIcon },
    user_logout: { label: 'Logout', color: 'bg-gray-100 text-gray-700', icon: UserIcon },
    password_change: { label: 'Password Change', color: 'bg-yellow-100 text-yellow-700', icon: Settings },
    transfer: { label: 'Transfer', color: 'bg-indigo-100 text-indigo-700', icon: ArrowUpRight },
    receive: { label: 'Receive', color: 'bg-teal-100 text-teal-700', icon: ArrowDownRight },
};

const moduleLabels = {
    medicines: 'Medicines',
    retail_products: 'Retail & OTC',
    categories: 'Categories',
    users: 'Users',
    stock: 'Stock',
    suppliers: 'Suppliers',
    purchase_orders: 'Purchases',
    branches: 'Branches',
    shelves: 'Shelves',
    sales: 'Sales',
    warehouse: 'Warehouse',
    settings: 'Settings',
    auth: 'Authentication',
};

const moduleIcons = {
    medicines: Package,
    retail_products: Package,
    categories: Tag,
    users: Users,
    stock: Activity,
    suppliers: Tag,
    purchase_orders: FileText,
    branches: Users,
    shelves: Package,
    sales: DollarSign,
    warehouse: Package,
    settings: Settings,
    auth: UserIcon,
};

// ── Helpers ──────────────────────────────────────────────────────────
const moduleLabel = (m) => moduleLabels[m] || (m ? m.charAt(0).toUpperCase() + m.slice(1) : '—');

const userInitials = (name) => {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
};

const branchOf = (log) => {
    if (log?.user?.branch?.name) return log.user.branch.name;
    if (log?.user) return '—';
    return 'System';
};

const fmtDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};
const fmtTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
const fmtDateLabel = (value) => {
    if (!value) return '';
    const d = new Date(value);
    const today = new Date();
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const same = (a, b) => a.toDateString() === b.toDateString();
    if (same(d, today)) return 'Today';
    if (same(d, yest)) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const summarizeChanges = (before, after) => {
    if (!before && !after) return [];
    const b = before || {};
    const a = after || {};
    const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));
    const changes = [];
    for (const k of keys) {
        const bv = b[k] === null || b[k] === undefined ? '' : String(b[k]);
        const av = a[k] === null || a[k] === undefined ? '' : String(a[k]);
        if (bv !== av) changes.push({ field: k, before: bv, after: av });
    }
    return changes;
};

const deriveDescription = (log) => {
    const action = actionConfig[log.action]?.label || log.action;
    if (['user_login', 'user_logout', 'password_change'].includes(log.action)) {
        return action;
    }
    const changes = summarizeChanges(log.before_values, log.after_values);
    if (changes.length > 0) {
        const parts = changes.slice(0, 3).map((c) => `${c.field} (${c.before || '—'} → ${c.after || '—'})`);
        const more = changes.length > 3 ? ` +${changes.length - 3} more` : '';
        return `${action} ${moduleLabel(log.module)}: ${parts.join(', ')}${more}`;
    }
    const ref = log.record_id ? ` #${log.record_id}` : '';
    return `${action} ${moduleLabel(log.module)}${ref}`;
};

const isSame = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default function AuditLogs() {
    const { user } = useAuth();
    const { branches, selectedBranchId } = useBranch();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('newest');
    const [branchId, setBranchId] = useState(selectedBranchId || 'all');
    const [stats, setStats] = useState(null);

    const [filters, setFilters] = useState({
        date_from: '', date_to: '', user_id: '', action: '', module: '', search: '',
    });
    const [searchInput, setSearchInput] = useState('');
    const [datePreset, setDatePreset] = useState('all');
    const [users, setUsers] = useState([]);
    const [modules, setModules] = useState([]);

    const [selectedLog, setSelectedLog] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showTech, setShowTech] = useState(false);
    const [view, setView] = useState('table'); // table | timeline

    // Keep local branch filter in sync with the global branch context.
    useEffect(() => { setBranchId(selectedBranchId || 'all'); }, [selectedBranchId]);

    // ── Debounced search ──
    useEffect(() => {
        const t = setTimeout(() => {
            setFilters((f) => (f.search === searchInput ? f : { ...f, search: searchInput }));
        }, 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    // ── Build request params ──
    const buildParams = useCallback(() => {
        const params = {
            page,
            sort,
            branch_id: branchId || 'all',
            ...filters,
        };
        Object.keys(params).forEach((k) => {
            if (params[k] === '' || params[k] === null || params[k] === undefined) delete params[k];
        });
        return params;
    }, [page, sort, branchId, filters]);

    // ── Load logs ──
    const loadLogs = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/audit-logs', { params: buildParams() })
            .then((res) => {
                setLogs(res.data.data || []);
                setMeta(res.data);
            })
            .catch(() => setError('Unable to load audit logs.'))
            .finally(() => setLoading(false));
    }, [buildParams]);

    // ── Load stats (branch scoped) ──
    const loadStats = useCallback(() => {
        const params = { branch_id: branchId || 'all' };
        api.get('/audit-logs/stats', { params })
            .then((res) => setStats(res.data))
            .catch(() => {});
    }, [branchId]);

    useEffect(() => { loadLogs(); }, [loadLogs]);
    useEffect(() => { loadStats(); }, [loadStats]);

    // ── Filter options ──
    useEffect(() => {
        let active = true;
        Promise.all([
            api.get('/users', { params: { per_page: -1 } }),
            api.get('/audit-logs/modules'),
        ]).then(([u, m]) => {
            if (!active) return;
            setUsers(Array.isArray(u.data?.data) ? u.data.data : (Array.isArray(u.data) ? u.data : []));
            setModules(m.data || []);
        }).catch(() => {});
        return () => { active = false; };
    }, []);

    // ── Actions ──
    const refresh = () => { loadLogs(); loadStats(); };

    const resetFilters = () => {
        setFilters({ date_from: '', date_to: '', user_id: '', action: '', module: '', search: '' });
        setSearchInput('');
        setDatePreset('all');
        setPage(1);
    };

    const applyDatePreset = (preset) => {
        setDatePreset(preset);
        const today = new Date();
        const iso = (d) => d.toISOString().slice(0, 10);
        let from = '', to = '';
        if (preset === 'today') { from = to = iso(today); }
        else if (preset === 'yesterday') { const y = new Date(today); y.setDate(y.getDate() - 1); from = to = iso(y); }
        else if (preset === 'last7') { const d = new Date(today); d.setDate(d.getDate() - 6); from = iso(d); to = iso(today); }
        else if (preset === 'last30') { const d = new Date(today); d.setDate(d.getDate() - 29); from = iso(d); to = iso(today); }
        setFilters((f) => ({ ...f, date_from: from, date_to: to }));
        setPage(1);
    };

    const toggleActionQuick = (action) => {
        setFilters((f) => ({ ...f, action: f.action === action ? '' : action }));
        setPage(1);
    };

    const openDrawer = (log) => { setSelectedLog(log); setShowTech(false); setDrawerOpen(true); };

    const handleExport = async (format = 'csv') => {
        try {
            const params = { ...buildParams(), format };
            delete params.page;
            const res = await api.get('/audit-logs/export', { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `audit-logs.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            window.showToast('Audit logs exported successfully', 'success');
        } catch {
            window.showToast('Failed to export audit logs', 'error');
        }
    };

    // ── Derived ──
    const hasActiveFilters = useMemo(
        () => !!(filters.search || filters.action || filters.module || filters.user_id
            || filters.date_from || filters.date_to || (branchId && branchId !== 'all')),
        [filters, branchId]
    );

    const timelineGroups = useMemo(() => {
        const map = {};
        logs.forEach((l) => {
            const key = fmtDateLabel(l.created_at);
            if (!map[key]) map[key] = [];
            map[key].push(l);
        });
        return Object.entries(map);
    }, [logs]);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    // ── Render helpers ──
    const ActionBadge = ({ log }) => {
        const a = actionConfig[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700', icon: Activity };
        const Icon = a.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${a.color}`}>
                <Icon size={12} /> {a.label}
            </span>
        );
    };

    const UserCell = ({ log }) => {
        const name = log.user?.name || 'Deleted User';
        const email = log.user?.email;
        return (
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitials(name)}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{name}</div>
                    {email && <div className="text-xs text-gray-400 truncate">{email}</div>}
                </div>
            </div>
        );
    };

    const BranchCell = ({ log }) => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} className="text-gray-400" /> {branchOf(log)}
        </span>
    );

    // Skeleton rows
    const SkeletonRows = () => (
        <>
            {[0, 1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                    {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                        <td key={c} className="px-4 py-3">
                            <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + (i + c) * 7 % 40}%` }}></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );

    const LogRow = ({ log }) => (
        <>
            <tr
                key={log.id}
                onClick={() => openDrawer(log)}
                className="border-b border-gray-100 hover:bg-purple-50/40 transition-colors cursor-pointer hidden md:table-row"
            >
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    <div>{fmtDateLabel(log.created_at)}</div>
                    <div className="text-xs text-gray-400">{fmtTime(log.created_at)}</div>
                </td>
                <td className="px-4 py-3"><UserCell log={log} /></td>
                <td className="px-4 py-3"><ActionBadge log={log} /></td>
                <td className="px-4 py-3 text-sm text-gray-600">{moduleLabel(log.module)}</td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-[260px] truncate" title={deriveDescription(log)}>
                    {deriveDescription(log)}
                </td>
                <td className="px-4 py-3"><BranchCell log={log} /></td>
                <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); openDrawer(log); }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="View details">
                        <Eye size={16} />
                    </button>
                </td>
            </tr>
            {/* Mobile card */}
            <div key={`m-${log.id}`} onClick={() => openDrawer(log)}
                className="md:hidden border-b border-gray-100 p-4 hover:bg-purple-50/40 cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {userInitials(log.user?.name || 'Deleted User')}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{log.user?.name || 'Deleted User'}</div>
                            <div className="text-xs text-gray-400">{fmtTime(log.created_at)} · {branchOf(log)}</div>
                        </div>
                    </div>
                    <ActionBadge log={log} />
                </div>
                <p className="text-sm text-gray-600 mt-2">{deriveDescription(log)}</p>
                <p className="text-xs text-gray-400 mt-1">{moduleLabel(log.module)}</p>
            </div>
        </>
    );

    // ── Drawer ──
    const Drawer = () => {
        const log = selectedLog;
        if (!log) return null;
        const changes = summarizeChanges(log.before_values, log.after_values);
        return (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Audit Activity</h3>
                            <p className="text-xs text-gray-400">#{log.id}</p>
                        </div>
                        <button onClick={() => setDrawerOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Action</p>
                                <ActionBadge log={log} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Module</p>
                                <p className="text-sm font-medium text-gray-800 capitalize">{moduleLabel(log.module)}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">User</p>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                                    {userInitials(log.user?.name || 'Deleted User')}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{log.user?.name || 'Deleted User'}</p>
                                    {log.user?.email && <p className="text-xs text-gray-400">{log.user.email}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                <p className="text-sm text-gray-700">{fmtDateTime(log.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                    <MapPin size={13} className="text-gray-400" /> {branchOf(log)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {deriveDescription(log)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Record</p>
                            <p className="text-sm font-mono text-gray-700">
                                {moduleLabel(log.module)} #{log.record_id ?? '—'}
                                {log.table_name && <span className="text-gray-400"> ({log.table_name})</span>}
                            </p>
                        </div>

                        {changes.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Changes</p>
                                <div className="space-y-2">
                                    {changes.map((c) => (
                                        <div key={c.field} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <p className="text-xs font-semibold text-gray-600 capitalize mb-1">{c.field.replace(/_/g, ' ')}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="flex-1 text-gray-400 line-through">{c.before || '—'}</span>
                                                <ArrowRight size={14} className="text-purple-500" />
                                                <span className="flex-1 text-gray-800 font-medium">{c.after || '—'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {log.reason && (
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Reason</p>
                                <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-100">{log.reason}</p>
                            </div>
                        )}

                        <div>
                            <button
                                onClick={() => setShowTech((v) => !v)}
                                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                                <FileText size={13} /> {showTech ? 'Hide' : 'View'} Technical Details
                            </button>
                            {showTech && (
                                <pre className="mt-2 bg-gray-900 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto max-h-64">
{JSON.stringify({ before_values: log.before_values, after_values: log.after_values, ip_address: log.ip_address }, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── Summary cards ──
    const summaryCards = [
        { label: 'Total Activities', value: stats?.total ?? 0, icon: ClipboardList, color: 'bg-purple-100 text-purple-600' },
        { label: 'Today', value: stats?.today ?? 0, icon: Clock, color: 'bg-emerald-100 text-emerald-600' },
        { label: 'Created', value: stats?.created ?? 0, icon: CheckCircle, color: 'bg-sky-100 text-sky-600' },
        { label: 'Updated', value: stats?.updated ?? 0, icon: ArrowUpRight, color: 'bg-blue-100 text-blue-600' },
        { label: 'Deleted', value: stats?.deleted ?? 0, icon: XCircle, color: 'bg-red-100 text-red-600' },
    ];

    const quickChips = [
        { label: 'Today', active: datePreset === 'today', onClick: () => applyDatePreset(datePreset === 'today' ? 'all' : 'today') },
        { label: 'Created', active: filters.action === 'create', onClick: () => toggleActionQuick('create') },
        { label: 'Updated', active: filters.action === 'update', onClick: () => toggleActionQuick('update') },
        { label: 'Deleted', active: filters.action === 'delete', onClick: () => toggleActionQuick('delete') },
        { label: 'Transfers', active: filters.action === 'transfer', onClick: () => toggleActionQuick('transfer') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList size={24} className="text-purple-600" />
                        Audit Logs
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track important activities and changes made in the system.
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
                    <button onClick={refresh} className="font-semibold underline">Try Again</button>
                </div>
            )}

            {/* Summary cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {summaryCards.map((c) => {
                        const Icon = c.icon;
                        return (
                            <div key={c.label} className="card p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${c.color}`}><Icon size={18} /></div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-800 leading-tight">{c.value.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">{c.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Search + quick filters + view toggle */}
            <div className="card p-4 space-y-3">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search audit logs (user, email, action, module, record)..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                            <button onClick={() => setView('table')}
                                className={`px-3 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${view === 'table' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <List size={15} /> Table
                            </button>
                            <button onClick={() => setView('timeline')}
                                className={`px-3 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${view === 'timeline' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <History size={15} /> Timeline
                            </button>
                        </div>
                        <button onClick={refresh}
                            className="p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50" title="Refresh">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={() => handleExport('csv')}
                            className="p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50" title="Export CSV">
                            <Download size={16} />
                        </button>
                        <button onClick={() => window.print()}
                            className="p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50" title="Print">
                            <Printer size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {quickChips.map((c) => (
                        <button key={c.label} onClick={c.onClick}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                c.active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}>
                            {c.label}
                        </button>
                    ))}
                    {hasActiveFilters && (
                        <button onClick={resetFilters}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50">
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Filter bar */}
            <div className="card p-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-600">
                    <SlidersHorizontal size={16} /> Filters
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-2.5 text-gray-400" />
                            <select
                                value={datePreset}
                                onChange={(e) => applyDatePreset(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7">Last 7 Days</option>
                                <option value="last30">Last 30 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        {datePreset === 'custom' && (
                            <div className="flex gap-2 mt-2">
                                <input type="date" value={filters.date_from}
                                    onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
                                <input type="date" value={filters.date_to}
                                    onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
                            </div>
                        )}
                    </div>
                    {/* User */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">User</label>
                        <select value={filters.user_id}
                            onChange={(e) => { setFilters((f) => ({ ...f, user_id: e.target.value })); setPage(1); }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white">
                            <option value="">All Users</option>
                            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    {/* Action */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Action</label>
                        <select value={filters.action}
                            onChange={(e) => { setFilters((f) => ({ ...f, action: e.target.value })); setPage(1); }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white">
                            <option value="">All Actions</option>
                            {ACTION_TYPES.map((a) => (
                                <option key={a} value={a}>{actionConfig[a]?.label || a}</option>
                            ))}
                        </select>
                    </div>
                    {/* Module */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Module</label>
                        <select value={filters.module}
                            onChange={(e) => { setFilters((f) => ({ ...f, module: e.target.value })); setPage(1); }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white">
                            <option value="">All Modules</option>
                            {modules.map((m) => <option key={m} value={m}>{moduleLabel(m)}</option>)}
                        </select>
                    </div>
                    {/* Branch */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Branch</label>
                        <select value={branchId}
                            onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
                            disabled={!isAdmin}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="all">All Branches</option>
                            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Sort:</span>
                        <button onClick={() => { setSort('newest'); setPage(1); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${sort === 'newest' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}>Newest</button>
                        <button onClick={() => { setSort('oldest'); setPage(1); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${sort === 'oldest' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}>Oldest</button>
                    </div>
                    {hasActiveFilters && (
                        <button onClick={resetFilters} className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg">
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Count + pagination top */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                    {meta && meta.total != null
                        ? `Showing ${((meta.current_page - 1) * meta.per_page) + 1}–${Math.min(meta.current_page * meta.per_page, meta.total)} of ${meta.total.toLocaleString()}`
                        : (loading ? 'Loading…' : `${logs.length} records`)}
                </div>
            </div>

            {/* Table / Timeline */}
            {view === 'table' ? (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Module</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && logs.length === 0 ? <SkeletonRows /> :
                                    logs.length > 0 ? logs.map((log) => <LogRow key={log.id} log={log} />) :
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="font-medium">No audit logs found</p>
                                            <p className="text-xs mt-1">Try changing your filters or search criteria.</p>
                                            {hasActiveFilters && (
                                                <button onClick={resetFilters} className="mt-3 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg">Clear Filters</button>
                                            )}
                                        </td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {loading && logs.length === 0 ? (
                        <div className="card p-8 text-center text-gray-400">Loading activity…</div>
                    ) : logs.length === 0 ? (
                        <div className="card p-12 text-center text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No audit logs found</p>
                            {hasActiveFilters && (
                                <button onClick={resetFilters} className="mt-3 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg">Clear Filters</button>
                            )}
                        </div>
                    ) : (
                        timelineGroups.map(([label, items]) => (
                            <div key={label}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-lg">{label}</span>
                                    <div className="flex-1 h-px bg-gray-100"></div>
                                </div>
                                <div className="card divide-y divide-gray-100">
                                    {items.map((log) => (
                                        <div key={log.id} onClick={() => openDrawer(log)} className="p-4 hover:bg-purple-50/40 cursor-pointer flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-purple-400 shrink-0"></div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium text-gray-800">{log.user?.name || 'Deleted User'}</span>
                                                    <ActionBadge log={log} />
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{deriveDescription(log)}</p>
                                                <p className="text-xs text-gray-400 mt-1">{moduleLabel(log.module)} · {branchOf(log)} · {fmtTime(log.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            {meta && meta.last_page > 1 && !loading && (
                <Pagination meta={meta} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}

            {drawerOpen && <Drawer />}
        </div>
    );
}
