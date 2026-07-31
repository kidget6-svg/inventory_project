import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, AlertTriangle, TrendingDown, Calendar, History, RefreshCw, Search, Filter, X, Save, Tag } from 'lucide-react';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'all', label: 'All Medicines', icon: Package },
    { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle },
    { id: 'out-of-stock', label: 'Out of Stock', icon: TrendingDown },
    { id: 'expired', label: 'Expired', icon: Calendar },
    { id: 'expiring', label: 'Expiring Soon', icon: Calendar },
    { id: 'movements', label: 'Stock Movements', icon: History },
];

export default function Inventory() {
    const [medicines, setMedicines] = useState([]);
    const [movements, setMovements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState({ search: '', category_id: '' });
    const [restockMedicine, setRestockMedicine] = useState(null);
    const [restockQty, setRestockQty] = useState('');
    const [restockNotes, setRestockNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadMedicines = () => {
        api.get('/medicines', { params: { category_id: filters.category_id || undefined } })
            .then(r => setMedicines(r.data))
            .catch(err => console.error(err));
    };

    const loadMovements = () => {
        api.get('/stock-movements')
            .then(r => setMovements(r.data.movements || []))
            .catch(err => console.error(err));
    };

    const loadCategories = () => {
        api.get('/categories')
            .then(r => setCategories(r.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/medicines', { params: { category_id: filters.category_id || undefined } })
                .then(r => setMedicines(r.data))
                .catch(err => console.error(err)),
            api.get('/stock-movements')
                .then(r => setMovements(r.data.movements || []))
                .catch(err => console.error(err)),
            api.get('/categories')
                .then(r => setCategories(r.data))
                .catch(err => console.error(err)),
        ]).finally(() => setLoading(false));
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => setFilters({ search: '', category_id: '' });

    // Derived data
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const lowStockMedicines = medicines.filter(m => m.quantity <= m.reorder_level && m.quantity > 0);
    const outOfStockMedicines = medicines.filter(m => m.quantity === 0);
    const expiredMedicines = medicines.filter(m => m.expiry_date && new Date(m.expiry_date) < today);
    const expiringSoonMedicines = medicines.filter(m => {
        if (!m.expiry_date) return false;
        const expDate = new Date(m.expiry_date);
        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
    });

    const totalStockValue = medicines.reduce((sum, m) => sum + (Number(m.purchase_price || m.unit_price || 0) * m.quantity), 0);

    // Filter medicines based on search
    const filteredMedicines = medicines.filter(m => {
        const searchMatch = !filters.search ||
            m.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            m.generic_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            m.batch_number?.toLowerCase().includes(filters.search.toLowerCase());
        return searchMatch;
    });

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!restockMedicine || !restockQty || Number(restockQty) < 1) return;
        setSubmitting(true);
        try {
            await api.post('/stock-movements', {
                medicine_id: restockMedicine.id,
                type: 'in',
                quantity: Number(restockQty),
                reference: 'Manual restock',
                notes: restockNotes || '',
            });
            window.showToast(`Restocked ${restockQty} units of ${restockMedicine.name}`, 'success');
            setRestockMedicine(null);
            setRestockQty('');
            setRestockNotes('');
            loadMedicines();
            loadMovements();
        } catch (err) {
            window.showToast('Failed to restock medicine', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Active' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
            expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
            discontinued: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Discontinued' },
        };
        const cfg = config[status] || config.active;
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
            </span>
        );
    };

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
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Reorder Level</th>
                            {showExpiry && <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Expiry Date</th>}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Status</th>
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
                                <td className="px-4 py-3 text-sm text-gray-500">{m.reorder_level}</td>
                                {showExpiry && (
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '---'}
                                    </td>
                                )}
                                <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => { setRestockMedicine(m); setRestockQty(''); setRestockNotes(''); }}
                                        className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold hover:bg-sky-600"
                                    >
                                        Restock
                                    </button>
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

    if (loading) return <LoadingSpinner text="Loading inventory..." />;

    return (
        <>
            {/* Filters */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search medicines..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                        <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select
                            name="category_id"
                            value={filters.category_id}
                            onChange={handleFilterChange}
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
                            onClick={resetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
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

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <Package className="w-6 h-6 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{medicines.length}</p>
                                    <p className="text-xs text-gray-500">Total Medicines</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <TrendingDown className="w-6 h-6 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{medicines.reduce((sum, m) => sum + m.quantity, 0)}</p>
                                    <p className="text-xs text-gray-500">Total Stock Units</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{lowStockMedicines.length}</p>
                                    <p className="text-xs text-gray-500">Low Stock</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Calendar className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{expiredMedicines.length}</p>
                                    <p className="text-xs text-gray-500">Expired</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Value */}
                    <div className="card p-5">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Stock Value</h3>
                        <p className="text-2xl font-bold text-gray-800">${totalStockValue.toFixed(2)}</p>
                    </div>

                    {/* Quick Views */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Low Stock Alert</h3>
                            <div className="space-y-2">
                                {lowStockMedicines.slice(0, 5).map(m => (
                                    <div key={m.id} className="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">{m.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {m.quantity} / Reorder: {m.reorder_level}</p>
                                        </div>
                                        <button
                                            onClick={() => { setRestockMedicine(m); setRestockQty(''); setRestockNotes(''); setActiveTab('all'); }}
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
                                        <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">{m.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Expires: {new Date(m.expiry_date).toLocaleDateString()} ({daysLeft} days left)
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                daysLeft <= 30 ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
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

            {activeTab === 'all' && renderMedicineTable(filteredMedicines)}

            {activeTab === 'low-stock' && renderMedicineTable(lowStockMedicines)}

            {activeTab === 'out-of-stock' && renderMedicineTable(outOfStockMedicines)}

            {activeTab === 'expired' && renderMedicineTable(expiredMedicines)}

            {activeTab === 'expiring' && renderMedicineTable(expiringSoonMedicines)}

            {activeTab === 'movements' && (
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
                                                m.type === 'in' ? 'bg-sky-100 text-sky-700' : 'bg-sky-100 text-sky-700'
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
            )}

            {/* Restock Modal */}
            {restockMedicine && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-700">Restock Medicine</h3>
                            <button
                                onClick={() => setRestockMedicine(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleRestock} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine</label>
                                <p className="text-sm font-medium text-gray-800">{restockMedicine.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Current Quantity</label>
                                <p className="text-sm text-gray-500">{restockMedicine.quantity}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Restock Quantity *</label>
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
                                    placeholder="e.g. New shipment from supplier"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRestockMedicine(null)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Restocking...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Confirm Restock
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
