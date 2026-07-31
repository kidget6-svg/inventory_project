<?php
// database/migrations/2026_07_19_110629_create_suppliers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('suppliers');
        
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('tax_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('name');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};