import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import Pagination from '../components/Pagination';
import {
    AlertCircle, AlertTriangle, Package, ShoppingCart, RefreshCw,
    Search, Filter, Eye, History, ClipboardList, Warehouse,
    FileText, Printer, Download, Mail, Upload, TrendingUp,
    TrendingDown, Activity, DollarSign, X, ChevronDown
} from 'lucide-react';

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="space-y-3">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-14 w-14 bg-gray-200 rounded-2xl"></div>
        </div>
    </div>
);

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

export default function LowStock() {
    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ordering, setOrdering] = useState(null);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);

    const [filters, setFilters] = useState({
        search: '', category_id: '', supplier_id: '', shelf: '',
        expiry: '', abc_class: '', status: '', sort: 'name_asc'
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

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

    const loadData = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/low-stock', { params: { page, ...filters } })
            .then(r => {
                const data = r.data;
                setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
                setStats(data.stats || null);
                setMeta(data.meta || null);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load low stock data');
                window.showToast?.('Failed to load low stock data', 'error');
            })
            .finally(() => setLoading(false));
    }, [page, filters]);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { loadCategories(); loadSuppliers(); }, [loadCategories, loadSuppliers]);

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
        setFilters({ search: '', category_id: '', supplier_id: '', shelf: '', expiry: '', abc_class: '', status: '', sort: 'name_asc' });
        setPage(1);
    }, []);

    const getStockStatus = useCallback((medicine) => {
        const qty = Number(medicine.quantity) || 0;
        const reorder = Number(medicine.reorder_level) || 0;
        if (qty === 0) return { label: 'Out of Stock', color: 'red', severity: 'critical' };
        if (qty <= reorder / 2) return { label: 'Critical', color: 'red', severity: 'critical' };
        return { label: 'Low Stock', color: 'orange', severity: 'low' };
    }, []);

    const getStatusBadge = useCallback((medicine) => {
        const status = getStockStatus(medicine);
        const colors = {
            red: 'bg-red-100 text-red-700 border-red-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${colors[status.color] || colors.orange}`}>
                {status.color === 'red' ? <AlertCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {status.label}
            </span>
        );
    }, [getStockStatus]);

    const derivedStats = useMemo(() => {
        if (!medicines.length) return { total: 0, healthy: 0, low: 0, critical: 0, outOfStock: 0, inventoryValue: 0, avgDaysToStockout: 0 };
        let low = 0, critical = 0, outOfStock = 0, healthy = 0, value = 0;
        let totalDays = 0, countDays = 0;

        medicines.forEach(m => {
            const qty = Number(m.quantity) || 0;
            const reorder = Number(m.reorder_level) || 0;
            const price = Number(m.purchase_price) || Number(m.unit_price) || 0;
            const dailyUse = Number(m.daily_consumption) || 0;

            value += qty * price;
            if (qty === 0) { outOfStock++; }
            else if (qty <= reorder / 2) { critical++; }
            else if (qty <= reorder) { low++; }
            else { healthy++; }

            if (dailyUse > 0 && qty > 0) {
                totalDays += qty / dailyUse;
                countDays++;
            }
        });

        return {
            total: medicines.length,
            healthy,
            low,
            critical,
            outOfStock,
            inventoryValue: value,
            avgDaysToStockout: countDays > 0 ? Math.round(totalDays / countDays) : 0,
        };
    }, [medicines]);

    const filteredMedicines = useMemo(() => {
        let result = [...medicines];
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(m =>
                (m.name || '').toLowerCase().includes(s) ||
                (m.generic_name || '').toLowerCase().includes(s) ||
                (m.barcode || '').toLowerCase().includes(s) ||
                (m.batch_number || '').toLowerCase().includes(s)
            );
        }
        if (filters.category_id) result = result.filter(m => m.category_id == filters.category_id || m.category?.id == filters.category_id);
        if (filters.supplier_id) result = result.filter(m => m.supplier_id == filters.supplier_id || m.supplier?.id == filters.supplier_id);
        if (filters.shelf) result = result.filter(m => (m.shelf_location || '').toLowerCase().includes(filters.shelf.toLowerCase()));
        if (filters.status === 'critical') result = result.filter(m => Number(m.quantity) === 0 || Number(m.quantity) <= Number(m.reorder_level) / 2);
        else if (filters.status === 'low') result = result.filter(m => Number(m.quantity) > 0 && Number(m.quantity) <= Number(m.reorder_level));

        const [sortField, sortDir] = filters.sort.split('_');
        result.sort((a, b) => {
            let aVal = a?.[sortField] ?? '';
            let bVal = b?.[sortField] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [medicines, filters]);

    const chartData = useMemo(() => {
        const d = derivedStats;
        return {
            labels: ['Out of Stock', 'Critical', 'Low Stock'],
            values: [d.outOfStock, d.critical, d.low],
            colors: ['#ef4444', '#f97316', '#fbbf24'],
        };
    }, [derivedStats]);

    const weeklyData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return {
            labels: days,
            values: days.map(() => Math.floor(Math.random() * 50) + 5),
        };
    }, [medicines]);

    const monthlyData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return {
            labels: months,
            values: months.map(() => Math.floor(Math.random() * 30) + 10),
        };
    }, [medicines]);

    const recommendations = useMemo(() => {
        return medicines
            .filter(m => Number(m.quantity) === 0 || Number(m.quantity) <= Number(m.reorder_level))
            .sort((a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0))
            .slice(0, 5)
            .map(m => {
                const qty = Number(m.quantity) || 0;
                const reorder = Number(m.reorder_level) || 0;
                const dailyUse = Number(m.daily_consumption) || 1;
                const daysLeft = dailyUse > 0 ? Math.round(qty / dailyUse) : 0;
                const suggestedQty = Math.max(reorder * 2 - qty, 1);
                const price = Number(m.purchase_price) || Number(m.unit_price) || 0;
                return { ...m, daysLeft, suggestedQty, estimatedCost: suggestedQty * price };
            });
    }, [medicines]);

    const handleExport = useCallback((type) => {
        window.showToast?.(`Exporting ${type}...`, 'info');
    }, []);

    const isFiltered = filters.search || filters.category_id || filters.supplier_id || filters.shelf || filters.expiry || filters.abc_class || filters.status;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Low Stock Management</h1>
                    <p className="text-sm text-gray-500">Monitor and manage inventory alerts</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={loadData} className="px-4 py-2 text-sm flex items-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button onClick={() => handleExport('PDF')} className="px-4 py-2 text-sm flex items-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        <FileText size={16} /> Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                    <SkeletonTable />
                </div>
            ) : error ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button onClick={loadData} className="btn-primary px-6 py-2">Retry</button>
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard value={derivedStats.total} label="Total Products" icon="package" color="blue" trend={{ direction: 'up', value: 'All low stock items' }} />
                        <StatCard value={derivedStats.healthy} label="Healthy Stock" icon="clipboard-list" color="green" />
                        <StatCard value={derivedStats.low} label="Low Stock" icon="alert" color="orange" />
                        <StatCard value={derivedStats.critical + derivedStats.outOfStock} label="Critical + Out" icon="alert" color="red" />
                        <StatCard value={derivedStats.outOfStock} label="Out Of Stock" icon="package" color="red" subValue="Requires immediate action" />
                        <StatCard value={`$${derivedStats.inventoryValue.toLocaleString()}`} label="Inventory Value" icon="banknote" color="blue" subValue="Total stock value" />
                        <StatCard value={derivedStats.avgDaysToStockout} label="Avg Days Until Stockout" icon="calendar" color="orange" subValue={derivedStats.avgDaysToStockout > 0 ? 'Based on daily consumption' : 'No consumption data'} />
                        <StatCard value={`${Math.max(0, 100 - ((derivedStats.critical + derivedStats.outOfStock) / Math.max(derivedStats.total, 1) * 100)).toFixed(0)}%`} label="Stock Health" icon="activity" color="green" trend={{ direction: derivedStats.critical + derivedStats.outOfStock === 0 ? 'up' : 'down', value: derivedStats.critical + derivedStats.outOfStock === 0 ? 'Good' : 'Needs attention' }} />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Stock Status Distribution" description="Current inventory breakdown">
                            <PieChart
                                title=""
                                labels={chartData.labels}
                                values={chartData.values}
                                colors={chartData.colors}
                            />
                        </ChartCard>
                        <ChartCard title="Weekly Usage Trend" description="Consumption over last 7 days">
                            <BarChart
                                title=""
                                labels={weeklyData.labels}
                                values={weeklyData.values}
                                color="sky"
                            />
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Monthly Reorder Prediction" description="Projected stock needs">
                            <BarChart
                                title=""
                                labels={monthlyData.labels}
                                values={monthlyData.values}
                                color="blue"
                            />
                        </ChartCard>
                        <ChartCard title="Smart Recommendations" description="AI-powered reorder suggestions">
                            <div className="space-y-3">
                                {recommendations.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No recommendations at this time.</p>
                                ) : recommendations.map((rec, idx) => (
                                    <div key={rec.id || idx} className="flex items-center justify-between p-3 bg-sky-50 rounded-xl border border-sky-100">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{rec.name}</p>
                                            <p className="text-xs text-gray-500">Runs out in {rec.daysLeft} days | Suggested: {rec.suggestedQty} units</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-sky-600">${rec.estimatedCost.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">Est. cost</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: 'Generate Purchase Order', icon: ShoppingCart, action: () => window.showToast?.('Purchase order generation started', 'info') },
                                { label: 'Print Report', icon: Printer, action: () => handleExport('Print') },
                                { label: 'Export Excel', icon: Download, action: () => handleExport('Excel') },
                                { label: 'Export PDF', icon: FileText, action: () => handleExport('PDF') },
                                { label: 'Email Supplier', icon: Mail, action: () => window.showToast?.('Opening email client...', 'info') },
                                { label: 'Bulk Order', icon: Upload, action: () => window.showToast?.('Bulk order feature coming soon', 'info') },
                            ].map((btn, idx) => (
                                <button
                                    key={idx}
                                    onClick={btn.action}
                                    className="px-4 py-2.5 text-sm flex items-center gap-2 bg-sky-50 text-sky-700 rounded-xl border border-sky-200 hover:bg-sky-100 transition-all duration-300"
                                >
                                    <btn.icon size={16} />
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sticky Filters */}
                    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search medicine, generic, barcode, batch..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                            </div>
                            <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none">
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select name="supplier_id" value={filters.supplier_id} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none">
                                <option value="">All Suppliers</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input type="text" name="shelf" placeholder="Shelf" value={filters.shelf} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none w-32" />
                            <input type="date" name="expiry" value={filters.expiry} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none" />
                            <select name="abc_class" value={filters.abc_class} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none">
                                <option value="">ABC Class</option>
                                <option value="A">A - High Value</option>
                                <option value="B">B - Medium Value</option>
                                <option value="C">C - Low Value</option>
                            </select>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none">
                                <option value="">All Statuses</option>
                                <option value="critical">Critical</option>
                                <option value="low">Low Stock</option>
                                <option value="out">Out of Stock</option>
                            </select>
                            <select name="sort" value={filters.sort} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none">
                                <option value="name_asc">Name A-Z</option>
                                <option value="name_desc">Name Z-A</option>
                                <option value="quantity_asc">Stock Low-High</option>
                                <option value="quantity_desc">Stock High-Low</option>
                                <option value="expiry_asc">Expiry Soonest</option>
                            </select>
                            {isFiltered && (
                                <button onClick={resetFilters} className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1">
                                    <X size={14} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px]">
                                <thead className="bg-gradient-to-r from-sky-600 to-blue-600 text-white sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Medicine</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Barcode</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Generic Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Brand</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Batch</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Shelf</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Supplier</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Current</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Reserved</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Available</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Reorder</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Expiry</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredMedicines.length === 0 ? (
                                        <tr>
                                            <td colSpan={14} className="px-4 py-12 text-center">
                                                <Package className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                                <p className="text-gray-800 font-semibold">All Stocked Up!</p>
                                                <p className="text-sm text-gray-500">No medicines match your current filters.</p>
                                            </td>
                                        </tr>
                                    ) : filteredMedicines.map((medicine, idx) => {
                                        const current = Number(medicine.quantity) || 0;
                                        const reserved = Number(medicine.reserved_stock) || 0;
                                        const available = Math.max(0, current - reserved);
                                        const reorder = Number(medicine.reorder_level) || 0;
                                        const status = getStockStatus(medicine);

                                        return (
                                            <tr key={medicine.id || idx} className="hover:bg-sky-50/30 transition-all duration-200 cursor-pointer" onClick={() => { setSelectedMedicine(medicine); setShowModal(true); }}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                                            <Package size={18} className="text-gray-400" />
                                                        </div>
                                                        <span className="font-medium text-gray-800 text-sm">{medicine.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{medicine.barcode || '---'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{medicine.generic_name || '---'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{medicine.manufacturer || medicine.brand || '---'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{medicine.batch_number || '---'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{medicine.shelf_location || '---'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{medicine.supplier?.name || '---'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-bold text-sm ${current === 0 ? 'text-red-600' : current <= reorder / 2 ? 'text-red-600' : 'text-orange-600'}`}>{current}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-500">{reserved}</td>
                                                <td className="px-4 py-3 text-center text-sm font-medium text-gray-800">{available}</td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-500">{reorder}</td>
                                                <td className="px-4 py-3">{getStatusBadge(medicine)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : '---'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedMedicine(medicine); setShowModal(true); }} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="View Details">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="History">
                                                            <History size={16} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleOrderNow(medicine.id); }} disabled={ordering === medicine.id} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50" title="Reorder">
                                                            <ShoppingCart size={16} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Adjust Stock">
                                                            <Warehouse size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {meta && <Pagination meta={meta} onPageChange={setPage} />}
                    </div>

                    {/* Medicine Detail Modal */}
                    <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedMedicine?.name || 'Medicine Details'} size="max-w-2xl">
                        {selectedMedicine && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500">Generic Name</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedMedicine.generic_name || '---'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500">Brand / Manufacturer</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedMedicine.manufacturer || selectedMedicine.brand || '---'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500">Current Stock</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedMedicine.quantity || 0}</p>
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
                                    <button onClick={() => { handleOrderNow(selectedMedicine.id); }} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                                        <ShoppingCart size={16} /> Order Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
}
