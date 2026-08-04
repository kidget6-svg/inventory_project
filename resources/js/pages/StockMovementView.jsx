import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Package, Tag, Calendar, FileText } from 'lucide-react';

export default function StockMovementView() {
    const { id } = useParams();
    const [movement, setMovement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/stock-movements/${id}`)
            .then(r => setMovement(r.data))
            .catch(() => setError('Unable to load stock movement details.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingSpinner text="Loading stock movement..." />;

    if (error) {
        return (
            <div className="min-h-[60vh] p-6">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            </div>
        );
    }

    if (!movement) {
        return <div className="min-h-[60vh] p-6">Stock movement not found.</div>;
    }

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
                <h1 className="text-2xl font-bold text-gray-800">Stock Movement {movement.id}</h1>
            </div>

            <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine</label>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                            <Package size={14} />
                            {movement.medicine?.name || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                        <p className="text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                movement.type === 'in' ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                            </span>
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                        <p className="text-sm font-medium text-gray-800">{movement.quantity}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Reference</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Tag size={14} />
                            {movement.reference || '---'}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <FileText size={14} />
                            {movement.notes || '---'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {movement.created_at ? new Date(movement.created_at).toLocaleDateString() : '---'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
