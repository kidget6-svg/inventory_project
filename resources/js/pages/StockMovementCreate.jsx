import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, X, Package, Tag, FileText } from 'lucide-react';

export default function StockMovementCreate() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [form, setForm] = useState({
        medicine_id: '',
        type: 'in',
        quantity: '',
        reference: '',
        notes: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/medicines')
            .then(r => setMedicines(r.data?.data || r.data))
            .catch(() => setError('Failed to load medicines'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/stock-movements', form);
            window.showToast('Stock movement recorded successfully', 'success');
            navigate('/stock-movements');
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording movement');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading..." />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/stock-movements"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft size={16} />
                    Back to Stock Movements
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Record Stock Movement</h1>
            </div>

            <div className="card p-6">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <select
                                name="medicine_id"
                                value={form.medicine_id}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                required
                            >
                                <option value="">Select Medicine</option>
                                {medicines.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            required
                        >
                            <option value="in">Stock In</option>
                            <option value="out">Stock Out</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                name="reference"
                                value={form.reference}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Link to="/stock-movements" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                            <X size={16} />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Recording...</> : <><Save size={16} /> Record Movement</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
