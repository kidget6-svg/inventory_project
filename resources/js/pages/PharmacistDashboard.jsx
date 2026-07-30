import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertTriangle, Calendar, Package, ArrowRight } from 'lucide-react';

export default function PharmacistDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard')
            .then(r => { setData(r.data); setError(''); })
            .catch(err => { setError('Failed to load dashboard data'); console.error(err); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard value={data.totalProducts} label="Total Medicine Types" color="sky" />
                <StatCard value={data.totalStock} label="Total Stock Units" color="green" />
                <StatCard value={data.lowStockCount} label="Low-Stock Medicines" color="red" />
                <StatCard value={data.expiringCount} label="Expiring Within 90 Days" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card p-5">
                    <h3 className="card-header flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" /> Low-Stock Medicines
                    </h3>
                    {data.lowStockMedicines?.length > 0 ? data.lowStockMedicines.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3.5 bg-amber-50 border-l-4 border-amber-400 rounded-xl mb-2.5">
                            <div>
                                <div className="font-semibold text-sm text-gray-800">{m.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{m.category?.name || 'No Category'}</div>
                            </div>
                            <div className="text-right">
                                <span className="badge-red">Stock: {m.quantity}</span>
                                <div className="text-xs text-gray-400 mt-1">Reorder: {m.reorder_level}</div>
                            </div>
                        </div>
                    )) : <p className="text-gray-400 text-center py-5 text-sm">No low-stock medicines</p>}
                </div>

                <div className="card p-5">
                    <h3 className="card-header flex items-center gap-2">
                        <Calendar size={18} className="text-red-500" /> Expiring Within 90 Days
                    </h3>
                    {data.expiringMedicines?.length > 0 ? data.expiringMedicines.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3.5 bg-red-50 border-l-4 border-red-400 rounded-xl mb-2.5">
                            <div>
                                <div className="font-semibold text-sm text-gray-800">{m.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">Batch: {m.batch_number || '---'}</div>
                            </div>
                            <span className="badge-red">Expires: {m.expiry_date}</span>
                        </div>
                    )) : <p className="text-gray-400 text-center py-5 text-sm">No medicines expiring soon</p>}
                </div>
            </div>

            <div className="card p-5">
                <h3 className="card-header">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/medicines" className="btn-primary"><Package size={16} /> View Medicines</Link>
                    <Link to="/stock-movements" className="btn-secondary"><Package size={16} /> Stock Movements</Link>
                    <Link to="/low-stock" className="btn-secondary"><AlertTriangle size={16} /> Low Stock Alert</Link>
                </div>
            </div>
        </div>
    );
}
