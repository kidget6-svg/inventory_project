<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'admin@pharmacy.com')->first();

if (!$user) {
    echo "RESULT: admin user NOT FOUND in database\n";
    exit;
}

echo "RESULT: admin user FOUND\n";
echo "  id:     " . $user->id . "\n";
echo "  name:   " . $user->name . "\n";
echo "  email:  " . $user->email . "\n";
echo "  role:   " . $user->role . "\n";
echo "  status: " . $user->status . "\n";
echo "  hash:   " . substr($user->password, 0, 30) . "...\n";

echo "\nChecking password combinations:\n";
$checks = ['password', 'Admin@123', 'admin@123', 'Admin@1234'];
foreach ($checks as $candidate) {
    $match = Hash::check($candidate, $user->password);
    echo "  Hash::check('$candidate') => " . ($match ? 'MATCH' : 'no match') . "\n";
}
