<?php
require __DIR__ . '/bootstrap/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/roles', 'GET');
$request->headers->set('Accept', 'application/json');
$response = $kernel->handle($request);
echo $response->getContent();
