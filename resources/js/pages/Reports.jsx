import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function Reports() {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('inventory');
    useEffect(() => { api.get('/reports').then(r => setData(r.data)); }, []);

    if (!data) return <SidebarLayout pageTitle="Reports"><div className="text-blue-500">Loading reports...</div></SidebarLayout>;

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

            {activeTab === 'inventory' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Inventory Report ({data.medicines?.length || 0} items)</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Batch</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Expiry</th>
                        </tr></thead>
                        <tbody>{data.medicines?.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                <td className="px-4 py-3 text-sm">{m.batch_number || '---'}</td>
                                <td className="px-4 py-3 text-sm">{m.quantity}</td>
                                <td className="px-4 py-3 text-sm">${Number(m.unit_price).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm">{m.expiry_date || '---'}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Sales Report ({data.sales?.length || 0} sales)</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Amount</th>
                        </tr></thead>
                        <tbody>{data.sales?.map(s => (
                            <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm">#{s.id}</td>
                                <td className="px-4 py-3 text-sm">{s.sale_date}</td>
                                <td className="px-4 py-3 text-sm font-semibold">${Number(s.total_amount).toFixed(2)}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {activeTab === 'purchases' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Purchase Orders ({data.purchases?.length || 0})</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Supplier</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Amount</th>
                        </tr></thead>
                        <tbody>{data.purchases?.map(p => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm">#{p.id}</td>
                                <td className="px-4 py-3 text-sm">{p.supplier?.name || '---'}</td>
                                <td className="px-4 py-3 text-sm">{p.order_date}</td>
                                <td className="px-4 py-3 text-sm">${Number(p.total_amount || 0).toFixed(2)}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {activeTab === 'lowStock' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Low Stock Report ({data.lowStock?.length || 0} items)</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Reorder Level</th>
                        </tr></thead>
                        <tbody>{data.lowStock?.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-red-600">{m.quantity}</td>
                                <td className="px-4 py-3 text-sm">{m.reorder_level}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {activeTab === 'expiring' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-blue-50"><h3 className="font-semibold text-gray-700">Expiring Medicines ({data.expiring?.length || 0})</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Batch</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Expiry Date</th>
                        </tr></thead>
                        <tbody>{data.expiring?.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                <td className="px-4 py-3 text-sm">{m.batch_number || '---'}</td>
                                <td className="px-4 py-3 text-sm text-red-600 font-semibold">{m.expiry_date}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
        </SidebarLayout>
    );
}
