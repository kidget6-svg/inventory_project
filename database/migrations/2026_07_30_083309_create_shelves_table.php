<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('shelves');
        
        Schema::create('shelves', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('shelf_location')->unique();
            $table->text('description')->nullable();
            $table->integer('capacity')->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shelves');
    }
};