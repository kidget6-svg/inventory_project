<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sales Report</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 1000px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 3px solid #0287ce; padding-bottom: 20px; margin-bottom: 30px; }
        .pharmacy-name { font-size: 24px; font-weight: bold; color: #0287ce; }
        .pharmacy-sub { font-size: 13px; color: #666; margin-top: 4px; }
        .report-title { font-size: 20px; font-weight: bold; color: #333; margin: 20px 0; }
        .report-meta { font-size: 12px; color: #777; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        .table th { background-color: #e6f0fa; color: #0287ce; padding: 8px 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        .table td { padding: 6px 10px; border: 1px solid #ddd; vertical-align: top; }
        .table .text-right { text-align: right; }
        .total-row { font-weight: bold; background-color: #f0f8ff; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="pharmacy-name">{{ config('app.name', 'PharmaSys') }}</div>
            <div class="pharmacy-sub">Pharmacy Inventory Management System</div>
        </div>

        <div class="report-title">Sales Report</div>
        <div class="report-meta">
            Generated on: {{ \Carbon\Carbon::now()->format('M d, Y h:i A') }}
            @if(isset($request) && $request->filled('type'))
            | Report Type: {{ ucfirst($request->type) }}
            @endif
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Receipt Number</th>
                    <th>Date</th>
                    <th>Cashier</th>
                    <th>Customer</th>
                    <th>Payment Method</th>
                    <th class="text-right">Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sales as $sale)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $sale->receipt_number ?? 'N/A' }}</td>
                    <td>{{ \Carbon\Carbon::parse($sale->sale_date)->format('Y-m-d H:i') }}</td>
                    <td>{{ $sale->cashier_name }}</td>
                    <td>{{ $sale->customer_name ?? 'Walk-in Customer' }}</td>
                    <td>{{ $sale->payment_method_label }}</td>
                    <td class="text-right">${{ number_format($sale->total_amount, 2) }}</td>
                    <td>{{ $sale->status_label }}</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="6" class="text-right">Total Sales:</td>
                    <td class="text-right">${{ number_format($sales->sum('total_amount'), 2) }}</td>
                    <td>{{ $sales->count() }} transactions</td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <p>This is a computer-generated report. | Pharmacy: {{ config('app.name', 'PharmaSys') }}</p>
        </div>
    </div>
</body>
</html>
