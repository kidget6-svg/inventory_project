import React, { useState, useEffect } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye, Edit, Trash2, Plus, Save, X, Calendar, Tag, Package } from 'lucide-react';
import Pagination from '../components/Pagination';

    export default function Categories() {
        const [categories, setCategories] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');
        const [meta, setMeta] = useState(null);
        const [page, setPage] = useState(1);
        const [userRole, setUserRole] = useState(null);
        const [canWrite, setCanWrite] = useState(false);

        // Modal state
        const [showModal, setShowModal] = useState(false);
        const [modalMode, setModalMode] = useState('create');
        const [modalItem, setModalItem] = useState(null);
        const [form, setForm] = useState({ name: '', description: '', shelf_location: '' });
        const [submitting, setSubmitting] = useState(false);
        const [validationErrors, setValidationErrors] = useState({});

        // Get current user role
        useEffect(() => {
            const getUser = async () => {
                try {
                    const response = await api.get('/user');
                    const role = response.data.role;
                    setUserRole(role);
                    setCanWrite(role === 'admin' || role === 'pharmacist');
                } catch (err) {
                    console.error('Failed to get user role:', err);
                }
            };
            getUser();
        }, []);

        const load = () => {
            setLoading(true);
            setError('');
            api.get('/categories', { params: { page } })
                .then(r => {
                    setCategories(r.data.data || r.data);
                    setMeta(r.data);
                })
                .catch(err => {
                    console.error(err);
                    setError('Failed to load categories: ' + (err.response?.data?.error || err.message));
                })
                .finally(() => setLoading(false));
        };

        useEffect(() => { load(); }, [page]);

        const handleDelete = async (id) => {
            if (!canWrite) {
                window.showToast('Only admins and pharmacists can delete categories', 'error');
                return;
            }
            if (!confirm('Delete this category? Deletion will be blocked if it has associated medicines.')) return;
            try {
                await api.delete(`/categories/${id}`);
                window.showToast('Category deleted successfully', 'success');
                load();
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete category';
                window.showToast(errorMsg, 'error');
                console.error('Delete error:', err.response?.data);
            }
        };

        const openCreate = () => {
            if (!canWrite) {
                window.showToast('Only admins and pharmacists can create categories', 'error');
                return;
            }
            setModalMode('create');
            setModalItem(null);
            setForm({ name: '', description: '', shelf_location: '' });
            setError('');
            setValidationErrors({});
            setShowModal(true);
        };

        const openEdit = (item) => {
            if (!canWrite) {
                window.showToast('Only admins and pharmacists can edit categories', 'error');
                return;
            }
            setModalMode('edit');
            setModalItem(item);
            setForm({
                name: item.name,
                description: item.description || '',
                shelf_location: item.shelf_location || ''
            });
            setError('');
            setValidationErrors({});
            setShowModal(true);
        };

        const openView = (item) => {
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
                if (modalMode === 'create') {
                    await api.post('/categories', form);
                    window.showToast('Category created successfully', 'success');
                } else {
                    await api.put(`/categories/${modalItem.id}`, form);
                    window.showToast('Category updated successfully', 'success');
                }
                setShowModal(false);
                load();
            } catch (err) {
                console.error('Save error:', err);

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
                    const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Error saving category';
                    setError(errorMsg);
                    window.showToast(errorMsg, 'error');
                }
            } finally {
                setSubmitting(false);
            }
        };

        const isViewMode = modalMode === 'view';

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-700">
                        All Categories ({categories.length})
                        {userRole && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                                ({userRole === 'admin' ? 'Admin - Full Access' : userRole === 'pharmacist' ? 'Pharmacist - Edit Access' : 'Cashier - View Only'})
                            </span>
                        )}
                    </h3>
                    {canWrite && (
                        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                            <Plus size={16} />
                            New Category
                        </button>
                    )}
                </div>

                {error && !showModal && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                        {error}
                        <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600">×</button>
                    </div>
                )}

                {loading ? (
                    <LoadingSpinner text="Loading categories..." />
                ) : (
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-sky-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Shelf Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Medicines</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(c => (
                                    <tr key={c.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                        <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{c.description || '---'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{c.shelf_location || '---'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                                                {c.medicines_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openView(c)}
                                                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {canWrite && (
                                                    <>
                                                        <button
                                                            onClick={() => openEdit(c)}
                                                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(c.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title={c.medicines_count > 0 ? 'Cannot delete: has medicines' : 'Delete'}
                                                            disabled={c.medicines_count > 0}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                            No categories found
                                            {canWrite && (
                                                <button onClick={openCreate} className="ml-2 text-sky-600 hover:underline text-sm font-medium">
                                                    Create one
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination meta={meta} onPageChange={(p) => setPage(p)} />

                <Modal
                    open={showModal}
                    onClose={closeModal}
                    title={modalMode === 'create' ? 'Add New Category' : modalMode === 'edit' ? 'Edit Category' : 'Category Details'}
                    size="max-w-lg"
                >
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                            {error}
                        </div>
                    )}

                    {isViewMode && modalItem ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                                <p className="text-sm font-medium text-gray-800">{modalItem.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                                <p className="text-sm text-gray-600">{modalItem.description || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Shelf Location</label>
                                <p className="text-sm text-gray-600">{modalItem.shelf_location || '---'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Medicines Count</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Package size={14} />
                                    {modalItem.medicines_count || 0} medicine(s)
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Created</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {modalItem.created_at ? new Date(modalItem.created_at).toLocaleDateString() : '---'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Last Updated</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {modalItem.updated_at ? new Date(modalItem.updated_at).toLocaleDateString() : '---'}
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={closeModal} className="btn-secondary">Close</button>
                                {canWrite && (
                                    <button
                                        onClick={() => { closeModal(); openEdit(modalItem); }}
                                        className="btn-primary"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
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
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                                <input
                                    name="shelf_location"
                                    value={form.shelf_location}
                                    onChange={handleChange}
                                    placeholder="e.g. A-2-3"
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                        validationErrors.shelf_location ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                                    }`}
                                />
                                {validationErrors.shelf_location && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.shelf_location[0]}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <><Tag size={16} className="animate-spin" /> Saving... </>
                                    ) : (
                                        <><Save size={16} /> {modalMode === 'create' ? 'Create Category' : 'Update Category'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div>
        );
    }
