import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../axios';
import { ArrowLeft, Image, Tag, CalendarDays } from 'lucide-react';

const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });
};

const getImageUrl = (image) => {
    if (!image) return '/images/medicine-placeholder.svg';
    return `/storage/${image}`;
};

export default function MedicineDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/medicines/${id}`)
            .then((response) => setMedicine(response.data))
            .catch(() => setError('Unable to load medicine details.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center text-blue-500">Loading medicines...</div>;
    }

    if (error) {
        return (
            <div className="min-h-[60vh] p-6">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            </div>
        );
    }

    if (!medicine) {
        return <div className="min-h-[60vh] p-6">Medicine not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <ArrowLeft size={16} />
                        Back to medicines
                    </button>
                    <h1 className="mt-4 text-3xl font-semibold text-slate-900">{medicine.name}</h1>
                    <p className="mt-2 text-sm text-slate-500">Complete medicine profile with photo and stock details.</p>
                </div>
                <Link
                    to="/medicines"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    View medicine list
                </Link>
            </div>

            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                        <img
                            src={getImageUrl(medicine.image)}
                            alt={medicine.name}
                            className="h-[300px] w-full rounded-3xl object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/images/medicine-placeholder.svg';
                            }}
                        />
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="rounded-3xl bg-slate-50 p-4">
                            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Stock</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">{medicine.quantity}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-4">
                            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Price</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(medicine.unit_price)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Medicine name</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.name}</p>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Generic name</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.generic_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Category</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.category?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Batch number</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.batch_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Expiry date</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'No expiry'}</p>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Supplier</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.supplier?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                            <Tag size={16} />
                            Medicine overview
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current stock</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.quantity}</p>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Reorder level</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.reorder_level}</p>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Last updated</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.updated_at ? new Date(medicine.updated_at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Record created</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{medicine.created_at ? new Date(medicine.created_at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
