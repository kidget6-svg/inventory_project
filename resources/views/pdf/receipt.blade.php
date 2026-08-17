<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt {{ $sale->receipt_number }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 3px solid #0287ce; padding-bottom: 20px; margin-bottom: 30px; }
        .pharmacy-name { font-size: 24px; font-weight: bold; color: #0287ce; }
        .pharmacy-sub { font-size: 13px; color: #666; margin-top: 4px; }
        .receipt-title { font-size: 20px; font-weight: bold; color: #333; margin: 20px 0; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: bold; color: #0287ce; margin-bottom: 8px; text-transform: uppercase; }
        .info-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .info-table td { padding: 4px 8px; vertical-align: top; }
        .info-table .label { font-weight: bold; color: #555; width: 140px; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .items-table th { background-color: #e6f0fa; color: #0287ce; padding: 8px 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        .items-table td { padding: 8px 10px; border: 1px solid #ddd; vertical-align: top; }
        .items-table .text-right { text-align: right; }
        .total-row { font-weight: bold; background-color: #f0f8ff; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center; }
        .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
        .thank-you { text-align: center; font-size: 16px; font-weight: bold; color: #0287ce; margin: 20px 0; }
        .print-instructions { text-align: center; padding: 15px; background: #f0f8ff; border: 1px solid #0287ce; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #333; }
        .print-instructions strong { color: #0287ce; }
        @media print {
            body { background: #fff !important; color: #000 !important; }
            .no-print { display: none !important; }
            .print-instructions { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="pharmacy-name">{{ config('app.name', 'PharmaSys') }}</div>
            <div class="pharmacy-sub">Pharmacy Inventory Management System</div>
        </div>

        <!-- Receipt Title -->
        <div class="receipt-title">
            Receipt
            <span style="font-size: 12px; color: #999; font-weight: normal;">#{{ $sale->receipt_number }}</span>
        </div>

        <!-- Sale Info -->
        <div class="section">
            <div class="section-title">Sale Information</div>
            <table class="info-table">
                <tr>
                    <td class="label">Receipt Number:</td>
                    <td>{{ $sale->receipt_number ?? 'N/A' }}</td>
                    <td class="label">Date:</td>
                    <td>{{ \Carbon\Carbon::parse($sale->sale_date)->format('M d, Y h:i A') }}</td>
                </tr>
                <tr>
                    <td class="label">Cashier:</td>
                    <td>{{ $cashierName }}</td>
                    <td class="label">Customer:</td>
                    <td>{{ $sale->customer_name ?? 'Walk-in Customer' }}</td>
                </tr>
                <tr>
                    <td class="label">Customer Phone:</td>
                    <td>{{ $sale->customer_phone ?? 'N/A' }}</td>
                    <td class="label">Sale Type:</td>
                    <td>{{ ucfirst($sale->type ?? 'prescription') }}</td>
                </tr>
                @if($sale->notes)
                <tr>
                    <td class="label">Prescription Notes:</td>
                    <td>{{ $sale->notes }}</td>
                    <td></td>
                    <td></td>
                </tr>
                @endif
            </table>
        </div>

        <!-- Items Table -->
        <div class="section">
            <div class="section-title">Items Sold</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($sale->items as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->itemable->name ?? 'N/A' }}</td>
                        <td class="text-right">{{ $item->quantity }}</td>
                        <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                        <td class="text-right">${{ number_format($item->subtotal, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="4" class="text-right">Total Amount:</td>
                        <td class="text-right">${{ number_format($sale->total_amount, 2) }}</td>
                    </tr>
                    @if($sale->discount > 0)
                    <tr>
                        <td colspan="4" class="text-right">Discount:</td>
                        <td class="text-right">-${{ number_format($sale->discount, 2) }}</td>
                    </tr>
                    @endif
                    @if($sale->tax > 0)
                    <tr>
                        <td colspan="4" class="text-right">Tax:</td>
                        <td class="text-right">${{ number_format($sale->tax, 2) }}</td>
                    </tr>
                    @endif
                    <tr class="total-row">
                        <td colspan="4" class="text-right">Net Amount:</td>
                        <td class="text-right">${{ number_format($sale->net_amount > 0 ? $sale->net_amount : $sale->total_amount, 2) }}</td>
                    </tr>
                    <tr>
                        <td colspan="4" class="text-right">Payment Method:</td>
                        <td class="text-right">{{ $sale->payment_method_label }}</td>
                    </tr>
                    <tr>
                        <td colspan="4" class="text-right">Amount Paid:</td>
                        <td class="text-right">${{ number_format($sale->amount_paid, 2) }}</td>
                    </tr>
                    @if($sale->change_amount > 0)
                    <tr>
                        <td colspan="4" class="text-right">Change Returned:</td>
                        <td class="text-right">${{ number_format($sale->change_amount, 2) }}</td>
                    </tr>
                    @endif
                </tfoot>
            </table>
        </div>

        <!-- Thank You -->
        <div class="divider"></div>
        <div class="thank-you">Thank you for shopping with us.</div>
        <div class="divider"></div>

        <!-- Print Instructions (visible on screen, hidden when printing) -->
        <div class="print-instructions no-print">
            <strong>Print Receipt</strong><br>
            The print dialog should open automatically. If it doesn't, press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) or use your browser's print function.
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is a computer-generated receipt. No signature is required.</p>
            <p>Generated on: {{ \Carbon\Carbon::now()->format('M d, Y h:i A') }} | Pharmacy: {{ config('app.name', 'PharmaSys') }}</p>
        </div>
    </div>
</body>
</html>
