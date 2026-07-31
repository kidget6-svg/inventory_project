import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../axios';
import Modal from '../components/Modal';
import { Plus, Trash2, Barcode, Camera, Loader2, Search, X } from 'lucide-react';

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef(null);

    const [saleItems, setSaleItems] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');

    useEffect(() => { loadSales(); loadMedicines(); }, []);

    const loadSales = () => api.get('/sales').then(r => setSales(r.data)).catch(err => console.error(err));
    const loadMedicines = () => api.get('/medicines').then(r => setMedicines(r.data)).catch(err => console.error(err));

    const findMedicineByBarcode = (barcode) => {
        return medicines.find(m => m.barcode === barcode);
    };

    const handleBarcodeLookup = () => {
        if (!barcodeInput.trim()) return;
        const medicine = findMedicineByBarcode(barcodeInput.trim());
        if (medicine) {
            const existing = saleItems.find(item => item.medicine_id === medicine.id);
            if (existing) {
                setSaleItems(saleItems.map(item =>
                    item.medicine_id === medicine.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                setSaleItems([...saleItems, {
                    medicine_id: medicine.id,
                    medicine_name: medicine.name,
                    selling_price: Number(medicine.selling_price) || 0,
                    quantity: 1,
                }]);
            }
            setBarcodeInput('');
            window.showToast(`Added: ${medicine.name}`, 'success');
        } else {
            window.showToast('No medicine found with this barcode', 'error');
        }
    };

    const startBarcodeScan = async () => {
        if (!('BarcodeDetector' in window)) {
            window.showToast('Barcode scanning not supported in this browser. Type barcode manually.', 'error');
            return;
        }
        setScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] });
        try {
            if (videoRef.current) {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                    const code = barcodes[0].rawValue;
                    stopBarcodeScan();
                    const medicine = findMedicineByBarcode(code);
                    if (medicine) {
                        const existing = saleItems.find(item => item.medicine_id === medicine.id);
                        if (existing) {
                            setSaleItems(saleItems.map(item =>
                                item.medicine_id === medicine.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ));
                        } else {
                            setSaleItems([...saleItems, {
                                medicine_id: medicine.id,
                                medicine_name: medicine.name,
                                selling_price: Number(medicine.selling_price) || 0,
                                quantity: 1,
                            }]);
                        }
                        window.showToast(`Scanned: ${medicine.name}`, 'success');
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

    useEffect(() => { return () => stopBarcodeScan(); }, []);

    const handleQuantityChange = (index, qty) => {
        const items = [...saleItems];
        if (qty <= 0) { items.splice(index, 1); }
        else { items[index].quantity = qty; }
        setSaleItems(items);
    };

    const removeItem = (index) => {
        setSaleItems(saleItems.filter((_, i) => i !== index));
    };

    const totalAmount = saleItems.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

    const resetSale = () => {
        setSaleItems([]);
        setBarcodeInput('');
        setError('');
    };

    const openCreate = () => { resetSale(); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saleItems.length === 0) { setError('Add at least one item'); return; }
        setError('');
        setSubmitting(true);
        try {
            await api.post('/sales', {
                sale_date: new Date().toISOString().split('T')[0],
                total_amount: totalAmount,
                items: saleItems.map(item => ({
                    medicine_id: item.medicine_id,
                    quantity: item.quantity,
                    unit_price: item.selling_price,
                })),
            });
            window.showToast('Sale created successfully', 'success');
            setShowModal(false);
            loadSales();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error creating sale');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this sale?')) return;
        await api.delete(`/sales/${id}`);
        loadSales();
    };

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-700">
                    All Sales ({sales.length}) | Total Revenue: <span className="text-blue-500">${totalRevenue.toFixed(2)}</span>
                </h3>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Sale</button>
            </div>

            <Modal open={showModal} onClose={() => { setShowModal(false); stopBarcodeScan(); }} title="New Sale" size="max-w-2xl">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Scan or Enter Barcode</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeLookup(); } }}
                                    placeholder="Scan or type barcode and press Enter"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-mono"
                                />
                            </div>
                            <button type="button" onClick={handleBarcodeLookup} className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition-colors">
                                <Search size={16} />
                            </button>
                            <button type="button" onClick={startBarcodeScan} disabled={scanning} className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition-colors flex items-center gap-1.5 disabled:opacity-60">
                                {scanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                            </button>
                        </div>
                        {scanning && (
                            <div className="mt-2 relative">
                                <video ref={videoRef} className="w-full max-w-xs rounded-lg border-2 border-sky-400" />
                                <button type="button" onClick={stopBarcodeScan} className="mt-1 text-xs text-red-600 hover:underline">Cancel scan</button>
                            </div>
                        )}
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-sky-50">
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-sky-700 uppercase">Medicine</th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-sky-700 uppercase">Price</th>
                                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-sky-700 uppercase w-24">Qty</th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-sky-700 uppercase">Subtotal</th>
                                    <th className="px-4 py-2.5 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {saleItems.map((item, i) => (
                                    <tr key={i} className="hover:bg-sky-50/30">
                                        <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{item.medicine_name}</td>
                                        <td className="px-4 py-2.5 text-sm text-right">${item.selling_price.toFixed(2)}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(i, parseInt(e.target.value) || 1)}
                                                min="1"
                                                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-right font-semibold">${(item.selling_price * item.quantity).toFixed(2)}</td>
                                        <td className="px-4 py-2.5">
                                            <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {saleItems.length === 0 && (
                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-sm">Scan or search barcodes to add items</td></tr>
                                )}
                                {saleItems.length > 0 && (
                                    <tr className="bg-gray-50">
                                        <td colSpan="3" className="px-4 py-3 text-sm font-bold text-gray-700 text-right">Total:</td>
                                        <td className="px-4 py-3 text-sm font-bold text-right text-blue-500">${totalAmount.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setShowModal(false); stopBarcodeScan(); }} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting || saleItems.length === 0} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                            {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Complete Sale'}
                        </button>
                    </div>
                </form>
            </Modal>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-sky-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Sale ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">Items</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase">Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(s => (
                            <tr key={s.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                <td className="px-4 py-3 text-sm font-medium">#{s.id}</td>
                                <td className="px-4 py-3 text-sm">{s.sale_date}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{s.items_count || '---'}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-blue-500 text-right">${Number(s.total_amount).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-right">
                                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No sales found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
