<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_movements', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('stock_movements', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('stock_movements', 'completed_by')) {
                $table->unsignedBigInteger('completed_by')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('stock_movements', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('completed_by');
            }
            if (!Schema::hasColumn('stock_movements', 'linked_movement_id')) {
                $table->unsignedBigInteger('linked_movement_id')->nullable()->after('completed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $columns = [
                'approved_by',
                'approved_at',
                'completed_by',
                'completed_at',
                'linked_movement_id',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('stock_movements', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
