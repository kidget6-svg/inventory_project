<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Run the migration manually
echo "=== Running migration ===\n";

try {
    // Add columns that don't exist
    $actions = [];

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'quantity'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN quantity INT UNSIGNED NOT NULL DEFAULT 0 AFTER supplier_id');
        $actions[] = "added quantity";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'reorder_level'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN reorder_level INT UNSIGNED NOT NULL DEFAULT 10 AFTER quantity');
        $actions[] = "added reorder_level";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'expiry_date'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN expiry_date DATE NULL AFTER reorder_level');
        $actions[] = "added expiry_date";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'status'")) {
        DB::statement("ALTER TABLE medicines ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'active' AFTER expiry_date");
        $actions[] = "added status";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'unit_price'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER status');
        $actions[] = "added unit_price";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'purchase_price'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN purchase_price DECIMAL(10,2) NULL AFTER unit_price');
        $actions[] = "added purchase_price";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'selling_price'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN selling_price DECIMAL(10,2) NULL AFTER purchase_price');
        $actions[] = "added selling_price";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'serial_number'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN serial_number VARCHAR(255) NULL UNIQUE AFTER shelf_id');
        $actions[] = "added serial_number";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'minimum_stock'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN minimum_stock INT NOT NULL DEFAULT 10 AFTER quantity');
        $actions[] = "added minimum_stock";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'maximum_stock'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN maximum_stock INT NULL AFTER minimum_stock');
        $actions[] = "added maximum_stock";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'manufactured_date'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN manufactured_date DATE NULL AFTER expiry_date');
        $actions[] = "added manufactured_date";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'received_date'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN received_date DATE NULL AFTER manufactured_date');
        $actions[] = "added received_date";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'stock_status'")) {
        DB::statement("ALTER TABLE medicines ADD COLUMN stock_status ENUM('in_stock','low_stock','out_of_stock','expired') NOT NULL DEFAULT 'in_stock' AFTER status");
        $actions[] = "added stock_status";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'approval_status'")) {
        DB::statement("ALTER TABLE medicines ADD COLUMN approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER stock_status");
        $actions[] = "added approval_status";
    }

    if (! DB::select("SHOW COLUMNS FROM medicines WHERE Field = 'prescription_details'")) {
        DB::statement('ALTER TABLE medicines ADD COLUMN prescription_details TEXT NULL AFTER prescription');
        $actions[] = "added prescription_details";
    }

    echo implode("\n", $actions) . "\n";

    echo "\n=== Updated medicines table columns ===\n";
    $columns = DB::select("SHOW COLUMNS FROM medicines");
    foreach ($columns as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }

    // Mark migration as run
    $exists = DB::table('migrations')->where('migration', '2026_08_14_073229_add_missing_medicines_columns')->exists();
    if (!$exists) {
        DB::table('migrations')->insert(['migration' => '2026_08_14_073229_add_missing_medicines_columns', 'batch' => 1]);
        echo "\nMarked migration as run in migrations table.\n";
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
