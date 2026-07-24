import React, { useState, useEffect } from 'react';
import api from '../axios';
import SidebarLayout from '../components/SidebarLayout';

export default function LowStock() {
    const [medicines, setMedicines] = useState([]);
    useEffect(() => { api.get('/low-stock').then(r => setMedicines(r.data)); }, []);

    return (
        <SidebarLayout pageTitle="Low Stock Alert">
            <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
                <h3 className="text-base font-semibold text-gray-700 mb-1">Low-Stock Medicines</h3>
                <p className="text-sm text-gray-400 mb-4">Medicines at or below their reorder level</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Medicine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Current Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Reorder Level</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map(m => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                                <td className="px-4 py-3 text-sm">{m.category?.name || 'No Category'}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-red-600">{m.quantity}</td>
                                <td className="px-4 py-3 text-sm">{m.reorder_level}</td>
                                <td className="px-4 py-3 text-sm">
                                    {m.quantity === 0 ? (
                                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Out of Stock</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">Low Stock</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {medicines.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">All medicines are well-stocked!</td></tr>}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
