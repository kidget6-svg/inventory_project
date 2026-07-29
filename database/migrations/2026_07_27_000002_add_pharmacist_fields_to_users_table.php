<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('license_expiry_date')->nullable()->after('license_number');
            $table->string('professional_registration_number')->nullable()->after('license_expiry_date');
            $table->string('university')->nullable()->after('professional_registration_number');
            $table->string('degree')->nullable()->after('university');
            $table->integer('years_of_experience')->nullable()->after('degree');
            $table->string('national_id')->nullable()->after('years_of_experience');
            $table->string('pharmacy_license')->nullable()->after('national_id');
            $table->string('degree_certificate')->nullable()->after('pharmacy_license');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'license_expiry_date',
                'professional_registration_number',
                'university',
                'degree',
                'years_of_experience',
                'national_id',
                'pharmacy_license',
                'degree_certificate',
            ]);
        });
    }
};
