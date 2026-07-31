<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('role');
            $table->string('license_number')->nullable()->after('status');
            $table->string('qualification')->nullable()->after('license_number');
            $table->string('license_document')->nullable()->after('qualification');
            $table->string('qualification_document')->nullable()->after('license_document');
            $table->foreignId('approved_by')->nullable()->after('qualification_document');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });

        // Mark all existing users as approved so they can still log in
        DB::table('users')->update(['status' => 'approved']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'license_number',
                'qualification',
                'license_document',
                'qualification_document',
                'approved_by',
                'approved_at',
            ]);
        });
    }
};
