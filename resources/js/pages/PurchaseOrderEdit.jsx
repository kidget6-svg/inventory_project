import { useLanguage } from "../context/LanguageContext";import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft, Save, X, Plus, Trash2, Search, Pill, Package } from
'lucide-react';

export default function PurchaseOrderEdit() {const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [retailProducts, setRetailProducts] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('medicine');
  const [medSearch, setMedSearch] = useState('');
  const [retailSearch, setRetailSearch] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [showRetailDropdown, setShowRetailDropdown] = useState(false);
  const medSearchRef = useRef(null);
  const retailSearchRef = useRef(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
    api.get('/suppliers').then((r) => setSuppliers(r.data?.data || r.data)),
    api.get('/medicines?per_page=all').then((r) => {
      const list = Array.isArray(r.data?.data) ? r.data.data :
      Array.isArray(r.data?.medicines?.data) ? r.data.medicines.data :
      Array.isArray(r.data) ? r.data : [];
      setMedicines(list);
    }),
    api.get('/retail-products?per_page=1000').then((r) => {
      const list = Array.isArray(r.data?.data) ? r.data.data :
      Array.isArray(r.data?.retailProducts?.data) ? r.data.retailProducts.data :
      Array.isArray(r.data) ? r.data : [];
      setRetailProducts(list);
    }),
    api.get(`/purchase-orders/${id}`).then((r) => {
      const data = r.data;
      setSupplierId(data.supplier_id || '');
      const loadedItems = (data.items || []).map((oi) => {
        const isRetail = oi.itemable_type?.includes('RetailProduct');
        return {
          type: isRetail ? 'retail' : 'medicine',
          id: oi.itemable_id || oi.medicine_id,
          name: oi.itemable?.name || oi.medicine?.name || 'Unknown',
          quantity: oi.quantity || 1,
          manufacturer: oi.manufacturer || ''
        };
      });
      setItems(loadedItems);
    })]
    ).finally(() => setLoading(false));
  }, [id]);

  // Click-outside handler for dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (medSearchRef.current && !medSearchRef.current.contains(e.target)) {
        setShowMedDropdown(false);
      }
      if (retailSearchRef.current && !retailSearchRef.current.contains(e.target)) {
        setShowRetailDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isItemAdded = (type, id) => items.some((i) => i.type === type && i.id === id);

  const addItem = (type, product) => {
    if (isItemAdded(type, product.id)) return;
    setItems((prev) => [...prev, {
      type,
      id: product.id,
      name: product.name,
      quantity: 1,
      manufacturer: product.manufacturer || ''
    }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) =>
    i === index ? { ...it, [field]: value } : it
    ));
  };

  const filteredMedicines = medicines.filter((m) =>
  (m.name || '').toLowerCase().includes(medSearch.toLowerCase())
  );
  const filteredRetail = retailProducts.filter((r) =>
  (r.name || '').toLowerCase().includes(retailSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError(t("Please add at least one product to the order."));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        supplier_id: supplierId,
        items: items.map((i) => ({
          medicine_id: i.type === 'medicine' ? i.id : null,
          retail_product_id: i.type === 'retail' ? i.id : null,
          quantity: parseInt(i.quantity) || 1,
          manufacturer: i.manufacturer || null
        }))
      };
      await api.put(`/purchase-orders/${id}`, payload);
      window.showToast(t("Purchase order updated successfully"), 'success');
      navigate('/purchase-orders');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : err.response?.data?.message || 'Error saving order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text={t("Loading purchase order...")} />;

  return (
    <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
          to="/purchase-orders"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          
                    <ArrowLeft size={16} />{t("Back to Purchase Orders")}

        </Link>
                <h1 className="text-2xl font-bold text-gray-800">{t("Edit Purchase Order")}</h1>
            </div>

            <div className="card p-6">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 1. Supplier */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("1. Supplier *")}</label>
                        <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              required>
              
                            <option value="">{t("Select Supplier")}</option>
                            {suppliers.map((s) =>
              <option key={s.id} value={s.id}>{s.name}</option>
              )}
                        </select>
                    </div>

                    {/* 2. Product selection tabs */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("2. Add Products")}</label>
                        <div className="flex gap-2 mb-2">
                            <button
                type="button"
                onClick={() => setActiveTab('medicine')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'medicine' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}>
                
                                <Pill size={14} />{t("Medicines (")}
                {medicines.length})
                            </button>
                            <button
                type="button"
                onClick={() => setActiveTab('retail')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'retail' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                
                                <Package size={14} />{t("Retail & OTC (")}
                {retailProducts.length})
                            </button>
                        </div>

                        {/* Medicine search dropdown */}
                        {activeTab === 'medicine' &&
            <div className="relative" ref={medSearchRef}>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                  type="text"
                  value={medSearch}
                  onChange={(e) => {setMedSearch(e.target.value);setShowMedDropdown(true);}}
                  onFocus={() => setShowMedDropdown(true)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                  placeholder={t("Search medicines by name...")} />
                
                                </div>
                                {showMedDropdown &&
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                        {filteredMedicines.slice(0, 50).map((m) => {const { t } = useLanguage();
                  const added = isItemAdded('medicine', m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => addItem('medicine', m)}
                      disabled={added}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-sky-50 ${added ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      
                                                    <span className="flex items-center gap-2">
                                                        <Pill size={14} className="text-sky-400" />
                                                        {m.name}
                                                    </span>
                                                    {added ?
                      <span className="text-xs text-green-600 font-semibold">{t("Added")}</span> :
                      <Plus size={16} className="text-sky-500" />
                      }
                                                </button>);

                })}
                                        {filteredMedicines.length === 0 &&
                <div className="px-3 py-4 text-center text-gray-400 text-sm">{t("No medicines found")}</div>
                }
                                        {filteredMedicines.length > 50 &&
                <div className="px-3 py-2 text-center text-xs text-gray-400 border-t border-gray-100">{t("Showing first 50 of")}
                  {filteredMedicines.length}{t("results. Refine search to see more.")}
                </div>
                }
                                    </div>
              }
                            </div>
            }

                        {/* Retail & OTC search dropdown */}
                        {activeTab === 'retail' &&
            <div className="relative" ref={retailSearchRef}>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                  type="text"
                  value={retailSearch}
                  onChange={(e) => {setRetailSearch(e.target.value);setShowRetailDropdown(true);}}
                  onFocus={() => setShowRetailDropdown(true)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                  placeholder={t("Search retail & OTC products...")} />
                
                                </div>
                                {showRetailDropdown &&
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                        {filteredRetail.slice(0, 50).map((r) => {const { t } = useLanguage();
                  const added = isItemAdded('retail', r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => addItem('retail', r)}
                      disabled={added}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-amber-50 ${added ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      
                                                    <span className="flex items-center gap-2">
                                                        <Package size={14} className="text-amber-400" />
                                                        {r.name}
                                                    </span>
                                                    {added ?
                      <span className="text-xs text-green-600 font-semibold">{t("Added")}</span> :
                      <Plus size={16} className="text-amber-500" />
                      }
                                                </button>);

                })}
                                        {filteredRetail.length === 0 &&
                <div className="px-3 py-4 text-center text-gray-400 text-sm">{t("No retail products found")}</div>
                }
                                        {filteredRetail.length > 50 &&
                <div className="px-3 py-2 text-center text-xs text-gray-400 border-t border-gray-100">{t("Showing first 50 of")}
                  {filteredRetail.length}{t("results. Refine search to see more.")}
                </div>
                }
                                    </div>
              }
                            </div>
            }
                    </div>

                    {/* 3. Selected items - WITHOUT Unit Price and Subtotal */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("3. Selected Items (")}{items.length})</label>
                        {items.length > 0 ?
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t("Product")}</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 w-24">{t("Type")}</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t("Manufacturer")}</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 w-24">{t("Qty")}</th>
                                            <th className="px-4 py-2 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((it, i) =>
                  <tr key={`${it.type}-${it.id}`} className="border-t border-gray-100">
                                                <td className="px-4 py-2 text-sm font-medium text-gray-800 flex items-center gap-2">
                                                    {it.type === 'medicine' ?
                      <Pill size={14} className="text-sky-400" /> :
                      <Package size={14} className="text-amber-400" />}
                                                    {it.name}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={it.type === 'medicine' ?
                      "px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700" :
                      "px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"
                      }>
                                                        {it.type === 'medicine' ? 'Medicine' : 'OTC'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                        type="text"
                        value={it.manufacturer || ''}
                        onChange={(e) => updateItem(i, 'manufacturer', e.target.value)}
                        className="w-40 px-2 py-1 text-sm border border-gray-200 rounded focus:border-sky-400 outline-none"
                        placeholder={t("e.g. GSK, Pfizer")} />
                      
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        className="w-20 px-2 py-1 text-sm text-right border border-gray-200 rounded focus:border-sky-400 outline-none"
                        min="1" />
                      
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title={t("Remove item")}>
                        
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                  )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-200 bg-gray-50">
                                            <td colSpan="3" className="px-4 py-2 text-right text-xs font-bold text-gray-700">{t("Total Items:")}</td>
                                            <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">{items.length}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div> :

            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />{t("No products added yet. Search and add products above.")}

            </div>
            }
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                        <Link to="/purchase-orders" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                            <X size={16} />{t("Cancel")}

            </Link>
                        <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60">
              
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save size={16} />{t("Update Order")}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>);

}