import { useLanguage } from "../context/LanguageContext";import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import {
  Search, Filter, Eye, Edit, Trash2, X, Save, Package, Calendar,
  Tag, DollarSign, Loader2, FileText, Plus, Upload, Image as ImageIcon } from
'lucide-react';

const statusOptions = [
{ value: '', label: 'All Statuses' },
{ value: 'active', label: 'Active' },
{ value: 'inactive', label: 'Inactive' },
{ value: 'expired', label: 'Expired' },
{ value: 'discontinued', label: 'Discontinued' }];


const dosageFormOptions = [
'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Drops', 'Injection', 'Ointment',
'Cream', 'Gel', 'Lotion', 'Powder', 'Granules', 'Spray', 'Inhaler',
'Suppository', 'Solution', 'Elixir', 'Patch', 'Lozenges', 'Sachet',
'Ampoule', 'Vial', 'Eye Drops', 'Ear Drops', 'Nasal Spray', 'Cough Syrup'];


const unitOptions = [
'Tablet(s)', 'Capsule(s)', 'mL', 'mg', 'mcg', 'g', 'mg/mL', 'mg/5mL', '%',
'Pill(s)', 'Drops', 'Puffs', 'IU', 'Unit(s)', 'Sachet(s)', 'Vial(s)'];


export default function Medicines() {const { t } = useLanguage();
  const { user } = useAuth();
  const { branchRefreshKey } = useBranch();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isPharmacist = user?.role === 'pharmacist';
  const canWrite = isAdmin || isPharmacist;

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewMedicine, setViewMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dosageOther, setDosageOther] = useState(false);
  const [unitOther, setUnitOther] = useState(false);

  const [form, setForm] = useState({
    name: '', generic_name: '', batch_number: '', category_id: '',
    reorder_level: '', description: '', status: 'active', branch_id: '',
    dosage_form: '', strength: '', unit: ''
  });

  const [filters, setFilters] = useState({
    search: '', category_id: '', status: ''
  });

  const [searchTimeout, setSearchTimeout] = useState(null);

  const loadMedicines = () => {
    setLoading(true);
    const params = { page };
    if (filters.search) params.search = filters.search;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.status) params.status = filters.status;

    api.get('/medicines', { params }).
    then((r) => {
      let medicinesData = [];
      if (Array.isArray(r.data.data)) {
        medicinesData = r.data.data;
      } else if (Array.isArray(r.data.medicines?.data)) {
        medicinesData = r.data.medicines.data;
      } else if (Array.isArray(r.data.data?.data)) {
        medicinesData = r.data.data.data;
      } else if (Array.isArray(r.data)) {
        medicinesData = r.data;
      }
      setMedicines(medicinesData);
      setMeta(r.data.meta || r.data.medicines || r.data);
    }).
    catch((err) => {
      console.error(err);
      setError(t("Failed to load medicines"));
    }).
    finally(() => setLoading(false));
  };

  const loadCategories = () => {
    api.get('/categories').
    then((r) => setCategories(Array.isArray(r.data.data) ? r.data.data : Array.isArray(r.data.categories?.data) ? r.data.categories.data : Array.isArray(r.data.categories) ? r.data.categories : [])).
    catch((err) => console.error(err));
  };

  const loadBranches = () => {
    api.get('/branches').
    then((r) => {
      const d = r.data;
      setBranches(Array.isArray(d) ? d : Array.isArray(d.data) ? d.data : []);
    }).
    catch((err) => console.error(err));
  };

  useEffect(() => {
    loadCategories();
    loadBranches();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.category_id, filters.status]);

  useEffect(() => {
    loadMedicines();
  }, [filters, page, branchRefreshKey]);

  const handlePageChange = (p) => setPage(p);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => {setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));};

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value }));
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {}, 300));
  };

  const resetFilters = () => setFilters({ search: '', category_id: '', status: '' });

  const resetForm = () => {
    setForm({
      name: '', generic_name: '', batch_number: '', category_id: '',
      reorder_level: '', description: '', status: 'active', branch_id: '',
      dosage_form: '', strength: '', unit: ''
    });
    setEditId(null);
    setError('');
    setImagePreview(null);
    setImageFile(null);
    setDosageOther(false);
    setUnitOther(false);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (m) => {
    setForm({
      name: m.name || '', generic_name: m.generic_name || '', batch_number: m.batch_number || '',
      category_id: m.category_id || '',
      reorder_level: m.reorder_level || '',
      description: m.description || '',
      status: m.status || 'active',
      branch_id: m.branch_id || '',
      dosage_form: m.dosage_form || '',
      strength: m.strength || '',
      unit: m.unit || ''
    });
    setEditId(m.id);
    setShowModal(true);
    setError('');
    setImagePreview(m.image_url || null);
    setImageFile(null);
    setDosageOther(!!m.dosage_form && !dosageFormOptions.includes(m.dosage_form));
    setUnitOther(!!m.unit && !unitOptions.includes(m.unit));
  };

  const openView = (m) => {
    setViewMedicine(m);
    setShowViewModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        window.showToast(t("Image size must be less than 2MB"), 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
        formData.append(key, form[key]);
      }
    });
    formData.append('quantity', 0);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editId) {
        formData.append('_method', 'PUT');
        await api.post(`/medicines/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        window.showToast(t("Medicine updated successfully"), 'success');
      } else {
        await api.post('/medicines', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        window.showToast(t("Medicine created successfully"), 'success');
      }
      setShowModal(false);
      loadMedicines();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving medicine');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async () => {
    if (!editId || form.status === 'expired') return;

    try {
      const nextStatus = form.status === 'active' ? 'inactive' : 'active';
      const response = await api.patch(`/medicines/${editId}/status`, { status: nextStatus });
      setForm((prev) => ({ ...prev, status: response.data.status }));
      loadMedicines();
      window.showToast(`Medicine ${response.data.status === 'active' ? 'activated' : 'deactivated'}`, 'success');
    } catch (err) {
      window.showToast(err.response?.data?.message || 'Failed to update medicine status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      window.showToast(t("Medicine deleted successfully"), 'success');
      loadMedicines();
    } catch (err) {
      window.showToast(t("Failed to delete medicine"), 'error');
    }
  };

  const getStatusBadge = (status) => {const { t } = useLanguage();
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
      expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
      discontinued: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Discontinued' }
    };
    const cfg = config[status] || config.active;
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
  };

  const isFiltered = filters.search || filters.category_id || filters.status;

  const renderFormFields = () => {const { t } = useLanguage();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Medicine Name *")}</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t("e.g. Paracetamol Extra")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Generic Name")}</label>
                    <input type="text" name="generic_name" value={form.generic_name} onChange={handleChange} placeholder={t("e.g. Acetaminophen")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Category *")}</label>
                    <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required>
                        <option value="">{t("Select Category")}</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Dosage Form")}</label>
                    <select
            name="dosage_form"
            value={dosageOther ? '__other__' : form.dosage_form}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__other__') {
                setDosageOther(true);
                setForm({ ...form, dosage_form: '' });
              } else {
                setDosageOther(false);
                setForm({ ...form, dosage_form: v });
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none">
            
                        <option value="">{t("Select Dosage Form")}</option>
                        {dosageFormOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                        <option value="__other__">{t("Other (specify)")}</option>
                    </select>
                    {dosageOther &&
          <input
            type="text"
            name="dosage_form"
            value={form.dosage_form}
            onChange={handleChange}
            placeholder={t("Type custom dosage form")}
            className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />

          }
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Strength")}</label>
                    <input type="text" name="strength" value={form.strength} onChange={handleChange} placeholder={t("e.g. 500mg, 10%")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Unit")}</label>
                    <select
            name="unit"
            value={unitOther ? '__other__' : form.unit}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__other__') {
                setUnitOther(true);
                setForm({ ...form, unit: '' });
              } else {
                setUnitOther(false);
                setForm({ ...form, unit: v });
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none">
            
                        <option value="">{t("Select Unit")}</option>
                        {unitOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                        <option value="__other__">{t("Other (specify)")}</option>
                    </select>
                    {unitOther &&
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder={t("Type custom unit")}
            className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />

          }
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Branch *")}</label>
                    <select name="branch_id" value={form.branch_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required>
                        <option value="">{t("Select Branch")}</option>
                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Reorder Level")}</label>
                    <input type="number" name="reorder_level" value={form.reorder_level} onChange={handleChange} placeholder="10" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" required />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Status")}</label>
                    <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none">
                        <option value="active">{t("Active")}</option>
                        <option value="inactive">{t("Inactive")}</option>
                        <option value="discontinued">{t("Discontinued")}</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Description")}</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder={t("Additional details about this medicine")} rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Medicine Image")}</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                            {imagePreview ?
              <img src={imagePreview} alt={t("Preview")} className="w-full h-full object-cover" /> :

              <Package className="text-gray-300" size={28} />
              }
                        </div>
                        <div className="flex-1">
                            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
              
                            <p className="text-xs text-gray-400 mt-1">{t("JPG, PNG, GIF up to 2MB")}</p>
                        </div>
                    </div>
                </div>
            </div>);

  };

  return (
    <>
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="text" name="search" placeholder={t("Search by medicine name or generic name...")} value={filters.search} onChange={handleSearchChange} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
                    </div>
                    <div className="relative w-full md:w-48">
                        <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none">
                            <option value="">{t("All Categories")}</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none appearance-none">
                            {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {isFiltered && <button onClick={resetFilters} className="btn-secondary">{t("Clear")}</button>}
                </div>
            </div>

            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-700">{t("All Medicines (")}{medicines.length})</h3>
                {canWrite ?
        <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2">
                        <Package size={16} />{t("Add New Medicine")}
        </button> :

        <button onClick={() => navigate('/prescription-sales')} className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2">
                        <FileText size={16} />{t("Create Prescription Sale")}
        </button>
        }
            </div>

            {loading ? <LoadingSpinner text={t("Loading medicines...")} /> :
      <>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <colgroup>
                                    <col className="w-[18%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[18%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-sky-50 border-b border-sky-100">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">{t("Medicine Name")}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">{t("Generic Name")}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">{t("Category")}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">{t("Dosage")}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">{t("Qty")}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">{t("Status")}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-sky-700 uppercase tracking-wider">{t("Actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.length > 0 ? medicines.map((m) =>
                <tr key={m.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <img
                        src={m.image_url || '/images/medicine-placeholder.svg'}
                        alt={m.name}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200 bg-gray-50 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/medicine-placeholder.svg';
                        }} />
                      
                                                    <span className="truncate">{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 truncate">{m.generic_name || '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 truncate">{m.category?.name || 'No Category'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 truncate">{[m.dosage_form, m.strength, m.unit].filter(Boolean).join(' · ') || '---'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{m.quantity}</td>
                                            <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => openView(m)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors" title={t("View")}><Eye size={16} /></button>
                                                    {canWrite &&
                      <>
                                                            <button onClick={() => openEdit(m)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors" title={t("Edit")}><Edit size={16} /></button>
                                                            <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title={t("Delete")}><Trash2 size={16} /></button>
                                                        </>
                      }
                                                </div>
                                            </td>
                                        </tr>
                ) :
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">{t("No medicines found")}
                    {isFiltered && <button onClick={resetFilters} className="ml-2 text-sky-600 hover:underline text-sm font-medium">{t("Clear filters")}</button>}
                                        </td></tr>
                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination meta={meta} onPageChange={handlePageChange} />
                </>
      }

            {canWrite &&
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Medicine' : 'Add New Medicine'} size="max-w-2xl">
                    {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100">{error}</div>}
                    <form onSubmit={(e) => {e.preventDefault();handleSubmit();}}>
                        {renderFormFields()}
                        <div className="flex justify-between mt-6 pt-4 border-t border-sky-100">
                            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex items-center gap-1.5">
                                <X size={16} />{t("Cancel")}
            </button>
                            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> {editId ? 'Updating...' : 'Creating...'}</> :
              <><Save size={16} /> {editId ? 'Update Medicine' : 'Create Medicine'}</>}
                            </button>
                        </div>
                    </form>
                </Modal>
      }

            <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title={t("Medicine Details")} size="max-w-3xl">
                {viewMedicine &&
        <>
                        <div className="flex gap-6 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex-shrink-0">
                                {viewMedicine.image_url ?
              <img
                src={viewMedicine.image_url}
                alt={viewMedicine.name}
                className="w-32 h-32 rounded-xl object-cover border border-gray-200 shadow-sm bg-gray-50"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/medicine-placeholder.svg';
                }} /> :


              <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <Package size={48} className="text-gray-400" />
                                    </div>
              }
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{viewMedicine.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{t("Generic:")}{viewMedicine.generic_name || '---'}</p>
                                <div className="flex flex-wrap gap-2">
                                    {getStatusBadge(viewMedicine.status)}
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                        {viewMedicine.category?.name || viewMedicine.category || 'General'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Medicine Name")}</label><p className="text-sm font-medium text-gray-800">{viewMedicine.name}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Generic Name")}</label><p className="text-sm text-gray-600">{viewMedicine.generic_name || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Category")}</label><p className="text-sm text-gray-600">{viewMedicine.category?.name || viewMedicine.category || 'General'}</p></div>
                            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Description")}</label><p className="text-sm text-gray-600">{viewMedicine.description || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Dosage Form")}</label><p className="text-sm text-gray-600">{viewMedicine.dosage_form || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Strength")}</label><p className="text-sm text-gray-600">{viewMedicine.strength || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Unit")}</label><p className="text-sm text-gray-600">{viewMedicine.unit || '---'}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Status")}</label><div className="mt-1">{getStatusBadge(viewMedicine.status)}</div></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Quantity")}</label><p className="text-sm font-medium text-gray-800">{viewMedicine.quantity}</p></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">{t("Reorder Level")}</label><p className="text-sm text-gray-600">{viewMedicine.reorder_level}</p></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-sky-100">
                            <button onClick={() => setShowViewModal(false)} className="btn-secondary">{t("Close")}</button>
            {canWrite &&
            <button onClick={() => {setShowViewModal(false);openEdit(viewMedicine);}} className="btn-primary px-4 py-2 text-sm flex items-center gap-2"><Edit size={16} />{t("Edit Medicine")}</button>
            }
                        </div>
                    </>
        }
            </Modal>
        </>);

}