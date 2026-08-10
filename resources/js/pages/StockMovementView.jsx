import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import {
    ArrowLeft,
    Printer,
    FileDown,
    History,
    Package,
    Tag,
    Calendar,
    FileText,
    User,
    Building2,
    ClipboardList,
    Hash,
    Barcode,
    Boxes,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    CircleDot,
    AlertCircle,
    MapPin,
    Mail,
    Phone,
    Image as ImageIcon,
    RefreshCw,
    ArrowLeftRight,
    RotateCw,
} from 'lucide-react';

const typeColors = {
    in: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    out: 'bg-red-100 text-red-700 border-red-200',
    adjustment: 'bg-amber-100 text-amber-700 border-amber-200',
    transfer: 'bg-sky-100 text-sky-700 border-sky-200',
    return: 'bg-sky-100 text-sky-700 border-sky-200',
    damaged: 'bg-red-100 text-red-700 border-red-200',
    expired: 'bg-gray-100 text-gray-700 border-gray-200',
    lost: 'bg-orange-100 text-orange-700 border-orange-200',
    correction: 'bg-blue-100 text-blue-700 border-blue-200',
    self: 'bg-teal-100 text-teal-700 border-teal-200',
};

const typeLabels = {
    in: 'Stock In',
    out: 'Stock Out',
    adjustment: 'Adjustment',
    transfer: 'Transfer',
    return: 'Return',
    damaged: 'Damaged',
    expired: 'Expired',
    lost: 'Lost',
    correction: 'Correction',
    self: 'Self Adjustment',
};

const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-sky-100 text-sky-700 border-sky-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

function formatDate(dateStr) {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function SkeletonCard() {
    return (
        <div className="card p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function StockMovementView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movement, setMovement] = useState(null);
    const [relatedMovements, setRelatedMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadMovement = () => {
        setLoading(true);
        setError('');
        api.get(`/stock-movements/${id}`)
            .then((r) => {
                setMovement(r.data);
                return r.data;
            })
            .catch(() => setError('Unable to load stock movement details.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadMovement();
    }, [id]);

    useEffect(() => {
        if (movement?.medicine?.id) {
            api.get(`/stock-movements`, {
                params: { medicine_id: movement.medicine.id, per_page: 5 },
            })
                .then((r) => {
                    const data = r.data.data || r.data || [];
                    const list = Array.isArray(data) ? data : [];
                    setRelatedMovements(list.filter((m) => String(m.id) !== String(id)));
                })
                .catch(() => setRelatedMovements([]));
        }
    }, [movement?.medicine?.id, id]);

    const handleRetry = () => {
        loadMovement();
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPdf = () => {
        window.print();
    };

    const handleHistory = () => {
        if (movement?.medicine?.id) {
            navigate(`/stock-movements?medicine_id=${movement.medicine.id}`);
        } else {
            navigate('/stock-movements');
        }
    };

    const inventoryImpactData = useMemo(() => {
        if (!movement) return null;
        const before = movement.stock_before ?? movement.quantity_before ?? 0;
        const after = movement.stock_after ?? movement.quantity_after ?? 0;
        return {
            labels: ['Before', 'After'],
            values: [Number(before) || 0, Number(after) || 0],
        };
    }, [movement]);

    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] p-6 flex flex-col items-center justify-center gap-4">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
                    <AlertCircle className="mx-auto mb-3" size={40} />
                    <p className="font-semibold">{error}</p>
                </div>
                <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    if (!movement) {
        return (
            <div className="min-h-[60vh] p-6 flex flex-col items-center justify-center gap-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-500 text-center shadow-sm">
                    <AlertCircle className="mx-auto mb-3" size={40} />
                    <p className="font-semibold text-gray-700">Stock movement not found.</p>
                </div>
                <Link
                    to="/stock-movements"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                    <ArrowLeft size={16} />
                    Back to Stock Movements
                </Link>
            </div>
        );
    }

    const movementType = movement.type?.toLowerCase?.() || movement.movement_type?.toLowerCase?.() || 'in';
    const movementStatus = movement.status?.toLowerCase?.() || 'pending';

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/stock-movements" className="hover:text-sky-600 transition-colors">
                    Stock Movements
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-800 font-semibold">Movement #{movement.id}</span>
            </nav>

            {/* Header with gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-6 md:p-8 shadow-lg">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                            <ClipboardList className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                Movement #{movement.id}
                            </h1>
                            <p className="text-sky-100 text-sm mt-1">
                                {movement.medicine?.name || 'Unknown Medicine'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                                statusColors[movementStatus] || 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                        >
                            {statusLabels[movementStatus] || movementStatus}
                        </span>
                        <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                                typeColors[movementType] || 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                        >
                            {typeLabels[movementType] || movementType}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    to="/stock-movements"
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
                <button
                    onClick={handleHistory}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                    <History size={16} />
                    History
                </button>
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                    <Printer size={16} />
                    Print
                </button>
                <button
                    onClick={handleExportPdf}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <FileDown size={16} />
                    Export PDF
                </button>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="package"
                    label="Quantity Moved"
                    value={movement.quantity ?? 0}
                    color="blue"
                    subValue={typeLabels[movementType] || movementType}
                />
                <StatCard
                    icon="boxed"
                    label="Stock Before"
                    value={movement.stock_before ?? movement.quantity_before ?? 0}
                    color="blue"
                />
                <StatCard
                    icon="boxes"
                    label="Stock After"
                    value={movement.stock_after ?? movement.quantity_after ?? 0}
                    color={Number(movement.stock_after ?? movement.quantity_after ?? 0) > Number(movement.stock_before ?? movement.quantity_before ?? 0) ? 'green' : 'red'}
                />
                <StatCard
                    icon="calendar"
                    label="Date"
                    value={formatDate(movement.created_at).split(',')[0]}
                    color="blue"
                    subValue={formatDate(movement.created_at).split(',')[1]?.trim()}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Movement Details + Medicine Info + Supplier */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Movement Details Card */}
                    <div className="card rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <ClipboardList className="text-sky-500" size={20} />
                                Movement Details
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="Movement ID" value={`#${movement.id}`} icon={Hash} mono />
                                <DetailItem label="Reference" value={movement.reference || '---'} icon={Tag} />
                                <DetailItem label="Barcode" value={movement.medicine?.barcode || movement.barcode || '---'} icon={Barcode} mono />
                                <DetailItem label="Batch Number" value={movement.medicine?.batch_number || movement.batch_number || '---'} icon={Package} mono />
                                <DetailItem label="Performed By" value={movement.user?.name || movement.performed_by || 'System'} icon={User} />
                                <DetailItem label="Branch" value={movement.branch?.name || movement.branch || '---'} icon={Building2} />
                                <DetailItem label="Source Type" value={movement.source_type || '---'} icon={ArrowLeftRight} />
                                <DetailItem label="Destination Type" value={movement.destination_type || '---'} icon={ArrowLeftRight} />
                                {movement.source_type === 'self' || movement.destination_type === 'self' ? (
                                    <div className="md:col-span-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                                            <RotateCw size={12} /> Self Adjustment
                                        </span>
                                    </div>
                                ) : null}
                                <DetailItem label="Reason" value={movement.reason || '---'} icon={AlertCircle} />
                                <DetailItem label="Category" value={movement.medicine?.category?.name || movement.category?.name || '---'} icon={Tag} />
                                <div className="md:col-span-2">
                                    <DetailItem label="Notes" value={movement.notes || '---'} icon={FileText} />
                                </div>
                                {movement.attachments?.length > 0 && (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 mb-2">Attachments</label>
                                        <div className="flex flex-wrap gap-3">
                                            {movement.attachments.map((att, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                                >
                                                    <ImageIcon size={16} className="text-gray-400" />
                                                    <span className="truncate max-w-[200px]">{att.name || att.url || `Attachment ${idx + 1}`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Medicine Information Card */}
                    <div className="card rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-white">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Package className="text-sky-500" size={20} />
                                Medicine Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="h-16 w-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                                    <Package className="text-sky-500" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {movement.medicine?.name || 'Unknown Medicine'}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {movement.medicine?.generic_name || movement.medicine?.description || 'No additional info'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InfoBadge label="Current Stock" value={movement.medicine?.quantity ?? '---'} icon={Boxes} />
                                <InfoBadge label="Shelf Location" value={movement.medicine?.shelf_location || '---'} icon={MapPin} />
                                <InfoBadge label="Expiry Date" value={movement.medicine?.expiry_date || '---'} icon={Calendar} />
                                <InfoBadge label="Manufacturer" value={movement.medicine?.manufacturer || '---'} icon={Building2} />
                                <InfoBadge label="Reorder Level" value={movement.medicine?.reorder_level ?? '---'} icon={TrendingUp} />
                                <InfoBadge label="Unit Price" value={movement.medicine?.unit_price ? `$${Number(movement.medicine.unit_price).toFixed(2)}` : '---'} icon={Tag} />
                            </div>
                        </div>
                    </div>

                    {/* Supplier Information */}
                    {movement.medicine?.supplier && (
                        <div className="card rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Building2 className="text-emerald-500" size={20} />
                                    Supplier Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="text-emerald-500" size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {movement.medicine.supplier.name}
                                        </h3>
                                        {movement.medicine.supplier.contact_person && (
                                            <p className="text-gray-500 text-sm">
                                                Contact: {movement.medicine.supplier.contact_person}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {movement.medicine.supplier.phone && (
                                        <DetailItem label="Phone" value={movement.medicine.supplier.phone} icon={Phone} />
                                    )}
                                    {movement.medicine.supplier.email && (
                                        <DetailItem label="Email" value={movement.medicine.supplier.email} icon={Mail} />
                                    )}
                                    {movement.medicine.supplier.address && (
                                        <div className="md:col-span-2">
                                            <DetailItem label="Address" value={movement.medicine.supplier.address} icon={MapPin} />
                                        </div>
                                    )}
                                    {movement.medicine.supplier.lead_time && (
                                        <DetailItem label="Lead Time" value={`${movement.medicine.supplier.lead_time} days`} icon={Clock} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Timeline + Audit + Chart */}
                <div className="space-y-6">
                    {/* Timeline Card */}
                    <div className="card rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-white">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="text-violet-500" size={20} />
                                Timeline
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="relative">
                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-200 via-violet-200 to-emerald-200"></div>
                                <div className="space-y-6">
                                    <TimelineItem
                                        icon={CircleDot}
                                        label="Created"
                                        date={formatDate(movement.created_at)}
                                        color="sky"
                                        description={`By ${movement.user?.name || 'System'}`}
                                    />
                                    {movement.approved_at && (
                                        <TimelineItem
                                            icon={CheckCircle2}
                                            label="Approved"
                                            date={formatDate(movement.approved_at)}
                                            color="violet"
                                            description={movement.approved_by?.name || 'Approver'}
                                        />
                                    )}
                                    {movement.completed_at && (
                                        <TimelineItem
                                            icon={CheckCircle2}
                                            label="Completed"
                                            date={formatDate(movement.completed_at)}
                                            color="emerald"
                                            description={movement.completed_by?.name || 'User'}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Trail Card */}
                    <div className="card rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <User className="text-amber-500" size={20} />
                                Audit Trail
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <AuditRow label="Created By" value={movement.user?.name || 'System'} />
                            <AuditRow label="Created At" value={formatDate(movement.created_at)} />
                            {movement.ip_address && <AuditRow label="IP Address" value={movement.ip_address} />}
                            {movement.device_info && <AuditRow label="Device" value={movement.device_info} />}
                            <AuditRow label="Status" value={statusLabels[movementStatus] || movementStatus} />
                            <AuditRow label="Type" value={typeLabels[movementType] || movementType} />
                        </div>
                    </div>

                    {/* Inventory Impact Chart */}
                    {inventoryImpactData && (
                        <ChartCard
                            title="Inventory Impact"
                            description="Stock level before and after this movement"
                            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                            <BarChart
                                title=""
                                labels={inventoryImpactData.labels}
                                values={inventoryImpactData.values}
                                color="sky"
                            />
                        </ChartCard>
                    )}

                    {/* Related Movements */}
                    {relatedMovements.length > 0 && (
                        <div className="card rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <History className="text-gray-500" size={20} />
                                    Related Movements
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {relatedMovements.slice(0, 5).map((m) => {
                                    const mType = m.type?.toLowerCase?.() || 'in';
                                    return (
                                        <Link
                                            key={m.id}
                                            to={`/stock-movements/${m.id}`}
                                            className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                                        typeColors[mType]?.split(' ')[0] || 'bg-gray-100'
                                                    }`}
                                                >
                                                    <Package size={14} className="text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 group-hover:text-sky-600 transition-colors">
                                                        #{m.id}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(m.created_at).split(',')[0]}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                    typeColors[mType] || 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {typeLabels[mType] || mType}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon: Icon, mono }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
            <p
                className={`text-sm font-medium text-gray-800 flex items-center gap-2 ${
                    mono ? 'font-mono text-xs tracking-wide' : ''
                }`}
            >
                {Icon && <Icon size={14} className="text-gray-400 flex-shrink-0" />}
                <span className="truncate">{value || '---'}</span>
            </p>
        </div>
    );
}

function InfoBadge({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all duration-200">
            {Icon && <Icon size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />}
            <div>
                <p className="text-xs font-semibold text-gray-500">{label}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function TimelineItem({ icon: Icon, label, date, color, description }) {
    const colorMap = {
        sky: 'text-sky-500 bg-sky-100 border-sky-200',
        violet: 'text-violet-500 bg-violet-100 border-violet-200',
        emerald: 'text-emerald-500 bg-emerald-100 border-emerald-200',
    };

    return (
        <div className="relative flex gap-4">
            <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${colorMap[color] || colorMap.sky}`}>
                <Icon size={18} />
            </div>
            <div className="pt-1">
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{date}</p>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
            </div>
        </div>
    );
}

function AuditRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold text-gray-500">{label}</span>
            <span className="text-sm text-gray-800 text-right">{value || '---'}</span>
        </div>
    );
}
