<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Stock Movements Report</title>
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
        .badge.in { background: #dcfce7; color: #166534; }
        .badge.out { background: #fee2e2; color: #991b1b; }
        .badge.adjustment { background: #ffedd5; color: #9a3412; }
        .badge.return { background: #dbeafe; color: #1e40af; }
        .badge.transfer { background: #f3e8ff; color: #6b21a8; }
        .badge.damaged { background: #fee2e2; color: #991b1b; }
        .badge.expired { background: #f1f5f9; color: #475569; }
        .badge.lost { background: #ffedd5; color: #9a3412; }
        .badge.correction { background: #e0f2fe; color: #075985; }
        .badge.self { background: #d1fae5; color: #065f46; }
        .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; }
    </style>
</head>
<body>
    <h1>Stock Movements Report</h1>
    <p class="subtitle">Generated on {{ date('Y-m-d H:i') }} | EthioPharmacy Inventory System</p>

    <div class="summary">
        <div class="summary-card"><strong>{{ $summary['total_in'] ?? 0 }}</strong><span>Stock In</span></div>
        <div class="summary-card"><strong>{{ $summary['total_out'] ?? 0 }}</strong><span>Stock Out</span></div>
        <div class="summary-card"><strong>{{ $summary['total_adjustments'] ?? 0 }}</strong><span>Adjustments</span></div>
        <div class="summary-card"><strong>{{ $summary['total_returns'] ?? 0 }}</strong><span>Returns</span></div>
        <div class="summary-card"><strong>{{ $summary['total_transfers'] ?? 0 }}</strong><span>Transfers</span></div>
        <div class="summary-card"><strong>{{ $summary['total_damaged'] ?? 0 }}</strong><span>Damaged</span></div>
        <div class="summary-card"><strong>{{ $summary['total_expired'] ?? 0 }}</strong><span>Expired</span></div>
        <div class="summary-card"><strong>{{ $summary['total_lost'] ?? 0 }}</strong><span>Lost</span></div>
        <div class="summary-card"><strong>{{ $summary['total_corrections'] ?? 0 }}</strong><span>Corrections</span></div>
        <div class="summary-card"><strong>{{ $summary['total_self'] ?? 0 }}</strong><span>Self</span></div>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Medicine</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Before</th>
                <th>After</th>
                <th>User</th>
                <th>Date</th>
                <th>Reference</th>
            </tr>
        </thead>
        <tbody>
            @foreach($movements as $m)
            <tr>
                <td>#{{ $m->id }}</td>
                <td>{{ $m->medicine->name ?? 'N/A' }}</td>
                <td><span class="badge {{ $m->type }}">{{ $m->type_label }}</span></td>
                <td>{{ $m->quantity }}</td>
                <td>{{ $m->before_quantity }}</td>
                <td>{{ $m->after_quantity }}</td>
                <td>{{ $m->user->name ?? 'System' }}</td>
                <td>{{ $m->created_at->format('Y-m-d H:i') }}</td>
                <td>{{ $m->reference ?? '---' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <p class="footer">EthioPharmacy Smart Pharmacy Inventory System</p>
</body>
</html>
