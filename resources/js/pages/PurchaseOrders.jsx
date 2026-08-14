import React, { useState, useEffect } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Eye, Edit, Trash2, Plus, Save, X, Calendar, Package, DollarSign, Tag,
    Send, RefreshCw, CheckCircle, XCircle, Download, FileText, Loader2,
    Upload, ClipboardCheck, RotateCcw,
} from 'lucide-react';
import Pagination from '../components/Pagination';

/**
 * Reusable icon button used in the table action column.
 * Every icon has a tooltip (title attribute) and supports a disabled state.
 */
const ActionIcon = ({ icon: Icon, tooltip, color = "sky", onClick, disabled = false }) => {
    const colorClasses = {
        sky: "text-sky-600 hover:bg-sky-50",
        green: "text-green-600 hover:bg-green-50",
        red: "text-red-600 hover:bg-red-50",
        purple: "text-purple-600 hover:bg-purple-50",
        amber: "text-amber-600 hover:bg-amber-50",
        gray: "text-gray-500 hover:bg-gray-100",
    };

    return (
        <button
            type="button"
            title={disabled ? "Not available for this status" : tooltip}
            aria-label={tooltip}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${colorClasses[color]} ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:shadow-sm"}`}
        >
            <Icon size={16} />
        </button>
    );
};

export default function PurchaseOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [modalItem, setModalItem] = useState(null);
    const [form, setForm] = useState({
        supplier_id: '',
        medicine_name: '',
        quantity: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [formLoading, setFormLoading] = useState(false);
    const [sendingOrderId, setSendingOrderId] = useState(null);

    // PDF preview modal state
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [pdfPreviewData, setPdfPreviewData] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    const load = async (pageNumber = page) => {
        try {
            const res = await api.get('/purchase-orders', { params: { page: pageNumber } });
            setOrders(res.data.data || res.data);
            setMeta(res.data.meta || res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { load(); }, [page]);

    const handlePageChange = (p) => setPage(p);

    // ------------------------------------------------------------------
    // Action handlers (used by both the table action column and the view modal)
    // ------------------------------------------------------------------

    const handleDelete = async (id) => {
        if (!confirm('Delete this purchase order?')) return;
        try {
            await api.delete(`/purchase-orders/${id}`);
            window.showToast('Purchase order deleted', 'success');
            load();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to delete order', 'error');
        }
    };

    /**
     * Generic workflow action handler.
     * Calls POST /purchase-orders/{id}/{action} and refreshes the list.
     */
    const handleWorkflowAction = async (order, action, label) => {
        try {
            const res = await api.post(`/purchase-orders/${order.id}/${action}`);
            window.showToast(res.data?.message || `${label} completed successfully`, 'success');
            load();
        } catch (err) {
            window.showToast(err.response?.data?.message || `Failed to ${label.toLowerCase()}`, 'error');
        }
    };

    /**
     * Email Supplier action.
     * - Pending: uses `send` (emails supplier AND transitions to sent)
     * - Approved/Completed/Sent/Delivered: uses `resend` (re-emails, no status change)
     */
    const handleEmailSupplier = (order) => {
        const status = order.status?.toLowerCase();
        if (status === 'pending') {
            handleWorkflowAction(order, 'send', 'Email Supplier');
        } else {
            handleWorkflowAction(order, 'resend', 'Email Supplier');
        }
    };

    const handleSendPdf = async (order) => {
        setSendingOrderId(order.id);
        try {
            const res = await api.post(`/purchase-orders/${order.id}/send-email`);
            window.showToast(res.data?.message || 'Purchase Order PDF sent successfully.', 'success');
            load();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to send Purchase Order PDF', 'error');
        } finally {
            setSendingOrderId(null);
        }
    };

    /**
     * Preview PDF - fetches base64 PDF and opens the preview modal.
     */
    const handlePreviewPdf = async (order) => {
        setPdfLoading(true);
        setShowPdfPreview(true);
        try {
            const res = await api.get(`/purchase-orders/${order.id}/preview`);
            setPdfPreviewData({
                pdf: res.data.pdf,
                purchase_order: res.data.purchase_order,
            });
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to generate PDF preview', 'error');
            setShowPdfPreview(false);
        } finally {
            setPdfLoading(false);
        }
    };

    /**
     * Download PDF - triggers a file download.
     */
    const handleDownloadPdf = async (order) => {
        try {
            const res = await api.get(`/purchase-orders/${order.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `purchase-order-${order.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to download PDF', 'error');
        }
    };

    // ------------------------------------------------------------------
    // Data-driven action builder
    // ------------------------------------------------------------------

    /**
     * Returns the list of action icons to display for a given order,
     * based on its current status.  Every icon has a tooltip.
     * Actions that are not allowed for the current status are shown
     * as disabled (greyed out, no onClick) rather than hidden, so the
     * user can see what is available.
     */
    const getActions = (order) => {
        const status = order.status?.toLowerCase();
        const actions = [];

        // Always: View
        actions.push({ icon: Eye, tooltip: 'View Details', color: 'sky', onClick: () => openView(order) });

        const pdfAvailable = status !== 'draft';
        if (pdfAvailable) {
            actions.push({ icon: FileText, tooltip: 'Generate PDF', color: 'purple', onClick: () => handlePreviewPdf(order) });
            actions.push({ icon: Download, tooltip: 'Download PDF', color: 'sky', onClick: () => handleDownloadPdf(order) });
        }

        if (['pending', 'approved'].includes(status)) {
            actions.push({
                icon: sendingOrderId === order.id ? Loader2 : Send,
                tooltip: 'Send Purchase Order PDF to Supplier',
                color: 'sky',
                onClick: () => handleSendPdf(order),
                disabled: sendingOrderId === order.id,
            });
        }

        switch (status) {
            case 'draft':
                actions.push({ icon: Edit, tooltip: 'Edit', color: 'sky', onClick: () => openEdit(order) });
                actions.push({ icon: Trash2, tooltip: 'Delete', color: 'red', onClick: () => handleDelete(order.id) });
                actions.push({ icon: Upload, tooltip: 'Submit to Pending', color: 'purple', onClick: () => handleWorkflowAction(order, 'submit', 'Submit') });
                break;

            case 'pending':
                actions.push({ icon: CheckCircle, tooltip: 'Approve', color: 'green', onClick: () => handleWorkflowAction(order, 'approve', 'Approve') });
                actions.push({ icon: XCircle, tooltip: 'Reject', color: 'red', onClick: () => handleWorkflowAction(order, 'cancel', 'Reject') });
                break;

            case 'approved':
                actions.push({ icon: ClipboardCheck, tooltip: 'Mark Complete', color: 'green', onClick: () => handleWorkflowAction(order, 'complete', 'Mark Complete') });
                break;

            case 'completed':
                break;

            case 'cancelled':
                actions.push({ icon: RotateCcw, tooltip: 'Restore', color: 'purple', onClick: () => handleWorkflowAction(order, 'reopen', 'Restore') });
                break;

            default:
                break;
        }

        return actions;
    };

    // ------------------------------------------------------------------
    // Status badge
    // ------------------------------------------------------------------

    const statusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-700',
            pending: 'bg-sky-100 text-sky-700',
            sent: 'bg-purple-100 text-purple-700',
            delivered: 'bg-amber-100 text-amber-700',
            approved: 'bg-green-100 text-green-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        const labels = {
            draft: 'Draft',
            pending: 'Pending',
            sent: 'Sent',
            delivered: 'Delivered',
            approved: 'Approved',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        const s = status?.toLowerCase();
        return `px-3 py-1 rounded-full text-xs font-semibold ${colors[s] || 'bg-gray-100 text-gray-600'}`;
    };

    const statusLabel = (status) => {
        const labels = {
            draft: 'Draft',
            pending: 'Pending',
            sent: 'Sent',
            delivered: 'Delivered',
            approved: 'Approved',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        const s = status?.toLowerCase();
        return labels[s] || status;
    };

    const formatDate = (date) => {
        if (!date) return '—';
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return date;
        return parsed.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // ------------------------------------------------------------------
    // Modal helpers
    // ------------------------------------------------------------------

    const openCreate = () => {
        setModalMode('create');
        setModalItem(null);
        setForm({ supplier_id: '', medicine_name: '', quantity: '' });
        setError('');
        setShowModal(true);
        loadFormOptions();
    };

    const openEdit = (item) => {
        setModalMode('edit');
        setModalItem(item);
        setError('');
        setShowModal(true);
        loadFormOptions().then(() => {
            api.get(`/purchase-orders/${item.id}`).then(r => {
                const data = r.data;
                const orderItem = data.items?.[0];
                setForm({
                    supplier_id: data.supplier_id || '',
                    medicine_name: orderItem?.medicine?.name || '',
                    quantity: orderItem?.quantity || '',
                });
            });
        });
    };

    const openView = (item) => {
        setModalMode('view');
        setModalItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalItem(null);
        setForm({ supplier_id: '', medicine_name: '', quantity: '' });
        setError('');
    };

    const closePdfPreview = () => {
        setShowPdfPreview(false);
        setPdfPreviewData(null);
    };

    const loadFormOptions = async () => {
        setFormLoading(true);
        try {
            await Promise.all([
                api.get('/suppliers').then(r => setSuppliers(r.data?.data || r.data)),
                api.get('/medicines').then(r => {
                    const list = Array.isArray(r.data?.data) ? r.data.data :
                                 Array.isArray(r.data?.medicines?.data) ? r.data.medicines.data :
                                 Array.isArray(r.data) ? r.data : [];
                    setMedicines(list);
                }),
            ]);
        } finally {
            setFormLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                await api.post('/purchase-orders', form);
                window.showToast('Purchase order created successfully', 'success');
                if (page !== 1) {
                    setPage(1);
                } else {
                    load(1);
                }
            } else {
                await api.put(`/purchase-orders/${modalItem.id}`, form);
                window.showToast('Purchase order updated successfully', 'success');
                load();
            }
            setShowModal(false);
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : (err.response?.data?.message || 'Error saving order'));
        } finally {
            setSubmitting(false);
        }
    };

    // Modal-level workflow action (used inside the view modal)
    const handleAction = async (action, label) => {
        try {
            const res = await api.post(`/purchase-orders/${modalItem.id}/${action}`);
            window.showToast(res.data?.message || `${label} completed successfully`, 'success');
            setShowModal(false);
            load();
        } catch (err) {
            const message = err.response?.data?.message || `Failed to ${label.toLowerCase()}`;
            window.showToast(message, 'error');
        }
    };

    const handleViewDelete = async () => {
        if (!window.confirm('Delete this purchase order?')) return;
        try {
            await api.delete(`/purchase-orders/${modalItem.id}`);
            window.showToast('Purchase order deleted', 'success');
            setShowModal(false);
            load();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to delete order', 'error');
        }
    };

    const handleModalDownloadPdf = async () => {
        try {
            const res = await api.get(`/purchase-orders/${modalItem.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `purchase-order-${modalItem.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to download PDF', 'error');
        }
    };

    const isViewMode = modalMode === 'view';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-700">
                    All Purchase Orders ({meta?.total ?? orders.length})
                </h3>
                <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                    <Plus size={16} />
                    New Order
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Pagination meta={meta} onPageChange={handlePageChange} />

            {loading ? (
                <LoadingSpinner text="Loading purchase orders..." />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-sky-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">No.</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Supplier</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o, idx) => {
                                    const status = o.status?.toLowerCase();
                                    const actions = getActions(o);
                                    const displayIndex = meta ? ((meta.current_page - 1) * meta.per_page) + idx + 1 : idx + 1;
                                    return (
                                        <tr
                                            key={o.id}
                                            className="border-b hover:bg-sky-50/30"
                                        >
                                                                    <td className="px-4 py-3 text-sm">{displayIndex}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="overflow-hidden whitespace-nowrap text-ellipsis truncate">
                                                    {o.supplier?.name || "---"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{formatDate(o.order_date)}</td>
                                            <td className="px-4 py-3">
                                                <span className={statusBadge(status)}>{statusLabel(status)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">${Number(o.total_amount || 0).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end items-center gap-2">
                                                    {actions.map((a, i) => (
                                                        <ActionIcon
                                                            key={i}
                                                            icon={a.icon}
                                                            tooltip={a.tooltip}
                                                            color={a.color}
                                                            onClick={a.onClick}
                                                            disabled={a.disabled}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                            No purchase orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PDF Preview Modal */}
            <Modal
                open={showPdfPreview}
                onClose={closePdfPreview}
                title="Purchase Order PDF Preview"
                size="max-w-4xl"
            >
                {pdfLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner text="Generating PDF..." />
                    </div>
                ) : pdfPreviewData ? (
                    <div className="space-y-4">
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleDownloadPdf(pdfPreviewData.purchase_order)}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <Download size={16} />
                                Download PDF
                            </button>
                            <button
                                onClick={closePdfPreview}
                                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <X size={16} />
                                Close
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <iframe
                                title="Purchase Order PDF Preview"
                                src={`data:application/pdf;base64,${pdfPreviewData.pdf}`}
                                className="w-full h-[600px]"
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No PDF data available.</p>
                )}
            </Modal>

            {/* Main Modal (Create / Edit / View) */}
            <Modal
                open={showModal}
                onClose={closeModal}
                title={
                    modalMode === 'create' ? 'Create Purchase Order'
                    : modalMode === 'edit' ? 'Edit Purchase Order'
                    : `Purchase Order ${modalItem?.id || ''}`
                }
                size="max-w-2xl"
            >
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

                {isViewMode && modalItem ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Supplier</label>
                                <p className="text-sm font-medium text-gray-800">{modalItem.supplier?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Order Date</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(modalItem.order_date)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                                <span className={statusBadge(modalItem.status?.toLowerCase())}>{statusLabel(modalItem.status)}</span>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Amount</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <DollarSign size={14} />
                                    ${Number(modalItem.total_amount || 0).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine</label>
                                <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                                    <Package size={14} />
                                    {modalItem.items?.[0]?.medicine?.name || modalItem.medicine?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                                <p className="text-sm text-gray-600">{modalItem.items?.[0]?.quantity || 0}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Unit Price</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <DollarSign size={14} />
                                    ${Number(modalItem.items?.[0]?.unit_price || 0).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Subtotal</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <DollarSign size={14} />
                                    ${Number(modalItem.items?.[0]?.subtotal || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <FileText size={14} />
                                    {modalItem.notes || '---'}
                                </p>
                            </div>
                        </div>

                        {/* Status-aware icon-only action buttons */}
                        <div className="flex justify-end items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                            {modalItem.status?.toLowerCase() !== 'draft' && (
                                <ActionIcon
                                    icon={Download}
                                    tooltip="Download PDF"
                                    color="sky"
                                    onClick={handleModalDownloadPdf}
                                />
                            )}
                            {modalItem.status?.toLowerCase() === 'draft' && (
                                <ActionIcon
                                    icon={Upload}
                                    tooltip="Submit to Pending"
                                    color="purple"
                                    onClick={() => handleAction('submit', 'Submit')}
                                />
                            )}
                            {modalItem.status?.toLowerCase() === 'pending' && (
                                <ActionIcon
                                    icon={Send}
                                    tooltip="Email Supplier"
                                    color="sky"
                                    onClick={() => handleAction('send', 'Email Supplier')}
                                />
                            )}
                            {modalItem.status?.toLowerCase() === 'pending' && (
                                <ActionIcon
                                    icon={CheckCircle}
                                    tooltip="Approve"
                                    color="green"
                                    onClick={() => handleAction('approve', 'Approve')}
                                />
                            )}
                            {modalItem.status?.toLowerCase() === 'sent' && (
                                <ActionIcon
                                    icon={Package}
                                    tooltip="Mark as Delivered"
                                    color="amber"
                                    onClick={() => handleAction('deliver', 'Mark as Delivered')}
                                />
                            )}
                            {modalItem.status?.toLowerCase() === 'sent' && (
                                <ActionIcon
                                    icon={Send}
                                    tooltip="Resend to Supplier"
                                    color="purple"
                                    onClick={() => handleAction('resend', 'Resend to Supplier')}
                                />
                            )}
                            {['delivered', 'approved'].includes(modalItem.status?.toLowerCase()) && (
                                <ActionIcon
                                    icon={ClipboardCheck}
                                    tooltip="Mark as Completed"
                                    color="green"
                                    onClick={() => handleAction('complete', 'Mark as Completed')}
                                />
                            )}
                            {['draft', 'pending', 'sent', 'delivered', 'approved'].includes(modalItem.status?.toLowerCase()) && (
                                <ActionIcon
                                    icon={XCircle}
                                    tooltip="Cancel"
                                    color="red"
                                    onClick={() => handleAction('cancel', 'Cancel')}
                                />
                            )}
                            {['draft', 'pending', 'approved'].includes(modalItem.status?.toLowerCase()) && (
                                <ActionIcon
                                    icon={Edit}
                                    tooltip="Edit"
                                    color="sky"
                                    onClick={() => { setShowModal(false); openEdit(modalItem); }}
                                />
                            )}
                            {modalItem.status?.toLowerCase() === 'draft' && (
                                <ActionIcon
                                    icon={Trash2}
                                    tooltip="Delete"
                                    color="red"
                                    onClick={handleViewDelete}
                                />
                            )}
                            {modalItem.status?.toLowerCase() === 'cancelled' && (
                                <ActionIcon
                                    icon={RotateCcw}
                                    tooltip="Reopen"
                                    color="purple"
                                    onClick={() => handleAction('reopen', 'Reopen')}
                                />
                            )}
                            <ActionIcon
                                icon={X}
                                tooltip="Close"
                                color="gray"
                                onClick={closeModal}
                            />
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier *</label>
                            <select
                                name="supplier_id"
                                value={form.supplier_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                required
                                disabled={formLoading}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label>
                            <input
                                list="medicine-list"
                                name="medicine_name"
                                value={form.medicine_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                placeholder="Type to search or create new medicine"
                                required
                                disabled={formLoading}
                            />
                            <datalist id="medicine-list">
                                {medicines.map(m => (
                                    <option key={m.id} value={m.name} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                min="1"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving... </> : <><Save size={16} /> {modalMode === 'create' ? 'Create Order' : 'Update Order'}</>}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
