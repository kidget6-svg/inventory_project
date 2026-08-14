import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Edit, Trash2, Calendar, Phone, Mail, MapPin, User } from 'lucide-react';

export default function SupplierView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('suppliers.edit');
    const canDelete = hasPermission('suppliers.delete');
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/suppliers/${id}`)
            .then(r => setSupplier(r.data))
            .catch(() => setError('Unable to load supplier details.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!canDelete) {
            window.showToast('You do not have permission to delete suppliers', 'error');
            return;
        }
        if (!window.confirm('Delete this supplier?')) return;
        try {
            await api.delete(`/suppliers/${id}`);
            window.showToast('Supplier deleted successfully', 'success');
            navigate('/suppliers');
        } catch (err) {
            window.showToast('Failed to delete supplier', 'error');
        }
    };

    if (loading) return <LoadingSpinner text="Loading supplier..." />;

    if (error) {
        return (
            <div className="min-h-[60vh] p-6">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            </div>
        );
    }

    if (!supplier) {
        return <div className="min-h-[60vh] p-6">Supplier not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/suppliers"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft size={16} />
                    Back to Suppliers
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Supplier Details</h1>
            </div>

            <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                            <User size={14} />
                            {supplier.name}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Contact Person</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User size={14} />
                            {supplier.contact_person || '---'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone size={14} />
                            {supplier.phone || '---'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail size={14} />
                            {supplier.email || '---'}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin size={14} />
                            {supplier.address || '---'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Created</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : '---'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Last Updated</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {supplier.updated_at ? new Date(supplier.updated_at).toLocaleDateString() : '---'}
                        </p>
                    </div>
                </div>

                {(canEdit || canDelete) && (
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        )}
                        {canEdit && (
                            <Link
                                to={`/suppliers/${supplier.id}/edit`}
                                className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Edit
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
