import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    ArrowLeft, Save, X, Plus, Trash2, Search, Pill, Package,
    ArrowUpRight, ArrowDownRight, RotateCcw, ClipboardList, AlertTriangle,
    Truck, CalendarX, FileWarning, CheckCircle2, AlertCircle,
    ShoppingBag, ChevronDown, Check, Warehouse,
} from 'lucide-react';

const movementTypes = [
    { value: 'in', label: 'Stock In', icon: ArrowUpRight, color: 'emerald', desc: 'Add stock to inventory' },
    { value: 'out', label: 'Stock Out', icon: ArrowDownRight, color: 'red', desc: 'Remove stock from inventory' },
    { value: 'return', label: 'Return', icon: RotateCcw, color: 'sky', desc: 'Return stock to supplier' },
    { value: 'adjustment', label: 'Adjustment', icon: ClipboardList, color: 'amber', desc: 'Correct inventory records' },
    { value: 'transfer', label: 'Transfer', icon: Truck, color: 'purple', desc: 'Move between locations' },
    { value: 'damage', label: 'Damage', icon: AlertTriangle, color: 'orange', desc: 'Mark damaged stock' },
    { value: 'expired', label: 'Expired', icon: CalendarX, color: 'gray', desc: 'Remove expired stock' },
    { value: 'lost', label: 'Lost', icon: FileWarning, color: 'orange', desc: 'Mark lost stock' },
    { value: 'correction', label: 'Correction', icon: CheckCircle2, color: 'blue', desc: 'Fix data errors' },
    { value: 'self', label: 'Self Adjustment', icon: RotateCcw, color: 'teal', desc: 'Internal self adjustment' },
    { value: 'warehouse', label: 'Warehouse', icon: Warehouse, color: 'sky', desc: 'Warehouse inventory movement' },
];

const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    sky: 'bg-sky-50 border-sky-200 text-sky-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
};

/* ── Searchable Select Dropdown ───────────────────────────── */
function SearchableSelect({ items, value, onSelect, placeholder, icon: Icon, accent = 'sky' }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filtered = useMemo(() => {
        if (!query) return items;
        const q = query.toLowerCase();
        return items.filter(p =>
            (p.label && p.label.toLowerCase().includes(q)) ||
            (p.sub && p.sub.toLowerCase().includes(q)) ||
            (p.barcode && String(p.barcode).includes(q))
        );
    }, [items, query]);

    const selected = items.find(i => i.value === value);
    const accentBg = accent === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600';

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white hover:border-sky-300 transition-colors text-left"
            >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accentBg}`}>
                    <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    {selected ? (
                        <>
                            <p className="font-semibold text-gray-800 truncate">{selected.label}</p>
                            <p className="text-xs text-gray-500">Stock: {selected.stock ?? 0}{selected.sub ? ` | ${selected.sub}` : ''}</p>
                        </>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="relative border-b border-gray-100">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by name, generic name, SKU, or barcode..."
                            className="w-full pl-10 pr-3 py-2.5 text-sm outline-none"
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                No products found{query ? ` for "${query}"` : ''}
                            </div>
                        ) : filtered.map(item => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => { onSelect(item); setOpen(false); setQuery(''); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-sky-50 transition-colors ${
                                    value === item.value ? 'bg-sky-50' : ''
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        Stock: <span className="font-semibold">{item.stock ?? 0}</span>
                                        {item.sub ? ` | ${item.sub}` : ''}
                                    </p>
                                </div>
                                {value === item.value && <Check size={16} className="text-sky-600 shrink-0" />}
                            </button>
                        ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                        {filtered.length} of {items.length} products
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────── */
export default function StockMovementCreate() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [retailProducts, setRetailProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('medicine');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const [items, setItems] = useState([]);
    const [movementType, setMovementType] = useState('');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [sourceType, setSourceType] = useState('');
    const [destinationType, setDestinationType] = useState('');
    const [sourceBranchId, setSourceBranchId] = useState('');
    const [destinationBranchId, setDestinationBranchId] = useState('');
    const [branches, setBranches] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [shelves, setShelves] = useState([]);
    const [selectedShelfId, setSelectedShelfId] = useState('');

    useEffect(() => {
        Promise.all([
            api.get('/medicines', { params: { per_page: 1000 } }),
            api.get('/retail-products', { params: { per_page: 1000 } }),
            api.get('/branches'),
            api.get('/suppliers'),
        ])
            .then(([medRes, retailRes, branchRes, supplierRes]) => {
                const medList = Array.isArray(medRes.data?.data) ? medRes.data.data :
                    Array.isArray(medRes.data?.medicines?.data) ? medRes.data.medicines.data :
                    Array.isArray(medRes.data) ? medRes.data : [];
                const retailList = Array.isArray(retailRes.data?.data) ? retailRes.data.data :
                    Array.isArray(retailRes.data) ? retailRes.data : [];
                const branchList = Array.isArray(branchRes.data?.data) ? branchRes.data.data :
                    Array.isArray(branchRes.data) ? branchRes.data : [];
                const supplierList = Array.isArray(supplierRes.data?.data) ? supplierRes.data.data :
                    Array.isArray(supplierRes.data?.suppliers?.data) ? supplierRes.data.suppliers.data :
                    Array.isArray(supplierRes.data) ? supplierRes.data : [];
                setMedicines(medList);
                setRetailProducts(retailList);
                setBranches(branchList);
                setSuppliers(supplierList);
            })
            .catch(() => setError('Failed to load products'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (destinationType === 'branch' && destinationBranchId) {
            api.get('/shelves', { params: { branch_id: destinationBranchId, location_type: 'branch' } })
                .then(res => {
                    const list = Array.isArray(res.data?.data) ? res.data.data :
                        Array.isArray(res.data) ? res.data : [];
                    setShelves(list);
                })
                .catch(() => setShelves([]));
        } else {
            setShelves([]);
        }
    }, [destinationType, destinationBranchId]);

    useEffect(() => {
        function handleClick(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const isItemAdded = (type, id) => items.some(i => i.type === type && i.id === id);

    const addItem = (type, product) => {
        if (isItemAdded(type, product.id)) return;
        setItems(prev => [...prev, {
            type,
            id: product.id,
            name: product.name,
            quantity: 1,
            manufacturer: product.manufacturer || '',
        }]);
        setSelectedProduct(null);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const removeItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItemQuantity = (index, value) => {
        const qty = parseInt(value) || 1;
        setItems(prev => prev.map((it, i) =>
            i === index ? { ...it, quantity: Math.max(1, qty) } : it
        ));
    };

    const currentList = activeTab === 'medicine' ? medicines : retailProducts;
    const filteredProducts = currentList.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (items.length === 0) {
            setError('Please add at least one product.');
            return;
        }
        if (!movementType) {
            setError('Please select a movement type.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                type: movementType,
                reference: reference || null,
                notes: notes || null,
                source_type: sourceType || null,
                source_id: sourceType === 'branch' ? (sourceBranchId || null) : null,
                supplier_id: sourceType === 'supplier' ? (selectedSupplierId || null) : null,
                destination_type: destinationType || null,
                destination_id: destinationType === 'branch' ? (destinationBranchId || null) : null,
                shelf_id: selectedShelfId || null,
                items: items.map(i => ({
                    type: i.type,
                    id: i.id,
                    quantity: i.quantity,
                    manufacturer: i.manufacturer || null,
                })),
            };

            await api.post('/stock-movements', payload);
            window.showToast('Stock movements recorded successfully', 'success');
            navigate('/stock-movements');
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording stock movements');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (items.length > 0) {
            if (!window.confirm('Discard unsaved changes?')) return;
        }
        navigate('/stock-movements');
    };

    const canSubmit = items.length > 0 && movementType;

    if (loading) return <LoadingSpinner text="Loading products..." />;

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/stock-movements"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Record Stock Movement</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Add multiple items and record a single movement type</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Add Products */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package size={18} className="text-sky-600" />
                        1. Add Products
                    </h3>

                    {/* Tab toggle */}
                    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl w-fit">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('medicine'); setSearchTerm(''); setShowDropdown(false); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'medicine'
                                    ? 'bg-white text-sky-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Pill size={16} />
                            Medicines
                            <span className="ml-1 text-xs text-gray-400">({medicines.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('retail'); setSearchTerm(''); setShowDropdown(false); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'retail'
                                    ? 'bg-white text-amber-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <ShoppingBag size={16} />
                            Retail & OTC
                            <span className="ml-1 text-xs text-gray-400">({retailProducts.length})</span>
                        </button>
                    </div>

                    {/* Search + Add */}
                    <div className="relative" ref={searchRef}>
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                placeholder={activeTab === 'medicine' ? 'Search medicines by name...' : 'Search retail & OTC products...'}
                            />
                        </div>
                        {showDropdown && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No products found</div>
                                ) : filteredProducts.map(p => {
                                    const added = isItemAdded(activeTab, p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => addItem(activeTab, p)}
                                            disabled={added}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-sky-50 ${added ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {activeTab === 'medicine'
                                                    ? <Pill size={14} className="text-sky-400" />
                                                    : <Package size={14} className="text-amber-400" />}
                                                {p.name}
                                            </span>
                                            {added
                                                ? <span className="text-xs text-green-600 font-semibold">Added</span>
                                                : <Plus size={16} className="text-sky-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Selected Items Table */}
                    {items.length > 0 ? (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Product</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-24">Type</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Manufacturer</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 w-28">Quantity</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 w-24">Stock</th>
                                        <th className="px-3 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it, i) => (
                                        <tr key={`${it.type}-${it.id}`} className="border-t border-gray-100">
                                            <td className="px-3 py-2 text-sm font-medium text-gray-800 flex items-center gap-2">
                                                {it.type === 'medicine'
                                                    ? <Pill size={14} className="text-sky-400" />
                                                    : <Package size={14} className="text-amber-400" />}
                                                {it.name}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${it.type === 'medicine' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {it.type === 'medicine' ? 'Medicine' : 'Retail'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={it.manufacturer || ''}
                                                    onChange={(e) => setItems(prev => prev.map((x, idx) =>
                                                        idx === i ? { ...x, manufacturer: e.target.value } : x
                                                    ))}
                                                    className="w-36 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-sky-400 outline-none"
                                                    placeholder="e.g. GSK, Pfizer"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <input
                                                    type="number"
                                                    value={it.quantity}
                                                    onChange={(e) => updateItemQuantity(i, e.target.value)}
                                                    className="w-20 px-2 py-1 text-sm text-right border border-gray-200 rounded-lg focus:border-sky-400 outline-none"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right text-sm text-gray-500">
                                                {it.type === 'medicine'
                                                    ? (medicines.find(m => m.id === it.id)?.quantity ?? 0)
                                                    : (retailProducts.find(r => r.id === it.id)?.quantity ?? 0)}
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(i)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                            No products added yet. Search and add products above.
                        </div>
                    )}
                </div>

                {/* 2. Movement Type */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList size={18} className="text-sky-600" />
                        2. Movement Type
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {movementTypes.map(mt => {
                            const Icon = mt.icon;
                            return (
                                <button
                                    key={mt.value}
                                    type="button"
                                    onClick={() => setMovementType(mt.value)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                                        movementType === mt.value
                                            ? `border-sky-500 ${colorMap[mt.color].split(' ')[0]} shadow-md`
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            movementType === mt.value ? colorMap[mt.color].split(' ')[0] : 'bg-gray-100'
                                        }`}>
                                            <Icon size={16} className={movementType === mt.value ? colorMap[mt.color].split(' ')[2] : 'text-gray-500'} />
                                        </div>
                                        <span className="font-bold text-gray-800 text-sm">{mt.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-[42px]">{mt.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Details */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={18} className="text-sky-600" />
                        3. Details & Confirm
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Source Type</label>
                            <select value={sourceType} onChange={(e) => { setSourceType(e.target.value); setSourceBranchId(''); setSelectedSupplierId(''); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                <option value="">None</option>
                                <option value="branch">Branch</option>
                                <option value="warehouse">Warehouse</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Type</label>
                            <select value={destinationType} onChange={(e) => { setDestinationType(e.target.value); setDestinationBranchId(''); setSelectedShelfId(''); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                <option value="">None</option>
                                <option value="branch">Branch</option>
                                <option value="warehouse">Warehouse</option>
                            </select>
                        </div>
                        {sourceType === 'branch' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Source Branch *</label>
                                <select value={sourceBranchId} onChange={(e) => setSourceBranchId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white" required>
                                    <option value="">Select Source Branch</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                        {sourceType === 'supplier' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier *</label>
                                <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white" required>
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        )}
                        {destinationType === 'branch' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Branch *</label>
                                <select value={destinationBranchId} onChange={(e) => setDestinationBranchId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white" required>
                                    <option value="">Select Destination Branch</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                        {destinationType === 'branch' && shelves.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf</label>
                                <select value={selectedShelfId} onChange={(e) => setSelectedShelfId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                    <option value="">Select Shelf</option>
                                    {shelves.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <X size={16} /> Cancel
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{items.length} item(s)</span>
                        <button
                            type="submit"
                            disabled={submitting || !canSubmit}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Recording...</> : <><Save size={16} /> Record Movements</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
