<?php

namespace App\Mail;

use App\Models\PurchaseOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PurchaseOrderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PurchaseOrder $purchaseOrder,
        public string $pdfContent,
        public string $adminName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Purchase Order #' . $this->purchaseOrder->id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.purchase-order',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(
                fn () => $this->pdfContent,
                'purchase-order-' . $this->purchaseOrder->id . '.pdf'
            )
            ->withMime('application/pdf'),
        ];
    }
}
