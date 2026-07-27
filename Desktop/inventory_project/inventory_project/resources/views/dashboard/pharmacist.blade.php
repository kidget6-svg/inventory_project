@extends('layouts.app')

@section('title', 'Pharmacist Dashboard')

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
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });

    // Top-Selling Products Chart
    var topSellingCtx = document.getElementById('topSellingChart').getContext('2d');
    new Chart(topSellingCtx, {
        type: 'bar',
        data: {
            labels: @json($topSellingProducts->pluck('name_generic')->toArray()),
            datasets: [{
                label: 'Revenue ($)',
                data: @json($topSellingProducts->pluck('total_revenue')->toArray()),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.x.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
});
</script>
@endpush

@section('content')
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
            <p class="text-sm text-gray-600">Inventory management and monitoring</p>
        </div>
        <div class="mt-4 sm:mt-0 text-xs text-gray-500">
            <span class="inline-flex items-center">
                <svg class="h-3 w-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 12.586 7.707 11.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Auto-refresh: 60s
            </span>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols_3 xl:grid-cols-6 gap-6 mb-8">
        <!-- Low Stock Alerts -->
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
                        <dt class="text-sm font-medium text-gray-500 truncate">Low Stock Alerts</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $lowStockCount }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- Expiring Soon -->
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
                        <dt class="text-sm font-medium text-gray-500 truncate">Expiring Soon (30d)</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $expiringSoonCount }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- Total Products -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m2-3l8-4 8 4" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $totalProducts }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- Today's Sales -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-2.21 0-4-.89-4-2s1.79-2 4-2 4 .89 4 2-1.79 2-4 2z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 12c-2.21 0-4-.89-4-2v6c0 1.11.79 2 4 2s4-.89 4-2V10c0-1.11-.79-2-4-2z" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Today's Sales</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $todaySalesCount }}</dd>
                        <dd class="text-sm text-gray-500">${{ number_format($todaySalesTotal, 2) }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- Total Suppliers -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-14 0h2m10 0h.01M9 7h.01M9 11h.01M9 15h.01M13 7h.01M13 11h.01M13 15h.01" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Total Suppliers</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $totalSuppliers }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- Total Customers -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 20h5v-2a4 4 0 00-5-3.87M9 20h5v-2a4 4 0 015-3.87M9 20V8a3 3 0 013-3h2a3 3 0 013 3v2" />
                    </svg>
                </div>
                <div class="ml-4 w-0 flex-1">
                    <dl>
                        <dt class="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                        <dd class="text-2xl font-semibold text-gray-900">{{ $totalCustomers }}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>

    <!-- Operational Alerts -->
    @if($lowStockCount > 0 || $expiringSoonCount > 0)
    <div class="bg-white rounded-lg shadow mb-8">
        <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">Alerts</h2>
        </div>
        <div class="p-6">
            @if($lowStockCount > 0)
            <div class="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4.701c.176.017.366.031.558.031.548 0 .98-.432 1.056-.966a3.997 3.997 0 015.788-.005c.07.53.505.965 1.056.965.192 0 .382-.014.558-.031A3.997 3.997 0 0112 18c-1.373 0-2.617-.44-3.642-1.177z" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-orange-800">Low Stock Alert</h3>
                        <div class="mt-2 text-sm text-orange-700">
                            <p>{{ $lowStockCount }} product(s) have low stock levels. Please review inventory.</p>
                        </div>
                    </div>
                </div>
            </div>
            @endif

            @if($expiringSoonCount > 0)
            <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">Expiry Alert</h3>
                        <div class="mt-2 text-sm text-yellow-700">
                            <p>{{ $expiringSoonCount }} product(s) are expiring within 30 days. Please review.</p>
                        </div>
                    </div>
                </div>
            </div>
            @endif
        </div>
    </div>
    @endif

    <!-- Charts Section -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <!-- Sales Trend Chart -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sales Trend (7 Days)</h3>
            <canvas id="salesTrendChart" height="200"></canvas>
        </div>

        <!-- Top-Selling Products Chart -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Top-Selling Medicines (30d)</h3>
            <canvas id="topSellingChart" height="200"></canvas>
        </div>
    </div>

    <!-- Low Stock & Expiring Batches Tables -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <!-- Low Stock Products -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-semibold text-gray-900">Low Stock Products</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($lowStockProducts as $product)
                        <tr>
                            <td class="px-6 py-4">{{ $product->name_generic }}</td>
                            <td class="px-6 py-4 text-red-600">{{ $product->total_stock ?? 0 }}</td>
                            <td class="px-6 py-4">{{ $product->minimum_stock_level }}</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No low stock items</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Expiring Batches -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-semibold text-gray-900">Expiring Batches</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Remaining</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($expiringBatches as $batch)
                        <tr>
                            <td class="px-6 py-4">{{ $batch->product->name_generic ?? 'N/A' }}</td>
                            <td class="px-6 py-4">{{ $batch->batch_number }}</td>
                            <td class="px-6 py-4 text-yellow-600">{{ $batch->expiry_date->format('M d, Y') }}</td>
                            <td class="px-6 py-4">{{ $batch->quantity_remaining }}</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No expiring batches</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Suppliers & Stock Intake Section -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <!-- Top Suppliers -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-semibold text-gray-900">Top Suppliers</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batches</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($topSuppliers as $supplier)
                        <tr>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ $supplier->name }}</div>
                                <div class="text-sm text-gray-500">{{ $supplier->contact_person }}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $supplier->phone ?? 'N/A' }}</td>
                            <td class="px-6 py-4">{{ $supplier->batches_received }}</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No supplier data</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Stock Intake Summary -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-semibold text-gray-900">Stock Intake Summary</h2>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-50 rounded-lg p-4 text-center">
                        <dt class="text-sm font-medium text-gray-500">Today's Intake</dt>
                        <dd class="text-2xl font-semibold text-blue-700 mt-1">{{ $stockIntakeToday }} units</dd>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <dt class="text-sm font-medium text-gray-500">Total Stock Value</dt>
                        <dd class="text-2xl font-semibold text-green-700 mt-1">${{ number_format($totalStockValue, 2) }}</dd>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity Log -->
    <div class="bg-white rounded-lg shadow mb-8">
        <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Change</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse($recentActivity as $log)
                    <tr>
                        <td class="px-6 py-4">{{ $log->product->name_generic ?? 'N/A' }}</td>
                        <td class="px-6 py-4 capitalize">{{ $log->transaction_type }}</td>
                        <td class="px-6 py-4">{{ $log->quantity_change }}</td>
                        <td class="px-6 py-4">{{ $log->user->name ?? 'System' }}</td>
                        <td class="px-6 py-4 text-gray-500">{{ $log->created_at ? $log->created_at->diffForHumans() : 'N/A' }}</td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No recent activity</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div class="p-6">
            <div class="flex flex-wrap gap-4">
                <a href="{{ route('dashboard') }}"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    Manage Inventory
                </a>
                <a href="{{ route('dashboard') }}"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                    Stock Intake
                </a>
                <a href="{{ route('dashboard') }}"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                    Purchase Orders
                </a>
                <a href="{{ route('dashboard') }}"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                    View Reports
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Auto-refresh script -->
<script>
    // Auto-refresh the dashboard every 60 seconds to reflect new sales, purchases, and inventory changes
    setTimeout(function() {
        window.location.reload();
    }, 60000);
</script>
@endsection
