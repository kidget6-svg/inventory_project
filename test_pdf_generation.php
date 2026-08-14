<?php
// Test PDF generation to find the root cause
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== GD Check ===" . PHP_EOL;
echo "GD loaded: " . (extension_loaded('gd') ? 'YES' : 'NO') . PHP_EOL;
echo "GD info: " . json_encode(gd_info()) . PHP_EOL;

echo PHP_EOL . "=== DomPDF Check ===" . PHP_EOL;
echo "DomPDF class exists: " . (class_exists('Dompdf\Dompdf') ? 'YES' : 'NO') . PHP_EOL;
echo "Barryvdh Pdf facade exists: " . (class_exists('Barryvdh\DomPDF\Facade\Pdf') ? 'YES' : 'NO') . PHP_EOL;

echo PHP_EOL . "=== Database Check ===" . PHP_EOL;
$orders = App\Models\PurchaseOrder::with('supplier', 'items.medicine')->get();
echo "Total orders: " . $orders->count() . PHP_EOL;
foreach ($orders as $o) {
    echo "  ID: {$o->id}, Status: {$o->status}, Supplier: " . ($o->supplier ? $o->supplier->name : 'NULL') . ", Items: {$o->items->count()}" . PHP_EOL;
}

echo PHP_EOL . "=== PDF Generation Test ===" . PHP_EOL;
if ($orders->count() > 0) {
    $order = $orders->first();
    echo "Testing with order ID: {$order->id}" . PHP_EOL;

    try {
        $service = new App\Services\PurchaseOrderService();
        $pdfContent = $service->generatePdf($order);
        echo "PDF generated successfully!" . PHP_EOL;
        echo "PDF content length: " . strlen($pdfContent) . PHP_EOL;
        echo "PDF starts with: " . substr($pdfContent, 0, 20) . PHP_EOL;
        echo "Is valid PDF: " . (strpos($pdfContent, '%PDF') === 0 ? 'YES' : 'NO') . PHP_EOL;
    } catch (\Throwable $e) {
        echo "ERROR: " . $e->getMessage() . PHP_EOL;
        echo "File: " . $e->getFile() . ":" . $e->getLine() . PHP_EOL;
        echo "Trace: " . $e->getTraceAsString() . PHP_EOL;
    }
} else {
    echo "No purchase orders found in database." . PHP_EOL;
}
