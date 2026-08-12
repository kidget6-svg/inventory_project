<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->make(Illuminate\Contracts\Console\Kernel::class);

$user = new App\Models\User();
$user->id = 1;
Illuminate\Support\Facades\Auth::login($user);

$request = Illuminate\Http\Request::create('/api/dashboard', 'GET');
$response = $kernel->handle($request);
echo $response->getStatusCode() . PHP_EOL;
echo substr($response->getContent(), 0, 300) . PHP_EOL;
$kernel->terminate($request, $response);
