<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /** Status constants */
    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'role',
        'status',
        'gender',
        'date_of_birth',
        'address',
        'profile_photo',
        'license_number',
        'license_expiry_date',
        'professional_registration_number',
        'university',
        'degree',
        'years_of_experience',
        'national_id',
        'pharmacy_license',
        'degree_certificate',
        'qualification',
        'license_document',
        'qualification_document',
        'approved_by',
        'approved_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'approved_at'       => 'datetime',
        ];
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

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /*
      The admin who approved this user.
     */

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
