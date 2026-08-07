<?php
// database/migrations/2026_07_18_173812_create_medicines_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('medicines');

        Schema::create('medicines', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('batch_number')->nullable();
            $table->string('barcode', 100)->nullable()->unique();

            // Images & Media
            $table->string('image')->nullable();

            // Location & Organization
            $table->string('shelf_location', 50)->nullable();
            $table->text('description')->nullable();
            $table->string('manufacturer')->nullable();

            // Relationships (without foreign key constraints initially)
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('supplier_id')->nullable();

            // Stock & Pricing
            $table->unsignedInteger('quantity')->default(0);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->unsignedInteger('reorder_level')->default(10);

            // Dates & Status
            $table->date('expiry_date')->nullable();
            $table->string('status')->default('active');

            $table->timestamps();

            // Indexes
            $table->index('name');
            $table->index('barcode');
            $table->index('category_id');
            $table->index('supplier_id');
            $table->index('status');
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
