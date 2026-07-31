import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import { Edit, Trash2, Plus, Search, Pill, UploadCloud, X, Eye, Package, TrendingDown, CalendarDays, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });
};

const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) {
        return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" />, type: 'out' };
    }
    if (quantity <= reorderLevel) {
        return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: <AlertTriangle className="h-3 w-3" />, type: 'low' };
    }
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="h-3 w-3" />, type: 'in' };
};

const getExpiryDisplay = (expiryDate) => {
    if (!expiryDate) {
        return { text: 'No expiry set', color: 'text-slate-400', icon: '—', type: 'none' };
    }

    const date = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (diffDays < 0) {
        return { text: `Expired ${formatted}`, color: 'text-red-600', icon: '🔴', type: 'expired' };
    }

    if (diffDays <= 30) {
        return { text: `Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-orange-600', icon: '⚠', type: 'expiring' };
    }

    return { text: `Expires ${formatted}`, color: 'text-emerald-600', icon: '✓', type: 'valid' };
};

const imagePlaceholder = '/images/medicine-placeholder.svg';

const getImageUrl = (image) => {
    if (!image) return imagePlaceholder;
    return `/storage/${image}`;
};

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [expiryFilter, setExpiryFilter] = useState('');
    const [form, setForm] = useState({
        name: '',
        generic_name: '',
        batch_number: '',
        category_id: '',
        supplier_id: '',
        quantity: '',
        unit_price: '',
        reorder_level: '',
        expiry_date: '',
        image: null,
        remove_image: false,
    });
    const [preview, setPreview] = useState('');
    const [currentImage, setCurrentImage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const load = () => api.get('/medicines').then((r) => setMedicines(r.data));
    const loadCategories = () => api.get('/categories').then((r) => setCategories(r.data));
    const loadSuppliers = () => api.get('/suppliers').then((r) => setSuppliers(r.data));

    useEffect(() => {
        load();
        loadCategories();
        loadSuppliers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFile = (file) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPG, JPEG, PNG, and WEBP images are allowed.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be 2MB or smaller.');
            return;
        }

        setError('');
        setForm((prev) => ({ ...prev, image: file, remove_image: false }));
        setPreview(URL.createObjectURL(file));
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        handleFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const openCreate = () => {
        setForm({
            name: '',
            generic_name: '',
            batch_number: '',
            category_id: '',
            supplier_id: '',
            quantity: '',
            unit_price: '',
            reorder_level: '',
            expiry_date: '',
            image: null,
            remove_image: false,
        });
        setPreview('');
        setCurrentImage('');
        setEditId(null);
        setShowForm(true);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const openEdit = (medicine) => {
        setForm({
            name: medicine.name,
            generic_name: medicine.generic_name || '',
            batch_number: medicine.batch_number || '',
            category_id: medicine.category_id || '',
            supplier_id: medicine.supplier_id || '',
            quantity: medicine.quantity,
            unit_price: medicine.unit_price,
            reorder_level: medicine.reorder_level,
            expiry_date: medicine.expiry_date || '',
            image: null,
            remove_image: false,
        });
        setPreview('');
        setCurrentImage(medicine.image || '');
        setEditId(medicine.id);
        setShowForm(true);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('generic_name', form.generic_name);
        formData.append('batch_number', form.batch_number);
        formData.append('category_id', form.category_id);
        formData.append('supplier_id', form.supplier_id || '');
        formData.append('quantity', form.quantity);
        formData.append('unit_price', form.unit_price);
        formData.append('reorder_level', form.reorder_level);
        formData.append('expiry_date', form.expiry_date || '');

        if (form.image) {
            formData.append('image', form.image);
        }

        if (form.remove_image) {
            formData.append('remove_image', '1');
        }

        try {
            if (editId) {
                await api.put(`/medicines/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/medicines', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            setShowForm(false);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving medicine');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this medicine?')) return;
        await api.delete(`/medicines/${id}`);
        load();
    };

    const removeImage = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview('');
        setCurrentImage('');
        setForm((prev) => ({ ...prev, image: null, remove_image: true }));
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setSupplierFilter('');
        setStatusFilter('');
        setExpiryFilter('');
    };

    const filteredMedicines = useMemo(() => {
        return medicines.filter((medicine) => {
            const query = search.trim().toLowerCase();
            const matchesSearch =
                medicine.name.toLowerCase().includes(query) ||
                medicine.generic_name?.toLowerCase().includes(query) ||
                medicine.batch_number?.toLowerCase().includes(query) ||
                medicine.category?.name?.toLowerCase().includes(query);

            const matchesCategory = categoryFilter ? medicine.category_id === Number(categoryFilter) : true;
            const matchesSupplier = supplierFilter ? medicine.supplier_id === Number(supplierFilter) : true;

            const stockStatus = getStockStatus(medicine.quantity, medicine.reorder_level);
            const matchesStatus = statusFilter ? stockStatus.type === statusFilter : true;

            const expiryDisplay = getExpiryDisplay(medicine.expiry_date);
            const matchesExpiry = expiryFilter ? expiryDisplay.type === expiryFilter : true;

            return matchesSearch && matchesCategory && matchesSupplier && matchesStatus && matchesExpiry;
        });
    }, [medicines, search, categoryFilter, supplierFilter, statusFilter, expiryFilter]);

    const summary = useMemo(() => {
        let lowStock = 0;
        let expired = 0;
        let expiringSoon = 0;
        let totalStock = 0;

        medicines.forEach((medicine) => {
            totalStock += Number(medicine.quantity || 0);

            const stockStatus = getStockStatus(medicine.quantity, medicine.reorder_level);
            if (stockStatus.type === 'low' || stockStatus.type === 'out') {
                lowStock += 1;
            }

            if (medicine.expiry_date) {
                const date = new Date(medicine.expiry_date);
                const today = new Date();
                const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    expired += 1;
                } else if (diffDays <= 30) {
                    expiringSoon += 1;
                }
            }
        });

        return {
            total: medicines.length,
            totalStock,
            lowStock,
            expired,
            expiringSoon,
        };
    }, [medicines]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                        <Pill size={18} />
                        Medicine Inventory
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">Manage medicines with pharmacy-grade clarity</h1>
                    <p className="mt-2 text-sm text-slate-500">Search, filter, and update stock details with professional medicine photos.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Add medicine
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium text-slate-500">Total Medicines</p>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.total}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium text-slate-500">Total Stock Qty</p>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.totalStock}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-medium text-slate-500">Low Stock</p>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-amber-700">{summary.lowStock}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        <p className="text-sm font-medium text-slate-500">Expiring Soon</p>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-orange-700">{summary.expiringSoon}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <p className="text-sm font-medium text-slate-500">Expired</p>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-red-700">{summary.expired}</p>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                        <div className="relative sm:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name, generic, batch..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={supplierFilter}
                            onChange={(e) => setSupplierFilter(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Status</option>
                            <option value="in">In Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                        <select
                            value={expiryFilter}
                            onChange={(e) => setExpiryFilter(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Expiry</option>
                            <option value="valid">Valid</option>
                            <option value="expiring">Expiring Soon</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                <div className="hidden overflow-x-auto lg:block">
                    <table className="min-w-full divide-y divide-slate-200 bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Medicine</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Generic Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Batch</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Unit Price</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Expiry</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-4 py-8 text-center text-sm text-slate-500">No medicines found.</td>
                                </tr>
                            ) : (
                                filteredMedicines.map((medicine) => {
                                    const stockStatus = getStockStatus(medicine.quantity, medicine.reorder_level);
                                    const expiryDisplay = getExpiryDisplay(medicine.expiry_date);

                                    return (
                                        <tr key={medicine.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getImageUrl(medicine.image)}
                                                        alt={medicine.name}
                                                        className="h-12 w-12 rounded-full object-cover border border-slate-200"
                                                        onError={(e) => {
                                                            e.currentTarget.src = imagePlaceholder;
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{medicine.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-middle text-sm text-slate-600">{medicine.generic_name || 'N/A'}</td>
                                            <td className="px-4 py-4 align-middle text-sm text-slate-600">{medicine.category?.name || 'Uncategorized'}</td>
                                            <td className="px-4 py-4 align-middle text-sm text-slate-600">{medicine.supplier?.name || 'N/A'}</td>
                                            <td className="px-4 py-4 align-middle text-sm text-slate-600">{medicine.batch_number || 'N/A'}</td>
                                            <td className="px-4 py-4 align-middle text-right text-sm font-medium text-slate-900">{medicine.quantity}</td>
                                            <td className="px-4 py-4 align-middle text-right text-sm text-slate-900">{formatCurrency(medicine.unit_price)}</td>
                                            <td className="px-4 py-4 align-middle">
                                                <span className={`inline-flex items-center gap-1 text-sm font-medium ${expiryDisplay.color}`}>
                                                    <span>{expiryDisplay.icon}</span>
                                                    <span>{expiryDisplay.text}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 align-middle text-center">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${stockStatus.color}`}>
                                                    {stockStatus.icon}
                                                    {stockStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 align-middle text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    <Link
                                                        to={`/medicines/${medicine.id}`}
                                                        className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 hover:scale-110"
                                                        title="View details"
                                                    >
                                                        <Eye size={16} className="group-hover:text-blue-600" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openEdit(medicine)}
                                                        className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 hover:scale-110"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} className="group-hover:text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(medicine.id)}
                                                        className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-red-100 hover:scale-110"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} className="group-hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="block lg:hidden">
                    {filteredMedicines.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">No medicines found.</div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {filteredMedicines.map((medicine) => {
                                const stockStatus = getStockStatus(medicine.quantity, medicine.reorder_level);
                                const expiryDisplay = getExpiryDisplay(medicine.expiry_date);

                                return (
                                    <div key={medicine.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={getImageUrl(medicine.image)}
                                                alt={medicine.name}
                                                className="h-14 w-14 rounded-full object-cover border border-slate-200"
                                                onError={(e) => {
                                                    e.currentTarget.src = imagePlaceholder;
                                                }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-bold text-slate-900">{medicine.name}</p>
                                                        <p className="text-sm text-slate-500">{medicine.generic_name || 'N/A'}</p>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${stockStatus.color}`}>
                                                        {stockStatus.icon}
                                                        {stockStatus.label}
                                                    </span>
                                                </div>
                                                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                                    <div>
                                                        <span className="text-slate-500">Category:</span>
                                                        <span className="text-slate-700"> {medicine.category?.name || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Supplier:</span>
                                                        <span className="text-slate-700"> {medicine.supplier?.name || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Batch:</span>
                                                        <span className="text-slate-700"> {medicine.batch_number || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Stock:</span>
                                                        <span className="text-slate-700 font-medium"> {medicine.quantity}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Price:</span>
                                                        <span className="text-slate-700"> {formatCurrency(medicine.unit_price)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Expiry:</span>
                                                        <span className={`text-xs font-medium ${expiryDisplay.color}`}> {expiryDisplay.text}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Link
                                                        to={`/medicines/${medicine.id}`}
                                                        className="group inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                                                        title="View details"
                                                    >
                                                        <Eye size={14} className="group-hover:text-blue-600" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openEdit(medicine)}
                                                        className="group inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} className="group-hover:text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(medicine.id)}
                                                        className="group inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} className="group-hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <aside className="space-y-4">
                    <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{editId ? 'Edit medicine' : 'New medicine'}</p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-900">{editId ? 'Update medicine details' : 'Add a new medicine'}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>

                        {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-blue-300"
                            >
                                <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white border border-slate-200">
                                    <img
                                        src={preview || getImageUrl(currentImage)}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = imagePlaceholder;
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-900">Medicine Image</p>
                                    <p className="text-sm text-slate-500">Drag and drop an image here, or choose one from your device.</p>
                                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            <UploadCloud size={16} />
                                            Choose image
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                        >
                                            <X size={16} />
                                            Remove image
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">Supported: JPG, JPEG, PNG, WEBP. Max 2MB.</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Medicine Information</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Name *</span>
                                            <input
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Generic name</span>
                                            <input
                                                name="generic_name"
                                                value={form.generic_name}
                                                onChange={handleChange}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Category *</span>
                                            <select
                                                name="category_id"
                                                value={form.category_id}
                                                onChange={handleChange}
                                                required
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            >
                                                <option value="">Choose category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Supplier</span>
                                            <select
                                                name="supplier_id"
                                                value={form.supplier_id}
                                                onChange={handleChange}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            >
                                                <option value="">Choose supplier</option>
                                                {suppliers.map((supplier) => (
                                                    <option key={supplier.id} value={supplier.id}>
                                                        {supplier.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Inventory Information</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Batch number</span>
                                            <input
                                                name="batch_number"
                                                value={form.batch_number}
                                                onChange={handleChange}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Quantity *</span>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={form.quantity}
                                                onChange={handleChange}
                                                required
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Reorder level *</span>
                                            <input
                                                type="number"
                                                name="reorder_level"
                                                value={form.reorder_level}
                                                onChange={handleChange}
                                                required
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Expiry date</span>
                                            <input
                                                type="date"
                                                name="expiry_date"
                                                value={form.expiry_date}
                                                onChange={handleChange}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Pricing</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Unit price *</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="unit_price"
                                                value={form.unit_price}
                                                onChange={handleChange}
                                                required
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    {editId ? 'Update medicine' : 'Add medicine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </aside>
            )}
        </div>
    );
}
