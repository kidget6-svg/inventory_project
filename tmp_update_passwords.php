<?php
/**
 * Temp script: update seeded demo users to use Admin@123 password.
 */
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$newPassword = 'Admin@123';
$seededEmails = [
    'admin@pharmacy.com',
    'pharmacist@pharmacy.com',
    'cashier@pharmacy.com',
    'test@pharmacy.com',
];

$Updated = 0;
foreach ($seededEmails as $email) {
    $user = User::where('email', $email)->first();
    if ($user) {
        $user->password = Hash::make($newPassword);
        $user->save();
        echo "  Updated: {$user->email} ({$user->role}, {$user->status})\n";
        $Updated++;
    } else {
        echo "  NOT FOUND: {$email}\n";
    }
}

echo "\nTotal users updated: " . $Updated . "\n";
