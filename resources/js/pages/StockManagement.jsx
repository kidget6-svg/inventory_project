import React, { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
    Package, AlertTriangle, TrendingDown, Calendar, History,
    Search, Filter, X, Save, Tag, Eye, Edit, Trash2,
    RefreshCw, Printer, Download, Plus, Loader2,
    CheckCircle, XCircle, Clock, AlertOctagon, Pill, ShoppingBag
} from 'lucide-react';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'current', label: 'Current Stock', icon: Package },
    { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle },
    { id: 'expiry', label: 'Expiry', icon: Calendar },
    { id: 'damaged', label: 'Damaged/Quarantine', icon: AlertOctagon },
    { id: 'movements', label: 'Stock Movements', icon: History },
];

export default function StockManagement() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [productTypeFilter, setProductTypeFilter] = useState('all'); // 'all' | 'medicine' | 'retail'
    
    const [allProducts, setAllProducts] = useState([]);
    const [medicinesList, setMedicinesList] = useState([]);
    const [retailList, setRetailList] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [expiryItems, setExpiryItems] = useState({ expired: [], expiring_soon: [] });
    const [damagedItems, setDamagedItems] = useState([]);

    const [movements, setMovements] = useState([]);
    const [movementsMeta, setMovementsMeta] = useState(null);
    const [movementsPage, setMovementsPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({ search: '', category_id: '' });
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockQty, setRestockQty] = useState('');
    const [restockNotes, setRestockNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load all data
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const summaryRes = await api.get('/stock-management/summary');
            setSummary(summaryRes.data);

            const params = {
                category_id: filters.category_id || undefined,
            };
            if (filters.search) params.search = filters.search;

            const currentRes = await api.get('/stock-management/current', { params });
            setAllProducts(currentRes.data.data || []);
            setMedicinesList(currentRes.data.medicines || []);
            setRetailList(currentRes.data.retail_products || []);

            const lowRes = await api.get('/stock-management/low-stock');
            setLowStockItems(lowRes.data.all || []);

            const expiryRes = await api.get('/stock-management/expiry');
            setExpiryItems(expiryRes.data || { expired: [], expiring_soon: [] });

            const damagedRes = await api.get('/stock-management/damaged');
            setDamagedItems(damagedRes.data.all || []);

            const catRes = await api.get('/categories', { params: { per_page: -1 } });
            let categoriesData = [];
            if (Array.isArray(catRes.data)) {
                categoriesData = catRes.data;
            } else if (catRes.data && catRes.data.data) {
                categoriesData = catRes.data.data;
            }
            setCategories(categoriesData);

            const movRes = await api.get('/stock-movements', { params: { page: movementsPage, per_page: 10 } });
            let movementsData = [];
            let metaData = null;
            if (movRes.data && movRes.data.movements && movRes.data.movements.data) {
                movementsData = movRes.data.movements.data;
                metaData = movRes.data.movements;
            } else if (movRes.data && movRes.data.data) {
                movementsData = movRes.data.data;
                metaData = movRes.data.meta || null;
            }
            setMovements(movementsData);
            setMovementsMeta(metaData);

        } catch (err) {
            console.error('Error loading stock data:', err);
            setError('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    }, [filters, movementsPage]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filterByType = (items) => {
        if (productTypeFilter === 'medicine') return items.filter(i => i.product_type === 'medicine');
        if (productTypeFilter === 'retail') return items.filter(i => i.product_type === 'retail');
        return items;
    };

    const filteredCurrentStock = filterByType(allProducts);
    const filteredLowStock = filterByType(lowStockItems);
    const filteredExpired = filterByType(expiryItems.expired || []);
    const filteredExpiringSoon = filterByType(expiryItems.expiring_soon || []);
    const filteredDamaged = filterByType(damagedItems);

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
            expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
            discontinued: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Discontinued' },
            damaged: { bg: 'bg-red-100', text: 'text-red-700', label: 'Damaged' },
            quarantined: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Quarantined' },
        };
        const cfg = config[status] || config.active;
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
    };

    const getStockStatusBadge = (item) => {
        if (item.quantity <= 0) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Out of Stock</span>;
        }
        if (item.quantity <= (item.reorder_level ?? 10)) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Low Stock</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">In Stock</span>;
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!selectedItem || !restockQty || Number(restockQty) < 1) return;
        
        setSubmitting(true);
        try {
            const payload = {
                type: 'in',
                quantity: Number(restockQty),
                reference: 'Manual restock',
                notes: restockNotes || '',
            };
            if (selectedItem.product_type === 'retail') {
                payload.retail_product_id = selectedItem.id;
            } else {
                payload.medicine_id = selectedItem.id;
            }

            await api.post('/stock-movements', payload);
            window.showToast(`Restocked ${restockQty} units of ${selectedItem.name}`, 'success');
            setShowRestockModal(false);
            setSelectedItem(null);
            setRestockQty('');
            setRestockNotes('');
            loadData();
        } catch (err) {
            window.showToast('Failed to restock item', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const renderSummaryCards = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg">
                        <Package className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{summary?.total_stock || 0}</p>
                        <p className="text-xs text-gray-500">Total Stock</p>
                    </div>
                </div>
            </div>
            <div className="card p-4 border-l-4 border-yellow-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-600">{summary?.low_stock || 0}</p>
                        <p className="text-xs text-gray-500">Low Stock</p>
                    </div>
                </div>
            </div>
            <div className="card p-4 border-l-4 border-orange-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-600">{summary?.expiring_soon || 0}</p>
                        <p className="text-xs text-gray-500">Expiring Soon</p>
                    </div>
                </div>
            </div>
            <div className="card p-4 border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertOctagon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-600">{summary?.expired || 0}</p>
                        <p className="text-xs text-gray-500">Expired</p>
                    </div>
                </div>
            </div>
            <div className="card p-4 border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertOctagon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-600">{summary?.damaged || 0}</p>
                        <p className="text-xs text-gray-500">Damaged</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabs = () => (
        <div className="border-b border-gray-200 mb-5">
            <nav className="flex overflow-x-auto gap-1">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-sky-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );

    const renderProductTypeToggle = () => (
        <div className="flex gap-2 mb-4">
            <button
                onClick={() => setProductTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    productTypeFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                All Products ({allProducts.length})
            </button>
            <button
                onClick={() => setProductTypeFilter('medicine')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    productTypeFilter === 'medicine' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <Pill size={14} /> Medicines ({medicinesList.length})
            </button>
            <button
                onClick={() => setProductTypeFilter('retail')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    productTypeFilter === 'retail' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <ShoppingBag size={14} /> Retail & OTC ({retailList.length})
            </button>
        </div>
    );

    const renderFilters = () => (
        <div className="mb-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search medicines or retail & OTC products..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <select
                        name="category_id"
                        value={filters.category_id}
                        onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none bg-white"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                {(filters.search || filters.category_id) && (
                    <button
                        onClick={() => setFilters({ search: '', category_id: '' })}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );

    const renderItemTable = (data, showExpiry = true) => (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-sky-50 border-b border-sky-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Product Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Batch / SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Status</th>
                            {showExpiry && <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Expiry Date</th>}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Stock Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map(item => (
                            <tr key={`${item.product_type}-${item.id}`} className="border-b border-gray-50 hover:bg-sky-50/30">
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        item.product_type === 'retail' ? 'bg-yellow-100 text-yellow-800' : 'bg-sky-100 text-sky-700'
                                    }`}>
                                        {item.product_type === 'retail' ? <ShoppingBag size={12} /> : <Pill size={12} />}
                                        {item.product_type === 'retail' ? 'Retail / OTC' : 'Medicine'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {item.category?.name || item.category || 'No Category'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {item.product_type === 'retail' ? (item.sku || '---') : (item.batch_number || '---')}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold">{item.quantity}</td>
                                <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                                {showExpiry && (
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '---'}
                                    </td>
                                )}
                                <td className="px-4 py-3">{getStockStatusBadge(item)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => { setSelectedItem(item); setShowViewModal(true); }}
                                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                            title="View"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedItem(item); setShowRestockModal(true); }}
                                            className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold hover:bg-sky-600"
                                        >
                                            Restock
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={showExpiry ? 9 : 8} className="px-4 py-8 text-center text-gray-400">
                                    No products found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMovementsTable = () => (
        <div className="space-y-6">
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-sky-50 border-b border-sky-100">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.length > 0 ? movements.map(m => (
                                <tr key={m.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(m.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">
                                        {m.medicine?.name || m.itemable?.name || 'Unknown Product'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            m.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {m.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold">{m.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{m.reference || '---'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{m.notes || '---'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                        No stock movements found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination meta={movementsMeta} onPageChange={(p) => setMovementsPage(p)} />
        </div>
    );

    if (loading && allProducts.length === 0) {
        return <LoadingSpinner text="Loading stock data..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage inventory across medicines and retail / OTC products
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadData} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50" title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            {summary && renderSummaryCards()}

            {/* Tabs */}
            {renderTabs()}

            {/* Filters & Product Type Toggle */}
            {activeTab !== 'overview' && activeTab !== 'movements' && (
                <>
                    {renderProductTypeToggle()}
                    {renderFilters()}
                </>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Low Stock Alert</h3>
                            <div className="space-y-2">
                                {lowStockItems.slice(0, 5).map(item => (
                                    <div key={`${item.product_type}-${item.id}`} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div>
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} / Reorder: {item.reorder_level ?? 10}</p>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedItem(item); setShowRestockModal(true); }}
                                            className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold hover:bg-sky-600"
                                        >
                                            Restock
                                        </button>
                                    </div>
                                ))}
                                {lowStockItems.length === 0 && (
                                    <p className="text-sm text-gray-400">All products are well-stocked!</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Expiring Soon (90 days)</h3>
                            <div className="space-y-2">
                                {(expiryItems.expiring_soon || []).slice(0, 5).map(item => {
                                    const daysLeft = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div key={`${item.product_type}-${item.id}`} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Expires: {new Date(item.expiry_date).toLocaleDateString()} ({daysLeft} days left)
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                daysLeft <= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {daysLeft <= 30 ? 'Urgent' : 'Soon'}
                                            </span>
                                        </div>
                                    );
                                })}
                                {(expiryItems.expiring_soon || []).length === 0 && (
                                    <p className="text-sm text-gray-400">No products expiring soon.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'current' && renderItemTable(filteredCurrentStock)}
            {activeTab === 'low-stock' && renderItemTable(filteredLowStock)}
            {activeTab === 'expiry' && renderItemTable([...filteredExpired, ...filteredExpiringSoon])}
            {activeTab === 'damaged' && renderItemTable(filteredDamaged)}
            {activeTab === 'movements' && renderMovementsTable()}

            {/* View Modal */}
            <Modal
                open={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Product Details"
                size="max-w-lg"
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-sky-100 flex items-center justify-center">
                                {selectedItem.product_type === 'retail' ? <ShoppingBag className="w-8 h-8 text-sky-600" /> : <Package className="w-8 h-8 text-sky-600" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{selectedItem.name}</h3>
                                <p className="text-sm text-gray-500">{selectedItem.generic_name || selectedItem.sku || 'No SKU / Generic'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Type</label>
                                <p className="text-sm text-gray-800 capitalize">{selectedItem.product_type === 'retail' ? 'Retail / OTC' : 'Medicine'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Category</label>
                                <p className="text-sm text-gray-800">{selectedItem.category?.name || selectedItem.category || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Batch / SKU</label>
                                <p className="text-sm text-gray-800">{selectedItem.batch_number || selectedItem.sku || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Quantity</label>
                                <p className="text-sm font-bold text-gray-800">{selectedItem.quantity}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Reorder Level</label>
                                <p className="text-sm text-gray-800">{selectedItem.reorder_level ?? 10}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Expiry Date</label>
                                <p className="text-sm text-gray-800">
                                    {selectedItem.expiry_date ? new Date(selectedItem.expiry_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Status</label>
                                <div>{getStatusBadge(selectedItem.status)}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-gray-500">Shelf Location</label>
                                <p className="text-sm text-gray-800">{selectedItem.shelf_location || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="btn-secondary px-4 py-2 text-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { setShowViewModal(false); setShowRestockModal(true); }}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <Package size={16} /> Restock
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Restock Modal */}
            <Modal
                open={showRestockModal}
                onClose={() => { setShowRestockModal(false); setSelectedItem(null); }}
                title="Restock Product"
                size="max-w-md"
            >
                {selectedItem && (
                    <form onSubmit={handleRestock} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Product</label>
                            <p className="text-sm font-medium text-gray-800">{selectedItem.name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Current Stock</label>
                            <p className="text-sm text-gray-600">{selectedItem.quantity} units</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity to Add *</label>
                            <input
                                type="number"
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                                placeholder="Enter quantity"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (Optional)</label>
                            <input
                                type="text"
                                value={restockNotes}
                                onChange={(e) => setRestockNotes(e.target.value)}
                                placeholder="e.g., New shipment from supplier"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setShowRestockModal(false); setSelectedItem(null); }}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Restocking...</>
                                ) : (
                                    <><Save size={16} /> Confirm Restock</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
