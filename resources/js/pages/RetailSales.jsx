// resources/js/pages/RetailSales.jsx

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Sparkles, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

export default function RetailSales() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/retail-products')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.map(p => p.id === product.id ? { ...p, cartQty: p.cartQty + 1 } : p);
            }
            return [...prev, { ...product, cartQty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.cartQty + delta;
                return newQty > 0 ? { ...item, cartQty: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const grandTotal = cart.reduce((acc, item) => acc + (item.price * item.cartQty), 0);

    const handleCheckout = async () => {
        try {
            await api.post('/sales/retail', { items: cart, total: grandTotal });
            window.showToast('Retail sale processed successfully', 'success');
            setCart([]);
        } catch (err) {
            window.showToast('Failed to complete sale', 'error');
        }
    };

    if (loading) return <LoadingSpinner text="Loading retail catalog..." />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catalog */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Cosmetics & OTC Store</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(prod => (
                        <div key={prod.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                            <div>
                                <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                    {prod.category}
                                </span>
                                <h3 className="font-bold text-gray-800 mt-2">{prod.name}</h3>
                                <p className="text-sm text-gray-500">${prod.price}</p>
                            </div>
                            <button
                                onClick={() => addToCart(prod)}
                                className="mt-4 w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                            >
                                <Plus size={14} /> Add to Order
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingCart size={18} /> Retail Checkout
                </h3>
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {cart.map(item => (
                        <div key={item.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-400">${item.price} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-gray-100 rounded">
                                    <Minus size={14} />
                                </button>
                                <span className="text-sm font-semibold">{item.cartQty}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-gray-100 rounded">
                                    <Plus size={14} />
                                </button>
                                <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between font-bold text-lg text-gray-800">
                        <span>Total:</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full btn-primary py-2.5 text-sm"
                    >
                        Complete Retail Sale
                    </button>
                </div>
            </div>
        </div>
    );
}