import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Stepper from '../components/Stepper';
import ChartCard from '../components/ChartCard';
import BarChart from '../components/BarChart';
import StatCard from '../components/StatCard';
import {
    ArrowLeft, Save, X, Package, Tag, FileText, Loader2, Search,
    ArrowUpRight, ArrowDownRight, RotateCcw, ClipboardList, AlertTriangle,
    Truck, CalendarX, FileWarning, CheckCircle2, AlertCircle,
    Warehouse, DollarSign, Upload, ChevronRight,
    // ✅ ADDED - Replace RotateCw with RotateCcw (already imported above)
    // RotateCw doesn't exist, use RotateCcw instead
} from 'lucide-react';

const steps = ['Select Medicine', 'Movement Type', 'Details & Confirm'];

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
    // ✅ FIXED: Changed from RotateCw to RotateCcw (which is the correct icon name)
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

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
        <div className="flex gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded-2xl shrink-0"></div>
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

export default function StockMovementCreate() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(0);

    const [form, setForm] = useState({
        medicine_id: '', type: 'in', quantity: '', reference: '', notes: '',
        source_type: '', destination_type: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    useEffect(() => {
        api.get('/medicines')
            .then(r => {
                const list = Array.isArray(r.data?.data) ? r.data.data :
                             Array.isArray(r.data?.medicines?.data) ? r.data.medicines.data :
                             Array.isArray(r.data) ? r.data : [];
                setMedicines(list);
                setFilteredMedicines(list);
            })
            .catch(() => setError('Failed to load medicines'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredMedicines(medicines);
            return;
        }
        const q = searchQuery.toLowerCase();
        setFilteredMedicines(medicines.filter(m =>
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.generic_name && m.generic_name.toLowerCase().includes(q)) ||
            (m.barcode && String(m.barcode).includes(q))
        ));
    }, [searchQuery, medicines]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSelectMedicine = (medicine) => {
        setSelectedMedicine(medicine);
        setForm({ ...form, medicine_id: medicine.id });
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
        if (form.medicine_id || form.quantity) {
            if (!window.confirm('Discard unsaved changes?')) return;
        }
        navigate('/stock-movements');
    };

    const canProceedFromStep0 = !!form.medicine_id;
    const canProceedFromStep1 = !!form.type;
    const canSubmit = form.medicine_id && form.type && form.quantity;

    if (loading) return <LoadingSpinner text="Loading medicines..." />;

    const currentMedicine = medicines.find(m => m.id === form.medicine_id) || selectedMedicine;

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

            {/* Step 0: Select Medicine */}
            {step === 0 && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search medicines by name, generic name, or barcode..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMedicines.map(medicine => (
                            <button
                                key={medicine.id}
                                onClick={() => handleSelectMedicine(medicine)}
                                className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                                    form.medicine_id === medicine.id ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                                        <Package className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-800 truncate">{medicine.name || 'Unnamed'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{medicine.generic_name || 'No generic name'}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs font-medium text-gray-600">Stock: <span className="font-bold">{medicine.quantity ?? 0}</span></span>
                                            {medicine.shelf_location && <span className="text-xs text-gray-500">Shelf: {medicine.shelf_location}</span>}
                                        </div>
                                        {medicine.expiry_date && (
                                            <p className={`text-xs mt-1 flex items-center gap-1 ${
                                                new Date(medicine.expiry_date) < new Date() ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                <CalendarX size={12} /> Expires: {new Date(medicine.expiry_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                        {filteredMedicines.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No medicines found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 1: Movement Type */}
            {step === 1 && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{currentMedicine?.name || 'Selected Medicine'}</p>
                            <p className="text-sm text-gray-500">Stock: {currentMedicine?.quantity ?? 0} | Shelf: {currentMedicine?.shelf_location || '---'}</p>
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

            {/* Step 2: Details & Confirm */}
            {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardList size={18} className="text-sky-600" />
                            Movement Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine *</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                                    <Package size={18} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-800">{currentMedicine?.name || '---'}</span>
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
                            <StatCard value={currentMedicine?.name || '---'} label="Medicine" color="blue" />
                            <StatCard value={movementTypes.find(t => t.value === form.type)?.label || form.type} label="Type" color="green" />
                            <StatCard value={form.quantity || '0'} label="Quantity" color="orange" />
                            <StatCard value={currentMedicine?.quantity ?? 0} label="Current Stock" color="purple" />
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