import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', generic_name: '', batch_number: '', category_id: '', quantity: '', unit_price: '', reorder_level: '', expiry_date: '' });
    const [error, setError] = useState('');

    const load = () => api.get('/medicines').then(r => setMedicines(r.data));
    const loadCategories = () => api.get('/categories').then(r => setCategories(r.data));

    useEffect(() => { load(); loadCategories(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => { setForm({ name: '', generic_name: '', batch_number: '', category_id: '', quantity: '', unit_price: '', reorder_level: '', expiry_date: '' }); setEditId(null); setShowForm(true); setError(''); };
    const openEdit = (m) => { setForm({ name: m.name, generic_name: m.generic_name || '', batch_number: m.batch_number || '', category_id: m.category_id || '', quantity: m.quantity, unit_price: m.unit_price, reorder_level: m.reorder_level, expiry_date: m.expiry_date || '' }); setEditId(m.id); setShowForm(true); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) { await api.put(`/medicines/${editId}`, form); }
            else { await api.post('/medicines', form); }
            setShowForm(false);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving medicine');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this medicine?')) return;
        await api.delete(`/medicines/${id}`);
        load();
    };

    return (
        <SidebarLayout pageTitle="Medicines">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">All Medicines ({medicines.length})</h3>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">+ Add Medicine</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <h4 className="font-semibold text-gray-700 mb-3">{editId ? 'Edit Medicine' : 'Add Medicine'}</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label><input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Generic Name</label><input name="generic_name" value={form.generic_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Batch Number</label><input name="batch_number" value={form.batch_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label><select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" required><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label><input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Unit Price *</label><input type="number" step="0.01" name="unit_price" value={form.unit_price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Reorder Level *</label><input type="number" name="reorder_level" value={form.reorder_level} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label><input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div className="md:col-span-2 flex gap-3"><button type="submit" className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">{editId ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button></div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Batch No.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Expiry</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                <td className="px-4 py-3 text-sm">{m.batch_number || '---'}</td>
                                <td className="px-4 py-3 text-sm">{m.category?.name || 'No Category'}</td>
                                <td className="px-4 py-3 text-sm">{m.quantity}</td>
                                <td className="px-4 py-3 text-sm">${Number(m.unit_price).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm">{m.expiry_date || '---'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <button onClick={() => openEdit(m)} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 mr-2">Edit</button>
                                    <button onClick={() => handleDelete(m.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {medicines.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No medicines found</td></tr>}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
