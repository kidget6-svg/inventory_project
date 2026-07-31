import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit, Trash2 } from 'lucide-react';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = () => {
        api.get('/categories')
            .then(r => setCategories(r.data))
            .catch(err => {
                console.error(err);
                setError('Failed to load categories');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => { setForm({ name: '', description: '' }); setEditId(null); setShowForm(true); setError(''); };
    const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditId(c.id); setShowForm(true); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                await api.put(`/categories/${editId}`, form);
                window.showToast('Category updated successfully', 'success');
            } else {
                await api.post('/categories', form);
                window.showToast('Category created successfully', 'success');
            }
            setShowForm(false);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving category');
        }
    };

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-700">All Categories ({categories.length})</h3>
                <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm">+ Add Category</button>
            </div>

            {showForm && (
                <div className="card p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">{editId ? 'Edit Category' : 'Add Category'}</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label><input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Description</label><input name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" /></div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
                        </div>
                    </form>
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
        </div>
    );
}
