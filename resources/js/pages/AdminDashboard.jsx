import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarLayout from '../components/SidebarLayout';
import { Clock, AlertTriangle, Calendar, ShoppingCart, Package, Pill, Activity, User } from 'lucide-react';

/**
 * Auto-refresh interval for the dashboard data (ms).
 * Keeps the category chart and activity list in sync when medicines or
 * categories change in the database.
 */
const DASHBOARD_REFRESH_MS = 60 * 1000;

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // ── Helper: load the main dashboard payload from the Laravel API.
    //    Contains the inventory-by-category chart data, recent activities,
    //    low-stock / expired lists and the summary statistics.
    const loadDashboard = async () => {
        try {
            const r = await api.get('/dashboard');
            setData(r.data);
            setError('');
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── Helper: load pending user registrations that need approval
    // ── Fetch once on mount and auto-refresh on an interval so the
    //    category chart automatically updates whenever medicines / categories
    //    change in the database. Cleanup prevents state updates after unmount. ──
    useEffect(() => {
        let active = true; // guard: skip state updates once unmounted

        const load = async () => {
            await loadDashboard();
        };

        load();
        const interval = setInterval(() => {
            if (active) load();
        }, DASHBOARD_REFRESH_MS);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);


    const activityIcon = (name) => {
        const icons = { 'shopping-cart': ShoppingCart, package: Package, pill: Pill, activity: Activity };
        const Icon = icons[name] || Clock;
        return <Icon size={16} />;
    };

    const activityIconColor = (name) => {
        const colors = {
            'shopping-cart': 'bg-green-100 text-green-600',
            package: 'bg-purple-100 text-purple-600',
            pill: 'bg-blue-100 text-blue-600',
            activity: 'bg-orange-100 text-orange-600',
        };
        return colors[name] || 'bg-gray-100 text-gray-600';
    };

    // Prepare inventory chart data (one entry per category from the API)
    const inventoryLabels = data?.inventoryChartData?.map(c => c.category) || [];
    const inventoryValues = data?.inventoryChartData?.map(c => c.medicine_count) || [];

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;

    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <>
            {/* ─────────────────────────────────────────────────────────────────────────
                Summary Cards ─────────────────────────────────────────────────────────
            ───────────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
                <StatCard value={data.totalUsers} label="Total Users" icon="users" color="indigo" />
                <StatCard value={data.totalProducts} label="Total Medicines" icon="package" color="green" />
                <StatCard value={`$${Number(data.totalRevenue || 0).toFixed(2)}`} label="Total Sales" icon="banknote" color="purple" />
                <StatCard value={data.lowStockCount} label="Low Stock Medicines" icon="alert" color="red" />
                <StatCard value={data.expiredCount} label="Expired Medicines" icon="calendar" color="orange" />
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────
                Charts: Sales & Revenue ─────────────────────────────────────────────
            ───────────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <BarChart
                    title="Sales (Last 7 Days)"
                    labels={data.salesChartData?.labels || []}
                    values={data.salesChartData?.counts || []}
                    color="green"
                    valueSuffix=" sales"
                />
                <BarChart
                    title="Revenue (Last 7 Days)"
                    labels={data.salesChartData?.labels || []}
                    values={data.salesChartData?.revenue || []}
                    color="blue"
                    currency={true}
                />
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────
                Inventory by Category  |  Recent Activities
                Responsive 2-column flexbox layout. Both columns grow equally
                (flex-1) and Flexbox `items-stretch` makes the cards the same
                HEIGHT; identical `.card p-5 h-full` sizing makes them the same
                WIDTH too — i.e. identical dimensions. On mobile the cards
                stack vertically.
            ───────────────────────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Left column — Inventory by Category (modern doughnut) */}
                <div className="w-full lg:flex-1 lg:h-full">
                <PieChart
                    labels={inventoryLabels}
                    values={inventoryValues}
                />
                </div>

                {/* Right column — Recent Actions (identical card size/style) */}
                <div className="w-full lg:flex-1 lg:h-full">
                    <div className="card p-5 h-full flex flex-col hover:shadow-md transition-shadow duration-200">
                        <h3 className="card-header flex items-center gap-2">
                            <Clock size={18} className="text-blue-500" />
                            Recent Actions
                        </h3>

                        {/* The list fills the card (flex-1) and scrolls vertically
                            without ever changing the card's size. `min-h-0` lets it
                            scroll correctly inside the flex column. */}
                        {data.recentActivities?.length > 0 ? (
                            <ul className="mt-3 space-y-2.5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                                {data.recentActivities.slice(0, 3).map((activity, i) => (
                                    <li
                                        key={activity.id ?? i}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100"
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${activityIconColor(activity.icon)}`}>
                                            {activityIcon(activity.icon)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-gray-800">{activity.action}</div>
                                            <div className="text-xs text-gray-500 truncate">{activity.user}</div>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{activity.date} {activity.time}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-gray-400 text-center flex-1 flex items-center justify-center">
                                No recent actions
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────
                Notifications ─────────────────────────────────────────────────────
            ───────────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* Low Stock Notifications */}
                <div className="card p-5 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        Low Stock Alerts ({data.lowStockCount})
                    </h3>
                    {data.lowStockMedicines?.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.lowStockMedicines.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 border-l-3 border-red-400 rounded-md">
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

                {/* Expired Medicines Notifications */}
                <div className="card p-5 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-500" />
                        Expired Medicines ({data.expiredCount})
                    </h3>
                    {data.expiredMedicines?.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.expiredMedicines.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3 bg-orange-50 border-l-3 border-orange-400 rounded-md">
                                    <div>
                                        <div className="font-semibold text-sm">{m.name}</div>
                                        <div className="text-xs text-gray-400">Batch: {m.batch_number || '---'}</div>
                                    </div>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">Expired: {m.expiry_date}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-5">✓ No expired medicines</p>
                    )}
                </div>
            </div>

            {/* Expiring Soon (within 90 days) */}
            {data.expiringMedicines?.length > 0 && (
                <div className="card p-5 mb-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50 flex items-center gap-2">
                        <Calendar size={18} className="text-yellow-500" />
                        Expiring Within 90 Days ({data.expiringCount})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.expiringMedicines.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-yellow-50 border-l-3 border-yellow-400 rounded-md">
                                <div>
                                    <div className="font-semibold text-sm">{m.name}</div>
                                    <div className="text-xs text-gray-400">Batch: {m.batch_number || '---'}</div>
                                </div>
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">Expires: {m.expiry_date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </>
    );
}
