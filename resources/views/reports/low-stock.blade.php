<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Low Stock Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; }
        h1 { color: #0ea5e9; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
        .summary { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        .summary-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 10px 14px; min-width: 120px; }
        .summary-card strong { display: block; font-size: 16px; color: #0c4a6e; }
        .summary-card span { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #0ea5e9; color: #fff; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .badge.out { background: #fee2e2; color: #991b1b; }
        .badge.critical { background: #ffedd5; color: #9a3412; }
        .badge.low { background: #fef9c3; color: #854d0e; }
        .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; }
    </style>
</head>
<body>
    <h1>Low Stock Report</h1>
    <p class="subtitle">Generated on {{ date('Y-m-d H:i') }} | EthioPharmacy Inventory System</p>

    <div class="summary">
        <div class="summary-card"><strong>{{ $stats['total'] }}</strong><span>Total Low Stock</span></div>
        <div class="summary-card"><strong>{{ $stats['out_of_stock'] }}</strong><span>Out of Stock</span></div>
        <div class="summary-card"><strong>{{ $stats['critical'] }}</strong><span>Critical</span></div>
        <div class="summary-card"><strong>{{ $stats['low'] }}</strong><span>Low Stock</span></div>
        <div class="summary-card"><strong>${{ number_format($stats['inventory_value'], 2) }}</strong><span>Inventory Value</span></div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Medicine</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Expiry Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($medicines as $m)
            <tr>
                <td>{{ $m->name }}</td>
                <td>{{ $m->barcode ?? '---' }}</td>
                <td>{{ $m->category->name ?? 'Uncategorized' }}</td>
                <td>{{ $m->supplier->name ?? '---' }}</td>
                <td>{{ $m->quantity }}</td>
                <td>{{ $m->reorder_level }}</td>
                <td>
                    @if($m->quantity == 0)
                        <span class="badge out">Out of Stock</span>
                    @elseif($m->quantity <= $m->reorder_level / 2)
                        <span class="badge critical">Critical</span>
                    @else
                        <span class="badge low">Low Stock</span>
                    @endif
                </td>
                <td>{{ $m->expiry_date ? \Carbon\Carbon::parse($m->expiry_date)->format('Y-m-d') : '---' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <p class="footer">EthioPharmacy Smart Pharmacy Inventory System</p>
</body>
</html>
