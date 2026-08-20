import React, { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
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
    Lock,
    ChevronDown,
    ChevronUp,
    Info,
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

    const [submitting, setSubmitting] = useState(false);

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
        setDiscountType('percentage');
        setDiscountValue('');
        setExpandedItemId(null);
    };

    const toggleExpandItem = (itemKey) => {
        setExpandedItemId(prev => prev === itemKey ? null : itemKey);
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
        setShowModal(true);
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
        const item = modalItems.find((i) => i.id === selectedId);
        if (!item) return;
        if (quantity > item.quantity) {
            return window.showToast(`Only ${item.quantity} in stock for ${item.name}`, 'error');
        }

        addToCart(modalType, item, quantity);
        setCustomerName(patientName);
        setCustomerPhone(patientPhone);
        setCustomerEmail(patientEmail);
        setShowModal(false);
        window.showToast(`${item.name} added to order`, 'success');
    };

    // ── Send to Checkout ─────────────────────────────────────────
    const handleSendToCheckout = async () => {
        if (cart.length === 0) {
            return window.showToast('Add at least one item to the order', 'error');
        }
        setSubmitting(true);
        try {
            await api.post('/sales/dispatch', {
                items: cart.map((i) => ({ type: i.type, id: i.id, quantity: i.quantity })),
                customer_name: customerName.trim() || null,
                customer_phone: customerPhone.trim() || null,
                customer_email: customerEmail.trim() || null,
                discount_type: (Number(discountValue) > 0 && canApplyDiscount) ? discountType : null,
                discount: (Number(discountValue) > 0 && canApplyDiscount) ? Number(discountValue) : 0,
            });
            window.showToast('Order sent to Checkout!', 'success');
            clearOrder();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to send order', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Opening Point of Sale..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-4 py-4 lg:px-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow flex items-center justify-center">
                            <ShoppingCart size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Point of Sale</h1>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                <Clock size={12} />
                                Create orders and send to cashier
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} className="text-emerald-500" />
                            <span className="font-medium">Today</span>
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
                                className={`group flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow hover:shadow-md transition-all duration-200 ${canAddMedicine ? 'hover:scale-[1.01]' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Pill size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-base">Add Medicine</div>
                                    <div className="text-xs text-emerald-100">
                                        {canAddMedicine ? 'Prescription medications' : 'Restricted'}
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
                                className="group flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-base">Retail & OTC</div>
                                    <div className="text-xs text-amber-100">OTC and retail products</div>
                                </div>
                                <Plus size={18} className="opacity-70 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Catalog Controls */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                    {[
                                        { id: 'medicine', label: 'Medicine', icon: Pill, activeColor: 'bg-emerald-600 text-white' },
                                        { id: 'retail', label: 'Retail & OTC', icon: ShoppingBag, activeColor: 'bg-amber-500 text-white' },
                                    ].map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setCatalogTab(tab.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${catalogTab === tab.id
                                                        ? tab.activeColor
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Icon size={14} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex-1 relative">
                                    <Search size={16} className="absolute left-3 top-2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search items by name, barcode..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className={`w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 outline-none ${catalogTab === 'medicine' ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap px-1">
                                    <Package size={14} />
                                    <span>{filteredCatalog.length} items</span>
                                </div>
                            </div>
                        </div>

                        {/* Catalog Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredCatalog.slice(0, 20).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => openAddModal(catalogTab, item.id)}
                                    className={`group bg-white rounded-xl border border-gray-100 p-2 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col ${catalogTab === 'medicine' && !canAddMedicine ? 'opacity-70' : ''} ${catalogTab === 'medicine' ? 'hover:border-emerald-200' : 'hover:border-amber-200'}`}
                                >
                                    <div className="relative aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden mb-2 flex items-center justify-center">
                                        <Thumb
                                            item={item}
                                            type={catalogTab}
                                            className="w-full h-full object-cover"
                                            iconClassName={catalogTab === 'medicine' ? 'text-emerald-200' : 'text-amber-200'}
                                        />
                                        <div className="absolute top-1.5 right-1.5">
                                            <StockBadge quantity={item.quantity} />
                                        </div>
                                        {catalogTab === 'medicine' && !canAddMedicine && (
                                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                                                <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm">
                                                    <Lock size={10} /> Restricted
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-xs leading-snug line-clamp-2">
                                        {item.name}
                                    </h4>
                                    {item.generic_name && (
                                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.generic_name}</p>
                                    )}
                                    <div className="mt-auto pt-2 flex items-center justify-between">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${catalogTab === 'medicine' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                            ${Number(priceOf(item)).toFixed(2)}
                                        </span>
                                        <span className={`text-[10px] font-medium group-hover:underline ${catalogTab === 'medicine' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            Add +
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredCatalog.length > 20 && (
                            <div className="text-center text-xs text-gray-400 py-1">
                                Showing 20 of {filteredCatalog.length} items • Refine search to see more
                            </div>
                        )}
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
                                    <h3 className="font-bold text-gray-800 text-sm">Current Order</h3>
                                    {totalItems > 0 && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                            {totalItems}
                                        </span>
                                    )}
                                </div>
                                {cart.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearOrder}
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Empty State */}
                            {cart.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2 border border-gray-100">
                                        <ShoppingCart size={20} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-500">Order is empty</p>
                                    <div className="mt-3 flex flex-col gap-1.5 text-[10px] text-gray-400">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Click "Add Medicine" or "Retail & OTC"
                                        </div>
                                    </div>
                                </div>
                            )}

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

                            {/* Customer Info Dropdown */}
                            <div className="pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                                    className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <User size={12} /> Customer Info (Optional)
                                    </span>
                                    {showCustomerInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                
                                {showCustomerInfo && (
                                    <div className="space-y-1.5 mt-2 pb-1">
                                        <div className="relative">
                                            <User size={12} className="absolute left-2.5 top-2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="Customer name"
                                                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone size={12} className="absolute left-2.5 top-2 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                placeholder="Phone number"
                                                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail size={12} className="absolute left-2.5 top-2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                placeholder="Email address"
                                                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Discount */}
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-1.5">
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Gift size={10} /> Apply Discount
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
                                        { id: 'fixed', label: '$' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            disabled={!canApplyDiscount}
                                            onClick={() => setDiscountType(opt.id)}
                                            className={`flex-1 px-3 py-1 rounded-md text-[10px] font-bold transition-all ${discountType === opt.id
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
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
                                        className="w-full pl-8 pr-3 py-1 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white transition-colors disabled:cursor-not-allowed"
                                    />
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
                                    <span>Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount</span>
                                        <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-50">
                                    <span>Total</span>
                                    <span className="text-emerald-600">${total.toFixed(2)}</span>
                                </div>
                                <div className="text-center text-[9px] text-gray-400 mt-1">
                                    {totalItems} item{totalItems !== 1 ? 's' : ''} in order
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                type="button"
                                onClick={handleSendToCheckout}
                                disabled={cart.length === 0 || submitting}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 shadow hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={14} />
                                        Send to Checkout
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-1 text-[9px] text-gray-400">
                                <CheckCircle size={10} className="text-emerald-500" />
                                Cashier will collect payment and print receipt
                                <ArrowRight size={10} />
                                <Printer size={10} />
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
                size="max-w-md"
            >
                <div className="space-y-3">
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
                                onChange={(e) => { setItemQuery(e.target.value); setSelectedId(null); }}
                                placeholder={modalType === 'medicine' ? 'Type medicine name or barcode...' : 'Type product name or SKU...'}
                                className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 outline-none ${modalType === 'medicine' ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                            />
                        </div>
                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 custom-scrollbar">
                            {filteredModalItems.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-400">
                                    <Package size={20} className="mx-auto mb-2 text-gray-300" />
                                    No items found
                                </div>
                            ) : filteredModalItems.slice(0, 50).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedId(item.id)}
                                    className={`w-full flex items-center gap-2 px-2 py-2 text-sm text-left transition-colors ${selectedId === item.id
                                            ? (modalType === 'medicine' ? 'bg-emerald-50 border-l-2 border-emerald-500' : 'bg-amber-50 border-l-2 border-amber-500')
                                            : 'hover:bg-gray-50 border-l-2 border-transparent'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                        <Thumb
                                            item={item}
                                            type={modalType}
                                            className="w-full h-full object-cover"
                                            iconClassName={modalType === 'medicine' ? 'text-emerald-400' : 'text-amber-400'}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-800 text-xs truncate">{item.name}</p>
                                        {item.generic_name && (
                                            <p className="text-[10px] text-gray-400 truncate">{item.generic_name}</p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0 pl-2">
                                        <p className="text-xs font-bold text-gray-700">${Number(priceOf(item)).toFixed(2)}</p>
                                        <p className={`text-[9px] ${item.quantity <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {item.quantity <= 0 ? 'Out of stock' : `Stock: ${item.quantity}`}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Quantity *</label>
                        <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            placeholder="1"
                            className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 outline-none ${modalType === 'medicine' ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAddToOrder}
                            className={`flex-1 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5 ${modalType === 'medicine' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}
                        >
                            <Plus size={14} />
                            Add to Order
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
        </div>
    );
}
