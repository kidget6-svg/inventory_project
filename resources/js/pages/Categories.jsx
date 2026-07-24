import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [error, setError] = useState('');

    const load = () => api.get('/categories').then(r => setCategories(r.data));
    useEffect(() => { load(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => { setForm({ name: '', description: '' }); setEditId(null); setShowForm(true); setError(''); };
    const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditId(c.id); setShowForm(true); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) { await api.put(`/categories/${editId}`, form); }
            else { await api.post('/categories', form); }
            setShowForm(false);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving category');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        await api.delete(`/categories/${id}`);
        load();
    };

    return (
        <SidebarLayout pageTitle="Categories">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">All Categories ({categories.length})</h3>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">+ Add Category</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <h4 className="font-semibold text-gray-700 mb-3">{editId ? 'Edit Category' : 'Add Category'}</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label><input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Description</label><input name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div className="md:col-span-2 flex gap-3"><button type="submit" className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">{editId ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button></div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{c.description || '---'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <button onClick={() => openEdit(c)} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 mr-2">Edit</button>
                                    <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-400">No categories found</td></tr>}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
