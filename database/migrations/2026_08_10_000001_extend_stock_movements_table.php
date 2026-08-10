<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_movements', 'before_quantity')) {
                $table->integer('before_quantity')->default(0)->after('quantity');
            }
            if (!Schema::hasColumn('stock_movements', 'after_quantity')) {
                $table->integer('after_quantity')->default(0)->after('before_quantity');
            }
            if (!Schema::hasColumn('stock_movements', 'source_type')) {
                $table->string('source_type')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('stock_movements', 'source_id')) {
                $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            }
            if (!Schema::hasColumn('stock_movements', 'destination_type')) {
                $table->string('destination_type')->nullable()->after('source_id');
            }
            if (!Schema::hasColumn('stock_movements', 'destination_id')) {
                $table->unsignedBigInteger('destination_id')->nullable()->after('destination_type');
            }
            if (!Schema::hasColumn('stock_movements', 'branch_id')) {
                $table->unsignedBigInteger('branch_id')->nullable()->after('destination_id');
            }
            if (!Schema::hasColumn('stock_movements', 'status')) {
                $table->string('status')->default('completed')->after('branch_id');
            }
            if (!Schema::hasColumn('stock_movements', 'ip_address')) {
                $table->string('ip_address')->nullable()->after('status');
            }
            if (!Schema::hasColumn('stock_movements', 'device_info')) {
                $table->text('device_info')->nullable()->after('ip_address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $columns = [
                'before_quantity',
                'after_quantity',
                'source_type',
                'source_id',
                'destination_type',
                'destination_id',
                'branch_id',
                'status',
                'ip_address',
                'device_info',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('stock_movements', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};