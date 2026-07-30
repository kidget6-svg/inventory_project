import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { DollarSign, Pill, PlusCircle } from 'lucide-react';

export default function CashierDashboard() {
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard value={data.todaySalesCount} label="Today's Sales" color="green" />
                <StatCard value={`$${Number(data.todayRevenue || 0).toFixed(2)}`} label="Today's Revenue" color="blue" />
                <StatCard value={data.totalProducts} label="Available Medicines" color="orange" />
            </div>

            <div className="card p-5">
                <h3 className="card-header flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-500" /> Recent Sales
                </h3>
                {data.recentSales?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-sky-50">
                                    <th className="table-header">Sale ID</th>
                                    <th className="table-header">Date</th>
                                    <th className="table-header text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSales.map(sale => (
                                    <tr key={sale.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                        <td className="table-cell font-medium text-gray-800">#{sale.id}</td>
                                        <td className="table-cell text-gray-500">{sale.sale_date}</td>
                                        <td className="table-cell text-right font-semibold text-gray-800">${Number(sale.total_amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-gray-400 text-center py-5 text-sm">No sales recorded yet</p>}
            </div>

            <div className="card p-5">
                <h3 className="card-header">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/sales" className="btn-primary"><PlusCircle size={16} /> New Sale</Link>
                    <Link to="/medicines" className="btn-secondary"><Pill size={16} /> Browse Medicines</Link>
                </div>
            </div>
        </div>
    );
}
