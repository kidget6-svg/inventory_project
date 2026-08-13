 import React, { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { Search, Filter, Calendar, Download, Printer, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

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

const STATUS_LABELS = {
    pending: 'Pending',
    pending_cashier: 'Pending Cashier',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    pending_cashier: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

export default function SalesHistory() {
    const { user } = useAuth();
    const isCashier = user?.role === 'cashier';

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        date: '',
        cashier: '',
        payment_method: '',
        status: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [cashiers, setCashiers] = useState([]);

    // Detail Modal state
    const [selectedSale, setSelectedSale] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchSales = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filters.date) params.append('date', filters.date);
            if (filters.cashier) params.append('cashier', filters.cashier);
            if (filters.payment_method) params.append('payment_method', filters.payment_method);
            if (filters.status) params.append('status', filters.status);
            params.append('page', page);

            const res = await api.get(`/sales/history?${params.toString()}`);
            const data = res.data;
            setSales(data.data || []);
            setLastPage(data.last_page || 1);
            setCurrentPage(data.current_page || page);
        } catch (err) {
            window.showToast('Failed to load sales history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCashiers = async () => {
        try {
            const res = await api.get('/reports');
            setCashiers(res.data.cashiers || []);
        } catch (err) {
            console.error('Failed to fetch cashiers', err);
        }
    };

    useEffect(() => {
        fetchCashiers();
    }, []);

    useEffect(() => {
        fetchSales(1);
    }, [searchTerm, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ date: '', cashier: '', payment_method: '', status: '' });
    };

    // 👁 View Sale Detail Modal
    const handleViewReceipt = async (saleId) => {
        setModalLoading(true);
        setShowViewModal(true);
        try {
            const res = await api.get(`/sales/${saleId}/receipt`);
            setSelectedSale(res.data);
        } catch (err) {
            console.error(err);
            window.showToast('Failed to load sale details', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    // ⬇ Download PDF via authenticated Axios Request
    const handleDownloadPdf = async (saleId, receiptNumber) => {
        try {
            window.showToast('Generating PDF...', 'info');
            const res = await api.get(`/sales/${saleId}/receipt/pdf`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${receiptNumber || saleId}.pdf`;
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

    // 🖨 Print Receipt via authenticated Axios Request
    const handlePrint = async (saleId) => {
        try {
            window.showToast('Preparing printable receipt...', 'info');
            const res = await api.get(`/sales/${saleId}/receipt/print`);
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

    // Export PDF or CSV via authenticated Axios Request
    const handleExport = async (type, format) => {
        try {
            window.showToast(`Exporting ${format.toUpperCase()}...`, 'info');
            const params = new URLSearchParams();
            params.append('type', type);
            params.append('format', format);
            if (filters.date) params.append('date', filters.date);
            if (filters.payment_method) params.append('payment_method', filters.payment_method);

            const res = await api.get(`/sales/export?${params.toString()}`, { responseType: 'blob' });
            const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
            const blob = new Blob([res.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sales-report.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            window.showToast(`Sales report exported as ${format.toUpperCase()}`, 'success');
        } catch (err) {
            console.error(err);
            window.showToast('Failed to export sales report', 'error');
        }
    };

    if (loading) return <LoadingSpinner text="Loading sales history..." />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
                    <p className="text-sm text-gray-500">
                        {isCashier ? 'View your completed sales transactions' : 'View all completed sales transactions'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('sales', 'pdf')}
                        className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1.5"
                    >
                        <Download size={14} /> Export PDF
                    </button>
                    <button
                        onClick={() => handleExport('sales', 'csv')}
                        className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1.5"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by receipt number or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="w-full sm:w-40">
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>

                    {/* Cashier Filter (Admin only) */}
                    {!isCashier && (
                        <div className="w-full sm:w-40">
                            <select
                                value={filters.cashier}
                                onChange={(e) => handleFilterChange('cashier', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                            >
                                <option value="">All Cashiers</option>
                                {cashiers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Payment Method Filter */}
                    <div className="w-full sm:w-44">
                        <select
                            value={filters.payment_method}
                            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        >
                            <option value="">All Payment Methods</option>
                            {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-36">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        >
                            <option value="">All Statuses</option>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <button
                        onClick={clearFilters}
                        className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5"
                    >
                        <Filter size={14} /> Clear
                    </button>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cashier</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sales.length > 0 ? (
                                sales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            {sale.receipt_number || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(sale.sale_date).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {sale.cashier_name || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {sale.customer_name || 'Walk-in Customer'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {PAYMENT_LABELS[sale.payment_method] || sale.payment_method || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                                            ${parseFloat(sale.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[sale.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABELS[sale.status] || sale.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleViewReceipt(sale.id)}
                                                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                    title="View Sale Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(sale.id, sale.receipt_number)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download PDF Receipt"
                                                >
                                                    <Download size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(sale.id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Print Receipt"
                                                >
                                                    <Printer size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                                        No sales found. Try adjusting your search or filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {lastPage}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchSales(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => fetchSales(currentPage + 1)}
                                disabled={currentPage >= lastPage}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sale Details Modal */}
            <Modal
                open={showViewModal}
                onClose={() => setShowViewModal(false)}
                title={`Sale Details ${selectedSale?.receipt_number ? '#' + selectedSale.receipt_number : ''}`}
                size="max-w-2xl"
            >
                {modalLoading ? (
                    <LoadingSpinner text="Loading sale details..." />
                ) : selectedSale ? (
                    <div className="space-y-6">
                        {/* Header Badges */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                            <div>
                                <h4 className="text-xl font-bold text-gray-800">
                                    {selectedSale.receipt_number || 'No Receipt Number'}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {new Date(selectedSale.sale_date).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedSale.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {STATUS_LABELS[selectedSale.status] || selectedSale.status}
                                </span>
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 capitalize">
                                    {selectedSale.type || 'Standard'} Sale
                                </span>
                            </div>
                        </div>

                        {/* Sale Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <span className="block text-xs font-semibold text-gray-400">Cashier</span>
                                <p className="font-medium text-gray-800">{selectedSale.cashier_name || selectedSale.user?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-400">Customer</span>
                                <p className="font-medium text-gray-800">{selectedSale.customer_name || 'Walk-in Customer'}</p>
                            </div>
                            {selectedSale.customer_phone && (
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400">Customer Phone</span>
                                    <p className="text-gray-700">{selectedSale.customer_phone}</p>
                                </div>
                            )}
                            {selectedSale.customer_email && (
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400">Customer Email</span>
                                    <p className="text-gray-700">{selectedSale.customer_email}</p>
                                </div>
                            )}
                            <div>
                                <span className="block text-xs font-semibold text-gray-400">Payment Method</span>
                                <p className="font-medium text-gray-800">{PAYMENT_LABELS[selectedSale.payment_method] || selectedSale.payment_method || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-400">Payment Status</span>
                                <p className="font-medium text-emerald-600 capitalize">{selectedSale.payment_status || 'Paid'}</p>
                            </div>
                        </div>

                        {/* Purchased Items */}
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Purchased Items ({selectedSale.items?.length || 0})</h5>
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-sky-50 border-b border-sky-100 text-xs font-semibold text-sky-700 uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Item</th>
                                            <th className="px-3 py-2 text-center">Qty</th>
                                            <th className="px-3 py-2 text-right">Unit Price</th>
                                            <th className="px-3 py-2 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedSale.items && selectedSale.items.length > 0 ? (
                                            selectedSale.items.map((item, idx) => (
                                                <tr key={item.id || idx}>
                                                    <td className="px-3 py-2 font-medium text-gray-800">
                                                        {item.itemable?.name || item.medicine?.name || 'Product'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-gray-600">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right text-gray-600">${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-right font-medium text-gray-800">${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-3 py-4 text-center text-gray-400">No items in this sale</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Totals */}
                        <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                <span>Total Amount:</span>
                                <span>${parseFloat(selectedSale.total_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Amount Paid:</span>
                                <span>${parseFloat(selectedSale.amount_paid || selectedSale.total_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-semibold">
                                <span>Change:</span>
                                <span>${parseFloat(selectedSale.change_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleDownloadPdf(selectedSale.id, selectedSale.receipt_number)}
                                className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5"
                            >
                                <Download size={14} /> Download PDF
                            </button>
                            <button
                                onClick={() => handlePrint(selectedSale.id)}
                                className="btn-primary px-3 py-2 text-sm flex items-center gap-1.5"
                            >
                                <Printer size={14} /> Print Receipt
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
