<?php
// database/migrations/2026_07_18_200054_create_stock_movements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('stock_movements');
        
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            
            // Relationships (without foreign key constraints)
            $table->unsignedBigInteger('medicine_id');
            $table->unsignedBigInteger('user_id')->nullable();
            
            // Movement details
            $table->enum('type', ['in', 'out', 'adjustment', 'return', 'damaged'])->default('in');
            $table->unsignedInteger('quantity');
            
            // Audit trail
            $table->unsignedInteger('before_quantity')->nullable();
            $table->unsignedInteger('after_quantity')->nullable();
            
            // Reference
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('medicine_id');
            $table->index('type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};