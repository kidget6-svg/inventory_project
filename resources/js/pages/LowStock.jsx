import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../axios';
import Pagination from '../components/Pagination';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
    AlertCircle, AlertTriangle, Package, ShoppingCart, RefreshCw,
    Search, Filter, Download, Zap, AlertOctagon, Clock, CheckCircle2
} from 'lucide-react';

export default function LowStock() {
    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ordering, setOrdering] = useState(null);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [realTimeEnabled, setRealTimeEnabled] = useState(true);
    const pollRef = useRef(null);

    const [filters, setFilters] = useState({
        search: '', category_id: '', supplier_id: '', status: '', sort: 'name_asc'
    });

    const loadCategories = useCallback(() => {
        api.get('/categories')
            .then(r => setCategories(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : [])))
            .catch(() => {});
    }, []);

    const loadSuppliers = useCallback(() => {
        api.get('/suppliers')
            .then(r => setSuppliers(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : [])))
            .catch(() => {});
    }, []);

    const loadData = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/low-stock', { params: { page, ...filters } })
            .then(r => {
                const data = r.data;
                const list = Array.isArray(data.medicines?.data) 
                    ? data.medicines.data 
                    : (Array.isArray(data.medicines) ? data.medicines : []);
                setMedicines(list);
                setStats(data.stats || null);
                setMeta(data.medicines?.meta || data.meta || null);
                setLastUpdated(new Date());
            })
            .catch(err => {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load low stock data');
                setRealTimeEnabled(false);
            })
            .finally(() => setLoading(false));
    }, [page, filters]);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { loadCategories(); loadSuppliers(); }, [loadCategories, loadSuppliers]);

    useEffect(() => {
        if (!realTimeEnabled) return;
        pollRef.current = setInterval(() => { loadData(); }, 30000);
        return () => clearInterval(pollRef.current);
    }, [realTimeEnabled, loadData]);

    const handleOrderNow = useCallback(async (medicineId) => {
        if (!window.confirm('Create a purchase order for this item?')) return;
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

    // Donut Chart Data Calculation
    const chartData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Out of Stock', value: stats.out_of_stock || 0, color: '#EF4444' },
            { name: 'Critical Stock', value: stats.critical || 0, color: '#F97316' },
            { name: 'Low Stock', value: stats.low || 0, color: '#EAB308' },
        ].filter(item => item.value > 0);
    }, [stats]);

    return (
        <div className="space-y-6 pb-8">
            {/* Top Bar / Actions Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-7 h-7 text-amber-500" />
                        Low Stock Overview
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Real-time tracking for items requiring replenishment
                        {lastUpdated && <span className="ml-2 font-medium text-gray-400">| Updated: {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setRealTimeEnabled(!realTimeEnabled)} 
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                            realTimeEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                    >
                        <Zap size={14} className={realTimeEnabled ? 'fill-emerald-600' : ''} />
                        {realTimeEnabled ? 'Live Syncing' : 'Sync Paused'}
                    </button>
                    <button onClick={loadData} className="p-2 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl">
                        <RefreshCw size={16} />
                    </button>
                    <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
                        <Download size={14} /> Export Report
                    </button>
                </div>
            </div>

            {/* Dashboard Analytics Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart Visualizer */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Stock Distribution Breakdown</h3>
                    <div className="h-48 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={chartData} 
                                        innerRadius={55} 
                                        outerRadius={75} 
                                        paddingAngle={4} 
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> All Stock Levels Optimal
                            </div>
                        )}
                    </div>
                </div>

                {/* Consolidated KPI Grid */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100">
                        <span className="text-xs font-medium text-sky-600">Total Flagged Items</span>
                        <p className="text-2xl font-bold text-sky-900 mt-1">{stats?.total ?? medicines.length}</p>
                    </div>
                    <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                        <span className="text-xs font-medium text-red-600">Out of Stock</span>
                        <p className="text-2xl font-bold text-red-900 mt-1">{stats?.out_of_stock ?? 0}</p>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                        <span className="text-xs font-medium text-amber-600">Critical Stock</span>
                        <p className="text-2xl font-bold text-amber-900 mt-1">{stats?.critical ?? 0}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <span className="text-xs font-medium text-emerald-600">Inventory Health</span>
                        <p className="text-2xl font-bold text-emerald-900 mt-1">{stats?.stock_health ?? 100}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                        <span className="text-xs font-medium text-gray-500">Low Stock Capital Value</span>
                        <p className="text-xl font-bold text-gray-800 mt-1">${(stats?.inventory_value ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                        <span className="text-xs font-medium text-gray-500">Estimated Days to Stockout</span>
                        <p className="text-xl font-bold text-gray-800 mt-1">{stats?.avg_days_to_stockout ?? 7} Days</p>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by name, barcode, or generic formula..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white">
                        <option value="">All Statuses</option>
                        <option value="out">Out of Stock</option>
                        <option value="critical">Critical Stock</option>
                        <option value="low">Low Stock</option>
                    </select>
                    <button onClick={resetFilters} className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl">
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Interactive Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3.5 font-semibold">Medicine Details</th>
                                <th className="px-5 py-3.5 font-semibold">Category</th>
                                <th className="px-5 py-3.5 font-semibold text-center">Available Stock</th>
                                <th className="px-5 py-3.5 font-semibold text-center">Reorder Limit</th>
                                <th className="px-5 py-3.5 font-semibold">Stock Status</th>
                                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {medicines.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                                        <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                        <p>No low stock records found matching criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                medicines.map(m => {
                                    const qty = Number(m.quantity) || 0;
                                    const reorder = Number(m.reorder_level) || 1;
                                    const percentage = Math.min(Math.round((qty / reorder) * 100), 100);

                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-gray-800">
                                                <p className="font-semibold">{m.name}</p>
                                                <p className="text-xs text-gray-400">{m.generic_name || m.barcode || '---'}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">{m.category?.name || 'Uncategorized'}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`font-bold ${qty === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {qty}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-gray-500">{reorder}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="w-32">
                                                    <div className="flex justify-between text-xs mb-1 font-medium">
                                                        <span className={qty === 0 ? 'text-red-600' : qty <= reorder / 2 ? 'text-amber-600' : 'text-yellow-600'}>
                                                            {qty === 0 ? 'Out of Stock' : qty <= reorder / 2 ? 'Critical' : 'Low'}
                                                        </span>
                                                        <span className="text-gray-400">{percentage}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${qty === 0 ? 'bg-red-500' : qty <= reorder / 2 ? 'bg-amber-500' : 'bg-yellow-500'}`} 
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    onClick={() => handleOrderNow(m.id)}
                                                    disabled={ordering === m.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
                                                >
                                                    <ShoppingCart size={13} /> Order Stock
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination meta={meta} onPageChange={setPage} />
        </div>
    );
}