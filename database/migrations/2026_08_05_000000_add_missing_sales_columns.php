<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'discount')) {
                $table->decimal('discount', 10, 2)->default(0);
            }

            if (!Schema::hasColumn('sales', 'tax')) {
                $table->decimal('tax', 10, 2)->default(0);
            }

            if (!Schema::hasColumn('sales', 'net_amount')) {
                $table->decimal('net_amount', 10, 2)->default(0);
            }

            if (!Schema::hasColumn('sales', 'customer_name')) {
                $table->string('customer_name')->nullable();
            }

            if (!Schema::hasColumn('sales', 'customer_phone')) {
                $table->string('customer_phone')->nullable();
            }

            if (!Schema::hasColumn('sales', 'customer_email')) {
                $table->string('customer_email')->nullable();
            }

            if (!Schema::hasColumn('sales', 'payment_method')) {
                $table->string('payment_method')->default('cash');
            }

            if (!Schema::hasColumn('sales', 'payment_status')) {
                $table->string('payment_status')->default('paid');
            }

            if (!Schema::hasColumn('sales', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->default(0);
            }

            if (!Schema::hasColumn('sales', 'change_amount')) {
                $table->decimal('change_amount', 10, 2)->default(0);
            }

            if (!Schema::hasColumn('sales', 'notes')) {
                $table->text('notes')->nullable();
            }

            if (!Schema::hasColumn('sales', 'receipt_number')) {
                $table->string('receipt_number')->nullable();
            }

            if (!Schema::hasColumn('sales', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable();
            }

            if (!Schema::hasColumn('sales', 'status')) {
                $table->string('status')->default('completed');
            }

            if (!Schema::hasColumn('sales', 'type')) {
                $table->string('type')->default('prescription');
            }

            if (!Schema::hasColumn('sales', 'status')) {
                $table->index('status');
            }

            if (!Schema::hasColumn('sales', 'user_id')) {
                $table->index('user_id');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('sales')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'discount')) {
                $table->dropColumn('discount');
            }

            if (Schema::hasColumn('sales', 'tax')) {
                $table->dropColumn('tax');
            }

            if (Schema::hasColumn('sales', 'net_amount')) {
                $table->dropColumn('net_amount');
            }

            if (Schema::hasColumn('sales', 'customer_name')) {
                $table->dropColumn('customer_name');
            }

            if (Schema::hasColumn('sales', 'customer_phone')) {
                $table->dropColumn('customer_phone');
            }

            if (Schema::hasColumn('sales', 'customer_email')) {
                $table->dropColumn('customer_email');
            }

            if (Schema::hasColumn('sales', 'payment_method')) {
                $table->dropColumn('payment_method');
            }

            if (Schema::hasColumn('sales', 'payment_status')) {
                $table->dropColumn('payment_status');
            }

            if (Schema::hasColumn('sales', 'amount_paid')) {
                $table->dropColumn('amount_paid');
            }

            if (Schema::hasColumn('sales', 'change_amount')) {
                $table->dropColumn('change_amount');
            }

            if (Schema::hasColumn('sales', 'notes')) {
                $table->dropColumn('notes');
            }

            if (Schema::hasColumn('sales', 'receipt_number')) {
                $table->dropColumn('receipt_number');
            }

            if (Schema::hasColumn('sales', 'user_id')) {
                $table->dropColumn('user_id');
            }

            if (Schema::hasColumn('sales', 'status')) {
                $table->dropColumn('status');
            }

            if (Schema::hasColumn('sales', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
