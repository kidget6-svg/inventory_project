<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shelves', function (Blueprint $table) {
            // First, check if old columns exist and drop them
            if (Schema::hasColumn('shelves', 'shelf_code')) {
                $table->dropColumn('shelf_code');
            }
            
            if (Schema::hasColumn('shelves', 'location')) {
                $table->dropColumn('location');
            }
        });

        // Now add the correct columns if they don't exist
        Schema::table('shelves', function (Blueprint $table) {
            if (!Schema::hasColumn('shelves', 'shelf_location')) {
                $table->string('shelf_location')->unique()->after('id');
            }
            
            if (!Schema::hasColumn('shelves', 'name')) {
                $table->string('name')->after('shelf_location');
            }
            
            if (!Schema::hasColumn('shelves', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            
            if (!Schema::hasColumn('shelves', 'capacity')) {
                $table->integer('capacity')->default(100)->after('description');
            }
        });
    }

    public function down(): void
    {
        // Rollback logic
        Schema::table('shelves', function (Blueprint $table) {
            if (Schema::hasColumn('shelves', 'shelf_location')) {
                $table->dropColumn('shelf_location');
            }
            
            if (Schema::hasColumn('shelves', 'name')) {
                $table->dropColumn('name');
            }
            
            if (Schema::hasColumn('shelves', 'description')) {
                $table->dropColumn('description');
            }
            
            if (Schema::hasColumn('shelves', 'capacity')) {
                $table->dropColumn('capacity');
            }
        });

        // Re-add old columns
        Schema::table('shelves', function (Blueprint $table) {
            if (!Schema::hasColumn('shelves', 'shelf_code')) {
                $table->string('shelf_code')->nullable();
            }
            
            if (!Schema::hasColumn('shelves', 'location')) {
                $table->string('location')->nullable();
            }
        });
    }
};