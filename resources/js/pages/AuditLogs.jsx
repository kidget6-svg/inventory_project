import { useLanguage } from "../context/LanguageContext";import React, { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  ClipboardList, Search, Filter, Calendar, User,
  Eye, Download, Printer, RefreshCw, ChevronDown,
  Activity, Users, Package, DollarSign, Settings,
  AlertCircle, CheckCircle, XCircle, Clock,
  FileText, Hash, Tag, ArrowUpRight, ArrowDownRight } from
'lucide-react';

// Action types with colors and icons
const actionConfig = {
  create: { label: 'Create', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  update: { label: 'Update', color: 'bg-blue-100 text-blue-700', icon: ArrowUpRight },
  delete: { label: 'Delete', color: 'bg-red-100 text-red-700', icon: XCircle },
  approve: { label: 'Approve', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  reject: { label: 'Reject', color: 'bg-red-100 text-red-700', icon: XCircle },
  stock_adjust: { label: 'Stock Adjust', color: 'bg-amber-100 text-amber-700', icon: Activity },
  sale_complete: { label: 'Sale Complete', color: 'bg-purple-100 text-purple-700', icon: DollarSign },
  user_login: { label: 'User Login', color: 'bg-sky-100 text-sky-700', icon: User },
  user_logout: { label: 'User Logout', color: 'bg-gray-100 text-gray-700', icon: User },
  password_change: { label: 'Password Change', color: 'bg-yellow-100 text-yellow-700', icon: Settings },
  transfer: { label: 'Transfer', color: 'bg-indigo-100 text-indigo-700', icon: ArrowUpRight },
  receive: { label: 'Receive', color: 'bg-teal-100 text-teal-700', icon: ArrowDownRight }
};

const moduleIcons = {
  medicines: Package,
  sales: DollarSign,
  users: Users,
  stock: Activity,
  suppliers: Tag,
  purchase_orders: FileText,
  branches: Users,
  categories: Tag,
  shelves: Package,
  settings: Settings
};

export default function AuditLogs() {const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState(null);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    user_id: '',
    action: '',
    module: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);

  // Load audit logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        ...filters
      };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await api.get('/audit-logs', { params });
      setLogs(response.data.data || []);
      setMeta(response.data);
    } catch (err) {
      setError(t("Failed to load audit logs"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/audit-logs/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load audit stats');
    }
  }, []);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      const [usersRes, modulesRes] = await Promise.all([
      api.get('/users', { params: { per_page: -1 } }),
      api.get('/audit-logs/modules')]
      );
      setUsers(usersRes.data.data || []);
      setModules(modulesRes.data || []);
    } catch (err) {
      console.error('Failed to load filter options');
    }
  }, []);

  useEffect(() => {
    loadLogs();
    loadStats();
    loadFilterOptions();
  }, [loadLogs, loadStats, loadFilterOptions]);

  // View log details
  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  // Handle export
  const handleExport = async (format = 'csv') => {
    try {
      const params = { ...filters, format };
      const response = await api.get('/audit-logs/export', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      window.showToast(t("Audit logs exported successfully"), 'success');
    } catch (err) {
      window.showToast(t("Failed to export audit logs"), 'error');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      user_id: '',
      action: '',
      module: '',
      search: ''
    });
    setPage(1);
  };

  // Render stats cards
  const renderStats = () =>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg">
                        <ClipboardList className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.total || 0}</p>
                        <p className="text-xs text-gray-500">{t("Total Records")}</p>
                    </div>
                </div>
            </div>
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.today || 0}</p>
                        <p className="text-xs text-gray-500">{t("Today's Actions")}</p>
                    </div>
                </div>
            </div>
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.active_users || 0}</p>
                        <p className="text-xs text-gray-500">{t("Active Users")}</p>
                    </div>
                </div>
            </div>
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.modules_used || 0}</p>
                        <p className="text-xs text-gray-500">{t("Modules Used")}</p>
                    </div>
                </div>
            </div>
        </div>;


  // Render filters
  const renderFilters = () =>
  <div className="card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
          type="text"
          placeholder={t("Search audit logs...")}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
        
                </div>
                <button
        onClick={() => setShowFilters(!showFilters)}
        className={`px-3 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 ${
        showFilters ? 'bg-sky-50 border-sky-200 text-sky-700' : 'border-gray-200 text-gray-700'}`
        }>
        
                    <Filter size={16} />{t("Filters")}

        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <button
        onClick={resetFilters}
        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">{t("Clear")}


      </button>
            </div>

            {showFilters &&
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Date From")}</label>
                        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
        
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Date To")}</label>
                        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
        
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("User")}</label>
                        <select
          value={filters.user_id}
          onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none bg-white">
          
                            <option value="">{t("All Users")}</option>
                            {users.map((u) =>
          <option key={u.id} value={u.id}>{u.name}</option>
          )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Action")}</label>
                        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none bg-white">
          
                            <option value="">{t("All Actions")}</option>
                            {Object.entries(actionConfig).map(([key, config]) =>
          <option key={key} value={key}>{config.label}</option>
          )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Module")}</label>
                        <select
          value={filters.module}
          onChange={(e) => setFilters({ ...filters, module: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none bg-white">
          
                            <option value="">{t("All Modules")}</option>
                            {modules.map((m) =>
          <option key={m} value={m}>{m}</option>
          )}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
          onClick={() => {setPage(1);loadLogs();}}
          className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700">{t("Apply Filters")}


        </button>
                    </div>
                </div>
    }
        </div>;


  // Render logs table
  const renderLogsTable = () =>
  <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date/Time</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("User")}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("Action")}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("Module")}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("Record")}</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{t("Details")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.length > 0 ? logs.map((log, index) => {const { t } = useLanguage();
            const action = actionConfig[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700', icon: Activity };
            const ActionIcon = action.icon;
            const ModuleIcon = moduleIcons[log.module] || FileText;
            const displayIndex = meta ? (meta.current_page - 1) * meta.per_page + index + 1 : index + 1;

            return (
              <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-400">{displayIndex}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <div>{new Date(log.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            {log.user?.name || 'System'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${action.color}`}>
                                            <ActionIcon size={12} />
                                            {action.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <ModuleIcon size={14} className="text-gray-400" />
                                            {log.module}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <span className="font-mono text-xs">#{log.record_id}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                    onClick={() => viewLogDetails(log)}
                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title={t("View Details")}>
                    
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>);

          }) :
          <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t("No audit logs found")}</p>
                                </td>
                            </tr>
          }
                    </tbody>
                </table>
            </div>
        </div>;


  // Render actions bar
  const renderActions = () =>
  <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">{t("Showing")}
      {logs.length} records
                {meta && <span>{t("\u2022 Page")}{meta.current_page} of {meta.last_page}</span>}
            </div>
            <div className="flex gap-2">
                <button
        onClick={loadLogs}
        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"
        title={t("Refresh")}>
        
                    <RefreshCw size={16} />
                </button>
                <button
        onClick={() => handleExport('pdf')}
        className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 flex items-center gap-2">
        
                    <Download size={16} />{t("PDF")}
      </button>
                <button
        onClick={() => handleExport('csv')}
        className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 flex items-center gap-2">
        
                    <FileText size={16} />{t("CSV")}
      </button>
                <button
        onClick={() => window.print()}
        className="px-3 py-2 bg-gray-500 text-white rounded-xl text-sm font-semibold hover:bg-gray-600 flex items-center gap-2">
        
                    <Printer size={16} />{t("Print")}
      </button>
            </div>
        </div>;


  if (loading && logs.length === 0) {
    return <LoadingSpinner text={t("Loading audit logs...")} />;
  }

  return (
    <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList size={24} className="text-sky-600" />{t("Audit Logs")}

          </h2>
                    <p className="text-sm text-gray-500 mt-1">{t("Complete audit trail of all system activities")}

          </p>
                </div>
            </div>

            {error &&
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                    {error}
                </div>
      }

            {/* Stats */}
            {stats && renderStats()}

            {/* Filters */}
            {renderFilters()}

            {/* Actions */}
            {renderActions()}

            {/* Table */}
            {renderLogsTable()}

            {/* Pagination */}
            {meta && meta.last_page > 1 &&
      <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      }

            {/* Details Modal */}
            <Modal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={t("Audit Log Details")}
        size="max-w-2xl">
        
                {selectedLog &&
        <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Action")}</label>
                                {(() => {const { t } = useLanguage();
                const action = actionConfig[selectedLog.action] || { label: selectedLog.action, color: 'bg-gray-100 text-gray-700', icon: Activity };
                const ActionIcon = action.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${action.color}`}>
                                            <ActionIcon size={14} />
                                            {action.label}
                                        </span>);

              })()}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Module")}</label>
                                <p className="text-sm font-medium text-gray-800 capitalize">{selectedLog.module}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("User")}</label>
                                <p className="text-sm font-medium text-gray-800">{selectedLog.user?.name || 'System'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Date & Time")}</label>
                                <p className="text-sm text-gray-700">{new Date(selectedLog.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Record ID")}</label>
                                <p className="text-sm font-mono text-gray-700">#{selectedLog.record_id}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("IP Address")}</label>
                                <p className="text-sm font-mono text-gray-700">{selectedLog.ip_address || '---'}</p>
                            </div>
                        </div>

                        {selectedLog.before_values &&
          <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Before Values")}</label>
                                <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200">
                                    {JSON.stringify(selectedLog.before_values, null, 2)}
                                </pre>
                            </div>
          }

                        {selectedLog.after_values &&
          <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("After Values")}</label>
                                <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200">
                                    {JSON.stringify(selectedLog.after_values, null, 2)}
                                </pre>
                            </div>
          }

                        {selectedLog.reason &&
          <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t("Reason")}</label>
                                <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                    {selectedLog.reason}
                                </p>
                            </div>
          }

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                            <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">{t("Close")}

            </button>
                        </div>
                    </div>
        }
            </Modal>
        </div>);

}