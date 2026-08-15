import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Stepper from '../components/Stepper';
import StatCard from '../components/StatCard';
import {
    ArrowLeft, Save, X, Package, Tag, FileText, Loader2, Search,
    ArrowUpRight, ArrowDownRight, RotateCcw, ClipboardList, AlertTriangle,
    Truck, CalendarX, FileWarning, CheckCircle2, AlertCircle,
    ShoppingBag, ChevronDown, Check, Pill,
} from 'lucide-react';

const steps = ['Select Product', 'Movement Type', 'Details & Confirm'];

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
];

const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:shadow-emerald-100',
    red: 'bg-red-50 border-red-200 text-red-700 hover:border-red-400 hover:shadow-red-100',
    sky: 'bg-sky-50 border-sky-200 text-sky-700 hover:border-sky-400 hover:shadow-sky-100',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400 hover:shadow-amber-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400 hover:shadow-purple-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-400 hover:shadow-orange-100',
    gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-gray-100',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400 hover:shadow-blue-100',
    teal: 'bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-400 hover:shadow-teal-100',
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
            {/* Trigger button */}
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

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {/* Search input */}
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
                    {/* Options list */}
                    <div className="max-h-64 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                No products found{query ? ` for "${query}"` : ''}
                            </div>
                        ) : filtered.map(item => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => { onSelect(item.value); setOpen(false); setQuery(''); }}
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
                    {/* Footer count */}
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
    const [step, setStep] = useState(0);

    // Which product type tab is active in Step 0
    const [activeTab, setActiveTab] = useState('medicine');

    const [form, setForm] = useState({
        medicine_id: '', retail_product_id: '',
        type: 'in', quantity: '', reference: '', notes: '',
        source_type: '', destination_type: ''
    });

    // Load medicines and retail products
    useEffect(() => {
        Promise.all([
            api.get('/medicines', { params: { per_page: 1000 } }),
            api.get('/retail-products', { params: { per_page: 1000 } }),
        ])
            .then(([medRes, retailRes]) => {
                const medList = Array.isArray(medRes.data?.data) ? medRes.data.data :
                    Array.isArray(medRes.data?.medicines?.data) ? medRes.data.medicines.data :
                    Array.isArray(medRes.data) ? medRes.data : [];
                const retailList = Array.isArray(retailRes.data?.data) ? retailRes.data.data :
                    Array.isArray(retailRes.data) ? retailRes.data : [];
                setMedicines(medList);
                setRetailProducts(retailList);
            })
            .catch(() => setError('Failed to load products'))
            .finally(() => setLoading(false));
    }, []);

    // Build dropdown option lists
    const medicineOptions = useMemo(() => medicines.map(m => ({
        value: m.id,
        label: m.name || 'Unnamed Medicine',
        sub: m.generic_name || '',
        barcode: m.barcode ? String(m.barcode) : '',
        stock: m.quantity ?? 0,
    })), [medicines]);

    const retailOptions = useMemo(() => retailProducts.map(r => ({
        value: r.id,
        label: r.name || 'Unnamed Product',
        sub: r.sku || '',
        barcode: r.barcode ? String(r.barcode) : '',
        stock: r.quantity ?? 0,
    })), [retailProducts]);

    // Selected product details for display in later steps
    const selectedMedicine = useMemo(() => medicines.find(m => m.id == form.medicine_id), [medicines, form.medicine_id]);
    const selectedRetail = useMemo(() => retailProducts.find(r => r.id == form.retail_product_id), [retailProducts, form.retail_product_id]);
    const currentProduct = selectedRetail || selectedMedicine;
    const isRetail = !!selectedRetail;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSelectMedicine = (id) => {
        setForm({ ...form, medicine_id: id, retail_product_id: '' });
    };
    const handleSelectRetail = (id) => {
        setForm({ ...form, retail_product_id: id, medicine_id: '' });
    };

    const handleContinue = () => {
        // Auto-switch tab if the other type has a selection
        if (form.medicine_id) setActiveTab('medicine');
        if (form.retail_product_id) setActiveTab('retail');
        setStep(1);
    };

    const handleSelectType = (type) => {
        setForm({ ...form, type });
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/stock-movements', form);
            window.showToast('Stock movement recorded successfully', 'success');
            navigate('/stock-movements');
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording movement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (form.medicine_id || form.retail_product_id || form.quantity) {
            if (!window.confirm('Discard unsaved changes?')) return;
        }
        navigate('/stock-movements');
    };

    const hasSelection = !!(form.medicine_id || form.retail_product_id);
    const canSubmit = hasSelection && form.type && form.quantity;

    if (loading) return <LoadingSpinner text="Loading products..." />;

    return (
        <div className="space-y-6 max-w-4xl">
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
                    <p className="text-sm text-gray-500 mt-0.5">Step {step + 1} of {steps.length}</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <Stepper steps={steps} currentStep={step} />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* ── Step 0: Select Product ───────────────────── */}
            {step === 0 && (
                <div className="space-y-5">
                    {/* Tab toggle: Medicines | Retail & OTC */}
                    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('medicine')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'medicine'
                                    ? 'bg-white text-sky-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Pill size={16} />
                            Medicines
                            <span className="ml-1 text-xs text-gray-400">({medicineOptions.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('retail')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'retail'
                                    ? 'bg-white text-amber-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <ShoppingBag size={16} />
                            Retail & OTC
                            <span className="ml-1 text-xs text-gray-400">({retailOptions.length})</span>
                        </button>
                    </div>

                    {/* Searchable dropdown for active tab */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                            {activeTab === 'medicine' ? 'Select Medicine' : 'Select Retail & OTC Product'} *
                        </label>
                        {activeTab === 'medicine' ? (
                            <SearchableSelect
                                items={medicineOptions}
                                value={form.medicine_id}
                                onSelect={handleSelectMedicine}
                                placeholder="Search and select a medicine..."
                                icon={Pill}
                                accent="sky"
                            />
                        ) : (
                            <SearchableSelect
                                items={retailOptions}
                                value={form.retail_product_id}
                                onSelect={handleSelectRetail}
                                placeholder="Search and select a retail product..."
                                icon={ShoppingBag}
                                accent="amber"
                            />
                        )}
                    </div>

                    {/* Selected product summary card */}
                    {hasSelection && (
                        <div className={`rounded-2xl border p-5 ${
                            isRetail ? 'bg-amber-50 border-amber-200' : 'bg-sky-50 border-sky-200'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    isRetail ? 'bg-amber-100' : 'bg-sky-100'
                                }`}>
                                    {isRetail
                                        ? <ShoppingBag className="w-6 h-6 text-amber-600" />
                                        : <Pill className="w-6 h-6 text-sky-600" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{currentProduct?.name || 'Selected Product'}</p>
                                    <p className="text-sm text-gray-500">
                                        Stock: <span className="font-semibold">{currentProduct?.quantity ?? 0}</span>
                                        {currentProduct?.shelf_location && ` | Shelf: ${currentProduct.shelf_location}`}
                                        {currentProduct?.generic_name && ` | ${currentProduct.generic_name}`}
                                        {currentProduct?.sku && ` | SKU: ${currentProduct.sku}`}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                                    isRetail ? 'bg-amber-200 text-amber-800' : 'bg-sky-200 text-sky-800'
                                }`}>
                                    {isRetail ? 'Retail & OTC' : 'Medicine'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Continue button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleContinue}
                            disabled={!hasSelection}
                            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 1: Movement Type ──────────────────── */}
            {step === 1 && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isRetail ? 'bg-amber-100' : 'bg-sky-100'
                        }`}>
                            {isRetail
                                ? <ShoppingBag className="w-6 h-6 text-amber-600" />
                                : <Pill className="w-6 h-6 text-sky-600" />
                            }
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{currentProduct?.name || 'Selected Product'}</p>
                            <p className="text-sm text-gray-500">
                                Stock: {currentProduct?.quantity ?? 0}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isRetail ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                }`}>
                                    {isRetail ? 'Retail & OTC' : 'Medicine'}
                                </span>
                            </p>
                        </div>
                        <button onClick={() => setStep(0)} className="ml-auto text-sm text-sky-600 font-semibold hover:underline">Change</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {movementTypes.map(mt => {
                            const Icon = mt.icon;
                            return (
                                <button
                                    key={mt.value}
                                    onClick={() => handleSelectType(mt.value)}
                                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                                        form.type === mt.value ? `border-sky-500 ${colorMap[mt.color].split(' ')[0]} shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            form.type === mt.value ? colorMap[mt.color].split(' ')[0] : 'bg-gray-100'
                                        }`}>
                                            <Icon size={20} className={form.type === mt.value ? colorMap[mt.color].split(' ')[2] : 'text-gray-500'} />
                                        </div>
                                        <span className="font-bold text-gray-800">{mt.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-[52px]">{mt.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Step 2: Details & Confirm ──────────────── */}
            {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardList size={18} className="text-sky-600" />
                            Movement Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    {isRetail ? 'Retail Product *' : 'Medicine *'}
                                </label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                                    {isRetail
                                        ? <ShoppingBag size={18} className="text-amber-500" />
                                        : <Pill size={18} className="text-sky-500" />
                                    }
                                    <span className="text-sm font-medium text-gray-800 truncate">{currentProduct?.name || '---'}</span>
                                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                        isRetail ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                    }`}>
                                        {isRetail ? 'OTC' : 'MED'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Movement Type *</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                                    {(() => {
                                        const mt = movementTypes.find(t => t.value === form.type);
                                        if (!mt) return null;
                                        const Icon = mt.icon;
                                        return <><Icon size={18} className={colorMap[mt.color].split(' ')[2]} /> <span className="text-sm font-medium text-gray-800">{mt.label}</span></>;
                                    })()}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        name="reference"
                                        value={form.reference}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Source Type</label>
                                <select name="source_type" value={form.source_type} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                    <option value="">None</option>
                                    <option value="self">Self</option>
                                    <option value="supplier">Supplier</option>
                                    <option value="branch">Branch</option>
                                    <option value="sale">Sale</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Type</label>
                                <select name="destination_type" value={form.destination_type} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 outline-none bg-white">
                                    <option value="">None</option>
                                    <option value="self">Self</option>
                                    <option value="supplier">Supplier</option>
                                    <option value="branch">Branch</option>
                                    <option value="sale">Sale</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-sky-600" />
                            Summary Preview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard value={currentProduct?.name || '---'} label={isRetail ? 'Retail Product' : 'Medicine'} color="blue" />
                            <StatCard value={movementTypes.find(t => t.value === form.type)?.label || form.type} label="Type" color="green" />
                            <StatCard value={form.quantity || '0'} label="Quantity" color="orange" />
                            <StatCard value={currentProduct?.quantity ?? 0} label="Current Stock" color="purple" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <X size={16} /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !canSubmit}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Recording...</> : <><Save size={16} /> Record Movement</>}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
