<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Purchase Order {{ $purchaseOrder->id }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 3px solid #0287ce; padding-bottom: 20px; margin-bottom: 30px; }
        .header-content { display: flex; align-items: center; gap: 16px; }
        .logo-container {
            width: 64px; height: 64px; border-radius: 16px; background: #ffffff;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 2px solid #38bdf8;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        .logo-container img { width: 56px; height: 56px; object-fit: contain; }
        .pharmacy-name { font-size: 24px; font-weight: bold; color: #1e3a8a; }
        .pharmacy-sub { font-size: 13px; color: #4b5563; margin-top: 4px; }
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
        .supplier-message {
            background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
            padding: 24px; margin-top: 20px; font-size: 13px; line-height: 1.6;
        }
        .supplier-message .subject { font-weight: bold; margin-bottom: 16px; }
        .supplier-message .body { margin-bottom: 10px; }
        .supplier-message .closing { margin-top: 20px; }
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
                        <th>Medicine</th>
                        <th>Generic Name</th>
                        <th class="text-right">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($purchaseOrder->items as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->medicine->name ?? 'N/A' }}</td>
                        <td>{{ $item->medicine->generic_name ?? 'N/A' }}</td>
                        <td class="text-right">{{ $item->quantity }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Supplier Message -->
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

        <!-- Footer -->
        <div class="footer">
            <p>This is a computer-generated Purchase Order. No signature is required.</p>
            <p>Generated on: {{ \Carbon\Carbon::now()->format('M d, Y h:i A') }} | EthioPharmacy</p>
        </div>
    </div>
</body>
</html>
