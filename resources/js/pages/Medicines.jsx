// resources/js/pages/Medicines.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Search, Filter, Eye, Edit, Trash2, Plus,
    Package, Calendar, Tag, DollarSign, Barcode,
    Camera, Loader2, ChevronLeft, ChevronRight,
    Image as ImageIcon, Upload, X, AlertCircle, MapPin
} from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' },
    { value: 'discontinued', label: 'Discontinued' },
];

const formSteps = ['Basic Info', 'Pricing & Stock', 'Expiry & Status'];

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewMedicine, setViewMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [step, setStep] = useState(0);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

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
        shelf_location: '',
        description: '',
        manufacturer: '',
        image: null,
        image_url: '',
        image_preview: null
    });

    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        supplier_id: '',
        status: '',
    });

    const [searchTimeout, setSearchTimeout] = useState(null);

    // Load functions
    const loadMedicines = () => {
        setLoading(true);
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.supplier_id) params.supplier_id = filters.supplier_id;
        if (filters.status) params.status = filters.status;
        
        api.get('/medicines', { params })
            .then(r => {
                console.log('Medicines loaded:', r.data);
                setMedicines(r.data);
            })
            .catch(err => {
                console.error('Error loading medicines:', err);
                setError('Failed to load medicines');
            })
            .finally(() => setLoading(false));
    };

    const loadCategories = () => {
        api.get('/categories')
            .then(r => setCategories(r.data))
            .catch(err => console.error('Error loading categories:', err));
    };

    const loadSuppliers = () => {
        api.get('/suppliers')
            .then(r => setSuppliers(r.data))
            .catch(err => console.error('Error loading suppliers:', err));
    };

    useEffect(() => {
        loadCategories();
        loadSuppliers();
    }, []);

    useEffect(() => {
        loadMedicines();
    }, [filters]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({
                    ...prev,
                    image: file,
                    image_preview: reader.result,
                    image_url: ''
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUrl = (e) => {
        const url = e.target.value;
        setForm(prev => ({
            ...prev,
            image_url: url,
            image_preview: url,
            image: null
        }));
    };

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => {}, 300));
    };

    const resetFilters = () => {
        setFilters({ search: '', category_id: '', supplier_id: '', status: '' });
    };

    const resetForm = () => {
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
            shelf_location: '',
            description: '',
            manufacturer: '',
            image: null,
            image_url: '',
            image_preview: null
        });
        setEditId(null);
        setError('');
        setStep(0);
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
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
            shelf_location: m.shelf_location || '',
            description: m.description || '',
            manufacturer: m.manufacturer || '',
            image: null,
            image_url: '',
            image_preview: m.image_url || null
        });
        setEditId(m.id);
        setShowModal(true);
        setError('');
        setStep(0);
    };

    const openView = (m) => {
        setViewMedicine(m);
        setShowViewModal(true);
    };

    const nextStep = () => {
        setStep(s => Math.min(s + 1, formSteps.length - 1));
    };

    const prevStep = () => {
        setStep(s => Math.max(s - 1, 0));
    };

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);

        try {
            // Validate required fields
            if (!form.name) {
                setError('Medicine name is required');
                setSubmitting(false);
                return;
            }
            if (!form.category_id) {
                setError('Category is required');
                setSubmitting(false);
                return;
            }
            if (!form.quantity || form.quantity < 0) {
                setError('Quantity is required and must be 0 or more');
                setSubmitting(false);
                return;
            }
            if (!form.reorder_level || form.reorder_level < 0) {
                setError('Reorder level is required and must be 0 or more');
                setSubmitting(false);
                return;
            }

            const formData = new FormData();
            
            // Add all form fields
            Object.keys(form).forEach(key => {
                if (key === 'image' && form[key] instanceof File) {
                    formData.append('image', form[key]);
                } else if (key === 'image_preview') {
                    // Skip preview
                } else if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
                    formData.append(key, form[key]);
                }
            });

            let response;
            if (editId) {
                formData.append('_method', 'PUT');
                response = await api.post(`/medicines/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                window.showToast('Medicine updated successfully', 'success');
            } else {
                response = await api.post('/medicines', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                window.showToast('Medicine created successfully', 'success');
            }

            console.log('Response:', response.data);
            setShowModal(false);
            loadMedicines();
        } catch (err) {
            console.error('Error saving medicine:', err);
            
            // Handle validation errors
            if (err.response?.data?.errors) {
                const msgs = Object.values(err.response.data.errors).flat().join(' ');
                setError(msgs);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Error saving medicine. Please check all fields and try again.');
            }
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
            console.error('Delete error:', err);
        }
    };

    // Barcode scanning
    const startBarcodeScan = async () => {
        if (!('BarcodeDetector' in window)) {
            window.showToast('Barcode scanning is not supported in this browser.', 'error');
            return;
        }
        setScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            scanLoop();
        } catch (err) {
            window.showToast('Could not access camera: ' + err.message, 'error');
            setScanning(false);
        }
    };

    const scanLoop = useCallback(async () => {
        if (!scanning) return;
        const detector = new BarcodeDetector({ 
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] 
        });
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
        } catch (err) {
            requestAnimationFrame(scanLoop);
        }
    }, [scanning]);

    const stopBarcodeScan = () => {
        setScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        return () => stopBarcodeScan();
    }, []);

    // Status badge
    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
            expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
            discontinued: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Discontinued' }
        };
        const cfg = config[status] || config.active;
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
            </span>
        );
    };

    // Stock status
    const getStockStatus = (medicine) => {
        if (medicine.quantity === 0) {
            return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Out of Stock</span>;
        }
        if (medicine.quantity <= medicine.reorder_level) {
            return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Low Stock</span>;
        }
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">In Stock</span>;
    };

    const isFiltered = filters.search || filters.category_id || filters.supplier_id || filters.status;

    // Render step content for form
    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Barcode */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Barcode</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="barcode"
                                        value={form.barcode}
                                        onChange={handleChange}
                                        placeholder="Scan or type barcode"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={startBarcodeScan}
                                    disabled={scanning}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                                >
                                    {scanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                    {scanning ? 'Scanning...' : 'Scan'}
                                </button>
                            </div>
                            {scanning && (
                                <div className="mt-2 relative">
                                    <video ref={videoRef} className="w-full max-w-xs rounded-lg border-2 border-blue-400" />
                                    <button
                                        type="button"
                                        onClick={stopBarcodeScan}
                                        className="mt-1 text-xs text-red-600 hover:underline"
                                    >
                                        Cancel scan
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine Image</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                    >
                                        {form.image_preview ? (
                                            <div className="relative">
                                                <img
                                                    src={form.image_preview}
                                                    alt="Preview"
                                                    className="max-h-32 mx-auto rounded-lg object-contain"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setForm(prev => ({ ...prev, image_preview: null, image: null, image_url: '' }));
                                                    }}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-1" />
                                                <p className="text-sm text-gray-500">Click to upload image</p>
                                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 2MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange}
                                        name="image"
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Or enter image URL</label>
                                    <input
                                        type="url"
                                        name="image_url"
                                        value={form.image_url}
                                        onChange={handleImageUrl}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

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
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                            <input
                                type="text"
                                name="shelf_location"
                                value={form.shelf_location}
                                onChange={handleChange}
                                placeholder="e.g. A-3-B"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Manufacturer</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={form.manufacturer}
                                onChange={handleChange}
                                placeholder="e.g. ABC Pharma"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Medicine description"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                            />
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Selling Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="expiry_date"
                                    value={form.expiry_date}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>
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
                        <div className="md:col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 Review Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                <div><span className="text-gray-500">Name:</span> <span className="font-medium">{form.name || '---'}</span></div>
                                <div><span className="text-gray-500">Category:</span> <span className="font-medium">{categories.find(c => c.id == form.category_id)?.name || '---'}</span></div>
                                <div><span className="text-gray-500">Barcode:</span> <span className="font-medium">{form.barcode || '---'}</span></div>
                                <div><span className="text-gray-500">Quantity:</span> <span className="font-medium">{form.quantity || '0'}</span></div>
                                <div><span className="text-gray-500">Selling Price:</span> <span className="font-medium">{form.selling_price ? `$${form.selling_price}` : '---'}</span></div>
                                <div><span className="text-gray-500">Status:</span> <span className="font-medium">{form.status}</span></div>
                                <div><span className="text-gray-500">Shelf:</span> <span className="font-medium">{form.shelf_location || '---'}</span></div>
                                <div><span className="text-gray-500">Reorder Level:</span> <span className="font-medium">{form.reorder_level || '---'}</span></div>
                                <div><span className="text-gray-500">Expiry:</span> <span className="font-medium">{form.expiry_date || '---'}</span></div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by medicine name, generic name, or batch..."
                        value={filters.search}
                        onChange={handleSearchChange}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </div>
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
                {isFiltered && (
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-base font-semibold text-gray-700">All Medicines ({medicines.length})</h3>
                    <p className="text-sm text-gray-400">Manage your medicine inventory</p>
                </div>
                <button
                    onClick={openCreate}
                    className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add New Medicine
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingSpinner text="Loading medicines..." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1400px]">
                            <thead>
                                <tr className="bg-blue-50 border-b border-blue-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Medicine</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Shelf</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Barcode</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Stock</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Image</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.length > 0 ? medicines.map(m => (
                                    <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">{m.name}</div>
                                                <div className="text-xs text-gray-400">{m.generic_name || 'No generic name'}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {m.category?.name || 'No Category'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {m.shelf_location ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                                                    <MapPin size={12} />
                                                    {m.shelf_location}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-500">
                                            {m.barcode || '---'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center font-medium text-gray-800">
                                            {m.quantity}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStockStatus(m)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            ${Number(m.selling_price || m.unit_price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(m.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <img
                                                src={m.image_url || '/images/medicine-placeholder.svg'}
                                                alt={m.name}
                                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 ml-auto"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/medicine-placeholder.svg';
                                                }}
                                            />
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
                                )) : (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                                            {isFiltered ? (
                                                <>
                                                    No medicines match your filters
                                                    <button
                                                        onClick={resetFilters}
                                                        className="ml-2 text-blue-600 hover:underline text-sm font-medium"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </>
                                            ) : (
                                                'No medicines found. Add your first medicine!'
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <div className={`fixed inset-0 z-50 ${showModal ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
                <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {editId ? 'Edit Medicine' : 'Add New Medicine'}
                        </h3>
                        <button
                            onClick={() => setShowModal(false)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Stepper */}
                        <div className="flex items-center gap-2 mb-6">
                            {formSteps.map((label, idx) => (
                                <React.Fragment key={idx}>
                                    <div className={`flex items-center gap-2 ${idx <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                            idx < step ? 'bg-blue-600 text-white' :
                                            idx === step ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                                            'bg-gray-100 text-gray-400'
                                        }`}>
                                            {idx < step ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-sm ${idx === step ? 'font-semibold' : ''}`}>{label}</span>
                                    </div>
                                    {idx < formSteps.length - 1 && (
                                        <div className={`flex-1 h-0.5 ${idx < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100 flex items-start gap-2">
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={(e) => { e.preventDefault(); if (step === formSteps.length - 1) handleSubmit(); else nextStep(); }}>
                            {renderStepContent()}

                            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={step === 0 ? () => setShowModal(false) : prevStep}
                                    className="btn-secondary flex items-center gap-1.5"
                                >
                                    <ChevronLeft size={16} />
                                    {step === 0 ? 'Cancel' : 'Back'}
                                </button>
                                {step < formSteps.length - 1 ? (
                                    <button type="submit" className="btn-primary flex items-center gap-1.5">
                                        Next <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <><Loader2 size={16} className="animate-spin" /> {editId ? 'Updating...' : 'Creating...'}</>
                                        ) : (
                                            <><Package size={16} /> {editId ? 'Update Medicine' : 'Create Medicine'}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <div className={`fixed inset-0 z-50 ${showViewModal ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
                <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Medicine Details</h3>
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex gap-6 mb-6">
                            <img
                                src={viewMedicine?.image_url || '/images/medicine-placeholder.svg'}
                                alt={viewMedicine?.name}
                                className="w-32 h-32 rounded-xl object-cover border border-gray-200"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/medicine-placeholder.svg';
                                }}
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{viewMedicine?.name}</h2>
                                <p className="text-gray-500">{viewMedicine?.generic_name || 'No generic name'}</p>
                                <div className="flex gap-2 mt-2">
                                    {getStatusBadge(viewMedicine?.status)}
                                    {viewMedicine?.quantity <= viewMedicine?.reorder_level && (
                                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Low Stock</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="font-medium">{viewMedicine?.category?.name || 'No Category'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Shelf Location</p>
                                <p className="font-medium">{viewMedicine?.shelf_location || 'Not set'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Barcode</p>
                                <p className="font-mono font-medium">{viewMedicine?.barcode || '---'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Batch Number</p>
                                <p className="font-medium">{viewMedicine?.batch_number || '---'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Manufacturer</p>
                                <p className="font-medium">{viewMedicine?.manufacturer || '---'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Supplier</p>
                                <p className="font-medium">{viewMedicine?.supplier?.name || 'No Supplier'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Quantity</p>
                                <p className="font-medium text-lg">{viewMedicine?.quantity}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Reorder Level</p>
                                <p className="font-medium">{viewMedicine?.reorder_level}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Unit Price</p>
                                <p className="font-medium">${Number(viewMedicine?.unit_price || 0).toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Purchase Price</p>
                                <p className="font-medium">${Number(viewMedicine?.purchase_price || 0).toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Selling Price</p>
                                <p className="font-medium">${Number(viewMedicine?.selling_price || 0).toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Expiry Date</p>
                                <p className="font-medium">{viewMedicine?.expiry_date ? new Date(viewMedicine.expiry_date).toLocaleDateString() : '---'}</p>
                            </div>
                        </div>

                        {viewMedicine?.description && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Description</p>
                                <p className="font-medium">{viewMedicine.description}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    openEdit(viewMedicine);
                                }}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <Edit size={16} /> Edit Medicine
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}