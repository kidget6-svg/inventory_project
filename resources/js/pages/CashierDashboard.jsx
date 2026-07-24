import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import StatCard from '../components/StatCard';
import SidebarLayout from '../components/SidebarLayout';

export default function CashierDashboard() {
    const [data, setData] = useState(null);
    useEffect(() => { api.get('/dashboard').then(r => setData(r.data)); }, []);

    if (!data) return <SidebarLayout><div className="text-blue-500">Loading...</div></SidebarLayout>;

    return (
        <SidebarLayout pageTitle="Cashier Dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <StatCard value={data.todaySalesCount} label="Today's Sales" color="green" />
                <StatCard value={`$${Number(data.todayRevenue || 0).toFixed(2)}`} label="Today's Revenue" color="blue" />
                <StatCard value={data.totalProducts} label="Available Medicines" color="orange" />
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50">{'\u{1F4B0}'} Recent Sales</h3>
                {data.recentSales?.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Sale ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentSales.map(sale => (
                                <tr key={sale.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                    <td className="px-4 py-3 text-sm">#{sale.id}</td>
                                    <td className="px-4 py-3 text-sm">{sale.sale_date}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">${Number(sale.total_amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-400 text-center py-5">No sales recorded yet</p>}
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/sales" className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">+ New Sale</Link>
                    <Link to="/medicines" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-semibold hover:bg-blue-50">Browse Medicines</Link>
                </div>
            </div>
        </SidebarLayout>
    );
}
