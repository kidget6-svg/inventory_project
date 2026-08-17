<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Purchase Order {{ $purchaseOrder->id }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 18px; }
        .header { border-bottom: 2px solid #0287ce; padding-bottom: 12px; margin-bottom: 14px; }
        .header-content { display: flex; align-items: center; gap: 12px; }
        .logo-container {
            width: 48px; height: 48px; border-radius: 12px; background: #ffffff;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #38bdf8;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        .logo-container img { width: 40px; height: 40px; object-fit: contain; }
        .pharmacy-name { font-size: 20px; font-weight: bold; color: #1e3a8a; }
        .pharmacy-sub { font-size: 12px; color: #4b5563; margin-top: 2px; }
        .po-title { font-size: 17px; font-weight: bold; color: #333; margin: 14px 0 6px; }
        .section { margin-bottom: 12px; }
        .section-title { font-size: 12px; font-weight: bold; color: #0287ce; margin-bottom: 5px; text-transform: uppercase; }
        .info-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .info-table td { padding: 3px 6px; vertical-align: top; }
        .info-table .label { font-weight: bold; color: #555; width: 125px; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
        .items-table th { background-color: #e6f0fa; color: #0287ce; padding: 5px 8px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        .items-table td { padding: 5px 8px; border: 1px solid #ddd; vertical-align: top; }
        .items-table .text-right { text-align: right; }
        /* Plain supplier message — no border, card, or shaded background */
        .supplier-message { font-size: 11px; line-height: 1.5; color: #333; }
        .supplier-message .subject { font-weight: bold; margin-bottom: 8px; }
        .supplier-message .body { margin-bottom: 5px; }
        .supplier-message .closing { margin-top: 10px; }
        .footer { margin-top: 14px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #777; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-sent { background-color: #fef3c7; color: #92400e; }
        .text-muted { color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo-container">
                    <img src="{{ public_path('images/p1.png') }}" alt="EthioPharmacy" />
                </div>
                <div>
                    <div class="pharmacy-name">EthioPharmacy</div>
                    <div class="pharmacy-sub">Smart Pharmacy Inventory System</div>
                </div>
            </div>
        </div>

        <!-- PO Title -->
        <div class="po-title">
            Purchase Order PO-{{ str_pad($purchaseOrder->id, 6, '0', STR_PAD_LEFT) }}
            <span class="badge badge-sent">{{ ucfirst($purchaseOrder->status) }}</span>
        </div>

        <!-- Subject & Professional Supplier Message (plain text, no box) -->
        <div class="section">
            <div class="supplier-message">
                <div class="subject">Subject: Purchase Order Request – PO-{{ str_pad($purchaseOrder->id, 6, '0', STR_PAD_LEFT) }}</div>
                <div class="body">Dear {{ $purchaseOrder->supplier->name ?? 'Supplier' }},</div>
                <div class="body">We would like to request the medicines listed in the purchase order above. Kindly review the requested quantities and confirm their availability and expected delivery date.</div>
                <div class="body">Please let us know if any of the requested medicines are unavailable or require an alternative arrangement.</div>
                <div class="body">Thank you for your cooperation and continued partnership.</div>
                <div class="closing">
                    Best regards,<br>
                    EthioPharmacy Team<br>
                    Smart Pharmacy Inventory System
                </div>
            </div>
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
                    <td>{{ $purchaseOrder->sentAtDisplay() }}</td>
                    <td class="label">Delivered At:</td>
                    <td>{{ $purchaseOrder->deliveredAtDisplay() }}</td>
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
                        <th>Product</th>
                        <th>Type</th>
                        <th class="text-right">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($purchaseOrder->items as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->itemable?->name ?? $item->medicine?->name ?? 'N/A' }}</td>
                        <td>{{ $item->itemable instanceof \App\Models\RetailProduct ? 'Retail/OTC' : 'Medicine' }}</td>
                        <td class="text-right">{{ $item->quantity }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is a computer-generated Purchase Order. No signature is required.</p>
            <p>Generated on: {{ \Carbon\Carbon::now()->format('M d, Y h:i A') }} | EthioPharmacy</p>
        </div>
    </div>
</body>
</html>
