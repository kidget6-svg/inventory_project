import React, { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
    Package, AlertTriangle, TrendingDown, Calendar, History,
    Search, Filter, X, Save, Tag, Eye, Edit, Trash2,
    RefreshCw, Printer, Download, Plus, Loader2,
    CheckCircle, XCircle, Clock, AlertOctagon
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
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [movements, setMovements] = useState([]);
    const [movementsMeta, setMovementsMeta] = useState(null);
    const [movementsPage, setMovementsPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({ search: '', category_id: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
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
            // Load summary stats
            const summaryRes = await api.get('/stock-management/summary');
            setSummary(summaryRes.data);

            // Load medicines with filters
            const params = {
                category_id: filters.category_id || undefined,
                per_page: 1000
            };
            if (filters.search) params.search = filters.search;

            const medicinesRes = await api.get('/medicines', { params });
            let medicinesData = [];
            if (Array.isArray(medicinesRes.data)) {
                medicinesData = medicinesRes.data;
            } else if (medicinesRes.data && medicinesRes.data.data) {
                medicinesData = medicinesRes.data.data;
            }
            setMedicines(medicinesData);
            setFilteredMedicines(medicinesData);

            // Load categories
            const catRes = await api.get('/categories', { params: { per_page: -1 } });
            let categoriesData = [];
            if (Array.isArray(catRes.data)) {
                categoriesData = catRes.data;
            } else if (catRes.data && catRes.data.data) {
                categoriesData = catRes.data.data;
            }
            setCategories(categoriesData);

            // Load movements
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

    // Filter medicines based on search
    useEffect(() => {
        if (!filters.search) {
            setFilteredMedicines(medicines);
            return;
        }
        const search = filters.search.toLowerCase();
        const filtered = medicines.filter(m => 
            m.name?.toLowerCase().includes(search) ||
            m.generic_name?.toLowerCase().includes(search) ||
            m.barcode?.includes(search)
        );
        setFilteredMedicines(filtered);
    }, [filters.search, medicines]);

    // Derived data for tabs
    const today = new Date();
    const lowStockMedicines = medicines.filter(m => 
        m.quantity <= m.reorder_level && m.quantity > 0
    );
    const outOfStockMedicines = medicines.filter(m => m.quantity === 0);
    const expiredMedicines = medicines.filter(m => 
        m.expiry_date && new Date(m.expiry_date) < today
    );
    const expiringSoonMedicines = medicines.filter(m => {
        if (!m.expiry_date) return false;
        const expDate = new Date(m.expiry_date);
        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
    });
    const damagedMedicines = medicines.filter(m => m.status === 'damaged' || m.status === 'quarantined');

    const getTabData = () => {
        switch (activeTab) {
            case 'current': return filteredMedicines;
            case 'low-stock': return lowStockMedicines;
            case 'expiry': return [...expiredMedicines, ...expiringSoonMedicines];
            case 'damaged': return damagedMedicines;
            default: return [];
        }
    };

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

    const getStockStatusBadge = (medicine) => {
        if (medicine.quantity <= 0) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Out of Stock</span>;
        }
        if (medicine.quantity <= medicine.reorder_level) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Low Stock</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">In Stock</span>;
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!selectedMedicine || !restockQty || Number(restockQty) < 1) return;
        
        setSubmitting(true);
        try {
            await api.post('/stock-movements', {
                medicine_id: selectedMedicine.id,
                type: 'in',
                quantity: Number(restockQty),
                reference: 'Manual restock',
                notes: restockNotes || '',
            });
            window.showToast(`Restocked ${restockQty} units of ${selectedMedicine.name}`, 'success');
            setShowRestockModal(false);
            setSelectedMedicine(null);
            setRestockQty('');
            setRestockNotes('');
            loadData();
        } catch (err) {
            window.showToast('Failed to restock medicine', 'error');
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
            <div className="card p-4 border-l-4 text-orange-500">
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

    const renderFilters = () => (
        <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search medicines..."
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
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none"
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

    const renderMedicineTable = (data, showExpiry = true) => (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-sky-50 border-b border-sky-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Batch</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Status</th>
                            {showExpiry && <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Expiry Date</th>}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Stock Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{m.category?.name || 'No Category'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{m.batch_number || '---'}</td>
                                <td className="px-4 py-3 text-sm font-semibold">{m.quantity}</td>
                                <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
                                {showExpiry && (
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '---'}
                                    </td>
                                )}
                                <td className="px-4 py-3">{getStockStatusBadge(m)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => { setSelectedMedicine(m); setShowViewModal(true); }}
                                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                            title="View"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedMedicine(m); setShowRestockModal(true); }}
                                            className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold hover:bg-sky-600"
                                        >
                                            Restock
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={showExpiry ? 8 : 7} className="px-4 py-8 text-center text-gray-400">
                                    No medicines found
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Medicine</th>
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
                                    <td className="px-4 py-3 text-sm font-medium">{m.medicine?.name || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            m.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {m.type === 'in' ? 'Stock In' : 'Stock Out'}
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

    if (loading && medicines.length === 0) {
        return <LoadingSpinner text="Loading stock data..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all inventory across the system
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadData} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50" title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                    <button className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 flex items-center gap-2">
                        <Download size={16} /> Export
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

            {/* Filters */}
            {(activeTab === 'current' || activeTab === 'low-stock') && renderFilters()}

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Low Stock Alert</h3>
                            <div className="space-y-2">
                                {lowStockMedicines.slice(0, 5).map(m => (
                                    <div key={m.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div>
                                            <p className="text-sm font-medium">{m.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {m.quantity} / Reorder: {m.reorder_level}</p>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedMedicine(m); setShowRestockModal(true); }}
                                            className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold hover:bg-sky-600"
                                        >
                                            Restock
                                        </button>
                                    </div>
                                ))}
                                {lowStockMedicines.length === 0 && (
                                    <p className="text-sm text-gray-400">All medicines are well-stocked!</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Expiring Soon (90 days)</h3>
                            <div className="space-y-2">
                                {expiringSoonMedicines.slice(0, 5).map(m => {
                                    const daysLeft = Math.ceil((new Date(m.expiry_date) - today) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                            <div>
                                                <p className="text-sm font-medium">{m.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Expires: {new Date(m.expiry_date).toLocaleDateString()} ({daysLeft} days left)
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
                                {expiringSoonMedicines.length === 0 && (
                                    <p className="text-sm text-gray-400">No medicines expiring soon.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'current' && renderMedicineTable(filteredMedicines)}
            {activeTab === 'low-stock' && renderMedicineTable(lowStockMedicines)}
            {activeTab === 'expiry' && renderMedicineTable([...expiredMedicines, ...expiringSoonMedicines])}
            {activeTab === 'damaged' && renderMedicineTable(damagedMedicines)}
            {activeTab === 'movements' && renderMovementsTable()}

            {/* View Modal */}
            <Modal
                open={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Medicine Details"
                size="max-w-lg"
            >
                {selectedMedicine && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-sky-100 flex items-center justify-center">
                                <Package className="w-8 h-8 text-sky-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{selectedMedicine.name}</h3>
                                <p className="text-sm text-gray-500">{selectedMedicine.generic_name || 'No generic name'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Category</label>
                                <p className="text-sm text-gray-800">{selectedMedicine.category?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Batch</label>
                                <p className="text-sm text-gray-800">{selectedMedicine.batch_number || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Quantity</label>
                                <p className="text-sm font-bold text-gray-800">{selectedMedicine.quantity}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Reorder Level</label>
                                <p className="text-sm text-gray-800">{selectedMedicine.reorder_level}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Expiry Date</label>
                                <p className="text-sm text-gray-800">
                                    {selectedMedicine.expiry_date ? new Date(selectedMedicine.expiry_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Status</label>
                                <div>{getStatusBadge(selectedMedicine.status)}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-gray-500">Shelf Location</label>
                                <p className="text-sm text-gray-800">{selectedMedicine.shelf_location || 'N/A'}</p>
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
                onClose={() => { setShowRestockModal(false); setSelectedMedicine(null); }}
                title="Restock Medicine"
                size="max-w-md"
            >
                {selectedMedicine && (
                    <form onSubmit={handleRestock} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Medicine</label>
                            <p className="text-sm font-medium text-gray-800">{selectedMedicine.name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Current Stock</label>
                            <p className="text-sm text-gray-600">{selectedMedicine.quantity} units</p>
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
                                onClick={() => { setShowRestockModal(false); setSelectedMedicine(null); }}
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