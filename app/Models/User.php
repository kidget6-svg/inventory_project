<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'role',
        'status',
        'license_number',
        'license_expiry_date',
        'professional_registration_number',
        'university',
        'degree',
        'years_of_experience',
        'national_id',
        'license_document',
        'qualification_document',
        'pharmacy_license',
        'degree_certificate',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'license_expiry_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Check if the user account is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if the user account is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool
    {
//         User::create([
//     'name' => 'Admin',
//     'email' => 'admin@pharmacy.com',
//     'password' => Hash::make('password'),
//     'role' => 'admin',
// ]);
        return $this->role === 'admin';
    }

    public function isPharmacist(): bool
    {
        return $this->role === 'pharmacist';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }
}
