import React, { useState, useEffect } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Eye, Edit, Trash2, Search, X, Plus, Save, Calendar, Phone, Mail, MapPin, User } from 'lucide-react';
import Pagination from '../components/Pagination';

const fields = [
    ['name', 'Name'],
    ['contact_person', 'Contact Person'],
    ['phone', 'Phone'],
    ['email', 'Email'],
    ['address', 'Address'],
];

export default function Suppliers() {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('suppliers.create');
    const canEdit = hasPermission('suppliers.edit');
    const canDelete = hasPermission('suppliers.delete');
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState('');
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [modalItem, setModalItem] = useState(null);
    const [form, setForm] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        api.get('/suppliers', { params: { page, search } })
            .then(r => {
                setSuppliers(r.data.data || r.data);
                setMeta(r.data);
            });
    };

    useEffect(() => { load(); }, [page, search]);

    const filteredSuppliers = suppliers;

    const handleDelete = async (id) => {
        if (!confirm('Delete this supplier?')) return;
        try {
            await api.delete(`/suppliers/${id}`);
            window.showToast('Supplier deleted successfully', 'success');
            load();
        } catch (err) {
            window.showToast('Failed to delete supplier', 'error');
        }
    };

    const openCreate = () => {
        setModalMode('create');
        setModalItem(null);
        setForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (item) => {
        setModalMode('edit');
        setModalItem(item);
        setForm({
            name: item.name,
            contact_person: item.contact_person || '',
            phone: item.phone || '',
            email: item.email || '',
            address: item.address || '',
        });
        setError('');
        setShowModal(true);
    };

    const openView = (item) => {
        setModalMode('view');
        setModalItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalItem(null);
        setForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
        setError('');
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                await api.post('/suppliers', form);
                window.showToast('Supplier created successfully', 'success');
            } else {
                await api.put(`/suppliers/${modalItem.id}`, form);
                window.showToast('Supplier updated successfully', 'success');
            }
            setShowModal(false);
            load();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving supplier');
        } finally {
            setSubmitting(false);
        }
    };

    const isViewMode = modalMode === 'view';

    return (
        <div className="space-y-6">
            {/* Header + Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-base font-semibold text-gray-700">
                    All Suppliers ({filteredSuppliers.length})
                </h3>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search
                            size={18}
                            className="absolute left-3 top-3 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {canCreate && (
                        <button
                            onClick={openCreate}
                            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                        >
                            <Plus size={16} />
                            New Supplier
                        </button>
                    )}
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-sky-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Email</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.length > 0 ? (
                            filteredSuppliers.map(s => (
                                <tr
                                    key={s.id}
                                    className="border-b hover:bg-sky-50/30"
                                >
                                    <td className="px-4 py-3 text-sm font-medium">
                                        {s.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {s.contact_person || '---'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {s.phone || '---'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {s.email || '---'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openView(s)}
                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {canEdit && (
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-4 py-8 text-center text-gray-400"
                                >
                                    No suppliers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />

            <Modal
                open={showModal}
                onClose={closeModal}
                title={modalMode === 'create' ? 'Add New Supplier' : modalMode === 'edit' ? 'Edit Supplier' : 'Supplier Details'}
                size="max-w-lg"
            >
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

                {isViewMode && modalItem ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                            <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                                <User size={14} />
                                {modalItem.name}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Contact Person</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <User size={14} />
                                {modalItem.contact_person || '---'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone size={14} />
                                {modalItem.phone || '---'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail size={14} />
                                {modalItem.email || '---'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin size={14} />
                                {modalItem.address || '---'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Created</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                {modalItem.created_at ? new Date(modalItem.created_at).toLocaleDateString() : '---'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Last Updated</label>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                {modalItem.updated_at ? new Date(modalItem.updated_at).toLocaleDateString() : '---'}
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={closeModal} className="btn-secondary">Close</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(([name, label]) => (
                            <div key={name} className={name === 'address' ? 'md:col-span-2' : ''}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}{name === 'name' && ' *'}</label>
                                <input
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                    required={name === 'name'}
                                />
                            </div>
                        ))}
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
                                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving... </> : <><Save size={16} /> {modalMode === 'create' ? 'Create Supplier' : 'Update Supplier'}</>}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
