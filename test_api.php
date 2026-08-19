<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Contracts\Console\Kernel;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// Test: Login and get a token
use Illuminate\Support\Facades\Http;

echo "=== Testing Login ===\n";
$response = Http::asJson()->post('http://localhost:8000/api/login', [
    'email' => 'admin@pharmacy.com',
    'password' => 'password',
]);

echo "Status: " . $response->status() . "\n";
echo "Body: " . $response->body() . "\n";

if ($response->successful()) {
    $data = $response->json();
    $token = $data['access_token'] ?? null;
    echo "Token: " . ($token ? substr($token, 0, 20) . '...' : 'NULL') . "\n";

    $headers = [
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ];

    // Test 1: Preview PDF
    echo "\n=== Test 1: Preview PDF (PO #2 - approved) ===\n";
    $previewResp = Http::withHeaders($headers)->get('http://localhost:8000/api/purchase-orders/2/preview');
    echo "Status: " . $previewResp->status() . "\n";
    echo "Body: " . $previewResp->body() . "\n";

    // Test 2: Approve (PO #10 - pending)
    echo "\n=== Test 2: Approve (PO #10 - pending) ===\n";
    $approveResp = Http::withHeaders($headers)->post('http://localhost:8000/api/purchase-orders/10/approve');
    echo "Status: " . $approveResp->status() . "\n";
    echo "Body: " . $approveResp->body() . "\n";

    // Test 3: Send PDF (PO #2 - approved)
    echo "\n=== Test 3: Send PDF (PO #2 - approved) ===\n";
    $sendResp = Http::withHeaders($headers)->post('http://localhost:8000/api/purchase-orders/2/send-email');
    echo "Status: " . $sendResp->status() . "\n";
    echo "Body: " . substr($sendResp->body(), 0, 2000) . "\n";
}
