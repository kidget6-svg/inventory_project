import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });
    const [error, setError] = useState('');

    const load = () => api.get('/suppliers').then(r => setSuppliers(r.data));
    useEffect(() => { load(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => { setForm({ name: '', contact_person: '', phone: '', email: '', address: '' }); setEditId(null); setShowForm(true); setError(''); };
    const openEdit = (s) => { setForm({ name: s.name, contact_person: s.contact_person || '', phone: s.phone || '', email: s.email || '', address: s.address || '' }); setEditId(s.id); setShowForm(true); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) { await api.put(`/suppliers/${editId}`, form); }
            else { await api.post('/suppliers', form); }
            setShowForm(false);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving supplier');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this supplier?')) return;
        await api.delete(`/suppliers/${id}`);
        load();
    };

    return (
        <SidebarLayout pageTitle="Suppliers">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">All Suppliers ({suppliers.length})</h3>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">+ Add Supplier</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <h4 className="font-semibold text-gray-700 mb-3">{editId ? 'Edit Supplier' : 'Add Supplier'}</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label><input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Contact Person</label><input name="contact_person" value={form.contact_person} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email</label><input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Address</label><input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                        <div className="md:col-span-2 flex gap-3"><button type="submit" className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">{editId ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button></div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(s => (
                            <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                                <td className="px-4 py-3 text-sm">{s.contact_person || '---'}</td>
                                <td className="px-4 py-3 text-sm">{s.phone || '---'}</td>
                                <td className="px-4 py-3 text-sm">{s.email || '---'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <button onClick={() => openEdit(s)} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 mr-2">Edit</button>
                                    <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {suppliers.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No suppliers found</td></tr>}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
