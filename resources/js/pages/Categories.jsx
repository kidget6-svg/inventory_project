import React, { useState, useEffect } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye, Edit, Trash2, Plus, Save, X, Calendar, Tag } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [modalItem, setModalItem] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        api.get('/categories', { params: { page } })
            .then(r => { setCategories(r.data.data || r.data); setMeta(r.data.meta || null); })
            .catch(err => { console.error(err); setError('Failed to load categories'); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [page]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            window.showToast('Category deleted successfully', 'success');
            load();
        } catch (err) {
            window.showToast('Failed to delete category', 'error');
        }
    };

    const openCreate = () => {
        setModalMode('create');
        setModalItem(null);
        setForm({ name: '', description: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (item) => {
        setModalMode('edit');
        setModalItem(item);
        setForm({ name: item.name, description: item.description || '' });
        setError('');
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
        setForm({ name: '', description: '' });
        setError('');
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving category');
        } finally {
            setSubmitting(false);
        }
    };

    const isViewMode = modalMode === 'view';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-700">All Categories ({categories.length})</h3>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={16} />
                    New Category
                </button>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading categories..." />
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-sky-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(c => (
                                <tr key={c.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                    <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{c.description || '---'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openView(c)}
                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
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
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-400">No categories found</td></tr>}
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
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

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
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <input
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? <><Tag size={16} className="animate-spin" /> Saving... </> : <><Save size={16} /> {modalMode === 'create' ? 'Create Category' : 'Update Category'}</>}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
