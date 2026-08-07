// resources/js/pages/RetailOTCSales.jsx
//
// Retail & OTC Sales — Pharmacist POS terminal.
//
// Displays OTC / cosmetic product cards on the left and a sticky
// "Retail Draft" panel on the right.  The draft panel contains selected
// products, quantity controls (+/-), remove-item, total price,
// Clear Draft, and Send to Cashier Queue.
//
// The pharmacist cannot complete payment, print receipts, or finalize
// sales.  The draft is sent to the Cashier Payment Queue where the
// cashier completes the transaction.
//
// All shared UI is provided by the reusable components in
// resources/js/components/pos/.

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    PosProductCard,
    PosCartPanel,
} from '../components/pos';
import {
    Search,
    ShoppingBag,
    Send,
    Package,
} from 'lucide-react';

export default function RetailOTCSales() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ── Data loading ──────────────────────────────────────────────
    useEffect(() => {
        api.get('/retail-products')
            .then(res => setProducts(res.data.data || res.data))
            .catch(err => {
                console.error('Failed to load retail products:', err);
                window.showToast('Failed to load products', 'error');
            })
            .finally(() => setLoading(false));
    }, []);

    // ── Cart helpers ────────────────────────────────────────────
    const priceOf = (p) => Number(p.price ?? 0);

    const addToCart = (product) => {
        if (product.quantity <= 0) {
            return window.showToast('Out of stock', 'error');
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.cartQty + 1 > product.quantity) {
                    window.showToast(`Stock limit reached (${product.quantity})`, 'error');
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, cartQty: item.cartQty + 1 }
                        : item
                );
            }
            return [...prev, { ...product, cartQty: 1 }];
        });
    };

    const incrementQty = (item, maxStock) => {
        setCart(prev => prev.map(i => {
            if (i.id === item.id) {
                if (i.cartQty + 1 > maxStock) {
                    window.showToast(`Stock limit reached (${maxStock})`, 'error');
                    return i;
                }
                return { ...i, cartQty: i.cartQty + 1 };
            }
            return i;
        }));
    };

    const decrementQty = (item) => {
        setCart(prev => prev.map(i =>
            i.id === item.id
                ? { ...i, cartQty: Math.max(1, i.cartQty - 1) }
                : i
        ));
    };

    const removeFromCart = (item) =>
        setCart(prev => prev.filter(i => i.id !== item.id));

    const clearDraft = () => setCart([]);

    const totalCalculated = cart.reduce(
        (sum, item) => sum + (priceOf(item) * (item.cartQty || 0)),
        0
    );

    const totalItems = cart.reduce(
        (sum, item) => sum + (item.cartQty || 0),
        0
    );

    // ── Submit ────────────────────────────────────────────────────
    const handleSendToCashier = async () => {
        if (cart.length === 0) {
            return window.showToast('Cart is empty', 'error');
        }
        if (cart.some(i => i.cartQty <= 0)) {
            return window.showToast('All items must have quantity > 0', 'error');
        }

        setSubmitting(true);
        try {
            await api.post('/sales/retail-draft', {
                items: cart.map(item => ({
                    id: item.id,
                    cartQty: item.cartQty,
                })),
            });
            window.showToast('Order dispatched to Cashier queue!', 'success');
            setCart([]);
        } catch (err) {
            window.showToast(
                err.response?.data?.message || 'Failed to send order',
                'error'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Search filter ────────────────────────────────────────────
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return <LoadingSpinner text="Opening retail terminal..." />;
    }

    return (
        <div className="pos-layout">
            {/* ── Left: Product Selection ── */}
            <div className="pos-main">
                {/* Page header */}
                <div className="pos-page-header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <ShoppingBag size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Retail &amp; OTC Sales
                            </h2>
                            <p className="text-sm text-gray-500">
                                Browse OTC products and send to cashier queue
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pos-search-input"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>

                {/* Product cards */}
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Package size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No products found</p>
                        <p className="text-xs mt-1">
                            Try adjusting your search terms
                        </p>
                    </div>
                ) : (
                    <div className="pos-product-grid">
                        {filtered.map(prod => (
                            <PosProductCard
                                key={prod.id}
                                item={prod}
                                price={priceOf(prod)}
                                onAdd={addToCart}
                                addLabel="Add to Draft"
                                image={prod.image_url}
                                imageAlt={prod.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Right: Retail Draft (sticky) ── */}
            <div className="pos-sidebar">
                <PosCartPanel
                    title="Retail Draft"
                    titleIcon={ShoppingBag}
                    titleColor="text-emerald-600"
                    headerBg="bg-emerald-50"
                    headerBorder="border-emerald-200"
                    clearLabel="Clear Draft"
                    onClear={clearDraft}
                    items={cart}
                    priceOf={priceOf}
                    onIncrement={incrementQty}
                    onDecrement={decrementQty}
                    onRemove={removeFromCart}
                    showQtyInput={false}
                    total={totalCalculated}
                    totalItems={totalItems}
                    actionIcon={Send}
                    actionLabel="Send to Cashier Queue"
                    onAction={handleSendToCashier}
                    actionDisabled={cart.length === 0 || submitting}
                    actionLoading={submitting}
                    emptyMessage="Retail draft is empty"
                    emptySubMessage="Select products from the catalog to begin"
                    emptyIcon={ShoppingBag}
                />
            </div>
        </div>
    );
}
