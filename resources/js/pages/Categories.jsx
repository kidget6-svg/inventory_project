// resources/js/pages/Categories.jsx

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit, Trash2, Plus, Search } from 'lucide-react';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', shelf_location: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = () => {
        setLoading(true);
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

    const openCreate = () => {
        setForm({ name: '', description: '', shelf_location: '' });
        setEditId(null);
        setShowForm(true);
        setError('');
    };

    const openEdit = (c) => {
        setForm({ name: c.name, description: c.description || '', shelf_location: c.shelf_location || '' });
        setEditId(c.id);
        setShowForm(true);
        setError('');
    };

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
        if (!confirm('Delete this category? This will also remove the category from all medicines.')) return;
        try {
            await api.delete(`/categories/${id}`);
            window.showToast('Category deleted successfully', 'success');
            load();
        } catch (err) {
            window.showToast('Failed to delete category', 'error');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                    <p className="text-sm text-gray-500">Manage your medicine categories</p>
                </div>
                <button
                    onClick={openCreate}
                    className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                />
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-700 mb-4">
                        {editId ? 'Edit Category' : 'Add New Category'}
                    </h4>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Category Name *
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                                placeholder="e.g. Antibiotics"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Shelf Location
                            </label>
                            <input
                                name="shelf_location"
                                value={form.shelf_location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder="e.g. A-1-B"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Description
                            </label>
                            <input
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder="Category description"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                {editId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <LoadingSpinner text="Loading categories..." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                        Shelf Location
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                        Medicines
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map(c => (
                                    <tr key={c.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            {c.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {c.shelf_location || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {c.description || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                {c.medicines_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(c)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                                {filteredCategories.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                            {search ? 'No categories match your search' : 'No categories found. Create your first category!'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}