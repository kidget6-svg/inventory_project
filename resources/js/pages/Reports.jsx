import React, { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function Reports() {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('inventory');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => { api.get('/reports').then(r => setData(r.data)); }, []);

    // Reset search and sort when switching tabs
    useEffect(() => {
        setSearchTerm('');
        setSortKey('');
        setSortDirection('asc');
    }, [activeTab]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortIcon = (key) => {
        if (sortKey !== key) return ' ↕';
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    const filterAndSort = (items, searchFields) => {
        if (!items) return [];

        let result = [...items];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                searchFields.some(field => {
                    const value = field.includes('.')
                        ? field.split('.').reduce((obj, key) => obj?.[key], item)
                        : item[field];
                    return value?.toString().toLowerCase().includes(term);
                })
            );
        }

        // Sort
        if (sortKey) {
            result.sort((a, b) => {
                let aVal = sortKey.includes('.')
                    ? sortKey.split('.').reduce((obj, key) => obj?.[key], a)
                    : a[sortKey];
                let bVal = sortKey.includes('.')
                    ? sortKey.split('.').reduce((obj, key) => obj?.[key], b)
                    : b[sortKey];

                if (aVal === null || aVal === undefined) aVal = '';
                if (bVal === null || bVal === undefined) bVal = '';

                if (typeof aVal === 'string') {
                    return sortDirection === 'asc'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            });
        }

        return result;
    };

    const statusBadge = (status) => {
        const base = 'px-2 py-1 rounded-full text-xs font-semibold';
        if (status === 'completed') return `${base} bg-green-100 text-green-700`;
        if (status === 'cancelled') return `${base} bg-red-100 text-red-600`;
        return `${base} bg-blue-100 text-blue-700`;
    };

    const emptyRow = (colSpan, message) => (
        <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">{message}</td></tr>
    );

   const inventoryData = useMemo(
    () => filterAndSort(data?.medicines || [], ['name', 'batch_number']),
    [data, searchTerm, sortKey, sortDirection]
);

const salesData = useMemo(
    () => filterAndSort(data?.sales || [], ['id', 'sale_date']),
    [data, searchTerm, sortKey, sortDirection]
);

const purchasesData = useMemo(
    () => filterAndSort(data?.purchases || [], ['id', 'supplier.name', 'order_date', 'status']),
    [data, searchTerm, sortKey, sortDirection]
);

const lowStockData = useMemo(
    () => filterAndSort(data?.lowStock || [], ['name']),
    [data, searchTerm, sortKey, sortDirection]
);

const expiringData = useMemo(
    () => filterAndSort(data?.expiring || [], ['name', 'batch_number']),
    [data, searchTerm, sortKey, sortDirection]
);

if (!data) {
    return (
        <SidebarLayout pageTitle="Reports">
            <div className="text-blue-500 p-6">
                Loading reports...
            </div>
        </SidebarLayout>
    );
}

const tabs = [
    { key: 'inventory', label: 'Inventory' },
    { key: 'sales', label: 'Sales' },
    { key: 'purchases', label: 'Purchases' },
    { key: 'lowStock', label: 'Low Stock' },
    { key: 'expiring', label: 'Expiring' },
];



    return (
        <SidebarLayout pageTitle="Reports">
            <div className="flex gap-2 mb-5 flex-wrap">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === t.key ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Search bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
                />
            </div>

            {activeTab === 'inventory' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Inventory Report ({inventoryData.length} items)</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('name')}>Name{sortIcon('name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('batch_number')}>Batch{sortIcon('batch_number')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('quantity')}>Qty{sortIcon('quantity')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('unit_price')}>Price{sortIcon('unit_price')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('expiry_date')}>Expiry{sortIcon('expiry_date')}</th>
                        </tr></thead>
                        <tbody>
                            {inventoryData.length > 0 ? inventoryData.map(m => (
                                <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                    <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                    <td className="px-4 py-3 text-sm">{m.batch_number || '---'}</td>
                                    <td className="px-4 py-3 text-sm">{m.quantity}</td>
                                    <td className="px-4 py-3 text-sm">${Number(m.unit_price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm">{m.expiry_date || '---'}</td>
                                </tr>
                            )) : emptyRow(5, 'No medicines found')}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Sales Report ({salesData.length} sales)</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('id')}>ID{sortIcon('id')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('sale_date')}>Date{sortIcon('sale_date')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('total_amount')}>Amount{sortIcon('total_amount')}</th>
                        </tr></thead>
                        <tbody>
                            {salesData.length > 0 ? salesData.map(s => (
                                <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                    <td className="px-4 py-3 text-sm">#{s.id}</td>
                                    <td className="px-4 py-3 text-sm">{s.sale_date}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">${Number(s.total_amount).toFixed(2)}</td>
                                </tr>
                            )) : emptyRow(3, 'No sales found')}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'purchases' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Purchase Orders ({purchasesData.length})</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('id')}>ID{sortIcon('id')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('supplier.name')}>Supplier{sortIcon('supplier.name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('order_date')}>Date{sortIcon('order_date')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('status')}>Status{sortIcon('status')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('total_amount')}>Amount{sortIcon('total_amount')}</th>
                        </tr></thead>
                        <tbody>
                            {purchasesData.length > 0 ? purchasesData.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                    <td className="px-4 py-3 text-sm">#{p.id}</td>
                                    <td className="px-4 py-3 text-sm">{p.supplier?.name || '---'}</td>
                                    <td className="px-4 py-3 text-sm">{p.order_date}</td>
                                    <td className="px-4 py-3 text-sm"><span className={statusBadge(p.status)}>{p.status}</span></td>
                                    <td className="px-4 py-3 text-sm">${Number(p.total_amount || 0).toFixed(2)}</td>
                                </tr>
                            )) : emptyRow(5, 'No purchase orders found')}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'lowStock' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Low Stock Report ({lowStockData.length} items)</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('name')}>Medicine{sortIcon('name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('quantity')}>Stock{sortIcon('quantity')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('reorder_level')}>Reorder Level{sortIcon('reorder_level')}</th>
                        </tr></thead>
                        <tbody>
                            {lowStockData.length > 0 ? lowStockData.map(m => (
                                <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                    <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{m.quantity}</td>
                                    <td className="px-4 py-3 text-sm">{m.reorder_level}</td>
                                </tr>
                            )) : emptyRow(3, 'No low stock items')}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'expiring' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Expiring Medicines ({expiringData.length})</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('name')}>Medicine{sortIcon('name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('batch_number')}>Batch{sortIcon('batch_number')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('expiry_date')}>Expiry Date{sortIcon('expiry_date')}</th>
                        </tr></thead>
                        <tbody>
                            {expiringData.length > 0 ? expiringData.map(m => (
                                <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                    <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                    <td className="px-4 py-3 text-sm">{m.batch_number || '---'}</td>
                                    <td className="px-4 py-3 text-sm text-red-600 font-semibold">{m.expiry_date}</td>
                                </tr>
                            )) : emptyRow(3, 'No expiring medicines')}
                        </tbody>
                    </table>
                </div>
            )}
        </SidebarLayout>
    );
}
