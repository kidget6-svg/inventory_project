<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Add missing columns (guarded) ──────────────────────────
        Schema::table('medicines', function (Blueprint $table) {
            // Add new fields if missing
            if (!Schema::hasColumn('medicines', 'dosage_form')) {
                $table->string('dosage_form')->nullable()->after('generic_name');
            }

            if (!Schema::hasColumn('medicines', 'strength')) {
                $table->string('strength')->nullable()->after('dosage_form');
            }


            if (!Schema::hasColumn('medicines', 'serial_number')) {
                $table->string('serial_number')->nullable()->unique()->after('batch_number');
            }

            if (!Schema::hasColumn('medicines', 'minimum_stock')) {
                $table->integer('minimum_stock')->default(10)->after('quantity');
            }

            if (!Schema::hasColumn('medicines', 'maximum_stock')) {
                $table->integer('maximum_stock')->nullable()->after('minimum_stock');
            }

            if (!Schema::hasColumn('medicines', 'manufactured_date')) {
                $table->date('manufactured_date')->nullable()->after('expiry_date');
            }

            if (!Schema::hasColumn('medicines', 'received_date')) {
                $table->date('received_date')->nullable()->after('manufactured_date');
            }

            if (!Schema::hasColumn('medicines', 'stock_status')) {
                $table->enum('stock_status', ['in_stock', 'low_stock', 'out_of_stock', 'expired'])
                      ->default('in_stock')->after('status');
            }

            if (!Schema::hasColumn('medicines', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                      ->default('pending')->after('stock_status');
            }

            // Rename description to prescription
            if (Schema::hasColumn('medicines', 'description') && !Schema::hasColumn('medicines', 'prescription')) {
                $table->renameColumn('description', 'prescription');
            }
        });

        // ── Add indexes as SEPARATE statements.
        //    Each is guarded by Schema::hasIndex so re-runs are safe.
        //    They MUST be outside the closure above because indexes inside
        //    a single Schema::table closure are batched into one ALTER TABLE;
        //    a try/catch around $table->index() cannot catch the SQL error.
        // ─────────────────────────────────────────────────────────
        foreach (['stock_status', 'approval_status', 'serial_number'] as $col) {
            $indexName = 'medicines_' . $col . '_index';
            if (!Schema::hasIndex('medicines', $indexName)) {
                try {
                    Schema::table('medicines', function (Blueprint $table) use ($col) {
                        $table->index($col);
                    });
                } catch (\Exception $e) {
                    // Index may already exist or column might be missing — safe to skip
                }
            }
        }
    }

    public function down(): void
    {
        // Drop indexes first (separate statements, guarded)
        foreach (['stock_status', 'approval_status', 'serial_number'] as $col) {
            $indexName = 'medicines_' . $col . '_index';
            if (Schema::hasIndex('medicines', $indexName)) {
                try {
                    Schema::table('medicines', function (Blueprint $table) use ($col) {
                        $table->dropIndex([$col]);
                    });
                } catch (\Exception $e) {}
            }
        }

        // Drop columns that may exist
        $cols = [];
        foreach (['dosage_form', 'strength', 'unit', 'serial_number', 'minimum_stock',
                  'maximum_stock', 'manufactured_date', 'received_date',
                  'stock_status', 'approval_status'] as $col) {
            if (Schema::hasColumn('medicines', $col)) {
                $cols[] = $col;
            }
        }
        if (!empty($cols)) {
            Schema::table('medicines', function (Blueprint $table) use ($cols) {
                $table->dropColumn($cols);
            });
        }

        // Rename back
        if (Schema::hasColumn('medicines', 'prescription') && !Schema::hasColumn('medicines', 'description')) {
            Schema::table('medicines', function (Blueprint $table) {
                $table->renameColumn('prescription', 'description');
            });
        }
    }
};
