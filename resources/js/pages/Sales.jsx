// resources/js/pages/Sales.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    Plus, Trash2, Barcode, Camera, Loader2, Search, X, 
    ShoppingCart, User, Phone, CreditCard, Receipt,
    CheckCircle, AlertCircle, Package, DollarSign
} from 'lucide-react';

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);
    const searchRef = useRef(null);

    // Sale form state
    const [saleItems, setSaleItems] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadSales();
        loadMedicines();
    }, []);

    const loadSales = () => {
        setLoading(true);
        api.get('/sales')
            .then(r => setSales(r.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const loadMedicines = () => {
        api.get('/medicines')
            .then(r => setMedicines(r.data))
            .catch(err => console.error(err));
    };

    // Search medicines
    useEffect(() => {
        if (searchTerm.length > 1) {
            const results = medicines.filter(m => 
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.barcode?.includes(searchTerm)
            );
            setSearchResults(results.slice(0, 10));
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, medicines]);

    const findMedicineByBarcode = (barcode) => {
        return medicines.find(m => m.barcode === barcode);
    };

    const addMedicineToCart = (medicine) => {
        // Check stock
        if (medicine.quantity <= 0) {
            window.showToast('Out of stock!', 'error');
            return;
        }

        const existing = saleItems.find(item => item.medicine_id === medicine.id);
        if (existing) {
            if (existing.quantity >= medicine.quantity) {
                window.showToast('Not enough stock available!', 'error');
                return;
            }
            setSaleItems(saleItems.map(item =>
                item.medicine_id === medicine.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setSaleItems([...saleItems, {
                medicine_id: medicine.id,
                medicine_name: medicine.name,
                generic_name: medicine.generic_name,
                selling_price: Number(medicine.selling_price) || Number(medicine.unit_price) || 0,
                quantity: 1,
                max_quantity: medicine.quantity,
                stock: medicine.quantity,
            }]);
        }
        setSearchTerm('');
        setSearchResults([]);
        if (searchRef.current) searchRef.current.focus();
        window.showToast(`Added: ${medicine.name}`, 'success');
    };

    const handleBarcodeLookup = () => {
        if (!barcodeInput.trim()) return;
        const medicine = findMedicineByBarcode(barcodeInput.trim());
        if (medicine) {
            addMedicineToCart(medicine);
            setBarcodeInput('');
        } else {
            window.showToast('No medicine found with this barcode', 'error');
        }
    };

    // Barcode scanning
    const startBarcodeScan = async () => {
        if (!('BarcodeDetector' in window)) {
            window.showToast('Barcode scanning not supported in this browser. Type barcode manually.', 'error');
            return;
        }
        setScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            scanBarcodeLoop();
        } catch (err) {
            window.showToast('Could not access camera: ' + err.message, 'error');
            setScanning(false);
        }
    };

    const scanBarcodeLoop = useCallback(async () => {
        if (!scanning) return;
        const detector = new BarcodeDetector({ 
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] 
        });
        try {
            if (videoRef.current) {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                    const code = barcodes[0].rawValue;
                    stopBarcodeScan();
                    const medicine = findMedicineByBarcode(code);
                    if (medicine) {
                        addMedicineToCart(medicine);
                    } else {
                        window.showToast('No medicine found for this barcode', 'error');
                    }
                    return;
                }
            }
            requestAnimationFrame(scanBarcodeLoop);
        } catch (err) {
            requestAnimationFrame(scanBarcodeLoop);
        }
    }, [scanning, saleItems, medicines]);

    const stopBarcodeScan = () => {
        setScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => { 
        return () => stopBarcodeScan(); 
    }, []);

    const handleQuantityChange = (index, qty) => {
        const items = [...saleItems];
        const item = items[index];
        
        if (qty <= 0) { 
            items.splice(index, 1); 
        } else if (qty > item.max_quantity) {
            window.showToast(`Only ${item.max_quantity} available in stock`, 'error');
            return;
        } else {
            items[index].quantity = qty;
        }
        setSaleItems(items);
    };

    const removeItem = (index) => {
        setSaleItems(saleItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        const subtotal = saleItems.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
        const discountAmount = Number(discount) || 0;
        return {
            subtotal: subtotal,
            discount: discountAmount,
            total: subtotal - discountAmount
        };
    };

    const totals = calculateTotal();

    const resetSale = () => {
        setSaleItems([]);
        setBarcodeInput('');
        setSearchTerm('');
        setSearchResults([]);
        setCustomerName('');
        setCustomerPhone('');
        setPaymentMethod('cash');
        setDiscount(0);
        setNotes('');
        setError('');
        setSuccess('');
    };

    const openCreate = () => { 
        resetSale(); 
        setShowModal(true); 
        setTimeout(() => {
            if (searchRef.current) searchRef.current.focus();
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saleItems.length === 0) { 
            setError('Add at least one item'); 
            return; 
        }

        // Check stock availability
        for (const item of saleItems) {
            const medicine = medicines.find(m => m.id === item.medicine_id);
            if (medicine && item.quantity > medicine.quantity) {
                setError(`Not enough stock for ${item.medicine_name}. Available: ${medicine.quantity}`);
                return;
            }
        }

        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const response = await api.post('/sales', {
                items: saleItems.map(item => ({
                    medicine_id: item.medicine_id,
                    quantity: item.quantity,
                    unit_price: item.selling_price,
                })),
                customer_name: customerName || null,
                customer_phone: customerPhone || null,
                payment_method: paymentMethod,
                discount: Number(discount) || 0,
                notes: notes || null,
            });

            window.showToast('Sale completed successfully! 🎉', 'success');
            setShowModal(false);
            loadSales();
            resetSale();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error creating sale');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this sale? This will restore stock quantities.')) return;
        try {
            await api.delete(`/sales/${id}`);
            window.showToast('Sale deleted successfully', 'success');
            loadSales();
        } catch (err) {
            window.showToast('Failed to delete sale', 'error');
        }
    };

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.net_amount || s.total_amount), 0);

    if (loading) {
        return <LoadingSpinner text="Loading sales..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Sales</h2>
                    <p className="text-sm text-gray-500">
                        {sales.length} sales • Total Revenue: <span className="font-semibold text-blue-600">${totalRevenue.toFixed(2)}</span>
                    </p>
                </div>
                <button 
                    onClick={openCreate} 
                    className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                >
                    <Plus size={18} /> New Sale
                </button>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Receipt</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Items</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length > 0 ? sales.map(s => (
                                <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                        {s.receipt_number || `#${s.id}`}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(s.sale_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        {s.customer_name || 'Walk-in Customer'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500">
                                        {s.items?.length || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right">
                                        ${Number(s.net_amount || s.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <span className="capitalize">{s.payment_method || 'cash'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            s.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {s.status || 'completed'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleDelete(s.id)} 
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                                        No sales recorded yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sale Modal */}
            <div className={`fixed inset-0 z-50 ${showModal ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
                <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <ShoppingCart size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">New Sale</h3>
                                <p className="text-xs text-gray-400">Scan or search medicines to add</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setShowModal(false); stopBarcodeScan(); }} 
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100 flex items-start gap-2">
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Search & Barcode Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Search Medicine</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            ref={searchRef}
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by name, generic, or barcode..."
                                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        />
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {searchResults.map(medicine => (
                                                <div
                                                    key={medicine.id}
                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                                    onClick={() => addMedicineToCart(medicine)}
                                                >
                                                    <div>
                                                        <span className="font-medium">{medicine.name}</span>
                                                        <span className="text-xs text-gray-400 ml-2">{medicine.generic_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="text-gray-500">${Number(medicine.selling_price || medicine.unit_price).toFixed(2)}</span>
                                                        <span className={`text-xs ${medicine.quantity <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                            {medicine.quantity} in stock
                                                        </span>
                                                        <button 
                                                            type="button"
                                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                                            onClick={(e) => { e.stopPropagation(); addMedicineToCart(medicine); }}
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Barcode Scanner</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={barcodeInput}
                                                onChange={(e) => setBarcodeInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeLookup(); } }}
                                                placeholder="Type barcode or scan"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleBarcodeLookup} 
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                        >
                                            <Search size={16} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={startBarcodeScan} 
                                            disabled={scanning} 
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                                        >
                                            {scanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                        </button>
                                    </div>
                                    {scanning && (
                                        <div className="mt-2 relative">
                                            <video ref={videoRef} className="w-full max-w-xs rounded-lg border-2 border-blue-400" />
                                            <button 
                                                type="button" 
                                                onClick={stopBarcodeScan} 
                                                className="mt-1 text-xs text-red-600 hover:underline"
                                            >
                                                Cancel scan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">Cart Items ({saleItems.length})</span>
                                    <span className="text-sm text-gray-500">Subtotal: ${totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-blue-50">
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase">Medicine</th>
                                                <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase">Price</th>
                                                <th className="px-4 py-2 text-center text-xs font-semibold text-blue-700 uppercase w-24">Qty</th>
                                                <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase">Subtotal</th>
                                                <th className="px-4 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {saleItems.map((item, i) => (
                                                <tr key={i} className="hover:bg-blue-50/30">
                                                    <td className="px-4 py-2.5">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-800">{item.medicine_name}</div>
                                                            <div className="text-xs text-gray-400">{item.generic_name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-sm text-right">${item.selling_price.toFixed(2)}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                                                                onClick={() => handleQuantityChange(i, item.quantity - 1)}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => handleQuantityChange(i, parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                max={item.max_quantity}
                                                                className="w-12 px-1 py-1 border border-gray-200 rounded text-sm text-center focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                                                                onClick={() => handleQuantityChange(i, item.quantity + 1)}
                                                                disabled={item.quantity >= item.max_quantity}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Stock: {item.max_quantity}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-sm text-right font-semibold">${(item.selling_price * item.quantity).toFixed(2)}</td>
                                                    <td className="px-4 py-2.5">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeItem(i)} 
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {saleItems.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-sm">
                                                        No items added. Search or scan medicines to add.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Customer & Payment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Walk-in Customer"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="Phone number"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="insurance">Insurance</option>
                                            <option value="transfer">Transfer</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Discount ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="2"
                                    placeholder="Additional notes..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                />
                            </div>

                            {/* Total & Actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="text-sm text-gray-500">Subtotal:</span>
                                        <span className="ml-2 font-semibold">${totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div>
                                            <span className="text-sm text-gray-500">Discount:</span>
                                            <span className="ml-2 font-semibold text-red-500">-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="text-lg font-bold text-blue-600">
                                        Total: ${totals.total.toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); stopBarcodeScan(); }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || saleItems.length === 0}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <><Loader2 size={16} className="animate-spin" /> Processing...</>
                                        ) : (
                                            <><CheckCircle size={16} /> Complete Sale</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}