// resources/js/pages/LowStock.jsx

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle, AlertTriangle, Package, ShoppingCart, RefreshCw } from 'lucide-react';

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

    const getProgressColor = (medicine) => {
        const ratio = medicine.quantity / medicine.reorder_level;
        if (ratio === 0) return 'bg-red-500';
        if (ratio <= 0.3) return 'bg-red-500';
        if (ratio <= 0.6) return 'bg-orange-500';
        return 'bg-yellow-500';
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
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
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
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
                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
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

            {/* Table */}
            {medicines.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">All Stocked Up! 🎉</h3>
                    <p className="text-gray-500">All medicines are above their reorder level. No low stock items found.</p>
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider">Progress</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-red-700 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map(medicine => {
                                    const status = getStockStatus(medicine);
                                    const progress = Math.min((medicine.quantity / medicine.reorder_level) * 100, 100);
                                    
                                    return (
                                        <tr key={medicine.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={medicine.image_url || '/images/medicine-placeholder.svg'}
                                                        alt={medicine.name}
                                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                        onError={(e) => { e.currentTarget.src = '/images/medicine-placeholder.svg'; }}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-800">{medicine.name}</div>
                                                        <div className="text-xs text-gray-400">{medicine.generic_name || 'No generic name'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {medicine.category?.name || 'No Category'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(medicine)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-lg font-bold ${
                                                    status.color === 'red' ? 'text-red-600' : 'text-orange-600'
                                                }`}>
                                                    {medicine.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-500">
                                                {medicine.reorder_level}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="w-full max-w-[150px]">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>{Math.round(progress)}%</span>
                                                        <span>{medicine.quantity}/{medicine.reorder_level}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${getProgressColor(medicine)}`}
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleOrderNow(medicine.id)}
                                                    disabled={ordering === medicine.id}
                                                    className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-60"
                                                >
                                                    {ordering === medicine.id ? (
                                                        <><RefreshCw size={14} className="animate-spin" /> Ordering...</>
                                                    ) : (
                                                        <><ShoppingCart size={14} /> Order Now</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}