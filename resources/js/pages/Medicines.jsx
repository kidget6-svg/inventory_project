import React, { useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { 
    Plus, Search, Edit3, Trash2, RotateCcw, Scan, 
    AlertTriangle, ShieldAlert, Package, Layers, X, Upload, Check
} from 'lucide-react';

export default function Medicines() {
    const [search, setSearch] = useState('');
    const [showTrash, setShowTrash] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Initial Form State
    const initialFormState = {
        name: '',
        generic_name: '',
        manufacturer: '',
        dosage_form: 'Tablet',
        strength: '500mg',
        unit_price: 10.00,
        stock_quantity: 50,
        reorder_level: 10,
        batch_number: '',
        gtin_ndc: '',
        expiry_date: '',
        barcode: '',
        requires_prescription: false,
        shelf_number: '',
        row_number: '',
        image: null
    };

    const [formData, setFormData] = useState(initialFormState);

    // Initial Active & Trashed State
    const [medicines, setMedicines] = useState([
        {
            id: 1,
            name: 'Amoxicillin 500mg',
            generic_name: 'Amoxicillin Trihydrate',
            gtin_ndc: '00360846011049',
            barcode: '890123456789',
            shelf_number: 'A-12',
            row_number: 'R-04',
            stock_quantity: 45,
            reorder_level: 10,
            unit_price: 12.50,
            batch_number: 'B-9042',
            expiry_date: '2027-11-30',
            requires_prescription: true,
            trashed: false
        },
        {
            id: 2,
            name: 'Paracetamol 500mg',
            generic_name: 'Acetaminophen',
            gtin_ndc: '00360846011050',
            barcode: '890123456790',
            shelf_number: 'B-05',
            row_number: 'R-02',
            stock_quantity: 4,
            reorder_level: 10,
            unit_price: 5.00,
            batch_number: 'B-8821',
            expiry_date: '2026-08-15',
            requires_prescription: false,
            trashed: false
        }
    ]);

    // Open Modal Handlers
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ ...item });
        } else {
            setEditingItem(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    // Save/Update Handler
    const handleSave = (e) => {
        e.preventDefault();
        if (editingItem) {
            setMedicines(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...formData } : m));
        } else {
            setMedicines(prev => [{ ...formData, id: Date.now(), trashed: false }, ...prev]);
        }
        setIsModalOpen(false);
    };

    // Soft Delete & Restore Handlers
    const handleSoftDelete = (id) => {
        setMedicines(prev => prev.map(m => m.id === id ? { ...m, trashed: true } : m));
    };

    const handleRestore = (id) => {
        setMedicines(prev => prev.map(m => m.id === id ? { ...m, trashed: false } : m));
    };

    // Filter Items Based on Trash & Search
    const filteredMedicines = medicines.filter(m => {
        const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
                              (m.generic_name || '').toLowerCase().includes(search.toLowerCase()) || 
                              (m.barcode || '').includes(search);
        return showTrash ? (m.trashed && matchesSearch) : (!m.trashed && matchesSearch);
    });

    const getStockBadge = (qty, reorder) => {
        if (qty === 0) return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1 w-fit"><ShieldAlert size={12}/> Out of Stock</span>;
        if (qty <= reorder) return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Low Stock ({qty})</span>;
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg w-fit">In Stock ({qty})</span>;
    };

    return (
        <SidebarLayout pageTitle="Medicine Inventory Management">
            
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, generic, barcode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-72 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowTrash(!showTrash)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                            showTrash ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <Trash2 size={15} />
                        {showTrash ? 'View Active Items' : 'Trash Bin'}
                    </button>
                </div>

                {/* Add New Medicine Action Button */}
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                    <Plus size={16} />
                    Add New Medicine
                </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4">Medicine Details</th>
                                <th className="p-4">Identifiers (GTIN / Barcode)</th>
                                <th className="p-4">Shelf & Location</th>
                                <th className="p-4">Stock Status</th>
                                <th className="p-4">Batch & Expiry</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredMedicines.length > 0 ? (
                                filteredMedicines.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-400">Generic: {item.generic_name || 'N/A'}</p>
                                                    {item.requires_prescription && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded">
                                                            Prescription Required
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-mono text-slate-700">GTIN: {item.gtin_ndc || 'N/A'}</p>
                                            <p className="text-xs font-mono text-slate-400">BC: {item.barcode || 'N/A'}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <Layers size={14} className="text-blue-500" />
                                                <span>Shelf: {item.shelf_number || 'N/A'}, Row: {item.row_number || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getStockBadge(item.stock_quantity, item.reorder_level)}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-bold text-slate-700">Batch: {item.batch_number || 'N/A'}</p>
                                            <p className="text-xs text-slate-500">{item.expiry_date || 'N/A'}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!item.trashed ? (
                                                    <>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleOpenModal(item)}
                                                            className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleSoftDelete(item.id)}
                                                            className="p-2 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRestore(item.id)}
                                                        className="p-2 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                                                    >
                                                        <RotateCcw size={16} /> Restore
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 text-sm">
                                        No medicines found matching your query.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            {editingItem ? 'Edit Medicine Entry' : 'Add New Medicine'}
                        </h3>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Generic Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.generic_name}
                                        onChange={e => setFormData({ ...formData, generic_name: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">GTIN / NDC Code</label>
                                    <input 
                                        type="text" 
                                        value={formData.gtin_ndc}
                                        onChange={e => setFormData({ ...formData, gtin_ndc: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Barcode</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={formData.barcode}
                                            onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setIsScannerOpen(true)}
                                            className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
                                        >
                                            <Scan size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Shelf Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. A-12"
                                        value={formData.shelf_number}
                                        onChange={e => setFormData({ ...formData, shelf_number: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Row Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Row-3"
                                        value={formData.row_number}
                                        onChange={e => setFormData({ ...formData, row_number: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                                    <input 
                                        type="number" 
                                        value={formData.stock_quantity}
                                        onChange={e => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.expiry_date}
                                        onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="prescription_check"
                                    checked={formData.requires_prescription}
                                    onChange={e => setFormData({ ...formData, requires_prescription: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                />
                                <label htmlFor="prescription_check" className="text-xs font-semibold text-slate-700">
                                    Requires Prescription
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition cursor-pointer"
                                >
                                    Save Medicine
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Barcode Scanner Modal */}
            {isScannerOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                        <button 
                            type="button"
                            onClick={() => setIsScannerOpen(false)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Scan className="text-blue-600" size={20} /> Barcode Reader
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Point your hardware barcode scanner gun or type the numeric digits below:
                        </p>
                        <input
                            type="text"
                            placeholder="Scan barcode digits..."
                            value={formData.barcode}
                            onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setIsScannerOpen(false)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                            Confirm Barcode
                        </button>
                    </div>
                </div>
            )}

        </SidebarLayout>
    );
}