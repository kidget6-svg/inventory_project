<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Sale;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

echo "=== TESTING CASHIER PRESCRIPTION & RETAIL CHECKOUT BUTTONS ===" . PHP_EOL;

$cashier = User::where('role', 'cashier')->first();
if (!$cashier) {
    echo "ERROR: Cashier user not found!" . PHP_EOL;
    exit(1);
}
Auth::login($cashier);
echo "Logged in as Cashier: {$cashier->email}" . PHP_EOL;

// 1. Test Prescription Sale
$med = Medicine::first();
$prescSale = Sale::create([
    'user_id' => $cashier->id,
    'sale_date' => now(),
    'type' => 'prescription',
    'status' => 'completed',
    'total_amount' => 35.00,
    'net_amount' => 35.00,
    'payment_method' => 'cash',
    'amount_paid' => 40.00,
    'change_amount' => 5.00,
    'payment_status' => 'paid',
    'receipt_number' => Sale::generateReceiptNumber(),
    'customer_name' => 'John Patient',
]);
if ($med) {
    $prescSale->items()->create([
        'medicine_id' => $med->id,
        'itemable_id' => $med->id,
        'itemable_type' => Medicine::class,
        'quantity' => 1,
        'unit_price' => 35.00,
        'subtotal' => 35.00,
    ]);
}

echo "Created Prescription Sale ID {$prescSale->id} (Receipt: {$prescSale->receipt_number})" . PHP_EOL;

// Test Prescription PDF
$reqPrescPdf = Request::create("/api/sales/{$prescSale->id}/receipt/pdf", 'GET');
$resPrescPdf = $app->handle($reqPrescPdf);
echo "Prescription PDF Status: " . $resPrescPdf->getStatusCode() . " | Content-Type: " . $resPrescPdf->headers->get('Content-Type') . PHP_EOL;
if ($resPrescPdf->getStatusCode() !== 200 || strpos($resPrescPdf->headers->get('Content-Type'), 'application/pdf') === false) {
    echo "ERROR: Prescription PDF download failed!" . PHP_EOL;
    exit(1);
}

// Test Prescription Print
$reqPrescPrint = Request::create("/api/sales/{$prescSale->id}/receipt/print", 'GET');
$resPrescPrint = $app->handle($reqPrescPrint);
echo "Prescription Print Status: " . $resPrescPrint->getStatusCode() . " | Content-Type: " . $resPrescPrint->headers->get('Content-Type') . PHP_EOL;
if ($resPrescPrint->getStatusCode() !== 200) {
    echo "ERROR: Prescription Print failed!" . PHP_EOL;
    exit(1);
}

// 2. Test Retail Sale
$prod = RetailProduct::first();
$retailSale = Sale::create([
    'user_id' => $cashier->id,
    'sale_date' => now(),
    'type' => 'retail',
    'status' => 'completed',
    'total_amount' => 25.00,
    'net_amount' => 25.00,
    'payment_method' => 'telebirr',
    'amount_paid' => 25.00,
    'change_amount' => 0.00,
    'payment_status' => 'paid',
    'receipt_number' => Sale::generateReceiptNumber(),
    'customer_name' => 'Sarah Customer',
]);
if ($prod) {
    $retailSale->items()->create([
        'medicine_id' => null,
        'itemable_id' => $prod->id,
        'itemable_type' => RetailProduct::class,
        'quantity' => 2,
        'unit_price' => 12.50,
        'subtotal' => 25.00,
    ]);
}

echo PHP_EOL . "Created Retail Sale ID {$retailSale->id} (Receipt: {$retailSale->receipt_number})" . PHP_EOL;

// Test Retail PDF
$reqRetailPdf = Request::create("/api/sales/{$retailSale->id}/receipt/pdf", 'GET');
$resRetailPdf = $app->handle($reqRetailPdf);
echo "Retail PDF Status: " . $resRetailPdf->getStatusCode() . " | Content-Type: " . $resRetailPdf->headers->get('Content-Type') . PHP_EOL;
if ($resRetailPdf->getStatusCode() !== 200 || strpos($resRetailPdf->headers->get('Content-Type'), 'application/pdf') === false) {
    echo "ERROR: Retail PDF download failed!" . PHP_EOL;
    exit(1);
}

// Test Retail Print
$reqRetailPrint = Request::create("/api/sales/{$retailSale->id}/receipt/print", 'GET');
$resRetailPrint = $app->handle($reqRetailPrint);
echo "Retail Print Status: " . $resRetailPrint->getStatusCode() . " | Content-Type: " . $resRetailPrint->headers->get('Content-Type') . PHP_EOL;
if ($resRetailPrint->getStatusCode() !== 200) {
    echo "ERROR: Retail Print failed!" . PHP_EOL;
    exit(1);
}

echo PHP_EOL . "=== BOTH PRESCRIPTION AND RETAIL CHECKOUT BUTTON TESTS PASSED SUCCESSFULLY! ===" . PHP_EOL;
