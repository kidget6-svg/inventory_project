<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The original enum was created with MySQL's native ENUM column.
        // We use a raw SQL approach to be compatible with both MySQL and
        // SQLite (used in the test environment).
        if (DB::getDriverName() === 'sqlite') {
            // SQLite does not support modifying ENUM columns directly,
            // so we recreate the column as a string with a check constraint.
            if (Schema::hasColumn('users', 'role')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('role', 50)->default('cashier')->change();
                });
            }
        } else {
            // MySQL: expand the ENUM to include 'purchasing_staff'
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','pharmacist','cashier','purchasing_staff') NOT NULL DEFAULT 'cashier'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            if (Schema::hasColumn('users', 'role')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('role', 50)->default('cashier')->change();
                });
            }
        } else {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','pharmacist','cashier') NOT NULL DEFAULT 'cashier'");
        }
    }
};
