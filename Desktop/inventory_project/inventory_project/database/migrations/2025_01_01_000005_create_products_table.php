<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name_generic');
            $table->string('name_brand')->nullable();
            $table->string('strength')->nullable();
            $table->string('dosage_form')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('barcode')->nullable()->unique();
            $table->string('unit_of_measure')->nullable();
            $table->text('storage_conditions')->nullable();
            $table->string('category')->nullable();
            $table->integer('minimum_stock_level')->default(10);
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
