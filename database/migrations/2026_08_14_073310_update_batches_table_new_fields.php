<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            // Add new fields if missing
            if (!Schema::hasColumn('batches', 'manufacturer')) {
                $table->string('manufacturer')->nullable()->after('batch_number');
            }

            if (!Schema::hasColumn('batches', 'country_of_origin')) {
                $table->string('country_of_origin')->nullable()->after('manufacturer');
            }

            if (!Schema::hasColumn('batches', 'storage_conditions')) {
                $table->string('storage_conditions')->nullable()->after('country_of_origin');
            }

            if (!Schema::hasColumn('batches', 'minimum_stock')) {
                $table->integer('minimum_stock')->default(5)->after('quantity');
            }

            if (!Schema::hasColumn('batches', 'reorder_level')) {
                $table->integer('reorder_level')->default(10)->after('minimum_stock');
            }

            // Add foreign keys
            if (!Schema::hasColumn('batches', 'received_by')) {
                $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            }

            if (!Schema::hasColumn('batches', 'purchase_order_id')) {
                $table->foreignId('purchase_order_id')->nullable()->constrained()->nullOnDelete();
            }

            if (!Schema::hasColumn('batches', 'received_at')) {
                $table->timestamp('received_at')->nullable();
            }

            if (!Schema::hasColumn('batches', 'last_audited_at')) {
                $table->timestamp('last_audited_at')->nullable();
            }

            // Add status if not exists
            if (!Schema::hasColumn('batches', 'status')) {
                $table->enum('status', ['available', 'quarantined', 'recalled', 'expired', 'disposed'])
                      ->default('available')->after('quantity');
            }

            // Add indexes - using try-catch
            try {
                $table->index('status');
            } catch (\Exception $e) {}

            try {
                $table->index('received_at');
            } catch (\Exception $e) {}

            try {
                $table->index('expiry_date');
            } catch (\Exception $e) {}

            try {
                $table->index('batch_number');
            } catch (\Exception $e) {}
        });
    }

    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            // Drop columns
            $table->dropColumn([
                'manufacturer', 
                'country_of_origin', 
                'storage_conditions',
                'minimum_stock', 
                'reorder_level', 
                'status',
                'received_at', 
                'last_audited_at'
            ]);

            // Drop foreign keys
            if (Schema::hasColumn('batches', 'received_by')) {
                $table->dropConstrainedForeignId('received_by');
            }

            if (Schema::hasColumn('batches', 'purchase_order_id')) {
                $table->dropConstrainedForeignId('purchase_order_id');
            }

            // Drop indexes - using try-catch
            try {
                $table->dropIndex(['status']);
            } catch (\Exception $e) {}

            try {
                $table->dropIndex(['received_at']);
            } catch (\Exception $e) {}

            try {
                $table->dropIndex(['expiry_date']);
            } catch (\Exception $e) {}

            try {
                $table->dropIndex(['batch_number']);
            } catch (\Exception $e) {}
        });
    }
};