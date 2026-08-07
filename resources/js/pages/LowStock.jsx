import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
    AlertCircle, AlertTriangle, Package, ShoppingCart, RefreshCw,
    Search, Filter, Eye, History, ClipboardList, Warehouse,
    FileText, Printer, Download, Mail, Upload, TrendingUp,
    TrendingDown, Activity, DollarSign, X, ChevronDown, Info,
    PieChart, BarChart3, Layers, Zap, Clock, Truck,
    Calendar, AlertOctagon, CheckCircle, ArrowUpCircle
} from 'lucide-react';

// ============================================================
// COLOR PALETTE
// ============================================================
const COLORS = {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    orange: '#f97316',
    rose: '#f43f5e',
    sky: '#0ea5e9',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    gray: '#6b7280',
    slate: '#94a3b8'
};

// ============================================================
// INTERACTIVE DONUT CHART COMPONENT
// ============================================================
const InteractiveDonutChart = ({ 
    data, 
    title, 
    subtitle, 
    centerLabel, 
    centerValue, 
    onSegmentClick,
    activeKey,
    size = 200,
    innerRadius = 65,
    strokeWidth = 30,
    showLegend = true,
    legendPosition = 'bottom'
}) => {
    const [hovered, setHovered] = useState(null);
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = size / 2, cy = size / 2, r = size / 2 - 15;
    let cumulative = 0;

    const segments = data.map((d) => {
        const fraction = d.value / total;
        const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
        cumulative += fraction;
        const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
        const largeArc = fraction > 0.5 ? 1 : 0;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const path = fraction >= 0.9999
            ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`
            : `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
        return { ...d, path, fraction, startAngle, endAngle };
    });

    if (total === 0 || data.every(d => d.value === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
                <p className="text-lg font-semibold text-gray-700">All Clear!</p>
                <p className="text-sm text-gray-400">No data to display</p>
            </div>
        );
    }

    const getStrokeWidth = (seg) => {
        const isHovered = hovered === seg.key;
        const isActive = activeKey === seg.key;
        if (isHovered || isActive) return strokeWidth + 8;
        return strokeWidth;
    };

    const getOpacity = (seg) => {
        if (hovered && hovered !== seg.key) return 0.4;
        return 1;
    };

    return (
        <div className="flex flex-col items-center">
            {/* Title */}
            {title && (
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
            )}

            {/* Chart */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Glow effect */}
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {segments.map((seg, i) => (
                        <path
                            key={i}
                            d={seg.path}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={getStrokeWidth(seg)}
                            strokeLinecap="round"
                            style={{
                                cursor: 'pointer',
                                transition: 'stroke-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease',
                                opacity: getOpacity(seg),
                                filter: (hovered === seg.key || activeKey === seg.key) ? 'url(#glow)' : 'none'
                            }}
                            onMouseEnter={() => setHovered(seg.key)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => onSegmentClick?.(seg)}
                        />
                    ))}
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {centerValue !== undefined ? (
                        <>
                            <span className="text-3xl font-bold text-gray-800">{centerValue}</span>
                            <span className="text-xs text-gray-400">{centerLabel || 'Total'}</span>
                        </>
                    ) : (
                        <>
                            <span className="text-2xl font-bold text-gray-800">
                                {hovered ? segments.find(s => s.key === hovered)?.value : total}
                            </span>
                            <span className="text-xs text-gray-400">
                                {hovered ? segments.find(s => s.key === hovered)?.label : 'Total'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className={`flex flex-wrap gap-3 mt-4 ${legendPosition === 'bottom' ? 'justify-center' : 'flex-col'}`}>
                    {segments.map((seg, i) => (
                        <button
                            key={i}
                            onClick={() => onSegmentClick?.(seg)}
                            onMouseEnter={() => setHovered(seg.key)}
                            onMouseLeave={() => setHovered(null)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                activeKey === seg.key ? 'bg-gray-100 ring-2 ring-gray-300' : 'hover:bg-gray-50'
                            }`}
                        >
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                            <span className="text-gray-700">{seg.label}</span>
                            <span className="text-gray-400">({seg.value})</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-500">{(seg.fraction * 100).toFixed(1)}%</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// MINI STAT CARD (Used sparingly for key metrics)
// ============================================================
const MiniStat = ({ icon: Icon, value, label, color, trend }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-50`}>
                <Icon className={`w-4 h-4 text-${color}-500`} />
            </div>
            <div>
                <p className="text-lg font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
            </div>
            {trend && (
                <span className={`text-xs font-semibold ml-auto ${trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend.value}
                </span>
            )}
        </div>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function LowStock() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ordering, setOrdering] = useState(null);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [filters, setFilters] = useState({
        search: '', category_id: '', supplier_id: '', status: '', sort: 'name_asc'
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    // Chart interaction state
    const [activeStatusKey, setActiveStatusKey] = useState(null);
    const [activeCategoryKey, setActiveCategoryKey] = useState(null);
    const [activeSupplierKey, setActiveSupplierKey] = useState(null);
    const tableRef = useRef(null);

    // Load data
    const loadData = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/low-stock', { params: { page, ...filters } })
            .then(r => {
                const data = r.data;
                setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
                setMeta(data.meta || null);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load low stock data');
            })
            .finally(() => setLoading(false));
    }, [page, filters]);

    useEffect(() => { loadData(); }, [loadData]);

    const loadCategories = useCallback(() => {
        api.get('/categories')
            .then(r => setCategories(Array.isArray(r.data) ? r.data : []))
            .catch(() => {});
    }, []);

    const loadSuppliers = useCallback(() => {
        api.get('/suppliers')
            .then(r => setSuppliers(Array.isArray(r.data) ? r.data : []))
            .catch(() => {});
    }, []);

    useEffect(() => { loadCategories(); loadSuppliers(); }, []);

    const handleOrderNow = useCallback(async (medicineId) => {
        if (!window.confirm('Create a purchase order for this medicine?')) return;
        setOrdering(medicineId);
        try {
            await api.post(`/low-stock/order-now/${medicineId}`);
            window.showToast?.('Purchase order created successfully', 'success');
            loadData();
        } catch (err) {
            window.showToast?.('Failed to create purchase order', 'error');
        } finally {
            setOrdering(null);
        }
    }, [loadData]);

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
        setActiveStatusKey(null);
        setActiveCategoryKey(null);
        setActiveSupplierKey(null);
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({ search: '', category_id: '', supplier_id: '', status: '', sort: 'name_asc' });
        setPage(1);
        setActiveStatusKey(null);
        setActiveCategoryKey(null);
        setActiveSupplierKey(null);
    }, []);

    const getStockStatus = useCallback((medicine) => {
        const qty = Number(medicine.quantity) || 0;
        const reorder = Number(medicine.reorder_level) || 0;
        if (qty === 0) return { key: 'out', label: 'Out of Stock', color: COLORS.red, severity: 'critical' };
        if (qty <= reorder / 2) return { key: 'critical', label: 'Critical', color: COLORS.orange, severity: 'critical' };
        if (qty <= reorder) return { key: 'low', label: 'Low Stock', color: COLORS.warning, severity: 'low' };
        return { key: 'healthy', label: 'Healthy', color: COLORS.success, severity: 'healthy' };
    }, []);

    const getStatusBadge = useCallback((medicine) => {
        const status = getStockStatus(medicine);
        const colors = {
            red: 'bg-red-100 text-red-700 border-red-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            green: 'bg-green-100 text-green-700 border-green-200',
        };
        const colorMap = { [COLORS.red]: 'red', [COLORS.orange]: 'orange', [COLORS.warning]: 'yellow', [COLORS.success]: 'green' };
        const colorKey = colorMap[status.color] || 'orange';
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${colors[colorKey]}`}>
                {status.color === COLORS.red || status.color === COLORS.orange ? 
                    <AlertCircle className="w-3.5 h-3.5" /> : 
                    <AlertTriangle className="w-3.5 h-3.5" />
                }
                {status.label}
            </span>
        );
    }, [getStockStatus]);

    // ============================================================
    // DERIVED DATA FOR CHARTS
    // ============================================================

    // 1. Status Distribution
    const statusData = useMemo(() => {
        const counts = { out: 0, critical: 0, low: 0, healthy: 0 };
        medicines.forEach(m => {
            const status = getStockStatus(m);
            counts[status.key] = (counts[status.key] || 0) + 1;
        });
        return [
            { key: 'out', label: 'Out of Stock', value: counts.out, color: COLORS.red },
            { key: 'critical', label: 'Critical', value: counts.critical, color: COLORS.orange },
            { key: 'low', label: 'Low Stock', value: counts.low, color: COLORS.warning },
            { key: 'healthy', label: 'Healthy', value: counts.healthy, color: COLORS.success },
        ];
    }, [medicines, getStockStatus]);

    // 2. Category Distribution
    const categoryData = useMemo(() => {
        const map = new Map();
        medicines.forEach(m => {
            const catName = m.category?.name || 'Uncategorized';
            const catId = m.category_id || m.category?.id || 'uncategorized';
            const prev = map.get(catId) || { key: catId, label: catName, value: 0 };
            prev.value += 1;
            map.set(catId, prev);
        });
        const colors = [COLORS.sky, COLORS.purple, COLORS.pink, COLORS.indigo, COLORS.teal, COLORS.emerald, COLORS.amber, COLORS.rose];
        return Array.from(map.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
            .map((d, i) => ({ ...d, color: colors[i % colors.length] }));
    }, [medicines]);

    // 3. Supplier Distribution
    const supplierData = useMemo(() => {
        const map = new Map();
        medicines.forEach(m => {
            const supName = m.supplier?.name || 'No Supplier';
            const supId = m.supplier_id || m.supplier?.id || 'nosupplier';
            const prev = map.get(supId) || { key: supId, label: supName, value: 0 };
            prev.value += 1;
            map.set(supId, prev);
        });
        const colors = [COLORS.purple, COLORS.info, COLORS.emerald, COLORS.amber, COLORS.rose, COLORS.indigo, COLORS.teal];
        return Array.from(map.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map((d, i) => ({ ...d, color: colors[i % colors.length] }));
    }, [medicines]);

    // 4. Stock Value by Status
    const stockValueData = useMemo(() => {
        const map = { out: 0, critical: 0, low: 0, healthy: 0 };
        medicines.forEach(m => {
            const status = getStockStatus(m);
            const value = (Number(m.quantity) || 0) * (Number(m.purchase_price) || Number(m.unit_price) || 0);
            map[status.key] = (map[status.key] || 0) + value;
        });
        return [
            { key: 'out', label: 'Out of Stock', value: Math.round(map.out), color: COLORS.red },
            { key: 'critical', label: 'Critical', value: Math.round(map.critical), color: COLORS.orange },
            { key: 'low', label: 'Low Stock', value: Math.round(map.low), color: COLORS.warning },
            { key: 'healthy', label: 'Healthy', value: Math.round(map.healthy), color: COLORS.success },
        ];
    }, [medicines, getStockStatus]);

    // 5. Expiry Status
    const expiryData = useMemo(() => {
        const today = new Date();
        const counts = { expired: 0, '30days': 0, '60days': 0, '90days': 0, good: 0 };
        medicines.forEach(m => {
            if (!m.expiry_date) { counts.good++; return; }
            const days = (new Date(m.expiry_date) - today) / (1000 * 60 * 60 * 24);
            if (days < 0) counts.expired++;
            else if (days <= 30) counts['30days']++;
            else if (days <= 60) counts['60days']++;
            else if (days <= 90) counts['90days']++;
            else counts.good++;
        });
        return [
            { key: 'expired', label: 'Expired', value: counts.expired, color: COLORS.red },
            { key: '30days', label: '≤ 30 Days', value: counts['30days'], color: COLORS.orange },
            { key: '60days', label: '≤ 60 Days', value: counts['60days'], color: COLORS.warning },
            { key: '90days', label: '≤ 90 Days', value: counts['90days'], color: COLORS.sky },
            { key: 'good', label: 'Good (>90d)', value: counts.good, color: COLORS.success },
        ];
    }, [medicines]);

    // 6. Low Stock Severity
    const severityData = useMemo(() => {
        const critical = medicines.filter(m => {
            const qty = Number(m.quantity) || 0;
            const reorder = Number(m.reorder_level) || 0;
            return qty === 0 || qty <= reorder / 2;
        }).length;
        const low = medicines.filter(m => {
            const qty = Number(m.quantity) || 0;
            const reorder = Number(m.reorder_level) || 0;
            return qty > 0 && qty <= reorder;
        }).length;
        const healthy = medicines.length - critical - low;
        return [
            { key: 'critical', label: 'Critical', value: critical, color: COLORS.red },
            { key: 'low', label: 'Low', value: low, color: COLORS.warning },
            { key: 'healthy', label: 'Healthy', value: healthy, color: COLORS.success },
        ];
    }, [medicines]);

    // 7. Reorder Cost by Category
    const reorderCostData = useMemo(() => {
        const map = new Map();
        medicines.forEach(m => {
            const qty = Number(m.quantity) || 0;
            const reorder = Number(m.reorder_level) || 0;
            if (qty > reorder) return;
            const price = Number(m.purchase_price) || Number(m.unit_price) || 0;
            const suggestedQty = Math.max(reorder * 2 - qty, 1);
            const catName = m.category?.name || 'Uncategorized';
            const catId = m.category_id || m.category?.id || 'uncategorized';
            const prev = map.get(catId) || { key: catId, label: catName, value: 0 };
            prev.value += suggestedQty * price;
            map.set(catId, prev);
        });
        const colors = [COLORS.emerald, COLORS.sky, COLORS.purple, COLORS.pink, COLORS.indigo, COLORS.teal, COLORS.amber];
        return Array.from(map.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map((d, i) => ({ ...d, color: colors[i % colors.length], value: Math.round(d.value) }));
    }, [medicines]);

    // 8. Filtered medicines
    const filteredMedicines = useMemo(() => {
        let result = [...medicines];
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(m =>
                (m.name || '').toLowerCase().includes(s) ||
                (m.generic_name || '').toLowerCase().includes(s) ||
                (m.barcode || '').toLowerCase().includes(s)
            );
        }
        if (filters.category_id) {
            result = result.filter(m => m.category_id == filters.category_id || m.category?.id == filters.category_id);
        }
        if (filters.supplier_id) {
            result = result.filter(m => m.supplier_id == filters.supplier_id || m.supplier?.id == filters.supplier_id);
        }
        if (filters.status === 'critical') {
            result = result.filter(m => Number(m.quantity) === 0 || Number(m.quantity) <= Number(m.reorder_level) / 2);
        } else if (filters.status === 'low') {
            result = result.filter(m => Number(m.quantity) > 0 && Number(m.quantity) <= Number(m.reorder_level));
        } else if (filters.status === 'out') {
            result = result.filter(m => Number(m.quantity) === 0);
        }
        return result;
    }, [medicines, filters]);

    // Chart click handlers
    const handleStatusClick = (seg) => {
        setActiveStatusKey(prev => prev === seg.key ? null : seg.key);
        setFilters(prev => ({ ...prev, status: prev.status === seg.key ? '' : seg.key }));
        setPage(1);
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleCategoryClick = (seg) => {
        setActiveCategoryKey(prev => prev === seg.key ? null : seg.key);
        setFilters(prev => ({ ...prev, category_id: prev.category_id === seg.key ? '' : seg.key }));
        setPage(1);
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSupplierClick = (seg) => {
        setActiveSupplierKey(prev => prev === seg.key ? null : seg.key);
        setFilters(prev => ({ ...prev, supplier_id: prev.supplier_id === seg.key ? '' : seg.key }));
        setPage(1);
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const isFiltered = filters.search || filters.category_id || filters.supplier_id || filters.status;

    // ============================================================
    // RENDER
    // ============================================================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading inventory data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button onClick={loadData} className="btn-primary px-6 py-2">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-7 h-7 text-amber-500" />
                        Low Stock Management
                    </h1>
                    <p className="text-sm text-gray-500">Interactive dashboard with real-time inventory insights</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={loadData} className="px-4 py-2 text-sm flex items-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className="px-4 py-2 text-sm flex items-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Quick Stats - Mini Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <MiniStat icon={Package} value={medicines.length} label="Total Items" color="blue" />
                <MiniStat icon={AlertTriangle} value={statusData.filter(d => d.key === 'critical').reduce((s, d) => s + d.value, 0)} label="Critical" color="red" />
                <MiniStat icon={AlertCircle} value={statusData.filter(d => d.key === 'out').reduce((s, d) => s + d.value, 0)} label="Out of Stock" color="red" />
                <MiniStat icon={Clock} value={statusData.filter(d => d.key === 'low').reduce((s, d) => s + d.value, 0)} label="Low Stock" color="yellow" />
                <MiniStat icon={DollarSign} value={`$${Math.round(medicines.reduce((s, m) => s + (Number(m.quantity) || 0) * (Number(m.purchase_price) || Number(m.unit_price) || 0), 0)).toLocaleString()}`} label="Stock Value" color="green" />
                <MiniStat icon={Calendar} value={expiryData.find(d => d.key === 'expired')?.value || 0} label="Expired" color="red" trend={{ direction: 'down', value: 'Check' }} />
            </div>

            {/* Dashboard Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <InteractiveDonutChart
                        data={statusData}
                        title="Stock Status"
                        subtitle="Click segment to filter"
                        activeKey={activeStatusKey}
                        onSegmentClick={handleStatusClick}
                        size={200}
                        innerRadius={60}
                    />
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <InteractiveDonutChart
                        data={categoryData}
                        title="By Category"
                        subtitle="Click to filter by category"
                        activeKey={activeCategoryKey}
                        onSegmentClick={handleCategoryClick}
                        size={200}
                        innerRadius={60}
                    />
                </div>

                {/* Supplier Distribution */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <InteractiveDonutChart
                        data={supplierData}
                        title="By Supplier"
                        subtitle="Click to filter by supplier"
                        activeKey={activeSupplierKey}
                        onSegmentClick={handleSupplierClick}
                        size={200}
                        innerRadius={60}
                    />
                </div>

                {/* Stock Value by Status */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <InteractiveDonutChart
                        data={stockValueData}
                        title="Stock Value by Status"
                        subtitle="Value distribution ($)"
                        centerValue={`$${(stockValueData.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K`}
                        centerLabel="Total Value"
                        activeKey={activeStatusKey}
                        onSegmentClick={handleStatusClick}
                        size={200}
                        innerRadius={55}
                    />
                </div>

                {/* Expiry Status */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <InteractiveDonutChart
                        data={expiryData}
                        title="Expiry Status"
                        subtitle="Days until expiry"
                        activeKey={null}
                        size={200}
                        innerRadius={60}
                    />
                </div>

                {/* Reorder Cost by Category */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <InteractiveDonutChart
                        data={reorderCostData}
                        title="Reorder Cost"
                        subtitle="Estimated cost by category"
                        centerValue={`$${(reorderCostData.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K`}
                        centerLabel="Total Cost"
                        activeKey={activeCategoryKey}
                        onSegmentClick={handleCategoryClick}
                        size={200}
                        innerRadius={55}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search medicine, generic, barcode..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                        />
                    </div>
                    <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[140px]">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="supplier_id" value={filters.supplier_id} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[140px]">
                        <option value="">All Suppliers</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[130px]">
                        <option value="">All Status</option>
                        <option value="critical">Critical</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                    <select name="sort" value={filters.sort} onChange={handleFilterChange} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none min-w-[140px]">
                        <option value="name_asc">Name A-Z</option>
                        <option value="name_desc">Name Z-A</option>
                        <option value="quantity_asc">Stock Low-High</option>
                        <option value="quantity_desc">Stock High-Low</option>
                    </select>
                    {isFiltered && (
                        <button onClick={resetFilters} className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1">
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div ref={tableRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-sky-600 to-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Medicine</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Reorder</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Expiry</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Supplier</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center">
                                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                        <p className="text-gray-800 font-semibold">All Stocked Up!</p>
                                        <p className="text-sm text-gray-500">No medicines match your current filters.</p>
                                    </td>
                                </tr>
                            ) : filteredMedicines.map((medicine) => {
                                const status = getStockStatus(medicine);
                                return (
                                    <tr key={medicine.id} className="hover:bg-sky-50/30 transition-colors cursor-pointer" onClick={() => { setSelectedMedicine(medicine); setShowModal(true); }}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Package size={16} className="text-gray-400" />
                                                </div>
                                                <span className="font-medium text-gray-800 text-sm">{medicine.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{medicine.category?.name || '---'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-bold text-sm ${status.key === 'out' ? 'text-red-600' : status.key === 'critical' ? 'text-orange-600' : 'text-amber-600'}`}>
                                                {medicine.quantity || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-500">{medicine.reorder_level || 0}</td>
                                        <td className="px-4 py-3 text-center">{getStatusBadge(medicine)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : '---'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-500">{medicine.supplier?.name || '---'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedMedicine(medicine); setShowModal(true); }} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleOrderNow(medicine.id); }} disabled={ordering === medicine.id} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50" title="Reorder">
                                                    <ShoppingCart size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {meta && <Pagination meta={meta} onPageChange={setPage} />}
            </div>

            {/* Detail Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedMedicine?.name || 'Medicine Details'} size="max-w-2xl">
                {selectedMedicine && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Generic Name</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.generic_name || '---'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Status</p>
                                <div className="mt-1">{getStatusBadge(selectedMedicine)}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Current Stock</p>
                                <p className="text-sm font-bold text-gray-800">{selectedMedicine.quantity || 0}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Reorder Level</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.reorder_level || 0}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Expiry Date</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.expiry_date ? new Date(selectedMedicine.expiry_date).toLocaleDateString() : '---'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Supplier</p>
                                <p className="text-sm font-medium text-gray-800">{selectedMedicine.supplier?.name || '---'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => { handleOrderNow(selectedMedicine.id); }} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                                <ShoppingCart size={16} /> Order Now
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}