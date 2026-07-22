<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Pharmacy Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fb; margin: 0; padding: 40px; }
        .container { max-width: 1100px; margin: auto; }
        h1 { color: #1f4f3d; }
        .button { background: #1f7a5a; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; }
        .cards { display: flex; gap: 20px; margin: 25px 0; flex-wrap: wrap; }
        .card { background: white; padding: 22px; border-radius: 10px; min-width: 200px; flex: 1; }
        .number { font-size: 32px; font-weight: bold; color: #1f7a5a; }
        .warning { color: #b91c1c; }
        .section { background: white; padding: 22px; border-radius: 10px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background: #e9f5ef; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Pharmacy Dashboard</h1>

        <a class="button" href="{{ route('medicines.index') }}">Manage Medicines</a>

        <div class="cards">
            <div class="card">
                <p>Total Medicine Types</p>
                <p class="number">{{ $totalProducts }}</p>
            </div>

            <div class="card">
                <p>Total Stock Units</p>
                <p class="number">{{ $totalStock }}</p>
            </div>

            <div class="card">
                <p>Low-Stock Medicines</p>
                <p class="number warning">{{ $lowStockMedicines->count() }}</p>
            </div>

            <div class="card">
                <p>Expiring Within 90 Days</p>
                <p class="number warning">{{ $expiringMedicines->count() }}</p>
            </div>
        </div>

        <div class="section">
            <h2>Low-Stock Medicines</h2>

            @if ($lowStockMedicines->isEmpty())
                <p>No low-stock medicines.</p>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Quantity</th>
                            <th>Warning Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($lowStockMedicines as $medicine)
                            <tr>
                                <td>{{ $medicine->name }}</td>
                                <td>{{ $medicine->quantity }}</td>
                                <td>{{ $medicine->reorder_level }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <div class="section">
            <h2>Medicines Expiring Within 90 Days</h2>

            @if ($expiringMedicines->isEmpty())
                <p>No medicines expiring soon.</p>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Batch No.</th>
                            <th>Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($expiringMedicines as $medicine)
                            <tr>
                                <td>{{ $medicine->name }}</td>
                                <td>{{ $medicine->batch_number ?? '—' }}</td>
                                <td>{{ $medicine->expiry_date->format('d M Y') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>
    </div>
</body>
</html>