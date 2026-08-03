import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, Clock, ChevronDown, RefreshCw, DollarSign } from 'lucide-react';

export default function CashierDashboard() {
    const [pendingSales, setPendingSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchPendingSales = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sales?status=pending_cashier');
            setPendingSales(res.data.data || res.data);
        } catch (err) {
            window.showToast('Failed to fetch cashier queue', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingSales();
    }, []);

    const handleConfirmPayment = async (saleId) => {
        setProcessingId(saleId);
        try {
            await api.patch(`/sales/${saleId}/status`, { status: 'completed' });
            window.showToast(`Order #${saleId} payment completed!`, 'success');
            setPendingSales(prev => prev.filter(sale => sale.id !== saleId));
        } catch (err) {
            window.showToast('Failed to finalize payment', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <LoadingSpinner text="Fetching cashier queue..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">💳 Cashier Payment Queue</h2>
                    <p className="text-sm text-gray-500">Process incoming pharmacist-dispatched orders</p>
                </div>
                <button
                    onClick={fetchPendingSales}
                    className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Refresh Queue
                </button>
            </div>

            {pendingSales.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-700">No Pending Payments</h3>
                    <p className="text-xs text-gray-400 mt-1">Orders dispatched by pharmacists will show up here automatically.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingSales.map(sale => (
                        <div key={sale.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400">Order Ref</span>
                                        <h4 className="font-bold text-lg text-gray-800">#{sale.id}</h4>
                                    </div>
                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <Clock size={12} /> Pending Cashier
                                    </span>
                                </div>

                                {/* Purchased Items Dropdown Selector */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Line Items ({sale.items?.length || 0})
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs appearance-none font-medium text-gray-700 focus:ring-2 focus:ring-blue-500"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Click to view full breakout...</option>
                                            {sale.items?.map((item, idx) => (
                                                <option key={idx} value={item.id} disabled>
                                                    {item.medicine?.name || item.product_name || `Item #${item.medicine_id}`} | Qty: {item.quantity} | ${parseFloat(item.unit_price).toFixed(2)} ea
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t">
                                <div>
                                    <span className="text-xs text-gray-400">Total Amount</span>
                                    <p className="text-xl font-bold text-green-600">${parseFloat(sale.total_amount).toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={() => handleConfirmPayment(sale.id)}
                                    disabled={processingId === sale.id}
                                    className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <CheckCircle size={14} /> Accept Payment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}