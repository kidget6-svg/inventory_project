<?php
// database/migrations/2026_08_15_000001_add_prescription_details_to_medicines_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a nullable prescription_details column to the medicines table.
     *
     * Prescription details are only needed when a medicine requires a
     * prescription, so the column is nullable by default.
     */
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            if (! Schema::hasColumn('medicines', 'prescription_details')) {
                $table->text('prescription_details')->nullable()->after('prescription');
            }
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            if (Schema::hasColumn('medicines', 'prescription_details')) {
                $table->dropColumn('prescription_details');
            }
        });
    }
};
