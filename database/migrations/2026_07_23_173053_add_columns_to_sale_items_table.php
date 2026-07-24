<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {

            $table->foreignId('sale_id')
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('medicine_id')
                ->after('sale_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->integer('quantity')
                ->after('medicine_id');

            $table->decimal('unit_price',10,2)
                ->after('quantity');

            $table->decimal('subtotal',10,2)
                ->after('unit_price');

        });
    }


    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {

            $table->dropForeign(['sale_id']);
            $table->dropForeign(['medicine_id']);

            $table->dropColumn([
                'sale_id',
                'medicine_id',
                'quantity',
                'unit_price',
                'subtotal'
            ]);

        });
    }
};