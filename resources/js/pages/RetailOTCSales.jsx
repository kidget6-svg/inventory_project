import { useLanguage } from "../context/LanguageContext"; // resources/js/pages/RetailOTCSales.jsx
//
// Retail & OTC Sales — Pharmacist POS terminal.
//
// Displays OTC / cosmetic product cards on the left and a sticky
// "Retail Draft" panel on the right.  The draft panel contains selected
// products, quantity controls (+/-), remove-item, total price,
// Clear Draft, and Send to Cashier Queue.
//
// The pharmacist can enter Customer Information (customer name, phone, email, notes)
// before dispatching the order to the Cashier Payment Queue.
//
// All shared UI is provided by the reusable components in
// resources/js/components/pos/.

import React, { useState, useEffect } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PosProductCard,
  PosCartPanel,
  PosInfoModal,
  PosPagination } from
'../components/pos';
import {
  Search,
  ShoppingBag,
  Send,
  Package,
  User,
  Phone,
  Mail,
  FileText } from
'lucide-react';

export default function RetailOTCSales() {const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const canDraft = hasPermission('retail-otc-sales.draft');
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination (client-side, operates on filtered results)
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Customer Information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Customer Information modal (opened before sending to cashier queue)
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // ── Data loading ──────────────────────────────────────────────
  useEffect(() => {
    api.get('/retail-products', { params: { per_page: 100 } }).
    then((res) => setProducts(res.data.data || res.data)).
    catch((err) => {
      console.error('Failed to load retail products:', err);
      window.showToast(t("Failed to load products"), 'error');
    }).
    finally(() => setLoading(false));
  }, []);

  // Reset to first page whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ── Cart helpers ────────────────────────────────────────────
  const priceOf = (p) => Number(p.price ?? 0);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      return window.showToast(t("Out of stock"), 'error');
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQty + 1 > product.quantity) {
          window.showToast(`Stock limit reached (${product.quantity})`, 'error');
          return prev;
        }
        return prev.map((item) =>
        item.id === product.id ?
        { ...item, cartQty: item.cartQty + 1 } :
        item
        );
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
  };

  const incrementQty = (item, maxStock) => {
    setCart((prev) => prev.map((i) => {
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
    setCart((prev) => prev.map((i) =>
    i.id === item.id ?
    { ...i, cartQty: Math.max(1, i.cartQty - 1) } :
    i
    ));
  };

  const removeFromCart = (item) =>
  setCart((prev) => prev.filter((i) => i.id !== item.id));

  const clearDraft = () => setCart([]);

  const totalCalculated = cart.reduce(
    (sum, item) => sum + priceOf(item) * (item.cartQty || 0),
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.cartQty || 0),
    0
  );

  // ── Submit ────────────────────────────────────────────────────
  // Opening the "Send to Cashier Queue" button first opens the
  // Customer Information modal.  The actual API call happens only
  // after the user confirms the information in the modal.
  const handleSendToCashier = () => {
    if (cart.length === 0) {
      return window.showToast(t("Cart is empty"), 'error');
    }
    if (cart.some((i) => i.cartQty <= 0)) {
      return window.showToast(t("All items must have quantity > 0"), 'error');
    }

    setShowCustomerModal(true);
  };

  const confirmSendToCashier = async () => {
    setSubmitting(true);
    try {
      await api.post('/sales/retail-draft', {
        items: cart.map((item) => ({
          id: item.id,
          cartQty: item.cartQty
        })),
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        notes: customerNotes || null
      });
      window.showToast(t("Order dispatched to Cashier queue!"), 'success');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerNotes('');
      setShowCustomerModal(false);
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
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q));

  });

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <LoadingSpinner text={t("Opening retail terminal...")} />;
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
                            <h2 className="text-2xl font-bold text-gray-800">{t("Retail & OTC Sales")}

              </h2>
                            <p className="text-sm text-gray-500">{t("Browse OTC products and send to cashier queue")}

              </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <input
              type="text"
              placeholder={t("Search products...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pos-search-input" />
            
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>

                {/* Product cards */}
                {filtered.length === 0 ?
        <div className="text-center py-12 text-gray-400">
                        <Package size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">{t("No products found")}</p>
                        <p className="text-xs mt-1">{t("Try adjusting your search terms")}

          </p>
                    </div> :

        <div className="pos-product-grid">
                        {paginatedItems.map((prod) =>
          <PosProductCard
            key={prod.id}
            item={prod}
            price={priceOf(prod)}
            onAdd={addToCart}
            addLabel="Add to Draft"
            image={prod.image_url}
            imageAlt={prod.name} />

          )}
                    </div>
        }

                {/* Pagination */}
                {filtered.length > 0 &&
        <PosPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage} />

        }
            </div>

            {/* ── Right: Retail Draft (sticky) ── */}
            <div className="pos-sidebar">
                <PosCartPanel
          title={t("Retail Draft")}
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
          actionHidden={!canDraft}
          emptyMessage="Retail draft is empty"
          emptySubMessage="Select products from the catalog to begin"
          emptyIcon={ShoppingBag} />
        
            </div>

            {/* Customer Information modal */}
            <PosInfoModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title={t("Customer Information")}
        titleIcon={User}
        titleColor="text-emerald-600"
        fields={[
        { name: 'customerName', label: 'Customer Name', icon: User, placeholder: 'Enter customer name' },
        { name: 'customerPhone', label: 'Phone Number', icon: Phone, placeholder: 'Enter phone number' },
        { name: 'customerEmail', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'Enter email address' },
        { name: 'customerNotes', label: 'Customer Notes', icon: FileText, placeholder: 'Notes or additional info' }]
        }
        values={{ customerName, customerPhone, customerEmail, customerNotes }}
        onChange={(key, value) => {
          if (key === 'customerName') setCustomerName(value);else
          if (key === 'customerPhone') setCustomerPhone(value);else
          if (key === 'customerEmail') setCustomerEmail(value);else
          if (key === 'customerNotes') setCustomerNotes(value);
        }}
        onConfirm={confirmSendToCashier}
        confirmLabel="Confirm & Send to Cashier Queue"
        submitting={submitting} />
      
        </div>);

}