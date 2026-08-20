import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarLayout from '../components/SidebarLayout';
import { AlertTriangle, Calendar, Package, ArrowRight } from 'lucide-react';

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const daysRemaining = (iso) => {
    if (!iso) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(iso);
    expiry.setHours(0, 0, 0, 0);
    return Math.round((expiry - today) / 86400000);
};

const formatDaysRemaining = (days) => {
    if (days === null) return '—';
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
};

const expiryStatusBadge = (days) => {
    if (days === null) return 'bg-gray-100 text-gray-500';
    if (days < 0) return 'bg-red-100 text-red-700';
    if (days <= 30) return 'bg-red-100 text-red-600';
    if (days <= 60) return 'bg-orange-100 text-orange-600';
    return 'bg-yellow-100 text-yellow-700';
};

export default function Alerts() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard')
            .then(r => setData(r.data))
            .catch(() => setError('Failed to load alerts'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner text="Loading alerts..." />;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    const lowStockMedicines = data?.lowStockMedicines || [];
    const expiredMedicines = data?.expiredMedicines || [];
    const expiringMedicines = data?.expiringMedicines || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle size={24} className="text-red-500" />
                        Alerts
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        System alerts for stock levels, expiry dates, and inventory warnings
                    </p>
                </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-red-50">
                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Package size={18} className="text-red-500" />
                        Low Stock Alerts
                        <span className="ml-1 text-xs font-normal text-gray-400">({lowStockMedicines.length})</span>
                    </h3>
                    {lowStockMedicines.length > 0 && (
                        <Link to="/inventory" className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    )}
                </div>
                {lowStockMedicines.length > 0 ? (
                    <div className="space-y-2">
                        {lowStockMedicines.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 border-l-4 border-red-400 rounded-md">
                                <div>
                                    <div className="font-semibold text-sm">{m.name}</div>
                                    <div className="text-xs text-gray-400">{m.category?.name || 'No Category'}</div>
                                </div>
                                <div className="text-right">
                                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Stock: {m.quantity}</span>
                                    <div className="text-xs text-gray-400 mt-1">Reorder: {m.reorder_level}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-5">✓ No low-stock medicines</p>
                )}
            </div>

            {/* Expired Medicines */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-50">
                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-500" />
                        Expired Medicines
                        <span className="ml-1 text-xs font-normal text-gray-400">({expiredMedicines.length})</span>
                    </h3>
                    {expiredMedicines.length > 0 && (
                        <Link to="/medicines" className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    )}
                </div>
                {expiredMedicines.length > 0 ? (
                    <div className="space-y-2">
                        {expiredMedicines.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-orange-50 border-l-4 border-orange-400 rounded-md">
                                <div>
                                    <div className="font-semibold text-sm">{m.name}</div>
                                    <div className="text-xs text-gray-400">Batch: {m.batch_number || '---'}</div>
                                </div>
                                <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    Expired: {formatDate(m.expiry_date)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-5">✓ No expired medicines</p>
                )}
            </div>

            {/* Expiring Soon */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-yellow-50">
                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar size={18} className="text-yellow-500" />
                        Expiring Within 90 Days
                        <span className="ml-1 text-xs font-normal text-gray-400">({expiringMedicines.length})</span>
                    </h3>
                    {expiringMedicines.length > 0 && (
                        <Link to="/medicines" className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    )}
                </div>
                {expiringMedicines.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase">Medicine</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase">Batch</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase">Expiry Date</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase">Remaining</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {expiringMedicines.map(m => {
                                    const days = daysRemaining(m.expiry_date);
                                    return (
                                        <tr key={m.id} className="hover:bg-yellow-50 transition-colors">
                                            <td className="py-2.5 pr-4 font-medium text-gray-800 whitespace-nowrap">{m.name}</td>
                                            <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap font-mono text-xs">{m.batch_number || '—'}</td>
                                            <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">{formatDate(m.expiry_date)}</td>
                                            <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">{formatDaysRemaining(days)}</td>
                                            <td className="py-2.5">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${expiryStatusBadge(days)}`}>
                                                    {days < 0 ? 'Expired' : days <= 30 ? 'Critical' : days <= 60 ? 'Warning' : 'Soon'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-5">✓ No medicines expiring within 90 days</p>
                )}
            </div>
        </div>
    );
}
