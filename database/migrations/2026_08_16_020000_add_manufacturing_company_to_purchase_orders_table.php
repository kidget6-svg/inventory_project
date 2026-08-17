<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('purchase_orders') && !Schema::hasColumn('purchase_orders', 'manufacturing_company')) {
            Schema::table('purchase_orders', function (Blueprint $table) {
                $table->string('manufacturing_company', 255)->nullable()->after('supplier_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('purchase_orders') && Schema::hasColumn('purchase_orders', 'manufacturing_company')) {
            Schema::table('purchase_orders', function (Blueprint $table) {
                $table->dropColumn('manufacturing_company');
            });
        }
    }
};
