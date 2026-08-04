import React, { useState, useEffect } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { Eye, Plus, Save, X, Package, Tag, Calendar, FileText, Loader2 } from 'lucide-react';

export default function StockMovements() {
    const [medicines, setMedicines] = useState([]);
    const [movements, setMovements] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'view'
    const [modalItem, setModalItem] = useState(null);
    const [form, setForm] = useState({
        medicine_id: '',
        type: 'in',
        quantity: '',
        reference: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const load = () => {
        setLoading(true);
        api.get('/stock-movements', { params: { page } })
            .then(r => {
                setMedicines(r.data.medicines);
                setMovements(r.data.movements?.data || r.data.movements || []);
                setMeta(r.data.movements || null);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load stock movements');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [page]);

    const handlePageChange = (p) => setPage(p);

    const openCreate = () => {
        setModalMode('create');
        setModalItem(null);
        setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '' });
        setError('');
        setShowModal(true);
        loadMedicines();
    };

    const openView = (item) => {
        setModalMode('view');
        setModalItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalItem(null);
        setForm({ medicine_id: '', type: 'in', quantity: '', reference: '', notes: '' });
        setError('');
    };

    const loadMedicines = async () => {
        setFormLoading(true);
        try {
            await api.get('/medicines').then(r => setMedicines(r.data?.data || r.data));
        } catch (err) {
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/stock-movements', form);
            window.showToast('Stock movement recorded successfully', 'success');
            setShowModal(false);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording movement');
        } finally {
            setSubmitting(false);
        }
    };

    const isViewMode = modalMode === 'view';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-700">Stock Movements ({movements.length})</h3>
                <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                    <Plus size={16} />
                    New Stock Movement
                </button>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading stock movements..." />
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-sky-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Medicine</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Date</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map(m => (
                                <tr key={m.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                    <td className="px-4 py-3 text-sm font-medium">{m.medicine?.name || '---'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.type === 'in' ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'}`}>
                                            {m.type === 'in' ? 'In' : 'Out'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{m.quantity}</td>
                                    <td className="px-4 py-3 text-sm">{m.reference || '---'}</td>
                                    <td className="px-4 py-3 text-sm">{m.created_at?.split('T')[0] || '---'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openView(m)}
                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {movements.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                        No stock movements recorded
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination meta={meta} onPageChange={handlePageChange} />

            <Modal
                open={showModal}
                onClose={closeModal}
                title={modalMode === 'create' ? 'Record Stock Movement' : `Stock Movement ${modalItem?.id || ''}`}
                size="max-w-lg"
            >
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

                {isViewMode && modalItem ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine</label>
                            <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                                <Package size={14} />
                                {modalItem.medicine?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                            <p className="text-sm text-gray-600">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    modalItem.type === 'in' ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {modalItem.type === 'in' ? 'Stock In' : 'Stock Out'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                            <p className="text-sm font-medium text-gray-800">{modalItem.quantity}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Reference</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Tag size={14} />
                                {modalItem.reference || '---'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <FileText size={14} />
                                {modalItem.notes || '---'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                {modalItem.created_at ? new Date(modalItem.created_at).toLocaleDateString() : '---'}
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={closeModal} className="btn-secondary">Close</button>
                        </div>
                    </div>
                ) : (
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
                                    disabled={formLoading}
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
                            <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Recording... </> : <><Save size={16} /> Record Movement</>}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
