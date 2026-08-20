import { useLanguage } from "../context/LanguageContext";import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import { useBranch } from '../context/BranchContext';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarLayout from '../components/SidebarLayout';
import { Clock, AlertTriangle, Calendar, ShoppingCart, Package, Pill, Activity, User, Building2, ArrowRight } from 'lucide-react';

/**
 * Auto-refresh interval for the dashboard data (ms).
 * Keeps the category chart and activity list in sync when medicines or
 * categories change in the database.
 */
const DASHBOARD_REFRESH_MS = 60 * 1000;

// ── Date helpers ────────────────────────────────────────────────────────────

/**
 * Format an ISO timestamp to a friendly date string.
 * e.g. "2026-08-29T00:00:00.000000Z" → "Aug 29, 2026"
 */
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Calculate the number of calendar days from today to the given ISO date.
 * Returns a positive integer, 0, or a negative number if already expired.
 */
const daysRemaining = (iso) => {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(iso);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry - today) / 86400000);
};

/**
 * Format days remaining into a human-readable label.
 * Negative → "Expired"; 0 → "Today"; 1 → "1 day"; N → "N days"
 */
const formatDaysRemaining = (days) => {
  if (days === null) return '—';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
};

/**
 * Tailwind classes for the status badge inside the expiry table.
 */
const expiryStatusBadge = (days) => {
  if (days === null) return 'bg-gray-100 text-gray-500';
  if (days < 0) return 'bg-red-100 text-red-700';
  if (days <= 30) return 'bg-red-100 text-red-600';
  if (days <= 60) return 'bg-orange-100 text-orange-600';
  return 'bg-yellow-100 text-yellow-700';
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {const { t } = useLanguage();
  const { branchRefreshKey, selectedBranch } = useBranch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // ── Helper: load the main dashboard payload from the Laravel API.
  //    Contains the inventory-by-category chart data, recent activities,
  //    low-stock / expired lists and the summary statistics.
  const loadDashboard = async () => {
    try {
      const r = await api.get('/dashboard');
      setData(r.data);
      setError('');
    } catch (err) {
      setError(t("Failed to load dashboard data"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Helper: load pending user registrations that need approval
  // ── Fetch once on mount and auto-refresh on an interval so the
  //    category chart automatically updates whenever medicines / categories
  //    change in the database. Cleanup prevents state updates after unmount. ──
  useEffect(() => {
    let active = true; // guard: skip state updates once unmounted

    const load = async () => {
      await loadDashboard();
    };

    load();
    const interval = setInterval(() => {
      if (active) load();
    }, DASHBOARD_REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [branchRefreshKey]);


  const activityIcon = (name) => {const { t } = useLanguage();
    const icons = { 'shopping-cart': ShoppingCart, package: Package, pill: Pill, activity: Activity };
    const Icon = icons[name] || Clock;
    return <Icon size={16} />;
  };

  const activityIconColor = (name) => {
    const colors = {
      'shopping-cart': 'bg-green-100 text-green-600',
      package: 'bg-purple-100 text-purple-600',
      pill: 'bg-blue-100 text-blue-600',
      activity: 'bg-orange-100 text-orange-600'
    };
    return colors[name] || 'bg-gray-100 text-gray-600';
  };

  // Prepare inventory chart data (one entry per category from the API)
  const inventoryLabels = data?.inventoryChartData?.map((c) => c.category) || [];
  const inventoryValues = data?.inventoryChartData?.map((c) => c.medicine_count) || [];

  if (loading) return <LoadingSpinner text={t("Loading dashboard...")} />;

  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  // ── Preview slices (max 5 per dashboard section) ──────────────────────────
  const expiringMedicines = data.expiringMedicines || [];
  const lowStockMedicines = data.lowStockMedicines || [];
  const expiredMedicines = data.expiredMedicines || [];
  const recentActivities = data.recentActivities || [];

  const displayedExpiring = expiringMedicines.slice(0, 5);
  const displayedLowStock = lowStockMedicines.slice(0, 5);
  const displayedExpired = expiredMedicines.slice(0, 5);
  const displayedActivities = recentActivities.slice(0, 3);

  return (
    <>
            {/* Contextual Branch Scoped View Indicator */}
            {selectedBranch && selectedBranch.id !== 'all' &&
      <div className="mb-6 p-4 rounded-2xl bg-sky-50 dark:bg-gray-800/80 border border-sky-200 dark:border-sky-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shrink-0">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t("Branch Scoped View:")}
              {selectedBranch.name} {selectedBranch.code ? `(${selectedBranch.code})` : ''}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t("Showing medicines, retail products, stock levels, alerts, and sales analytics exclusively for this location.")}

            </p>
                        </div>
                    </div>
                </div>
      }

            {/* ─────────────────────────────────────────────────────────────────────────
           Summary Cards ─────────────────────────────────────────────────────────
        ───────────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
                <StatCard value={data.totalUsers} label={t("Total Users")} icon="users" color="indigo" />
                <StatCard value={data.totalProducts} label={t("Total Medicines")} icon="package" color="green" />
                <StatCard value={`$${Number(data.totalRevenue || 0).toFixed(2)}`} label={t("Total Sales")} icon="banknote" color="purple" />
                <StatCard value={data.lowStockCount} label={t("Low Stock Medicines")} icon="alert" color="red" />
                <StatCard value={data.expiredCount} label={t("Expired Medicines")} icon="calendar" color="orange" />
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────
           Charts: Sales & Revenue ─────────────────────────────────────────────
        ───────────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <BarChart
          title={t("Sales (Last 7 Days)")}
          labels={data.salesChartData?.labels || []}
          values={data.salesChartData?.counts || []}
          color="green"
          valueSuffix=" sales" />
        
                <BarChart
          title={t("Revenue (Last 7 Days)")}
          labels={data.salesChartData?.labels || []}
          values={data.salesChartData?.revenue || []}
          color="blue"
          currency={true} />
        
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────
           Inventory by Category  |  Recent Activities
           Responsive 2-column flexbox layout. Both columns grow equally
           (flex-1) and Flexbox `items-stretch` makes the cards the same
           HEIGHT; identical `.card p-5 h-full` sizing makes them the same
           WIDTH too — i.e. identical dimensions. On mobile the cards
           stack vertically.
        ───────────────────────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Left column — Inventory by Category (modern doughnut) */}
                <div className="w-full lg:flex-1 lg:h-full">
                <PieChart
            labels={inventoryLabels}
            values={inventoryValues} />
          
                </div>

                {/* Right column — Recent Actions (identical card size/style) */}
                <div className="w-full lg:flex-1 lg:h-full">
                    <div className="card p-5 h-full flex flex-col hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="card-header flex items-center gap-2 mb-0">
                                <Clock size={18} className="text-blue-500" />{t("Recent Actions")}

              </h3>
                            <Link
                to="/stock-movements"
                className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">{t("View All")}

                <ArrowRight size={12} />
                            </Link>
                        </div>

                        {/* The list fills the card (flex-1) and scrolls vertically
                 without ever changing the card's size. `min-h-0` lets it
                 scroll correctly inside the flex column. */}
                        {displayedActivities.length > 0 ?
            <ul className="mt-1 space-y-2.5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                                {displayedActivities.map((activity, i) =>
              <li
                key={activity.id ?? i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100">
                
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${activityIconColor(activity.icon)}`}>
                                            {activityIcon(activity.icon)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-gray-800">{activity.action}</div>
                                            <div className="text-xs text-gray-500 truncate">{activity.user}</div>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{activity.date} {activity.time}</span>
                                    </li>
              )}
                            </ul> :

            <p className="mt-3 text-gray-400 text-center flex-1 flex items-center justify-center">{t("No recent actions")}

            </p>
            }
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────
           Notifications ─────────────────────────────────────────────────────
        ───────────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* Low Stock Notifications */}
                <div className="card p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-blue-50">
                        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />{t("Low Stock Alerts")}

              <span className="ml-1 text-xs font-normal text-gray-400">({data.lowStockCount ?? 0})</span>
                        </h3>
                        {lowStockMedicines.length > 0 &&
            <Link
              to="/inventory"
              className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">{t("View All")}

              <ArrowRight size={12} />
                            </Link>
            }
                    </div>
                    {displayedLowStock.length > 0 ?
          <div className="space-y-2">
                            {displayedLowStock.map((m) =>
            <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 border-l-3 border-red-400 rounded-md">
                                    <div>
                                        <div className="font-semibold text-sm">{m.name}</div>
                                        <div className="text-xs text-gray-400">{m.category?.name || 'No Category'}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">{t("Stock:")}{m.quantity}</span>
                                        <div className="text-xs text-gray-400 mt-1">{t("Reorder:")}{m.reorder_level}</div>
                                    </div>
                                </div>
            )}
                            {lowStockMedicines.length > 5 &&
            <p className="text-xs text-gray-400 text-center pt-1">
                                    +{lowStockMedicines.length - 5}{t("more \u2014")}{' '}
                                    <Link to="/inventory" className="text-blue-500 hover:underline">{t("View All")}</Link>
                                </p>
            }
                        </div> :

          <p className="text-gray-400 text-center py-5">{t("\u2713 No low-stock medicines")}</p>
          }
                </div>

                {/* Expired Medicines Notifications */}
                <div className="card p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-blue-50">
                        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-orange-500" />{t("Expired Medicines")}

              <span className="ml-1 text-xs font-normal text-gray-400">({data.expiredCount ?? 0})</span>
                        </h3>
                        {expiredMedicines.length > 0 &&
            <Link
              to="/medicines"
              className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">{t("View All")}

              <ArrowRight size={12} />
                            </Link>
            }
                    </div>
                    {displayedExpired.length > 0 ?
          <div className="space-y-2">
                            {displayedExpired.map((m) =>
            <div key={m.id} className="flex justify-between items-center p-3 bg-orange-50 border-l-3 border-orange-400 rounded-md">
                                    <div>
                                        <div className="font-semibold text-sm">{m.name}</div>
                                        <div className="text-xs text-gray-400">{t("Batch:")}{m.batch_number || '---'}</div>
                                    </div>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">{t("Expired:")}
                {formatDate(m.expiry_date)}
                                    </span>
                                </div>
            )}
                            {expiredMedicines.length > 5 &&
            <p className="text-xs text-gray-400 text-center pt-1">
                                    +{expiredMedicines.length - 5}{t("more \u2014")}{' '}
                                    <Link to="/medicines" className="text-blue-500 hover:underline">{t("View All")}</Link>
                                </p>
            }
                        </div> :

          <p className="text-gray-400 text-center py-5">{t("\u2713 No expired medicines")}</p>
          }
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────
           Expiring Soon (within 90 days) — Compact preview table
           Shows max 5 records. Dates formatted as "Aug 29, 2026".
           Collapses to stacked rows on mobile (block layout).
        ───────────────────────────────────────────────────────────────────────── */}
            {expiringMedicines.length > 0 &&
      <div className="card p-5 mb-6 hover:shadow-md transition-shadow duration-200">
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-blue-50">
                        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar size={18} className="text-yellow-500" />{t("Expiring Within 90 Days")}

            <span className="ml-1 text-xs font-normal text-gray-400">
                                ({data.expiringCount ?? expiringMedicines.length}{t("items)")}
            </span>
                        </h3>
                        <Link
            to="/medicines"
            className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">{t("View All")}

            <ArrowRight size={12} />
                        </Link>
                    </div>

                    {/* ── Desktop table (hidden on mobile) ── */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("Medicine")}</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("Batch")}</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("Expiry Date")}</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("Remaining")}</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("Status")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayedExpiring.map((m) => {const { t } = useLanguage();
                const days = daysRemaining(m.expiry_date);
                return (
                  <tr key={m.id} className="hover:bg-yellow-50 transition-colors">
                                            <td className="py-2.5 pr-4 font-medium text-gray-800 whitespace-nowrap">{m.name}</td>
                                            <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap font-mono text-xs">{m.batch_number || '—'}</td>
                                            <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">{formatDate(m.expiry_date)}</td>
                                            <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">{formatDaysRemaining(days)}</td>
                                            <td className="py-2.5">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${expiryStatusBadge(days)}`}>
                                                    {days < 0 ? 'Expired' : days <= 30 ? 'Critical' : days <= 60 ? 'Warning' : 'Soon'}
                                                </span>
                                            </td>
                                        </tr>);

              })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Mobile stacked rows (visible only on mobile) ── */}
                    <div className="sm:hidden space-y-2">
                        {displayedExpiring.map((m) => {const { t } = useLanguage();
            const days = daysRemaining(m.expiry_date);
            return (
              <div key={m.id} className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm text-gray-800 truncate">{m.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5 font-mono">{m.batch_number || '—'}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{formatDate(m.expiry_date)}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${expiryStatusBadge(days)}`}>
                                            {formatDaysRemaining(days)}
                                        </span>
                                    </div>
                                </div>);

          })}
                    </div>

                    {/* Footer: overflow count + View All */}
                    {expiringMedicines.length > 5 &&
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">{t("Showing 5 of")}
            {data.expiringCount ?? expiringMedicines.length}{t("expiring medicines")}
          </span>
                            <Link
            to="/medicines"
            className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">{t("View All")}

            <ArrowRight size={12} />
                            </Link>
                        </div>
        }
                </div>
      }

        </>);

}