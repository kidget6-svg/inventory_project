import { useLanguage } from "../context/LanguageContext"; // resources/js/pages/Sales.jsx
//
// Unified Point of Sale — used by both Pharmacist and Cashier.
//
// Flow:
//   1. Add Items      — choose Medicine or Retail & OTC, pick an item
//                       (with patient/customer info for medicines) and
//                       add it to the order.
//   2. Select Customer — customer name / phone / email.
//   3. Apply Discounts — percentage or fixed amount.
//   4. Send to Checkout — dispatch the order to the cashier queue.

import React, { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import PhoneInput from '../components/PhoneInput';
import {
    Pill,
    ShoppingBag,
    Search,
    Send,
    User,
    Phone,
    Mail,
    Trash2,
    Plus,
    Minus,
    Percent,
    Tag,
    ClipboardList,
    CheckCircle,
    Package,
    FileText,
    AlertCircle,
    ShoppingCart,
    Users,
    CreditCard,
    Printer,
    Clock,
    ArrowRight,
    Sparkles,
    Gift,
    Hash,
} from 'lucide-react';

const priceOf = (item) =>
Number(item?.selling_price ?? item?.unit_price ?? item?.price ?? 0);

const imageOf = (item) => item?.image_url || item?.image || item?.photo_path || null;

function StockBadge({ quantity }) {
    if (quantity <= 0) {
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700">
                Out of stock
            </span>
        );
    }
    if (quantity <= 10) {
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700">
                Low stock
            </span>
        );
    }
    return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
            In stock
        </span>
    );
}

function Thumb({ item, type, className, iconClassName }) {
    const src = imageOf(item);
    const Icon = type === 'medicine' ? Pill : ShoppingBag;
    if (src) {
        return <img src={src} alt={item?.name || 'product'} className={className} />;
    }
    return <Icon size={20} className={iconClassName} />;
}

export default function Sales() {
    const { t } = useLanguage();
    const { user, hasPermission } = useAuth();
    const userRole = user?.role;
    const isPharmacistOrAdmin =
        userRole === 'admin' || userRole === 'pharmacist' || userRole === 'super_admin';

    // Prescription medicines may only be added by pharmacists/admins, or
    // cashiers explicitly granted the create-prescription-sales permission.
    const canAddMedicine = isPharmacistOrAdmin || hasPermission('create-prescription-sales');

    // Discounts require the apply-sales-discount permission.
    const canApplyDiscount = hasPermission('apply-sales-discount');

    const [medicines, setMedicines] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catalogTab, setCatalogTab] = useState('medicine');
    const [search, setSearch] = useState('');

    // Order (cart)
    const [cart, setCart] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);

    // Select Customer
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerTin, setCustomerTin] = useState('');

  // Apply Discounts
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');

    // Add-item modal
    const [modalType, setModalType] = useState('medicine');
    const [showModal, setShowModal] = useState(false);
    const [itemQuery, setItemQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [qty, setQty] = useState('1');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [patientTin, setPatientTin] = useState('');

  const [submitting, setSubmitting] = useState(false);

    // ── Modal validation state ───────────────────────────────────
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [tinError, setTinError] = useState('');

    // ── Data loading ─────────────────────────────────────────────
    useEffect(() => {
        Promise.all([
            api.get('/medicines', { params: { per_page: 100 } }),
            api.get('/retail-products', { params: { per_page: 100 } }),
        ])
            .then(([medRes, prodRes]) => {
                const medList = Array.isArray(medRes.data?.data)
                    ? medRes.data.data
                    : Array.isArray(medRes.data?.medicines?.data)
                        ? medRes.data.medicines.data
                        : Array.isArray(medRes.data)
                            ? medRes.data
                            : [];
                setMedicines(medList);
                setProducts(prodRes.data?.data || prodRes.data || []);
            })
            .catch((err) => {
                console.error('Failed to load POS catalog:', err);
                window.showToast('Failed to load products', 'error');
            })
            .finally(() => setLoading(false));
    }, []);

  // ── Catalog filtering ────────────────────────────────────────
  const activeCatalog = catalogTab === 'medicine' ? medicines : products;

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase();
    return activeCatalog.filter((i) =>
    (i.name || '').toLowerCase().includes(q) ||
    (i.generic_name || '').toLowerCase().includes(q) ||
    (i.barcode || '').toLowerCase().includes(q) ||
    (i.sku || '').toLowerCase().includes(q)
    );
  }, [activeCatalog, search]);

    // ── Order helpers ────────────────────────────────────────────
    const addToCart = (type, item, quantity) => {
        if (type === 'medicine' && !canAddMedicine) {
            return window.showToast('Pharmacist permission required to add medicines', 'error');
        }
        if (quantity > item.quantity) {
            return window.showToast(`Only ${item.quantity} in stock for ${item.name}`, 'error');
        }
        setCart((prev) => {
            const existing = prev.find((x) => x.type === type && x.id === item.id);
            if (existing) {
                if (existing.quantity + quantity > item.quantity) {
                    window.showToast(`Stock limit reached (${item.quantity})`, 'error');
                    return prev;
                }
                return prev.map((x) =>
                    x.type === type && x.id === item.id
                        ? { ...x, quantity: existing.quantity + quantity }
                        : x
                );
            }
            return [...prev, {
                type,
                id: item.id,
                name: item.name,
                price: priceOf(item),
                quantity,
                stock: item.quantity,
                generic_name: item.generic_name,
                dosage: item.dosage,
                sku: item.sku,
                barcode: item.barcode,
            }];
        });
    };

    const incrementQty = (item) => {
        setCart((prev) => prev.map((x) => {
            if (x.type === item.type && x.id === item.id) {
                if (x.quantity + 1 > x.stock) {
                    window.showToast(`Stock limit reached (${x.stock})`, 'error');
                    return x;
                }
                return { ...x, quantity: x.quantity + 1 };
            }
            return x;
        }));
    };

    const decrementQty = (item) => {
        setCart((prev) => prev.map((x) =>
            x.type === item.type && x.id === item.id
                ? { ...x, quantity: Math.max(1, x.quantity - 1) }
                : x
        ));
    };

    const removeFromCart = (item) =>
        setCart((prev) => prev.filter((x) => !(x.type === item.type && x.id === item.id)));

    const clearOrder = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerTin('');
        setDiscountType('percentage');
        setDiscountValue('');
        setExpandedItemId(null);
    };

    const toggleExpandItem = (itemKey) => {
        setExpandedItemId((prev) => prev === itemKey ? null : itemKey);
    };

    // ── Totals & discount ────────────────────────────────────────
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = Number(discountValue) > 0 && canApplyDiscount
        ? discountType === 'percentage'
            ? subtotal * (Math.min(100, Number(discountValue)) / 100)
            : Math.min(subtotal, Number(discountValue))
        : 0;
    const total = Math.max(0, subtotal - discountAmount);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // ── Add-item modal ───────────────────────────────────────────
    const openAddModal = (type, itemId = null) => {
        if (type === 'medicine' && !canAddMedicine) {
            return window.showToast('Pharmacist permission required to add medicines', 'error');
        }
        setModalType(type);
        setItemQuery('');
        setSelectedId(itemId || null);
        setQty('1');
        setPatientName(customerName);
        setPatientPhone(customerPhone);
        setPatientEmail(customerEmail);
        setPatientTin(customerTin);
        setNameError('');
        setPhoneError('');
        setTinError('');
        setShowModal(true);
    };

    const validateModalForm = () => {
        let valid = true;

        if (!patientName.trim()) {
            setNameError('Patient/Customer name is required');
            valid = false;
        } else {
            setNameError('');
        }

        const phone = patientPhone.trim();
        if (!phone) {
            setPhoneError('Phone number is required');
            valid = false;
        } else if (!/^(\+2519\d{8}|\+2517\d{8}|09\d{8}|07\d{8})$/.test(phone)) {
            setPhoneError('Enter a valid Ethiopian phone number (09XXXXXXXX or +2519XXXXXXXX)');
            valid = false;
        } else {
            setPhoneError('');
        }

        if (patientTin.trim() && !/^\d+$/.test(patientTin.trim())) {
            setTinError('TIN number must contain digits only');
            valid = false;
        } else {
            setTinError('');
        }

        return valid;
    };

    const modalItems = modalType === 'medicine' ? medicines : products;
    const filteredModalItems = modalItems.filter((i) => {
        const q = itemQuery.toLowerCase();
        return (
            (i.name || '').toLowerCase().includes(q) ||
            (i.generic_name || '').toLowerCase().includes(q) ||
            (i.barcode || '').toLowerCase().includes(q) ||
            (i.sku || '').toLowerCase().includes(q)
        );
    });

    const handleAddToOrder = () => {
        if (!selectedId) {
            return window.showToast('Select an item from the list', 'error');
        }
        const quantity = parseInt(qty, 10);
        if (!quantity || quantity < 1) {
            return window.showToast('Enter a valid quantity', 'error');
        }

        if (!validateModalForm()) {
            return;
        }

        const item = modalItems.find((i) => i.id === selectedId);
        if (!item) return;
        if (quantity > item.quantity) {
            return window.showToast(`Only ${item.quantity} in stock for ${item.name}`, 'error');
        }

        addToCart(modalType, item, quantity);
        setCustomerName(patientName);
        setCustomerPhone(patientPhone);
        setCustomerEmail(patientEmail);
        setCustomerTin(patientTin);
        setShowModal(false);
        window.showToast(`${item.name} added to order`, 'success');
    };

    // ── Send to Checkout ─────────────────────────────────────────
    const handleSendToCheckout = async () => {
        if (cart.length === 0) {
            return window.showToast(t("Add at least one item to the order"), 'error');
        }
        setSubmitting(true);
        try {
            await api.post('/sales/dispatch', {
                items: cart.map((i) => ({ type: i.type, id: i.id, quantity: i.quantity })),
                customer_name: customerName.trim() || null,
                customer_phone: customerPhone.trim() || null,
                customer_email: customerEmail.trim() || null,
                customer_tin: customerTin.trim() || null,
                discount_type: Number(discountValue) > 0 ? discountType : null,
                discount: Number(discountValue) > 0 ? Number(discountValue) : 0,
            });
            window.showToast(t("Order sent to Checkout!"), 'success');
            clearOrder();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to send order', 'error');
        } finally {
            setSubmitting(false);
        }
    };

  if (loading) {
    return <LoadingSpinner text={t("Opening Point of Sale...")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50/30">
            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-4 py-4 lg:px-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow flex items-center justify-center">
                            <ShoppingCart size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{t("Point of Sale")}</h1>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Clock size={14} />{t("Create orders and send to cashier")}

              </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} className="text-sky-500" />
                            <span className="font-medium">{t("Today")}</span>
                        </div>
                        <div className="w-px h-5 bg-gray-200"></div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                            <span className="text-emerald-500">●</span>
                            {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* ── Left: Catalog ── */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Quick Add Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={!canAddMedicine}
                                onClick={() => { if (canAddMedicine) { setCatalogTab('medicine'); openAddModal('medicine'); } }}
                                className={`group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-xl transition-all duration-200 ${canAddMedicine ? 'hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Pill size={24} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-lg">{t("Add Medicine")}</div>
                                    <div className="text-sm text-sky-100">
                                        {canAddMedicine ? t("Prescription medications") : 'Restricted'}
                                    </div>
                                </div>
                                {!canAddMedicine ? (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/25 px-2 py-1 rounded-full whitespace-nowrap">
                                        <Lock size={12} /> Pharmacist Required
                                    </span>
                                ) : (
                                    <Plus size={18} className="opacity-70 group-hover:rotate-90 transition-transform" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setCatalogTab('retail'); openAddModal('retail'); }}
                                className="group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={24} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-lg">{t("Retail & OTC")}</div>
                                    <div className="text-sm text-emerald-100">{t("OTC and retail products")}</div>
                                </div>
                                <Plus size={18} className="opacity-70 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Catalog Controls */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                    {[
                  { id: 'medicine', label: 'Medicine', icon: Pill },
                  { id: 'retail', label: 'Retail & OTC', icon: ShoppingBag }].
                  map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCatalogTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${catalogTab === tab.id ?
                        'bg-white text-gray-800 shadow-sm' :
                        'text-gray-500 hover:text-gray-700'}`
                        }>
                        
                                                <Icon size={16} />
                                                {tab.label}
                                            </button>);

                  })}
                                </div>
                                <div className="flex-1 relative">
                                    <Search size={16} className="absolute left-3 top-2 text-gray-400" />
                                    <input
                    type="text"
                    placeholder={t("Search items by name, barcode...")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
                  
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap px-1">
                                    <Package size={14} />
                                    <span>{filteredCatalog.length} items</span>
                                </div>
                            </div>
                        </div>

                        {/* Catalog Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {filteredCatalog.slice(0, 20).map((item) =>
              <div
                key={item.id}
                className={`group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-sky-200 transition-all duration-200 cursor-pointer ${catalogTab === 'medicine' && !canAddMedicine ? 'opacity-70' : ''}`}
                onClick={() => openAddModal(catalogTab, item.id)}>
                
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 ${catalogTab === 'medicine' ? 'bg-sky-50' : 'bg-emerald-50'
                                            }`}>
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {catalogTab === 'medicine'
                                                        ? <Pill size={20} className="text-sky-600" />
                                                        : <ShoppingBag size={20} className="text-emerald-600" />}
                                                </div>
                                            )}
                                        </div>
                                        <StockBadge quantity={item.quantity} />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-xs leading-snug line-clamp-2">
                                        {item.name}
                                    </h4>
                                    {item.generic_name && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.generic_name}</p>
                    )}
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-900">
                                            ${Number(priceOf(item)).toFixed(2)}
                                        </span>
                                        <span className="text-xs text-sky-600 font-medium group-hover:underline">{t("Add +")}
                  </span>
                                    </div>
                                </div>
              )}
                        </div>
                        {filteredCatalog.length > 20 &&
            <div className="text-center text-sm text-gray-400 py-2">{t("Showing 20 of")}
              {filteredCatalog.length}{t("items • Refine search to see more")}
            </div>
            }
                    </div>

                    {/* ── Right: Order Summary ── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <ClipboardList size={14} className="text-gray-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-800">{t("Current Order")}</h3>
                                    {totalItems > 0 &&
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                                            {totalItems}
                                        </span>
                  }
                                </div>
                                {cart.length > 0 &&
                <button
                  type="button"
                  onClick={clearOrder}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors">{t("Clear All")}


                </button>
                }
                            </div>

                            {/* Empty State */}
                            {cart.length === 0 &&
              <div className="text-center py-10">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <ShoppingCart size={28} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">{t("Order is empty")}</p>
                                    <p className="text-xs text-gray-400 mt-1">{t("Add items to get started")}</p>
                                    <div className="mt-4 flex flex-col gap-2 text-xs text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>{t("Click \"Add Medicine\" or \"Retail & OTC\"")}

                  </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>{t("Search and select products")}

                  </div>
                                    </div>
                                </div>
              }

                            {/* Cart Items */}
                            {cart.length > 0 && (
                                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                    {cart.map((item) => {
                                        const itemKey = `${item.type}-${item.id}`;
                                        const isExpanded = expandedItemId === itemKey;
                                        return (
                                            <div key={itemKey} className="group border border-gray-100 rounded-xl overflow-hidden bg-white">
                                                <div
                                                    className={`flex items-center gap-2 p-2 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                                    onClick={() => toggleExpandItem(itemKey)}
                                                >
                                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${item.type === 'medicine' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                                        {item.type === 'medicine'
                                                            ? <Pill size={12} className="text-emerald-600" />
                                                            : <ShoppingBag size={12} className="text-amber-600" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400">
                                                            ${Number(item.price).toFixed(2)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            type="button"
                                                            onClick={() => decrementQty(item)}
                                                            className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <Minus size={10} />
                                                        </button>
                                                        <span className="w-5 text-center text-xs font-semibold text-gray-800">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => incrementQty(item)}
                                                            className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>
                                                    <span className="w-12 text-right text-xs font-bold text-gray-800">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removeFromCart(item); }}
                                                        className="text-gray-300 hover:text-red-500 transition-colors ml-1"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <div className="px-3 pb-2 pt-1 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 flex flex-col gap-1">
                                                        {item.type === 'medicine' ? (
                                                            <>
                                                                {item.generic_name && <div><span className="font-semibold">Generic Name:</span> {item.generic_name}</div>}
                                                                {item.dosage && <div><span className="font-semibold">Dosage:</span> {item.dosage}</div>}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {item.sku && <div><span className="font-semibold">SKU:</span> {item.sku}</div>}
                                                                {item.barcode && <div><span className="font-semibold">Barcode:</span> {item.barcode}</div>}
                                                            </>
                                                        )}
                                                        <div className="flex justify-between items-center mt-0.5">
                                                            <span><span className="font-semibold">Stock Available:</span> {item.stock}</span>
                                                            <span className="font-semibold text-gray-700">Line Total: ${(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Customer Info */}
                            <div className="pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                                    className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <User size={12} /> {t("Customer Details")} (Optional)
                                    </span>
                                    {showCustomerInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {showCustomerInfo && (
                                    <div className="space-y-1.5 mt-2">
                                        <div className="relative">
                                            <User size={13} className="absolute left-3 top-2 text-gray-400" />
                                            <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t("Customer name")}
                      className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-gray-50 focus:bg-white transition-colors" />
                    
                                        </div>
                                        <div>
                                        <PhoneInput
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      iconSize={13}
                      placeholder={t("Phone number")}
                      className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-gray-50 focus:bg-white transition-colors" />
                    
                                        </div>
                                        <div className="relative">
                                            <Mail size={13} className="absolute left-3 top-2 text-gray-400" />
                                            <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={t("Email address")}
                      className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-gray-50 focus:bg-white transition-colors" />
                    
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Discount */}
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Gift size={12} />{t("Apply Discount")}
                    </h4>
                                    {!canApplyDiscount && (
                                        <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                            <Lock size={8} /> Locked
                                        </span>
                                    )}
                                </div>
                                <div className={`flex gap-1.5 mb-2 ${!canApplyDiscount ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {[
                  { id: 'percentage', label: '%' },
                  { id: 'fixed', label: '$' }].
                  map((opt) =>
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!canApplyDiscount}
                    onClick={() => setDiscountType(opt.id)}
                    className={`flex-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${discountType === opt.id ?
                    'bg-sky-500 text-white shadow-sm' :
                    'bg-gray-100 text-gray-500 hover:bg-gray-200'}`
                    }>
                    
                                            {opt.label}
                                        </button>
                  )}
                                </div>
                                <div className={`relative ${!canApplyDiscount ? 'opacity-50' : ''}`}>
                                    <Percent size={12} className="absolute left-2.5 top-1.5 text-gray-400" />
                                    <input
                    type="number"
                    min="0"
                    disabled={!canApplyDiscount}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-gray-50 focus:bg-white transition-colors disabled:cursor-not-allowed" />
                  
                                </div>
                                {!canApplyDiscount && (
                                    <p className="text-[9px] text-amber-600 mt-1 flex items-center gap-1">
                                        <Lock size={8} /> Requires <code className="font-semibold">apply-sales-discount</code> permission
                                    </p>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="pt-2 border-t border-gray-100 space-y-1 text-xs">
                                <div className="flex justify-between text-gray-500">
                                    <span>{t("Subtotal")}</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 &&
                <div className="flex justify-between text-emerald-600">
                                        <span>{t("Discount")}</span>
                                        <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                                    </div>
                }
                                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                                    <span>{t("Total")}</span>
                                    <span className="text-sky-600">${total.toFixed(2)}</span>
                                </div>
                                <div className="text-center text-[10px] text-gray-400">
                                    {totalItems} item{totalItems !== 1 ? 's' : ''}{t("in order")}
                </div>
                            </div>

                            {/* Send Button */}
                            <button
                type="button"
                onClick={handleSendToCheckout}
                disabled={cart.length === 0 || submitting}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                
                                {submitting ?
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

                <>
                                        <Send size={16} />{t("Send to Checkout")}

                </>
                }
                            </button>
                            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                                <CheckCircle size={12} className="text-emerald-500" />{t("Cashier will collect payment and print receipt")}

                <ArrowRight size={12} />
                                <Printer size={12} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add Item Modal ── */}
            <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'medicine' ? 'Add Medicine' : 'Add Retail & OTC Product'}
        size="max-w-lg">
        
                <div className="space-y-4">
                    {/* Search */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {modalType === 'medicine' ? 'Search Medicine' : 'Search Product'}
                        </label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                type="text"
                value={itemQuery}
                onChange={(e) => {setItemQuery(e.target.value);setSelectedId(null);}}
                placeholder={modalType === 'medicine' ? 'Type medicine name or barcode...' : 'Type product name or SKU...'}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
              
                        </div>
                        <div className="mt-2 max-h-52 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                            {filteredModalItems.length === 0 ?
              <div className="p-6 text-center text-sm text-gray-400">
                                    <Package size={24} className="mx-auto mb-2 text-gray-300" />{t("No items found")}

              </div> :
              filteredModalItems.slice(0, 50).map((item) =>
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition-colors ${selectedId === item.id ?
                'bg-sky-50 border-l-4 border-sky-500' :
                'hover:bg-gray-50'}`
                }>
                
                                    <div className="min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 float-left mr-2">
                                            <Thumb
                                                item={item}
                                                type={modalType}
                                                className="w-full h-full object-cover"
                                                iconClassName={modalType === 'medicine' ? 'text-emerald-400' : 'text-amber-400'}
                                            />
                                        </div>
                                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                                        {item.generic_name &&
                  <p className="text-xs text-gray-400 truncate">{item.generic_name}</p>
                  }
                                    </div>
                                    <div className="text-right shrink-0 pl-2">
                                        <p className="text-xs font-bold text-gray-700">${Number(priceOf(item)).toFixed(2)}</p>
                                        <p className={`text-[9px] ${item.quantity <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {item.quantity <= 0 ? 'Out of stock' : `Stock: ${item.quantity}`}
                                        </p>
                                    </div>
                                </button>
              )}
                        </div>
                    </div>

                    {/* Patient/Customer Info (for medicines) */}
                    {modalType === 'medicine' ?
          <>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t("Patient Name")}</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="Enter patient name"
                                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${nameError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    />
                                </div>
                                {nameError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {nameError}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${phoneError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {phoneError}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t("Email Address")}</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder={t("Enter email address")}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
                
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">TIN Number</label>
                                <div className="relative">
                                    <Hash size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={patientTin}
                                        onChange={(e) => setPatientTin(e.target.value)}
                                        placeholder="Enter TIN number"
                                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${tinError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    />
                                </div>
                                {tinError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {tinError}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t("Customer Name")}</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="Enter customer name"
                                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${nameError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    />
                                </div>
                                {nameError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {nameError}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${phoneError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {phoneError}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t("Email Address")}</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder={t("Enter email address")}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
                
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">TIN Number</label>
                                <div className="relative">
                                    <Hash size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={patientTin}
                                        onChange={(e) => setPatientTin(e.target.value)}
                                        placeholder="Enter TIN number"
                                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${tinError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    />
                                </div>
                                {tinError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {tinError}
                                    </p>
                                )}
                            </div>
                        </>
          }

                    {/* Quantity */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t("Quantity *")}</label>
                        <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
            
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 btn-secondary px-4 py-2.5 text-sm font-semibold">{t("Cancel")}


            </button>
                        <button
              type="button"
              onClick={handleAddToOrder}
              className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2">
              
                            <Plus size={16} />{t("Add to Order")}

            </button>
                    </div>
                </div>
            </Modal>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db; /* gray-300 */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af; /* gray-400 */
                }
            `}</style>
        </div>);

}
