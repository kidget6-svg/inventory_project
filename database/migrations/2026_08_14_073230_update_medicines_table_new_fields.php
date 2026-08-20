<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            // Add new fields if missing
            if (!Schema::hasColumn('medicines', 'dosage_form')) {
                $table->string('dosage_form')->nullable()->after('generic_name');
            }

            if (!Schema::hasColumn('medicines', 'strength')) {
                $table->string('strength')->nullable()->after('dosage_form');
            }

            if (!Schema::hasColumn('medicines', 'unit')) {
                $table->string('unit')->nullable()->after('strength');
            }

            if (!Schema::hasColumn('medicines', 'serial_number')) {
                $table->string('serial_number')->nullable()->unique()->after('batch_number');
            }

            if (!Schema::hasColumn('medicines', 'minimum_stock')) {
                $table->integer('minimum_stock')->default(10)->after('quantity');
            }

            if (!Schema::hasColumn('medicines', 'maximum_stock')) {
                $table->integer('maximum_stock')->nullable()->after('minimum_stock');
            }

            if (!Schema::hasColumn('medicines', 'manufactured_date')) {
                $table->date('manufactured_date')->nullable()->after('expiry_date');
            }

            if (!Schema::hasColumn('medicines', 'received_date')) {
                $table->date('received_date')->nullable()->after('manufactured_date');
            }

            if (!Schema::hasColumn('medicines', 'stock_status')) {
                $table->enum('stock_status', ['in_stock', 'low_stock', 'out_of_stock', 'expired'])
                      ->default('in_stock')->after('status');
            }

            if (!Schema::hasColumn('medicines', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                      ->default('pending')->after('stock_status');
            }

            // Rename description to prescription
            if (Schema::hasColumn('medicines', 'description') && !Schema::hasColumn('medicines', 'prescription')) {
                $table->renameColumn('description', 'prescription');
            }

            // Add indexes - using try-catch
            try {
                $table->index('stock_status');
            } catch (\Exception $e) {}

            try {
                $table->index('approval_status');
            } catch (\Exception $e) {}

            try {
                $table->index('serial_number');
            } catch (\Exception $e) {}
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            // Drop columns
            $table->dropColumn([
                'dosage_form', 
                'strength', 
                'unit', 
                'serial_number',
                'minimum_stock', 
                'maximum_stock', 
                'manufactured_date',
                'received_date', 
                'stock_status', 
                'approval_status'
            ]);

            // Rename back
            if (Schema::hasColumn('medicines', 'prescription') && !Schema::hasColumn('medicines', 'description')) {
                $table->renameColumn('prescription', 'description');
            }

            // Drop indexes - using try-catch
            try {
                $table->dropIndex(['stock_status']);
            } catch (\Exception $e) {}

            try {
                $table->dropIndex(['approval_status']);
            } catch (\Exception $e) {}

            try {
                $table->dropIndex(['serial_number']);
            } catch (\Exception $e) {}
        });
    }
};