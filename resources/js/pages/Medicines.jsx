 import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import {
    Search, Eye, Edit, Trash2, X, Save, Package, Tag,
    Barcode, Camera, Loader2, Plus, Upload, Image as ImageIcon,
    Printer, FileText,
} from 'lucide-react';

const dosageForms = ['', 'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'powder', 'gel'];

const strengths = ['', '5 mg', '10 mg', '25 mg', '50 mg', '100 mg', '200 mg', '250 mg', '500 mg', '1 g', '2 g', '5 mg/ml', '10 mg/5 ml', '20 mg/5 ml', '40 mg/5 ml', '1%', '2.5%', '5%', '10%'];

const units = ['', 'tablet', 'capsule', 'bottle', 'box', 'packet', 'tube', 'vial', 'ampoule', 'sachet', 'bottle (5 ml)', 'bottle (15 ml)', 'bottle (30 ml)'];

export default function Medicines() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';
    const canManage = user?.permissions?.includes('medicines.manage') || user?.permissions?.includes('*');

    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [shelves, setShelves] = useState([]);
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
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    const [form, setForm] = useState({
        name: '',
        generic_name: '',
        barcode: '',
        category_id: '',
        supplier_id: '',
        shelf_id: '',
        prescription: false,
        prescription_details: '',
        dosage_form: '',
        strength: '',
        unit: '',
        shelf_location: '',
    });

    const [filters, setFilters] = useState({
        search: '',
        barcode: '',
        category_id: '',
        prescription: '',
    });

    const [searchTimeout, setSearchTimeout] = useState(null);

    const loadMedicines = () => {
        setLoading(true);
        const params = { page };
        if (filters.search) params.search = filters.search;
        if (filters.barcode) params.barcode = filters.barcode;
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.prescription !== '') params.prescription = filters.prescription;

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

    const loadShelves = () => {
        api.get('/shelves')
            .then(r => setShelves(Array.isArray(r.data) ? r.data : []))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadCategories();
        loadSuppliers();
        loadShelves();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [filters.search, filters.barcode, filters.category_id, filters.prescription]);

    useEffect(() => {
        loadMedicines();
    }, [filters, page]);

    const handlePageChange = (p) => setPage(p);
    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => {}, 300));
    };

    const resetFilters = () => setFilters({
        search: '', barcode: '', category_id: '', prescription: '',
    });

    const resetForm = () => {
        setForm({
            name: '', generic_name: '', barcode: '',
            category_id: '', supplier_id: '', shelf_id: '',
            prescription: false, prescription_details: '', dosage_form: '', strength: '', unit: '',
            shelf_location: '',
        });
        setEditId(null);
        setError('');
        setImagePreview(null);
        setImageFile(null);
        setRemoveImage(false);
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (m) => {
        setForm({
            name: m.name || '',
            generic_name: m.generic_name || '',
            barcode: m.barcode || '',
            category_id: m.category_id || '',
            supplier_id: m.supplier_id || '',
            shelf_id: m.shelf_id || '',
            prescription: m.prescription || false,
            prescription_details: m.prescription_details || '',
            dosage_form: m.dosage_form || '',
            strength: m.strength || '',
            unit: m.unit || '',
            shelf_location: m.shelf_location || '',
        });
        setEditId(m.id);
        setShowModal(true);
        setError('');
        setImagePreview(m.image_url || null);
        setImageFile(null);
        setRemoveImage(false);
    };

    const openView = (m) => {
        setViewMedicine(m);
        setShowViewModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                window.showToast('Image size must be less than 2MB', 'error');
                return;
            }
            setImageFile(file);
            setRemoveImage(false);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImageHandler = () => {
        setImagePreview(null);
        setImageFile(null);
        setRemoveImage(true);
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
                if (key === 'prescription') {
                    formData.append(key, form[key] ? '1' : '0');
                } else {
                    formData.append(key, form[key]);
                }
            }
        });

        if (removeImage) {
            formData.append('delete_image', '1');
        }

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
            if (err.response?.status === 422 && msgs) {
                window.showToast(Object.values(msgs).flat()[0], 'error');
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

    useEffect(() => { return () => stopBarcodeScan(); }, []);

    const getPrescriptionBadge = (val) => {
        const isPrescription = val;
        return isPrescription
            ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Prescription Required</span>
            : <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Over-the-Counter</span>;
    };

    const isFiltered = filters.search || filters.barcode || filters.category_id || filters.prescription !== '';

    return (
        <>
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by name, generic name, dosage form, or strength..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                        <Barcode className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="barcode"
                            placeholder="Scan or enter barcode"
                            value={filters.barcode}
                            onChange={handleFilterChange}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-mono"
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
                    <button
                        onClick={resetFilters}
                        disabled={!isFiltered}
                        className="btn-secondary px-4 py-2 text-sm rounded-xl disabled:opacity-50"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">
                    All Medicines ({medicines.length})
                </h3>
                {canManage && (
                    <button
                        onClick={openCreate}
                        className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Add New Medicine
                    </button>
                )}
            </div>

            {loading ? <LoadingSpinner text="Loading medicines..." /> : (
                <>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <colgroup>
                                    <col className="w-[24%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[8%]" />
                                    <col className="w-[18%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-sky-50 border-b border-sky-100">
                                        <th className="table-header">Medicine</th>
                                        <th className="table-header">Category</th>
                                        <th className="table-header">Form</th>
                                        <th className="table-header">Strength</th>
                                        <th className="table-header">Unit</th>
                                        <th className="table-header">Barcode</th>
                                        <th className="table-header">Prescription</th>
                                        <th className="table-header">Image</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.length > 0 ? medicines.map(m => (
                                        <tr key={m.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                {m.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 truncate">{m.category?.name || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.dosage_form || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.strength || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{m.unit || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">{m.barcode || '—'}</td>
                                            <td className="px-4 py-3">{getPrescriptionBadge(m.prescription)}</td>
                                            <td className="px-4 py-3">
                                                {m.image_url ? (
                                                    <img
                                                        src={m.image_url}
                                                        alt={m.name}
                                                        className="w-8 h-8 rounded-lg object-cover border border-gray-200 bg-gray-50"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/medicine-placeholder.svg';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No image</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => openView(m)}
                                                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {canManage && (
                                                        <>
                                                            <button
                                                                onClick={() => openEdit(m)}
                                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
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
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                                                No medicines found
                                                {isFiltered && (
                                                    <button
                                                        onClick={resetFilters}
                                                        className="ml-2 text-sky-600 hover:underline text-sm font-medium"
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
                    <Pagination meta={meta} onPageChange={handlePageChange} />
                </>
            )}

            {/* ── Create / Edit Modal ── */}
            {canManage && (
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    title={editId ? 'Edit Medicine' : 'Add New Medicine'}
                    size="max-w-3xl"
                >
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        className="space-y-5"
                    >
                        {/* ── Basic Info ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Medicine Identification *
                                </label>
                                <p className="text-xs text-gray-400 mb-2">
                                    This will display as: {form.name || 'Medicine Name'} - {form.dosage_form || 'Form'} - {form.strength || 'Strength'} - {form.unit || 'Unit'}
                                </p>
                            </div>

                            {/* Barcode field with scanner */}
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
                                            placeholder="Scan or type barcode (optional)"
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
                                        <video
                                            ref={videoRef}
                                            className="w-full max-w-xs rounded-lg border-2 border-sky-400"
                                            autoPlay
                                            playsInline
                                        />
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

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Medicine Name *
                                </label>
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
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Generic Name
                                </label>
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
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Dosage Form *
                                </label>
                                <select
                                    name="dosage_form"
                                    value={form.dosage_form}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                    required
                                >
                                    <option value="">Select Form</option>
                                    {dosageForms.map(f => (
                                        <option key={f || 'empty'} value={f}>
                                            {f || 'Other'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Strength *
                                </label>
                                <select
                                    name="strength"
                                    value={form.strength}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                    required
                                >
                                    <option value="">Select Strength</option>
                                    {strengths.map(s => (
                                        <option key={s || 'empty'} value={s}>
                                            {s || 'Other'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
>>>>>>>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="prescription"
                                        checked={form.prescription}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setForm(prev => ({
                                                ...prev,
                                                prescription: checked,
                                                prescription_details: checked ? prev.prescription_details : '',
                                            }));
                                        }}
                                        className="w-4 h-4 text-sky-500 focus:ring-sky-400 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Prescription Required</span>
                                </label>
                            </div>

                            {form.prescription && (
                                <div className="md:col-span-2 mt-3">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Prescription Details
                                    </label>
                                    <textarea
                                        name="prescription_details"
                                        value={form.prescription_details}
                                        onChange={handleChange}
                                        placeholder="Enter prescription instructions or information for this medicine..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none resize-y"
                                    />
                                </div>
                            )}
                        </div>

                        {/* ── Image Upload ── */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Medicine Image
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="text-gray-300" size={32} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        JPG, PNG, WebP up to 2 MB
                                    </p>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={removeImageHandler}
                                            className="mt-2 text-xs text-red-600 hover:underline flex items-center gap-1"
                                        >
                                            <X size={12} /> Remove image
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Form Actions ── */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
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
                </Modal>
            )}

            {/* ── View Modal ── */}
            <Modal
                open={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Medicine Details"
                size="max-w-3xl"
            >
                {viewMedicine && (
                    <>
                        <div className="flex gap-6 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex-shrink-0">
                                {viewMedicine.image_url ? (
                                    <img
                                        src={viewMedicine.image_url}
                                        alt={viewMedicine.name}
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
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                    {viewMedicine.identification || viewMedicine.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                    Generic: {viewMedicine.generic_name || '—'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {getPrescriptionBadge(viewMedicine.prescription)}
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                        {viewMedicine.category?.name || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine Name</label>
                                <p className="text-sm font-medium text-gray-800">{viewMedicine.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Dosage Form</label>
                                <p className="text-sm text-gray-600">{viewMedicine.dosage_form || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Strength</label>
                                <p className="text-sm text-gray-600">{viewMedicine.strength || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Unit</label>
                                <p className="text-sm text-gray-600">{viewMedicine.unit || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Barcode</label>
                                <p className="text-sm font-mono text-gray-600">{viewMedicine.barcode || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                                <p className="text-sm text-gray-600">{viewMedicine.category?.name || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Generic Name</label>
                                <p className="text-sm text-gray-600">{viewMedicine.generic_name || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Batch Number</label>
                                <p className="text-sm text-gray-600">{viewMedicine.batch_number || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Manufacturer</label>
                                <p className="text-sm text-gray-600">{viewMedicine.manufacturer || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Shelf Location</label>
                                <p className="text-sm text-gray-600">{viewMedicine.shelf_location || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Supplier</label>
                                <p className="text-sm text-gray-600">{viewMedicine.supplier?.name || 'No Supplier'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Prescription</label>
                                <p className="text-sm text-gray-600">{viewMedicine.getPrescriptionLabel?.() || (viewMedicine.prescription ? 'Prescription Required' : 'Over-the-Counter')}</p>
                            </div>
                            {viewMedicine.prescription && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Prescription Details</label>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewMedicine.prescription_details || '—'}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Created</label>
                                <p className="text-sm text-gray-600">
                                    {viewMedicine.created_at ? new Date(viewMedicine.created_at).toLocaleDateString() : '—'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Last Updated</label>
                                <p className="text-sm text-gray-600">
                                    {viewMedicine.updated_at ? new Date(viewMedicine.updated_at).toLocaleDateString() : '—'}
                                </p>
                            </div>

                            {canManage && (
                                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const r = await api.get(`/medicines/${viewMedicine.id}/barcode-label`);
                                                const { medicine, barcode_value } = r.data;
                                                const printContent = `
                                                    <html>
                                                    <head><title>Barcode Label - ${medicine.name}</title></head>
                                                    <body style="font-family: sans-serif; padding: 20px;">
                                                        <h3>${medicine.name} - ${medicine.dosage_form} - ${medicine.strength} - ${medicine.unit}</h3>
                                                        <p><strong>Barcode:</strong> ${barcode_value}</p>
                                                        <p><strong>Category:</strong> ${medicine.category?.name || '—'}</p>
                                                    </body>
                                                    </html>
                                                `;
                                                const w = window.open('', '_blank');
                                                w.document.write(printContent);
                                                w.document.close();
                                                w.print();
                                            } catch (err) {
                                                window.showToast('Failed to generate barcode label', 'error');
                                            }
                                        }}
                                        className="px-4 py-2 border border-sky-200 text-sky-700 rounded-lg text-sm font-semibold hover:bg-sky-50 flex items-center gap-2"
                                    >
                                        <Printer size={16} /> Print Barcode Label
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <X size={16} /> Close
                            </button>
                            {canManage && (
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        openEdit(viewMedicine);
                                    }}
                                    className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                                >
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
