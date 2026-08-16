<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('batches') && !Schema::hasColumn('batches', 'shelf_id')) {
            Schema::table('batches', function (Blueprint $table) {
                $table->foreignId('shelf_id')->nullable()->after('medicine_id')->constrained('shelves')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('batches') && Schema::hasColumn('batches', 'shelf_id')) {
            Schema::table('batches', function (Blueprint $table) {
                $table->dropForeign(['shelf_id']);
                $table->dropColumn('shelf_id');
            });
        }
    }
};
