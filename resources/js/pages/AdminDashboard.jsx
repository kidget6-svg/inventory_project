import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, XCircle, UserCheck, Clock, Trash2, AlertTriangle, Calendar, Pill, Truck, ShoppingCart, BarChart3, DollarSign, PlusCircle } from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        api.get('/dashboard')
            .then(r => { setData(r.data); setError(''); })
            .catch(err => { setError('Failed to load dashboard data'); console.error(err); })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchPendingUsers(); }, []);

    const fetchPendingUsers = async () => {
        try {
            const res = await api.get('/users?status=pending');
            const pending = res.data.filter(u => u.status === 'pending');
            setPendingUsers(pending);
        } catch (err) {
            console.error(err);
        } finally {
            setPendingLoading(false);
        }
    };

    const handleApprove = async (user) => {
        setActionLoading(user.id);
        try {
            await api.post(`/users/${user.id}/approve`);
            setPendingUsers(prev => prev.filter(u => u.id !== user.id));
            window.showToast?.('User approved successfully.', 'success');
        } catch (err) {
            window.showToast?.(err.response?.data?.message || 'Failed to approve user', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (user) => {
        setActionLoading(user.id);
        try {
            await api.post(`/users/${user.id}/reject`);
            setPendingUsers(prev => prev.filter(u => u.id !== user.id));
            window.showToast?.('User rejected successfully.', 'success');
        } catch (err) {
            window.showToast?.(err.response?.data?.message || 'Failed to reject user', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to remove ${getUserDisplayName(user)}?`)) return;
        setActionLoading(user.id);
        try {
            await api.delete(`/users/${user.id}`);
            setPendingUsers(prev => prev.filter(u => u.id !== user.id));
            window.showToast?.('User removed successfully.', 'success');
        } catch (err) {
            window.showToast?.(err.response?.data?.message || 'Failed to remove user', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const getUserDisplayName = (u) => {
        if (u.first_name && u.last_name) return `${u.first_name} ${u.last_name}`;
        return u.name || '';
    };

    const getUserInitial = (u) => {
        const name = getUserDisplayName(u);
        return name?.charAt(0) || '';
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-sky-100 text-sky-700',
            pharmacist: 'bg-emerald-100 text-emerald-700',
            cashier: 'bg-amber-100 text-amber-600',
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-600'}`}>{role}</span>;
    };

    const inventoryLabels = data?.inventoryChartData?.map(c => c.category) || [];
    const inventoryStockValues = data?.inventoryChartData?.map(c => c.total_stock) || [];
    const inventoryMedicineValues = data?.inventoryChartData?.map(c => c.medicine_count) || [];

    const pieColors = ['bg-sky-500', 'bg-emerald-500', 'bg-amber-400', 'bg-red-400', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500'];

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard value={data.totalProducts} label="Total Medicines" color="sky" />
                <StatCard value={data.totalStock} label="Total Stock Units" color="green" />
                <StatCard value={data.lowStockCount} label="Low Stock" color="red" />
                <StatCard value={data.expiredCount} label="Expired Medicines" color="orange" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard value={data.todaySalesCount} label="Today's Sales" color="green" />
                <StatCard value={`$${Number(data.todayRevenue || 0).toFixed(2)}`} label="Today's Revenue" color="sky" />
                <StatCard value={`$${Number(data.totalRevenue || 0).toFixed(2)}`} label="Total Revenue" color="purple" />
                <StatCard value={data.totalSuppliers} label="Suppliers" color="orange" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard value={data.totalUsers} label="Total Users" color="sky" />
                <StatCard value={data.pharmacistCount} label="Pharmacists" color="green" />
                <StatCard value={data.cashierCount} label="Cashiers" color="orange" />
                <StatCard value={data.pendingUsersCount} label="Pending Approvals" color="yellow" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <BarChart title="Sales (Last 7 Days)" labels={data.salesChartData?.labels || []} values={data.salesChartData?.counts || []} color="green" valueSuffix=" sales" />
                <BarChart title="Revenue (Last 7 Days)" labels={data.salesChartData?.labels || []} values={data.salesChartData?.revenue || []} color="sky" currency />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <PieChart title="Inventory by Category" labels={inventoryLabels} values={inventoryStockValues} colors={pieColors} />
                <BarChart title="Medicines per Category" labels={inventoryLabels} values={inventoryMedicineValues} color="sky" valueSuffix=" medicines" />
            </div>

            {/* Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card p-5">
                    <h3 className="card-header flex items-center gap-2"><AlertTriangle size={18} className="text-red-500" /> Low Stock Alerts ({data.lowStockCount})</h3>
                    {data.lowStockMedicines?.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.lowStockMedicines.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3.5 bg-red-50 border-l-4 border-red-400 rounded-xl">
                                    <div>
                                        <div className="font-semibold text-sm text-gray-800">{m.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{m.category?.name || 'No Category'}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="badge-red">Stock: {m.quantity}</span>
                                        <div className="text-xs text-gray-400 mt-1">Reorder: {m.reorder_level}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400 text-center py-5 text-sm">No low-stock medicines</p>}
                </div>

                <div className="card p-5">
                    <h3 className="card-header flex items-center gap-2"><AlertTriangle size={18} className="text-orange-500" /> Expired Medicines ({data.expiredCount})</h3>
                    {data.expiredMedicines?.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.expiredMedicines.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3.5 bg-orange-50 border-l-4 border-orange-400 rounded-xl">
                                    <div>
                                        <div className="font-semibold text-sm text-gray-800">{m.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Batch: {m.batch_number || '---'}</div>
                                    </div>
                                    <span className="badge bg-orange-100 text-orange-700">Expired: {m.expiry_date}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400 text-center py-5 text-sm">No expired medicines</p>}
                </div>
            </div>

            {/* Expiring Soon */}
            {data.expiringMedicines?.length > 0 && (
                <div className="card p-5">
                    <h3 className="card-header flex items-center gap-2"><Calendar size={18} className="text-yellow-500" /> Expiring Within 90 Days ({data.expiringCount})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.expiringMedicines.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3.5 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl">
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">{m.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Batch: {m.batch_number || '---'}</div>
                                </div>
                                <span className="badge bg-yellow-100 text-yellow-700">Expires: {m.expiry_date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div className="card p-5">
                <h3 className="card-header flex items-center gap-2"><Clock size={18} className="text-sky-500" /> Recent Activities</h3>
                {data.recentActivities?.length > 0 ? (
                    <div className="space-y-3">
                        {data.recentActivities.map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                                    activity.color === 'green' ? 'bg-emerald-100 text-emerald-600' :
                                    activity.color === 'blue' ? 'bg-sky-100 text-sky-600' :
                                    activity.color === 'orange' ? 'bg-amber-100 text-amber-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>{activity.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-800">{activity.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{activity.subtitle}</div>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-400 text-center py-5 text-sm">No recent activities</p>}
            </div>

            {/* Quick Actions */}
            <div className="card p-5">
                <h3 className="card-header">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/medicines" className="btn-primary"><Pill size={16} /> Add Medicine</Link>
                    <Link to="/suppliers" className="btn-primary"><Truck size={16} /> Add Supplier</Link>
                    <Link to="/purchase-orders" className="btn-primary"><ShoppingCart size={16} /> New Purchase Order</Link>
                    <Link to="/reports" className="btn-secondary"><BarChart3 size={16} /> Generate Report</Link>
                    <Link to="/sales" className="btn-secondary"><DollarSign size={16} /> New Sale</Link>
                </div>
            </div>

            {/* Pending User Registrations */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                        <Clock size={18} className="text-yellow-500" />
                        Pending User Registrations ({pendingUsers.length})
                    </h3>
                    <Link to="/users" className="text-sm text-sky-600 hover:text-sky-700 font-medium">View all users &rarr;</Link>
                </div>

                {pendingLoading ? (
                    <LoadingSpinner text="Loading pending registrations..." />
                ) : pendingUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="table-header">User</th>
                                    <th className="table-header">Email</th>
                                    <th className="table-header">Role</th>
                                    <th className="table-header">Registered</th>
                                    <th className="table-header text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="table-cell whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">{getUserInitial(u)}</div>
                                                <span className="font-medium text-gray-800">{getUserDisplayName(u)}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell text-gray-500">{u.email}</td>
                                        <td className="table-cell">{getRoleBadge(u.role)}</td>
                                        <td className="table-cell text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="table-cell text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleApprove(u)} disabled={actionLoading === u.id} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-50" title="Approve">
                                                    {actionLoading === u.id ? <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={18} />}
                                                </button>
                                                <button onClick={() => handleReject(u)} disabled={actionLoading === u.id} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50" title="Reject">
                                                    {actionLoading === u.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <XCircle size={18} />}
                                                </button>
                                                <button onClick={() => handleDelete(u)} disabled={actionLoading === u.id} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50" title="Remove">
                                                    {actionLoading === u.id ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <UserCheck size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No pending registrations</p>
                        <p className="text-gray-400 text-sm mt-1">All new user registrations have been processed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
