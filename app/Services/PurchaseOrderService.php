<?php

namespace App\Services;

use App\Mail\PurchaseOrderMail;
use App\Models\PurchaseOrder;
use Barryvdh\DomPDF\Facade\Pdf as DomPDF;
use Illuminate\Support\Facades\Mail;

class PurchaseOrderService
{
    /**
     * Generate a professional Purchase Order PDF.
     */
    public function generatePdf(PurchaseOrder $purchaseOrder): string
    {
        $purchaseOrder->load('supplier', 'items.medicine', 'items.itemable');

        $adminName = auth()->check()
            ? (auth()->user()->first_name
                ? auth()->user()->first_name . ' ' . (auth()->user()->last_name ?? '')
                : (auth()->user()->name ?? 'Admin'))
            : 'Admin';

        $html = view('pdf.purchase-order', compact('purchaseOrder', 'adminName'))->render();

        return DomPDF::loadHTML($html)->setPaper('a4', 'portrait')->output();
    }

    /**
     * Send the Purchase Order PDF to the supplier via email.
     *
     * After the email is successfully handed off to the mail driver,
     * the sent_at timestamp is recorded so that every email-sending
     * action (send, resend, send-email) captures the exact moment
     * the purchase order email was dispatched.
     */
    public function sendToSupplier(PurchaseOrder $purchaseOrder): void
    {
        if (! $purchaseOrder->supplier || ! $purchaseOrder->supplier->email) {
            throw new \RuntimeException('Supplier does not have an email address.');
        }

        $purchaseOrder->forceFill(['sent_at' => now()])->save();

        $pdfContent = $this->generatePdf($purchaseOrder);

        $adminName = auth()->check()
            ? (auth()->user()->first_name
                ? auth()->user()->first_name . ' ' . (auth()->user()->last_name ?? '')
                : (auth()->user()->name ?? 'Admin'))
            : 'Admin';

        Mail::to($purchaseOrder->supplier->email)
            ->send(new PurchaseOrderMail($purchaseOrder, $pdfContent, $adminName));
    }
}
