<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            if (!Schema::hasColumn('retail_products', 'barcode')) {
                $table->string('barcode', 100)->nullable()->unique()->after('sku');
            }
            if (!Schema::hasColumn('retail_products', 'supplier_id')) {
                $table->unsignedBigInteger('supplier_id')->nullable()->after('category');
            }
            if (!Schema::hasColumn('retail_products', 'expiry_date')) {
                $table->date('expiry_date')->nullable()->after('quantity');
            }
            if (!Schema::hasColumn('retail_products', 'status')) {
                $table->string('status')->default('active')->after('expiry_date');
            }
            if (!Schema::hasColumn('retail_products', 'description')) {
                $table->text('description')->nullable()->after('status');
            }
            if (!Schema::hasColumn('retail_products', 'manufacturer')) {
                $table->string('manufacturer')->nullable()->after('description');
            }
            if (!Schema::hasColumn('retail_products', 'shelf_location')) {
                $table->string('shelf_location', 50)->nullable()->after('manufacturer');
            }
            if (!Schema::hasColumn('retail_products', 'image')) {
                $table->string('image')->nullable()->after('shelf_location');
            }
            if (!Schema::hasColumn('retail_products', 'purchase_price')) {
                $table->decimal('purchase_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('retail_products', 'reorder_level')) {
                $table->unsignedInteger('reorder_level')->default(10)->after('purchase_price');
            }

            if (Schema::hasColumn('retail_products', 'supplier_id')) {
                $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn([
                'barcode',
                'supplier_id',
                'expiry_date',
                'status',
                'description',
                'manufacturer',
                'shelf_location',
                'image',
                'purchase_price',
                'reorder_level',
            ]);
        });
    }
};
