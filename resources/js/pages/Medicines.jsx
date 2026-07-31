import React, { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarLayout from '../components/SidebarLayout';
import { Search, Filter, Eye, Edit, Trash2, X, Save, Package, Calendar, Tag, DollarSign } from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' },
    { value: 'discontinued', label: 'Discontinued' },
];

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewMedicine, setViewMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        generic_name: '',
        batch_number: '',
        barcode: '',
        category_id: '',
        supplier_id: '',
        quantity: '',
        unit_price: '',
        purchase_price: '',
        selling_price: '',
        reorder_level: '',
        expiry_date: '',
        status: 'active',
    });

    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        supplier_id: '',
        status: '',
    });

    // Debounced search
    const [searchTimeout, setSearchTimeout] = useState(null);

    const loadMedicines = () => {
        setLoading(true);
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.supplier_id) params.supplier_id = filters.supplier_id;
        if (filters.status) params.status = filters.status;

        api.get('/medicines', { params })
            .then(r => setMedicines(r.data))
            .catch(err => {
                console.error(err);
                setError('Failed to load medicines');
            })
            .finally(() => setLoading(false));
    };

    const loadCategories = () => {
        api.get('/categories')
            .then(r => setCategories(r.data))
            .catch(err => console.error(err));
    };

    const loadSuppliers = () => {
        api.get('/suppliers')
            .then(r => setSuppliers(r.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadCategories();
        loadSuppliers();
    }, []);

    // Load medicines when filters change
    useEffect(() => {
        loadMedicines();
    }, [filters]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
            // search is already in filters state, which triggers the useEffect
        }, 300);
        setSearchTimeout(timeout);
    };

    const resetFilters = () => {
        setFilters({ search: '', category_id: '', supplier_id: '', status: '' });
    };

    const openCreate = () => {
        setForm({
            name: '',
            generic_name: '',
            batch_number: '',
            barcode: '',
            category_id: '',
            supplier_id: '',
            quantity: '',
            unit_price: '',
            purchase_price: '',
            selling_price: '',
            reorder_level: '',
            expiry_date: '',
            status: 'active',
        });
        setEditId(null);
        setShowForm(true);
        setError('');
    };

    const openEdit = (m) => {
        setForm({
            name: m.name || '',
            generic_name: m.generic_name || '',
            batch_number: m.batch_number || '',
            barcode: m.barcode || '',
            category_id: m.category_id || '',
            supplier_id: m.supplier_id || '',
            quantity: m.quantity || '',
            unit_price: m.unit_price || '',
            purchase_price: m.purchase_price || '',
            selling_price: m.selling_price || '',
            reorder_level: m.reorder_level || '',
            expiry_date: m.expiry_date ? new Date(m.expiry_date).toISOString().split('T')[0] : '',
            status: m.status || 'active',
        });
        setEditId(m.id);
        setShowForm(true);
        setError('');
    };

    const openView = (m) => {
        setViewMedicine(m);
        setShowViewModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            if (editId) {
                await api.put(`/medicines/${editId}`, form);
                window.showToast('Medicine updated successfully', 'success');
            } else {
                await api.post('/medicines', form);
                window.showToast('Medicine created successfully', 'success');
            }
            setShowForm(false);
            loadMedicines();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving medicine');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medicine?')) return;
        try {
            await api.delete(`/medicines/${id}`);
            window.showToast('Medicine deleted successfully', 'success');
            loadMedicines();
        } catch (err) {
            window.showToast('Failed to delete medicine', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
            expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
            discontinued: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Discontinued' },
        };
        const cfg = config[status] || config.active;
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
            </span>
        );
    };

    const isFiltered = filters.search || filters.category_id || filters.supplier_id || filters.status;

    return (
        <SidebarLayout pageTitle="Medicines">
            {/* Search & Filter Bar */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by medicine name, generic name, batch number, or barcode..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative w-full md:w-48">
                        <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select
                            name="category_id"
                            value={filters.category_id}
                            onChange={handleFilterChange}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Supplier Filter */}
                    <div className="relative w-full md:w-48">
                        <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select
                            name="supplier_id"
                            value={filters.supplier_id}
                            onChange={handleFilterChange}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {isFiltered && (
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">
                    All Medicines ({medicines.length})
                </h3>
                <button
                    onClick={openCreate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <Package size={16} />
                    Add New Medicine
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            {/* Add/Edit Medicine Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-700">
                            {editId ? 'Edit Medicine' : 'Add New Medicine'}
                        </h4>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Medicine Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Paracetamol"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            />
                        </div>

                        {/* Generic Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Generic Name</label>
                            <input
                                type="text"
                                name="generic_name"
                                value={form.generic_name}
                                onChange={handleChange}
                                placeholder="e.g. Acetaminophen"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>

                        {/* Batch Number */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Number</label>
                            <input
                                type="text"
                                name="batch_number"
                                value={form.batch_number}
                                onChange={handleChange}
                                placeholder="e.g. BATCH-001"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>

                        {/* Barcode */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Barcode</label>
                            <input
                                type="text"
                                name="barcode"
                                value={form.barcode}
                                onChange={handleChange}
                                placeholder="e.g. 123456789012"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Supplier */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
                            <select
                                name="supplier_id"
                                value={form.supplier_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            />
                        </div>

                        {/* Unit Price */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="unit_price"
                                    value={form.unit_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>

                        {/* Purchase Price */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={form.purchase_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>

                        {/* Selling Price */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Selling Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="selling_price"
                                    value={form.selling_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>

                        {/* Reorder Level */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Reorder Level *</label>
                            <input
                                type="number"
                                name="reorder_level"
                                value={form.reorder_level}
                                onChange={handleChange}
                                placeholder="10"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            />
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="expiry_date"
                                    value={form.expiry_date}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="expired">Expired</option>
                                <option value="discontinued">Discontinued</option>
                            </select>
                        </div>

                        {/* Form Buttons */}
                        <div className="lg:col-span-3 flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {editId ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {editId ? 'Update Medicine' : 'Create Medicine'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Medicines Table */}
            {loading ? (
                <LoadingSpinner text="Loading medicines..." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead>
                                <tr className="bg-blue-50 border-b border-blue-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Medicine Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Generic Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Batch Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Barcode</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Supplier</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Purchase Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Selling Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Expiry Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.length > 0 ? (
                                    medicines.map(m => (
                                        <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{m.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.generic_name || '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.category?.name || 'No Category'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.batch_number || '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.barcode || '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.supplier?.name || 'No Supplier'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {m.purchase_price ? `$${Number(m.purchase_price).toFixed(2)}` : '---'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {m.selling_price ? `$${Number(m.selling_price).toFixed(2)}` : '---'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 font-medium">{m.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '---'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(m.status)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => openView(m)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(m)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(m.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="12" className="px-4 py-8 text-center text-gray-400">
                                            No medicines found
                                            {isFiltered && (
                                                <button
                                                    onClick={resetFilters}
                                                    className="ml-2 text-blue-600 hover:underline text-sm font-medium"
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Medicine Modal */}
            {showViewModal && viewMedicine && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-700">Medicine Details</h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine Name</label>
                                <p className="text-sm font-medium text-gray-800">{viewMedicine.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Generic Name</label>
                                <p className="text-sm text-gray-600">{viewMedicine.generic_name || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                                <p className="text-sm text-gray-600">{viewMedicine.category?.name || 'No Category'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Batch Number</label>
                                <p className="text-sm text-gray-600">{viewMedicine.batch_number || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Barcode</label>
                                <p className="text-sm text-gray-600">{viewMedicine.barcode || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Supplier</label>
                                <p className="text-sm text-gray-600">{viewMedicine.supplier?.name || 'No Supplier'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                                <div className="mt-1">{getStatusBadge(viewMedicine.status)}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                                <p className="text-sm font-medium text-gray-800">{viewMedicine.quantity}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Reorder Level</label>
                                <p className="text-sm text-gray-600">{viewMedicine.reorder_level}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Unit Price</label>
                                <p className="text-sm text-gray-600">
                                    {viewMedicine.unit_price ? `$${Number(viewMedicine.unit_price).toFixed(2)}` : '---'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Purchase Price</label>
                                <p className="text-sm text-gray-600">
                                    {viewMedicine.purchase_price ? `$${Number(viewMedicine.purchase_price).toFixed(2)}` : '---'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Selling Price</label>
                                <p className="text-sm text-gray-600">
                                    {viewMedicine.selling_price ? `$${Number(viewMedicine.selling_price).toFixed(2)}` : '---'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Expiry Date</label>
                                <p className="text-sm text-gray-600">
                                    {viewMedicine.expiry_date ? new Date(viewMedicine.expiry_date).toLocaleDateString() : '---'}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    openEdit(viewMedicine);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Edit Medicine
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
