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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();

            // User who made the sale (cashier/pharmacist)
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // Customer who bought medicine
            $table->foreignId('customer_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete();

            // Date of sale
            $table->date('sale_date');

            // Total sale price
            $table->decimal('total_amount', 10, 2)
                  ->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
