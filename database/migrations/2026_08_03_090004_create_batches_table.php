<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('batches')) {
            return;
        }

        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medicine_id')->nullable()->index();
            $table->unsignedBigInteger('product_id')->nullable()->index();
            $table->string('batch_number')->nullable();
            $table->integer('quantity')->default(0);
            $table->date('expiry_date')->nullable();
            $table->date('received_date')->nullable();
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->unsignedBigInteger('supplier_id')->nullable()->index();
            $table->timestamps();

            $table->foreign('medicine_id')->references('id')->on('medicines')->onDelete('cascade');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
