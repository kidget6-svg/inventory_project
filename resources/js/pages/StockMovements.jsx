// resources/js/pages/StockMovements.jsx

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, Calendar, Package, RefreshCw, X } from 'lucide-react';

export default function StockMovements() {
    const [movements, setMovements] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        medicine_id: '',
        type: 'in',
        quantity: '',
        reference: '',
        notes: ''
    });

    const [filters, setFilters] = useState({
        medicine_id: '',
        type: '',
        start_date: '',
        end_date: ''
    });

    const loadData = () => {
        setLoading(true);
        const params = {};
        if (filters.medicine_id) params.medicine_id = filters.medicine_id;
        if (filters.type) params.type = filters.type;
        if (filters.start_date) params.start_date = filters.start_date;
        if (filters.end_date) params.end_date = filters.end_date;

        api.get('/stock-movements', { params })
            .then(r => {
                setMovements(r.data.movements?.data || r.data.movements || []);
                setMedicines(r.data.medicines || []);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load stock movements');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [filters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ medicine_id: '', type: '', start_date: '', end_date: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.post('/stock-movements', form);
            window.showToast('Stock movement recorded successfully', 'success');
            setShowForm(false);
            setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '' });
            loadData();
        } catch (err) {
            const msg = err.response?.data?.errors?.quantity?.[0] || 
                       err.response?.data?.message || 
                       'Error recording movement';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeBadge = (type) => {
        const config = {
            in: { bg: 'bg-green-100', text: 'text-green-700', icon: '📥', label: 'Stock In' },
            out: { bg: 'bg-red-100', text: 'text-red-700', icon: '📤', label: 'Stock Out' },
            adjustment: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🔄', label: 'Adjustment' },
            return: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '↩️', label: 'Return' },
            damaged: { bg: 'bg-red-100', text: 'text-red-700', icon: '❌', label: 'Damaged' },
        };
        const cfg = config[type] || config.in;
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                {cfg.icon} {cfg.label}
            </span>
        );
    };

    const getQuantityDisplay = (movement) => {
        if (movement.type === 'in' || movement.type === 'return') {
            return <span className="text-green-600 font-semibold">+{movement.quantity}</span>;
        }
        return <span className="text-red-600 font-semibold">-{movement.quantity}</span>;
    };

    const isFiltered = filters.medicine_id || filters.type || filters.start_date || filters.end_date;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stock Movements</h2>
                    <p className="text-sm text-gray-500">Track all inventory movements</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setError(''); }}
                    className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Record Movement
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine</label>
                        <select
                            name="medicine_id"
                            value={filters.medicine_id}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="">All Medicines</option>
                            {medicines.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} (Stock: {m.quantity})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="">All Types</option>
                            <option value="in">Stock In</option>
                            <option value="out">Stock Out</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="return">Return</option>
                            <option value="damaged">Damaged</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                </div>
                {isFiltered && (
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={resetFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <X size={14} /> Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-700 mb-4">Record Stock Movement</h4>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label>
                            <select
                                name="medicine_id"
                                value={form.medicine_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            >
                                <option value="">Select Medicine</option>
                                {medicines.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} (Available: {m.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            >
                                <option value="in">📥 Stock In</option>
                                <option value="out">📤 Stock Out</option>
                                <option value="adjustment">🔄 Adjustment</option>
                                <option value="return">↩️ Return</option>
                                <option value="damaged">❌ Damaged</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                                placeholder="Enter quantity"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label>
                            <input
                                type="text"
                                name="reference"
                                value={form.reference}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder="e.g. PO-001, Sale-001"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder="Additional notes"
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? 'Recording...' : 'Record Movement'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <LoadingSpinner text="Loading stock movements..." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Medicine</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">Quantity</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">Before</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">After</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Reference</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.length > 0 ? movements.map(m => (
                                    <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {m.created_at ? new Date(m.created_at).toLocaleString() : '---'}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            {m.medicine?.name || '---'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getTypeBadge(m.type)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getQuantityDisplay(m)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                                            {m.before_quantity ?? '---'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-800">
                                            {m.after_quantity ?? '---'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {m.reference || '---'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {m.notes || '---'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                                            {isFiltered ? (
                                                <>
                                                    No movements match your filters
                                                    <button onClick={resetFilters} className="ml-2 text-blue-600 hover:underline text-sm font-medium">
                                                        Clear filters
                                                    </button>
                                                </>
                                            ) : (
                                                'No stock movements recorded yet'
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Stats */}
            {movements.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Total In</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">
                            {movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Total Out</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">
                            {movements.filter(m => m.type === 'adjustment').reduce((sum, m) => sum + m.quantity, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Adjustments</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                            {movements.filter(m => m.type === 'return').reduce((sum, m) => sum + m.quantity, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Returns</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">
                            {movements.filter(m => m.type === 'damaged').reduce((sum, m) => sum + m.quantity, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Damaged</p>
                    </div>
                </div>
            )}
        </div>
    );
}