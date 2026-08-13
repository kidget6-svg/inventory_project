<?php
/**
 * End-to-end verification: simulate POST /api/login with admin@pharmacy.com / Admin@123
 */
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Register the route collection so the framework can dispatch
$kernel->bootstrap();

// Build a POST request to /api/login
$request = Request::create('/api/login', 'POST', [
    'email' => 'admin@pharmacy.com',
    'password' => 'Admin@123',
]);
$request->headers->set('Accept', 'application/json');

// Dispatch through the Laravel router
$kernel2 = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel2->handle($request);

echo "HTTP Status: " . $response->getStatusCode() . "\n";
echo "Content-Type: " . $response->headers->get('Content-Type') . "\n";

$body = json_decode($response->getContent(), true);
if ($body === null) {
    echo "Raw body: " . $response->getContent() . "\n";
} else {
    echo "Response body:\n";
    echo json_encode($body, JSON_PRETTY_PRINT) . "\n";

    if ($response->getStatusCode() === 200 && isset($body['access_token'])) {
        echo "\n✅ LOGIN SUCCESS — access_token received!\n";
        echo "  Token type: " . ($body['token_type'] ?? 'N/A') . "\n";
        echo "  User role:  " . ($body['user']['role'] ?? 'N/A') . "\n";
        echo "  User email: " . ($body['user']['email'] ?? 'N/A') . "\n";
        echo "  Permissions: " . (is_array($body['permissions'] ?? $body['user']['permissions'] ?? null)
            ? implode(', ', (array)($body['permissions'] ?? $body['user']['permissions'] ?? []))
            : 'N/A') . "\n";
    } else {
        echo "\n❌ LOGIN FAILED — " . ($body['message'] ?? 'Unknown error') . "\n";
    }
}

$kernel2->terminate($request, $response);
