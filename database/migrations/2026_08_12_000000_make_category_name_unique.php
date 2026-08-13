<?php
// database/migrations/2026_08_12_000000_make_category_name_unique.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Remove existing index on name (if present) and add a unique constraint
            if (Schema::hasIndex('categories', 'categories_name_index')) {
                $table->dropIndex('categories_name_index');
            }

            if (! Schema::hasColumn('categories', 'name')) {
                $table->string('name')->unique();
            } else {
                $table->unique('name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Drop the unique constraint named categories_name_unique
            $table->dropUnique('categories_name_unique');
            $table->index('name');
        });
    }
};
