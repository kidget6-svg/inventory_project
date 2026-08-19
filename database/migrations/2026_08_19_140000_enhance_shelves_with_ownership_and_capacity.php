<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('shelves', 'code')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->string('code')->nullable()->after('name');
            });
        }

        if (!Schema::hasColumn('shelves', 'location_type')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->string('location_type')->default('branch')->after('code');
            });
        }

        if (!Schema::hasColumn('shelves', 'product_type')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->string('product_type')->nullable()->after('location_type');
            });
        }

        if (!Schema::hasColumn('shelves', 'warehouse_id')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->unsignedBigInteger('warehouse_id')->nullable()->after('branch_id');
                $table->index('warehouse_id');
            });
        }

        if (!Schema::hasColumn('shelves', 'current_quantity')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->integer('current_quantity')->default(0)->after('capacity');
            });
        }

        // The old global unique constraint on shelf_location prevented shelves that
        // share a name across different product contexts (e.g. a Medicine "Shelf A"
        // and a Retail & OTC "Shelf A" in the same branch). Uniqueness is now enforced
        // per (location_type, branch_id, product_type) at the controller level.
        if (Schema::hasIndex('shelves', 'shelves_shelf_location_unique')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->dropUnique('shelves_shelf_location_unique');
            });
        }

        // Retail products can now be assigned to a real shelf (Retail & OTC context).
        if (Schema::hasTable('retail_products') && !Schema::hasColumn('retail_products', 'shelf_id')) {
            Schema::table('retail_products', function (Blueprint $table) {
                $table->foreignId('shelf_id')->nullable()->after('branch_id')->constrained('shelves')->nullOnDelete();
            });
        }

        // ---- Safe backfill of existing data (no data loss) ----
        // 1. location_type: warehouse when there is no branch, otherwise branch.
        DB::statement("UPDATE shelves SET location_type = CASE WHEN branch_id IS NULL THEN 'warehouse' ELSE 'branch' END WHERE location_type IS NULL OR location_type = ''");

        // 2. product_type: existing shelves were medicine shelves (default).
        DB::statement("UPDATE shelves SET product_type = 'medicine' WHERE product_type IS NULL OR product_type = ''");

        // 3. Generate a stable code for shelves missing one.
        DB::statement("UPDATE shelves SET code = CONCAT('SHL-', id) WHERE code IS NULL OR code = ''");

        // 4. current_quantity: backfill from medicines physically placed on the shelf.
        DB::statement("UPDATE shelves s SET current_quantity = (SELECT COALESCE(SUM(quantity), 0) FROM medicines m WHERE m.shelf_id = s.id) WHERE current_quantity IS NULL");
        DB::statement("UPDATE shelves SET current_quantity = 0 WHERE current_quantity IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('retail_products', 'shelf_id')) {
            Schema::table('retail_products', function (Blueprint $table) {
                $table->dropForeign(['shelf_id']);
                $table->dropColumn('shelf_id');
            });
        }

        Schema::table('shelves', function (Blueprint $table) {
            $table->dropIndex(['warehouse_id']);
            $table->dropColumn(['code', 'location_type', 'product_type', 'warehouse_id', 'current_quantity']);
        });
    }
};
