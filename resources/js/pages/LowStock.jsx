// resources/js/pages/LowStock.jsx

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle, AlertTriangle, Package, ShoppingCart, RefreshCw } from 'lucide-react';

// Donut Chart Component
function DonutChart({ stats }) {
    const critical = stats?.critical || 0;
    const low = stats?.low || 0;
    const reorder = stats?.reorder || 0;
    const total = critical + low + reorder;

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No stock alerts to display
            </div>
        );
    }

    const strokeWidth = 16;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const criticalPct = critical / total;
    const lowPct = low / total;
    const reorderPct = reorder / total;

    const criticalDash = criticalPct * circumference;
    const lowDash = lowPct * circumference;
    const reorderDash = reorderPct * circumference;

    const criticalOffset = 0;
    const lowOffset = -criticalDash;
    const reorderOffset = -(criticalDash + lowDash);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-around p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className="text-gray-100"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        fill="transparent"
                    />
                    {/* Critical Segment */}
                    {critical > 0 && (
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            className="text-red-500 transition-all duration-500 ease-out"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${criticalDash} ${circumference - criticalDash}`}
                            strokeDashoffset={criticalOffset}
                            stroke="currentColor"
                            fill="transparent"
                        />
                    )}
                    {/* Low Segment */}
                    {low > 0 && (
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            className="text-orange-500 transition-all duration-500 ease-out"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${lowDash} ${circumference - lowDash}`}
                            strokeDashoffset={lowOffset}
                            stroke="currentColor"
                            fill="transparent"
                        />
                    )}
                    {/* Reorder Segment */}
                    {reorder > 0 && (
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            className="text-yellow-500 transition-all duration-500 ease-out"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${reorderDash} ${circumference - reorderDash}`}
                            strokeDashoffset={reorderOffset}
                            stroke="currentColor"
                            fill="transparent"
                        />
                    )}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-gray-800">{total}</span>
                    <span className="text-xs text-gray-400 font-medium">Alerts</span>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 mt-4 sm:mt-0">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-xs font-semibold text-gray-600">Out of Stock ({critical})</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-xs font-semibold text-gray-600">Critical Low ({low})</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-xs font-semibold text-gray-600">Needs Reorder ({reorder})</span>
                </div>
            </div>
        </div>
    );
}

export default function LowStock() {
    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(null);

    const loadData = () => {
        setLoading(true);
        api.get('/low-stock')
            .then(r => {
                setMedicines(r.data.medicines || []);
                setStats(r.data.stats || { critical: 0, low: 0, reorder: 0 });
            })
            .catch(err => {
                console.error(err);
                window.showToast('Failed to load low stock data', 'error');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleOrderNow = async (medicineId) => {
        if (!confirm('Create a purchase order for this medicine?')) return;
        setOrdering(medicineId);
        try {
            await api.post(`/low-stock/order-now/${medicineId}`);
            window.showToast('Purchase order created successfully', 'success');
            loadData();
        } catch (err) {
            window.showToast('Failed to create purchase order', 'error');
        } finally {
            setOrdering(null);
        }
    };

    const getStockStatus = (medicine) => {
        if (medicine.quantity === 0) {
            return {
                label: 'Out of Stock',
                color: 'red',
                icon: <AlertCircle className="w-4 h-4" />
            };
        }
        if (medicine.quantity <= medicine.reorder_level / 2) {
            return {
                label: 'Critical',
                color: 'red',
                icon: <AlertCircle className="w-4 h-4" />
            };
        }
        return {
            label: 'Low',
            color: 'orange',
            icon: <AlertTriangle className="w-4 h-4" />
        };
    };

    const getStatusBadge = (medicine) => {
        const status = getStockStatus(medicine);
        const colors = {
            red: 'bg-red-100 text-red-700 border-red-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            green: 'bg-green-100 text-green-700 border-green-200',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status.color]} flex items-center gap-1 inline-flex`}>
                {status.icon} {status.label}
            </span>
        );
    };

    if (loading) {
        return <LoadingSpinner text="Loading low stock items..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">⚠️ Low Stock Alert</h2>
                    <p className="text-sm text-gray-500">Medicines at or below reorder level</p>
                </div>
                <button
                    onClick={loadData}
                    className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Visual Overview: Donut Chart + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <DonutChart stats={stats} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats?.critical || 0}</p>
                                <p className="text-xs text-red-500">Out of Stock</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{stats?.low || 0}</p>
                                <p className="text-xs text-orange-500">Critical Low</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">{stats?.reorder || 0}</p>
                                <p className="text-xs text-yellow-500">Needs Reorder</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            {medicines.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">All Stocked Up! 🎉</h3>
                    <p className="text-gray-500">All medicines are above their reorder level.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-red-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider">Medicine</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider">Current Stock</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider">Reorder Level</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-red-700 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map(medicine => (
                                    <tr key={medicine.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{medicine.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{medicine.category?.name || 'Uncategorized'}</td>
                                        <td className="px-4 py-3">{getStatusBadge(medicine)}</td>
                                        <td className="px-4 py-3 text-center font-bold text-red-600">{medicine.quantity}</td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-500">{medicine.reorder_level}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleOrderNow(medicine.id)}
                                                disabled={ordering === medicine.id}
                                                className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 inline-flex"
                                            >
                                                <ShoppingCart size={14} /> Order Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}