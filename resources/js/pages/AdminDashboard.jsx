import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import StatCard from '../components/StatCard';
import SidebarLayout from '../components/SidebarLayout';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    useEffect(() => { api.get('/dashboard').then(r => setData(r.data)); }, []);

    if (!data) return <SidebarLayout><div className="text-blue-500">Loading...</div></SidebarLayout>;

    return (
        <SidebarLayout pageTitle="Admin Dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <StatCard value={data.totalProducts} label="Total Medicine Types" color="blue" />
                <StatCard value={data.totalStock} label="Total Stock Units" color="green" />
                <StatCard value={data.lowStockCount} label="Low-Stock Medicines" color="red" />
                <StatCard value={data.expiringCount} label="Expiring Within 90 Days" color="orange" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <StatCard value={data.todaySalesCount} label="Today's Sales" color="green" />
                <StatCard value={`$${Number(data.todayRevenue || 0).toFixed(2)}`} label="Today's Revenue" color="blue" />
                <StatCard value={data.totalSuppliers} label="Suppliers" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50">{'\u26A0'} Low-Stock Medicines</h3>
                    {data.lowStockMedicines?.length > 0 ? data.lowStockMedicines.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3 bg-orange-50 border-l-3 border-orange-400 rounded-md mb-2">
                            <div>
                                <div className="font-semibold text-sm">{m.name}</div>
                                <div className="text-xs text-gray-400">{m.category?.name || 'No Category'}</div>
                            </div>
                            <div className="text-right">
                                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Stock: {m.quantity}</span>
                                <div className="text-xs text-gray-400 mt-1">Reorder: {m.reorder_level}</div>
                            </div>
                        </div>
                    )) : <p className="text-gray-400 text-center py-5">No low-stock medicines</p>}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50">{'\u{1F4C5}'} Expiring Within 90 Days</h3>
                    {data.expiringMedicines?.length > 0 ? data.expiringMedicines.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 border-l-3 border-red-400 rounded-md mb-2">
                            <div>
                                <div className="font-semibold text-sm">{m.name}</div>
                                <div className="text-xs text-gray-400">Batch: {m.batch_number || '---'}</div>
                            </div>
                            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Expires: {m.expiry_date}</span>
                        </div>
                    )) : <p className="text-gray-400 text-center py-5">No medicines expiring soon</p>}
                </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm mt-5">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/medicines" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">+ Add Medicine</Link>
                    <Link to="/sales" className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">+ New Sale</Link>
                    <Link to="/purchase-orders" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">+ Purchase Order</Link>
                    <Link to="/reports" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">View Reports</Link>
                </div>
            </div>
        </SidebarLayout>
    );
}
