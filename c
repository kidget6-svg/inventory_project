// resources/js/pages/RetailSales.jsx
//
// Retail Sales — OTC / Cosmetic POS terminal.
//
// Displays OTC / cosmetic product cards on the left and a sticky
// "Shopping Cart" panel on the right.  The cart contains selected
// products, quantity controls (+/-), remove-item, total price,
// Clear Cart, and a Retail Checkout button that opens the payment
// modal.
//
// Admin and Cashier see exactly the same UI and functionality.
// All shared UI is provided by the reusable components in
// resources/js/components/pos/.

import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    PosProductCard,
    PosCartPanel,
    PosPaymentModal,
    PosSuccessDialog,
} from '../components/pos';
import {
    Search,
    ShoppingBag,
    Sparkles,
    Receipt,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RetailSales() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // ── Data loading ──────────────────────────────────────────────
    useEffect(() => {
        api.get('/retail-products')
            .then(res => setProducts(res.data))
            .catch(err => {
                console.error('Failed to load retail products:', err);
                window.showToast('Failed to load products', 'error');
            })
            .finally(() => setLoading(false));
    }, []);

    // ── Helpers ───────────────────────────────────────────────────
    const priceOf = (p) => Number(p.price ?? 0);

    const findProduct = (id) => products.find(p => p.id === id);

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

    const setExactQty = (item, value) => {
        const product = findProduct(item.id);
        const maxStock = product ? product.quantity : Infinity;
        const num = parseInt(value, 10);

        if (isNaN(num) || num < 1) return;
        if (num > maxStock) {
            window.showToast(`Stock limit reached (${maxStock})`, 'error');
            return;
        }

        setCart(prev =>
            prev.map(i =>
                i.id === item.id ? { ...i, cartQty: num } : i
            )
        );
    };

    const removeFromCart = (item) =>
        setCart(prev => prev.filter(i => i.id !== item.id));

    const clearCart = () => setCart([]);

    const grandTotal = cart.reduce(
        (acc, item) => acc + (priceOf(item) * item.cartQty),
        0
    );

    const totalItems = cart.reduce(
        (acc, item) => acc + item.cartQty,
        0
    );

    // ── Payment flow ─────────────────────────────────────────────
    const openPaymentModal = () => {
        setPaymentMethod('cash');
        setAmountPaid(grandTotal.toFixed(2));
        setPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setPaymentModalOpen(false);
    };

    const handleCompleteSale = async () => {
        const total = grandTotal;
        const paid = parseFloat(amountPaid);

        if (paid < total) {
            window.showToast('Amount paid cannot be less than the total amount', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/sales/retail', {
                items: cart,
                total: grandTotal,
                payment_method: paymentMethod,
                amount_paid: paid,
            });

            const sale = response.data.sale;
            setCompletedSale(sale);
            setPaymentModalOpen(false);
            setSuccessDialogOpen(true);
            setCart([]);
            window.showToast('Retail sale processed successfully', 'success');
        } catch (err) {
            window.showToast(
                err.response?.data?.message || 'Failed to complete sale',
                'error'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Receipt actions ───────────────────────────────────────────
    const handleViewReceipt = () => {
        if (completedSale) {
            navigate(`/receipt/${completedSale.id}`);
        }
    };

    const handleDownloadPdf = () => {
        if (completedSale) {
            window.open(
                `${import.meta.env.VITE_API_URL || ''}/api/sales/${completedSale.id}/receipt/pdf`,
                '_blank'
            );
        }
    };

    const handlePrintReceipt = () => {
        if (completedSale) {
            window.open(
                `${import.meta.env.VITE_API_URL || ''}/api/sales/${completedSale.id}/receipt/print`,
                '_blank'
            );
        }
    };

    const handleCloseSuccess = () => {
        setSuccessDialogOpen(false);
        setCompletedSale(null);
    };

    // ── Search filter ────────────────────────────────────────────
    const filtered = products.filter(prod => {
        const q = search.toLowerCase();
        return (
            prod.name?.toLowerCase().includes(q) ||
            prod.sku?.toLowerCase().includes(q) ||
            prod.barcode?.toLowerCase().includes(q) ||
            prod.category?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return <LoadingSpinner text="Loading retail catalog..." />;
    }

    return (
        <div className="pos-layout">
            {/* ── Left: Product Catalog ── */}
            <div className="pos-main">
                {/* Page header */}
                <div className="pos-page-header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Sparkles size={22} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Retail Sales
                            </h2>
                            <p className="text-sm text-gray-500">
                                OTC & Cosmetic products
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
                        <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
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
                                addLabel="Add to Cart"
                                image={prod.image_url}
                                imageAlt={prod.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Right: Shopping Cart (sticky) ── */}
            <div className="pos-sidebar">
                <PosCartPanel
                    title="Shopping Cart"
                    titleIcon={ShoppingBag}
                    titleColor="text-purple-600"
                    headerBg="bg-purple-50"
                    headerBorder="border-purple-200"
                    clearLabel="Clear Cart"
                    onClear={clearCart}
                    items={cart}
                    priceOf={priceOf}
                    onIncrement={incrementQty}
                    onDecrement={decrementQty}
                    onRemove={removeFromCart}
                    onQtyChange={setExactQty}
                    showQtyInput={true}
                    total={grandTotal}
                    totalItems={totalItems}
                    actionLabel="Retail Checkout"
                    onAction={openPaymentModal}
                    actionDisabled={cart.length === 0}
                    actionLoading={false}
                    emptyMessage="Your cart is empty"
                    emptySubMessage="Add products from the catalog to get started"
                    emptyIcon={ShoppingBag}
                />
            </div>

            {/* ── Payment Modal ── */}
            <PosPaymentModal
                open={paymentModalOpen}
                onClose={closePaymentModal}
                title="Complete Retail Sale"
                total={grandTotal}
                itemCount={cart.length}
                totalUnits={totalItems}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                amountPaid={amountPaid}
                onAmountPaidChange={setAmountPaid}
                onConfirm={handleCompleteSale}
                submitting={submitting}
            />

            {/* ── Success Dialog ── */}
            <PosSuccessDialog
                open={successDialogOpen}
                onClose={handleCloseSuccess}
                sale={completedSale}
                onViewReceipt={handleViewReceipt}
                onDownloadPdf={handleDownloadPdf}
                onPrintReceipt={handlePrintReceipt}
            />
        </div>
    );
}
