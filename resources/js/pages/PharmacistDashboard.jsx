import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import SalesChart from '../components/SalesChart';
import InventoryStatusChart from '../components/InventoryStatusChart';
import RecentActivity from '../components/RecentActivity';
import LowStockAlert from '../components/LowStockAlert';
import ExpiryAlert from '../components/ExpiryAlert';
import QuickActions from '../components/QuickActions';

export default function PharmacistDashboard() {
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

    return (
        <div className="space-y-6">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                    value={data.totalMedicines}
                    label="Total Medicines"
                    icon="package"
                    color="blue"
                />
                <StatCard
                    value={data.lowStockCount}
                    label="Low Stock Medicines"
                    icon="alert"
                    color="orange"
                />
                <StatCard
                    value={data.expiredCount}
                    label="Expired Medicines"
                    icon="calendar"
                    color="red"
                />
                <StatCard
                    value={data.expiring90Count}
                    label="Expiring Within 90 Days"
                    icon="calendar"
                    color="orange"
                />
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Sales Analytics"
                    description="Daily, weekly, and monthly sales trends"
                >
                    <SalesChart data={data.salesAnalytics} />
                </ChartCard>

                <ChartCard
                    title="Inventory Status"
                    description="Stock health overview"
                >
                    <div className="h-72">
                        <InventoryStatusChart data={data.inventoryStatus} />
                    </div>
                </ChartCard>
            </div>

            {/* ── Low Stock Alert + Expiry Alert ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LowStockAlert medicines={data.lowStockMedicines} />
                <ExpiryAlert expiringSoon={data.expiringSoon} />
            </div>

            {/* ── Recent Activity ── */}
            <ChartCard title="Recent Activity" description="Latest system events">
                <RecentActivity activities={data.recentActivities} />
            </ChartCard>

            {/* ── Quick Actions ── */}
            <QuickActions role="pharmacist" />
        </div>
    );
}
