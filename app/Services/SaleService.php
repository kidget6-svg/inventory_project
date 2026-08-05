<?php
// app/Services/SaleService.php

namespace App\Services;

use App\Models\Sale;
use Barryvdh\DomPDF\Facade\Pdf as DomPDF;

class SaleService
{
    /**
     * Generate a professional Sale Receipt PDF.
     */
    public function generatePdf(Sale $sale): string
    {
        $sale->load('items.itemable', 'user');

        $cashierName = $sale->cashier_name;

        $html = view('pdf.receipt', compact('sale', 'cashierName'))->render();

        return DomPDF::loadHTML($html)->setPaper('a4', 'portrait')->output();
    }

    /**
     * Calculate the change amount for a cash payment.
     * For non-cash payments, change is always 0.
     */
    public function calculateChange(float $total, float $amountPaid, string $paymentMethod): float
    {
        if ($paymentMethod !== Sale::PAYMENT_CASH) {
            return 0.0;
        }

        $change = $amountPaid - $total;

        return $change >= 0 ? round($change, 2) : 0.0;
    }

    /**
     * Generate a unique receipt number.
     * Format: RCPT-YYYYMMDD-XXXXX
     */
    public function generateReceiptNumber(): string
    {
        return Sale::generateReceiptNumber();
    }
}
