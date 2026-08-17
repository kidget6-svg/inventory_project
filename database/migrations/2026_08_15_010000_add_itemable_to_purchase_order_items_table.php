<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            // Drop the foreign key constraint so medicine_id can be nullable
            $table->dropForeign(['medicine_id']);
            $table->unsignedBigInteger('medicine_id')->nullable()->change();
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_order_items', 'itemable_type')) {
                $table->string('itemable_type')->nullable()->after('medicine_id');
            }
            if (!Schema::hasColumn('purchase_order_items', 'itemable_id')) {
                $table->unsignedBigInteger('itemable_id')->nullable()->after('itemable_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            if (Schema::hasColumn('purchase_order_items', 'itemable_type')) {
                $table->dropColumn('itemable_type');
            }
            if (Schema::hasColumn('purchase_order_items', 'itemable_id')) {
                $table->dropColumn('itemable_id');
            }
        });
    }
};
