<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Add customer fields if missing
            if (!Schema::hasColumn('sales', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('receipt_number');
            }

            if (!Schema::hasColumn('sales', 'customer_phone')) {
                $table->string('customer_phone')->nullable()->after('customer_name');
            }

            if (!Schema::hasColumn('sales', 'customer_email')) {
                $table->string('customer_email')->nullable()->after('customer_phone');
            }

            if (!Schema::hasColumn('sales', 'created_by_pharmacist_at')) {
                $table->timestamp('created_by_pharmacist_at')->nullable();
            }

            if (!Schema::hasColumn('sales', 'completed_by_cashier_at')) {
                $table->timestamp('completed_by_cashier_at')->nullable();
            }

            if (!Schema::hasColumn('sales', 'notes')) {
                $table->text('notes')->nullable();
            }

            // customer_name and sale_date were already indexed by the original
            // sales-table migration, so do not create duplicate indexes here.
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Drop columns
            $table->dropColumn([
                'customer_name', 
                'customer_phone', 
                'customer_email',
                'created_by_pharmacist_at', 
                'completed_by_cashier_at', 
                'notes'
            ]);
            
            // Drop indexes - using try-catch
            try {
                $table->dropIndex('sales_customer_name_index');
            } catch (\Exception $e) {
                // Index doesn't exist, skip
            }

            try {
                $table->dropIndex('sales_sale_date_index');
            } catch (\Exception $e) {
                // Index doesn't exist, skip
            }
        });
    }
};
