<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Purchase Order {{ $purchaseOrder->id }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 3px solid #0287ce; padding-bottom: 20px; margin-bottom: 30px; }
        .pharmacy-name { font-size: 24px; font-weight: bold; color: #0287ce; }
        .pharmacy-sub { font-size: 13px; color: #666; margin-top: 4px; }
        .po-title { font-size: 20px; font-weight: bold; color: #333; margin: 20px 0; }
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
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .badge-sent { background-color: #fef3c7; color: #92400e; }
        .text-muted { color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="pharmacy-name">{{ config('app.name', 'PharmaSys') }}</div>
            <div class="pharmacy-sub">Pharmacy Inventory Management System</div>
        </div>

        <!-- PO Title -->
        <div class="po-title">
            Purchase Order {{ $purchaseOrder->id }}
            <span class="badge badge-sent">{{ ucfirst($purchaseOrder->status) }}</span>
        </div>

        <!-- Supplier & Order Info -->
        <div class="section">
            <div class="section-title">Supplier Details</div>
            <table class="info-table">
                <tr>
                    <td class="label">Supplier Name:</td>
                    <td>{{ $purchaseOrder->supplier->name ?? 'N/A' }}</td>
                    <td class="label">Order Date:</td>
                    <td>{{ \Carbon\Carbon::parse($purchaseOrder->order_date)->format('M d, Y') }}</td>
                </tr>
                <tr>
                    <td class="label">Contact Person:</td>
                    <td>{{ $purchaseOrder->supplier->contact_person ?? 'N/A' }}</td>
                    <td class="label">PO Number:</td>
                    <td>PO-{{ str_pad($purchaseOrder->id, 6, '0', STR_PAD_LEFT) }}</td>
                </tr>
                <tr>
                    <td class="label">Phone:</td>
                    <td>{{ $purchaseOrder->supplier->phone ?? 'N/A' }}</td>
                    <td class="label">Email:</td>
                    <td>{{ $purchaseOrder->supplier->email ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Address:</td>
                    <td>{{ $purchaseOrder->supplier->address ?? 'N/A' }}</td>
                    <td class="label">Prepared By:</td>
                    <td>{{ $adminName }}</td>
                </tr>
                <tr>
                    <td class="label">Sent At:</td>
                    <td>{{ $purchaseOrder->sent_at ? \Carbon\Carbon::parse($purchaseOrder->sent_at)->format('M d, Y h:i A') : 'Not sent yet' }}</td>
                    <td class="label">Delivered At:</td>
                    <td>{{ $purchaseOrder->delivered_at ? \Carbon\Carbon::parse($purchaseOrder->delivered_at)->format('M d, Y h:i A') : 'Not delivered yet' }}</td>
                </tr>
                <tr>
                    <td class="label">Completed At:</td>
                    <td>{{ $purchaseOrder->completed_at ? \Carbon\Carbon::parse($purchaseOrder->completed_at)->format('M d, Y h:i A') : 'Not completed yet' }}</td>
                    <td class="label">PO Number:</td>
                    <td>PO-{{ str_pad($purchaseOrder->id, 6, '0', STR_PAD_LEFT) }}</td>
                </tr>
            </table>
        </div>

        <!-- Items Table -->
        <div class="section">
            <div class="section-title">Order Items</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Medicine</th>
                        <th>Generic Name</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($purchaseOrder->items as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->medicine->name ?? 'N/A' }}</td>
                        <td>{{ $item->medicine->generic_name ?? 'N/A' }}</td>
                        <td class="text-right">{{ $item->quantity }}</td>
                        <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                        <td class="text-right">${{ number_format($item->subtotal, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="5" class="text-right">Total Amount:</td>
                        <td class="text-right">${{ number_format($purchaseOrder->total_amount, 2) }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is a computer-generated Purchase Order. No signature is required.</p>
            <p>Generated on: {{ \Carbon\Carbon::now()->format('M d, Y h:i A') }} | Pharmacy: {{ config('app.name', 'PharmaSys') }}</p>
        </div>
    </div>
</body>
</html>
