@component('mail::message')
# Purchase Order {{ $purchaseOrder->id }}

Dear {{ $purchaseOrder->supplier->contact_person ?? $purchaseOrder->supplier->name ?? 'Sir/Madam' }},

Please find attached the Purchase Order **{{ $purchaseOrder->id }}** from {{ config('app.name', 'PharmaSys') }}.

**Order Details:**
- **PO Number:** PO-{{ str_pad($purchaseOrder->id, 6, '0', STR_PAD_LEFT) }}
- **Order Date:** {{ \Carbon\Carbon::parse($purchaseOrder->order_date)->format('M d, Y') }}
- **Supplier:** {{ $purchaseOrder->supplier->name ?? 'N/A' }}
- **Total Amount:** ${{ number_format($purchaseOrder->total_amount, 2) }}
- **Prepared By:** {{ $adminName }}

@if($purchaseOrder->sent_at)
- **Sent At:** {{ \Carbon\Carbon::parse($purchaseOrder->sent_at)->format('M d, Y h:i A') }}
@endif

The purchase order PDF is attached to this email. Please review the order details and confirm receipt at your earliest convenience.

If you have any questions regarding this order, please do not hesitate to contact us.

Thank you for your business!

Best regards,
{{ config('app.name', 'PharmaSys') }} Team
@endcomponent
