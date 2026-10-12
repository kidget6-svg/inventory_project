<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('shelves', 'status')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->string('status')->default('active')->after('current_quantity');
            });
            \Illuminate\Support\Facades\DB::statement("UPDATE shelves SET status = 'active' WHERE status IS NULL OR status = ''");
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('shelves', 'status')) {
            Schema::table('shelves', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
