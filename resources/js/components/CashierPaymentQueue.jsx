
// resources/js/components/CashierPaymentQueue.jsx
//
// Reusable Cashier Payment Queue component.
//
// Displays all pending pharmacist-dispatched orders (status = pending_cashier)
// as a set of cards.  Each card shows the Order Ref, line items, total amount,
// status badge, and a "Complete Sale" button that opens the payment modal.
//
// This component was extracted from CashierDashboard.jsx so that it can be
// embedded on the Retail Sales page, giving the cashier a single workflow:
//   Browse Products → Shopping Cart → Cashier Payment Queue → Complete Sale
//
// All backend logic, API calls, and database connections are unchanged.

import React, { useState, useEffect } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import {
    CheckCircle,
    Clock,
    ChevronDown,
    RefreshCw,
    DollarSign,
    CreditCard,
    Smartphone,
    Building,
    Banknote,
    Receipt,
    Download,
    Printer,
    X,
    Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'telebirr', label: 'Telebirr', icon: Smartphone },
    { value: 'cbe', label: 'Commercial Bank of Ethiopia (CBE)', icon: Building },
    { value: 'boa', label: 'Bank of Abyssinia (BOA)', icon: Building },
    { value: 'awash', label: 'Awash Bank', icon: Building },
    { value: 'dashen', label: 'Dashen Bank', icon: Building },
    { value: 'coop', label: 'Cooperative Bank of Oromia (Coop)', icon: Building },
    { value: 'wegagen', label: 'Wegagen Bank', icon: Building },
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'other', label: 'Other', icon: DollarSign },
];

const PAYMENT_LABELS = {
    cash: 'Cash',
    telebirr: 'Telebirr',
    cbe: 'Commercial Bank of Ethiopia (CBE)',
    boa: 'Bank of Abyssinia (BOA)',
    awash: 'Awash Bank',
    dashen: 'Dashen Bank',
    coop: 'Cooperative Bank of Oromia (Coop)',
    wegagen: 'Wegagen Bank',
    card: 'Credit/Debit Card',
    other: 'Other',
};

export default function CashierPaymentQueue({ saleType }) {
    const { hasPermission } = useAuth();
    const canComplete = hasPermission(saleType === 'prescription' ? 'prescription-checkout.complete' : 'retail-pos.checkout');
    const canViewReceipt = hasPermission('sales-history.receipt');
    const canDownloadReceipt = hasPermission('sales-history.download');
    const canPrintReceipt = hasPermission('sales-history.print');
    const [pendingSales, setPendingSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);

    // Telebirr payment flow state
    const [telebirrPhone, setTelebirrPhone] = useState('');
    const [telebirrCode, setTelebirrCode] = useState('');
    const [telebirrStep, setTelebirrStep] = useState('phone'); // 'phone' | 'verify' | 'confirmed'
    const [telebirrProcessing, setTelebirrProcessing] = useState(false);

    const navigate = useNavigate();

    const fetchPendingSales = async () => {
        setLoading(true);
        try {
            const params = { status: 'pending_cashier' };
            if (saleType) {
                params.type = saleType;
            }
            const res = await api.get('/sales', { params });
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

    const openPaymentModal = (sale) => {
        setSelectedSale(sale);
        setPaymentMethod('cash');
        setAmountPaid(parseFloat(sale.total_amount).toFixed(2));
        setPaymentModalOpen(true);
        // Auto-populate Telebirr phone from the customer info attached to the sale
        setTelebirrPhone(sale.customer_phone || '');
        setTelebirrCode('');
        setTelebirrStep('phone');
    };

    const closePaymentModal = () => {
        setPaymentModalOpen(false);
        setSelectedSale(null);
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        if (method === 'telebirr') {
            // Auto-populate phone from the customer info attached to the sale
            setTelebirrPhone(selectedSale?.customer_phone || '');
            setTelebirrCode('');
            setTelebirrStep('phone');
        } else {
            // Reset Telebirr state when switching away from Telebirr
            setTelebirrPhone('');
            setTelebirrCode('');
            setTelebirrStep('phone');
        }
    };

    const handleTelebirrPay = () => {
        if (!telebirrPhone.trim()) {
            window.showToast('Customer phone number is required', 'error');
            return;
        }

        setTelebirrProcessing(true);
        // Simulate sending SMS with verification code
        setTimeout(() => {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setTelebirrCode(code);
            setTelebirrStep('verify');
            setTelebirrProcessing(false);
            window.showToast(`Verification code sent to ${telebirrPhone}`, 'success');
        }, 1000);
    };

    const handleCompleteSale = async () => {
        if (!selectedSale) return;

        const total = parseFloat(selectedSale.total_amount);
        const paid = parseFloat(amountPaid);
        const isCash = paymentMethod === 'cash';

        if (isCash && paid < total) {
            window.showToast('Amount paid cannot be less than the total amount', 'error');
            return;
        }

        // For Telebirr, ensure the payment has been processed
        if (paymentMethod === 'telebirr' && telebirrStep !== 'verify') {
            window.showToast('Please complete the Telebirr payment first', 'error');
            return;
        }

        setProcessingId(selectedSale.id);
        try {
            const response = await api.patch(`/sales/${selectedSale.id}/status`, {
                status: 'completed',
                payment_method: paymentMethod,
                amount_paid: paid,
                change_amount: isCash ? paid - total : 0,
            });

            const sale = response.data.sale;
            setCompletedSale(sale);
            setPaymentModalOpen(false);
            setSuccessDialogOpen(true);
            setPendingSales(prev => prev.filter(s => s.id !== selectedSale.id));
            window.showToast('Payment completed successfully!', 'success');
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to complete payment', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewReceipt = () => {
        if (completedSale) {
            navigate(`/receipt/${completedSale.id}`);
        }
    };

    const handleDownloadPdf = async () => {
        if (!completedSale) return;
        try {
            window.showToast('Generating PDF...', 'info');
            const res = await api.get(`/sales/${completedSale.id}/receipt/pdf`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${completedSale.receipt_number || completedSale.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            window.showToast('Receipt PDF downloaded successfully', 'success');
        } catch (err) {
            console.error('Download PDF error:', err);
            window.showToast('Failed to download receipt PDF', 'error');
        }
    };

    const handlePrintReceipt = async () => {
        if (!completedSale) return;
        try {
            window.showToast('Preparing printable receipt...', 'info');
            const res = await api.get(`/sales/${completedSale.id}/receipt/print`);
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(res.data);
                printWindow.document.close();
                printWindow.focus();
            } else {
                window.showToast('Please allow popups to enable printing', 'error');
            }
        } catch (err) {
            console.error('Print receipt error:', err);
            window.showToast('Failed to print receipt', 'error');
        }
    };

    const handleCloseSuccess = () => {
        setSuccessDialogOpen(false);
        setCompletedSale(null);
    };

    const changeAmount = paymentMethod === 'cash'
        ? Math.max(0, parseFloat(amountPaid) - parseFloat(selectedSale?.total_amount || 0))
        : 0;

    // Determine if the Confirm Payment button should be disabled
    const isTelebirrReady = paymentMethod === 'telebirr'
        ? telebirrStep === 'verify' && telebirrPhone.trim() !== ''
        : true;

    if (loading) return <LoadingSpinner text="Fetching cashier queue..." />;

    const isPrescription = saleType === 'prescription';
    const queueTitle = isPrescription ? 'Prescription Payment Queue' : 'Cashier Payment Queue';
    const queueSubtitle = isPrescription
        ? 'Process incoming pharmacist-dispatched prescription orders'
        : 'Process incoming pharmacist-dispatched orders';
    const emptyTitle = isPrescription ? 'No Pending Prescription Payments' : 'No Pending Payments';
    const emptyMessage = isPrescription
        ? 'Prescription orders dispatched by pharmacists will show up here automatically.'
        : 'Orders dispatched by pharmacists will show up here automatically.';

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{queueTitle}</h2>
                    <p className="text-sm text-gray-500 mt-1">{queueSubtitle}</p>
                </div>
                <button
                    onClick={fetchPendingSales}
                    className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap"
                >
                    <RefreshCw size={16} />
                    Refresh Queue
                </button>
            </div>

            {/* Queue Cards */}
            {pendingSales.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">{emptyTitle}</h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">{emptyMessage}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingSales.map(sale => (
                        <div
                            key={sale.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col"
                        >
                            {/* Card Header */}
                            <div className="px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                            Order Ref
                                        </span>
                                        <h4 className="text-lg font-bold text-gray-800 mt-0.5">
                                            #{sale.id}
                                        </h4>
                                    </div>
                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold whitespace-nowrap">
                                        <Clock size={12} className="inline mr-1" />
                                        Pending Cashier
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="px-5 py-4 flex-1 space-y-4">
                                {/* Line Items */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                                        Line Items ({sale.items?.length || 0})
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none text-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Click to view full breakout...
                                            </option>
                                            {sale.items?.map((item, idx) => (
                                                <option key={idx} value={item.id} disabled>
                                                    {item.medicine?.name || item.product_name || `Item #${item.medicine_id}`} | Qty: {item.quantity} | ${parseFloat(item.unit_price).toFixed(2)} ea
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-baseline justify-between pt-2">
                                    <span className="text-xs font-medium text-gray-500">Total Amount</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ${parseFloat(sale.total_amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                                {canComplete ? (
                                    <button
                                        onClick={() => openPaymentModal(sale)}
                                        disabled={processingId === sale.id}
                                        className="w-full btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        <DollarSign size={16} />
                                        {processingId === sale.id ? 'Processing...' : 'Complete Sale'}
                                    </button>
                                ) : (
                                    <div className="text-center text-xs text-gray-400 py-2">View only</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Method Selection Modal */}
            <Modal
                open={paymentModalOpen}
                onClose={closePaymentModal}
                title="Complete Sale"
                size="max-w-md"
            >
                {selectedSale && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500">Order Ref</span>
                                <span className="font-bold text-gray-800">#{selectedSale.id}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500">Total Amount</span>
                                <span className="text-xl font-bold text-green-600">${parseFloat(selectedSale.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Customer</span>
                                <span className="text-sm text-gray-700">{selectedSale.customer_name || 'Walk-in Customer'}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                                Select Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {PAYMENT_METHODS.map(pm => {
                                    const Icon = pm.icon;
                                    return (
                                        <button
                                            key={pm.value}
                                            type="button"
                                            onClick={() => handlePaymentMethodChange(pm.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                paymentMethod === pm.value
                                                    ? 'bg-sky-500 text-white ring-2 ring-sky-500'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            <Icon size={14} />
                                            {pm.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cash: Amount Paid input */}
                        {paymentMethod === 'cash' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Amount Paid
                                </label>
                                <input
                                    type="number"
                                    min={parseFloat(selectedSale.total_amount).toFixed(2)}
                                    step="0.01"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                                {changeAmount > 0 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Change to return: <span className="font-bold text-green-600">${changeAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Telebirr: Phone number + Pay flow */}
                        {paymentMethod === 'telebirr' && (
                            <div className="space-y-3">
                                {/* Step 1: Phone number (auto-populated from pharmacist, editable by cashier) */}
                                {telebirrStep === 'phone' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Customer Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={telebirrPhone}
                                                onChange={(e) => setTelebirrPhone(e.target.value)}
                                                placeholder="Enter customer phone number"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleTelebirrPay}
                                            disabled={telebirrProcessing || !telebirrPhone.trim()}
                                            className="w-full btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {telebirrProcessing ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Send size={14} />
                                            )}
                                            {telebirrProcessing ? 'Processing...' : 'Pay'}
                                        </button>
                                    </>
                                )}

                                {/* Step 2: Verification code shown after Pay */}
                                {telebirrStep === 'verify' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Smartphone size={16} className="text-green-600" />

                                            <span className="text-xs font-medium text-green-700">
                                                Verification code sent to {telebirrPhone}
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-2xl font-bold text-green-700 tracking-wider">
                                                {telebirrCode}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            Enter this code on the customer's Telebirr app to complete the payment.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closePaymentModal}
                                className="flex-1 btn-secondary px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCompleteSale}
                                disabled={
                                    processingId === selectedSale?.id ||
                                    !isTelebirrReady
                                }
                                className="flex-1 btn-primary px-4 py-2 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {processingId === selectedSale?.id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle size={14} />
                                )}
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Success Dialog */}
            <Modal
                open={successDialogOpen}
                onClose={handleCloseSuccess}
                title="Payment Successful"
                size="max-w-lg"
            >
                {completedSale && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto">
                            <CheckCircle size={28} className="text-green-600" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">✓ Payment Successful</h3>
                            <p className="text-sm text-gray-500">The sale has been completed successfully.</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Receipt Number</span>
                                <span className="text-sm font-medium text-gray-800">{completedSale.receipt_number || `#${completedSale.id}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Date & Time</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {new Date(completedSale.sale_date).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Cashier</span>
                                <span className="text-sm font-medium text-gray-800">{completedSale.cashier_name || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Customer</span>
                                <span className="text-sm font-medium text-gray-800">{completedSale.customer_name || 'Walk-in Customer'}</span>
                            </div>
                            {completedSale.notes && (
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Prescription Notes</span>
                                    <span className="text-sm font-medium text-gray-800">{completedSale.notes}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Total Amount</span>
                                <span className="text-sm font-medium text-gray-800">${parseFloat(completedSale.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Payment Method</span>
                                <span className="text-sm font-medium text-gray-800">{PAYMENT_LABELS[completedSale.payment_method] || completedSale.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Amount Paid</span>
                                <span className="text-sm font-medium text-gray-800">${parseFloat(completedSale.amount_paid || completedSale.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Change</span>
                                <span className="text-sm font-medium text-green-600">${parseFloat(completedSale.change_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {canViewReceipt && (
                                <button
                                    onClick={handleViewReceipt}
                                    className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5"
                                >
                                    <Receipt size={14} /> View Receipt
                                </button>
                            )}
                            {canDownloadReceipt && (
                                <button
                                    onClick={handleDownloadPdf}
                                    className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5"
                                >
                                    <Download size={14} /> Download PDF
                                </button>
                            )}
                            {canPrintReceipt && (
                                <button
                                    onClick={handlePrintReceipt}
                                    className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5"
                                >
                                    <Printer size={14} /> Print Receipt
                                </button>
                            )}
                            <button
                                onClick={handleCloseSuccess}
                                className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5"
                            >
                                <X size={14} /> Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
