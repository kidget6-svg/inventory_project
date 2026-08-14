
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, X, Package } from 'lucide-react';

export default function PurchaseOrderCreate() {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [form, setForm] = useState({
        supplier_id: '',
        medicine_name: '',
        quantity: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/suppliers').then(r => setSuppliers(r.data)),
            api.get('/medicines').then(r => setMedicines(r.data?.data || r.data)),
        ]).finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/purchase-orders', form);
            window.showToast('Purchase order created successfully', 'success');
            navigate('/purchase-orders');
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : (err.response?.data?.message || 'Error saving order'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading..." />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/purchase-orders"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft size={16} />
                    Back to Purchase Orders
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Create Purchase Order</h1>
            </div>

            <div className="card p-6">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier *</label>
                        <select
                            name="supplier_id"
                            value={form.supplier_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            required
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label>
                        <div className="relative">
                            <input
                                list="medicine-list"
                                name="medicine_name"
                                value={form.medicine_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                placeholder="Type to search or create new medicine"
                                required
                            />
                            <datalist id="medicine-list">
                                {medicines.map(m => (
                                    <option key={m.id} value={m.name} />
                                ))}
                            </datalist>
                        </div>
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
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Link to="/purchase-orders" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                            <X size={16} />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><Save size={16} /> Create Order</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
