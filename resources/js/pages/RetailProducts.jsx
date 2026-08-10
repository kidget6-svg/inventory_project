import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import Stepper from '../components/Stepper';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { Search, Filter, Eye, Edit, Trash2, X, Save, Package, Calendar, Tag, DollarSign, Barcode, Camera, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' },
    { value: 'discontinued', label: 'Discontinued' },
];

const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Cosmetics', label: 'Cosmetics' },
    { value: 'OTC', label: 'OTC' },
    { value: 'Health & Wellness', label: 'Health & Wellness' },
    { value: 'General', label: 'General' },
    { value: 'Vitamins', label: 'Vitamins' },
    { value: 'Personal Care', label: 'Personal Care' },
];

const formSteps = ['Basic Info', 'Pricing & Stock', 'Expiry & Status'];

export default function RetailProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewProduct, setViewProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef(null);
    const [step, setStep] = useState(0);

    const [form, setForm] = useState({
        name: '', sku: '', barcode: '', category: 'General', supplier_id: '',
        quantity: '', price: '', purchase_price: '', reorder_level: '',
        expiry_date: '', status: 'active',
        description: '', manufacturer: '', shelf_location: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [filters, setFilters] = useState({
        search: '', category: '', supplier_id: '', status: '',
    });

    const [searchTimeout, setSearchTimeout] = useState(null);

    const loadProducts = () => {
        setLoading(true);
        const params = { page };
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.supplier_id) params.supplier_id = filters.supplier_id;
        if (filters.status) params.status = filters.status;
        api.get('/retail-products', { params })
            .then(r => {
                setProducts(r.data.data || r.data);
                setMeta(r.data);
            })
            .catch(err => { console.error(err); setError('Failed to load retail products'); })
            .finally(() => setLoading(false));
    };

    const loadCategories = () => { api.get('/categories').then(r => setCategories(r.data)).catch(err => console.error(err)); };
    const loadSuppliers = () => { api.get('/suppliers').then(r => setSuppliers(r.data)).catch(err => console.error(err)); };

    useEffect(() => { loadCategories(); loadSuppliers(); }, []);
    useEffect(() => { setPage(1); }, [filters.search, filters.category, filters.supplier_id, filters.status]);
    useEffect(() => { loadProducts(); }, [filters, page]);

    const handlePageChange = (p) => setPage(p);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFilterChange = (e) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => {}, 300));
    };

    const resetFilters = () => setFilters({ search: '', category: '', supplier_id: '', status: '' });

    const resetForm = () => {
        setForm({ name: '', sku: '', barcode: '', category: 'General', supplier_id: '', quantity: '', price: '', purchase_price: '', reorder_level: '', expiry_date: '', status: 'active', description: '', manufacturer: '', shelf_location: '' });
        setImageFile(null);
        setImagePreview('');
        setEditId(null); setError(''); setStep(0);
    };

    const openCreate = () => { resetForm(); setShowModal(true); };

    const openEdit = (p) => {
        setForm({
            name: p.name || '', sku: p.sku || '', barcode: p.barcode || '', category: p.category || 'General',
            supplier_id: p.supplier_id || '', quantity: p.quantity || '', price: p.price || '',
            purchase_price: p.purchase_price || '', reorder_level: p.reorder_level || '',
            expiry_date: p.expiry_date ? new Date(p.expiry_date).toISOString().split('T')[0] : '',
            status: p.status || 'active', description: p.description || '', manufacturer: p.manufacturer || '',
            shelf_location: p.shelf_location || '',
        });
        setImageFile(null);
        setImagePreview(p.image_url || '');
        setEditId(p.id); setShowModal(true); setError(''); setStep(0);
    };

    const openView = (p) => { setViewProduct(p); setShowViewModal(true); };

    const nextStep = () => { setStep(s => Math.min(s + 1, formSteps.length - 1)); };
    const prevStep = () => { setStep(s => Math.max(s - 1, 0)); };

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);
        try {
            if (imageFile) {
                const formData = new FormData();
                Object.entries(form).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        formData.append(key, value);
                    }
                });
                formData.append('image', imageFile);

                const headers = { Accept: 'application/json' };
                delete headers['Content-Type'];

                if (editId) {
                    await api.post(`/retail-products/${editId}?_method=PUT`, formData, { headers });
                    window.showToast('Retail product updated successfully', 'success');
                } else {
                    await api.post('/retail-products', formData, { headers });
                    window.showToast('Retail product created successfully', 'success');
                }
            } else {
                if (editId) { await api.put(`/retail-products/${editId}`, form); window.showToast('Retail product updated successfully', 'success'); }
                else { await api.post('/retail-products', form); window.showToast('Retail product created successfully', 'success'); }
            }
            setShowModal(false); loadProducts();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving retail product');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this retail product?')) return;
        try { await api.delete(`/retail-products/${id}`); window.showToast('Retail product deleted successfully', 'success'); loadProducts(); }
        catch (err) { window.showToast('Failed to delete retail product', 'error'); }
    };

    const startBarcodeScan = async () => {
        if (!('BarcodeDetector' in window)) { window.showToast('Barcode scanning is not supported in this browser.', 'error'); return; }
        setScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
            scanLoop();
        } catch (err) { window.showToast('Could not access camera: ' + err.message, 'error'); setScanning(false); }
    };

    const scanLoop = useCallback(async () => {
        if (!scanning) return;
        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] });
        try {
            if (videoRef.current) {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                    setForm(prev => ({ ...prev, barcode: barcodes[0].rawValue }));
                    stopBarcodeScan();
                    window.showToast('Barcode scanned: ' + barcodes[0].rawValue, 'success');
                    return;
                }
            }
            requestAnimationFrame(scanLoop);
        } catch (err) { requestAnimationFrame(scanLoop); }
    }, [scanning]);

    const stopBarcodeScan = () => {
        setScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => { return () => stopBarcodeScan(); }, []);

    const getStatusBadge = (status) => {
        const config = { active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' }, inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' }, expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' }, discontinued: { bg: 'bg-orange-100', text: 'orange-700', label: 'Discontinued' } };
        const cfg = config[status] || config.active;
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
    };

    const isFiltered = filters.search || filters.category || filters.supplier_id || filters.status;

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Barcode</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" name="barcode" value={form.barcode} onChange={handleChange} placeholder="Scan or type barcode" className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-mono" />
                                </div>
                                <button type="button" onClick={startBarcodeScan} disabled={scanning} className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition-colors flex items-center gap-1.5 disabled:opacity-60">
                                    {scanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                    {scanning ? 'Scanning...' : 'Scan'}
                                </button>
                            </div>
                            {scanning && (
                                <div className="mt-2 relative">
                                    <video ref={videoRef} className="w-full max-w-xs rounded-lg border-2 border-sky-400" />
                                    <button type="button" onClick={stopBarcodeScan} className="mt-1 text-xs text-red-600 hover:underline">Cancel scan</button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name *</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Lipstick - Ruby Red" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">SKU</label>
                            <input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. COS-001" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                            <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required>
                                {categoryOptions.filter(o => o.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Manufacturer</label>
                            <input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. GSK" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                            <input type="text" name="shelf_location" value={form.shelf_location} onChange={handleChange} placeholder="e.g. A-2-3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
                            <select name="supplier_id" value={form.supplier_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none">
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Additional details about this product" rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Product Image</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="text-gray-300" size={28} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 2MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="0" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Selling Price *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input type="number" name="purchase_price" value={form.purchase_price} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Reorder Level *</label>
                            <input type="number" name="reorder_level" value={form.reorder_level} onChange={handleChange} placeholder="10" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="expired">Expired</option>
                                <option value="discontinued">Discontinued</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 p-4 bg-sky-50 rounded-xl border border-sky-200">
                            <h4 className="text-sm font-semibold text-sky-800 mb-2">Review Summary</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-gray-500">Name:</span> <span className="font-medium">{form.name || '---'}</span></div>
                                <div><span className="text-gray-500">Category:</span> <span className="font-medium">{form.category || '---'}</span></div>
                                <div><span className="text-gray-500">Barcode:</span> <span className="font-medium">{form.barcode || '---'}</span></div>
                                <div><span className="text-gray-500">Quantity:</span> <span className="font-medium">{form.quantity || '0'}</span></div>
                                <div><span className="text-gray-500">Selling Price:</span> <span className="font-medium">{form.price ? `$${form.price}` : '---'}</span></div>
                                <div><span className="text-gray-500">Status:</span> <span className="font-medium">{form.status}</span></div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <>
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="text" name="search" placeholder="Search by product name, SKU, or barcode..." value={filters.search} onChange={handleSearchChange} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                    </div>
                    <div className="relative w-full md:w-48">
                        <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none">
                            {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="relative w-full md:w-48">
                        <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select name="supplier_id" value={filters.supplier_id} onChange={handleFilterChange} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none">
                            <option value="">All Suppliers</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none">
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {isFiltered && <button onClick={resetFilters} className="btn-secondary">Clear</button>}
                </div>
            </div>

            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">All Retail Products ({products.length})</h3>
                <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2"><Package size={16} /> Add New Retail Product</button>
            </div>

            {loading ? <LoadingSpinner text="Loading retail products..." /> : (
                <>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <colgroup>
                                    <col className="w-[22%]" />
                                    <col className="w-[11%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[6%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[13%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-sky-50 border-b border-sky-100">
                                        <th className="table-header">Product Name</th>
                                        <th className="table-header">Category</th>
                                        <th className="table-header">Barcode</th>
                                        <th className="table-header">Qty</th>
                                        <th className="table-header">Selling Price</th>
                                        <th className="table-header">Expiry Date</th>
                                        <th className="table-header">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? products.map(p => (
                                        <tr key={p.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate">{p.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 truncate">{p.category || 'General'}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-500 truncate">{p.barcode || '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{p.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{p.price ? `$${Number(p.price).toFixed(2)}` : '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : '---'}</td>
                                            <td className="px-4 py-3">{getStatusBadge(p.status)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => openView(p)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors" title="View"><Eye size={16} /></button>
                                                    <button onClick={() => openEdit(p)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors" title="Edit"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                                            No retail products found{isFiltered && <button onClick={resetFilters} className="ml-2 text-sky-600 hover:underline text-sm font-medium">Clear filters</button>}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination meta={meta} onPageChange={handlePageChange} />
                </>
            )}

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Retail Product' : 'Add New Retail Product'} size="max-w-2xl">
                <Stepper steps={formSteps} currentStep={step} />
                {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100">{error}</div>}
                <form onSubmit={(e) => { e.preventDefault(); if (step === formSteps.length - 1) handleSubmit(); else nextStep(); }}>
                    {renderStepContent()}
                    <div className="flex justify-between mt-6 pt-4 border-t border-sky-100">
                        <button type="button" onClick={step === 0 ? () => setShowModal(false) : prevStep} className="btn-secondary flex items-center gap-1.5">
                            <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
                        </button>
                        {step < formSteps.length - 1 ? (
                            <button type="submit" className="btn-primary flex items-center gap-1.5">
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> {editId ? 'Updating...' : 'Creating...'}</>
                                    : <><Save size={16} /> {editId ? 'Update Product' : 'Create Product'}</>}
                            </button>
                        )}
                    </div>
                </form>
            </Modal>

            <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title="Retail Product Details" size="max-w-3xl">
                {viewProduct && (
                    <>
                        <div className="flex gap-6 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex-shrink-0">
                                {viewProduct.image_url ? (
                                    <img 
                                        src={viewProduct.image_url} 
                                        alt={viewProduct.name} 
                                        className="w-32 h-32 rounded-xl object-cover border border-gray-200 shadow-sm bg-gray-50"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/medicine-placeholder.svg';
                                        }}
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <Package size={48} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{viewProduct.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">SKU: {viewProduct.sku || '---'}</p>
                                <div className="flex flex-wrap gap-2">
                                    {getStatusBadge(viewProduct.status)}
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                        {viewProduct.category || 'General'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Product Name</label><p className="text-sm font-medium text-gray-800">{viewProduct.name}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">SKU</label><p className="text-sm text-gray-600">{viewProduct.sku || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Barcode</label><p className="text-sm font-mono text-gray-600">{viewProduct.barcode || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Category</label><p className="text-sm text-gray-600">{viewProduct.category || 'General'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Supplier</label><p className="text-sm text-gray-600">{viewProduct.supplier?.name || 'No Supplier'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Manufacturer</label><p className="text-sm text-gray-600">{viewProduct.manufacturer || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Shelf Location</label><p className="text-sm text-gray-600">{viewProduct.shelf_location || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Status</label><div className="mt-1">{getStatusBadge(viewProduct.status)}</div></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label><p className="text-sm font-medium text-gray-800">{viewProduct.quantity}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Reorder Level</label><p className="text-sm text-gray-600">{viewProduct.reorder_level}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Selling Price</label><p className="text-sm text-gray-600">{viewProduct.price ? `$${Number(viewProduct.price).toFixed(2)}` : '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Purchase Price</label><p className="text-sm text-gray-600">{viewProduct.purchase_price ? `$${Number(viewProduct.purchase_price).toFixed(2)}` : '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Expiry Date</label><p className="text-sm text-gray-600">{viewProduct.expiry_date ? new Date(viewProduct.expiry_date).toLocaleDateString() : '---'}</p></div>
                            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1">Description</label><p className="text-sm text-gray-600">{viewProduct.description || '---'}</p></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-sky-100">
                            <button onClick={() => setShowViewModal(false)} className="btn-secondary">Close</button>
                            <button onClick={() => { setShowViewModal(false); openEdit(viewProduct); }} className="btn-primary px-4 py-2 text-sm flex items-center gap-2"><Edit size={16} /> Edit Product</button>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
}
