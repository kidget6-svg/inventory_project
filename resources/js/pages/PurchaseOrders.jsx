import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function PurchaseOrders() {
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ supplier_id: '', order_date: '', status: 'pending', medicine_id: '', quantity: '', unit_price: '' });
    const [error, setError] = useState('');

    const load = () => api.get('/purchase-orders').then(r => setOrders(r.data));
    useEffect(() => {
        load();
        api.get('/suppliers').then(r => setSuppliers(r.data));
        api.get('/medicines').then(r => setMedicines(r.data));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => {
        setForm({ supplier_id: '', order_date: '', status: 'pending', medicine_id: '', quantity: '', unit_price: '' });
        setEditId(null);
        setShowForm(true);
        setError('');
    };

    const openEdit = (o) => {
        api.get(`/purchase-orders/${o.id}`).then(r => {
            const data = r.data;
            const item = data.items?.[0];
            setForm({
                supplier_id: data.supplier_id || '',
                order_date: data.order_date || '',
                status: data.status || 'pending',
                medicine_id: item?.medicine_id || '',
                quantity: item?.quantity || '',
                unit_price: item?.unit_price || '',
            });
            setEditId(o.id);
            setShowForm(true);
            setError('');
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                await api.put(`/purchase-orders/${editId}`, form);
            } else {
                await api.post('/purchase-orders', form);
            }
            setShowForm(false);
            setEditId(null);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving order');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this purchase order?')) return;
        await api.delete(`/purchase-orders/${id}`);
        load();
    };

    const statusBadge = (status) => {
        const base = 'px-2 py-1 rounded-full text-xs font-semibold';
        if (status === 'completed') return `${base} bg-green-100 text-green-700`;
        if (status === 'cancelled') return `${base} bg-red-100 text-red-600`;
        return `${base} bg-blue-100 text-blue-700`;
    };

    return (
        <SidebarLayout pageTitle="Purchase Orders">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">All Purchase Orders ({orders.length})</h3>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">+ New Order</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <h4 className="font-semibold text-gray-700 mb-3">{editId ? 'Edit Purchase Order' : 'Create Purchase Order'}</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Supplier *</label><select name="supplier_id" value={form.supplier_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required><option value="">Select</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Order Date *</label><input type="date" name="order_date" value={form.order_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Status</label><select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label><select name="medicine_id" value={form.medicine_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required><option value="">Select</option>{medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label><input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Unit Price *</label><input type="number" step="0.01" name="unit_price" value={form.unit_price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required /></div>
                        <div className="md:col-span-2 flex gap-3"><button type="submit" className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">{editId ? 'Update Order' : 'Create Order'}</button><button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button></div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Supplier</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm">#{o.id}</td>
                                <td className="px-4 py-3 text-sm">{o.supplier?.name || '---'}</td>
                                <td className="px-4 py-3 text-sm">{o.order_date}</td>
                                <td className="px-4 py-3 text-sm"><span className={statusBadge(o.status)}>{o.status}</span></td>
                                <td className="px-4 py-3 text-sm">${Number(o.total_amount || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm">
                                    <button onClick={() => openEdit(o)} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 mr-2">Edit</button>
                                    <button onClick={() => handleDelete(o.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No purchase orders found</td></tr>}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
