<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharmacy Inventory Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            color: #1f4f3d;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Header */
        .header {
            background: #1f7a5a;
            color: white;
            padding: 18px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .header .logo {
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .header .logo .icon {
            font-size: 28px;
        }

        .header .nav-links a {
            color: #e8f5e9;
            text-decoration: none;
            margin-left: 24px;
            font-size: 15px;
            font-weight: 500;
            transition: color 0.2s;
        }

        .header .nav-links a:hover {
            color: white;
        }

        .header .nav-links .btn-dashboard {
            background: #fff2f2;
            color: #1f4f3d;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.2s;
        }

        .header .nav-links .btn-dashboard:hover {
            background: #ffe0e0;
        }

        /* Hero Section */
        .hero {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
        }

        .hero-content {
            max-width: 720px;
        }

        .hero h1 {
            font-size: 42px;
            color: #1f4f3d;
            margin-bottom: 16px;
            line-height: 1.2;
        }

        .hero h1 .highlight {
            color: #1f7a5a;
        }

        .hero p {
            font-size: 19px;
            color: #4a6b5f;
            margin-bottom: 32px;
            line-height: 1.6;
        }

        .hero .btn-primary {
            display: inline-block;
            background: #1f7a5a;
            color: white;
            padding: 14px 36px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 17px;
            font-weight: 600;
            transition: background 0.2s, transform 0.1s;
        }

        .hero .btn-primary:hover {
            background: #14532d;
            transform: translateY(-2px);
        }

        .hero .btn-secondary {
            display: inline-block;
            background: transparent;
            color: #1f7a5a;
            border: 2px solid #1f7a5a;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            margin-left: 16px;
            transition: background 0.2s, color 0.2s;
        }

        .hero .btn-secondary:hover {
            background: #1f7a5a;
            color: white;
        }

        /* Features Section */
        .features {
            background: white;
            padding: 60px 40px;
            border-top: 1px solid #e0e0e0;
        }

        .features-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .features h2 {
            text-align: center;
            font-size: 28px;
            color: #1f4f3d;
            margin-bottom: 8px;
        }

        .features p.subtitle {
            text-align: center;
            color: #6b8e7e;
            margin-bottom: 40px;
            font-size: 16px;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px;
        }

        .feature-card {
            background: #f5f7fb;
            border-radius: 12px;
            padding: 28px 24px;
            text-align: center;
            border: 1px solid #e0e0e0;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }

        .feature-card .feature-icon {
            font-size: 40px;
            margin-bottom: 16px;
        }

        .feature-card h3 {
            font-size: 18px;
            color: #1f4f3d;
            margin-bottom: 10px;
        }

        .feature-card p {
            font-size: 14px;
            color: #5a7d6f;
            line-height: 1.5;
        }

        /* Footer */
        .footer {
            background: #1f4f3d;
            color: #c8e6c9;
            text-align: center;
            padding: 20px;
            font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .hero h1 {
                font-size: 32px;
            }

            .hero .btn-secondary {
                margin-left: 0;
                margin-top: 12px;
                display: block;
            }

            .header {
                flex-direction: column;
                gap: 12px;
                padding: 14px 20px;
            }

            .features {
                padding: 40px 20px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="logo">
            <span class="icon">🏥</span>
            <span>Pharmacy Manager</span>
        </div>
        <div class="nav-links">
            <a href="#features">Features</a>
            <a href="{{ route('dashboard') }}" class="btn-dashboard">Go to Dashboard</a>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>Welcome to Your <span class="highlight">Pharmacy Inventory</span> Management System</h1>
            <p>
                Streamline your pharmacy operations with our comprehensive inventory management solution.
                Track medicines, manage stock levels, monitor expiry dates, and handle purchase orders
                all in one intuitive platform.
            </p>
            <a href="{{ route('dashboard') }}" class="btn-primary">Go to Dashboard</a>
            <a href="#features" class="btn-secondary">Learn More</a>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="features-container">
            <h2>Everything You Need to Manage Your Pharmacy</h2>
            <p class="subtitle">A complete solution designed for modern pharmacies</p>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">💊</div>
                    <h3>Medicine Management</h3>
                    <p>Add, edit, and organize all your medicine inventory with categories and detailed information.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">📦</div>
                    <h3>Purchase Orders</h3>
                    <p>Create and track purchase orders from suppliers with automated stock updates.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">📈</div>
                    <h3>Sales Tracking</h3>
                    <p>Record sales transactions and automatically update stock quantities in real-time.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">⚠️</div>
                    <h3>Low Stock Alerts</h3>
                    <p>Get notified when medicine stock falls below the reorder level to avoid shortages.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">📅</div>
                    <h3>Expiry Monitoring</h3>
                    <p>Track expiry dates and receive alerts for medicines expiring within 90 days.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Reports & Analytics</h3>
                    <p>Generate insightful reports on stock levels, sales, and purchase history.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; 2026 Pharmacy Inventory Management System. All rights reserved.</p>
    </footer>
</body>
</html>
