import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Edit, Trash2, Calendar, Package, DollarSign, Tag, Send, RefreshCw, CheckCircle, XCircle, Download, FileText } from 'lucide-react';

export default function PurchaseOrderView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('purchase-orders.edit');
    const canDelete = hasPermission('purchase-orders.delete');
    const canSubmit = hasPermission('purchase-orders.submit');
    const canDeliver = hasPermission('purchase-orders.deliver');
    const canComplete = hasPermission('purchase-orders.complete');
    const canCancel = hasPermission('purchase-orders.cancel');
    const canSend = hasPermission('purchase-orders.send');
    const canDownload = hasPermission('purchase-orders.download');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadOrder = () => {
        api.get(`/purchase-orders/${id}`)
            .then(r => setOrder(r.data))
            .catch(() => setError('Unable to load purchase order details.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadOrder(); }, [id]);

    const handleAction = async (action, label) => {
        try {
            const res = await api.post(`/purchase-orders/${id}/${action}`);
            window.showToast(res.data?.message || `${label} completed successfully`, 'success');
            loadOrder();
        } catch (err) {
            window.showToast(err.response?.data?.message || `Failed to ${label.toLowerCase()}`, 'error');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this purchase order?')) return;
        try {
            await api.delete(`/purchase-orders/${id}`);
            window.showToast('Purchase order deleted', 'success');
            navigate('/purchase-orders');
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to delete order', 'error');
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const res = await api.get(`/purchase-orders/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `purchase-order-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to download PDF', 'error');
        }
    };

    const statusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-700',
            pending: 'bg-sky-100 text-sky-700',
            sent: 'bg-purple-100 text-purple-700',
            delivered: 'bg-amber-100 text-amber-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return `px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`;
    };

    if (loading) return <LoadingSpinner text="Loading purchase order..." />;

    if (error) {
        return (
            <div className="min-h-[60vh] p-6">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            </div>
        );
    }

    if (!order) {
        return <div className="min-h-[60vh] p-6">Purchase order not found.</div>;
    }

    const status = order.status?.toLowerCase();
    const item = order.items?.[0];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/purchase-orders"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft size={16} />
                    Back to Purchase Orders
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Purchase Order {order.id}</h1>
            </div>

            <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Supplier</label>
                        <p className="text-sm font-medium text-gray-800">{order.supplier?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Order Date</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {order.order_date}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                        <span className={statusBadge(status)}>{order.status}</span>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Sent At</label>
                        <p className="text-sm text-gray-600">
                            {order.sent_at_display || 'Not sent yet.'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Total Amount</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <DollarSign size={14} />
                            ${Number(order.total_amount || 0).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine</label>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                            <Package size={14} />
                            {item?.medicine?.name || order.medicine?.name || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                        <p className="text-sm text-gray-600">{item?.quantity || 0}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Unit Price</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <DollarSign size={14} />
                            ${Number(item?.unit_price || 0).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Subtotal</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <DollarSign size={14} />
                            ${Number(item?.subtotal || 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                        <p className="text-sm text-gray-600">{order.notes || '---'}</p>
                    </div>
                </div>

                {/* Status-aware action buttons */}
                <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    {status !== 'draft' && canDownload && (
                        <button
                            onClick={handleDownloadPdf}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Download size={16} />
                            Download PDF
                        </button>
                    )}
                    {status === 'draft' && canSubmit && (
                        <button
                            onClick={() => handleAction('submit', 'Submit')}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 flex items-center gap-2"
                        >
                            <Send size={16} />
                            Submit to Pending
                        </button>
                    )}
                    {status === 'pending' && canSend && (
                        <button
                            onClick={() => handleAction('send', 'Send to Supplier')}
                            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 flex items-center gap-2"
                        >
                            <Send size={16} />
                            Send to Supplier
                        </button>
                    )}
                    {status === 'sent' && (
<<<<<<< ours
                        <>
                            {canDeliver && (
                                <button
                                    onClick={() => handleAction('deliver', 'Mark as Delivered')}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 flex items-center gap-2"
                                >
                                    <Package size={16} />
                                    Mark as Delivered
                                </button>
                            )}
                            {canSend && (
                                <button
                                    onClick={() => handleAction('resend', 'Resend to Supplier')}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 flex items-center gap-2"
                                >
                                    <RefreshCw size={16} />
                                    Resend to Supplier
                                </button>
                            )}
                        </>
                    )}
                    {['delivered', 'approved'].includes(status) && canComplete && (
=======
                        <button
                            onClick={() => handleAction('resend', 'Resend to Supplier')}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Resend to Supplier
                        </button>
                    )}
                    {(status === 'sent' || status === 'approved') && (
>>>>>>> theirs
                        <button
                            onClick={() => handleAction('complete', 'Complete Order')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center gap-2"
                        >
                            <CheckCircle size={16} />
                            Complete Order
                        </button>
                    )}
<<<<<<< ours
                    {['draft', 'pending', 'sent', 'delivered'].includes(status) && canCancel && (
=======
                    {['draft', 'pending', 'sent', 'delivered', 'approved'].includes(status) && (
>>>>>>> theirs
                        <button
                            onClick={() => handleAction('cancel', 'Cancel')}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 flex items-center gap-2"
                        >
                            <XCircle size={16} />
                            Cancel
                        </button>
                    )}
                    {['draft', 'pending'].includes(status) && canEdit && (
                        <Link
                            to={`/purchase-orders/${order.id}/edit`}
                            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 flex items-center gap-2"
                        >
                            <Edit size={16} />
                            Edit
                        </Link>
                    )}
                    {status === 'draft' && canDelete && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
