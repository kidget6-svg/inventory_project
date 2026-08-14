import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import StatCard from '../components/StatCard';
import {
    Eye, Plus, Save, X, Package, Tag, Calendar, FileText, Loader2,
    Search, Filter, RefreshCw, Printer, Download, Trash2, Copy,
    ArrowUpRight, ArrowDownRight, ClipboardList, Activity, TrendingUp,
    Warehouse, Users, Truck, RotateCcw, AlertTriangle, ChevronDown,
    MoreVertical, Send, BarChart3, Info, Layers, Zap, Shield,
    ArrowLeftRight, RotateCw, UserCheck, Building2, Hash,
    TrendingDown, RefreshCcw
} from 'lucide-react';

const movementTypeConfig = {
    in: { label: 'Stock In', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ArrowUpRight },
    out: { label: 'Stock Out', color: 'bg-red-100 text-red-700 border-red-200', icon: ArrowDownRight },
    adjustment: { label: 'Adjustment', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: ClipboardList },
    return: { label: 'Return', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: RotateCcw },
    transfer: { label: 'Transfer', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    damaged: { label: 'Damaged', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Calendar },
    lost: { label: 'Lost', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
    correction: { label: 'Correction', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText },
    self: { label: 'Self Adjustment', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: RotateCw },
};

const SkeletonTable = () => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-4 flex-1 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    </div>
);

export default function StockMovements() {
    const [movements, setMovements] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [hasError, setHasError] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalItem, setModalItem] = useState(null);
    const [form, setForm] = useState({
        medicine_id: '', type: 'in', quantity: '', reference: '', notes: '',
        source_type: '', destination_type: '', branch_id: '', status: 'pending'
    });
    const [submitting, setSubmitting] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [filters, setFilters] = useState({
        search: '', medicine_id: '', category_id: '', supplier_id: '',
        user_id: '', type: '', reference: '', date_from: '', date_to: '', branch: '',
        source_type: '', destination_type: '', is_self: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const loadMovements = useCallback(() => {
        if (hasError) return;
        setLoading(true);
        setError('');
        const params = { page };
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        api.get('/stock-movements', { params })
            .then(r => {
                const data = r.data;
                const movementsData = data.movements?.data || data.movements || [];
                setMovements(Array.isArray(movementsData) ? movementsData : []);
                setMeta(data.movements?.meta || data.meta || null);
                setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
                setHasError(false);
            })
            .catch(err => {
                console.error('Failed to load stock movements:', err);
                setError('Failed to load stock movements');
                setHasError(true);
                setMovements([]);
            })
            .finally(() => setLoading(false));
    }, [page, filters, hasError]);

    useEffect(() => {
        if (!hasError) {
            loadMovements();
        }
    }, [loadMovements, hasError]);

    const loadSummary = useCallback(() => {
        api.get('/stock-movements/summary', { params: filters })
            .then(r => setSummary(r.data))
            .catch(() => {});
    }, [filters]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const loadFilterOptions = useCallback(() => {
        Promise.all([
            api.get('/categories').catch(() => ({ data: [] })),
            api.get('/suppliers').catch(() => ({ data: [] })),
            api.get('/users').catch(() => ({ data: [] })),
        ]).then(([catRes, supRes, userRes]) => {
            setCategories(Array.isArray(catRes.data?.data) ? catRes.data.data : (Array.isArray(catRes.data) ? catRes.data : []));
            setSuppliers(Array.isArray(supRes.data?.data) ? supRes.data.data : (Array.isArray(supRes.data) ? supRes.data : []));
            setUsers(Array.isArray(userRes.data?.data) ? userRes.data.data : (Array.isArray(userRes.data) ? userRes.data : []));
        }).catch(() => {});
    }, []);

    useEffect(() => { loadFilterOptions(); }, [loadFilterOptions]);

    const handlePageChange = (p) => setPage(p);

    const openCreate = () => {
        setModalMode('create');
        setModalItem(null);
        setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '', source_type: '', destination_type: '', branch_id: '', status: 'pending' });
        setError('');
        setShowModal(true);
        loadMedicinesForSelect();
    };

    const openView = (item) => {
        setModalMode('view');
        setModalItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalItem(null);
        setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '', source_type: '', destination_type: '', branch_id: '', status: 'pending' });
        setError('');
    };

    const loadMedicinesForSelect = async () => {
        setFormLoading(true);
        try {
            const r = await api.get('/medicines');
            const list = Array.isArray(r.data?.data) ? r.data.data :
                         Array.isArray(r.data?.medicines?.data) ? r.data.medicines.data :
                         Array.isArray(r.data) ? r.data : [];
            setMedicines(list);
        } catch (err) {
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/stock-movements', form);
            window.showToast('Stock movement recorded successfully', 'success');
            setShowModal(false);
            setHasError(false);
            loadMovements();
            loadMedicinesForSelect();
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording movement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this stock movement?')) return;
        try {
            await api.delete(`/stock-movements/${id}`);
            window.showToast('Stock movement deleted', 'success');
            loadMovements();
            loadMedicinesForSelect();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    const handleExport = () => {
        window.showToast('Preparing PDF export...', 'info');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDuplicate = async (item) => {
        setModalMode('create');
        setModalItem(item);
        setForm({
            medicine_id: item.medicine_id || item.medicine?.id || '',
            type: item.type || 'in',
            quantity: item.quantity || '',
            reference: item.reference ? `${item.reference} (copy)` : '',
            notes: item.notes || '',
            source_type: item.source_type || '',
            destination_type: item.destination_type || '',
            branch_id: item.branch_id || '',
            status: 'pending'
        });
        setError('');
        setShowModal(true);
        loadMedicinesForSelect();
    };

    const handleRetry = () => {
        setHasError(false);
        setError('');
        setPage(1);
        loadMovements();
    };

    const isViewMode = modalMode === 'view';

    const activeFilterCount = useMemo(() => {
        return Object.entries(filters).filter(([_, v]) => v).length;
    }, [filters]);

    const clearFilters = () => {
        setFilters({
            search: '', medicine_id: '', category_id: '', supplier_id: '',
            user_id: '', type: '', reference: '', date_from: '', date_to: '', branch: '',
            source_type: '', destination_type: '', is_self: ''
        });
        setPage(1);
        setHasError(false);
    };

    const getMovementCfg = (type) => movementTypeConfig[type] || { label: type || 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Package };

    const kpiStats = useMemo(() => {
        if (!summary) return null;
        return {
            total: summary.total_movements ?? movements.length ?? 0,
            in: summary.total_in ?? 0,
            out: summary.total_out ?? 0,
            adjustments: summary.total_adjustments ?? 0,
            transfers: summary.total_transfers ?? 0,
            returns: summary.total_returns ?? 0,
            damaged: summary.total_damaged ?? 0,
            expired: summary.total_expired ?? 0,
            lost: summary.total_lost ?? 0,
            self: summary.total_self ?? 0,
            totalQuantity: summary.total_quantity ?? movements.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0),
        };
    }, [summary, movements]);

    if (loading && movements.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                    <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-3">
                    {[...Array(11)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <SkeletonTable />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stock Movements</h2>
                    <p className="text-sm text-gray-500 mt-1">Track and manage inventory movements</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={loadMovements} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all duration-200 hover:shadow-sm" title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={handleExport} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all duration-200 hover:shadow-sm flex items-center gap-2">
                        <Download size={16} /> Export PDF
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all duration-200 hover:shadow-sm flex items-center gap-2">
                        <Printer size={16} /> Print
                    </button>
                    <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-300 flex items-center gap-2">
                        <Plus size={18} /> New Movement
                    </button>
                </div>
            </div>

            {/* KPI Stat Cards */}
            {kpiStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-3">
                    <StatCard value={kpiStats.total} label="Total" icon="package" color="blue" />
                    <StatCard value={kpiStats.in} label="Stock In" icon="trending-up" color="green" />
                    <StatCard value={kpiStats.out} label="Stock Out" icon="trending-down" color="red" />
                    <StatCard value={kpiStats.adjustments} label="Adjustments" icon="clipboard-list" color="orange" />
                    <StatCard value={kpiStats.transfers} label="Transfers" icon="truck" color="purple" />
                    <StatCard value={kpiStats.returns} label="Returns" icon="rotate-ccw" color="sky" />
                    <StatCard value={kpiStats.damaged} label="Damaged" icon="alert" color="red" />
                    <StatCard value={kpiStats.expired} label="Expired" icon="calendar" color="gray" />
                    <StatCard value={kpiStats.lost} label="Lost" icon="alert" color="orange" />
                    <StatCard value={kpiStats.self} label="Self" icon="users" color="teal" />
                    <StatCard value={kpiStats.totalQuantity} label="Qty Moved" icon="activity" color="blue" />
                </div>
            )}

            {/* Error Banner */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button onClick={handleRetry} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                        Retry
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search movements..."
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${showFilters || activeFilterCount > 0 ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Filter size={16} />
                            Filters
                            {activeFilterCount > 0 && <span className="bg-sky-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
                            <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine</label>
                            <select value={filters.medicine_id} onChange={e => setFilters({ ...filters, medicine_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                <option value="">All Medicines</option>
                                {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                            <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                <option value="">All Types</option>
                                {Object.entries(movementTypeConfig).map(([key, cfg]) => (
                                    <option key={key} value={key}>{cfg.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Date From</label>
                            <input type="date" value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Date To</label>
                            <input type="date" value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-sky-600 to-blue-600 text-white">
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Date/Time</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Medicine</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Before</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">After</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Reference</th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {movements.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No stock movements recorded</p>
                                            <button onClick={openCreate} className="text-sm text-sky-600 font-semibold hover:underline">Record your first movement</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : movements.map(m => {
                                const cfg = getMovementCfg(m.type);
                                const Icon = cfg.icon;
                                const isSelf = m.source_type === 'self' || m.destination_type === 'self';
                                return (
                                    <tr key={m.id} className={`hover:bg-sky-50/30 transition-colors duration-150 cursor-pointer ${isSelf ? 'bg-teal-50/20' : ''}`} onClick={() => openView(m)}>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {m.created_at ? new Date(m.created_at).toLocaleString() : '---'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                                                    <Package size={16} className="text-sky-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{m.medicine?.name || '---'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{m.medicine?.barcode || m.medicine?.generic_name || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                                                <Icon size={12} /> {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-sm font-semibold ${m.type === 'in' ? 'text-emerald-600' : m.type === 'out' ? 'text-red-600' : 'text-gray-800'}`}>
                                                {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}{m.quantity || '---'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{m.before_quantity ?? '---'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{m.after_quantity ?? '---'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{m.user?.name || '---'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{m.reference || '---'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => openView(m)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleDuplicate(m)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" title="Duplicate">
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination meta={meta} onPageChange={handlePageChange} />

            {/* Create / View Modal */}
            <Modal open={showModal} onClose={closeModal} title={modalMode === 'create' ? 'Record Stock Movement' : `Movement #${modalItem?.id || ''}`} size="max-w-lg">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}

                {isViewMode && modalItem ? (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
                            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                                <Package className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{modalItem.medicine?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{modalItem.medicine?.category?.name || 'Uncategorized'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getMovementCfg(modalItem.type).color}`}>
                                    {getMovementCfg(modalItem.type).label}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                                <p className="text-sm font-bold text-gray-800">{modalItem.quantity || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Before Stock</label>
                                <p className="text-sm text-gray-600">{modalItem.before_quantity ?? '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">After Stock</label>
                                <p className="text-sm text-gray-600">{modalItem.after_quantity ?? '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Source</label>
                                <p className="text-sm text-gray-600">{modalItem.source_type || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Destination</label>
                                <p className="text-sm text-gray-600">{modalItem.destination_type || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Reference</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1"><Tag size={14} />{modalItem.reference || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1"><Calendar size={14} />{modalItem.created_at ? new Date(modalItem.created_at).toLocaleString() : '---'}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1"><FileText size={14} />{modalItem.notes || '---'}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => handleDuplicate(modalItem)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Copy size={16} /> Duplicate
                            </button>
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-xl hover:bg-sky-700 transition-colors">Close</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    name="medicine_id"
                                    value={form.medicine_id}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                    required
                                    disabled={formLoading}
                                >
                                    <option value="">Select Medicine</option>
                                    {medicines.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity ?? 0})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                required
                            >
                                {Object.entries(movementTypeConfig).map(([key, cfg]) => (
                                    <option key={key} value={key}>{cfg.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Source Type</label>
                                <select name="source_type" value={form.source_type} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                    <option value="">None</option>
                                    <option value="self">Self</option>
                                    <option value="supplier">Supplier</option>
                                    <option value="branch">Branch</option>
                                    <option value="sale">Sale</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Type</label>
                                <select name="destination_type" value={form.destination_type} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                    <option value="">None</option>
                                    <option value="self">Self</option>
                                    <option value="supplier">Supplier</option>
                                    <option value="branch">Branch</option>
                                    <option value="sale">Sale</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    name="reference"
                                    value={form.reference}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <X size={16} /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Recording...</> : <><Save size={16} /> Record Movement</>}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
