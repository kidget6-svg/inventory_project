<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            if (!Schema::hasColumn('retail_products', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->after('supplier_id')->constrained('branches')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            if (Schema::hasColumn('retail_products', 'branch_id')) {
                $table->dropConstrainedForeignId('branch_id');
            }
        });
    }
};
