import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import Stepper from '../components/Stepper';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { 
    Search, Filter, Eye, Edit, Trash2, X, Save, Package, Calendar, 
    Tag, DollarSign, Barcode, Camera, Loader2, ChevronLeft, ChevronRight,
    Upload, Image as ImageIcon, TrendingUp, Clock
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
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef(null);
    const [step, setStep] = useState(0);
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [frequentlySearched, setFrequentlySearched] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);

    const [form, setForm] = useState({
        name: '', generic_name: '', batch_number: '', barcode: '', category_id: '',
        supplier_id: '', quantity: '', unit_price: '', purchase_price: '', selling_price: '',
        reorder_level: '', expiry_date: '', status: 'active',
        description: '', manufacturer: '', shelf_location: '',
    });

    const [filters, setFilters] = useState({
        search: '', category_id: '', supplier_id: '', status: '',
    });

    const [searchTimeout, setSearchTimeout] = useState(null);

    // Get current user role
    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await api.get('/user');
                const role = response.data.role;
                setUserRole(role);
                setIsAdmin(role === 'admin');
                console.log('User role:', role, 'Is Admin:', role === 'admin');
            } catch (err) {
                console.error('Failed to get user role:', err);
            }
        };
        getUser();
    }, []);

    const loadMedicines = () => {
        setLoading(true);
        const params = { page };
        if (filters.search) params.search = filters.search;
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.supplier_id) params.supplier_id = filters.supplier_id;
        if (filters.status) params.status = filters.status;
        
        api.get('/medicines', { params })
            .then(r => {
                const data = r.data.data || r.data;
                setMedicines(Array.isArray(data) ? data : []);
                setMeta(r.data);
            })
            .catch(err => { 
                console.error(err); 
                setError('Failed to load medicines'); 
            })
            .finally(() => setLoading(false));
    };

    const loadCategories = () => { 
        api.get('/categories')
            .then(r => setCategories(Array.isArray(r.data) ? r.data : []))
            .catch(err => console.error(err)); 
    };
    
    const loadSuppliers = () => { 
        api.get('/suppliers')
            .then(r => setSuppliers(Array.isArray(r.data) ? r.data : []))
            .catch(err => console.error(err)); 
    };

    // Load frequently searched medicines
    const loadFrequentlySearched = () => {
        try {
            const history = JSON.parse(localStorage.getItem('medicineSearchHistory') || '[]');
            setSearchHistory(history);
            
            // Count frequency of each medicine search
            const frequencyMap = {};
            history.forEach(item => {
                frequencyMap[item.id] = (frequencyMap[item.id] || 0) + 1;
            });
            
            // Get unique medicines from history
            const uniqueMedicines = [];
            const seenIds = new Set();
            history.forEach(item => {
                if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    uniqueMedicines.push({
                        ...item,
                        searchCount: frequencyMap[item.id]
                    });
                }
            });
            
            // Sort by search count (most frequent first) and take top 5
            const sorted = uniqueMedicines
                .sort((a, b) => b.searchCount - a.searchCount)
                .slice(0, 5);
            
            setFrequentlySearched(sorted);
        } catch (err) {
            console.error('Failed to load search history:', err);
        }
    };

    // Save search to history
    const saveSearchToHistory = (medicine) => {
        try {
            const history = JSON.parse(localStorage.getItem('medicineSearchHistory') || '[]');
            const newEntry = {
                id: medicine.id,
                name: medicine.name,
                timestamp: new Date().toISOString()
            };
            // Add to beginning of array (most recent first)
            history.unshift(newEntry);
            // Keep only last 50 entries
            const trimmed = history.slice(0, 50);
            localStorage.setItem('medicineSearchHistory', JSON.stringify(trimmed));
            loadFrequentlySearched();
        } catch (err) {
            console.error('Failed to save search history:', err);
        }
    };

    // Clear search history
    const clearSearchHistory = () => {
        if (window.confirm('Clear all search history?')) {
            localStorage.removeItem('medicineSearchHistory');
            setFrequentlySearched([]);
            setSearchHistory([]);
            window.showToast('Search history cleared', 'success');
        }
    };

    // Remove single item from search history
    const removeFromHistory = (medicineId) => {
        try {
            const history = JSON.parse(localStorage.getItem('medicineSearchHistory') || '[]');
            const filtered = history.filter(item => item.id !== medicineId);
            localStorage.setItem('medicineSearchHistory', JSON.stringify(filtered));
            loadFrequentlySearched();
            window.showToast('Removed from search history', 'success');
        } catch (err) {
            console.error('Failed to remove from history:', err);
        }
    };

    useEffect(() => { 
        loadCategories(); 
        loadSuppliers(); 
        loadFrequentlySearched();
    }, []);

    useEffect(() => { 
        setPage(1); 
    }, [filters.search, filters.category_id, filters.supplier_id, filters.status]);

    useEffect(() => { 
        loadMedicines(); 
    }, [filters, page]);

    const handlePageChange = (p) => setPage(p);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFilterChange = (e) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => {}, 300));
    };

    const resetFilters = () => setFilters({ search: '', category_id: '', supplier_id: '', status: '' });

    const resetForm = () => {
        setForm({ 
            name: '', generic_name: '', batch_number: '', barcode: '', category_id: '', 
            supplier_id: '', quantity: '', unit_price: '', purchase_price: '', selling_price: '', 
            reorder_level: '', expiry_date: '', status: 'active', 
            description: '', manufacturer: '', shelf_location: '' 
        });
        setEditId(null); 
        setError(''); 
        setStep(0);
        setImagePreview(null);
        setImageFile(null);
    };

    const openCreate = () => {
        if (!isAdmin) {
            window.showToast('Only admins can add medicines', 'error');
            return;
        }
        resetForm(); 
        setShowModal(true);
    };

    const openEdit = (m) => {
        if (!isAdmin) {
            window.showToast('Only admins can edit medicines', 'error');
            return;
        }
        setForm({
            name: m.name || '', generic_name: m.generic_name || '', batch_number: m.batch_number || '',
            barcode: m.barcode || '', category_id: m.category_id || '', supplier_id: m.supplier_id || '',
            quantity: m.quantity || '', unit_price: m.unit_price || '', purchase_price: m.purchase_price || '',
            selling_price: m.selling_price || '', reorder_level: m.reorder_level || '',
            expiry_date: m.expiry_date ? new Date(m.expiry_date).toISOString().split('T')[0] : '',
            status: m.status || 'active',
            description: m.description || '',
            manufacturer: m.manufacturer || '',
            shelf_location: m.shelf_location || '',
        });
        setEditId(m.id); 
        setShowModal(true); 
        setError(''); 
        setStep(0);
        setImagePreview(m.image_url || null);
        setImageFile(null);
    };

    const openView = (m) => {
        console.log('Opening view for medicine:', m.id, m.name);
        setViewMedicine(m);
        // Save to search history when viewing
        saveSearchToHistory(m);
        setShowViewModal(true);
    };

    const nextStep = () => { setStep(s => Math.min(s + 1, formSteps.length - 1)); };
    const prevStep = () => { setStep(s => Math.max(s - 1, 0)); };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                window.showToast('Image size must be less than 2MB', 'error');
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                window.showToast('Please upload a valid image (JPEG, PNG, GIF, or WebP)', 'error');
                return;
            }
            
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);
        
        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
                formData.append(key, form[key]);
            }
        });
        
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editId) {
                formData.append('_method', 'PUT');
                await api.post(`/medicines/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                window.showToast('Medicine updated successfully', 'success');
            } else {
                await api.post('/medicines', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                window.showToast('Medicine created successfully', 'success');
            }
            setShowModal(false); 
            loadMedicines();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving medicine');
        } finally { 
            setSubmitting(false); 
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) {
            window.showToast('Only admins can delete medicines', 'error');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this medicine?')) return;
        try { 
            await api.delete(`/medicines/${id}`); 
            window.showToast('Medicine deleted successfully', 'success'); 
            loadMedicines(); 
        } catch (err) { 
            window.showToast('Failed to delete medicine', 'error'); 
        }
    };

    const startBarcodeScan = async () => {
        if (!('BarcodeDetector' in window)) { 
            window.showToast('Barcode scanning is not supported in this browser.', 'error'); 
            return; 
        }
        setScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
            scanLoop();
        } catch (err) { 
            window.showToast('Could not access camera: ' + err.message, 'error'); 
            setScanning(false); 
        }
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
        const config = { 
            active: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Active' }, 
            inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' }, 
            expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' }, 
            discontinued: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Discontinued' } 
        };
        const cfg = config[status] || config.active;
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
    };

    const isFiltered = filters.search || filters.category_id || filters.supplier_id || filters.status;

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine Image</label>
                            <div className="flex items-start gap-4">
                                <div 
                                    className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${imagePreview ? 'border-sky-400 bg-sky-50' : 'border-gray-300 hover:border-sky-400'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Medicine preview" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <Upload size={24} className="text-gray-400 mx-auto mb-1" />
                                            <span className="text-xs text-gray-500">Upload</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()} 
                                            className="px-3 py-1.5 text-sm bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <ImageIcon size={14} /> Choose Image
                                        </button>
                                        {imagePreview && (
                                            <button 
                                                type="button" 
                                                onClick={removeImage} 
                                                className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <X size={14} /> Remove
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP (max 2MB)</p>
                                </div>
                            </div>
                        </div>

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
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-mono" 
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={startBarcodeScan} 
                                    disabled={scanning} 
                                    className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                                >
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
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine Name *</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={form.name} 
                                onChange={handleChange} 
                                placeholder="e.g. Paracetamol" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                            <select 
                                name="category_id" 
                                value={form.category_id} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Self Category</label>
                            <select 
                                name="self_category" 
                                value={form.self_category || ''} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            >
                                <option value="">Select Self Category</option>
                                <option value="OTC">Over The Counter (OTC)</option>
                                <option value="Prescription">Prescription Only</option>
                                <option value="Controlled">Controlled Substance</option>
                                <option value="Herbal">Herbal/Alternative</option>
                                <option value="Medical Device">Medical Device</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Optional classification</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Manufacturer</label>
                            <input 
                                type="text" 
                                name="manufacturer" 
                                value={form.manufacturer} 
                                onChange={handleChange} 
                                placeholder="e.g. GSK" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                            <input 
                                type="text" 
                                name="shelf_location" 
                                value={form.shelf_location} 
                                onChange={handleChange} 
                                placeholder="e.g. A-2-3" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <textarea 
                                name="description" 
                                value={form.description} 
                                onChange={handleChange} 
                                placeholder="Additional details about this medicine" 
                                rows="2" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
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
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <select 
                                name="status" 
                                value={form.status} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            >
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
                                <div><span className="text-gray-500">Category:</span> <span className="font-medium">{categories.find(c => c.id == form.category_id)?.name || '---'}</span></div>
                                <div><span className="text-gray-500">Barcode:</span> <span className="font-medium">{form.barcode || '---'}</span></div>
                                <div><span className="text-gray-500">Quantity:</span> <span className="font-medium">{form.quantity || '0'}</span></div>
                                <div><span className="text-gray-500">Selling Price:</span> <span className="font-medium">{form.selling_price ? `$${form.selling_price}` : '---'}</span></div>
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
            {/* Frequently Searched Medicines Card */}
            {frequentlySearched.length > 0 && (
                <div className="mb-6 bg-white rounded-xl border border-sky-200 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-sky-600" />
                            <h4 className="text-sm font-semibold text-gray-700">Frequently Searched Medicines</h4>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {frequentlySearched.length} items
                            </span>
                        </div>
                        <button
                            onClick={clearSearchHistory}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {frequentlySearched.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-1 bg-sky-50 border border-sky-200 rounded-full px-3 py-1.5 hover:bg-sky-100 transition-colors group"
                            >
                                <button
                                    onClick={() => {
                                        // Find the medicine in the list and open view
                                        const medicine = medicines.find(m => m.id === item.id);
                                        if (medicine) {
                                            openView(medicine);
                                        } else {
                                            // If not in current list, fetch it
                                            api.get(`/medicines/${item.id}`)
                                                .then(r => openView(r.data))
                                                .catch(() => window.showToast('Medicine not found', 'error'));
                                        }
                                    }}
                                    className="text-sm text-gray-700 hover:text-sky-700"
                                >
                                    {item.name}
                                </button>
                                <span className="text-xs text-gray-400 ml-1">
                                    ({item.searchCount || 1}x)
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromHistory(item.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors ml-1 opacity-0 group-hover:opacity-100"
                                    title="Remove from history"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="search" 
                            placeholder="Search by medicine name, generic name, or batch..." 
                            value={filters.search} 
                            onChange={handleSearchChange} 
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
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="relative w-full md:w-48">
                        <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select 
                            name="supplier_id" 
                            value={filters.supplier_id} 
                            onChange={handleFilterChange} 
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select 
                            name="status" 
                            value={filters.status} 
                            onChange={handleFilterChange} 
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none"
                        >
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {isFiltered && <button onClick={resetFilters} className="btn-secondary">Clear</button>}
                </div>
            </div>

            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">
                    All Medicines ({medicines.length})
                    {userRole && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                            ({userRole === 'admin' ? 'Admin - Full Access' : 'View Only'})
                        </span>
                    )}
                </h3>
                {isAdmin && (
                    <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2">
                        <Package size={16} /> Add New Medicine
                    </button>
                )}
            </div>

            {loading ? <LoadingSpinner text="Loading medicines..." /> : (
                <>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <colgroup>
                                    <col className="w-[8%]" />
                                    <col className="w-[20%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[6%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[8%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-sky-50 border-b border-sky-100">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Image</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Medicine Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Barcode</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Qty</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Selling Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Expiry Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.length > 0 ? medicines.map(m => (
                                        <tr key={m.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                {m.image_url ? (
                                                    <img 
                                                        src={m.image_url} 
                                                        alt={m.name} 
                                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        <Package size={16} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate">{m.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 truncate">{m.category?.name || 'No Category'}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-500 truncate">{m.barcode || '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{m.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.selling_price ? `$${Number(m.selling_price).toFixed(2)}` : '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '---'}</td>
                                            <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => {
                                                            console.log('View clicked:', m.id);
                                                            openView(m);
                                                        }}
                                                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                        title="View Details"
                                                        type="button"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Edit clicked:', m.id);
                                                                    openEdit(m);
                                                                }}
                                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                                title="Edit Medicine"
                                                                type="button"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Delete clicked:', m.id);
                                                                    handleDelete(m.id);
                                                                }}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete Medicine"
                                                                type="button"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                                            No medicines found{isFiltered && <button onClick={resetFilters} className="ml-2 text-sky-600 hover:underline text-sm font-medium">Clear filters</button>}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination meta={meta} onPageChange={handlePageChange} />
                </>
            )}

            {/* Create/Edit Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Medicine' : 'Add New Medicine'} size="max-w-2xl">
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
                                    : <><Save size={16} /> {editId ? 'Update Medicine' : 'Create Medicine'}</>}
                            </button>
                        )}
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title="Medicine Details" size="max-w-3xl">
                {viewMedicine && (
                    <>
                        <div className="flex gap-6 mb-6">
                            <div className="flex-shrink-0">
                                {viewMedicine.image_url ? (
                                    <img 
                                        src={viewMedicine.image_url} 
                                        alt={viewMedicine.name} 
                                        className="w-32 h-32 rounded-xl object-cover border border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <Package size={48} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">{viewMedicine.name}</h3>
                                <p className="text-sm text-gray-500">Generic: {viewMedicine.generic_name || '---'}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${viewMedicine.status === 'active' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {viewMedicine.status || 'Unknown'}
                                    </span>
                                    {viewMedicine.category && (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                            {viewMedicine.category.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Generic Name</label><p className="text-sm text-gray-600">{viewMedicine.generic_name || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Barcode</label><p className="text-sm font-mono text-gray-600">{viewMedicine.barcode || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Batch Number</label><p className="text-sm text-gray-600">{viewMedicine.batch_number || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Supplier</label><p className="text-sm text-gray-600">{viewMedicine.supplier?.name || 'No Supplier'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Manufacturer</label><p className="text-sm text-gray-600">{viewMedicine.manufacturer || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Shelf Location</label><p className="text-sm text-gray-600">{viewMedicine.shelf_location || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label><p className="text-sm font-medium text-gray-800">{viewMedicine.quantity}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Reorder Level</label><p className="text-sm text-gray-600">{viewMedicine.reorder_level}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Unit Price</label><p className="text-sm text-gray-600">{viewMedicine.unit_price ? `$${Number(viewMedicine.unit_price).toFixed(2)}` : '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Selling Price</label><p className="text-sm text-gray-600">{viewMedicine.selling_price ? `$${Number(viewMedicine.selling_price).toFixed(2)}` : '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Expiry Date</label><p className="text-sm text-gray-600">{viewMedicine.expiry_date ? new Date(viewMedicine.expiry_date).toLocaleDateString() : '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Status</label><div className="mt-1">{getStatusBadge(viewMedicine.status)}</div></div>
                            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1">Description</label><p className="text-sm text-gray-600">{viewMedicine.description || '---'}</p></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-sky-100">
                            <button onClick={() => setShowViewModal(false)} className="btn-secondary">Close</button>
                            {isAdmin && (
                                <button onClick={() => { setShowViewModal(false); openEdit(viewMedicine); }} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                                    <Edit size={16} /> Edit Medicine
                                </button>
                            )}
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
}