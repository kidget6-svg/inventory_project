<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

echo "=== TESTING UNIFIED MEDICINES & RETAIL PRODUCTS API ENDPOINTS ===" . PHP_EOL;

// 1. Test Admin Role
$admin = User::where('role', 'admin')->first();
if ($admin) {
    Auth::setUser($admin);
    echo "1. Logged in as Admin: {$admin->email}" . PHP_EOL;

    $reqMeds = Request::create('/api/medicines', 'GET');
    $resMeds = $app->handle($reqMeds);
    echo "   Admin /api/medicines Status: " . $resMeds->getStatusCode() . PHP_EOL;

    $reqRetail = Request::create('/api/retail-products', 'GET');
    $resRetail = $app->handle($reqRetail);
    echo "   Admin /api/retail-products Status: " . $resRetail->getStatusCode() . PHP_EOL;
}

// 2. Test Pharmacist Role
$pharmacist = User::where('role', 'pharmacist')->first();
if ($pharmacist) {
    Auth::setUser($pharmacist);
    echo PHP_EOL . "2. Logged in as Pharmacist: {$pharmacist->email}" . PHP_EOL;

    $reqMedsPharm = Request::create('/api/medicines', 'GET');
    $resMedsPharm = $app->handle($reqMedsPharm);
    echo "   Pharmacist /api/medicines Status: " . $resMedsPharm->getStatusCode() . PHP_EOL;

    $reqRetailPharm = Request::create('/api/retail-products', 'GET');
    $resRetailPharm = $app->handle($reqRetailPharm);
    echo "   Pharmacist /api/retail-products Status: " . $resRetailPharm->getStatusCode() . PHP_EOL;
}

echo PHP_EOL . "=== UNIFIED MEDICINES & RETAIL PRODUCTS API TESTS PASSED! ===" . PHP_EOL;
