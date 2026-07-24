import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ sale_date: '', total_amount: '' });
    const [error, setError] = useState('');

    const load = () => api.get('/sales').then(r => setSales(r.data));
    useEffect(() => { load(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => { setForm({ sale_date: '', total_amount: '' }); setEditId(null); setShowForm(true); setError(''); };
    const openEdit = (s) => { setForm({ sale_date: s.sale_date, total_amount: s.total_amount }); setEditId(s.id); setShowForm(true); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) { await api.put(`/sales/${editId}`, form); }
            else { await api.post('/sales', form); }
            setShowForm(false);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving sale');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this sale?')) return;
        await api.delete(`/sales/${id}`);
        load();
    };

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);

    return (
        <SidebarLayout pageTitle="Sales">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">All Sales ({sales.length}) | Total Revenue: <span className="text-green-600">${totalRevenue.toFixed(2)}</span></h3>
                <button onClick={openCreate} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">+ New Sale</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <h4 className="font-semibold text-gray-700 mb-3">{editId ? 'Edit Sale' : 'New Sale'}</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Sale Date *</label><input type="date" name="sale_date" value={form.sale_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Total Amount *</label><input type="number" step="0.01" name="total_amount" value={form.total_amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required /></div>
                        <div className="md:col-span-2 flex gap-3"><button type="submit" className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">{editId ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button></div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Sale ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(s => (
                            <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">#{s.id}</td>
                                <td className="px-4 py-3 text-sm">{s.sale_date}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-600">${Number(s.total_amount).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm">
                                    <button onClick={() => openEdit(s)} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 mr-2">Edit</button>
                                    <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No sales found</td></tr>}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
