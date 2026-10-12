import { useLanguage } from "../context/LanguageContext";import React, { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import PieChart from '../components/PieChart';
import { Pill, ShoppingBag } from 'lucide-react';

export default function Reports() {const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [productTypeFilter, setProductTypeFilter] = useState('all'); // 'all' | 'medicine' | 'retail'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    api.get('/reports').then((r) => {
      const payload = r.data || {};
      // normalize paginated sub-resources
      if (payload.sales && payload.sales.data) payload.sales = payload.sales.data;
      if (payload.purchases && payload.purchases.data) payload.purchases = payload.purchases.data;
      setData(payload);
    });
  }, []);

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

  const filterByType = (items) => {
    if (!items) return [];
    if (productTypeFilter === 'medicine') return items.filter((i) => i.product_type === 'medicine');
    if (productTypeFilter === 'retail') return items.filter((i) => i.product_type === 'retail');
    return items;
  };

  const filterAndSort = (items, searchFields) => {
    if (!items) return [];

    let result = [...items];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) =>
      searchFields.some((field) => {
        const value = field.includes('.') ?
        field.split('.').reduce((obj, key) => obj?.[key], item) :
        item[field];
        return value?.toString().toLowerCase().includes(term);
      })
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        let aVal = sortKey.includes('.') ?
        sortKey.split('.').reduce((obj, key) => obj?.[key], a) :
        a[sortKey];
        let bVal = sortKey.includes('.') ?
        sortKey.split('.').reduce((obj, key) => obj?.[key], b) :
        b[sortKey];

        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        if (typeof aVal === 'string') {
          return sortDirection === 'asc' ?
          aVal.localeCompare(bVal) :
          bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  };

  const statusBadge = (status) => {
    const base = 'px-2 py-1 rounded-full text-xs font-semibold';
    if (status === 'completed') return `${base} bg-sky-100 text-sky-700`;
    if (status === 'cancelled') return `${base} bg-red-100 text-red-600`;
    return `${base} bg-sky-100 text-sky-700`;
  };

  const emptyRow = (colSpan, message) =>
  <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">{message}</td></tr>;


  const inventoryData = useMemo(
    () => filterAndSort(filterByType(data?.inventory || data?.medicines || []), ['name', 'batch_number', 'sku']),
    [data, searchTerm, sortKey, sortDirection, productTypeFilter]
  );

  // Derive labels/values for the Inventory by Category pie chart
  const inventoryChartLabels = useMemo(
    () => data?.inventoryChartData?.map((c) => c.category) || [],
    [data]
  );
  const inventoryChartValues = useMemo(
    () => data?.inventoryChartData?.map((c) => c.medicine_count) || [],
    [data]
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
    () => filterAndSort(filterByType(data?.lowStock || []), ['name', 'sku']),
    [data, searchTerm, sortKey, sortDirection, productTypeFilter]
  );

  const expiringData = useMemo(
    () => filterAndSort(filterByType(data?.expiring || []), ['name', 'batch_number', 'sku']),
    [data, searchTerm, sortKey, sortDirection, productTypeFilter]
  );

  if (!data) {
    return (
      <div className="text-sky-500 p-6">{t("Loading reports...")}

      </div>);

  }

  const tabs = [
  { key: 'inventory', label: 'Inventory' },
  { key: 'sales', label: 'Sales' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'lowStock', label: 'Low Stock' },
  { key: 'expiring', label: 'Expiring' }];


  return (
    <div className="space-y-6">
            <div className="flex gap-2 mb-5 flex-wrap">
                {tabs.map((t) =>
        <button key={t.key} onClick={() => setActiveTab(t.key)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === t.key ? 'bg-sky-500 text-white' : 'bg-white text-gray-600 hover:bg-sky-50 border border-gray-200'}`}>
                        {t.label}
                    </button>
        )}
            </div>

            {/* Product Type Toggle for inventory, lowStock, expiring */}
            {['inventory', 'lowStock', 'expiring'].includes(activeTab) &&
      <div className="flex gap-2 mb-4">
                    <button
          onClick={() => setProductTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          productTypeFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`
          }>{t("All Products")}


        </button>
                    <button
          onClick={() => setProductTypeFilter('medicine')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
          productTypeFilter === 'medicine' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`
          }>
          
                        <Pill size={12} />{t("Medicines")}
        </button>
                    <button
          onClick={() => setProductTypeFilter('retail')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
          productTypeFilter === 'retail' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`
          }>
          
                        <ShoppingBag size={12} />{t("Retail / OTC Products")}
        </button>
                </div>
      }

            {/* Search bar */}
            <div className="mb-4">
                <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-400" />
        
            </div>

            {activeTab === 'inventory' &&
      <div className="space-y-6">
                    {inventoryChartLabels.length > 0 &&
        <div className="card">
                            <div className="p-5">
                                <PieChart
              labels={inventoryChartLabels}
              values={inventoryChartValues} />
            
                            </div>
                        </div>
        }

                    <div className="card overflow-hidden">
                        <div className="px-5 py-3 border-b border-sky-100"><h3 className="font-semibold text-gray-700">{t("Inventory Report (")}{inventoryData.length}{t("items)")}</h3></div>
                        <table className="w-full">
                            <thead><tr className="bg-sky-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">{t("Type")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('name')}>{t("Name")}{sortIcon('name')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('batch_number')}>{t("Batch / SKU")}{sortIcon('batch_number')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('quantity')}>{t("Qty")}{sortIcon('quantity')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('unit_price')}>{t("Price")}{sortIcon('unit_price')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('expiry_date')}>{t("Expiry")}{sortIcon('expiry_date')}</th>
                            </tr></thead>
                            <tbody>
                                {inventoryData.length > 0 ? inventoryData.map((item) =>
              <tr key={`${item.product_type}-${item.id}`} className="border-b border-gray-50 hover:bg-sky-50/30">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  item.product_type === 'retail' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`
                  }>
                                                {item.product_type === 'retail' ? 'Retail / OTC' : 'Medicine'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                                        <td className="px-4 py-3 text-sm">{item.batch_number || item.sku || '---'}</td>
                                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm">${Number(item.unit_price || item.price || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '---'}</td>
                                    </tr>
              ) : emptyRow(6, 'No products found')}
                            </tbody>
                        </table>
                    </div>
                </div>
      }

            {activeTab === 'sales' &&
      <div className="card overflow-hidden">
                    <div className="px-5 py-3 border-b border-sky-100"><h3 className="font-semibold text-gray-700">{t("Sales Report (")}{salesData.length}{t("sales)")}</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-sky-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('id')}>{t("ID")}{sortIcon('id')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('sale_date')}>{t("Date")}{sortIcon('sale_date')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('total_amount')}>{t("Amount")}{sortIcon('total_amount')}</th>
                        </tr></thead>
                        <tbody>
                            {salesData.length > 0 ? salesData.map((s) =>
            <tr key={s.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                    <td className="px-4 py-3 text-sm">{s.id}</td>
                                    <td className="px-4 py-3 text-sm">{s.sale_date}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">${Number(s.total_amount).toFixed(2)}</td>
                                </tr>
            ) : emptyRow(3, 'No sales found')}
                        </tbody>
                    </table>
                </div>
      }

            {activeTab === 'purchases' &&
      <div className="card overflow-hidden">
                    <div className="px-5 py-3 border-b border-sky-100"><h3 className="font-semibold text-gray-700">{t("Purchase Orders (")}{purchasesData.length})</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-sky-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('id')}>{t("ID")}{sortIcon('id')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('supplier.name')}>{t("Supplier")}{sortIcon('supplier.name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('order_date')}>{t("Date")}{sortIcon('order_date')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('status')}>{t("Status")}{sortIcon('status')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('total_amount')}>{t("Amount")}{sortIcon('total_amount')}</th>
                        </tr></thead>
                        <tbody>
                            {purchasesData.length > 0 ? purchasesData.map((p) =>
            <tr key={p.id} className="border-b border-gray-50 hover:bg-sky-50/30">
                                    <td className="px-4 py-3 text-sm">{p.id}</td>
                                    <td className="px-4 py-3 text-sm">{p.supplier?.name || '---'}</td>
                                    <td className="px-4 py-3 text-sm">{p.order_date}</td>
                                    <td className="px-4 py-3 text-sm">{p.status}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">${Number(p.total_amount).toFixed(2)}</td>
                                </tr>
            ) : emptyRow(5, 'No purchase orders found')}
                        </tbody>
                    </table>
                </div>
      }

            {activeTab === 'lowStock' &&
      <div className="card overflow-hidden">
                    <div className="px-5 py-3 border-b border-sky-100"><h3 className="font-semibold text-gray-700">{t("Low Stock Report (")}{lowStockData.length})</h3></div>
                    <table className="w-full">
                        <thead><tr className="bg-sky-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">{t("Type")}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('name')}>{t("Name")}{sortIcon('name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('quantity')}>{t("Qty")}{sortIcon('quantity')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('reorder_level')}>{t("Reorder Level")}{sortIcon('reorder_level')}</th>
                        </tr></thead>
                        <tbody>
                            {lowStockData.length > 0 ? lowStockData.map((item) =>
            <tr key={`${item.product_type}-${item.id}`} className="border-b border-gray-50 hover:bg-sky-50/30">
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                item.product_type === 'retail' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`
                }>
                                            {item.product_type === 'retail' ? 'Retail / OTC' : 'Medicine'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{item.quantity}</td>
                                    <td className="px-4 py-3 text-sm">{item.reorder_level ?? 10}</td>
                                </tr>
            ) : emptyRow(4, 'No low stock items')}
                        </tbody>
                    </table>
                </div>
      }

            {activeTab === 'expiring' &&
      <div className="card overflow-hidden">
                    <div className="px-5 py-3 border-b border-sky-100 flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-semibold text-gray-700">{t("Expiry Report \u2014 Expiring Soon (90 days) (")}{expiringData.length})</h3>
                        {expiringData.length > 0 &&
          <div className="flex gap-2 text-xs">
                                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                                    {expiringData.filter((i) => i.daysLeft < 0).length}{t("Expired")}
            </span>
                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                    {expiringData.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 90).length}{t("Expiring Soon")}
            </span>
                            </div>
          }
                    </div>
                    <table className="w-full">
                        <thead><tr className="bg-sky-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase">{t("Type")}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('name')}>{t("Name")}{sortIcon('name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('batch_number')}>{t("Batch / SKU")}{sortIcon('batch_number')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('quantity')}>{t("Qty")}{sortIcon('quantity')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 cursor-pointer hover:bg-sky-100" onClick={() => handleSort('expiry_date')}>{t("Expiry Date")}{sortIcon('expiry_date')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">{t("Days Left")}</th>
                        </tr></thead>
                        <tbody>
                            {expiringData.length > 0 ? expiringData.map((item) => {const { t } = useLanguage();
              const daysLeft = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
              const expired = daysLeft < 0;
              const urgent = !expired && daysLeft <= 30;
              const soon = !expired && daysLeft <= 90;
              return (
                <tr key={`${item.product_type}-${item.id}`} className="border-b border-gray-50 hover:bg-sky-50/30">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.product_type === 'retail' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`
                    }>
                                                {item.product_type === 'retail' ? 'Retail / OTC' : 'Medicine'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                                        <td className="px-4 py-3 text-sm">{item.batch_number || item.sku || '---'}</td>
                                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-orange-600">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '---'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    expired ? 'bg-red-100 text-red-700' :
                    urgent ? 'bg-red-100 text-red-700' :
                    soon ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'}`
                    }>
                                                {expired ? `Expired (${Math.abs(daysLeft)}d ago)` : `${daysLeft} days left`}
                                            </span>
                                        </td>
                                    </tr>);

            }) : emptyRow(6, 'No items with expiry dates')}
                        </tbody>
                    </table>
                </div>
      }
        </div>);

}