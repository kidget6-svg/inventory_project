import React, { useState, useEffect, useRef } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Eye, Edit, Trash2, Plus, Save, X, Calendar, Package, DollarSign, Tag,
    Send, RefreshCw, CheckCircle, XCircle, Download, FileText, Loader2,
    Upload, ClipboardCheck, RotateCcw, Search, Pill,
} from 'lucide-react';
import Pagination from '../components/Pagination';

/**
 * Reusable icon button used in the table action column.
 * Every icon has a tooltip (title attribute) and supports a disabled state.
 */
const ActionIcon = ({ icon: Icon, tooltip, color = "sky", onClick, disabled = false }) => {
    const colorClasses = {
        blue: "text-blue-600 hover:bg-blue-50",
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
    });
    // Multi-item state: [{type, id, name, quantity}]
    const [items, setItems] = useState([]);
    const [retailProducts, setRetailProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('medicine');
    const [medSearch, setMedSearch] = useState('');
    const [retailSearch, setRetailSearch] = useState('');
    const [showMedDropdown, setShowMedDropdown] = useState(false);
    const [showRetailDropdown, setShowRetailDropdown] = useState(false);
    const medSearchRef = useRef(null);
    const retailSearchRef = useRef(null);
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

    // Click-outside handler for search dropdowns
    useEffect(() => {
        const handler = (e) => {
            if (medSearchRef.current && !medSearchRef.current.contains(e.target)) {
                setShowMedDropdown(false);
            }
            if (retailSearchRef.current && !retailSearchRef.current.contains(e.target)) {
                setShowRetailDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ------------------------------------------------------------------
    // Multi-item helpers
    // ------------------------------------------------------------------

    const isItemAdded = (type, id) => items.some(i => i.type === type && i.id === id);

    const addItem = (type, product) => {
        if (isItemAdded(type, product.id)) return;
        setItems(prev => [...prev, {
            type,
            id: product.id,
            name: product.name,
            quantity: 1,
            manufacturer: product.manufacturer || '',
        }]);
    };

    const removeItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        setItems(prev => prev.map((it, i) =>
            i === index ? { ...it, [field]: value } : it
        ));
    };

    const filteredMedicines = medicines.filter(m =>
        (m.name || '').toLowerCase().includes(medSearch.toLowerCase())
    );
    const filteredRetail = retailProducts.filter(r =>
        (r.name || '').toLowerCase().includes(retailSearch.toLowerCase())
    );

    const handlePageChange = (p) => setPage(p);

    // ------------------------------------------------------------------
    // Action handlers
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

    const handleWorkflowAction = async (order, action, label) => {
        try {
            const res = await api.post(`/purchase-orders/${order.id}/${action}`);
            window.showToast(res.data?.message || `${label} completed successfully`, 'success');
            load();
        } catch (err) {
            window.showToast(err.response?.data?.message || `Failed to ${label.toLowerCase()}`, 'error');
        }
    };

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

    const handlePreviewPdf = async (order) => {
        setPdfLoading(true);
        setShowPdfPreview(true);
        try {
            const res = await api.get(`/purchase-orders/${order.id}/preview`);
            const base64 = res.data.pdf;
            const byteChars = atob(base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfPreviewData({
                pdfUrl: url,
                purchase_order: res.data.purchase_order,
            });
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to generate PDF preview', 'error');
            setShowPdfPreview(false);
        } finally {
            setPdfLoading(false);
        }
    };

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

    const getActions = (order) => {
        const status = order.status?.toLowerCase();
        const actions = [];

        actions.push({ icon: Eye, tooltip: 'View Details', color: 'blue', onClick: () => openView(order) });

        const pdfAvailable = ['approved', 'completed'].includes(status);
        if (pdfAvailable) {
            actions.push({ icon: FileText, tooltip: 'Generate PDF', color: 'purple', onClick: () => handlePreviewPdf(order) });
        }

        switch (status) {
            case 'draft':
                actions.push({ icon: Edit, tooltip: 'Edit', color: 'blue', onClick: () => openEdit(order) });
                actions.push({ icon: Trash2, tooltip: 'Delete', color: 'red', onClick: () => handleDelete(order.id) });
                actions.push({ icon: Upload, tooltip: 'Submit to Pending', color: 'purple', onClick: () => handleWorkflowAction(order, 'submit', 'Submit') });
                actions.push({ icon: XCircle, tooltip: 'Cancel', color: 'red', onClick: () => handleWorkflowAction(order, 'cancel', 'Cancel') });
                break;

            case 'pending':
                actions.push({ icon: CheckCircle, tooltip: 'Approve', color: 'green', onClick: () => handleWorkflowAction(order, 'approve', 'Approve') });
                actions.push({ icon: XCircle, tooltip: 'Reject', color: 'red', onClick: () => handleWorkflowAction(order, 'cancel', 'Reject') });
                break;

            case 'sent':
                actions.push({ icon: Package, tooltip: 'Mark as Delivered', color: 'amber', onClick: () => handleWorkflowAction(order, 'deliver', 'Mark as Delivered') });
                actions.push({ icon: XCircle, tooltip: 'Cancel', color: 'red', onClick: () => handleWorkflowAction(order, 'cancel', 'Cancel') });
                break;

            case 'delivered':
                actions.push({ icon: ClipboardCheck, tooltip: 'Mark Complete', color: 'green', onClick: () => handleWorkflowAction(order, 'complete', 'Mark Complete') });
                actions.push({ icon: XCircle, tooltip: 'Cancel', color: 'red', onClick: () => handleWorkflowAction(order, 'cancel', 'Cancel') });
                break;

            case 'approved':
                actions.push({
                    icon: sendingOrderId === order.id ? Loader2 : Send,
                    tooltip: 'Send PDF/Email to Supplier',
                    color: 'sky',
                    onClick: () => handleSendPdf(order),
                    disabled: sendingOrderId === order.id,
                });
                actions.push({ icon: XCircle, tooltip: 'Cancel', color: 'red', onClick: () => handleWorkflowAction(order, 'cancel', 'Cancel') });
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
        setForm({ supplier_id: '' });
        setItems([]);
        setActiveTab('medicine');
        setMedSearch('');
        setRetailSearch('');
        setError('');
        setShowModal(true);
        loadFormOptions();
    };

    const openEdit = (item) => {
        setModalMode('edit');
        setModalItem(item);
        setItems([]);
        setError('');
        setShowModal(true);
        loadFormOptions().then(() => {
            api.get(`/purchase-orders/${item.id}`).then(r => {
                const data = r.data;
                setForm({ supplier_id: data.supplier_id || '' });
                const loadedItems = (data.items || []).map(oi => {
                    const isRetail = oi.itemable_type?.includes('RetailProduct');
                    return {
                        type: isRetail ? 'retail' : 'medicine',
                        id: oi.itemable_id || oi.medicine_id,
                        name: oi.itemable?.name || oi.medicine?.name || 'Unknown',
                        quantity: oi.quantity || 1,
                    };
                });
                setItems(loadedItems);
            });
        });
    };

    const openView = (item) => {
        setModalMode('view');
        setModalItem(item);
        setShowModal(true);
        api.get(`/purchase-orders/${item.id}`).then(r => {
            setModalItem(r.data);
        }).catch(() => { });
    };

    const closeModal = () => {
        setShowModal(false);
        setModalItem(null);
        setForm({ supplier_id: '' });
        setItems([]);
        setError('');
    };

    const closePdfPreview = () => {
        if (pdfPreviewData?.pdfUrl) {
            URL.revokeObjectURL(pdfPreviewData.pdfUrl);
        }
        setShowPdfPreview(false);
        setPdfPreviewData(null);
    };

    const loadFormOptions = async () => {
        setFormLoading(true);
        try {
            await Promise.all([
                api.get('/suppliers').then(r => setSuppliers(r.data?.data || r.data)),
                api.get('/medicines?per_page=all').then(r => {
                    const list = Array.isArray(r.data?.data) ? r.data.data :
                        Array.isArray(r.data?.medicines?.data) ? r.data.medicines.data :
                            Array.isArray(r.data) ? r.data : [];
                    setMedicines(list);
                }),
                api.get('/retail-products?per_page=1000').then(r => {
                    const list = Array.isArray(r.data?.data) ? r.data.data :
                        Array.isArray(r.data?.retailProducts?.data) ? r.data.retailProducts.data :
                            Array.isArray(r.data) ? r.data : [];
                    setRetailProducts(list);
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
        if (items.length === 0) {
            setError('Please add at least one product to the order.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                supplier_id: form.supplier_id,
                items: items.map(i => ({
                    medicine_id: i.type === 'medicine' ? i.id : null,
                    retail_product_id: i.type === 'retail' ? i.id : null,
                    quantity: parseInt(i.quantity) || 1,
                    manufacturer: i.manufacturer || null,
                })),
            };
            if (modalMode === 'create') {
                await api.post('/purchase-orders', payload);
                window.showToast('Purchase order created successfully', 'success');
                if (page !== 1) {
                    setPage(1);
                } else {
                    load(1);
                }
            } else {
                await api.put(`/purchase-orders/${modalItem.id}`, payload);
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Sent At</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Delivered At</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Items</th>
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
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {o.sent_at_display || 'Not sent yet.'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {o.delivered_at_display || 'Delivery confirmation unavailable'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {o.items?.length || 0}
                                            </td>
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
                                        <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
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
                                src={pdfPreviewData.pdfUrl}
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
                size="max-w-3xl"
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
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Sent At</label>
                                <p className="text-sm text-gray-600">
                                    {modalItem.sent_at_display || 'Not sent yet.'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Delivered At</label>
                                <p className="text-sm text-gray-600">
                                    {modalItem.delivered_at_display || 'Delivery confirmation unavailable'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Items</label>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Package size={14} />
                                    {modalItem.items?.length || 0}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Order Items ({modalItem.items?.length || 0})</label>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-sky-50">
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-sky-700">#</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-sky-700">Product</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-sky-700">Type</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-sky-700">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(modalItem.items || []).map((oi, i) => {
                                                const isRetail = oi.itemable_type?.includes('RetailProduct');
                                                const name = oi.itemable?.name || oi.medicine?.name || 'N/A';
                                                return (
                                                    <tr key={i} className="border-t border-gray-100">
                                                        <td className="px-3 py-2 text-sm text-gray-500">{i + 1}</td>
                                                        <td className="px-3 py-2 text-sm font-medium text-gray-800 flex items-center gap-1">
                                                            {isRetail ? <Package size={14} className="text-amber-500" /> : <Pill size={14} className="text-sky-500" />}
                                                            {name}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <span className={isRetail
                                                                ? "px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"
                                                                : "px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700"
                                                            }>
                                                                {isRetail ? 'Retail/OTC' : 'Medicine'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right text-gray-600">{oi.quantity}</td>
                                                    </tr>
                                                );
                                            })}
                                            {(modalItem.items || []).length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-3 py-4 text-center text-gray-400 text-sm">No items</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 1. Supplier */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">1. Supplier *</label>
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

                        {/* 2. Product selection tabs */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">2. Add Products</label>
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('medicine')}
                                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'medicine' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}
                                >
                                    <Pill size={14} />
                                    Medicines ({medicines.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('retail')}
                                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'retail' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                                >
                                    <Package size={14} />
                                    Retail & OTC ({retailProducts.length})
                                </button>
                            </div>

                            {/* Medicine search dropdown */}
                            {activeTab === 'medicine' && (
                                <div className="relative" ref={medSearchRef}>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={medSearch}
                                            onChange={(e) => { setMedSearch(e.target.value); setShowMedDropdown(true); }}
                                            onFocus={() => setShowMedDropdown(true)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                            placeholder="Search medicines by name..."
                                        />
                                    </div>
                                    {showMedDropdown && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            {filteredMedicines.slice(0, 50).map(m => {
                                                const added = isItemAdded('medicine', m.id);
                                                return (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => addItem('medicine', m)}
                                                        disabled={added}
                                                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-sky-50 ${added ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Pill size={14} className="text-sky-400" />
                                                            {m.name}
                                                        </span>
                                                        {added
                                                            ? <span className="text-xs text-green-600 font-semibold">Added</span>
                                                            : <Plus size={16} className="text-sky-500" />
                                                        }
                                                    </button>
                                                );
                                            })}
                                            {filteredMedicines.length === 0 && (
                                                <div className="px-3 py-4 text-center text-gray-400 text-sm">No medicines found</div>
                                            )}
                                            {filteredMedicines.length > 50 && (
                                                <div className="px-3 py-2 text-center text-xs text-gray-400 border-t border-gray-100">
                                                    Showing first 50 of {filteredMedicines.length} results. Refine search to see more.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Retail & OTC search dropdown */}
                            {activeTab === 'retail' && (
                                <div className="relative" ref={retailSearchRef}>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={retailSearch}
                                            onChange={(e) => { setRetailSearch(e.target.value); setShowRetailDropdown(true); }}
                                            onFocus={() => setShowRetailDropdown(true)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                                            placeholder="Search retail & OTC products..."
                                        />
                                    </div>
                                    {showRetailDropdown && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            {filteredRetail.slice(0, 50).map(r => {
                                                const added = isItemAdded('retail', r.id);
                                                return (
                                                    <button
                                                        key={r.id}
                                                        type="button"
                                                        onClick={() => addItem('retail', r)}
                                                        disabled={added}
                                                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-amber-50 ${added ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Package size={14} className="text-amber-400" />
                                                            {r.name}
                                                        </span>
                                                        {added
                                                            ? <span className="text-xs text-green-600 font-semibold">Added</span>
                                                            : <Plus size={16} className="text-amber-500" />
                                                        }
                                                    </button>
                                                );
                                            })}
                                            {filteredRetail.length === 0 && (
                                                <div className="px-3 py-4 text-center text-gray-400 text-sm">No retail products found</div>
                                            )}
                                            {filteredRetail.length > 50 && (
                                                <div className="px-3 py-2 text-center text-xs text-gray-400 border-t border-gray-100">
                                                    Showing first 50 of {filteredRetail.length} results. Refine search to see more.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. Selected items - WITHOUT Unit Price and Subtotal */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">3. Selected Items ({items.length})</label>
                            {items.length > 0 ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Product</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 w-24">Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Manufacturer</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 w-24">Qty</th>
                                            <th className="px-4 py-2 w-12"></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((it, i) => (
                                                <tr key={`${it.type}-${it.id}`} className="border-t border-gray-100">
                                                    <td className="px-4 py-2 text-sm font-medium text-gray-800 flex items-center gap-2">
                                                        {it.type === 'medicine'
                                                            ? <Pill size={14} className="text-sky-400" />
                                                            : <Package size={14} className="text-amber-400" />}
                                                        {it.name}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <span className={it.type === 'medicine'
                                                            ? "px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700"
                                                            : "px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"
                                                        }>
                                                            {it.type === 'medicine' ? 'Medicine' : 'OTC'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={it.manufacturer || ''}
                                                        onChange={(e) => updateItem(i, 'manufacturer', e.target.value)}
                                                        className="w-40 px-2 py-1 text-sm border border-gray-200 rounded focus:border-sky-400 outline-none"
                                                        placeholder="e.g. GSK, Pfizer"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={it.quantity}
                                                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                                                        className="w-20 px-2 py-1 text-sm text-right border border-gray-200 rounded focus:border-sky-400 outline-none"
                                                        min="1"
                                                    />
                                                </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(i)}
                                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-200 bg-gray-50">
                                                <td colSpan="3" className="px-4 py-2 text-right text-xs font-bold text-gray-700">Total Items:</td>
                                                <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">{items.length}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No products added yet. Search and add products above.
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || items.length === 0}
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