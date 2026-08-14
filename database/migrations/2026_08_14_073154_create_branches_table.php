<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('location');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('manager_name')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->json('opening_hours')->nullable();
            $table->timestamps();
        });

        // Add branch_id to existing tables
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->after('role')
                      ->constrained()->nullOnDelete();
            }
        });

        Schema::table('medicines', function (Blueprint $table) {
            if (!Schema::hasColumn('medicines', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->after('shelf_id')
                      ->constrained()->nullOnDelete();
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->after('user_id')
                      ->constrained()->nullOnDelete();
            }
        });

        Schema::table('shelves', function (Blueprint $table) {
            if (!Schema::hasColumn('shelves', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->after('shelf_location')
                      ->constrained()->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'branch_id')) {
                $table->dropConstrainedForeignId('branch_id');
            }
        });

        Schema::table('medicines', function (Blueprint $table) {
            if (Schema::hasColumn('medicines', 'branch_id')) {
                $table->dropConstrainedForeignId('branch_id');
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'branch_id')) {
                $table->dropConstrainedForeignId('branch_id');
            }
        });

        Schema::table('shelves', function (Blueprint $table) {
            if (Schema::hasColumn('shelves', 'branch_id')) {
                $table->dropConstrainedForeignId('branch_id');
            }
        });

        Schema::dropIfExists('branches');
    }
};