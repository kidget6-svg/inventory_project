<?php
// database/migrations/2026_07_22_072615_create_sale_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sale_items');

        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->unsignedBigInteger('sale_id');
            // medicine_id is nullable: retail product sales use the polymorphic
            // itemable relationship (RetailProduct) and do not reference a medicine.
            $table->unsignedBigInteger('medicine_id')->nullable();

            // Item details
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);

            // Optional discount per item
            $table->decimal('discount', 10, 2)->default(0);

            $table->timestamps();

            // Indexes
            $table->index(['sale_id', 'medicine_id']);
            $table->index('sale_id');
            $table->index('medicine_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
