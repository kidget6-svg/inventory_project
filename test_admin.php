<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

echo "=== TESTING CASHIER SALES HISTORY PAGE & ENDPOINTS ===" . PHP_EOL;

$cashier = User::where('role', 'cashier')->first();
if (!$cashier) {
    echo "ERROR: Cashier user not found!" . PHP_EOL;
    exit(1);
}
Auth::setUser($cashier);
echo "Logged in as Cashier: {$cashier->email} (User ID: {$cashier->id})" . PHP_EOL;

// 1. Fetch Sales History for Cashier
$reqHistory = Request::create('/api/sales/history', 'GET');
$resHistory = $app->handle($reqHistory);

echo "Sales History Response Status: " . $resHistory->getStatusCode() . PHP_EOL;
if ($resHistory->getStatusCode() !== 200) {
    echo "ERROR: Cashier sales history request failed!" . PHP_EOL;
    exit(1);
}

$historyData = json_decode($resHistory->getContent(), true);
$sales = $historyData['data'] ?? [];
echo "Total Sales Returned for Cashier: " . count($sales) . PHP_EOL;

foreach ($sales as $s) {
    if ((int)$s['user_id'] !== (int)$cashier->id) {
        echo "ERROR: Returned sale ID {$s['id']} belongs to user_id {$s['user_id']}, not cashier ID {$cashier->id}!" . PHP_EOL;
        exit(1);
    }
}
echo "✓ All returned sales belong strictly to logged-in Cashier ID {$cashier->id}!" . PHP_EOL;

if (count($sales) > 0) {
    $saleId = $sales[0]['id'];
    echo PHP_EOL . "Testing actions on Sale ID {$saleId}:" . PHP_EOL;

    // View Receipt
    $reqView = Request::create("/api/sales/{$saleId}/receipt", 'GET');
    $resView = $app->handle($reqView);
    echo "  - View Receipt Status: " . $resView->getStatusCode() . PHP_EOL;

    // Download PDF
    $reqPdf = Request::create("/api/sales/{$saleId}/receipt/pdf", 'GET');
    $resPdf = $app->handle($reqPdf);
    echo "  - Download PDF Status: " . $resPdf->getStatusCode() . " | Content-Type: " . $resPdf->headers->get('Content-Type') . PHP_EOL;

    // Print Receipt
    $reqPrint = Request::create("/api/sales/{$saleId}/receipt/print", 'GET');
    $resPrint = $app->handle($reqPrint);
    echo "  - Print Receipt Status: " . $resPrint->getStatusCode() . " | Content-Type: " . $resPrint->headers->get('Content-Type') . PHP_EOL;

    if ($resView->getStatusCode() === 200 && $resPdf->getStatusCode() === 200 && $resPrint->getStatusCode() === 200) {
        echo PHP_EOL . "=== CASHIER SALES HISTORY ENDPOINT TESTS PASSED SUCCESSFULLY! ===" . PHP_EOL;
    } else {
        echo "ERROR: Action endpoints failed!" . PHP_EOL;
        exit(1);
    }
} else {
    echo PHP_EOL . "=== CASHIER SALES HISTORY ROUTE TEST PASSED (No sales records yet) ===" . PHP_EOL;
}
