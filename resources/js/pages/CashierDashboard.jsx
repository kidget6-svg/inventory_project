import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import QuickActions from '../components/QuickActions';

export default function CashierDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard')
            .then((r) => {
                setData(r.data);
                setError('');
            })
            .catch((err) => {
                setError('Failed to load dashboard data');
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;

    if (error)
        return (
            <div className="text-center py-12 text-red-500">{error}</div>
        );

    const todayRevenue = Number(data.todayRevenue || 0);
    const todaySalesCount = Number(data.todaySalesCount || 0);

    return (
        <div className="space-y-6">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard
                    value={todaySalesCount}
                    label="Today's Sales"
                    icon="shopping-cart"
                    color="green"
                />
                <StatCard
                    value={`$${todayRevenue.toFixed(2)}`}
                    label="Today's Revenue"
                    icon="banknote"
                    color="blue"
                />
                <StatCard
                    value={data.totalMedicines}
                    label="Available Medicines"
                    icon="package"
                    color="orange"
                />
            </div>

            {/* ── Recent Transactions ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <h3 className="text-base font-semibold text-gray-800">
                        Recent Transactions
                    </h3>
                    <Link
                        to="/sales"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        View All
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    {!data.recentSales || data.recentSales.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p className="text-sm">No sales recorded yet</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                                        Sale ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSales.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            #{sale.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {sale.sale_date}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                                            ${Number(sale.total_amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <QuickActions role="cashier" />
        </div>
    );
}
