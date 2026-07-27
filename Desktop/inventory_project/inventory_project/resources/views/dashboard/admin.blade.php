@extends('layouts.app')

@section('title', 'Admin Dashboard')

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Sales Trend Chart
    var salesCtx = document.getElementById('salesTrendChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: @json($trendDates),
            datasets: [{
                label: 'Revenue ($)',
                data: @json($trendAmounts),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Top Selling Chart
    var topSellingCtx = document.getElementById('topSellingChart').getContext('2d');
    new Chart(topSellingCtx, {
        type: 'bar',
        data: {
            labels: @json($topSelling->pluck('name_generic')->toArray()),
            datasets: [{
                label: 'Revenue ($)',
                data: @json($topSelling->pluck('total_revenue')->toArray()),
                backgroundColor: '#10b981'
            }]
        },
        options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } } }
    });

    // Sales by Cashier Chart
    var cashierCtx = document.getElementById('salesByCashierChart').getContext('2d');
    new Chart(cashierCtx, {
        type: 'doughnut',
        data: {
            labels: @json($salesByCashier->pluck('name')->toArray()),
            datasets: [{
                data: @json($salesByCashier->pluck('total_revenue')->toArray()),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        options: { responsive: true }
    });
});
</script>
@endpush

@section('content')
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-sm text-gray-600">System overview and management</p>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-2.21 0-4-.89-4-2s1.79-2 4-2 4 .89 4 2-1.79 2-4 2z" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Today's Revenue</dt>
                        <dd class="text-2xl font-semibold text-gray-900">${{ number_format($todayRevenue, 2) }}</dd>
                        <dd class="text-sm text-{{ $revenueChange >= 0 ? 'green' : 'red' }}-600">
                            {{ $revenueChange >= 0 ? '+' : '' }}{{ $revenueChange }}% vs yesterday
                        </dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4.701c.176.017.366.031.558.031.548 0 .98-.432 1.056-.966a3.997 3.997 0 015.788-.005c.07.53.505.965 1.056.965.192 0 .382-.014.558-.031A3.997 3.997 0 0112 18c-1.373 0-2.617-.44-3.642-1.177z" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $lowStockCount }}</dd>
                        <dd class="text-sm text-red-600">{{ $outOfStockCount }} out of stock</dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Expiring Soon (90d)</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $expiringSoonCount }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 20h5v-2a4 4 0 00-5-3.87M9 20h5v-2a4 4 0 015-3.87M9 20V8a3 3 0 013-3h2a3 3 0 013 3v2" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Active Staff</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $activeStaffCount }}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <!-- Operational Alerts -->
        <div class="xl:col-span-1">
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-900">Critical Low Stock</h2>
                </div>
                <div class="p-4">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-left text-xs text-gray-500 uppercase">
                                <th class="pb-2">Product</th>
                                <th class="pb-2">Stock</th>
                                <th class="pb-2">Min</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($criticalLowStock as $product)
                            <tr class="border-t">
                                <td class="py-2">{{ $product->name_generic }}</td>
                                <td class="py-2 text-red-600">{{ $product->total_stock ?? 0 }}</td>
                                <td class="py-2">{{ $product->minimum_stock_level }}</td>
                            </tr>
                            @empty
                            <tr><td colspan="3" class="py-2 text-center text-gray-500">No low stock items</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-900">Expiry Warnings</h2>
                </div>
                <div class="p-4">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-left text-xs text-gray-500 uppercase">
                                <th class="pb-2">Product</th>
                                <th class="pb-2">Batch</th>
                                <th class="pb-2">Expires</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($expiryWarnings as $batch)
                            <tr class="border-t">
                                <td class="py-2">{{ $batch->product->name_generic ?? 'N/A' }}</td>
                                <td class="py-2">{{ $batch->batch_number }}</td>
                                <td class="py-2 text-yellow-600">{{ $batch->expiry_date->format('M d, Y') }}</td>
                            </tr>
                            @empty
                            <tr><td colspan="3" class="py-2 text-center text-gray-500">No expiring items</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="xl:col-span-2">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Sales Trend (7 Days)</h3>
                    <canvas id="salesTrendChart" height="200"></canvas>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Top-Selling Medicines</h3>
                    <canvas id="topSellingChart" height="200"></canvas>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Sales by Cashier</h3>
                <canvas id="salesByCashierChart" height="200"></canvas>
            </div>
        </div>
    </div>

    <!-- Recent Transactions & Audit Trail -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-semibold text-gray-900">Latest Sales</h2>
            </div>
            <div class="p-4">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs text-gray-500 uppercase">
                            <th class="pb-2">Invoice</th>
                            <th class="pb-2">Cashier</th>
                            <th class="pb-2">Amount</th>
                            <th class="pb-2">Method</th>
                            <th class="pb-2">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentSales as $sale)
                        <tr class="border-t">
                            <td class="py-2 font-mono">{{ $sale->invoice_number }}</td>
                            <td class="py-2">{{ $sale->user->name ?? 'N/A' }}</td>
                            <td class="py-2">${{ number_format($sale->total_amount, 2) }}</td>
                            <td class="py-2 capitalize">{{ $sale->payment_method }}</td>
                            <td class="py-2 text-gray-500">{{ $sale->created_at->diffForHumans() }}</td>
                        </tr>
                        @empty
                        <tr><td colspan="5" class="py-2 text-center text-gray-500">No recent sales</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-semibold text-gray-900">System Activity Log</h2>
            </div>
            <div class="p-4">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs text-gray-500 uppercase">
                            <th class="pb-2">Product</th>
                            <th class="pb-2">Type</th>
                            <th class="pb-2">Qty</th>
                            <th class="pb-2">User</th>
                            <th class="pb-2">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentActivity as $log)
                        <tr class="border-t">
                            <td class="py-2">{{ $log->product->name_generic ?? 'N/A' }}</td>
                            <td class="py-2 capitalize">{{ $log->transaction_type }}</td>
                            <td class="py-2">{{ $log->quantity_change }}</td>
                            <td class="py-2">{{ $log->user->name ?? 'System' }}</td>
                            <td class="py-2 text-gray-500">{{ $log->created_at ? $log->created_at->diffForHumans() : 'N/A' }}</td>
                        </tr>
                        @empty
                        <tr><td colspan="5" class="py-2 text-center text-gray-500">No recent activity</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Quick Action Shortcuts -->
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div class="p-6">
            <div class="flex flex-wrap gap-4">
                <a href="{{ route('users.create') }}"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    + Add New User
                </a>
                <a href="#"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                    + Create Purchase Order
                </a>
                <a href="#"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                    Generate Financial Report
                </a>
                <a href="#"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                    Manage System Settings
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
