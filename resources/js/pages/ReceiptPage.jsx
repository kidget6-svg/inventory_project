import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Receipt, Download, Printer, ArrowLeft, CheckCircle, Smartphone, CreditCard, Building, Banknote, DollarSign } from 'lucide-react';

const PAYMENT_ICONS = {
    cash: Banknote,
    telebirr: Smartphone,
    cbe: Building,
    boa: Building,
    awash: Building,
    dashen: Building,
    coop: Building,
    wegagen: Building,
    card: CreditCard,
    other: DollarSign,
};

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

export default function ReceiptPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSale = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/sales/${id}/receipt`);
                setSale(res.data);
            } catch (err) {
                window.showToast('Failed to load receipt', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSale();
    }, [id]);

    const handleDownloadPdf = async () => {
        try {
            window.showToast('Generating PDF...', 'info');
            const res = await api.get(`/sales/${id}/receipt/pdf`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${sale?.receipt_number || id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            window.showToast('Receipt PDF downloaded successfully', 'success');
        } catch (err) {
            console.error(err);
            window.showToast('Failed to download receipt PDF', 'error');
        }
    };

    const handlePrint = async () => {
        try {
            window.showToast('Preparing printable receipt...', 'info');
            const res = await api.get(`/sales/${id}/receipt/print`);
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(res.data);
                printWindow.document.close();
                printWindow.focus();
            } else {
                window.showToast('Please allow popups to enable printing', 'error');
            }
        } catch (err) {
            console.error(err);
            window.showToast('Failed to print receipt', 'error');
        }
    };

    if (loading) return <LoadingSpinner text="Loading receipt..." />;

    if (!sale) {
        return (
            <div className="text-center py-12 text-gray-500">
                Receipt not found.
            </div>
        );
    }

    const paymentIcon = PAYMENT_ICONS[sale.payment_method] || DollarSign;
    const PaymentIcon = paymentIcon;
    const paymentLabel = PAYMENT_LABELS[sale.payment_method] || sale.payment_method;
    const amountPaid = parseFloat(sale.amount_paid || sale.total_amount);
    const changeAmount = parseFloat(sale.change_amount || 0);

    return (
        <div className="receipt-page space-y-6">
            <style>{`
                @media print {
                    .receipt-page .no-print { display: none !important; }
                    .receipt-page { background: #ffffff !important; color: #000000 !important; }
                    .receipt-page table { border-color: #000000 !important; }
                    .receipt-page th, .receipt-page td { color: #000000 !important; }
                }
            `}</style>
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Receipt</h2>
                        <p className="text-sm text-gray-500">#{sale.receipt_number || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadPdf}
                        className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1.5"
                    >
                        <Download size={14} /> Download PDF
                    </button>
                    <button
                        onClick={handlePrint}
                        className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1.5"
                    >
                        <Printer size={14} /> Print
                    </button>
                </div>
            </div>

            {/* Receipt */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                    {/* Header */}
                    <div className="border-b-3 border-sky-400 pb-6 mb-6">
                        <div className="text-2xl font-bold text-sky-600">PharmaSys</div>
                        <div className="text-sm text-gray-500">Inventory Management System</div>
                    </div>

                    {/* Receipt Info */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Receipt</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-gray-500">Receipt Number</span>
                                <p className="font-medium text-gray-800">{sale.receipt_number || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Date</span>
                                <p className="font-medium text-gray-800">
                                    {new Date(sale.sale_date).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Cashier</span>
                                <p className="font-medium text-gray-800">{sale.cashier_name || 'Unknown'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Customer</span>
                                <p className="font-medium text-gray-800">{sale.customer_name || 'Walk-in Customer'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-6">
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700">Medicine list</h4>
                            <p className="text-xs text-gray-500">Items purchased in this sale</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-sky-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">Medicine</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Price</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items?.map((item, idx) => (
                                    <tr key={item.id || idx} className="border-b border-gray-50">
                                        <td className="px-4 py-3">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium">{item.itemable?.name || item.medicine?.name || 'N/A'}</td>
                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">${parseFloat(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 pt-4 mb-6 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="font-bold text-lg text-gray-800">${parseFloat(sale.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <PaymentIcon size={14} /> Payment Method
                            </span>
                            <span className="text-gray-800">{paymentLabel}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Amount Paid</span>
                            <span className="text-gray-800">${amountPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Change</span>
                            <span className="text-green-600 font-semibold">${changeAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Thank You */}
                    <div className="border-t border-dashed border-gray-300 pt-6 text-center">
                        <p className="text-lg font-bold text-sky-600">Thank you for shopping with us.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
