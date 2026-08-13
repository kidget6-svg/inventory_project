import React, { useState, useEffect } from 'react';
import api from '../axios';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, ShoppingCart, Truck, Clock, AlertTriangle, CheckCircle, XCircle, DollarSign, TrendingUp } from 'lucide-react';

const DASHBOARD_REFRESH_MS = 60 * 1000;

export default function PurchasingStaffDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

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

    useEffect(() => {
        let active = true;
        const load = async () => { await loadDashboard(); };
        load();
        if (active) {
            const interval = setInterval(() => { if (active) load(); }, DASHBOARD_REFRESH_MS);
            return () => { active = false; clearInterval(interval); };
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading purchasing dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl">
                <p>{error}</p>
                <button onClick={loadDashboard} className="mt-3 btn-primary px-4 py-2 text-sm">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols(3 3 4) xl:grid-cols-5 gap-5">
                <StatCard
                    title="Total Suppliers"
                    value={data?.totalSuppliers}
                    icon={Truck}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Total POs"
                    value={data?.totalPurchaseOrders}
                    icon={ShoppingCart}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Pending Approval"
                    value={data?.pendingPurchaseOrders}
                    icon={Clock}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Pending Receiving"
                    value={data?.pendingReceiving}
                    icon={Package}
                    color="bg-sky-500"
                />
                <StatCard
                    title="Spend This Month"
                    value={`$${data?.totalSpendThisMonth?.toFixed(2) || '0.00'}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                />
            </div>

            {/* ── Purchase Order Status Chart ── */}
            {data?.purchaseOrderStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Order Status</h3>
                        <BarChart
                            data={{
                                labels: Object.keys(data.purchaseOrderStats),
                                counts: Object.values(data.purchaseOrderStats),
                            }}
                            bars={[
                                { key: 'counts', color: '#0ea5e3', label: 'Orders' },
                            ]}
                        />
                    </div>

                    {/* ── Expiring Soon Medicines ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expiring Soon (30 days)</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {data.expiringSoon && data.expiringSoon.length > 0 ? (
                                data.expiringSoon.map((medicine) => (
                                    <div key={medicine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-800">{medicine.name}</p>
                                            <p className="text-xs text-gray-500">
                                                Expires: {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-orange-600">
                                            Qty: {medicine.quantity || 0}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No medicines expiring in the next 30 days.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Recent Purchase Orders ── */}
            {data?.recentPurchaseOrders && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Purchase Orders</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">PO #</th>
                                    <th className="px-4 py-2 text-left">Supplier</th>
                                    <th className="px-4 py-2 text-center">Status</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                    <th className="px-4 py-2 text-left">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.recentPurchaseOrders.map((po) => (
                                    <tr key={po.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-800">#{po.id}</td>
                                        <td className="px-4 py-2 text-gray-600">{po.supplier?.name || '---'}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                po.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                po.status === 'delivered' ? 'bg-sky-100 text-sky-700' :
                                                po.status === 'sent' ? 'bg-purple-100 text-purple-700' :
                                                po.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                po.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right font-semibold text-gray-800">
                                            ${po.total_amount ? parseFloat(po.total_amount).toFixed(2) : '0.00'}
                                        </td>
                                        <td className="px-4 py-2 text-gray-500">
                                            {po.created_at ? new Date(po.created_at).toLocaleDateString() : '---'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Recent Activity ── */}
            {data?.recentActivities && data.recentActivities.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {data.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 text-sm">{activity.action}</p>
                                    <p className="text-xs text-gray-500">{activity.date} at {activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
