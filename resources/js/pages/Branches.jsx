import { useLanguage } from "../context/LanguageContext";import React, { useState, useEffect } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import PhoneInput from '../components/PhoneInput';
import { normalizePhone } from '../utils/phone';
import {
  Plus, Edit, Trash2, Eye, Search, Building2, RefreshCw,
  Save, X, AlertCircle, Phone, Mail, User, MapPin,
  CheckCircle, XCircle, Clock } from
'lucide-react';

export default function Branches() {const { t } = useLanguage();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBranch, setViewingBranch] = useState(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    manager_name: '',
    phone: '',
    email: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  // Load branches
  const loadBranches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/branches', { params: { search: searchTerm } });
      const d = res.data;
      const items = Array.isArray(d) ? d : d && Array.isArray(d.data) ? d.data : [];
      setBranches(items);
    } catch (err) {
      setError(t("Failed to load branches"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load branch stats
  const loadStats = async () => {
    try {
      const res = await api.get('/branches/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load branch stats', err);
    }
  };

  useEffect(() => {
    loadBranches();
    loadStats();
  }, [searchTerm]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (modalMode === 'create') {
        await api.post('/branches', form);
        window.showToast(t("Branch created successfully"), 'success');
      } else {
        await api.put(`/branches/${selectedBranch.id}`, form);
        window.showToast(t("Branch updated successfully"), 'success');
      }
      setShowModal(false);
      loadBranches();
      loadStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving branch';
      setError(msg);
      window.showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm(t("Delete this branch? This action cannot be undone."))) return;
    try {
      await api.delete(`/branches/${id}`);
      window.showToast(t("Branch deleted successfully"), 'success');
      loadBranches();
      loadStats();
    } catch (err) {
      window.showToast(t("Failed to delete branch"), 'error');
    }
  };

  // Open create modal
  const openCreate = () => {
    setModalMode('create');
    setSelectedBranch(null);
    setForm({ name: '', location: '', manager_name: '', phone: '', email: '', status: 'active' });
    setError('');
    setShowModal(true);
  };

  // Open edit modal
  const openEdit = (branch) => {
    setModalMode('edit');
    setSelectedBranch(branch);
    setForm({
      name: branch.name,
      location: branch.location,
      manager_name: branch.manager_name || '',
      phone: normalizePhone(branch.phone || ''),
      email: branch.email || '',
      status: branch.status || 'active'
    });
    setError('');
    setShowModal(true);
  };

  // Open view modal
  const openView = (branch) => {
    setViewingBranch(branch);
    setShowViewModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {const { t } = useLanguage();
    const config = {
      active: { bg: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
      inactive: { bg: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Inactive' },
      pending: { bg: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' }
    };
    const cfg = config[status] || config.active;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg}`}>
                <Icon size={12} />
                {cfg.label}
            </span>);

  };

  // Render stats cards
  const renderStats = () => {const { t } = useLanguage();
    if (!stats) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
                            <p className="text-xs text-gray-500">{t("Total Branches")}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-green-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
                            <p className="text-xs text-gray-500">{t("Active")}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-gray-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <XCircle className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-600">{stats.inactive || 0}</p>
                            <p className="text-xs text-gray-500">{t("Inactive")}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-purple-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{stats.locations || 0}</p>
                            <p className="text-xs text-gray-500">{t("Locations")}</p>
                        </div>
                    </div>
                </div>
            </div>);

  };

  if (loading && branches.length === 0) {
    return <LoadingSpinner text={t("Loading branches...")} />;
  }

  return (
    <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 size={24} className="text-sky-600" />{t("Branches")}

          </h2>
                    <p className="text-sm text-gray-500 mt-1">{t("Manage pharmacy branches and locations")}

          </p>
                </div>
                <button
          onClick={openCreate}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          
                    <Plus size={16} />{t("Add Branch")}
        </button>
            </div>

            {/* Error Message */}
            {error &&
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
      }

            {/* Stats Cards */}
            {renderStats()}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
          type="text"
          placeholder={t("Search branches...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
        
            </div>

            {/* Branches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.length > 0 ?
        branches.map((branch) =>
        <div key={branch.id} className="card p-5 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{branch.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={12} />
                                            {branch.location}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                onClick={() => openView(branch)}
                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                title={t("View Details")}>
                
                                        <Eye size={16} />
                                    </button>
                                    <button
                onClick={() => openEdit(branch)}
                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                title={t("Edit")}>
                
                                        <Edit size={16} />
                                    </button>
                                    <button
                onClick={() => handleDelete(branch.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t("Delete")}>
                
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <User size={12} />
                                    <span>{branch.manager_name || 'No Manager'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Phone size={12} />
                                    <span>{branch.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 col-span-2">
                                    <Mail size={12} />
                                    <span className="truncate">{branch.email || 'N/A'}</span>
                                </div>
                                <div className="col-span-2 mt-1">
                                    {getStatusBadge(branch.status)}
                                </div>
                            </div>
                        </div>
        ) :

        <div className="col-span-full text-center py-12 text-gray-400">
                        <Building2 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">{t("No branches found")}</p>
                        <p className="text-sm mt-1">{t("Get started by creating your first branch")}</p>
                        <button
            onClick={openCreate}
            className="mt-4 btn-primary px-4 py-2 text-sm flex items-center gap-2 mx-auto">
            
                            <Plus size={16} />{t("Add Branch")}
          </button>
                    </div>
        }
            </div>

            {/* ============================================================
           CREATE/EDIT MODAL
        ============================================================ */}
            <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Add New Branch' : 'Edit Branch'}
        size="max-w-md">
        
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error &&
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
          }

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Branch Name *")}</label>
                        <input
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              placeholder={t("e.g. Downtown Pharmacy")}
              required />
            
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Location *")}</label>
                        <input
              name="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              placeholder={t("e.g. Addis Ababa, Bole Road")}
              required />
            
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Manager Name")}</label>
                        <input
              name="manager_name"
              value={form.manager_name}
              onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              placeholder={t("e.g. John Smith")} />
            
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Phone")}</label>
                        <PhoneInput
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              placeholder={t("Enter phone number")} />
            
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Email")}</label>
                        <input
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              placeholder={t("e.g. branch@pharmacy.com")} />
            
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Status")}</label>
                        <select
              name="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none bg-white">
              
                            <option value="active">{t("Active")}</option>
                            <option value="inactive">{t("Inactive")}</option>
                            <option value="pending">{t("Pending")}</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                        <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary px-4 py-2 text-sm">{t("Cancel")}


            </button>
                        <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60">
              
                            {submitting ?
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> :

              <><Save size={16} /> {modalMode === 'create' ? 'Create Branch' : 'Update Branch'}</>
              }
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ============================================================
           VIEW MODAL
        ============================================================ */}
            <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={t("Branch Details")}
        size="max-w-lg">
        
                {viewingBranch &&
        <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                            <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-sky-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{viewingBranch.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin size={14} />
                                    {viewingBranch.location}
                                </p>
                            </div>
                            <div className="ml-auto">
                                {getStatusBadge(viewingBranch.status)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Manager")}</label>
                                <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                                    <User size={14} className="text-gray-400" />
                                    {viewingBranch.manager_name || 'Not Assigned'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Phone")}</label>
                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                    <Phone size={14} className="text-gray-400" />
                                    {viewingBranch.phone || 'N/A'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Email")}</label>
                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                    <Mail size={14} className="text-gray-400" />
                                    {viewingBranch.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Created")}</label>
                                <p className="text-sm text-gray-700">
                                    {viewingBranch.created_at ? new Date(viewingBranch.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Last Updated")}</label>
                                <p className="text-sm text-gray-700">
                                    {viewingBranch.updated_at ? new Date(viewingBranch.updated_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
              onClick={() => setShowViewModal(false)}
              className="btn-secondary px-4 py-2 text-sm">{t("Close")}


            </button>
                            <button
              onClick={() => {
                setShowViewModal(false);
                openEdit(viewingBranch);
              }}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
              
                                <Edit size={16} />{t("Edit Branch")}
            </button>
                        </div>
                    </div>
        }
            </Modal>
        </div>);

}