<?php
// database/migrations/2026_08_14_073229_add_missing_medicines_columns.php
//
// This migration restores columns that the live database is missing but
// that the Medicine model and DashboardController depend on.
//
// The original create_medicines_table migration defined quantity,
// reorder_level, expiry_date, status, unit_price, purchase_price and
// selling_price, but those columns are absent from the production
// database.  Additionally, the
// 2026_08_14_073230_update_medicines_table_new_fields migration could not
// run because it uses ->after('quantity') and minimum_stock uses
// ->after('quantity') etc., all of which fail when the quantity column
// does not exist.
//
// By placing THIS migration with a timestamp that sorts *before*
// 2026_08_14_073230_update_medicines_table_new_fields, we guarantee that
// quantity is added first so the later migration's after('quantity')
// clauses succeed.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            // ── Core stock columns (required by DashboardController) ──
            if (! Schema::hasColumn('medicines', 'quantity')) {
                $table->unsignedInteger('quantity')->default(0)->after('supplier_id');
            }

            if (! Schema::hasColumn('medicines', 'reorder_level')) {
                $table->unsignedInteger('reorder_level')->default(10)->after('quantity');
            }

            if (! Schema::hasColumn('medicines', 'expiry_date')) {
                $table->date('expiry_date')->nullable()->after('reorder_level');
            }

            if (! Schema::hasColumn('medicines', 'status')) {
                $table->string('status')->default('active')->after('expiry_date');
            }

            // ── Pricing columns ───────────────────────────────────────
            if (! Schema::hasColumn('medicines', 'unit_price')) {
                $table->decimal('unit_price', 10, 2)->default(0)->after('status');
            }

            if (! Schema::hasColumn('medicines', 'purchase_price')) {
                $table->decimal('purchase_price', 10, 2)->nullable()->after('unit_price');
            }

            if (! Schema::hasColumn('medicines', 'selling_price')) {
                $table->decimal('selling_price', 10, 2)->nullable()->after('purchase_price');
            }

            // ── Extended fields (from update_medicines_table_new_fields) ─
            if (! Schema::hasColumn('medicines', 'serial_number')) {
                $table->string('serial_number')->nullable()->unique()->after('shelf_id');
            }

            if (! Schema::hasColumn('medicines', 'minimum_stock')) {
                $table->integer('minimum_stock')->default(10)->after('quantity');
            }

            if (! Schema::hasColumn('medicines', 'maximum_stock')) {
                $table->integer('maximum_stock')->nullable()->after('minimum_stock');
            }

            if (! Schema::hasColumn('medicines', 'manufactured_date')) {
                $table->date('manufactured_date')->nullable()->after('expiry_date');
            }

            if (! Schema::hasColumn('medicines', 'received_date')) {
                $table->date('received_date')->nullable()->after('manufactured_date');
            }

            if (! Schema::hasColumn('medicines', 'stock_status')) {
                $table->enum('stock_status', ['in_stock', 'low_stock', 'out_of_stock', 'expired'])
                    ->default('in_stock')
                    ->after('status');
            }

            if (! Schema::hasColumn('medicines', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                    ->default('pending')
                    ->after('stock_status');
            }

            // ── Prescription details ────────────────────────────────
            if (! Schema::hasColumn('medicines', 'prescription_details')) {
                $table->text('prescription_details')->nullable()->after('prescription');
            }
        });

        // ── Indexes (guarded against reruns) ────────────────────────
        $indexes = ['quantity', 'reorder_level', 'expiry_date', 'status', 'stock_status', 'approval_status'];

        foreach ($indexes as $col) {
            if (! Schema::hasIndex('medicines', 'medicines_' . $col . '_index')) {
                try {
                    Schema::table('medicines', function (Blueprint $table) use ($col) {
                        $table->index($col);
                    });
                } catch (\Exception $e) {
                    // ignore duplicate-index errors
                }
            }
        }
    }

    public function down(): void
    {
        $columns = [
            'quantity',
            'reorder_level',
            'expiry_date',
            'status',
            'unit_price',
            'purchase_price',
            'selling_price',
            'serial_number',
            'minimum_stock',
            'maximum_stock',
            'manufactured_date',
            'received_date',
            'stock_status',
            'approval_status',
            'prescription_details',
        ];

        // Only include columns that actually exist
        $existing = [];
        foreach ($columns as $col) {
            if (Schema::hasColumn('medicines', $col)) {
                $existing[] = $col;
            }
        }

        if (! empty($existing)) {
            Schema::table('medicines', function (Blueprint $table) use ($existing) {
                $table->dropColumn($existing);
            });
        }
    }
};
