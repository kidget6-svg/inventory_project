<?php
// database/migrations/2026_07_22_072013_create_sales_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sales');
        
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            
            // Sale details
            $table->date('sale_date');
            
            // Financial
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('net_amount', 10, 2)->default(0);
            
            // Customer
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            
            // Payment
            $table->string('payment_method')->default('cash');
            $table->string('payment_status')->default('paid');
            
            // Additional
            $table->text('notes')->nullable();
            $table->string('receipt_number')->nullable();
            
            // Relationships
            $table->unsignedBigInteger('user_id');
            
            // Status
            $table->string('status')->default('completed');
            
            $table->timestamps();
            
            // Indexes
            $table->index('sale_date');
            $table->index('customer_name');
            $table->index('status');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};