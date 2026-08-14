import React, { useState, useEffect } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { 
    Eye, Edit, Trash2, Plus, Save, X, Calendar, Tag, 
    Package, Layers, BarChart3, AlertCircle, CheckCircle, Search
} from 'lucide-react';

const TABS = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'shelves', label: 'Shelves', icon: Layers },
];

export default function Categories() {
    const { user, hasPermission } = useAuth();
    const canCreate = hasPermission('categories.create');
    const canEdit = hasPermission('categories.edit');
    const canDelete = hasPermission('categories.delete');
    const canWrite = canCreate || canEdit || canDelete;
    const [activeTab, setActiveTab] = useState('categories');
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [allShelves, setAllShelves] = useState([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [loadingShelves, setLoadingShelves] = useState(false);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalItem, setModalItem] = useState(null);
    const [modalType, setModalType] = useState('category');
    const [form, setForm] = useState({ 
        name: '', 
        description: '', 
        shelf_location: '',
        capacity: 100
    });
    const [submitting, setSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Load all shelves for dropdown
    const loadAllShelves = async () => {
        try {
            const response = await api.get('/shelves', { params: { per_page: -1 } });
            let data = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                data = response.data.data;
            }
            setAllShelves(data);
        } catch (err) {
            console.error('Failed to load shelves for dropdown:', err);
            setAllShelves([]);
        }
    };

    const loadCategories = () => {
        setLoading(true);
        setError('');
        api.get('/categories', { params: { page, search: searchTerm, per_page: 15 } })
            .then(r => { 
                let data = [];
                let metaData = null;
                
                if (Array.isArray(r.data)) {
                    data = r.data;
                } else if (r.data && r.data.data && Array.isArray(r.data.data)) {
                    data = r.data.data;
                    metaData = r.data.meta || r.data;
                } else if (r.data && r.data.categories && Array.isArray(r.data.categories)) {
                    data = r.data.categories;
                    metaData = r.data;
                } else {
                    console.warn('Unexpected categories response:', r.data);
                }
                setCategories(data);
                setMeta(metaData);
            })
            .catch(err => { 
                console.error(err); 
                setError('Failed to load categories');
                setCategories([]);
            })
            .finally(() => setLoading(false));
    };

    const loadShelves = () => {
        setLoading(true);
        setError('');
        api.get('/shelves', { params: { search: searchTerm, per_page: 15 } })
            .then(r => { 
                let data = [];
                let metaData = null;
                
                if (Array.isArray(r.data)) {
                    data = r.data;
                } else if (r.data && r.data.data && Array.isArray(r.data.data)) {
                    data = r.data.data;
                    metaData = r.data.meta || r.data;
                } else if (r.data && r.data.shelves && Array.isArray(r.data.shelves)) {
                    data = r.data.shelves;
                    metaData = r.data;
                } else {
                    console.warn('Unexpected shelves response:', r.data);
                }
                setShelves(data);
                setMeta(metaData);
            })
            .catch(err => { 
                console.error(err); 
                setError('Failed to load shelves');
                setShelves([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { 
        loadAllShelves(); // Load all shelves for dropdown
        if (activeTab === 'categories') {
            loadCategories(); 
        } else {
            loadShelves();
        }
    }, [page, activeTab, searchTerm]);

    const handleDeleteCategory = async (id) => {
        if (!canWrite) {
            window.showToast('Only admins and pharmacists can delete categories', 'error');
            return;
        }
        if (!confirm('Delete this category? This will not delete associated medicines.')) return;
        try {
            await api.delete(`/categories/${id}`);
            window.showToast('Category deleted successfully', 'success');
            loadCategories();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete category';
            window.showToast(errorMsg, 'error');
        }
    };

    const handleDeleteShelf = async (id) => {
        if (!canWrite) {
            window.showToast('Only admins and pharmacists can delete shelves', 'error');
            return;
        }
        if (!confirm('Delete this shelf? This will not delete associated medicines.')) return;
        try {
            await api.delete(`/shelves/${id}`);
            window.showToast('Shelf deleted successfully', 'success');
            loadShelves();
            loadAllShelves(); // Refresh dropdown list
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete shelf';
            window.showToast(errorMsg, 'error');
        }
    };

    const openCreate = (type) => {
        if (!canWrite) {
            window.showToast('Only admins and pharmacists can create', 'error');
            return;
        }
        setModalType(type);
        setModalMode('create');
        setModalItem(null);
        setForm(type === 'category' 
            ? { name: '', description: '', shelf_location: '' }
            : { shelf_location: '', description: '', capacity: 100 }
        );
        setError('');
        setValidationErrors({});
        setShowModal(true);
    };

    const openEdit = (item, type) => {
        if (!canWrite) {
            window.showToast('Only admins and pharmacists can edit', 'error');
            return;
        }
        setModalType(type);
        setModalMode('edit');
        setModalItem(item);
        setForm(type === 'category'
            ? { 
                name: item.name, 
                description: item.description || '', 
                shelf_location: item.shelf_location || '' 
            }
            : {
                shelf_location: item.shelf_location || '',
                description: item.description || '',
                capacity: item.capacity || 100
            }
        );
        setError('');
        setValidationErrors({});
        setShowModal(true);
    };

    const openView = (item, type) => {
        setModalType(type);
        setModalMode('view');
        setModalItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalItem(null);
        setForm({ name: '', description: '', shelf_location: '' });
        setError('');
        setValidationErrors({});
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});
        setSubmitting(true);
        
        try {
            const endpoint = modalType === 'category' ? '/categories' : '/shelves';
            let payload;
            
            if (modalType === 'category') {
                payload = { 
                    name: form.name, 
                    description: form.description, 
                    shelf_location: form.shelf_location 
                };
            } else {
                const capacity = parseInt(form.capacity) || 100;
                payload = {
                    shelf_location: form.shelf_location,
                    description: form.description || '',
                    capacity: capacity
                };
            }

            if (modalMode === 'create') {
                await api.post(endpoint, payload);
                window.showToast(`${modalType === 'category' ? 'Category' : 'Shelf'} created successfully`, 'success');
            } else {
                await api.put(`${endpoint}/${modalItem.id}`, payload);
                window.showToast(`${modalType === 'category' ? 'Category' : 'Shelf'} updated successfully`, 'success');
            }
            setShowModal(false);
            
            if (modalType === 'category') {
                loadCategories();
                loadAllShelves();
            } else {
                loadShelves();
                loadAllShelves();
            }
        } catch (err) {
            console.error('Save error:', err);
            console.error('Error response:', err.response?.data);
            
            if (err.response?.status === 403) {
                window.showToast('You do not have permission to perform this action', 'error');
            } else if (err.response?.status === 422) {
                const errors = err.response?.data?.errors;
                if (errors) {
                    setValidationErrors(errors);
                    const firstError = Object.values(errors).flat()[0];
                    window.showToast(firstError, 'error');
                }
                setError('Please fix the validation errors');
            } else {
                const errorMsg = err.response?.data?.message || `Error saving ${modalType}`;
                setError(errorMsg);
                window.showToast(errorMsg, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getProgressColor = (percent) => {
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-amber-500';
        if (percent >= 50) return 'bg-yellow-500';
        return 'bg-sky-500';
    };

    const getProgressTextColor = (percent) => {
        if (percent >= 90) return 'text-red-600';
        if (percent >= 70) return 'text-amber-600';
        if (percent >= 50) return 'text-yellow-600';
        return 'text-sky-600';
    };

    const getShelfStatus = (shelf) => {
        const totalItems = shelf.medicines_count || 0;
        const capacity = shelf.capacity || 100;
        const percent = Math.min(100, Math.round((totalItems / capacity) * 100));
        
        if (percent >= 100) {
            return { label: 'Full', icon: AlertCircle, className: 'bg-red-100 text-red-700' };
        }
        if (percent >= 80) {
            return { label: 'Nearly Full', icon: AlertCircle, className: 'bg-amber-100 text-amber-700' };
        }
        return { label: 'Available', icon: CheckCircle, className: 'bg-green-100 text-green-700' };
    };

    const renderCategoriesTab = () => (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-sky-50 border-b border-sky-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Category Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Shelf Location</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Medicines</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? categories.map(cat => (
                            <tr key={cat.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-sky-500" />
                                        {cat.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {cat.description || '---'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {cat.shelf_location || '---'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                                        {cat.medicines_count ?? 0}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openView(cat, 'category')}
                                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                            title="View"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {canWrite && (
                                            <>
                                                <button
                                                    onClick={() => openEdit(cat, 'category')}
                                                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
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
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                    No categories found
                                    {canWrite && (
                                        <button
                                            onClick={() => openCreate('category')}
                                            className="ml-2 text-sky-600 hover:underline text-sm font-medium"
                                        >
                                            Create one
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderShelvesTab = () => (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-sky-50 border-b border-sky-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Shelf Location</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Capacity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Progress</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shelves.length > 0 ? shelves.map(shelf => {
                            const totalItems = shelf.medicines_count || 0;
                            const capacity = shelf.capacity || 100;
                            const percent = Math.min(100, Math.round((totalItems / capacity) * 100));
                            const progressColor = getProgressColor(percent);
                            const textColor = getProgressTextColor(percent);
                            const status = getShelfStatus(shelf);
                            const StatusIcon = status.icon;
                            
                            return (
                                <tr key={shelf.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-sky-500" />
                                            {shelf.shelf_location}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {shelf.description || '---'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {shelf.capacity || 100}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1 min-w-[150px]">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">{totalItems} / {capacity}</span>
                                                <span className={`font-semibold ${textColor}`}>{percent}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status.className}`}>
                                            <StatusIcon size={12} />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => openView(shelf, 'shelf')}
                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {canWrite && (
                                                <>
                                                    <button
                                                        onClick={() => openEdit(shelf, 'shelf')}
                                                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteShelf(shelf.id)}
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
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                    No shelves found
                                    {canWrite && (
                                        <button
                                            onClick={() => openCreate('shelf')}
                                            className="ml-2 text-sky-600 hover:underline text-sm font-medium"
                                        >
                                            Create one
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading && categories.length === 0 && shelves.length === 0) {
        return <LoadingSpinner text="Loading..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Categories & Shelves</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {activeTab === 'categories' 
                            ? 'Manage product categories and their shelf locations'
                            : 'Monitor shelf utilization and capacity'}
                    </p>
                </div>
                {canWrite && (
                    <button
                        onClick={() => openCreate(activeTab === 'categories' ? 'category' : 'shelf')}
                        className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> 
                        Add {activeTab === 'categories' ? 'Category' : 'Shelf'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${
                                isActive
                                    ? 'bg-sky-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                            {tab.id === 'categories' && categories.length > 0 && (
                                <span className={`ml-1 text-xs ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                    ({categories.length})
                                </span>
                            )}
                            {tab.id === 'shelves' && shelves.length > 0 && (
                                <span className={`ml-1 text-xs ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                    ({shelves.length})
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={activeTab === 'categories' ? 'Search categories...' : 'Search shelves...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'categories' ? renderCategoriesTab() : renderShelvesTab()}

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            )}

            {/* Create/Edit Modal */}
            <Modal
                open={showModal}
                onClose={closeModal}
                title={modalMode === 'create' 
                    ? `Add New ${modalType === 'category' ? 'Category' : 'Shelf'}`
                    : modalMode === 'edit'
                        ? `Edit ${modalType === 'category' ? 'Category' : 'Shelf'}`
                        : `${modalType === 'category' ? 'Category' : 'Shelf'} Details`
                }
                size="max-w-lg"
            >
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                        {error}
                    </div>
                )}

                {modalMode === 'view' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                {modalType === 'category' ? 'Category Name' : 'Shelf Location'}
                            </label>
                            <p className="text-sm font-medium text-gray-800">
                                {modalType === 'category' ? modalItem?.name : modalItem?.shelf_location}
                            </p>
                        </div>
                        {modalType === 'shelf' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Capacity</label>
                                <p className="text-sm text-gray-600">{modalItem?.capacity || 100}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                            <p className="text-sm text-gray-600">{modalItem?.description || '---'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Created</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                {modalItem?.created_at ? new Date(modalItem.created_at).toLocaleDateString() : '---'}
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={closeModal} className="btn-secondary">Close</button>
                            {canWrite && (
                                <button 
                                    onClick={() => {
                                        closeModal();
                                        openEdit(modalItem, modalType);
                                    }} 
                                    className="btn-primary"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category fields */}
                        {modalType === 'category' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category Name *</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                            validationErrors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {validationErrors.name && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.name[0]}</p>
                                    )}
                                </div>
                                
                                {/* Shelf Location Dropdown for Categories */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                                    <select
                                        name="shelf_location"
                                        value={form.shelf_location}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
                                    >
                                        <option value="">Select Shelf</option>
                                        {allShelves.length > 0 ? (
                                            allShelves.map(shelf => (
                                                <option key={shelf.id} value={shelf.shelf_location}>
                                                    {shelf.shelf_location} (Capacity: {shelf.capacity || 100})
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No shelves available</option>
                                        )}
                                    </select>
                                    {validationErrors.shelf_location && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.shelf_location[0]}</p>
                                    )}
                                    {allShelves.length === 0 && (
                                        <p className="text-xs text-amber-500 mt-1">
                                            No shelves found. Please create a shelf first.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Shelf fields */}
                        {modalType === 'shelf' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location *</label>
                                    <input
                                        name="shelf_location"
                                        value={form.shelf_location}
                                        onChange={handleChange}
                                        placeholder="e.g. A-2-3"
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                            validationErrors.shelf_location ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {validationErrors.shelf_location && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.shelf_location[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Capacity *</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={form.capacity}
                                        onChange={handleChange}
                                        min="1"
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                            validationErrors.capacity ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {validationErrors.capacity && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.capacity[0]}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Description - common for both */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                    validationErrors.description ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                                }`}
                            />
                            {validationErrors.description && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.description[0]}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><Save size={16} /> {modalMode === 'create' ? `Create ${modalType === 'category' ? 'Category' : 'Shelf'}` : `Update ${modalType === 'category' ? 'Category' : 'Shelf'}`}</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}