// resources/js/pages/PrescriptionSales.jsx

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Plus, Minus, Trash2, Send, ShoppingBag } from 'lucide-react';

export default function PrescriptionSales() {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/medicines')
            .then(res => setMedicines(res.data.data || res.data))
            .catch(() => window.showToast('Failed to load medicines', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const addToCart = (med) => {
        if (med.quantity <= 0) return window.showToast('Out of stock', 'error');

        setCart(prev => {
            const existing = prev.find(item => item.id === med.id);
            if (existing) {
                if (existing.cartQty + 1 > med.quantity) {
                    window.showToast(`Stock limit reached (${med.quantity})`, 'error');
                    return prev;
                }
                return prev.map(item => item.id === med.id ? { ...item, cartQty: item.cartQty + 1 } : item);
            }
            return [...prev, { ...med, cartQty: 1 }];
        });
    };

    const handleQtyInput = (id, newQty, maxStock) => {
        const parsed = parseInt(newQty) || 0;
        if (parsed > maxStock) {
            window.showToast(`Cannot exceed available stock of ${maxStock}`, 'error');
            return;
        }
        setCart(prev => prev.map(item => item.id === id ? { ...item, cartQty: parsed } : item));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const totalCalculated = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.cartQty || 0)), 0);

    const handleSendToCashier = async () => {
        if (cart.length === 0) return window.showToast('Cart is empty', 'error');
        if (cart.some(i => i.cartQty <= 0)) return window.showToast('All items must have quantity > 0', 'error');

        setSubmitting(true);
        try {
            await api.post('/sales/prescription', {
                items: cart.map(item => ({
                    medicine_id: item.id,
                    quantity: item.cartQty
                }))
            });
            window.showToast('Order dispatched to Cashier queue!', 'success');
            setCart([]);
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to send order', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <LoadingSpinner text="Opening prescription terminal..." />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Inventory Selection */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">💊 Dispense Medications</h2>
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search medication..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filtered.map(med => (
                        <div key={med.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                            <div>
                                <h3 className="font-bold text-gray-800">{med.name}</h3>
                                <p className="text-xs text-gray-400">{med.category?.name || 'Rx Medicine'}</p>
                                <div className="mt-3 flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-700">${parseFloat(med.price).toFixed(2)}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${med.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        Stock: {med.quantity}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => addToCart(med)}
                                disabled={med.quantity <= 0}
                                className="mt-4 btn-primary text-xs py-2 w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <Plus size={14} /> Add to Prescription
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Cart Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <ShoppingBag size={18} /> Prescription Draft
                </h3>

                {cart.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-6">Select medicines from list to begin.</p>
                ) : (
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {cart.map(item => (
                            <div key={item.id} className="py-3 flex items-center justify-between gap-2">
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-400">${parseFloat(item.price).toFixed(2)} / unit</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max={item.quantity}
                                        value={item.cartQty}
                                        onChange={(e) => handleQtyInput(item.id, e.target.value, item.quantity)}
                                        className="w-14 text-center border border-gray-200 rounded-lg text-sm font-semibold p-1"
                                    />
                                    <span className="text-xs font-bold text-gray-700 min-w-[50px] text-right">
                                        ${(parseFloat(item.price) * (item.cartQty || 0)).toFixed(2)}
                                    </span>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-700">Total Price:</span>
                        <span className="text-green-600">${totalCalculated.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleSendToCashier}
                        disabled={cart.length === 0 || submitting}
                        className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Send size={16} /> Send to Cashier Queue
                    </button>
                </div>
            </div>
        </div>
    );
}