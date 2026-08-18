<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'itemable_type')) {
                $table->string('itemable_type')->nullable()->after('medicine_id');
            }
            if (!Schema::hasColumn('sale_items', 'itemable_id')) {
                $table->unsignedBigInteger('itemable_id')->nullable()->after('itemable_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            if (Schema::hasColumn('sale_items', 'itemable_type')) {
                $table->dropColumn('itemable_type');
            }
            if (Schema::hasColumn('sale_items', 'itemable_id')) {
                $table->dropColumn('itemable_id');
            }
        });
    }
};
