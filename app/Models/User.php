<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Role Constants
    public const ROLE_ADMIN            = 'admin';
    public const ROLE_PHARMACIST       = 'pharmacist';
    public const ROLE_CASHIER          = 'cashier';
    public const ROLE_PURCHASING_STAFF = 'purchasing_staff';

    // Status Constants
    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    // All system roles
    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_PHARMACIST,
        self::ROLE_CASHIER,
        self::ROLE_PURCHASING_STAFF,
    ];

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
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
        return $this->role === self::ROLE_ADMIN;
    }

    public function isPharmacist(): bool
    {
        return $this->role === self::ROLE_PHARMACIST;
    }

    public function isCashier(): bool
    {
        return $this->role === self::ROLE_CASHIER;
    }

    public function isPurchasingStaff(): bool
    {
        return $this->role === self::ROLE_PURCHASING_STAFF;
    }

    /**
     * Get all permissions for the user's role.
     */
    public function getAllPermissions(): array
    {
        if ($this->role === self::ROLE_ADMIN) {
            return array_keys(config('permissions.labels', []));
        }

        return config('permissions.permissions.' . $this->role, []);
    }

    /**
     * Check if the user has a specific permission.
     *
     * @param  string  $permission  Dot-notation permission string
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->role === self::ROLE_ADMIN) {
            return true;
        }

        $permissions = config('permissions.permissions.' . $this->role, []);

        if (in_array('*', $permissions, true)) {
            return true;
        }

        return in_array($permission, $permissions, true);
    }

    /**
     * Check if the user has ANY of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the user has ALL of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (! $this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }
}
