<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== Does migrations table exist? ===\n";
echo Schema::hasTable('migrations') ? "YES\n" : "NO\n";

if (Schema::hasTable('migrations')) {
    echo "\n=== All migrations in DB (ordered) ===\n";
    $all = DB::table('migrations')->orderBy('id')->get();
    foreach ($all as $row) {
        echo "  - {$row->migration} (batch {$row->batch})\n";
    }
}

echo "\n=== Does stocks table exist? ===\n";
echo Schema::hasTable('stocks') ? "YES\n" : "NO\n";

echo "\n=== medicines table columns ===\n";
$columns = DB::select("SHOW COLUMNS FROM medicines");
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}

echo "\n=== batches table columns ===\n";
$columns = DB::select("SHOW COLUMNS FROM batches");
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}
