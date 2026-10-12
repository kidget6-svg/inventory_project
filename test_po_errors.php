<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Contracts\Console\Kernel;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Models\PurchaseOrder;
use App\Services\PurchaseOrderService;
use App\Models\User;

echo "=== All Purchase Orders ===\n";
$pos = PurchaseOrder::with('supplier', 'items.medicine')->get();
foreach ($pos as $po) {
    $supName = $po->supplier ? $po->supplier->name : 'NULL';
    $supEmail = $po->supplier ? $po->supplier->email : 'NULL';
    $itemsCount = $po->items ? $po->items->count() : 0;
    echo "ID:{$po->id} status:{$po->status} supplier:{$supName} email:{$supEmail} items:{$itemsCount} total:\${$po->total_amount}\n";
}

echo "\n=== User model check ===\n";
$user = User::first();
if ($user) {
    echo "User ID: {$user->id}\n";
    echo "User name attr: " . var_export($user->name ?? null, true) . "\n";
    echo "User first_name attr: " . var_export($user->first_name ?? null, true) . "\n";
    echo "User has getAuthIdentifier: yes\n";
    echo "User columns: " . implode(',', $user->getAttributes() ? array_keys($user->getAttributes()) : ['none']) . "\n";
}

echo "\n=== Testing generatePdf on each PO ===\n";
$service = new PurchaseOrderService();
foreach ($pos as $po) {
    try {
        $pdf = $service->generatePdf($po);
        echo "PO #{$po->id} ({$po->status}): PDF OK, size=" . strlen($pdf) . "\n";
    } catch (\Throwable $e) {
        echo "PO #{$po->id} ({$po->status}): ERROR " . get_class($e) . ": " . $e->getMessage() . "\n";
        echo "  at " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
}

echo "\n=== Testing canApprove on pending POs ===\n";
foreach ($pos as $po) {
    if ($po->status === 'pending') {
        echo "PO #{$po->id} (pending): canApprove=" . ($po->canApprove() ? 'true' : 'false') . ", canSend="  . ($po->canSend() ? 'true' : 'false') . "\n";
    }
}

echo "\n=== PHP limits ===\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
