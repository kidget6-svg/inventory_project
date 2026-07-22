<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();           // e.g., 'create_sale', 'manage_inventory', 'view_reports'
            $table->string('display_name');             // e.g., 'Create Sale', 'Manage Inventory', 'View Reports'
            $table->string('description')->nullable();  // Brief explanation of the permission
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
