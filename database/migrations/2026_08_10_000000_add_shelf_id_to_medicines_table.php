<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            if (! Schema::hasColumn('medicines', 'shelf_id')) {
                $table->unsignedBigInteger('shelf_id')->nullable()->after('supplier_id');
                $table->foreign('shelf_id')->references('id')->on('shelves')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            if (Schema::hasColumn('medicines', 'shelf_id')) {
                $table->dropForeign(['shelf_id']);
                $table->dropColumn('shelf_id');
            }
        });
    }
};
