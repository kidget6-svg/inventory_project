import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import {
    Eye, Plus, Save, X, Package, Tag, Calendar, FileText, Loader2,
    Search, Filter, RefreshCw, Printer, Download, Trash2, Copy,
    ArrowUpRight, ArrowDownRight, ClipboardList, Activity, TrendingUp,
    Warehouse, Users, Truck, RotateCcw, AlertTriangle, ChevronDown,
    MoreVertical, Send, BarChart3, PieChart as PieChartIcon,
    Info, Layers
} from 'lucide-react';

const movementTypeConfig = {
    in: { label: 'Stock In', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ArrowUpRight },
    out: { label: 'Stock Out', color: 'bg-red-100 text-red-700 border-red-200', icon: ArrowDownRight },
    adjustment: { label: 'Adjustment', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: ClipboardList },
    return: { label: 'Return', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: RotateCcw },
    transfer: { label: 'Transfer', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    damage: { label: 'Damage', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Calendar },
    lost: { label: 'Lost', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
    correction: { label: 'Correction', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText },
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

    const [showModal, setShowModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalItem, setModalItem] = useState(null);
    const [form, setForm] = useState({
        medicine_id: '', type: 'in', quantity: '', reference: '', notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [filters, setFilters] = useState({
        search: '', medicine_id: '', category_id: '', supplier_id: '',
        user_id: '', type: '', reference: '', date_from: '', date_to: '', branch: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    const loadMovements = useCallback(() => {
        setLoading(true);
        setError('');
        const params = { page };
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        api.get('/stock-movements', { params })
            .then(r => {
                const data = r.data;
                setMovements(Array.isArray(data.movements?.data) ? data.movements.data : (Array.isArray(data.movements) ? data.movements : []));
                setMeta(data.movements?.meta || data.meta || null);
                setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load stock movements');
            })
            .finally(() => setLoading(false));
    }, [page, filters]);

    useEffect(() => { loadMovements(); }, [loadMovements]);

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
        setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '' });
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
        setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '' });
        setError('');
    };

    const loadMedicinesForSelect = async () => {
        setFormLoading(true);
        try {
            const r = await api.get('/medicines');
            setMedicines(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : []));
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
            loadMovements();
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
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    const handleExport = () => {
        window.showToast('Exporting data...', 'success');
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
        });
        setError('');
        setShowModal(true);
        loadMedicinesForSelect();
    };

    const isViewMode = modalMode === 'view';

    // Stats calculation
    const statsData = useMemo(() => {
        const total = movements.length;
        const stockIn = movements.filter(m => m.type === 'in').length;
        const stockOut = movements.filter(m => m.type === 'out').length;
        const adjustments = movements.filter(m => m.type === 'adjustment' || m.type === 'correction').length;
        const returns = movements.filter(m => m.type === 'return').length;
        const transfers = movements.filter(m => m.type === 'transfer').length;
        const damaged = movements.filter(m => m.type === 'damage').length;
        const expired = movements.filter(m => m.type === 'expired').length;
        const lost = movements.filter(m => m.type === 'lost').length;
        const totalQuantity = movements.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
        
        return { 
            total, stockIn, stockOut, adjustments, returns, transfers, 
            damaged, expired, lost, totalQuantity 
        };
    }, [movements]);

    // Donut chart data
    const donutData = useMemo(() => {
        const typeCounts = {};
        movements.forEach(m => {
            const t = m.type || 'other';
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        const colors = {
            in: '#10b981',
            out: '#ef4444',
            adjustment: '#f59e0b',
            return: '#0ea5e9',
            transfer: '#8b5cf6',
            damage: '#dc2626',
            expired: '#6b7280',
            lost: '#f97316',
            correction: '#3b82f6',
        };
        return {
            labels: Object.keys(typeCounts).map(k => movementTypeConfig[k]?.label || k),
            values: Object.values(typeCounts),
            colors: Object.keys(typeCounts).map(k => colors[k] || '#94a3b8'),
        };
    }, [movements]);

    const filteredMovements = useMemo(() => movements, [movements]);

    const activeFilterCount = useMemo(() => {
        return Object.entries(filters).filter(([_, v]) => v).length;
    }, [filters]);

    const clearFilters = () => {
        setFilters({
            search: '', medicine_id: '', category_id: '', supplier_id: '',
            user_id: '', type: '', reference: '', date_from: '', date_to: '', branch: '',
        });
        setPage(1);
    };

    // Donut Chart Component
    const DonutChart = ({ data, size = 180, innerRadius = 60 }) => {
        const total = data.values.reduce((a, b) => a + b, 0);
        let currentAngle = 0;
        
        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {data.values.map((value, index) => {
                        const percentage = total > 0 ? value / total : 0;
                        const angle = percentage * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        currentAngle = endAngle;
                        
                        const startRad = (startAngle - 90) * Math.PI / 180;
                        const endRad = (endAngle - 90) * Math.PI / 180;
                        const radius = size / 2 - 10;
                        const center = size / 2;
                        
                        const x1 = center + radius * Math.cos(startRad);
                        const y1 = center + radius * Math.sin(startRad);
                        const x2 = center + radius * Math.cos(endRad);
                        const y2 = center + radius * Math.sin(endRad);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        if (value === 0) return null;
                        
                        return (
                            <path
                                key={index}
                                d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                fill={data.colors[index] || '#94a3b8'}
                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                            />
                        );
                    })}
                    {/* Inner circle */}
                    <circle cx={size/2} cy={size/2} r={innerRadius} fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                </div>
            </div>
        );
    };

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
                        <Download size={16} /> Export
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all duration-200 hover:shadow-sm flex items-center gap-2">
                        <Printer size={16} /> Print
                    </button>
                    <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-300 flex items-center gap-2">
                        <Plus size={18} /> New Movement
                    </button>
                </div>
            </div>

            {/* Single Stats Card with Modal */}
            <div 
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => setShowStatsModal(true)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-100 rounded-xl">
                            <Layers className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Movement Summary</p>
                            <p className="text-xs text-gray-400">Click to view all statistics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800">{statsData.total}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{statsData.stockIn}</p>
                            <p className="text-xs text-gray-500">In</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{statsData.stockOut}</p>
                            <p className="text-xs text-gray-500">Out</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">{statsData.adjustments}</p>
                            <p className="text-xs text-gray-500">Adj</p>
                        </div>
                        <div className="hidden sm:block text-center">
                            <p className="text-2xl font-bold text-purple-600">{statsData.transfers}</p>
                            <p className="text-xs text-gray-500">Transfer</p>
                        </div>
                        <div className="hidden sm:block">
                            <Info className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Modal */}
            <Modal 
                open={showStatsModal} 
                onClose={() => setShowStatsModal(false)} 
                title="Movement Statistics" 
                size="max-w-4xl"
            >
                <div className="space-y-6">
                    {/* Summary Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-sky-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-sky-700">{statsData.total}</p>
                            <p className="text-xs text-gray-500">Total Movements</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-emerald-700">{statsData.stockIn}</p>
                            <p className="text-xs text-gray-500">Stock In</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-red-700">{statsData.stockOut}</p>
                            <p className="text-xs text-gray-500">Stock Out</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-amber-700">{statsData.adjustments}</p>
                            <p className="text-xs text-gray-500">Adjustments</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-purple-700">{statsData.transfers}</p>
                            <p className="text-xs text-gray-500">Transfers</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-blue-700">{statsData.returns}</p>
                            <p className="text-xs text-gray-500">Returns</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-red-700">{statsData.damaged}</p>
                            <p className="text-xs text-gray-500">Damaged</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-gray-700">{statsData.expired}</p>
                            <p className="text-xs text-gray-500">Expired</p>
                        </div>
                    </div>

                    {/* Total Quantity */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-500">Total Quantity Changed</p>
                        <p className="text-4xl font-bold text-gray-800">{statsData.totalQuantity}</p>
                    </div>

                    {/* Donut Chart */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4 bg-gray-50/50 rounded-xl">
                        <DonutChart data={donutData} size={200} innerRadius={65} />
                        <div className="grid grid-cols-2 gap-2">
                            {donutData.labels.map((label, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: donutData.colors[index] }}
                                    />
                                    <span className="text-xs text-gray-600">{label}</span>
                                    <span className="text-xs font-semibold text-gray-800">
                                        {donutData.values[index]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Charts - Donut Chart only */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Movement Types</h3>
                        <p className="text-xs text-gray-400">Distribution by category</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <DonutChart data={donutData} size={140} innerRadius={45} />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {donutData.labels.map((label, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div 
                                        className="w-2.5 h-2.5 rounded-full" 
                                        style={{ backgroundColor: donutData.colors[index] }}
                                    />
                                    <span className="text-xs text-gray-600">{label}</span>
                                    <span className="text-xs font-semibold text-gray-800">
                                        {donutData.values[index]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
                        <p className="text-sm text-red-700">{error}</p>
                        <button onClick={loadMovements} className="text-sm text-red-700 font-semibold hover:underline">Retry</button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-sky-50/80 border-b border-sky-100">
                                <th className="px-4 py-3 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">Medicine</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-sky-700 uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-sky-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMovements.map(m => {
                                const cfg = movementTypeConfig[m.type] || { label: m.type || 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Package };
                                const Icon = cfg.icon || Package;
                                return (
                                    <tr key={m.id} className="hover:bg-sky-50/30 transition-colors duration-150 cursor-pointer" onClick={() => openView(m)}>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-500">#{m.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                                                    <Package size={16} className="text-sky-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{m.medicine?.name || '---'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{m.medicine?.generic_name || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                                                <Icon size={12} /> {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">{m.quantity || '---'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{m.reference || <span className="text-gray-400">---</span>}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{m.user?.name || '---'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : '---'}
                                        </td>
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
                            {filteredMovements.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="8" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No stock movements recorded</p>
                                            <button onClick={openCreate} className="text-sm text-sky-600 font-semibold hover:underline">Record your first movement</button>
                                        </div>
                                    </td>
                                </tr>
                            )}
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
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                    {cfg?.label || modalItem.type}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                                <p className="text-sm font-bold text-gray-800">{modalItem.quantity || '---'}</p>
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
                                <option value="in">Stock In</option>
                                <option value="out">Stock Out</option>
                                <option value="adjustment">Adjustment</option>
                                <option value="return">Return</option>
                                <option value="transfer">Transfer</option>
                                <option value="damage">Damage</option>
                                <option value="expired">Expired</option>
                                <option value="lost">Lost</option>
                                <option value="correction">Correction</option>
                            </select>
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