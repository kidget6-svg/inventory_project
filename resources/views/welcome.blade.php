<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharmacy Inventory Management System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 100px 0;
            min-height: 80vh;
            display: flex;
            align-items: center;
        }
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
        }
        .feature-card {
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s;
            text-align: center;
            background: white;
        }
        .feature-card:hover {
            transform: translateY(-10px);
        }
        .feature-icon {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 20px;
        }
        .btn-custom {
            padding: 12px 35px;
            border-radius: 50px;
            font-weight: 600;
        }
        .navbar-custom {
            background: rgba(255,255,255,0.95);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stats-section {
            background: #f8f9fa;
            padding: 60px 0;
        }
        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: #667eea;
        }
        .footer {
            background: #2d3436;
            color: white;
            padding: 30px 0;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-custom fixed-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <i class="fas fa-prescription-bottle me-2 text-primary"></i>
                PharmacyInventory
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#features">Features</a></li>
                    <li class="nav-item"><a class="nav-link" href="#about">About</a></li>
                    @auth
                        <li class="nav-item">
                            <a class="btn btn-primary btn-sm ms-2" href="{{ route('dashboard') }}">
                                <i class="fas fa-tachometer-alt me-1"></i> Dashboard
                            </a>
                        </li>
                    @else
                        <li class="nav-item">
                            <a class="btn btn-outline-primary btn-sm ms-2" href="{{ route('login') }}">
                                <i class="fas fa-sign-in-alt me-1"></i> Login
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-primary btn-sm ms-2" href="{{ route('register') }}">
                                <i class="fas fa-user-plus me-1"></i> Register
                            </a>
                        </li>
                    @endauth
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" style="margin-top: 56px;">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="mb-4">Pharmacy Inventory Management System</h1>
                    <p class="lead mb-4">
                        Streamline your pharmacy operations with real-time inventory tracking,
                        batch management, and FEFO enforcement.
                    </p>
                    <div class="d-flex gap-3 flex-wrap">
                        @auth
                            <a href="{{ route('dashboard') }}" class="btn btn-light btn-custom">
                                <i class="fas fa-tachometer-alt me-2"></i> Go to Dashboard
                            </a>
                        @else
                            <a href="{{ route('login') }}" class="btn btn-light btn-custom">
                                <i class="fas fa-sign-in-alt me-2"></i> Login
                            </a>
                            <a href="{{ route('register') }}" class="btn btn-outline-light btn-custom">
                                <i class="fas fa-user-plus me-2"></i> Get Started
                            </a>
                        @endauth
                    </div>
                    <div class="mt-4">
                        <span class="badge bg-light text-dark me-2 p-2">
                            <i class="fas fa-check-circle text-success me-1"></i> FEFO Ready
                        </span>
                        <span class="badge bg-light text-dark me-2 p-2">
                            <i class="fas fa-check-circle text-success me-1"></i> Batch Tracking
                        </span>
                        <span class="badge bg-light text-dark p-2">
                            <i class="fas fa-check-circle text-success me-1"></i> Controlled Substances
                        </span>
                    </div>
                </div>
                <div class="col-lg-6 text-center d-none d-lg-block">
                    <i class="fas fa-prescription-bottle-alt" style="font-size: 12rem; opacity: 0.8;"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-5">
        <div class="container">
            <h2 class="text-center mb-5 fw-bold">Key Features</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-boxes"></i></div>
                        <h5>Inventory Management</h5>
                        <p class="text-muted">Track real-time stock, set reorder levels, and get low-stock alerts.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-calendar-check"></i></div>
                        <h5>Batch & Expiry Tracking</h5>
                        <p class="text-muted">Monitor batch numbers, expiry dates, and enforce FEFO rotation.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-shopping-cart"></i></div>
                        <h5>Sales & POS</h5>
                        <p class="text-muted">Process sales quickly with barcode scanning and prescription tracking.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
        <div class="container">
            <div class="row">
                <div class="col-md-3 col-6 text-center">
                    <div class="stat-number">500+</div>
                    <p class="text-muted">Products Managed</p>
                </div>
                <div class="col-md-3 col-6 text-center">
                    <div class="stat-number">1000+</div>
                    <p class="text-muted">Transactions Daily</p>
                </div>
                <div class="col-md-3 col-6 text-center">
                    <div class="stat-number">99%</div>
                    <p class="text-muted">Uptime Guaranteed</p>
                </div>
                <div class="col-md-3 col-6 text-center">
                    <div class="stat-number">24/7</div>
                    <p class="text-muted">Support Available</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h5><i class="fas fa-prescription-bottle me-2"></i>PharmacyInventory</h5>
                    <p class="text-muted">Smart inventory management for modern pharmacies.</p>
                </div>
                <div class="col-md-4">
                    <h5>Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="#features" class="text-muted text-decoration-none">Features</a></li>
                        <li><a href="#about" class="text-muted text-decoration-none">About</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5>Contact</h5>
                    <p class="text-muted">
                        <i class="fas fa-envelope me-2"></i> support@pharmacyinventory.com
                    </p>
                </div>
            </div>
            <hr class="bg-secondary">
            <div class="text-center text-muted">
                &copy; 2026 Pharmacy Inventory Management System. All rights reserved.
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>