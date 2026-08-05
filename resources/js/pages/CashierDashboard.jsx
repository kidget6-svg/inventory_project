import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { CheckCircle, Clock, ChevronDown, RefreshCw, DollarSign, CreditCard, Smartphone, Building, Banknote, Receipt, Download, Printer, X } from 'lucide-react';
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

export default function CashierDashboard() {
    const [pendingSales, setPendingSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);
    const navigate = useNavigate();

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

    const openPaymentModal = (sale) => {
        setSelectedSale(sale);
        setPaymentMethod('cash');
        setAmountPaid(parseFloat(sale.total_amount).toFixed(2));
        setPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setPaymentModalOpen(false);
        setSelectedSale(null);
    };

    const handleCompleteSale = async () => {
        if (!selectedSale) return;

        const total = parseFloat(selectedSale.total_amount);
        const paid = parseFloat(amountPaid);
        const isCash = paymentMethod === 'cash';

        if (paid < total) {
            window.showToast('Amount paid cannot be less than the total amount', 'error');
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
            window.showToast('Failed to complete payment', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewReceipt = () => {
        if (completedSale) {
            navigate(`/receipt/${completedSale.id}`);
        }
    };

    const handleDownloadPdf = () => {
        if (completedSale) {
            window.open(`${import.meta.env.VITE_API_URL || ''}/api/sales/${completedSale.id}/receipt/pdf`, '_blank');
        }
    };

    const handlePrintReceipt = () => {
        if (completedSale) {
            window.open(`${import.meta.env.VITE_API_URL || ''}/api/sales/${completedSale.id}/receipt/print`, '_blank');
        }
    };

    const handleCloseSuccess = () => {
        setSuccessDialogOpen(false);
        setCompletedSale(null);
    };

    const changeAmount = paymentMethod === 'cash'
        ? Math.max(0, parseFloat(amountPaid) - parseFloat(selectedSale?.total_amount || 0))
        : 0;

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
                                    onClick={() => openPaymentModal(sale)}
                                    className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                                >
                                    <DollarSign size={14} /> Complete Sale
                                </button>
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
                                            onClick={() => setPaymentMethod(pm.value)}
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

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={closePaymentModal}
                                className="flex-1 btn-secondary px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteSale}
                                disabled={processingId === selectedSale?.id}
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
                                <span className="text-xs text-gray-500">Date &amp; Time</span>
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
                            <button
                                onClick={handleViewReceipt}
                                className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5"
                            >
                                <Receipt size={14} /> View Receipt
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5"
                            >
                                <Download size={14} /> Download PDF
                            </button>
                            <button
                                onClick={handlePrintReceipt}
                                className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5"
                            >
                                <Printer size={14} /> Print Receipt
                            </button>
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
