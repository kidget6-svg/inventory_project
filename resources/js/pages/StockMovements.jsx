import React, { useState, useEffect } from 'react';
import api from '../axios';

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-700">Stock Movements ({movements.length})</h3>
                <button onClick={() => { setShowForm(true); setError(''); }} className="btn-primary px-4 py-2 text-sm">+ Record Movement</button>
            </div>

            {showForm && (
                <div className="card p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Record Stock Movement</h4>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label><select name="medicine_id" value={form.medicine_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-400" required><option value="">Select</option>{medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity})</option>)}</select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label><select name="type" value={form.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-400" required><option value="in">Stock In</option><option value="out">Stock Out</option></select></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label><input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-400" required /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label><input name="reference" value={form.reference} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-400" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label><input name="notes" value={form.notes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-400" /></div>
                        <div className="md:col-span-2 flex gap-3"><button type="submit" className="btn-primary">Record</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
                    </form>
                </div>
            )}

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-sky-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Reference</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.medicine?.name || '---'}</td>
                                <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.type === 'in' ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-600'}`}>{m.type === 'in' ? 'In' : 'Out'}</span></td>
                                <td className="px-4 py-3 text-sm">{m.quantity}</td>
                                <td className="px-4 py-3 text-sm">{m.reference || '---'}</td>
                                <td className="px-4 py-3 text-sm">{m.created_at?.split('T')[0] || '---'}</td>
                            </tr>
                        ))}
                        {movements.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No stock movements recorded</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
