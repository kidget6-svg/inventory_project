<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            if (!Schema::hasColumn('medicines', 'supplier_id')) {
                $table->unsignedBigInteger('supplier_id')->nullable()->after('category_id');
            }
            if (!Schema::hasColumn('medicines', 'purchase_price')) {
                $table->decimal('purchase_price', 10, 2)->nullable()->after('unit_price');
            }
            if (!Schema::hasColumn('medicines', 'selling_price')) {
                $table->decimal('selling_price', 10, 2)->nullable()->after('purchase_price');
            }
            if (!Schema::hasColumn('medicines', 'status')) {
                $table->string('status')->default('active')->after('expiry_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $columns = ['supplier_id', 'purchase_price', 'selling_price', 'status'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('medicines', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
