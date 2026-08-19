// resources/js/pages/CashierDashboard.jsx
//
// Cashier Dashboard — shows dashboard information only (no payment
// processing).  The Cashier Payment Queue has been moved to the
// Retail Sales page so the cashier has a single end-to-end workflow:
//   Browse Products → Shopping Cart → Cashier Payment Queue → Complete Sale
//
// This page displays summary stat cards, a mini hourly-sales chart,
// and a list of recent sales — all sourced from the existing
// /dashboard API endpoint (DashboardController::cashierDashboard).

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import {
    ShoppingCart,
    Banknote,
    Package,
    Clock,
    TrendingUp,
    ArrowRight,
} from 'lucide-react';

export default function CashierDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard')
            .then(r => {
                setData(r.data);
                setError('');
            })
            .catch(err => {
                setError('Failed to load dashboard data');
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;

    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    const todaySalesCount = data.todaySalesCount ?? 0;
    const todayRevenue = Number(data.todayRevenue ?? 0);
    const totalMedicines = data.totalMedicines ?? 0;

    const hourlyLabels = (data.todayHourlySales || []).map(h => h.label);
    const hourlyValues = (data.todayHourlySales || []).map(h => Number(h.total));
    const maxHourly = Math.max(...hourlyValues, 1);

    const allRecentSales = data.recentSales || [];
    const recentSales = allRecentSales.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    value={totalMedicines}
                    label="Total Medicines"
                    icon="package"
                    color="purple"
                />
            </div>

            {/* ── Mini Hourly Sales Chart ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-sky-500" />
                    Today's Sales by Hour
                </h3>

                {hourlyValues.every(v => v === 0) ? (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No sales recorded for today yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {hourlyLabels.map((label, idx) => {
                            const value = hourlyValues[idx];
                            const widthPct = (value / maxHourly) * 100;
                            return (
                                <div key={label} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-12">{label}</span>
                                    <div className="flex-1 bg-gray-100 rounded-lg h-6 overflow-hidden">
                                        <div
                                            className="h-full bg-sky-500 rounded-lg transition-all duration-300 flex items-center justify-end"
                                            style={{ width: `${widthPct}%` }}
                                        >
                                            {value > 0 && (
                                                <span className="text-xs text-white font-medium pr-2">
                                                    ${value.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Recent Sales ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Clock size={18} className="text-gray-500" />
                        Recent Sales
                        {allRecentSales.length > 0 && (
                            <span className="text-xs font-normal text-gray-400">({allRecentSales.length})</span>
                        )}
                    </h3>
                    {allRecentSales.length > 0 && (
                        <Link
                            to="/sales-history"
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                        >
                            View All <ArrowRight size={12} />
                        </Link>
                    )}
                </div>

                {recentSales.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No recent sales.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Receipt
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date &amp; Time
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentSales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5 whitespace-nowrap text-gray-800 font-medium">
                                            {sale.receipt_number || `#${sale.id}`}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-gray-500">
                                            {sale.sale_date
                                                ? new Date(sale.sale_date).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-gray-500">
                                            {sale.customer_name || 'Walk-in Customer'}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-right text-gray-700 font-medium">
                                            ${Number(sale.total_amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-right">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                sale.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : sale.status === 'pending_cashier'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {sale.status === 'completed'
                                                    ? 'Completed'
                                                    : sale.status === 'pending_cashier'
                                                    ? 'Pending Cashier'
                                                    : sale.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {allRecentSales.length > 5 && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    Showing 5 of {allRecentSales.length} sales
                                </span>
                                <Link
                                    to="/sales-history"
                                    className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                >
                                    View All <ArrowRight size={12} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
