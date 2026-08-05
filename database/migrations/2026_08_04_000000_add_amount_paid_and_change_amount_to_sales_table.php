<?php
// database/migrations/2026_08_04_000000_add_amount_paid_and_change_amount_to_sales_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // payment_method — already present in the original create_sales_table
            // migration, but we guard with hasColumn so this migration is idempotent
            // and safe to run on any database state.
            if (!Schema::hasColumn('sales', 'payment_method')) {
                $table->string('payment_method')->default('cash')->after('customer_email');
            }

            if (!Schema::hasColumn('sales', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->default(0)->after('payment_method');
            }

            if (!Schema::hasColumn('sales', 'change_amount')) {
                $table->decimal('change_amount', 10, 2)->default(0)->after('amount_paid');
            }

            // receipt_number — already present in the original create_sales_table
            // migration, but we guard with hasColumn for idempotency.
            if (!Schema::hasColumn('sales', 'receipt_number')) {
                $table->string('receipt_number')->nullable()->after('change_amount');
            }
        });

        // Ensure receipt_number is unique at the database level.
        // The automatic generator (Sale::generateReceiptNumber) produces
        // values in the format RCPT-YYYYMMDD-XXXXX, e.g. RCPT-20260805-00001.
        if (!Schema::hasIndex('sales', 'receipt_number')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->unique('receipt_number');
            });
        }
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropUnique(['receipt_number']);
            $table->dropColumn(['payment_method', 'amount_paid', 'change_amount', 'receipt_number']);
        });
    }
};
