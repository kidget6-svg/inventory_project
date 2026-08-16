import React, { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
    Warehouse, Package, Boxes, Layers, Truck, 
    Plus, Search, Filter, Eye, Edit, Trash2, 
    RefreshCw, Download, Printer, CheckCircle,
    XCircle, Clock, AlertTriangle, Calendar,
    Upload, ArrowUpRight, ArrowDownRight,
    Building2, User, FileText, Barcode,
    ChevronDown, ChevronRight
} from 'lucide-react';

const tabs = [
    { id: 'shelves', label: 'Shelves', icon: Layers },
    { id: 'stock', label: 'Stock Inventory', icon: Boxes },
    { id: 'receiving', label: 'Receiving History', icon: Upload },
    { id: 'transfers', label: 'Transfer Requests', icon: Truck },
];

export default function WarehousePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('shelves');
    const [stats, setStats] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [stock, setStock] = useState([]);
    const [receivingHistory, setReceivingHistory] = useState([]);
    const [transferRequests, setTransferRequests] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [showReceivingModal, setShowReceivingModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [batchData, setBatchData] = useState({
        batch_number: '',
        expiry_date: '',
        quantity: '',
        shelf_id: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        supplier_id: '',
        date_from: '',
        date_to: '',
    });

    // Helper to safely extract array from API response
    const asArray = (res) => {
        const d = res.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.data)) return d.data;
        return [];
    };

    // Load all warehouse data
    const loadWarehouseData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [statsRes, shelvesRes, stockRes, receivingRes, transfersRes, poRes] = await Promise.all([
                api.get('/warehouse/stats'),
                api.get('/warehouse/shelves'),
                api.get('/warehouse/stock', { params: filters }),
                api.get('/warehouse/receiving-history', { params: filters }),
                api.get('/warehouse/transfer-requests'),
                api.get('/purchase-orders', { params: { status: ['approved', 'sent'] } }),
            ]);

            setStats(statsRes.data);
            setShelves(asArray(shelvesRes));
            setStock(asArray(stockRes));
            setReceivingHistory(asArray(receivingRes));
            setTransferRequests(asArray(transfersRes));
            setPurchaseOrders(asArray(poRes));
        } catch (err) {
            setError('Failed to load warehouse data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadWarehouseData();
    }, [loadWarehouseData]);

    // Handle receiving stock
    const handleReceiveStock = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/warehouse/receive', {
                purchase_order_id: selectedPO.id,
                batch_number: batchData.batch_number,
                expiry_date: batchData.expiry_date,
                quantity: batchData.quantity,
                shelf_id: batchData.shelf_id || null,
            });
            window.showToast('Stock received successfully', 'success');
            setShowReceivingModal(false);
            setSelectedPO(null);
            setBatchData({ batch_number: '', expiry_date: '', quantity: '', shelf_id: '' });
            loadWarehouseData();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to receive stock', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle transfer approval
    const handleApproveTransfer = async (transferId) => {
        if (!confirm('Approve this transfer request?')) return;
        try {
            await api.post(`/warehouse/transfer/${transferId}/approve`);
            window.showToast('Transfer approved successfully', 'success');
            loadWarehouseData();
        } catch (err) {
            window.showToast('Failed to approve transfer', 'error');
        }
    };

    // Handle transfer completion
    const handleCompleteTransfer = async (transferId) => {
        if (!confirm('Mark this transfer as completed?')) return;
        try {
            await api.post(`/warehouse/transfer/${transferId}/complete`);
            window.showToast('Transfer completed successfully', 'success');
            loadWarehouseData();
        } catch (err) {
            window.showToast('Failed to complete transfer', 'error');
        }
    };

    // Render summary cards
    const renderStats = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg">
                        <Package className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.total_medicines || 0}</p>
                        <p className="text-xs text-gray-500">Total Medicines</p>
                    </div>
                </div>
            </div>
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Boxes className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.total_stock || 0}</p>
                        <p className="text-xs text-gray-500">Total Stock Units</p>
                    </div>
                </div>
            </div>
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Layers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.total_shelves || 0}</p>
                        <p className="text-xs text-gray-500">Total Shelves</p>
                    </div>
                </div>
            </div>
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-600">{stats?.low_stock || 0}</p>
                        <p className="text-xs text-gray-500">Low Stock</p>
                    </div>
                </div>
            </div>
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-600">{stats?.pending_requests || 0}</p>
                        <p className="text-xs text-gray-500">Pending Requests</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render receiving section
    const renderReceivingSection = () => (
        <div className="card p-5 mb-6 border-2 border-dashed border-sky-200 bg-sky-50/30">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Upload size={16} className="text-sky-600" />
                Receive Shipment
            </h3>
            <div className="flex flex-wrap gap-3">
                <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                    value={selectedPO?.id || ''}
                    onChange={(e) => {
                        const po = purchaseOrders.find(p => p.id === parseInt(e.target.value));
                        setSelectedPO(po);
                    }}
                >
                    <option value="">Select Purchase Order</option>
                    {purchaseOrders.map(po => (
                        <option key={po.id} value={po.id}>
                            PO-{po.id} - {po.supplier?.name || 'Unknown'}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setShowReceivingModal(true)}
                    disabled={!selectedPO}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
                >
                    Receive Stock
                </button>
            </div>
        </div>
    );

    // Render shelves tab
    const renderShelves = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shelves.map(shelf => {
                const utilization = shelf.utilization || 0;
                const color = utilization >= 90 ? 'bg-red-500' :
                             utilization >= 70 ? 'bg-amber-500' :
                             utilization >= 50 ? 'bg-yellow-500' : 'bg-sky-500';
                return (
                    <div key={shelf.id} className="card p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">{shelf.name}</h4>
                                <p className="text-xs text-gray-500">{shelf.shelf_location}</p>
                            </div>
                            <span className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${
                                utilization >= 90 ? 'bg-red-100 text-red-700' :
                                utilization >= 70 ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {utilization}%
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${color}`}
                                    style={{ width: `${utilization}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{shelf.current_items || 0} items</span>
                                <span>Capacity: {shelf.capacity || 100}</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
                            <span className="text-gray-500">Status: {shelf.status || 'Active'}</span>
                            <button className="text-sky-600 hover:underline">View Details</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // Render stock inventory
    const renderStock = () => (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Batch</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Shelf</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Expiry</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stock.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50/30">
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{item.batch_number || '---'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{item.shelf_location || '---'}</td>
                                <td className="px-4 py-3 text-center text-sm font-semibold">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '---'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        item.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' :
                                        item.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {item.stock_status?.replace('_', ' ') || 'Active'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render receiving history
    const renderReceivingHistory = () => (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PO Number</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Supplier</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Batch</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {receivingHistory.map(record => (
                            <tr key={record.id} className="hover:bg-gray-50/30">
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {new Date(record.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">PO-{record.purchase_order_id}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{record.supplier?.name || '---'}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{record.medicine?.name || '---'}</td>
                                <td className="px-4 py-3 text-center text-sm font-semibold">{record.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{record.batch_number || '---'}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        Completed
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render transfer requests
    const renderTransfers = () => (
        <div className="space-y-4">
            {transferRequests.map(request => (
                <div key={request.id} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Truck className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">
                                {request.medicine?.name || 'Unknown Medicine'}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Building2 size={12} /> To: {request.to_branch?.name || 'Branch'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Package size={12} /> Qty: {request.quantity}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User size={12} /> By: {request.requested_by?.name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            request.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            request.status === 'in_transit' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                            {request.status?.replace('_', ' ') || 'Pending'}
                        </span>
                        {request.status === 'pending' && (
                            <button
                                onClick={() => handleApproveTransfer(request.id)}
                                className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700"
                            >
                                Approve
                            </button>
                        )}
                        {request.status === 'in_transit' && (
                            <button
                                onClick={() => handleCompleteTransfer(request.id)}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                            >
                                Complete
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {transferRequests.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No transfer requests</p>
                </div>
            )}
        </div>
    );

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'shelves': return renderShelves();
            case 'stock': return renderStock();
            case 'receiving': return renderReceivingHistory();
            case 'transfers': return renderTransfers();
            default: return null;
        }
    };

    if (loading) return <LoadingSpinner text="Loading warehouse data..." />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Warehouse size={24} className="text-sky-600" />
                        Warehouse
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage central inventory, receiving, and transfers</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadWarehouseData} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
                        <RefreshCw size={16} />
                    </button>
                    <button className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 flex items-center gap-2">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Stats */}
            {stats && renderStats()}

            {/* Receiving Section */}
            {renderReceivingSection()}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto gap-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${
                                    isActive
                                        ? 'bg-sky-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Receiving Modal */}
            <Modal
                open={showReceivingModal}
                onClose={() => setShowReceivingModal(false)}
                title="Receive Stock"
                size="max-w-md"
            >
                <form onSubmit={handleReceiveStock} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Order</label>
                        <p className="text-sm font-medium text-gray-800">PO-{selectedPO?.id} - {selectedPO?.supplier?.name}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Number *</label>
                        <input
                            type="text"
                            value={batchData.batch_number}
                            onChange={(e) => setBatchData({ ...batchData, batch_number: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date *</label>
                        <input
                            type="date"
                            value={batchData.expiry_date}
                            onChange={(e) => setBatchData({ ...batchData, expiry_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity Received *</label>
                        <input
                            type="number"
                            value={batchData.quantity}
                            onChange={(e) => setBatchData({ ...batchData, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location (Warehouse vs Branch)</label>
                        <select
                            value={batchData.shelf_id}
                            onChange={(e) => setBatchData({ ...batchData, shelf_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 outline-none bg-white"
                        >
                            <option value="">Select Shelf (Optional)</option>
                            {shelves.map(shelf => (
                                <option key={shelf.id} value={shelf.id}>
                                    {shelf.shelf_location} {shelf.branch_id ? '(Branch Shelf)' : '(Warehouse Shelf)'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowReceivingModal(false)} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Receiving...</> : <><CheckCircle size={16} /> Confirm Receiving</>}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}