import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
    AlertCircle, AlertTriangle, Package, ShoppingCart, RefreshCw,
    Search, Filter, Eye, History, ClipboardList, Warehouse,
    FileText, Printer, Download, Mail, Upload, TrendingUp,
    TrendingDown, Activity, DollarSign, X, ChevronDown, Info,
    PieChart, BarChart3, Layers, Zap, Clock, Truck,
    Calendar, AlertOctagon, CheckCircle, ArrowUpCircle
} from 'lucide-react';

// ============================================================
// COLOR PALETTE
// ============================================================
const COLORS = {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    orange: '#f97316',
    rose: '#f43f5e',
    sky: '#0ea5e9',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    gray: '#6b7280',
    slate: '#94a3b8'
};

// ============================================================
// DONUT CHART COMPONENT
// ============================================================
const DonutChart = ({ 
    data, 
    title, 
    value, 
    color = COLORS.primary,
    size = 120,
    strokeWidth = 12,
    percentage = 0,
    onClick,
    active = false
}) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div 
            className={`relative cursor-pointer transition-all duration-300 ${
                active ? 'scale-105 ring-2 ring-sky-400 shadow-lg' : 'hover:scale-105 hover:shadow-lg'
            }`}
            onClick={onClick}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-800">{value}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{title}</span>
            </div>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function LowStock() {
    const { hasPermission } = useAuth();
    const canOrder = hasPermission('lowstock.order-now');
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ordering, setOrdering] = useState(null);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [filters, setFilters] = useState({
        search: '', category_id: '', supplier_id: '', status: '', sort: 'name_asc'
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const tableRef = useRef(null);

    // Load data
    const loadData = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/low-stock', { params: { page, ...filters } })
            .then(r => {
                const data = r.data;
                setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
                setMeta(data.meta || null);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load low stock data');
            })
            .finally(() => setLoading(false));
    }, [page, filters]);

    useEffect(() => { loadData(); }, [loadData]);

    const loadCategories = useCallback(() => {
        api.get('/categories')
            .then(r => setCategories(Array.isArray(r.data) ? r.data : []))
            .catch(() => {});
    }, []);

    const loadSuppliers = useCallback(() => {
        api.get('/suppliers')
            .then(r => setSuppliers(Array.isArray(r.data) ? r.data : []))
            .catch(() => {});
    }, []);

    useEffect(() => { loadCategories(); loadSuppliers(); }, []);

    const handleOrderNow = useCallback(async (medicineId) => {
        if (!window.confirm('Create a purchase order for this medicine?')) return;
        setOrdering(medicineId);
        try {
            await api.post(`/low-stock/order-now/${medicineId}`);
            window.showToast?.('Purchase order created successfully', 'success');
            loadData();
        } catch (err) {
            window.showToast?.('Failed to create purchase order', 'error');
        } finally {
            setOrdering(null);
        }
    }, [loadData]);

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({ search: '', category_id: '', supplier_id: '', status: '', sort: 'name_asc' });
        setPage(1);
    }, []);

    const getStockStatus = useCallback((medicine) => {
        const qty = Number(medicine.quantity) || 0;
        const reorder = Number(medicine.reorder_level) || 0;
        if (qty === 0) return { key: 'out', label: 'Out of Stock', color: COLORS.danger };
        if (qty <= reorder / 2) return { key: 'critical', label: 'Critical', color: COLORS.orange };
        if (qty <= reorder) return { key: 'low', label: 'Low Stock', color: COLORS.warning };
        return { key: 'healthy', label: 'Healthy', color: COLORS.success };
    }, []);

    const getStatusBadge = useCallback((medicine) => {
        const status = getStockStatus(medicine);
        const colors = {
            [COLORS.danger]: 'bg-red-100 text-red-700 border-red-200',
            [COLORS.orange]: 'bg-orange-100 text-orange-700 border-orange-200',
            [COLORS.warning]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            [COLORS.success]: 'bg-green-100 text-green-700 border-green-200',
        };
        const colorMap = { 
            [COLORS.danger]: 'red', 
            [COLORS.orange]: 'orange', 
            [COLORS.warning]: 'yellow', 
            [COLORS.success]: 'green' 
        };
        const colorKey = colorMap[status.color] || 'yellow';
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${colors[status.color]}`}>
                {status.color === COLORS.danger || status.color === COLORS.orange ? 
                    <AlertCircle className="w-3.5 h-3.5" /> : 
                    <AlertTriangle className="w-3.5 h-3.5" />
                }
                {status.label}
            </span>
        );
    }, [getStockStatus]);

    // ============================================================
    // CALCULATE METRICS FOR DONUT CHARTS
    // ============================================================

    const metrics = useMemo(() => {
        const total = medicines.length;
        const outOfStock = medicines.filter(m => Number(m.quantity) === 0).length;
        const lowStock = medicines.filter(m => {
            const qty = Number(m.quantity) || 0;
            const reorder = Number(m.reorder_level) || 0;
            return qty > 0 && qty <= reorder;
        }).length;
        const stockValue = medicines.reduce((sum, m) => {
            return sum + (Number(m.quantity) || 0) * (Number(m.purchase_price) || Number(m.unit_price) || 0);
        }, 0);
        const expired = medicines.filter(m => {
            if (!m.expiry_date) return false;
            return new Date(m.expiry_date) < new Date();
        }).length;
        const healthy = total - outOfStock - lowStock;

        return {
            total,
            outOfStock,
            lowStock,
            stockValue,
            expired,
            healthy,
            // Percentages for donut charts
            totalPercentage: 100,
            outOfStockPercentage: total > 0 ? (outOfStock / total) * 100 : 0,
            lowStockPercentage: total > 0 ? (lowStock / total) * 100 : 0,
            expiredPercentage: total > 0 ? (expired / total) * 100 : 0,
            healthyPercentage: total > 0 ? (healthy / total) * 100 : 0,
        };
    }, [medicines]);

    // Donut chart data for each metric
    const donutData = useMemo(() => ({
        total: {
            value: metrics.total,
            label: 'Total Items',
            color: COLORS.sky,
            percentage: 100,
            data: [
                { label: 'Items', value: metrics.total, color: COLORS.sky }
            ]
        },
        outOfStock: {
            value: metrics.outOfStock,
            label: 'Out of Stock',
            color: COLORS.danger,
            percentage: metrics.outOfStockPercentage,
            data: [
                { label: 'Out of Stock', value: metrics.outOfStock, color: COLORS.danger },
                { label: 'In Stock', value: metrics.total - metrics.outOfStock, color: COLORS.success }
            ]
        },
        lowStock: {
            value: metrics.lowStock,
            label: 'Low Stock',
            color: COLORS.warning,
            percentage: metrics.lowStockPercentage,
            data: [
                { label: 'Low Stock', value: metrics.lowStock, color: COLORS.warning },
                { label: 'Healthy', value: metrics.total - metrics.lowStock, color: COLORS.success }
            ]
        },
        stockValue: {
            value: `$${(metrics.stockValue / 1000).toFixed(0)}K`,
            label: 'Stock Value',
            color: COLORS.emerald,
            percentage: 100,
            data: [
                { label: 'Value', value: metrics.stockValue, color: COLORS.emerald }
            ]
        },
        expired: {
            value: metrics.expired,
            label: 'Expired',
            color: COLORS.rose,
            percentage: metrics.expiredPercentage,
            data: [
                { label: 'Expired', value: metrics.expired, color: COLORS.rose },
                { label: 'Valid', value: metrics.total - metrics.expired, color: COLORS.success }
            ]
        }
    }), [metrics]);

    // Filtered medicines for table
    const filteredMedicines = useMemo(() => {
        let result = [...medicines];
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(m =>
                (m.name || '').toLowerCase().includes(s) ||
                (m.generic_name || '').toLowerCase().includes(s) ||
                (m.barcode || '').toLowerCase().includes(s)
            );
        }
        if (filters.category_id) {
            result = result.filter(m => m.category_id == filters.category_id || m.category?.id == filters.category_id);
        }
        if (filters.supplier_id) {
            result = result.filter(m => m.supplier_id == filters.supplier_id || m.supplier?.id == filters.supplier_id);
        }
        if (filters.status === 'critical') {
            result = result.filter(m => Number(m.quantity) === 0 || Number(m.quantity) <= Number(m.reorder_level) / 2);
        } else if (filters.status === 'low') {
            result = result.filter(m => Number(m.quantity) > 0 && Number(m.quantity) <= Number(m.reorder_level));
        } else if (filters.status === 'out') {
            result = result.filter(m => Number(m.quantity) === 0);
        }
        return result;
    }, [medicines, filters]);

    // Donut chart click handlers
    const handleDonutClick = (type) => {
        const filterMap = {
            outOfStock: 'out',
            lowStock: 'low',
            expired: 'expired',
        };
        if (filterMap[type]) {
            setFilters(prev => ({
                ...prev,
                status: prev.status === filterMap[type] ? '' : filterMap[type]
            }));
            setPage(1);
            tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const isFiltered = filters.search || filters.category_id || filters.supplier_id || filters.status;

    // ============================================================
    // RENDER
    // ============================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading inventory data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button onClick={loadData} className="btn-primary px-6 py-2">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-7 h-7 text-amber-500" />
                        Low Stock Management
                    </h1>
                    <p className="text-sm text-gray-500">Monitor inventory health with visual metrics</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={loadData} className="px-4 py-2 text-sm flex items-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className="px-4 py-2 text-sm flex items-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* ============================================================
                DONUT CHARTS METRICS
                ============================================================ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {/* Total Items */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                    <DonutChart
                        data={donutData.total.data}
                        title="Total Items"
                        value={donutData.total.value}
                        color={donutData.total.color}
                        percentage={donutData.total.percentage}
                        size={130}
                        strokeWidth={10}
                    />
                    <p className="text-xs text-gray-400 mt-2">All medicines in inventory</p>
                </div>

                {/* Out of Stock */}
                <div 
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDonutClick('outOfStock')}
                >
                    <DonutChart
                        data={donutData.outOfStock.data}
                        title="Out of Stock"
                        value={donutData.outOfStock.value}
                        color={donutData.outOfStock.color}
                        percentage={donutData.outOfStock.percentage}
                        size={130}
                        strokeWidth={10}
                        active={filters.status === 'out'}
                    />
                    <p className="text-xs text-gray-400 mt-2">{metrics.outOfStockPercentage.toFixed(1)}% of total</p>
                </div>

                {/* Low Stock */}
                <div 
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDonutClick('lowStock')}
                >
                    <DonutChart
                        data={donutData.lowStock.data}
                        title="Low Stock"
                        value={donutData.lowStock.value}
                        color={donutData.lowStock.color}
                        percentage={donutData.lowStock.percentage}
                        size={130}
                        strokeWidth={10}
                        active={filters.status === 'low'}
                    />
                    <p className="text-xs text-gray-400 mt-2">{metrics.lowStockPercentage.toFixed(1)}% of total</p>
                </div>

                {/* Stock Value */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                    <DonutChart
                        data={donutData.stockValue.data}
                        title="Stock Value"
                        value={donutData.stockValue.value}
                        color={donutData.stockValue.color}
                        percentage={donutData.stockValue.percentage}
                        size={130}
                        strokeWidth={10}
                    />
                    <p className="text-xs text-gray-400 mt-2">Total inventory value</p>
                </div>

                {/* Expired */}
                <div 
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDonutClick('expired')}
                >
                    <DonutChart
                        data={donutData.expired.data}
                        title="Expired"
                        value={donutData.expired.value}
                        color={donutData.expired.color}
                        percentage={donutData.expired.percentage}
                        size={130}
                        strokeWidth={10}
                        active={filters.status === 'expired'}
                    />
                    <p className="text-xs text-gray-400 mt-2">{metrics.expiredPercentage.toFixed(1)}% of total</p>
                </div>
            </div>

            {/* ============================================================
                FILTERS
                ============================================================ */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search medicine, generic, barcode..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                        />
                    </div>
                    <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[140px]">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="supplier_id" value={filters.supplier_id} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[140px]">
                        <option value="">All Suppliers</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[130px]">
                        <option value="">All Status</option>
                        <option value="critical">Critical</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                        <option value="expired">Expired</option>
                    </select>
                    <select name="sort" value={filters.sort} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[140px]">
                        <option value="name_asc">Name A-Z</option>
                        <option value="name_desc">Name Z-A</option>
                        <option value="quantity_asc">Stock Low-High</option>
                        <option value="quantity_desc">Stock High-Low</option>
                    </select>
                    {isFiltered && (
                        <button onClick={resetFilters} className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1">
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ============================================================
                TABLE
                ============================================================ */}
            <div ref={tableRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-sky-600 to-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Medicine</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Reorder</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Expiry</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Supplier</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center">
                                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                        <p className="text-gray-800 font-semibold">All Stocked Up!</p>
                                        <p className="text-sm text-gray-500">No medicines match your current filters.</p>
                                    </td>
                                </tr>
                            ) : filteredMedicines.map((medicine) => {
                                const status = getStockStatus(medicine);
                                return (
                                    <tr key={medicine.id} className="hover:bg-sky-50/30 transition-colors cursor-pointer" onClick={() => { setSelectedMedicine(medicine); setShowModal(true); }}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Package size={16} className="text-gray-400" />
                                                </div>
                                                <span className="font-medium text-gray-800 text-sm">{medicine.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{medicine.category?.name || '---'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-bold text-sm ${status.key === 'out' ? 'text-red-600' : status.key === 'critical' ? 'text-orange-600' : 'text-amber-600'}`}>
                                                {medicine.quantity || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-500">{medicine.reorder_level || 0}</td>
                                        <td className="px-4 py-3 text-center">{getStatusBadge(medicine)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : '---'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-500">{medicine.supplier?.name || '---'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedMedicine(medicine); setShowModal(true); }} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                {canOrder && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleOrderNow(medicine.id); }} disabled={ordering === medicine.id} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50" title="Reorder">
                                                        <ShoppingCart size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}

            {/* ============================================================
                DETAIL MODAL
                ============================================================ */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedMedicine?.name || 'Medicine Details'} size="max-w-2xl">
                {selectedMedicine && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Generic Name</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.generic_name || '---'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Status</p>
                                <div className="mt-1">{getStatusBadge(selectedMedicine)}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Current Stock</p>
                                <p className="text-sm font-bold text-gray-800">{selectedMedicine.quantity || 0}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Reorder Level</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.reorder_level || 0}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Expiry Date</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.expiry_date ? new Date(selectedMedicine.expiry_date).toLocaleDateString() : '---'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Supplier</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.supplier?.name || '---'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            {canOrder && (
                                <button onClick={() => { handleOrderNow(selectedMedicine.id); }} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                                    <ShoppingCart size={16} /> Order Now
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}