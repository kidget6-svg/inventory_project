<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\Api\DashboardController;

$u = User::first();
if (!$u) { echo "no users\n"; exit; }
echo "user role=" . $u->role . "\n";
echo "isAdmin=" . ($u->isAdmin() ? 'yes':'no') . "\n";

auth()->login($u);
$c = new DashboardController();
try {
    $r = $c->index();
    echo "OK keys: " . implode(',', array_keys($r->getData(true))) . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
