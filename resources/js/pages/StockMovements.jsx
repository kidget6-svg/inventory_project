import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function StockMovements() {
    const [medicines, setMedicines] = useState([]);
    const [movements, setMovements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '' });
    const [error, setError] = useState('');

    const load = () => api.get('/stock-movements').then(r => { setMedicines(r.data.medicines); setMovements(r.data.movements); });
    useEffect(() => { load(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/stock-movements', form);
            setShowForm(false);
            setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '' });
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording movement');
        }
    };

    return (
        <SidebarLayout pageTitle="Stock Movements">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">Stock Movements ({movements.length})</h3>
                <button onClick={() => { setShowForm(true); setError(''); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">+ Record Movement</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Record Stock Movement</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label><select name="medicine_id" value={form.medicine_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required><option value="">Select</option>{medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity})</option>)}</select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label><select name="type" value={form.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required><option value="in">Stock In</option><option value="out">Stock Out</option></select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label><input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label><input name="reference" value={form.reference} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label><input name="notes" value={form.notes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" /></div>
                        <div className="md:col-span-2 flex gap-3"><button type="submit" className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">Record</button><button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button></div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Reference</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.medicine?.name || '---'}</td>
                                <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{m.type === 'in' ? 'In' : 'Out'}</span></td>
                                <td className="px-4 py-3 text-sm">{m.quantity}</td>
                                <td className="px-4 py-3 text-sm">{m.reference || '---'}</td>
                                <td className="px-4 py-3 text-sm">{m.created_at?.split('T')[0] || '---'}</td>
                            </tr>
                        ))}
                        {movements.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No stock movements recorded</td></tr>}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
