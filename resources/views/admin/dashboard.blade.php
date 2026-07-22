<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Pharmacy Inventory</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background: #f0f2f5;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: transform 0.3s ease;
            border-left: 4px solid #667eea;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
        }
        .stat-label {
            color: #6c757d;
            font-size: 0.9rem;
        }
        .dashboard-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        .alert-item {
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 8px;
            transition: all 0.3s ease;
        }
        .alert-item:hover {
            transform: translateX(5px);
        }
        .alert-warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
        }
        .alert-danger {
            background: #fee;
            border-left: 4px solid #dc3545;
        }
        .badge-expiry {
            font-size: 0.75rem;
            padding: 5px 10px;
        }
        .navbar-custom {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            padding: 15px 0;
        }
        .main-content {
            padding: 20px;
        }
        .top-bar {
            background: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 25px;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-custom">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <i class="fas fa-prescription-bottle text-primary me-2"></i>
                Pharmacy Inventory
            </a>
            <div class="d-flex align-items-center">
                <span class="me-3 text-muted">Welcome, {{ Auth::user()->name ?? 'Admin' }}</span>
                <a href="{{ route('logout') }}" class="btn btn-outline-danger btn-sm">
                    <i class="fas fa-sign-out-alt me-1"></i> Logout
                </a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container main-content">
        <div class="top-bar">
            <h4 class="mb-0">
                <i class="fas fa-tachometer-alt text-primary me-2"></i>
                Dashboard
            </h4>
            <small class="text-muted">Overview of your pharmacy inventory</small>
        </div>

        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
            <div class="col-xl-3 col-lg-6 col-md-6">
                <div class="stat-card" style="border-left-color: #667eea;">
                    <div class="stat-number">{{ $totalProducts ?? 0 }}</div>
                    <div class="stat-label">
                        <i class="fas fa-pills me-1"></i> Total Medicine Types
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="stat-number">{{ $totalStock ?? 0 }}</div>
                    <div class="stat-label">
                        <i class="fas fa-boxes me-1"></i> Total Stock Units
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
                <div class="stat-card" style="border-left-color: #dc3545;">
                    <div class="stat-number">{{ $lowStockCount ?? 0 }}</div>
                    <div class="stat-label">
                        <i class="fas fa-exclamation-triangle me-1"></i> Low-Stock Medicines
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
                <div class="stat-card" style="border-left-color: #ffc107;">
                    <div class="stat-number">{{ $expiringCount ?? 0 }}</div>
                    <div class="stat-label">
                        <i class="fas fa-clock me-1"></i> Expiring Within 90 Days
                    </div>
                </div>
            </div>
        </div>

        <!-- Expiry Breakdown -->
        <div class="row g-4 mb-4">
            <div class="col-md-4">
                <div class="dashboard-card text-center">
                    <h6 class="text-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Expiring in 30 Days
                    </h6>
                    <div class="display-6 fw-bold text-danger">{{ $expiring30Days ?? 0 }}</div>
                    <small class="text-muted">Critical - Immediate action needed</small>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card text-center">
                    <h6 class="text-warning">
                        <i class="fas fa-clock me-2"></i>
                        Expiring in 60 Days
                    </h6>
                    <div class="display-6 fw-bold text-warning">{{ $expiring60Days ?? 0 }}</div>
                    <small class="text-muted">Monitor closely</small>
                </div>
            </div>
            <div class="col-md-4">
                <div class="dashboard-card text-center">
                    <h6 class="text-info">
                        <i class="fas fa-calendar-alt me-2"></i>
                        Expiring in 90 Days
                    </h6>
                    <div class="display-6 fw-bold text-info">{{ $expiring90Days ?? 0 }}</div>
                    <small class="text-muted">Plan for rotation</small>
                </div>
            </div>
        </div>

        <!-- Low Stock Alerts -->
        <div class="row g-4">
            <div class="col-lg-6">
                <div class="dashboard-card">
                    <h6 class="card-title">
                        <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                        Low-Stock Medicines
                    </h6>
                    @if(isset($lowStockProducts) && $lowStockProducts->count() > 0)
                        @foreach($lowStockProducts as $product)
                            <div class="alert-item alert-warning">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{{ $product->generic_name }}</strong>
                                        @if($product->brand_name)
                                            <small class="text-muted">({{ $product->brand_name }})</small>
                                        @endif
                                        <br>
                                        <small>Category: {{ $product->category ?? 'N/A' }}</small>
                                    </div>
                                    <div class="text-end">
                                        <span class="badge bg-danger">Stock: {{ $product->batches->sum('quantity') }}</span>
                                        <br>
                                        <small class="text-muted">Reorder Level: {{ $product->reorder_level }}</small>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    @else
                        <p class="text-muted text-center py-3">
                            <i class="fas fa-check-circle text-success me-2"></i>
                            No low-stock medicines
                        </p>
                    @endif
                </div>
            </div>

            <!-- Expiring Soon -->
            <div class="col-lg-6">
                <div class="dashboard-card">
                    <h6 class="card-title">
                        <i class="fas fa-calendar-exclamation text-danger me-2"></i>
                        Medicines Expiring Within 90 Days
                    </h6>
                    @php
                        $expiringBatches = \App\Models\Batch::with('product')
                            ->where('quantity', '>', 0)
                            ->whereDate('expiry_date', '>=', now())
                            ->whereDate('expiry_date', '<=', now()->addDays(90))
                            ->orderBy('expiry_date')
                            ->limit(10)
                            ->get();
                    @endphp
                    @if($expiringBatches->count() > 0)
                        @foreach($expiringBatches as $batch)
                            <div class="alert-item 
                                @if($batch->expiry_date <= now()->addDays(30)) alert-danger
                                @elseif($batch->expiry_date <= now()->addDays(60)) alert-warning
                                @else alert-info @endif">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{{ $batch->product->generic_name ?? 'N/A' }}</strong>
                                        @if(isset($batch->product->brand_name))
                                            <small class="text-muted">({{ $batch->product->brand_name }})</small>
                                        @endif
                                        <br>
                                        <small>Batch: {{ $batch->batch_number }}</small>
                                    </div>
                                    <div class="text-end">
                                        <span class="badge bg-secondary">Qty: {{ $batch->quantity }}</span>
                                        <br>
                                        <span class="badge 
                                            @if($batch->expiry_date <= now()->addDays(30)) bg-danger
                                            @elseif($batch->expiry_date <= now()->addDays(60)) bg-warning
                                            @else bg-info @endif">
                                            Expires: {{ $batch->expiry_date->format('M d, Y') }}
                                        </span>
                                        <br>
                                        <small class="text-muted">
                                            {{ $batch->days_until_expiry ?? $batch->expiry_date->diffInDays(now()) }} days left
                                        </small>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    @else
                        <p class="text-muted text-center py-3">
                            <i class="fas fa-check-circle text-success me-2"></i>
                            No medicines expiring soon
                        </p>
                    @endif
                </div>
            </div>
        </div>

        <!-- Additional Stats -->
        <div class="row g-4 mt-3">
            <div class="col-md-3 col-6">
                <div class="dashboard-card text-center">
                    <h6><i class="fas fa-users text-primary me-2"></i>Suppliers</h6>
                    <div class="display-6">{{ $totalSuppliers ?? 0 }}</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="dashboard-card text-center">
                    <h6><i class="fas fa-prescription text-danger me-2"></i>Controlled</h6>
                    <div class="display-6">{{ $controlledMedicines ?? 0 }}</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="dashboard-card text-center">
                    <h6><i class="fas fa-shopping-cart text-success me-2"></i>Today's Sales</h6>
                    <div class="display-6">{{ $todaySalesCount ?? 0 }}</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="dashboard-card text-center">
                    <h6><i class="fas fa-money-bill-wave text-warning me-2"></i>Revenue</h6>
                    <div class="display-6">${{ number_format($todayRevenue ?? 0, 0) }}</div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>