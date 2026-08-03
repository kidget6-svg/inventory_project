<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // 1. Create Retail Products Table
        if (!Schema::hasTable('retail_products')) {
            Schema::create('retail_products', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('sku')->unique()->nullable();
                $table->string('category')->default('General');
                $table->decimal('price', 10, 2);
                $table->integer('quantity')->default(0);
                $table->timestamps();
            });
        }

        // 2. Add 'type' and 'status' updates to existing Sales Table
        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'type')) {
                $table->enum('type', ['prescription', 'retail'])->default('prescription')->after('user_id');
            }
            if (!Schema::hasColumn('sales', 'status')) {
                $table->string('status')->default('pending_cashier')->after('type');
            }
        });

        // 3. Add Polymorphic columns to existing Sale Items Table
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'itemable_type')) {
                $table->nullableMorphs('itemable'); // Adds itemable_type & itemable_id
            }
            if (!Schema::hasColumn('sale_items', 'subtotal')) {
                $table->decimal('subtotal', 10, 2)->after('unit_price')->default(0);
            }
        });
    }

    public function down(): void {
        Schema::dropIfExists('retail_products');
        
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['type', 'status']);
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropMorphs('itemable');
            $table->dropColumn('subtotal');
        });
    }
};