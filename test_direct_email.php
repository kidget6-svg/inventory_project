<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PurchaseOrder;
use App\Services\PurchaseOrderService;
use App\Mail\PurchaseOrderMail;
use Illuminate\Support\Facades\Mail;

$po = PurchaseOrder::find(10);
echo "PO ID: " . $po->id . "\n";
echo "PO status: " . $po->status . "\n";
echo "Supplier email: " . $po->supplier->email . "\n";

$pdfContent = app(PurchaseOrderService::class)->generatePdf($po);
echo "PDF content length: " . strlen($pdfContent) . "\n";

$adminName = 'Admin';
try {
    $result = Mail::to($po->supplier->email)->send(new PurchaseOrderMail($po, $pdfContent, $adminName));
    echo "PurchaseOrderMail test result: " . get_class($result) . "\n";
    echo "SUCCESS: PurchaseOrderMail sent without error.\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
