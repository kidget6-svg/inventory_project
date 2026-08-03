import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarLayout from '../components/SidebarLayout';
import { CheckCircle, XCircle, UserCheck, Clock, Trash2, AlertTriangle, Calendar } from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        api.get('/dashboard')
            .then(r => {
                setData(r.data);
                setError('');
            })
            .catch(err => {
                setError('Failed to load dashboard data');
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    // Fetch pending users for approval
    useEffect(() => {
        fetchPendingUsers();
    }, []);

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
            window.showToast?.('User approved successfully. They can now log in.', 'success');
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
            admin: 'bg-blue-100 text-blue-700',
            pharmacist: 'bg-green-100 text-green-700',
            cashier: 'bg-orange-100 text-orange-600',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-600'}`}>
                {role}
            </span>
        );
    };

    // Prepare inventory chart data
    const inventoryLabels = data?.inventoryChartData?.map(c => c.category) || [];
    const inventoryStockValues = data?.inventoryChartData?.map(c => c.total_stock) || [];
    const inventoryMedicineValues = data?.inventoryChartData?.map(c => c.medicine_count) || [];

    const pieColors = [
        'bg-blue-500', 'bg-green-500', 'bg-orange-400', 'bg-red-400',
        'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
    ];

    if (loading) return <SidebarLayout><LoadingSpinner text="Loading dashboard..." /></SidebarLayout>;

    if (error) return <SidebarLayout><div className="text-center py-12 text-red-500">{error}</div></SidebarLayout>;

    return (
        <SidebarLayout pageTitle="Admin Dashboard">
            {/* ── Summary Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <StatCard value={data.totalProducts} label="Total Medicines" color="blue" />
                <StatCard value={data.totalStock} label="Total Stock Units" color="green" />
                <StatCard value={data.lowStockCount} label="Low Stock" color="red" />
                <StatCard value={data.expiredCount} label="Expired Medicines" color="orange" />
            </div>

<<<<<<< Updated upstream
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <StatCard value={data.todaySalesCount} label="Today's Sales" color="green" />
                <StatCard value={`$${Number(data.todayRevenue || 0).toFixed(2)}`} label="Today's Revenue" color="blue" />
                <StatCard value={`$${Number(data.totalRevenue || 0).toFixed(2)}`} label="Total Revenue" color="purple" />
                <StatCard value={data.totalSuppliers} label="Suppliers" color="orange" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <StatCard value={data.totalUsers} label="Total Users" color="indigo" />
                <StatCard value={data.pharmacistCount} label="Pharmacists" color="green" />
                <StatCard value={data.cashierCount} label="Cashiers" color="orange" />
                <StatCard value={data.pendingUsersCount} label="Pending Approvals" color="yellow" />
            </div>

            {/* ── Charts: Sales & Revenue ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <BarChart
                    title="Sales (Last 7 Days)"
                    labels={data.salesChartData?.labels || []}
                    values={data.salesChartData?.counts || []}
                    color="green"
                    valueSuffix=" sales"
                />
                <BarChart
                    title="Revenue (Last 7 Days)"
                    labels={data.salesChartData?.labels || []}
                    values={data.salesChartData?.revenue || []}
                    color="blue"
                    currency={true}
                />
            </div>

            {/* ── Inventory Status Chart ────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <PieChart
                    title="Inventory by Category"
                    labels={inventoryLabels}
                    values={inventoryStockValues}
                    colors={pieColors}
                />
                <BarChart
                    title="Medicines per Category"
                    labels={inventoryLabels}
                    values={inventoryMedicineValues}
                    color="indigo"
                    valueSuffix=" medicines"
                />
            </div>

            {/* ── Notifications ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* Low Stock Notifications */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        Low Stock Alerts ({data.lowStockCount})
                    </h3>
                    {data.lowStockMedicines?.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.lowStockMedicines.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 border-l-3 border-red-400 rounded-md">
                                    <div>
                                        <div className="font-semibold text-sm">{m.name}</div>
                                        <div className="text-xs text-gray-400">{m.category?.name || 'No Category'}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Stock: {m.quantity}</span>
                                        <div className="text-xs text-gray-400 mt-1">Reorder: {m.reorder_level}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-5">✓ No low-stock medicines</p>
                    )}
                </div>

                {/* Expired Medicines Notifications */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-500" />
                        Expired Medicines ({data.expiredCount})
                    </h3>
                    {data.expiredMedicines?.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {data.expiredMedicines.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3 bg-orange-50 border-l-3 border-orange-400 rounded-md">
                                    <div>
                                        <div className="font-semibold text-sm">{m.name}</div>
                                        <div className="text-xs text-gray-400">Batch: {m.batch_number || '---'}</div>
                                    </div>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">Expired: {m.expiry_date}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-5">✓ No expired medicines</p>
                    )}
                </div>
            </div>

            {/* Expiring Soon (within 90 days) */}
            {data.expiringMedicines?.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50 flex items-center gap-2">
                        <Calendar size={18} className="text-yellow-500" />
                        Expiring Within 90 Days ({data.expiringCount})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.expiringMedicines.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-yellow-50 border-l-3 border-yellow-400 rounded-md">
                                <div>
                                    <div className="font-semibold text-sm">{m.name}</div>
                                    <div className="text-xs text-gray-400">Batch: {m.batch_number || '---'}</div>
                                </div>
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">Expires: {m.expiry_date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Recent Activities ─────────────────────────────────────── */}
            <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                <h3 className="text-base font-semibold text-gray-700 mb-3 pb-3 border-b border-blue-50 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    Recent Activities
                </h3>
                {data.recentActivities?.length > 0 ? (
                    <div className="space-y-3">
                        {data.recentActivities.map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                                    activity.color === 'green' ? 'bg-green-100 text-green-600' :
                                    activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                    activity.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {activity.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-800">{activity.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{activity.subtitle}</div>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-5">No recent activities</p>
                )}
            </div>

            {/* ── Quick Actions ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/medicines" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1">
                        + Add Medicine
                    </Link>
                    <Link to="/suppliers" className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-1">
                        + Add Supplier
                    </Link>
                    <Link to="/purchase-orders" className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition-colors flex items-center gap-1">
                        + New Purchase Order
                    </Link>
                    <Link to="/reports" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1">
                        📊 Generate Report
                    </Link>
                    <Link to="/sales" className="px-4 py-2 border border-green-500 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors flex items-center gap-1">
                        + New Sale
                    </Link>
                </div>
            </div>

            {/* ── Pending User Registrations ───────────────────────────── */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Clock size={18} className="text-yellow-500" />
                        Pending User Registrations ({pendingUsers.length})
                    </h3>
                    <Link
                        to="/users"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View all users →
                    </Link>
                </div>

                {pendingLoading ? (
                    <LoadingSpinner text="Loading pending registrations..." />
                ) : pendingUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                                    {getUserInitial(u)}
                                                </div>
                                                <span className="font-medium text-gray-800">{getUserDisplayName(u)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-sm">{u.email}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(u)}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {actionLoading === u.id ? (
                                                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <CheckCircle size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(u)}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    {actionLoading === u.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <XCircle size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                                                    title="Remove"
                                                >
                                                    {actionLoading === u.id ? (
                                                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
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
        </SidebarLayout>
    );
=======
        );

    }





    const todayRevenue =
        Number(data.todayRevenue || 0);


    const todaySales =
        Number(data.todaySalesCount || 0);






    return(

        <div className="
            space-y-8
            min-h-screen
            pb-10
        ">





{/* ================= HEADER ================= */}


<div
className="
rounded-3xl
bg-gradient-to-r
from-sky-500
via-sky-600
to-sky-700
p-8
md:p-10
text-white
shadow-xl
"
>


<div className="
flex
flex-col
md:flex-row
justify-between
items-center
gap-6
">


<div>


<h1 className="
text-3xl
md:text-4xl
font-bold
">

Pharmacy Dashboard

</h1>



<p className="
mt-3
text-blue-100
">

Welcome back, Administrator

</p>



<p className="
text-sm
text-blue-200
mt-1
">

Manage medicines, inventory, sales and suppliers.

</p>


</div>





<div className="
text-center
bg-white/10
rounded-2xl
px-6
py-4
">


<div className="text-6xl">

💊

</div>


<p className="
mt-2
text-sm
text-blue-100
">

{new Date().toLocaleDateString()}

</p>


</div>




</div>


</div>









{/* ================= STAT CARDS ================= */}



<div
className="
grid
grid-cols-1
sm:grid-cols-2
md:grid-cols-3
lg:grid-cols-4
xl:grid-cols-7
gap-5
"
>


<StatCard
value={data.totalMedicines}
label="Total Medicines"
icon="package"
color="blue"
/>



<StatCard
value={data.totalStock}
label="Total Stock"
icon="boxes"
color="green"
/>



<StatCard
value={data.lowStockCount}
label="Low Stock"
icon="alert"
color="orange"
/>



<StatCard
value={data.expiredCount}
label="Expired"
icon="calendar"
color="red"
/>



<StatCard
value={data.pendingPurchaseOrders}
label="Pending Orders"
icon="shopping-cart"
color="orange"
/>



<StatCard
value={`$${todayRevenue.toFixed(2)}`}
label="Today's Sales"
icon="banknote"
color="green"
subValue={`${todaySales} transactions`}
/>



<StatCard
value={data.totalUsers}
label="Users"
icon="users"
color="purple"
/>



<StatCard
value={data.pendingUsers}
label="Pending Users"
icon="alert"
color="orange"
/>



</div>






{/* ================= SALES ANALYTICS ================= */}


<ChartCard

title="Sales Analytics"

description="Daily, weekly and monthly sales performance"

>


<SalesChart

    data={data.salesAnalytics}

/>


</ChartCard>






{/* ================= PURCHASE VS INVENTORY ================= */}


<div
className="
grid
grid-cols-1
xl:grid-cols-2
gap-6
"
>



<ChartCard

title="Purchase vs Sales"

description="Compare purchasing and selling"

>


<div className="h-72">


<PurchaseVsSalesChart

    data={data.purchaseVsSales}

/>


</div>


</ChartCard>





<ChartCard

title="Inventory Status"

description="Current medicine stock condition"

>


<div className="h-72">


<InventoryStatusChart

    data={data.inventoryStatus}

/>


</div>


</ChartCard>


</div>






{/* ================= PURCHASE ORDERS ================= */}


<PurchaseOrderStats

    stats={data.purchaseOrderStats}

/>






{/* ================= ALERT SECTION ================= */}


<div
className="
grid
grid-cols-1
xl:grid-cols-2
gap-6
"
>


<LowStockAlert

    medicines={data.lowStockMedicines}

/>


<ExpiryAlert

    expiringSoon={data.expiringSoon}

/>


</div>






{/* ================= ACTIVITY ================= */}


<ChartCard

title="Recent Activity"

description="Latest pharmacy system activities"

>


<RecentActivity

    activities={data.recentActivities}

/>


</ChartCard>





{/* ================= QUICK ACTION ================= */}


<QuickActions

role="admin"

/>



</div>


    );

>>>>>>> Stashed changes
}
