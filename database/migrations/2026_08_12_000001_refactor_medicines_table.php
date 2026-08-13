<?php
// database/migrations/2026_08_12_000001_refactor_medicines_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Refactor the medicines table to match the new domain model.
     *
     * Added columns:   prescription, dosage_form, strength, unit
     * Removed columns: unit_price, purchase_price, selling_price,
     *                  quantity, reorder_level, expiry_date, status, description
     * Constraints:     name → unique, barcode → unique, category_id → foreign key
     */
    public function up(): void
    {
        // ── 1. Add new columns ─────────────────────────────────────
        Schema::table('medicines', function (Blueprint $table) {
            if (! Schema::hasColumn('medicines', 'prescription')) {
                $table->boolean('prescription')->default(false)->after('category_id');
            }
            if (! Schema::hasColumn('medicines', 'dosage_form')) {
                $table->string('dosage_form', 50)->nullable()->after('prescription');
            }
            if (! Schema::hasColumn('medicines', 'strength')) {
                $table->string('strength', 100)->nullable()->after('dosage_form');
            }
            if (! Schema::hasColumn('medicines', 'unit')) {
                $table->string('unit', 50)->nullable()->after('strength');
            }
        });

        // ── 2. Remove unnecessary columns ────────────────────────────
        $existingColumns = Schema::getColumnListing('medicines');
        $columnsToDrop = [
            'unit_price', 'purchase_price', 'selling_price',
            'quantity', 'reorder_level', 'expiry_date', 'status', 'description',
        ];
        $columnsToDropActual = array_filter(
            $columnsToDrop,
            fn ($col) => in_array($col, $existingColumns, true)
        );

        if (! empty($columnsToDropActual)) {
            Schema::table('medicines', function (Blueprint $table) use ($columnsToDropActual) {
                $table->dropColumn($columnsToDropActual);
            });
        }

        // ── 3. Make name unique (drop plain index → unique) ─────────
        // The original migration created a non-unique index named medicines_name_index
        try {
            Schema::table('medicines', function (Blueprint $table) {
                $table->dropIndex('medicines_name_index');
            });
        } catch (\Exception $e) {
            // Index doesn't exist — safe to continue
        }

        if (! Schema::hasIndex('medicines', 'medicines_name_unique')) {
            Schema::table('medicines', function (Blueprint $table) {
                $table->unique('name', 'medicines_name_unique');
            });
        }

        // ── 4. Add foreign key on category_id ───────────────────────
        // Drop the plain index on category_id (if present) then add FK
        try {
            Schema::table('medicines', function (Blueprint $table) {
                $table->dropIndex('medicines_category_id_index');
            });
        } catch (\Exception $e) {
            // Index doesn't exist — safe to continue
        }

        // Use raw SQL to check & add FK to avoid duplicate-key errors on reruns
        $fkExists = DB::select(
            "SELECT COUNT(*) AS cnt FROM information_schema.key_column_usage
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'medicines'
               AND REFERENCED_TABLE_NAME = 'categories'
               AND COLUMN_NAME = 'category_id'"
        )[0]->cnt;

        if (! $fkExists) {
            Schema::table('medicines', function (Blueprint $table) {
                $table->foreign('category_id')
                    ->references('id')
                    ->on('categories')
                    ->cascadeOnUpdate()
                    ->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropUnique('medicines_name_unique');
        });

        // Restore removed columns
        Schema::table('medicines', function (Blueprint $table) {
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->unsignedInteger('quantity')->default(0);
            $table->unsignedInteger('reorder_level')->default(10);
            $table->date('expiry_date')->nullable();
            $table->string('status')->default('active');
            $table->text('description')->nullable();
        });

        // Restore plain index on name
        Schema::table('medicines', function (Blueprint $table) {
            $table->index('name');
        });
    }
};
